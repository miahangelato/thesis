import axios from "axios";
import { ParticipantData } from "../types/participant";
import { FingerName, FINGER_ORDER } from "../types/fingerprint";
import { frontendEncryption } from "../utils/encryption";

const API_BASE = "http://127.0.0.1:8000/api/core/";

// Submit participant data and fingerprints (multipart/form-data)
export async function submitFingerprintAnalysis(formData: FormData) {
  console.log("API - Raw FormData:", Array.from(formData.entries()));

  const response = await axios.post(`${API_BASE}submit/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return response.data;
}


// Submit consent only (for /consent/ endpoint)
export async function submitConsent(consent: boolean): Promise<{ consent: boolean }> {
  const formData = new FormData();
  formData.append("consent", consent ? "true" : "false");
  
  const response = await axios.post(`${API_BASE}consent/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  
  return response.data;
}

export function buildFingerprintFormData(
  participant: ParticipantData,
  fingerFiles: { [key in FingerName]?: File },
  consent: string,
  willingToDonate: boolean = false
): FormData {
  if (consent !== "true" && consent !== "false") {
    throw new Error("Invalid consent value. Must be 'true' or 'false'");
  }

  const formData = new FormData();
  formData.append("consent", consent);
  formData.append("willing_to_donate", willingToDonate.toString());

  // Add participant data
  Object.entries(participant).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value.toString());
    }
  });

  // Add fingerprint files
  FINGER_ORDER.forEach(fingerName => {
    const file = fingerFiles[fingerName];
    if (file) {
      formData.append(fingerName, file);
    }
  });
  
  return formData;
}

export const getParticipantData = async (participantId: string): Promise<ParticipantData> => {
  const response = await fetch(`${API_BASE}participant/${participantId}/data`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch participant data");
  }
  return response.json();
};

export const predictDiabetesRisk = async (participantId: string, consent: boolean = true, formData: FormData): Promise<any> => {
  console.log(`API - Predicting diabetes risk for participant ${participantId}, consent: ${consent}`);
  
  // Add participant_id and consent to formData
  formData.append("participant_id", participantId);
  formData.append("consent", consent ? "true" : "false");
  
  const response = await axios.post(`${API_BASE}predict-diabetes/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  
  return response.data;
};

// New function for consent=false cases - predicts directly from submit response data
export const predictDiabetesFromSubmitData = async (submitResponseData: any): Promise<any> => {
  console.log('API - Predicting diabetes from submit data:', submitResponseData);
  
  const response = await axios.post(`${API_BASE}predict-diabetes-from-json/`, submitResponseData, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  
  return response.data;
};



// submitResponseData: the JSON object returned from submit (with fingerprints)
// fingerFiles: { [finger: string]: File } mapping (e.g. { left_thumb: File, ... })
export const predictBloodGroupFromSubmitData = async (
  submitResponseData: any,
  fingerFiles: { [key: string]: File }
): Promise<any> => {
  console.log('API - Predicting blood group from submit data:', submitResponseData);

  const formData = new FormData();
  formData.append("json", JSON.stringify(submitResponseData));

  // Attach files, matching image_name in fingerprints
  if (submitResponseData.fingerprints && Array.isArray(submitResponseData.fingerprints)) {
    for (const fp of submitResponseData.fingerprints) {
      const file = fingerFiles[fp.finger];
      if (file) {
        formData.append("files", file, fp.image_name); // file name must match image_name
      }
    }
  }

  const response = await fetch(`${API_BASE}identify-blood-group-from-json/`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Blood group prediction failed: ${response.status}`);
  }
  const parsedResponse = await response.json();
  console.log('[DEBUG] Parsed backend response for blood group prediction:', parsedResponse);
  return parsedResponse;
};

export async function predictBloodGroup(participantId: number, consent: boolean) {
  console.log(`[DEBUG] Predicting blood group for participant ${participantId}, consent: ${consent}`);

  // Send participant_id as query parameter, not form data
  const url = `${API_BASE}identify-blood-group-from-participant/?participant_id=${participantId}`;
  
  const formData = new FormData();
  formData.append("consent", consent ? "true" : "false");

  console.log('[DEBUG] Built form data:', Array.from(formData.entries()));
  console.log('[DEBUG] Request URL:', url);

  try {
    const response = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    console.log('[DEBUG] API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[ERROR] API request failed:', error);
    throw error;
  }
}

export const generatePDF = async (data: any): Promise<string> => {
  try {
    const response = await axios.post(`${API_BASE}generate-pdf/`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.success) {
      return response.data.download_url; // Return the URL to the generated PDF
    } else {
      throw new Error(response.data.error || 'Failed to generate PDF');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};