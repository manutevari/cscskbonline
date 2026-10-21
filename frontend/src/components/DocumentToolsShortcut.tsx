"use client";

import { usePathname } from "next/navigation";

export default function DocumentToolsShortcut() {
  const pathname = usePathname();
  if (pathname === "/document-tools") return null;
  return (
    <a href="/document-tools" aria-label="Open document crop resize converter" style={{
      position: "fixed", left: 16, bottom: 18, zIndex: 2147482000,
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "#176b4d", color: "#fff", padding: "12px 15px",
      borderRadius: 999, fontWeight: 800, fontSize: 14,
      boxShadow: "0 5px 18px #0003", textDecoration: "none",
      border: "2px solid #fff"
    }}>
      <span aria-hidden="true">✂️</span> Crop / Resize / Convert
    </a>
  );
}
