"use client";

import React from "react";
import { useConsent } from "../contexts/ConsentContext";

const EndButton: React.FC = () => {
  const { clearAll } = useConsent();

  const handleEndProcess = () => {
    // Clear all state and localStorage
    clearAll();

    // Navigate to the main page
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleEndProcess}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      End Process
    </button>
  );
};

export default EndButton;
