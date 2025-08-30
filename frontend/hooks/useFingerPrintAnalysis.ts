import { useState } from 'react';
import { submitFingerprintAnalysis } from '../api/api_fingerprint_analysis';

interface UseFingerPrintAnalysisReturn {
  result: any;
  loading: boolean;
  submit: (formData: FormData) => Promise<any>;
}

export function useFingerprintAnalysis(): UseFingerPrintAnalysisReturn {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (formData: FormData) => {
    try {
      setLoading(true);
      const response = await submitFingerprintAnalysis(formData);
      setResult(response);
      return response;
    } catch (error) {
      console.error('Submission error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, submit };
}