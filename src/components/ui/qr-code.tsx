"use client";

import { useEffect, useState } from "react";
import { toDataURL } from "qrcode";

type QrCodeProps = {
  value: string;
  size?: number;
};

export function QrCode({ value, size = 200 }: QrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    toDataURL(value, { width: size, margin: 1 })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl(null);
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div className="flex h-40 w-40 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
        Generating QR...
      </div>
    );
  }

  return <img src={dataUrl} alt="Authenticator QR code" width={size} height={size} />;
}
