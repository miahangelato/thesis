"use client";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Health Screening App</h1>
      <button
        className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
        onClick={() => router.push("/consent")}
      >
        Start
      </button>
    </div>
  );
}