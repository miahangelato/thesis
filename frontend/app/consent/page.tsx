"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitConsent } from "../../api/api_fingerprint_analysis";
import { useConsent } from "../../contexts/ConsentContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  FileText,
  AlertTriangle,
  Lock,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

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
      setHasConsent(consent);
      router.push("/personal-info");
    } catch (error) {
      console.error("Consent submission error:", error);
      alert("Error submitting consent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="bg-background overflow-auto p-6">
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Data Privacy Consent
          </h1>
          <p className="text-muted-foreground">
            Quick overview before we begin your health analysis.
          </p>
        </div>

        <Separator className="mb-6" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4">
            {/* Quick Overview */}
            <Card className="flex-1 p-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span>What We'll Do</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-foreground">
                  We'll analyze your fingerprint patterns and basic health
                  information to provide:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Blood type prediction</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Diabetes risk assessment</span>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                      <strong>Note:</strong> This is a screening tool, not a
                      medical diagnosis. Always consult healthcare professionals
                      for medical advice.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Data Handling */}
            <Card className="flex-1 p-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-green-500" />
                  <span>Your Privacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      We Collect:
                    </h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Basic demographics</li>
                      <li>• Fingerprint patterns</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      We Don't:
                    </h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Store personal identifiers</li>
                      <li>• Share with third parties</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            {/* Consent Options */}
            <Card className="p-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span>Your Choice</span>
                </CardTitle>
                <CardDescription>
                  Please choose whether you consent to the use of your data
                </CardDescription>
              </CardHeader>

              <Separator className="mt-4 mb-4" />

              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <Button
                    variant={consent === true ? "default" : "outline"}
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => setConsent(true)}
                  >
                    <ThumbsUp className="w-4 h-4" />I Consent
                  </Button>
                  <Button
                    variant={consent === false ? "destructive" : "outline"}
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => setConsent(false)}
                  >
                    <ThumbsDown className="w-4 h-4" />I Do Not Consent
                  </Button>
                </div>

                {/* Action Button */}
                <div className="flex flex-row gap-4 justify-between items-center">
                  <Button onClick={handleBack}>
                    <span className="text-sm leading-none">Back</span>
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={consent === null || loading}
                    className="px-4 flex-1 items-center justify-center gap-2"
                  >
                    <span className="text-sm leading-none">
                      {loading ? "Processing..." : "Begin Analysis"}
                    </span>
                    {!loading && (
                      <ArrowRight className="w-4 h-4 flex-shrink-0" />
                    )}
                  </Button>
                </div>

                <p className="text-md text-muted-foreground text-center">
                  You can stop the process at any time. No personal identifiers
                  are stored.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
