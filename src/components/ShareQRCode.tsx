import type React from "react";
import QRCode from "react-qr-code";

interface ShareQRCodeProps {
  value: string;
}

export const ShareQRCode: React.FC<ShareQRCodeProps> = ({ value }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="rounded-lg bg-surface p-4">
        <QRCode
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={value}
          viewBox="0 0 256 256"
        />
      </div>
      <p className="mt-4 text-center text-sm text-gray-400">
        Scan with mobile device to open genome
      </p>
    </div>
  );
};
