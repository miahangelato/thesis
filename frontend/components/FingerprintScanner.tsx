import { useState } from 'react';
import axios from 'axios';
import { FingerName } from '../types/fingerprint';

interface ScannerProps {
  onScanComplete: (fingerName: FingerName, imageFile: File) => void;
  currentFinger: FingerName;
}

export default function FingerprintScanner({ onScanComplete, currentFinger }: ScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScan = async () => {
    setScanning(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/core/scan-finger/?finger_name=${currentFinger}`,
        null,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Convert base64 to File object
        const base64Data = response.data.image;
        const byteCharacters = atob(base64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: 'image/png' });
        const file = new File([blob], `${currentFinger}.png`, { type: 'image/png' });
        
        onScanComplete(currentFinger, file);
      } else {
        throw new Error(response.data.error || 'Scan failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan fingerprint');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={startScan}
        disabled={scanning}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {scanning ? 'Scanning...' : `Scan ${currentFinger.replace('_', ' ')}`}
      </button>
      {error && (
        <p className="text-red-500">{error}</p>
      )}
    </div>
  );
}