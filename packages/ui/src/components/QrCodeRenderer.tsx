'use client';

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
  title = 'Quét mã QR',
}) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=1`;

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-zinc-200/80 shadow-2xs ${className}`}>
      <img
        src={qrUrl}
        alt={title}
        width={size}
        height={size}
        className="rounded-md object-contain select-none"
      />
      {title && <span className="text-xs font-medium text-emerald-800 mt-2">{title}</span>}
    </div>
  );
};
