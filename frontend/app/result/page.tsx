"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import EndButton from "../../components/Endbutton";
import { useConsent } from "../../contexts/ConsentContext";
import QRCodeComponent from "../../components/QRCodeComponent";
import React from "react";
import CryptoJS from "crypto-js";
import {
  Droplets,
  TrendingUp,
  AlertTriangle,
  Heart,
  Hospital,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

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
  const {
    diabetesResult,
    bloodGroupResult: contextBloodGroupResult,
    participantData: contextParticipantData,
  } = useConsent();
  const [result, setResult] = useState<DiabetesResult | null>(null);
  const [bloodGroupResult, setBloodGroupResult] =
    useState<BloodGroupResult | null>(null);
  const [participantData, setParticipantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let sessionId: string | null = null;

    // First check if data is available from sessionStorage via session ID
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      sessionId = urlParams.get("sid") || urlParams.get("s");

      // Also try to get from stored session ID if no URL parameter
      if (!sessionId) {
        sessionId = sessionStorage.getItem("current_session_id");
      }

      if (sessionId) {
        try {
          // Try the new enhanced storage system first
          let encodedData = sessionStorage.getItem(sessionId);

          // Fallback to the fixed key storage
          if (!encodedData) {
            encodedData = sessionStorage.getItem("health_results_data");
          }

          if (encodedData) {
            const dataString = atob(encodedData); // Base64 decoding
            const dataWithExpiry = JSON.parse(dataString);

            // Check if data has expired
            if (Date.now() > dataWithExpiry.expiry) {
              sessionStorage.removeItem(sessionId);
              sessionStorage.removeItem("health_results_data");
              sessionStorage.removeItem("current_session_id");
              setLoading(false);
              // Clean the URL
              window.history.replaceState({}, "", "/result");
              return;
            }

            const decodedData = dataWithExpiry.data;
            setResult(decodedData.diabetesResult);
            setBloodGroupResult(decodedData.bloodGroupResult);
            setParticipantData(decodedData.participantData);
            setLoading(false);

            // Clean the URL after loading data successfully
            window.history.replaceState({}, "", "/result");
            console.log("Results loaded successfully from session storage");
            return;
          }
        } catch (error) {
          console.error("Error parsing session data:", error);
          // Clean the URL on error
          window.history.replaceState({}, "", "/result");
          sessionStorage.removeItem("current_session_id");
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
      case "diabetic":
      case "high":
      case "at risk":
        return "text-red-600 bg-red-100";
      case "healthy":
      case "low":
      case "not at risk":
        return "text-green-600 bg-green-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  // Generate download URL for QR code
  const generateDownloadUrl = () => {
    if (!participantData || !result || !bloodGroupResult) return "";

    const highestConfidenceResult = bloodGroupResult?.results?.reduce(
      (best: any, current: any) => {
        return current.confidence > (best?.confidence || 0) ? current : best;
      },
      null
    );

    const predictedBloodGroup = highestConfidenceResult?.predicted_blood_group;
    const bloodGroupConfidence = highestConfidenceResult?.confidence;

    // Create downloadable data in a structured format
    const downloadData = {
      participantInfo: {
        age: participantData.age || result.prediction_details?.age,
        gender: participantData.gender || result.prediction_details?.gender,
        height: participantData.height || result.prediction_details?.height,
        weight: participantData.weight || result.prediction_details?.weight,
        bloodType:
          participantData.blood_type || result.prediction_details?.blood_type,
        willingToDonate: participantData.willing_to_donate,
      },
      analysisResults: {
        diabetesRisk: result.diabetes_risk,
        diabetesConfidence: result.confidence
          ? (result.confidence * 100).toFixed(1) + "%"
          : "N/A",
        predictedBloodGroup: predictedBloodGroup || "Unknown",
        bloodGroupConfidence: bloodGroupConfidence
          ? (bloodGroupConfidence * 100).toFixed(1) + "%"
          : "N/A",
      },
      metadata: {
        participantId: result.participant_id,
        resultId: result.result_id,
        generatedDate: new Date().toISOString(),
        saved: result.saved,
      },
    };

    // Convert to base64 for URL encoding
    const dataString = JSON.stringify(downloadData, null, 2);
    const encodedData = btoa(dataString);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `health_results_${
      participantData.participant_id || "anonymous"
    }_${timestamp}`;

    // Create the download URL - this should work in production
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin.includes("localhost")
          ? "https://your-production-domain.com" // Replace with your actual production domain
          : window.location.origin
        : "https://your-production-domain.com"; // Replace with your actual production domain

    return `${baseUrl}/api/download-data?format=json&data=${encodedData}&filename=${filename}`;
  };

  // Alternative: Generate PDF download URL if you have the PDF API endpoint
  const generatePDFDownloadUrl = () => {
    if (!participantData?.participant_id) return "";

    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin.includes("localhost")
          ? "https://your-production-domain.com" // Replace with your actual production domain
          : window.location.origin
        : "https://your-production-domain.com"; // Replace with your actual production domain

    const sessionId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("current_session_id")
        : "";

    return `${baseUrl}/api/download/${participantData.participant_id}?sessionId=${sessionId}&format=pdf`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading result...</div>
      </div>
    );
  }

  if (!result || !bloodGroupResult || !participantData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Results</h1>
        <div className="bg-white border rounded-lg shadow-lg p-6 text-center">
          <div className="text-gray-500 mb-4">
            No result found. Please submit your data first.
          </div>
          <button
            onClick={() =>
              (window.location.href = "/fingerprint_analysis?consent=true")
            }
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go Back to Analysis
          </button>
        </div>
      </div>
    );
  }

  const highestConfidenceResult = bloodGroupResult?.results?.reduce(
    (best: any, current: any) => {
      return current.confidence > (best?.confidence || 0) ? current : best;
    },
    null
  );

  const predictedBloodGroup = highestConfidenceResult?.predicted_blood_group;
  const bloodGroupConfidence = highestConfidenceResult?.confidence;

  // Get the appropriate download URL
  const downloadUrl = generatePDFDownloadUrl() || generateDownloadUrl();

  return (
    <div className="p-6">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-center">
            Health Analysis Results
          </h1>
          <p className="text-muted-foreground text-center">
            Your comprehensive health screening results and recommendations
          </p>
        </div>

        {/* First top */}
        <div className="flex flex-row justify-center gap-4">
          {/* First Column: QR Code and Data Storage */}
          <div className="flex flex-col gap-2 w-80 flex-shrink-0">
            {/* QR Code Section */}
            <div className="flex justify-center items-center w-full">
              <div className="text-center bg-white border rounded-lg p-4 flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Download Your Results</h2>

                {/* QR Code for PDF/Data download */}
                {downloadUrl && (
                  <div className="flex flex-col items-center">
                    <QRCodeSVG
                      value={downloadUrl}
                      size={128}
                      level="M"
                      includeMargin={true}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Scan to download your complete health report
                    </p>
                  </div>
                )}

                {/* Fallback direct download button */}
                {participantData?.participant_id && (
                  <button
                    onClick={async () => {
                      try {
                        const sessionId =
                          sessionStorage.getItem("current_session_id");
                        const response = await fetch(
                          `/api/download/${participantData.participant_id}?sessionId=${sessionId}`
                        );

                        if (response.ok) {
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `health_results_${participantData.participant_id}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } else {
                          alert("Failed to download PDF. Please try again.");
                        }
                      } catch (error) {
                        console.error("Download error:", error);
                        alert("Error downloading PDF. Please try again.");
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Download PDF Report
                  </button>
                )}

                {/* Alternative JSON download for QR code users */}
                {!participantData?.participant_id && downloadUrl && (
                  <button
                    onClick={() => {
                      window.open(downloadUrl, "_blank");
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Download Results (JSON)
                  </button>
                )}
              </div>
            </div>

            {/* Data Storage Status */}
            <div className="bg-gray-50 dark:bg-gray-900/20 border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Data Storage Status
              </h3>
              <div
                className={`p-4 rounded-lg flex items-center space-x-3 ${
                  result.saved
                    ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                    : "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                }`}
              >
                {result.saved ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
                <div
                  className={`flex-1 ${
                    result.saved
                      ? "text-green-800 dark:text-green-200"
                      : "text-blue-800 dark:text-blue-200"
                  }`}
                >
                  {result.saved ? (
                    <div>
                      <strong>Data Saved Securely</strong>
                      <p className="text-sm mt-1">
                        Your anonymized data is stored securely.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <strong>Privacy Protected</strong>
                      <p className="text-sm mt-1">
                        Your data was analyzed but not stored for privacy
                        protection
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Second Column: Results and Participant Info */}
          <div className="flex flex-col gap-6 flex-1 min-w-0">
            {/* Results Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blood Type Card */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 border rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Predicted Blood Type
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl text-blue-800 dark:text-blue-200 font-semibold">
                        {predictedBloodGroup || "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {bloodGroupConfidence && (
                        <p className="text-xs text-muted-foreground">
                          Confidence: {(bloodGroupConfidence * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Diabetes Risk Card */}
              <div
                className={`border rounded-lg p-6 ${
                  result.diabetes_risk?.toLowerCase() === "diabetic" ||
                  result.diabetes_risk?.toLowerCase() === "high" ||
                  result.diabetes_risk?.toLowerCase() === "at risk"
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                    : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      result.diabetes_risk?.toLowerCase() === "diabetic" ||
                      result.diabetes_risk?.toLowerCase() === "high" ||
                      result.diabetes_risk?.toLowerCase() === "at risk"
                        ? "bg-red-100 dark:bg-red-900"
                        : "bg-green-100 dark:bg-green-900"
                    }`}
                  >
                    <TrendingUp
                      className={`w-6 h-6 ${
                        result.diabetes_risk?.toLowerCase() === "diabetic" ||
                        result.diabetes_risk?.toLowerCase() === "high" ||
                        result.diabetes_risk?.toLowerCase() === "at risk"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        result.diabetes_risk?.toLowerCase() === "diabetic" ||
                        result.diabetes_risk?.toLowerCase() === "high" ||
                        result.diabetes_risk?.toLowerCase() === "at risk"
                          ? "text-red-700 dark:text-red-300"
                          : "text-green-700 dark:text-green-300"
                      }`}
                    >
                      Diabetes Risk Assessment
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        result.diabetes_risk?.toLowerCase() === "diabetic" ||
                        result.diabetes_risk?.toLowerCase() === "high" ||
                        result.diabetes_risk?.toLowerCase() === "at risk"
                          ? "text-red-800 dark:text-red-200"
                          : "text-green-800 dark:text-green-200"
                      }`}
                    >
                      {result.diabetes_risk
                        ? result.diabetes_risk.toUpperCase()
                        : "UNKNOWN"}
                    </p>
                    {result.confidence && (
                      <p className="text-xs text-muted-foreground">
                        Confidence: {(result.confidence * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Participant Details */}
            {(result.prediction_details || result.participant_data) && (
              <div className="bg-gray-50 dark:bg-gray-900/20 border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Participant Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Age
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {result.prediction_details?.age ||
                        result.participant_data?.age}{" "}
                      years
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Gender
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {result.prediction_details?.gender ||
                        result.participant_data?.gender}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Height
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {result.prediction_details?.height ||
                        result.participant_data?.height}{" "}
                      cm
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Weight
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {result.prediction_details?.weight ||
                        result.participant_data?.weight}{" "}
                      kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Blood Type
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {result.prediction_details?.blood_type ||
                        result.participant_data?.blood_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Fingerprints
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {result.prediction_details?.fingerprint_count ||
                        result.fingerprints?.length ||
                        0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() =>
                  (window.location.href = "/fingerprint_analysis?consent=true")
                }
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                New Analysis
              </button>
              {/* <button
                onClick={() => window.print()}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                Print Result
              </button> */}
            </div>
          </div>

          {/* Third Column: Action Cards */}
          <div className="flex flex-col justify-center w-80 flex-shrink-0">
            {/* Risk-based Action Cards */}
            {result.diabetes_risk && (
              <div>
                {result.diabetes_risk.toLowerCase() === "diabetic" ||
                result.diabetes_risk.toLowerCase() === "high" ||
                result.diabetes_risk.toLowerCase() === "at risk" ? (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                        Important Health Notice
                      </h3>
                    </div>
                    <p className="text-red-700 dark:text-red-300 mb-6 text-sm leading-relaxed">
                      Your analysis indicates elevated diabetes risk indicators.
                      We strongly recommend consulting with a healthcare
                      professional for proper medical evaluation and
                      personalized advice.
                    </p>
                    <div className="text-center">
                      <button
                        onClick={() => (window.location.href = "/hospitals")}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-base inline-flex items-center space-x-2 w-full justify-center"
                      >
                        <Hospital className="w-5 h-5" />
                        <span>Find Nearby Hospitals</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Heart className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                        You're Healthy!
                      </h3>
                    </div>
                    {participantData?.willing_to_donate === true ? (
                      <div>
                        <p className="text-green-700 dark:text-green-300 mb-6 text-sm leading-relaxed">
                          Great news! You're healthy and willing to donate
                          blood. Help save lives by donating blood to those in
                          need.
                        </p>
                        <div className="text-center">
                          <button
                            onClick={() =>
                              (window.location.href = "/blood-donation-centers")
                            }
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-base inline-flex items-center space-x-2 w-full justify-center"
                          >
                            <Heart className="w-5 h-5" />
                            <span>Find Blood Donation Centers</span>
                          </button>
                        </div>
                      </div>
                    ) : participantData?.willing_to_donate === false ? (
                      <div>
                        <p className="text-green-700 dark:text-green-300 mb-6 text-sm leading-relaxed">
                          You are healthy! Consider blood donation to help save
                          lives.
                        </p>
                        <div className="text-center">
                          <button
                            onClick={() =>
                              (window.location.href = "/blood-donation-centers")
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors w-full"
                          >
                            View Blood Donation Centers
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                        You are healthy! Please indicate if you're willing to
                        donate blood.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Debug participant data */}
        {/* {process.env.NODE_ENV === "development" && participantData && (
          <div className="text-xs text-gray-500 mb-4">
            Debug: willing_to_donate ={" "}
            {String(participantData.willing_to_donate)}
          </div>
        )} */}

        {/* Debug Information (for development) */}
        {/* {process.env.NODE_ENV === "development" && (
          <details className="mb-6">
            <summary className="cursor-pointer text-gray-500 text-sm">
              Debug Information
            </summary>
            <pre className="bg-gray-100 p-4 rounded text-xs mt-2 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        )} */}

        {/* End Button */}
        <div className="text-center">
          <EndButton />
        </div>
      </div>
    </div>
  );
}
