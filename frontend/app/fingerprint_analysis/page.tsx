"use client";
import { useState, useEffect } from "react";
import { useFingerprintAnalysis } from "../../hooks/useFingerPrintAnalysis";
import {
  buildFingerprintFormData,
  predictBloodGroupFromSubmitData,
  predictBloodGroup,
  submitFingerprintAnalysis,
  predictDiabetesFromSubmitData,
  predictDiabetesRisk,
} from "../../api/api_fingerprint_analysis";
import { useConsent } from "../../contexts/ConsentContext";
import { ParticipantData } from "../../types/participant";
import { FingerName, FINGER_ORDER } from "../../types/fingerprint";
import FingerprintScanner from "../../components/FingerprintScanner";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Fingerprint,
  Target,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HandGuide } from "@/components/HandGuide";

// Single Fingerprint Card Component
function SingleFingerprintCard({
  fingerFiles,
  onScanComplete,
  onFileChange,
}: {
  fingerFiles: { [key in FingerName]?: File };
  onScanComplete: (fingerName: FingerName, file: File) => void;
  onFileChange: (finger: FingerName, file: File | null) => void;
}) {
  const [currentFingerIndex, setCurrentFingerIndex] = useState(0);
  const currentFinger = FINGER_ORDER[currentFingerIndex];
  const [handRaw, fingerRaw] = currentFinger.split("_");
  const hand = handRaw as "right" | "left";
  const highlight = fingerRaw as
    | "thumb"
    | "index"
    | "middle"
    | "ring"
    | "pinky";
  const isScanned = !!fingerFiles[currentFinger];
  const totalFingers = FINGER_ORDER.length;

  const handleNext = () => {
    if (!isScanned) return; // block if current not scanned
    if (currentFingerIndex < totalFingers - 1) {
      setCurrentFingerIndex(currentFingerIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentFingerIndex > 0) {
      setCurrentFingerIndex(currentFingerIndex - 1);
    }
  };

  const handleGoToFinger = (index: number) => {
    setCurrentFingerIndex(index);
  };

  // Auto-advance to next finger after scanning (optional)
  const handleScanCompleteWithAdvance = (
    fingerName: FingerName,
    file: File
  ) => {
    onScanComplete(fingerName, file);
    // Auto-advance to next unscanned finger
    setTimeout(() => {
      for (let i = currentFingerIndex + 1; i < totalFingers; i++) {
        if (!fingerFiles[FINGER_ORDER[i]]) {
          setCurrentFingerIndex(i);
          break;
        }
      }
    }, 500);
  };

  return (
    <Card className="mx-auto shadow-lg p-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target
              className={`w-5 h-5 ${
                isScanned ? "text-green-500" : "text-blue-500"
              }`}
            />
            {currentFingerIndex + 1}.{" "}
            {handRaw.charAt(0).toUpperCase() + handRaw.slice(1)}{" "}
            {fingerRaw.charAt(0).toUpperCase() + fingerRaw.slice(1)}
          </CardTitle>
          <div className="text-sm text-gray-600">
            {currentFingerIndex + 1} of {totalFingers}
          </div>
        </div>
        <CardDescription className="flex items-center justify-between">
          <span>
            {isScanned ? "✅ Fingerprint captured" : "⏳ Place finger and scan"}
          </span>
          <div className="text-sm font-medium text-blue-600">
            {Object.keys(fingerFiles).length}/{totalFingers} completed
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Main Content Area */}
        <div className="grid grid-cols-2 gap-4 items-center">
          {/* Left Side - Scanner or Hand Guide */}
          <div className="text-center">
            {!isScanned ? (
              <>
                <HandGuide hand={hand} highlightFinger={highlight} />
                <FingerprintScanner
                  onScanComplete={handleScanCompleteWithAdvance}
                  currentFinger={currentFinger}
                />
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-green-600 font-medium">Scan Complete!</div>
                <HandGuide hand={hand} highlightFinger={highlight} />
              </div>
            )}
          </div>

          {/* Right Side - Scanned Image or Placeholder */}
          <div className="text-center space-y-4">
            {isScanned ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="text-lg font-medium text-gray-700">
                  Captured Fingerprint
                </div>
                <img
                  src={URL.createObjectURL(fingerFiles[currentFinger]!)}
                  alt={currentFinger}
                  className="w-48 h-48 object-contain border-2 border-green-500 rounded-lg mx-auto bg-white shadow-md"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFileChange(currentFinger, null)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Rescan
                </Button>
              </div>
            ) : (
              // <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center bg-gray-50">
              //   <div className="text-center text-gray-500">
              //     <Fingerprint className="w-12 h-12 mx-auto mb-2 opacity-50" />
              //     <div className="text-sm">
              //       Scanned fingerprint will appear here
              //     </div>
              //   </div>
              // </div>

              <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex flex-col items-center justify-center bg-gray-50 p-2">
                <Fingerprint className="w-12 h-12 mb-2 opacity-50 text-gray-400" />
                <div className="text-sm text-gray-500 mb-2">
                  Upload fingerprint file
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="text-xs"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onFileChange(currentFinger, file);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="space-y-4">
          {/* Finger Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentFingerIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Jump to finger:</div>
              <div className="flex gap-1 flex-wrap justify-center">
                {FINGER_ORDER.map((finger, index) => {
                  const isCompleted = !!fingerFiles[finger];
                  const isCurrent = index === currentFingerIndex;

                  // 🚫 Only allow clicking if:
                  // - Going backwards, OR
                  // - That finger itself is already scanned
                  const canNavigate =
                    index <= currentFingerIndex || isCompleted;

                  return (
                    <button
                      key={finger}
                      onClick={() => canNavigate && handleGoToFinger(index)}
                      disabled={!canNavigate}
                      className={`w-8 h-8 text-xs rounded-full border-2 font-medium transition-all
                          ${
                            isCurrent
                              ? "bg-blue-500 text-white border-blue-500"
                              : isCompleted
                              ? "bg-green-100 text-green-700 border-green-500"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={!isScanned || currentFingerIndex === totalFingers - 1}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overall Progress</span>
              <span>
                {Object.keys(fingerFiles).length}/{totalFingers} fingers scanned
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${
                    (Object.keys(fingerFiles).length / totalFingers) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FingerprintScanPage() {
  const {
    hasConsent,
    navigateToResultsWithData,
    retrieveFormData,
    clearFormData,
  } = useConsent();

  const router = useRouter();
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [willingToDonate, setWillingToDonate] = useState<boolean | null>(null);
  const [fingerFiles, setFingerFiles] = useState<{
    [key in FingerName]?: File;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Load form data on component mount
  useEffect(() => {
    const savedFormData = retrieveFormData();
    if (savedFormData && savedFormData.completed) {
      setParticipant(savedFormData.participant);
      setWillingToDonate(savedFormData.willingToDonate);
      console.log("Form data loaded from storage");
    } else {
      // If no completed form data, redirect to personal info page
      router.push("/personal-info");
    }
  }, [retrieveFormData, router]);

  const handleFileChange = (finger: FingerName, file: File | null) => {
    setFingerFiles((prev) => ({ ...prev, [finger]: file || undefined }));
  };

  const handleScanComplete = (fingerName: FingerName, file: File) => {
    handleFileChange(fingerName, file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    if (!participant) {
      alert(
        "Participant data not found. Please fill out the personal information form first."
      );
      router.push("/personal-info");
      return;
    }

    if (Object.keys(fingerFiles).length === 0) {
      alert("Please scan at least one fingerprint.");
      return;
    }

    try {
      setSubmitting(true);

      const consentString = hasConsent ? "true" : "false";
      const formData = buildFingerprintFormData(
        participant,
        fingerFiles,
        consentString,
        willingToDonate
      );

      console.log("[DEBUG] Built form data:", Array.from(formData.entries()));
      console.log("[DEBUG] willingToDonate value:", willingToDonate);

      // Step 1: Submit participant and fingerprints
      const submitRes = await submitFingerprintAnalysis(formData);
      console.log("[DEBUG] Submit response:", submitRes);

      if (hasConsent && submitRes.saved && submitRes.participant_id) {
        // For consent=true: Data is saved, use participant_id for prediction
        const predictionResult = await predictDiabetesRisk(
          submitRes.participant_id.toString(),
          true,
          formData
        );
        console.log(
          "[DEBUG] Prediction result (consent true):",
          predictionResult
        );

        const bloodGroupResult = await predictBloodGroup(
          submitRes.participant_id.toString(),
          true
        );

        // Navigate to results with data encoded in URL
        const participantDataWithDonation = {
          ...participant,
          willing_to_donate: willingToDonate,
        };
        console.log(
          "[DEBUG] Navigating with participant data:",
          participantDataWithDonation
        );

        // Clear form data on successful submission
        clearFormData();

        navigateToResultsWithData(
          predictionResult,
          bloodGroupResult,
          participantDataWithDonation
        );
      } else {
        // For consent=false: Use submit response data directly for prediction
        console.log(
          "[DEBUG] Using submit response for prediction (consent false)"
        );
        const predictionResult = await predictDiabetesFromSubmitData(submitRes);
        console.log(
          "[DEBUG] Prediction result (consent false):",
          predictionResult
        );

        const bloodGroupResult = await predictBloodGroupFromSubmitData(
          submitRes,
          fingerFiles
        );

        // Navigate to results with data encoded in URL
        const participantDataWithDonation = {
          ...participant,
          willing_to_donate: willingToDonate,
        };

        // Clear form data on successful submission
        clearFormData();

        navigateToResultsWithData(
          predictionResult,
          bloodGroupResult,
          participantDataWithDonation
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleClearAll = () => {
    // ✅ Only reset fingerprints, keep participant info
    setFingerFiles({});
  };

  // Show loading state while checking for form data
  if (!participant) {
    return (
      <div className="bg-background overflow-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background overflow-auto p-4">
      <div className="flex flex-col">
        {/* Header with Back Button */}
        <div className="flex flex-col items-center mb-4">
          <h1 className="flex flex-row gap-2 text-3xl font-bold text-foreground mb-2">
            <Fingerprint className="w-10 h-10 text-blue-500" />
            Scan Fingerprints
          </h1>
          <p className="text-foreground text-center">
            Please scan your fingerprints using the scanner below. Make sure your fingers are clean.
            When you're ready, submit your scans for analysis.
          </p>
        </div>

        <Separator className="mb-2" />

        {/* Summary of Personal Info */}
        <Card className="mb-2 bg-blue-50 p-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Personal Information Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4 text-sm">
              <div>
                <strong>Age:</strong> {participant.age}
              </div>
              <div>
                <strong>Gender:</strong> {participant.gender}
              </div>
              <div>
                <strong>Height:</strong> {participant.height} cm
              </div>
              <div>
                <strong>Weight:</strong> {participant.weight} kg
              </div>
              <div>
                <strong>Blood Type:</strong> {participant.blood_type}
              </div>
              <div>
                <strong>Willing to Donate:</strong>{" "}
                {willingToDonate ? "Yes" : "No"}
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Single Fingerprint Scan Card */}
          <SingleFingerprintCard
            fingerFiles={fingerFiles}
            onScanComplete={handleScanComplete}
            onFileChange={handleFileChange}
          />

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <Button onClick={handleBack}>
              <span className="text-sm leading-none">Back</span>
            </Button>

            <button
              type="submit"
              disabled={submitting || Object.keys(fingerFiles).length === 0}
              className={`px-4 py-2 rounded flex-1 text-white ${
                submitting || Object.keys(fingerFiles).length === 0
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting
                ? "Processing Analysis..."
                : `Submit Analysis (${Object.keys(fingerFiles).length} scans)`}
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              disabled={submitting}
            >
              Clear All Fingerprint Scans
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
