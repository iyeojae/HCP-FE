import React from "react";
import "../../styles/common/AlertModal.css";

export default function AlertModal({ open, title, buttonText = "확인", onClose }) {
  if (!open) return null;

  return (
    <div className="am-overlay" role="dialog" aria-modal="true">
      <div className="am-modal">
        <div className="am-title">{title}</div>
        <button type="button" className="am-btn" onClick={onClose}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
