"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import EndButton from "../../components/Endbutton";
import { useConsent } from "../../contexts/ConsentContext";
import QRCodeComponent from "../../components/QRCodeComponent";
import React from 'react';
import CryptoJS from "crypto-js";

interface DiabetesResult {
  success?: boolean;
  diabetes_risk?: string;
  confidence?: number;
  saved?: boolean;
  participant_id?: number;
  result_id?: number;
  features_used?: string[];
  prediction_details?: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    blood_type: string;
    fingerprint_count: number;
  };
  participant_data?: any;
  fingerprints?: any[];
}

interface BloodGroupResult {
  success?: boolean;
  results?: Array<{
    finger: string;
    image_name: string;
    predicted_blood_group: string;
    confidence: number;
    all_probabilities: Record<string, number>;
  }>;
  predicted_blood_group?: string;
  blood_group?: string;
  confidence?: number;
  saved?: boolean;
  participant_id?: number;
  result_id?: number;
  features_used?: string[];
  prediction_details?: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    blood_type: string;
    fingerprint_count: number;
  };
  participant_data?: any;
  fingerprints?: any[];
}

export default function ResultPage() {
  const { diabetesResult, bloodGroupResult: contextBloodGroupResult, participantData: contextParticipantData } = useConsent();
  const [result, setResult] = useState<DiabetesResult | null>(null);
  const [bloodGroupResult, setBloodGroupResult] = useState<BloodGroupResult | null>(null);
  const [participantData, setParticipantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let sessionId: string | null = null;
    
    // First check if data is available from sessionStorage via session ID
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      sessionId = urlParams.get('sid') || urlParams.get('s');
      
      // Also try to get from stored session ID if no URL parameter
      if (!sessionId) {
        sessionId = sessionStorage.getItem('current_session_id');
      }
      
      if (sessionId) {
        try {
          // Try the new enhanced storage system first
          let encodedData = sessionStorage.getItem(sessionId);
          
          // Fallback to the fixed key storage
          if (!encodedData) {
            encodedData = sessionStorage.getItem('health_results_data');
          }
          
          if (encodedData) {
            const dataString = atob(encodedData); // Base64 decoding
            const dataWithExpiry = JSON.parse(dataString);
            
            // Check if data has expired
            if (Date.now() > dataWithExpiry.expiry) {
              sessionStorage.removeItem(sessionId);
              sessionStorage.removeItem('health_results_data');
              sessionStorage.removeItem('current_session_id');
              setLoading(false);
              // Clean the URL
              window.history.replaceState({}, '', '/result');
              return;
            }
            
            const decodedData = dataWithExpiry.data;
            setResult(decodedData.diabetesResult);
            setBloodGroupResult(decodedData.bloodGroupResult);
            setParticipantData(decodedData.participantData);
            setLoading(false);
            
            // Clean the URL after loading data successfully
            window.history.replaceState({}, '', '/result');
            console.log('Results loaded successfully from session storage');
            return;
          }
        } catch (error) {
          console.error('Error parsing session data:', error);
          // Clean the URL on error
          window.history.replaceState({}, '', '/result');
          sessionStorage.removeItem('current_session_id');
        }
      }
    }

    // Fallback to context data
    if (diabetesResult && contextBloodGroupResult) {
      setResult(diabetesResult);
      setBloodGroupResult(contextBloodGroupResult);
      setParticipantData(contextParticipantData);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [diabetesResult, contextBloodGroupResult, contextParticipantData]);

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'diabetic':
      case 'high':
      case 'at risk':
        return 'text-red-600 bg-red-100';
      case 'healthy':
      case 'low':
      case 'not at risk':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="text-center">Loading result...</div>
      </div>
    );
  }

  if (!result || !bloodGroupResult || !participantData) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-xl font-bold mb-4">Results</h1>
        <div className="text-gray-500">No result found. Please submit your data first.</div>
        <button 
          onClick={() => window.location.href = '/fingerprint_analysis?consent=true'}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go Back to Analysis
        </button>
      </div>
    );
  }

  const highestConfidenceResult = bloodGroupResult?.results?.reduce((best: any, current: any) => {
    return current.confidence > (best?.confidence || 0) ? current : best;
  }, null);

  const predictedBloodGroup = highestConfidenceResult?.predicted_blood_group;
  const bloodGroupConfidence = highestConfidenceResult?.confidence;

  const qrData = `HEALTH SCREENING RESULTS

PARTICIPANT INFO:
• Age: ${participantData.age}
• Gender: ${participantData.gender}
• Blood Type: ${participantData.blood_type}
• Weight: ${participantData.weight || 'N/A'} kg
• Height: ${participantData.height || 'N/A'} cm

DIABETES RISK ASSESSMENT:
• Risk Level: ${result.diabetes_risk}
• Confidence: ${result.confidence ? (result.confidence * 100).toFixed(1) + '%' : 'N/A'}

BLOOD GROUP PREDICTION:
• Predicted Group: ${predictedBloodGroup || 'N/A'}
• Confidence: ${bloodGroupConfidence ? (bloodGroupConfidence * 100).toFixed(1) + '%' : 'N/A'}

WILLING TO DONATE: ${participantData.willing_to_donate ? 'Yes' : 'No'}

Generated: ${new Date().toLocaleDateString()}

This QR code contains your complete health screening results.`;

  // Encryption utility functions
  const encryptData = (data: string, secretKey: string): string => {
    return CryptoJS.AES.encrypt(data, secretKey).toString();
  };

  const decryptData = (ciphertext: string, secretKey: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  // Encrypt QR data for security
  const secretKey = "my-secret-key";
  const encryptedQRData = encryptData(qrData, secretKey);
  console.log("QR Data encrypted for security");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Results</h1>

      <QRCodeComponent data={qrData} />

      {/* Main Result Card */}
      <div className="bg-white border rounded-lg shadow-lg p-6 mb-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-3">Assessment Result</h2>
          
          {result.diabetes_risk ? (
            <div className={`inline-block px-6 py-3 rounded-lg font-bold text-lg ${getRiskColor(result.diabetes_risk)}`}>
              {result.diabetes_risk.toUpperCase()}
            </div>
          ) : (
            <div className="text-gray-500">No risk assessment available</div>
          )}
          
          {result.confidence && (
            <div className="mt-3 text-sm text-gray-600">
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </div>
          )}

          {predictedBloodGroup ? (
            <div className="mt-3 text-sm text-gray-600">
              Blood Group: {predictedBloodGroup}
            </div>
          ) : (
            <div className="mt-3 text-sm text-gray-600">
              Blood Group: Unknown
            </div>
          )}

          {bloodGroupConfidence ? (
            <div className="mt-3 text-sm text-gray-600">
              Confidence: {(bloodGroupConfidence * 100).toFixed(1)}%
            </div>
          ) : (
            <div className="mt-3 text-sm text-gray-600">
              Confidence: Unknown
            </div>
          )}
        </div>
      </div>

      {/* Participant Details */}
      {(result.prediction_details || result.participant_data) && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Participant Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>Age: {result.prediction_details?.age || result.participant_data?.age}</div>
            <div>Gender: {result.prediction_details?.gender || result.participant_data?.gender}</div>
            <div>Height: {result.prediction_details?.height || result.participant_data?.height} cm</div>
            <div>Weight: {result.prediction_details?.weight || result.participant_data?.weight} kg</div>
            <div>Blood Type: {result.prediction_details?.blood_type || result.participant_data?.blood_type}</div>
            <div>Fingerprints: {result.prediction_details?.fingerprint_count || result.fingerprints?.length || 0}</div>
          </div>
        </div>
      )}

      {/* Data Storage Status */}
      <div className="bg-gray-50 border rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Data Storage</h3>
        <div className="text-sm">
          {result.saved ? (
            <div className="text-green-600">
              ✓ Your data has been saved securely (Participant ID: {result.participant_id})
              {result.result_id && `, Result ID: ${result.result_id}`}
            </div>
          ) : (
            <div className="text-blue-600">
              ℹ Your data was analyzed but not stored for privacy protection
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 justify-center">
        {/* Risk-based redirect buttons */}
        {result.diabetes_risk && (
          <div className="text-center">
            {result.diabetes_risk.toLowerCase() === 'diabetic' || 
             result.diabetes_risk.toLowerCase() === 'high' || 
             result.diabetes_risk.toLowerCase() === 'at risk' ? (
              <button 
                onClick={() => window.location.href = '/hospitals'}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold text-lg mb-2"
              >
                Find Nearby Hospitals
              </button>
            ) : (
              // Person is healthy - check if willing to donate
              participantData?.willing_to_donate === true ? (
                <button 
                  onClick={() => window.location.href = '/blood-donation-centers'}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold text-lg mb-2"
                >
                  Find Blood Donation Centers
                </button>
              ) : participantData?.willing_to_donate === false ? (
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg mb-2">
                  <div className="mb-2">You are healthy! Consider blood donation to help save lives.</div>
                  <button 
                    onClick={() => window.location.href = '/blood-donation-centers'}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    View Blood Donation Centers
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg mb-2">
                  You are healthy! Please indicate if you're willing to donate blood.
                </div>
              )
            )}
          </div>
        )}
        
        {/* Debug participant data */}
        {process.env.NODE_ENV === 'development' && participantData && (
          <div className="text-xs text-gray-500">
            Debug: willing_to_donate = {String(participantData.willing_to_donate)}
          </div>
        )}
        
        {/* Standard action buttons */}
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => window.location.href = '/fingerprint_analysis?consent=true'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            New Analysis
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Print Result
          </button>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Scan to Save Results</h2>
        <QRCodeSVG value={qrData} size={128} />
      </div>

      {/* Debug Information (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8">
          <summary className="cursor-pointer text-gray-500 text-sm">Debug Information</summary>
          <pre className="bg-gray-100 p-2 rounded text-xs mt-2 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      )}

      <div className="mt-6 text-center">
        <EndButton />
      </div>
    </div>
  );
}
