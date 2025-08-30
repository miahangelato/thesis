"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitConsent } from "../../api/api_fingerprint_analysis";
import { useConsent } from "../../contexts/ConsentContext";

export default function ConsentPage() {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setHasConsent } = useConsent();

  const handleNext = async () => {
    if (consent === null) return;

    setLoading(true);
    try {
      await submitConsent(consent);
      setHasConsent(consent); // Store consent in context
      router.push('/fingerprint_analysis');
    } catch (error) {
      console.error('Consent submission error:', error);
      alert('Error submitting consent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Data Privacy Consent</h2>
      <p className="mb-6 max-w-md text-center">
        Your fingerprint images and health data will be used for analysis.
        You can choose whether your fingerprint images will be saved or only used for this session.
      </p>
      <div className="flex gap-6 mb-6">
        <button
          className={`px-4 py-2 rounded ${consent === true ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setConsent(true)}
        >
          I Consent (Save Data)
        </button>
        <button
          className={`px-4 py-2 rounded ${consent === false ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setConsent(false)}
        >
          I Do Not Consent (Do Not Save)
        </button>
      </div>
      <button
        className="bg-green-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
        onClick={handleNext}
        disabled={consent === null || loading}
      >
        {loading ? "Processing..." : "Next"}
      </button>
    </div>
  );
}