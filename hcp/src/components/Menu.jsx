import React from "react";
import "../styles/components/Menu.css";

export default function Menu({ active = 0, onChange }) {
  return (
    <nav className="app-menu" aria-label="하단 내비게이션">
      {[0, 1, 2].map((idx) => (
        <button
          key={idx}
          type="button"
          className={`app-menu__item ${active === idx ? "active" : ""}`}
          onClick={() => onChange?.(idx)}
          aria-label={`메뉴 ${idx + 1}`}
        >
          {/* 아이콘 자리(너가 SVG 넣을 곳) */}
          <div className="app-menu__iconSlot" aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
