"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";

const cardContent = [
  {
    text: "Consent",
    description:
      "Before we begin, review and agree to our consent form. Your privacy and data security come first.",
    icon: <i className="bi bi-1-circle-fill text-[#191919]"></i>,
  },
  {
    text: "Information",
    description: (
      <div>
        Provide your basic details:
        <ul className="list-disc list-inside mt-2">
          <li>Age</li>
          <li>Gender</li>
          <li>Height</li>
          <li>Weight</li>
          <li>Blood donation eligibility (simple checklist)</li>
        </ul>
      </div>
    ),
    icon: <i className="bi bi-2-circle-fill text-[#191919]"></i>,
  },
  {
    text: "Fingerprint Scan",
    description:
      "Place your finger on the scanner. Our system analyzes your dermatoglyphic patterns with advanced machine learning.",
    icon: <i className="bi bi-3-circle-fill text-[#191919]"></i>,
  },
  {
    text: "Get Results",
    description:
      "View your predicted blood group, risk assessments (like diabetes), and donation eligibility instantly.",
    icon: <i className="bi bi-4-circle-fill text-[#191919]"></i>,
  },
];

export default function LandingPage() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col gap-4 min-h-screen items-center justify-center p-2 bg-white text-[#191919]">
      <div className="flex flex-col gap-2 text-center">
        <Alert className="max-w-full bg-yellow-100 border-yellow-400 text-yellow-900 shadow-lg flex items-center gap-3 mb-4">
          <i className="bi bi-exclamation-triangle-fill text-2xl text-yellow-500" />
          <AlertDescription className="text-center font-semibold">
            Note: This is a research prototype. Not for clinical use.
          </AlertDescription>
        </Alert>
        <h1 className="text-6xl font-bold">Printalyzer</h1>
        <p className="text-2xl">Your fingerprint, your health insights.</p>
      </div>

      <div className="flex flex-row gap-2 justify-center">
        {cardContent.map((card, idx) => (
          <Card
            key={idx}
            className="relative mt-8 w-80 h-[370px] flex flex-col justify-between shadow-lg"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">
              {card.icon}
            </div>
            <div className="p-6 flex flex-col items-center h-full">
              <CardTitle className="text-2xl font-bold mb-4 uppercase">
                {card.text}
              </CardTitle>
              <CardDescription className="text-lg">
                {card.description}
              </CardDescription>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center mt-6">
        <Button
          onClick={() => router.push("/consent")}
          className="bg-[#191919] hover:bg-black text-white p-6 rounded-50 text-xl font-bold shadow-lg transition-colors flex items-center gap-2"
        >
          <span>Start Health Analysis</span>
          <Fingerprint />
        </Button>
      </div>
    </div>
  );
}
