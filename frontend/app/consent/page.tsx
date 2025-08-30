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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  FileText,
  AlertTriangle,
  Lock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function ConsentPage() {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const router = useRouter();
  const { setHasConsent } = useConsent();

  const handleNext = async () => {
    if (consent === null || !hasReadTerms) return;

    setLoading(true);
    try {
      await submitConsent(consent);
      setHasConsent(consent);
      router.push("/fingerprint_analysis");
    } catch (error) {
      console.error("Consent submission error:", error);
      alert("Error submitting consent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background overflow-auto">
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
            <Card className="p-4">
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
            <Card className="p-4">
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
                  Choose how your data will be handled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Handling Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      consent === false
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setConsent(false)}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          consent === false
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {consent === false && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          Session Only
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Use data for analysis only, delete immediately after
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      consent === true
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setConsent(true)}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          consent === true
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {consent === true && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          Save for Research
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Save anonymized data to improve future analysis
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Terms Acknowledgment */}
                <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="readTerms"
                      checked={hasReadTerms}
                      onCheckedChange={(checked) =>
                        setHasReadTerms(checked === true)
                      }
                    />
                    <label
                      htmlFor="readTerms"
                      className="text-sm text-foreground leading-relaxed cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium">
                          I understand and agree
                        </span>
                      </div>
                      <span className="text-md text-muted-foreground">
                        I've read the information above and understand this is a
                        screening tool, not a medical diagnosis. I'm at least 18
                        years old or have guardian consent.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleNext}
                  disabled={consent === null || !hasReadTerms || loading}
                  className="w-full px-4 flex items-center justify-center gap-2"
                >
                  <span className="text-sm leading-none">
                    {loading ? "Processing..." : "Begin Analysis"}
                  </span>
                  {!loading && <ArrowRight className="w-4 h-4 flex-shrink-0" />}
                </Button>

                <p className="text-lg text-muted-foreground text-center">
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
