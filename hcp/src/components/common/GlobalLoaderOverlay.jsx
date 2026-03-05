import React from "react";
import "./GlobalLoaderOverlay.css";

// ✅ 너의 WifiLoader 실제 경로에 맞춰 수정
import WifiLoader from "./WifiLoader";

export default function GlobalLoaderOverlay({ open }) {
  if (!open) return null;

  return (
    <div className="globalLoaderOverlay" role="status" aria-live="polite">
      <div className="globalLoaderOverlay__center">
        <WifiLoader />
      </div>
    </div>
  );
}