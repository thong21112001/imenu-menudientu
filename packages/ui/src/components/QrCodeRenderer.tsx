import React from 'react';

interface QrCodeRendererProps {
  value: string;
  size?: number;
  className?: string;
  title?: string;
}

export const QrCodeRenderer: React.FC<QrCodeRendererProps> = ({
  value,
  size = 180,
  className = '',
  title = 'Quét mã QR'
}) => {
  // Use quick SVG QR generator API from google/qr server
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=1`;

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      <img
        src={qrUrl}
        alt={title}
        width={size}
        height={size}
        className="rounded-lg object-contain select-none"
      />
      {title && <span className="text-xs font-semibold text-[#176044] mt-2">{title}</span>}
    </div>
  );
};
