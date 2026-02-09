import React from "react";
import "../../styles/common/AlertModal.css";

export default function AlertModal({
  open,
  title,
  // ✅ 이제 버튼/닫기 기능은 기본적으로 사용하지 않음(개발자 제어)
  buttonText = "확인",
  onClose,
  showIcon = true,
  variant = "glass",
  hideButton = false,   // ✅ 추가: 버튼 숨김
  lock = false,         // ✅ 추가: true면 overlay 클릭/ESC 닫기 방지
}) {
  if (!open) return null;

  // ✅ lock 모드면 overlay 클릭해도 아무 동작 X
  const handleOverlayClick = (e) => {
    if (!lock && e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className={`am-overlay ${variant === "glass" ? "is-glass" : ""}`}
      role="dialog"
      aria-modal="true"
      onMouseDown={handleOverlayClick}
      onTouchStart={handleOverlayClick}
    >
      <div className="am-modal">
        {showIcon ? (
          <div className="am-icon" aria-hidden="true">
            <span className="am-icon__mark">!</span>
          </div>
        ) : null}

        <div className="am-title">{title}</div>

        {/* ✅ hideButton이면 버튼 자체를 렌더하지 않음 */}
        {!hideButton ? (
          <button type="button" className="am-btn" onClick={onClose}>
            {buttonText}
          </button>
        ) : null}
      </div>
    </div>
  );
}
