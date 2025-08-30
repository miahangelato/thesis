"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface BloodGroupResult {
  success: boolean;
  results: Array<{
    finger: string;
    image_name: string;
    predicted_blood_group: string;
    confidence: number;
    all_probabilities: Record<string, number>;
  }>;
  predicted_blood_group: string;
}

interface DiabetesResult {
  success: boolean;
  diabetes_risk: string;
  confidence: number;
  model_used: string;
  prediction_details: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    blood_type: string;
    fingerprint_count: number;
  };
  saved: boolean;
  consent_given: boolean;
}

interface ConsentContextType {
  hasConsent: boolean;
  setHasConsent: (consent: boolean) => void;
  participantData: any;
  setParticipantData: (data: any) => void;
  bloodGroupResult: BloodGroupResult | null;
  setBloodGroupResult: (result: BloodGroupResult | null) => void;
  diabetesResult: DiabetesResult | null;
  setDiabetesResult: (result: DiabetesResult | null) => void;
  clearAll: () => void;
  navigateToResultsWithData: (diabetesResult: DiabetesResult, bloodGroupResult: BloodGroupResult, participantData: any) => void;
  storeFormData: (formData: any) => void;
  retrieveFormData: () => any;
  clearFormData: () => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

// Generate a unique session ID
const generateSessionId = (): string => {
  return 'session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// Secure storage key
const STORAGE_KEY = 'health_results_data';
const STORAGE_EXPIRY_KEY = 'health_results_expiry';

// Store data securely with multiple fallbacks
const storeSecureData = (sessionId: string, data: any) => {
  if (typeof window !== 'undefined') {
    const dataWithExpiry = {
      data,
      expiry: Date.now() + (2 * 60 * 60 * 1000), // 2 hours expiry
      sessionId
    };
    
    try {
      const dataString = JSON.stringify(dataWithExpiry);
      const encodedData = btoa(dataString);
      
      // Store in sessionStorage with session ID
      sessionStorage.setItem(sessionId, encodedData);
      
      // Also store in sessionStorage with a fixed key as backup
      sessionStorage.setItem(STORAGE_KEY, encodedData);
      sessionStorage.setItem(STORAGE_EXPIRY_KEY, dataWithExpiry.expiry.toString());
      
      console.log('Data stored successfully in session storage');
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }
};

// Retrieve data with multiple fallback sources
const retrieveSecureData = (sessionId?: string) => {
  if (typeof window !== 'undefined') {
    try {
      let encodedData = null;
      
      // Try to get data from session ID first
      if (sessionId) {
        encodedData = sessionStorage.getItem(sessionId);
      }
      
      // Fallback to fixed key if session ID fails
      if (!encodedData) {
        encodedData = sessionStorage.getItem(STORAGE_KEY);
      }
      
      if (encodedData) {
        const dataString = atob(encodedData);
        const dataWithExpiry = JSON.parse(dataString);
        
        // Check if data has expired
        if (Date.now() > dataWithExpiry.expiry) {
          clearStoredData();
          return null;
        }
        
        console.log('Data retrieved successfully from storage');
        return dataWithExpiry.data;
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
      clearStoredData();
    }
  }
  return null;
};

// Clear all stored data
const clearStoredData = () => {
  if (typeof window !== 'undefined') {
    // Clear all session storage items that start with 'session_'
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('session_') || key === STORAGE_KEY || key === STORAGE_EXPIRY_KEY) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

// Clean up expired sessions from sessionStorage
const cleanupExpiredSessions = () => {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('session_')) {
        const encodedData = sessionStorage.getItem(key);
        if (encodedData) {
          try {
            const dataString = atob(encodedData);
            const dataWithExpiry = JSON.parse(dataString);
            
            // Remove expired sessions
            if (Date.now() > dataWithExpiry.expiry) {
              sessionStorage.removeItem(key);
            }
          } catch (error) {
            // Remove corrupted data
            sessionStorage.removeItem(key);
          }
        }
      }
    });
  }
};

export const ConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [participantData, setParticipantData] = useState<any>(null);
  const [bloodGroupResult, setBloodGroupResult] = useState<BloodGroupResult | null>(null);
  const [diabetesResult, setDiabetesResult] = useState<DiabetesResult | null>(null);

  // Store form data for persistence
  const storeFormData = (formData: any) => {
    if (typeof window !== 'undefined') {
      const formDataWithExpiry = {
        data: formData,
        expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours for form data
      };
      try {
        const encodedData = btoa(JSON.stringify(formDataWithExpiry));
        sessionStorage.setItem('form_data_backup', encodedData);
      } catch (error) {
        console.error('Error storing form data:', error);
      }
    }
  };

  // Retrieve form data
  const retrieveFormData = () => {
    if (typeof window !== 'undefined') {
      try {
        const encodedData = sessionStorage.getItem('form_data_backup');
        if (encodedData) {
          const dataString = atob(encodedData);
          const dataWithExpiry = JSON.parse(dataString);
          
          if (Date.now() < dataWithExpiry.expiry) {
            return dataWithExpiry.data;
          } else {
            sessionStorage.removeItem('form_data_backup');
          }
        }
      } catch (error) {
        console.error('Error retrieving form data:', error);
      }
    }
    return null;
  };

  // Clear form data
  const clearFormData = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('form_data_backup');
    }
  };

  // Clean up expired sessions and load data from sessionStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clean up expired sessions first
      cleanupExpiredSessions();
      
      // Try to load from URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const sessionIdFromUrl = urlParams.get('sid') || urlParams.get('s');
      
      // Try to load from stored session ID if no URL parameter
      const storedSessionId = sessionStorage.getItem('current_session_id');
      const sessionId = sessionIdFromUrl || storedSessionId;
      
      if (sessionId) {
        const storedData = retrieveSecureData(sessionId);
        if (storedData) {
          setDiabetesResult(storedData.diabetesResult);
          setBloodGroupResult(storedData.bloodGroupResult);
          setParticipantData(storedData.participantData);
          
          // Store the session ID for future use
          sessionStorage.setItem('current_session_id', sessionId);
          
          // Clean the URL immediately after loading data
          window.history.replaceState({}, '', window.location.pathname);
          console.log('Data loaded successfully from session storage');
        } else {
          // If data is expired or invalid, clean the URL and session
          window.history.replaceState({}, '', window.location.pathname);
          sessionStorage.removeItem('current_session_id');
        }
      }
    }
  }, []);

  const navigateToResultsWithData = (diabetesResult: DiabetesResult, bloodGroupResult: BloodGroupResult, participantData: any) => {
    // Generate a unique session ID
    const sessionId = generateSessionId();
    
    // Store data securely in sessionStorage
    const dataToStore = {
      diabetesResult,
      bloodGroupResult,
      participantData
    };
    
    storeSecureData(sessionId, dataToStore);
    
    // Store the session ID for persistence
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('current_session_id', sessionId);
    }
    
    // Set the state data
    setDiabetesResult(diabetesResult);
    setBloodGroupResult(bloodGroupResult);
    setParticipantData(participantData);
    
    // Navigate with only the session ID in the URL
    window.location.href = `/result?s=${sessionId}`;
  };

  const clearAll = () => {
    setHasConsent(false);
    setParticipantData(null);
    setBloodGroupResult(null);
    setDiabetesResult(null);
    
    // Clear all session data including form data
    clearStoredData();
    clearFormData();
    
    // Clear current session ID
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('current_session_id');
    }
  };

  return (
    <ConsentContext.Provider value={{
      hasConsent,
      setHasConsent,
      participantData,
      setParticipantData,
      bloodGroupResult,
      setBloodGroupResult,
      diabetesResult,
      setDiabetesResult,
      clearAll,
      navigateToResultsWithData,
      storeFormData,
      retrieveFormData,
      clearFormData
    }}>
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};
