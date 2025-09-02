"use client";
import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import Threads from "@/components/ui/Threads";
import { HyperText } from "@/components/magicui/hyper-text";
import Image from "next/image";
import { BoxReveal } from "@/components/magicui/box-reveal";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import ElectricBorder from "@/components/ui/ElectricBorder";

const features = [
  {
    title: "Consent",
    description:
      "Before we begin, review and agree to the consent form. Your privacy and data security comes first.",
    icon: <i className="bi bi-1-circle-fill"></i>,
  },
  {
    title: "Basic Information",
    description: (
      <div className="flex flex-col gap-2">
        Provide your basic details:
        <ul className="list-disc list-inside">
          <li>Age</li>
          <li>Gender</li>
          <li>Height</li>
          <li>Weight</li>
          <li>Blood Donation Eligibility</li>
        </ul>
        This helps us tailor the analysis to you.
      </div>
    ),
    icon: <i className="bi bi-2-circle-fill"></i>,
  },
  {
    title: "Fingerprint Scan",
    description:
      "Place your finger on the scanner, make sure it's clean. Our system analyzes your dermatoglyphic patterns with advanced machine learning.",
    icon: <i className="bi bi-3-circle-fill"></i>,
  },
  {
    title: "Results & Insights",
    description:
      "Get your blood group and health risk analysis instantly. Download a detailed report by scanning the QR Code.",
    icon: <i className="bi bi-4-circle-fill"></i>,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartClick = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/consent");
    }, 500);
  };

  return (
    <div className="relative flex flex-col gap-4 min-h-screen items-center justify-center p-2 overflow-hidden">
      {/* Threads as full background */}
      <div className="absolute inset-0">
        <AnimatedGridPattern className="opacity-20" />
        <Threads
          amplitude={2}
          distance={0}
          enableMouseInteraction={true}
          color={[0.0, 0.74, 1.0]}
        />
      </div>

      {/* Alert */}
      <Alert className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 w-auto bg-orange-100 border-orange-300 text-orange-800 flex items-center gap-4">
        <TriangleAlert className="text-red-500 h-12 w-12 flex-shrink-0" />
        <AlertDescription className="text-xl font-bold text-red">
          This is a research prototype. Not for clinical use.
        </AlertDescription>
      </Alert>

      {/* Headings */}
      <div className="flex flex-col gap-2 text-center z-10 mt-10 mb-5">
        <HyperText className="text-9xl font-bold text-cyan-900">
          Printalyzer
        </HyperText>
        <p className="text-2xl text-[#191919] max-w-2xl mx-auto">
          Discover your blood group and health risks through fingerprint
          analysis. Fast, non-invasive, and accurate.
        </p>
      </div>

      {/* Cards and Button */}
      <div className="flex flex-row gap-8 z-10 justify-center items-center">
        {/* Fprint and Button */}
        <div className="flex flex-col items-center justify-center relative mr-20">
          <Image
            src="/fingerprints.png"
            alt="Fingerprint Scan"
            width={300}
            height={300}
            className="animate-pulse"
          />

          <Button
            className="absolute mt-10 bg-transparent hover:bg-transparent text-white font-bold text-7xl py-18 cursor-pointer"
            onClick={handleStartClick}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoaderCircle size={900} className="animate-spin text-black" />
              </div>
            ) : (
              <SparklesText
                className="text-center animate-bounce"
                colors={{ first: "#00f6ff", second: "#00d1ff" }}
                sparklesCount={15}
                style={{
                  WebkitTextStroke: "4px #006a81ff",
                  textShadow: `
                  2px 2px 0 #fff,
                  -2px 2px 0 #fff,
                  2px -2px 0 #fff,
                  -2px -2px 0 #fff
                `,
                }}
              >
                Click <br /> to <br /> Start
              </SparklesText>
            )}
          </Button>
        </div>

        {/* 1 and 2 */}
        <div className="flex flex-col gap-6">
          {features.slice(0, 2).map((f, i) => (
            <ElectricBorder
              key={i}
              color="#00cfff" // choose the color of the electric border
              thickness={3} // adjust the border thickness
              speed={1.2} // speed of animation
              chaos={1.5} // randomness/chaos in the electric effect
              className="w-130"
            >
              <Card className="p-6 flex flex-col gap-4 shadow-lg">
                <BoxReveal boxColor="#004858ff" duration={0.5}>
                  <div className="flex items-center gap-3 text-cyan-700 text-3xl">
                    {f.icon}
                    <CardTitle>{f.title}</CardTitle>
                  </div>
                </BoxReveal>
                <BoxReveal boxColor="#00cfff" duration={0.5}>
                  <CardDescription className="text-xl">
                    {f.description}
                  </CardDescription>
                </BoxReveal>
              </Card>
            </ElectricBorder>
          ))}
        </div>

        {/* 3 and 4 */}
        <div className="flex flex-col gap-6">
          {features.slice(2, 4).map((f, i) => (
            <ElectricBorder
              key={i}
              color="#00cfff"
              thickness={3}
              speed={1.2}
              chaos={1.5}
              className="w-110"
            >
              <Card className="p-6 flex flex-col gap-4 shadow-lg">
                <BoxReveal boxColor="#004858ff" duration={0.5}>
                  <div className="flex items-center gap-3 text-cyan-700 text-3xl">
                    {f.icon}
                    <CardTitle>{f.title}</CardTitle>
                  </div>
                </BoxReveal>
                <BoxReveal boxColor="#00cfff" duration={0.5}>
                  <CardDescription className="text-xl">
                    {f.description}
                  </CardDescription>
                </BoxReveal>
              </Card>
            </ElectricBorder>
          ))}
        </div>
      </div>
    </div>
  );
}
