// src/components/layout/MobileAppLayout.jsx
import React from "react";
import "../../styles/globals.css";

export default function MobileAppLayout({ children }) {
  return (
    <div className="app-outer">
      <main className="app-shell">{children}</main>
    </div>
  );
}
