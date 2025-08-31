import { jsPDF } from "jspdf";

interface ParticipantData {
  age: number;
  gender: string;
  blood_type: string;
  weight: number;
  height: number;
  diabetes_risk: string;
  blood_group_confidence: number;
  willing_to_donate: boolean;
  predicted_blood_group?: string;
  diabetes_confidence?: number;
  participant_id?: number;
  result_id?: number;
  generated_date?: string;
}

export const generatePDF = async (data: ParticipantData): Promise<Buffer> => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Health Screening Results", 105, 20, { align: "center" });
  
  // Add a line separator
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);
  
  // Participant Information Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Participant Information", 20, 40);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  let yPos = 50;
  
  doc.text(`Age: ${data.age} years`, 20, yPos);
  yPos += 8;
  doc.text(`Gender: ${data.gender}`, 20, yPos);
  yPos += 8;
  doc.text(`Height: ${data.height} cm`, 20, yPos);
  yPos += 8;
  doc.text(`Weight: ${data.weight} kg`, 20, yPos);
  yPos += 8;
  doc.text(`Actual Blood Type: ${data.blood_type}`, 20, yPos);
  yPos += 8;
  doc.text(`Willing to Donate Blood: ${data.willing_to_donate ? "Yes" : "No"}`, 20, yPos);
  
  // Analysis Results Section
  yPos += 20;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Analysis Results", 20, yPos);
  
  yPos += 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  // Blood Group Prediction
  doc.setFont("helvetica", "bold");
  doc.text("Blood Group Prediction:", 20, yPos);
  doc.setFont("helvetica", "normal");
  yPos += 8;
  doc.text(`Predicted Blood Group: ${data.predicted_blood_group || "Unknown"}`, 25, yPos);
  yPos += 6;
  doc.text(`Confidence Level: ${data.blood_group_confidence ? (data.blood_group_confidence * 100).toFixed(1) + "%" : "N/A"}`, 25, yPos);
  
  yPos += 15;
  
  // Diabetes Risk Assessment
  doc.setFont("helvetica", "bold");
  doc.text("Diabetes Risk Assessment:", 20, yPos);
  doc.setFont("helvetica", "normal");
  yPos += 8;
  
  // Color coding for risk level
  const riskLevel = data.diabetes_risk?.toUpperCase() || "UNKNOWN";
  const isHighRisk = ["DIABETIC", "HIGH", "AT RISK"].includes(riskLevel);
  
  doc.text(`Risk Level: ${riskLevel}`, 25, yPos);
  yPos += 6;
  doc.text(`Confidence Level: ${data.diabetes_confidence ? (data.diabetes_confidence * 100).toFixed(1) + "%" : "N/A"}`, 25, yPos);
  
  // Recommendations Section
  yPos += 20;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Recommendations", 20, yPos);
  
  yPos += 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  if (isHighRisk) {
    doc.setFont("helvetica", "bold");
    doc.text("⚠️ Important Health Notice:", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    
    const warningText = [
      "Your analysis indicates elevated diabetes risk indicators.",
      "We strongly recommend:",
      "• Consult with a healthcare professional immediately",
      "• Schedule a comprehensive medical evaluation",
      "• Follow personalized medical advice",
      "• Monitor your health regularly"
    ];
    
    warningText.forEach(line => {
      doc.text(line, 25, yPos);
      yPos += 6;
    });
  } else {
    doc.setFont("helvetica", "bold");
    doc.text("✅ Good Health Status:", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    
    const healthyText = [
      "Your analysis indicates good health status.",
      "Recommendations:",
      "• Maintain a healthy lifestyle",
      "• Regular health checkups",
      "• Balanced diet and exercise"
    ];
    
    if (data.willing_to_donate) {
      healthyText.push("• Consider blood donation to help others");
    }
    
    healthyText.forEach(line => {
      doc.text(line, 25, yPos);
      yPos += 6;
    });
  }
  
  // Footer Information
  yPos += 20;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(`Generated on: ${data.generated_date || new Date().toLocaleString()}`, 20, yPos);
  
  if (data.participant_id) {
    yPos += 5;
    doc.text(`Participant ID: ${data.participant_id}`, 20, yPos);
  }
  
  if (data.result_id) {
    yPos += 5;
    doc.text(`Result ID: ${data.result_id}`, 20, yPos);
  }
  
  yPos += 10;
  doc.setFont("helvetica", "normal");
  doc.text("Disclaimer: This analysis is for informational purposes only and should not replace professional medical advice.", 20, yPos, { maxWidth: 170 });

  return doc.output("arraybuffer") as unknown as Buffer;
};