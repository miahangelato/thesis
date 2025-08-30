import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeComponentProps {
  data: string;
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ data }) => {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-4">Scan to View Complete Results</h2>
      <QRCodeSVG value={data} size={180} level="M" includeMargin={true} />
      <p className="text-sm text-gray-600 mt-2">
        Scan this QR code with any QR scanner to view your complete health results as text
      </p>
    </div>
  );
};

export default QRCodeComponent;
