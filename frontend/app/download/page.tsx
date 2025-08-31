// pages/download.tsx (for Pages Router) or app/download/page.tsx (for App Router)
"use client"; // Remove this line if using Pages Router

import { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Use "next/navigation" for App Router
import { Download, FileText, Clock, AlertCircle, CheckCircle } from "lucide-react";

export default function DownloadPage() {
  const router = useRouter();
  const { id, sessionId, format } = router.query; // For App Router, use useSearchParams()
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadFile = async (downloadFormat: string = 'pdf') => {
    if (!id) {
      setError("Missing participant ID");
      return;
    }

    setDownloading(true);
    setDownloaded(false);
    setError(null);

    try {
      let downloadUrl = '';
      
      if (downloadFormat === 'pdf' && sessionId) {
        // Try PDF download first if sessionId is available
        downloadUrl = `/api/download/${id}?sessionId=${sessionId}&format=pdf`;
      } else if (downloadFormat === 'json' && sessionId) {
        // Fallback to JSON download
        // You'll need to implement logic to get the data from sessionId
        downloadUrl = `/api/download-json/${sessionId}`;
      } else {
        setError("Unable to generate download link. Missing required data.");
        setDownloading(false);
        return;
      }

      const response = await fetch(downloadUrl);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        
        // Set filename based on format
        const fileExtension = downloadFormat === 'pdf' ? 'pdf' : 'json';
        a.download = `health_results_${id}.${fileExtension}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setDownloaded(true);
        
        // Auto-close after successful download
        setTimeout(() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            router.push('/');
          }
        }, 3000);
        
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to download ${downloadFormat.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      setError(`Error downloading ${downloadFormat.toUpperCase()}. Please try again.`);
    } finally {
      setDownloading(false);
    }
  };

  // Auto-download on page load
  useEffect(() => {
    if (id) {
      // Try PDF first, then fallback to JSON
      downloadFile(format as string || 'pdf');
    }
  }, [id, sessionId, format]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-6">
          <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Health Results Download
          </h1>
          <p className="text-gray-600">
            Your health screening results are ready for download
          </p>
        </div>

        {/* Loading State */}
        {downloading && !downloaded && !error && (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Clock className="w-5 h-5 animate-spin" />
              <span>Preparing your download...</span>
            </div>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                If the download doesn't start automatically, please use the manual download buttons below.
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {downloaded && !error && (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span>Download completed successfully!</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                Your file has been downloaded. You will be redirected automatically in a few seconds.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-red-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Download Failed</span>
            </div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Manual Download Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => downloadFile('pdf')}
            disabled={downloading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>{downloading ? "Downloading PDF..." : "Download PDF Report"}</span>
          </button>

          <button
            onClick={() => downloadFile('json')}
            disabled={downloading}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>{downloading ? "Downloading JSON..." : "Download JSON Data"}</span>
          </button>

          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                router.push('/');
              }
            }}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Return to Results
          </button>
        </div>

        {/* Information */}
        <div className="mt-6 text-xs text-gray-500 space-y-2">
          <p>
            If the download doesn't start automatically, click the download button above.
          </p>
          {id && (
            <p>
              Participant ID: <code className="bg-gray-100 px-1 rounded text-gray-700">{id}</code>
            </p>
          )}
          {sessionId && (
            <p>
              Session ID: <code className="bg-gray-100 px-1 rounded text-gray-700">
                {(sessionId as string).substring(0, 8)}...
              </code>
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-left">
          <h3 className="font-medium text-gray-900 mb-2">Download Instructions:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• PDF format contains a formatted health report</li>
            <li>• JSON format contains raw data for technical use</li>
            <li>• Files are generated dynamically and not stored</li>
            <li>• Keep your files secure and private</li>
          </ul>
        </div>
      </div>
    </div>
  );
}