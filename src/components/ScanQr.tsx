"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { assetUrl } from "@/lib/gallery-client";

export function ScanQr() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${assetUrl("/scan")}`
        : assetUrl("/scan");
    QRCode.toDataURL(url, { margin: 1, width: 120 }).then(setSrc);
  }, []);

  if (!src) return <div className="w-[120px] h-[120px] bg-slate-100 rounded" />;
  return (
    <img src={src} alt="QR code to scan page" width={120} height={120} className="rounded" />
  );
}
