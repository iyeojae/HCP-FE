import React from "react";
import "../../styles/common/AlertModal.css";

export default function AlertModal({
  open,
  title,
  buttonText = "확인",
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="am-overlay" role="dialog" aria-modal="true">
      <div className="am-modal">
        {/* ✅ 상단 아이콘(사진처럼) */}
        <div className="am-icon" aria-hidden="true">
          <span className="am-icon__mark">!</span>
        </div>

        <div className="am-title">{title}</div>

        <button type="button" className="am-btn" onClick={onClose}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
