import React from "react";
import "../styles/components/Header.css";

export default function Header({ onSearch, onMenu }) {
  return (
    <header className="app-header" aria-label="상단 헤더">
      <div className="app-header__right">
        {/* 검색 아이콘: 너가 SVG로 교체할 자리(틀) */}
        <button
          type="button"
          className="app-header__iconBtn"
          onClick={onSearch}
          aria-label="검색"
        >
          <span className="app-header__iconSlot" aria-hidden="true" />
        </button>

        {/* 햄버거 아이콘: 흰 줄 3개 */}
        <button
          type="button"
          className="app-header__iconBtn"
          onClick={onMenu}
          aria-label="메뉴"
        >
          <span className="hamburger" aria-hidden="true">
            <span className="hamburger__line" />
            <span className="hamburger__line" />
            <span className="hamburger__line" />
          </span>
        </button>
      </div>
    </header>
  );
}
