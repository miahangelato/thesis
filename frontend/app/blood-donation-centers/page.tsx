"use client"
import React from 'react';
import EndButton from '../../components/Endbutton';

const BloodDonationCentersPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Blood Donation Centers</h1>
      <p className="text-lg text-gray-700 mb-4 text-center">
        Thank you for considering blood donation! Below is a list of nearby blood donation centers where you can contribute to saving lives.
      </p>

      <div className="bg-white border rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Nearby Centers</h2>
        <ul className="list-disc pl-6">
          <li className="mb-2">
            <strong>Red Cross Blood Center</strong> - 123 Main Street, Cityville
          </li>
          <li className="mb-2">
            <strong>Community Health Clinic</strong> - 456 Elm Street, Townsville
          </li>
          <li className="mb-2">
            <strong>City Hospital Blood Bank</strong> - 789 Oak Avenue, Metropolis
          </li>
        </ul>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => window.location.href = '/fingerprint_analysis'}
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

export default BloodDonationCentersPage;