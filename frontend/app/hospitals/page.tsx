"use client";
import React from "react";
import EndButton from "../../components/Endbutton";
import { useRouter } from "next/navigation";

const HospitalsPage: React.FC = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Nearby Hospitals</h1>
      <p className="text-lg text-gray-700 mb-4 text-center">
        Below is a list of nearby hospitals where you can seek medical
        assistance.
      </p>

      <div className="bg-white border rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Hospitals</h2>
        <ul className="list-disc pl-6">
          <li className="mb-2">
            <strong>City General Hospital</strong> - 101 Main Street, Cityville
          </li>
          <li className="mb-2">
            <strong>Townsville Medical Center</strong> - 202 Elm Street,
            Townsville
          </li>
          <li className="mb-2">
            <strong>Metropolis Health Institute</strong> - 303 Oak Avenue,
            Metropolis
          </li>
        </ul>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleBack}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Analysis
        </button>
        <div className="mt-6 text-center">
          <EndButton />
        </div>
      </div>
    </div>
  );
};

export default HospitalsPage;
