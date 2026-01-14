import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/common/AppHeader.css";

export default function AppHeader({ title = "", onBack, showBack = true }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
  };

  return (
    <header className="app-header">
      {showBack ? (
        <button
          type="button"
          className="app-header__back"
          onClick={handleBack}
          aria-label="뒤로가기"
        >
          {/* 심플 화살표 (원하면 SVG로 교체 가능) */}
          <span className="app-header__backIcon">‹</span>
        </button>
      ) : null}

      <h1 className="app-header__title">{title}</h1>
    </header>
  );
}
