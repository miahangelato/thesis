"use client";
import { useState, useEffect } from "react";
import { useConsent } from "../../contexts/ConsentContext";
import { ParticipantData } from "../../types/participant";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function PersonalInfoPage() {
  const { storeFormData, retrieveFormData, clearFormData } = useConsent();
  const router = useRouter();

  const [participant, setParticipant] = useState<ParticipantData>({
    age: "",
    weight: "",
    height: "",
    gender: "male",
    blood_type: "O",
    sleep_hours: "",
    had_alcohol_last_24h: false,
    ate_before_donation: false,
    ate_fatty_food: false,
    recent_tattoo_or_piercing: false,
    has_chronic_condition: false,
    condition_controlled: true,
    last_donation_date: "",
  });

  const [willingToDonate, setWillingToDonate] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load form data on component mount
  useEffect(() => {
    const savedFormData = retrieveFormData();
    if (savedFormData) {
      if (savedFormData.participant) {
        setParticipant(savedFormData.participant);
      }
      if (savedFormData.willingToDonate !== undefined) {
        setWillingToDonate(savedFormData.willingToDonate);
      }
      console.log("Form data loaded from storage");
    }
  }, [retrieveFormData]);

  // Save form data whenever it changes
  useEffect(() => {
    const formData = {
      participant,
      willingToDonate,
      timestamp: Date.now(),
    };
    storeFormData(formData);
  }, [participant, willingToDonate, storeFormData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setParticipant((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleWillingToDonateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setWillingToDonate(e.target.value === "yes");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    // Basic validation
    if (!participant.age || !participant.weight || !participant.height) {
      alert("Please fill out age, weight, and height.");
      return;
    }

    if (willingToDonate === null) {
      alert("Please indicate if you are willing to donate blood.");
      return;
    }

    try {
      setSubmitting(true);

      // Store the completed form data
      const formData = {
        participant,
        willingToDonate,
        timestamp: Date.now(),
        completed: true, // Mark as completed
      };
      storeFormData(formData);

      // Navigate to fingerprint scanning page
      router.push("/fingerprint_analysis");
    } catch (error) {
      console.error("Navigation error:", error);
      alert("Error proceeding to next step. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setParticipant({
      age: "",
      weight: "",
      height: "",
      gender: "male",
      blood_type: "O",
      sleep_hours: "",
      had_alcohol_last_24h: false,
      ate_before_donation: false,
      ate_fatty_food: false,
      recent_tattoo_or_piercing: false,
      has_chronic_condition: false,
      condition_controlled: true,
      last_donation_date: "",
    });
    setWillingToDonate(null);
    clearFormData();
  };

  const handleBack = () => {
    router.back();
  }

  return (
    <div className="bg-background overflow-auto p-6">
      <div className="flex flex-col text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Personal Information
        </h1>
        <p className="text-muted-foreground mb-4">
          Please provide your personal and health information below.
        </p>

        <Separator className="mb-6" />

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-row gap-4 w-full">
            {/* Participant Info */}
            <Card className="flex-1 p-4">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Participant Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  name="age"
                  type="number"
                  placeholder="Age"
                  value={participant.age}
                  onChange={handleChange}
                  required
                  className="border rounded-md p-2 w-full"
                />
                <input
                  name="weight"
                  type="number"
                  placeholder="Weight (kg)"
                  value={participant.weight}
                  onChange={handleChange}
                  required
                  className="border rounded-md p-2 w-full"
                />
                <input
                  name="height"
                  type="number"
                  placeholder="Height (cm)"
                  value={participant.height}
                  onChange={handleChange}
                  required
                  className="border rounded-md p-2 w-full"
                />
                <select
                  name="gender"
                  value={participant.gender}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <select
                  name="blood_type"
                  value={participant.blood_type}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full"
                >
                  <option value="">Select Blood Type</option>
                  <option value="O">O</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="unknown">Unknown</option>
                </select>
              </CardContent>
            </Card>

            {/* Donation Info */}
            <Card className="flex-1 p-4">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Donation Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="block mb-2">Willing to Donate:</label>
                  <div className="flex gap-4 justify-center">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="willing_to_donate"
                        value="yes"
                        checked={willingToDonate === true}
                        onChange={handleWillingToDonateChange}
                        className="form-radio"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="willing_to_donate"
                        value="no"
                        checked={willingToDonate === false}
                        onChange={handleWillingToDonateChange}
                        className="form-radio"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>

                {willingToDonate && (
                  <div className="space-y-3">
                    <input
                      name="sleep_hours"
                      type="number"
                      placeholder="Sleep Hours"
                      value={participant.sleep_hours}
                      onChange={handleChange}
                      className="border rounded-md p-2 w-full"
                    />

                    {/* Lifestyle Checkboxes */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Health & Lifestyle
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="had_alcohol_last_24h"
                            checked={participant.had_alcohol_last_24h}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">
                            Had alcohol in the last 24 hours
                          </span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="ate_before_donation"
                            checked={participant.ate_before_donation}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">Ate before donation</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="ate_fatty_food"
                            checked={participant.ate_fatty_food}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">Ate fatty food</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="recent_tattoo_or_piercing"
                            checked={participant.recent_tattoo_or_piercing}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">
                            Recent tattoo or piercing
                          </span>
                        </label>

                        <label className="flex items-center space-x-2 col-span-2">
                          <input
                            type="checkbox"
                            name="has_chronic_condition"
                            checked={participant.has_chronic_condition}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">Has chronic condition</span>
                        </label>

                        {participant.has_chronic_condition && (
                          <label className="flex items-center space-x-2 col-span-2 ml-4">
                            <input
                              type="checkbox"
                              name="condition_controlled"
                              checked={participant.condition_controlled}
                              onChange={handleChange}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">
                              Condition is controlled
                            </span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Last Donation Date:
                      </label>
                      <input
                        name="last_donation_date"
                        type="date"
                        value={participant.last_donation_date}
                        onChange={handleChange}
                        className="border rounded-md p-2 w-full"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <Button onClick={handleBack}>
              <span className="text-sm leading-none">Back</span>
            </Button>

            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded flex-1 text-white ${
                submitting
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? "Processing..." : "Continue to Fingerprint Scan"}
            </button>

            <button
              type="button"
              onClick={handleClearForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
