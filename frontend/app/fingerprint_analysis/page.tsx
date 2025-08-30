"use client";
import { useState, useEffect } from "react";
import { useFingerprintAnalysis } from "../../hooks/useFingerPrintAnalysis";
import { buildFingerprintFormData,predictBloodGroupFromSubmitData, predictBloodGroup, submitFingerprintAnalysis, predictDiabetesFromSubmitData, getParticipantData, predictDiabetesRisk } from "../../api/api_fingerprint_analysis";
import { useConsent } from "../../contexts/ConsentContext";

import { ParticipantData } from "../../types/participant";
import { FingerName, FINGER_ORDER } from "../../types/fingerprint";
import FingerprintScanner from '../../components/FingerprintScanner';
import { useRouter } from "next/navigation";

export default function FingerprintAnalysisPage() {
  const { hasConsent, setParticipantData, setBloodGroupResult, setDiabetesResult, navigateToResultsWithData, storeFormData, retrieveFormData, clearFormData } = useConsent();
  const { result, loading, submit } = useFingerprintAnalysis();
  const router = useRouter();
  const [participant, setParticipant] = useState<ParticipantData>({
    age: "",
    weight: "",
    height: "",
    gender: "male",
    blood_type: "O",
    sleep_hours: "",
    had_alcohol_last_24h: false,
    ate_before_donation: false,
    ate_fatty_food: false,
    recent_tattoo_or_piercing: false,
    has_chronic_condition: false,
    condition_controlled: true,
    last_donation_date: "",
  });

  const [fingerFiles, setFingerFiles] = useState<{ [key in FingerName]?: File }>({});
  const [willingToDonate, setWillingToDonate] = useState<boolean | null>(null);

  // Load form data on component mount
  useEffect(() => {
    const savedFormData = retrieveFormData();
    if (savedFormData) {
      if (savedFormData.participant) {
        setParticipant(savedFormData.participant);
      }
      if (savedFormData.willingToDonate !== undefined) {
        setWillingToDonate(savedFormData.willingToDonate);
      }
      console.log('Form data loaded from storage');
    }
  }, [retrieveFormData]);

  // Save form data whenever it changes
  useEffect(() => {
    const formData = {
      participant,
      willingToDonate,
      timestamp: Date.now()
    };
    storeFormData(formData);
  }, [participant, willingToDonate, storeFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setParticipant(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (finger: FingerName, file: File | null) => {
    setFingerFiles(prev => ({ ...prev, [finger]: file || undefined }));
  };

  const handleScanComplete = (fingerName: FingerName, file: File) => {
    handleFileChange(fingerName, file);
  };

  const handleWillingToDonateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWillingToDonate(e.target.value === "yes");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that willing to donate is selected
    if (willingToDonate === null) {
      alert("Please indicate if you are willing to donate blood.");
      return;
    }
    
    try {
      const consentString = hasConsent ? "true" : "false";
      const formData = buildFingerprintFormData(participant, fingerFiles, consentString, willingToDonate);
      console.log("[DEBUG] Built form data:", Array.from(formData.entries()));
      console.log("[DEBUG] willingToDonate value:", willingToDonate);
      
      // Step 1: Submit participant and fingerprints
      const submitRes = await submitFingerprintAnalysis(formData);
      console.log("[DEBUG] Submit response:", submitRes);
      
      if (hasConsent && submitRes.saved && submitRes.participant_id) {
        // For consent=true: Data is saved, use participant_id for prediction
        const predictionResult = await predictDiabetesRisk(submitRes.participant_id.toString(), true, formData);
        console.log("[DEBUG] Prediction result (consent true):", predictionResult);

        const bloodGroupResult = await predictBloodGroup(submitRes.participant_id.toString(), true);

        // Navigate to results with data encoded in URL
        const participantDataWithDonation = {
          ...participant,
          willing_to_donate: willingToDonate
        };
        console.log("[DEBUG] Navigating with participant data:", participantDataWithDonation);
        
        // Clear form data on successful submission
        clearFormData();
        
        navigateToResultsWithData(predictionResult, bloodGroupResult, participantDataWithDonation);
      } else {
        // For consent=false: Use submit response data directly for prediction
        console.log("[DEBUG] Using submit response for prediction (consent false)");
        const predictionResult = await predictDiabetesFromSubmitData(submitRes);
        console.log("[DEBUG] Prediction result (consent false):", predictionResult);

        const bloodGroupResult = await predictBloodGroupFromSubmitData(submitRes, fingerFiles);
        
        // Navigate to results with data encoded in URL
        const participantDataWithDonation = {
          ...participant,
          willing_to_donate: willingToDonate
        };
        
        // Clear form data on successful submission
        clearFormData();
        
        navigateToResultsWithData(predictionResult, bloodGroupResult, participantDataWithDonation);
      }
      
      // No longer need to redirect manually - navigateToResultsWithData handles it
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Sample Backend Submission</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="age" type="number" placeholder="Age" value={participant.age} onChange={handleChange} required className="border p-1 w-full" />
        <input name="weight" type="number" placeholder="Weight" value={participant.weight} onChange={handleChange} required className="border p-1 w-full" />
        <input name="height" type="number" placeholder="Height" value={participant.height} onChange={handleChange} required className="border p-1 w-full" />
        <select name="gender" value={participant.gender} onChange={handleChange} className="border p-1 w-full">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select name="blood_type" value={participant.blood_type} onChange={handleChange} className="border p-1 w-full">
          <option value="O">O</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="AB">AB</option>
          <option value="unknown">Unknown</option>
        </select>
        {/* Willing to Donate Field */}
        <div>
          <label className="block mb-2">Willing to Donate:</label>
          <label className="inline-flex items-center mr-4">
            <input
              type="radio"
              name="willing_to_donate"
              value="yes"
              checked={willingToDonate === true}
              onChange={handleWillingToDonateChange}
              className="form-radio"
            />
            <span className="ml-2">Yes</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="willing_to_donate"
              value="no"
              checked={willingToDonate === false}
              onChange={handleWillingToDonateChange}
              className="form-radio"
            />
            <span className="ml-2">No</span>
          </label>
        </div>

        {/* Blood Donation Criteria Fields */}
        {willingToDonate && (
          <div className="mt-4">
            <label className="block mb-2">Blood Donation Criteria:</label>
            <input
              name="sleep_hours"
              type="number"
              placeholder="Sleep Hours"
              value={participant.sleep_hours}
              onChange={handleChange}
              className="border p-1 w-full mb-2"
            />
            <label className="inline-flex items-center mb-2">
              <input
                type="checkbox"
                name="had_alcohol_last_24h"
                checked={participant.had_alcohol_last_24h}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="ml-2">Had alcohol in the last 24 hours</span>
            </label>
            <label className="inline-flex items-center mb-2">
              <input
                type="checkbox"
                name="ate_before_donation"
                checked={participant.ate_before_donation}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="ml-2">Ate before donation</span>
            </label>
            <label className="inline-flex items-center mb-2">
              <input
                type="checkbox"
                name="ate_fatty_food"
                checked={participant.ate_fatty_food}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="ml-2">Ate fatty food</span>
            </label>
            <label className="inline-flex items-center mb-2">
              <input
                type="checkbox"
                name="recent_tattoo_or_piercing"
                checked={participant.recent_tattoo_or_piercing}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="ml-2">Recent tattoo or piercing</span>
            </label>
            <label className="inline-flex items-center mb-2">
              <input
                type="checkbox"
                name="has_chronic_condition"
                checked={participant.has_chronic_condition}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="ml-2">Has chronic condition</span>
            </label>
            {participant.has_chronic_condition && (
              <label className="inline-flex items-center mb-2">
                <input
                  type="checkbox"
                  name="condition_controlled"
                  checked={participant.condition_controlled}
                  onChange={handleChange}
                  className="form-checkbox"
                />
                <span className="ml-2">Condition is controlled</span>
              </label>
            )}
            <label className="block mb-2">Last Donation Date:</label>
            <input
              name="last_donation_date"
              type="date"
              value={participant.last_donation_date}
              onChange={handleChange}
              className="border p-1 w-full"
            />
          </div>
        )}
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Scan Fingerprints</h2>
          {FINGER_ORDER.map(finger => (
            <div key={finger} className="mb-4">
              <p className="mb-2">{finger.replace('_', ' ').toUpperCase()}</p>
              {fingerFiles[finger] ? (
                <div className="flex items-center gap-4">
                  <img 
                    src={URL.createObjectURL(fingerFiles[finger]!)} 
                    alt={finger} 
                    className="w-32 h-32 object-contain border"
                  />
                  <button
                    onClick={() => handleFileChange(finger, null)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <FingerprintScanner
                  onScanComplete={handleScanComplete}
                  currentFinger={finger}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-6">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex-1">
            Submit
          </button>
          <button 
            type="button" 
            onClick={() => {
              // Reset form to initial state
              setParticipant({
                age: "",
                weight: "",
                height: "",
                gender: "male",
                blood_type: "O",
                sleep_hours: "",
                had_alcohol_last_24h: false,
                ate_before_donation: false,
                ate_fatty_food: false,
                recent_tattoo_or_piercing: false,
                has_chronic_condition: false,
                condition_controlled: true,
                last_donation_date: "",
              });
              setFingerFiles({});
              setWillingToDonate(null);
              clearFormData();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Clear Form
          </button>
        </div>
      </form>
  {/* Result display removed; handled by /result page after redirect */}
    </div>
  );
}
