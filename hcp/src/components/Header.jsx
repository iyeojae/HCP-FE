import React, { useEffect, useState } from "react";
import "../styles/components/Header.css";

import SearchIcon from "../assets/header/search.svg";

export default function Header({ onSearch, onMenu }) {
  const [tabOpen, setTabOpen] = useState(false);

  const openTab = () => {
    setTabOpen(true);
    onMenu?.(); // 기존 onMenu도 필요하면 그대로 호출
  };

  const closeTab = () => setTabOpen(false);

  // ESC로 닫기
  useEffect(() => {
    if (!tabOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeTab();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tabOpen]);

  return (
    <>
      <header className="app-header" aria-label="상단 헤더">
        <div className="app-header__right">
          {/* ✅ 검색 아이콘 */}
          <button
            type="button"
            className="app-header__iconBtn"
            onClick={onSearch}
            aria-label="검색"
          >
            <img
              src={SearchIcon}
              alt=""
              aria-hidden="true"
              className="app-header__iconImg"
            />
          </button>

          {/* ✅ 햄버거 아이콘 */}
          <button
            type="button"
            className="app-header__iconBtn"
            onClick={openTab}
            aria-label="메뉴"
            aria-expanded={tabOpen}
            aria-controls="header-side-tab"
          >
            <span className="hamburger" aria-hidden="true">
              <span className="hamburger__line" />
              <span className="hamburger__line" />
              <span className="hamburger__line" />
            </span>
          </button>
        </div>
      </header>

      {/* ✅ 전체 흐림 오버레이 */}
      <div
        className={`header-overlay ${tabOpen ? "is-open" : ""}`}
        onClick={closeTab}
        aria-hidden={!tabOpen}
      />

      {/* ✅ 오른쪽 작은 탭(슬라이드) */}
      <aside
        id="header-side-tab"
        className={`header-sideTab ${tabOpen ? "is-open" : ""}`}
        role="dialog"
        aria-label="메뉴 탭"
        aria-hidden={!tabOpen}
      >
        {/* 내용은 네가 원하는 걸로 바꿔도 됨 (지금은 틀만) */}
        <button
          type="button"
          className="header-sideTab__close"
          onClick={closeTab}
          aria-label="닫기"
        >
          ×
        </button>

        <div className="header-sideTab__content">
          <div className="header-sideTab__dot" />
          <div className="header-sideTab__dot" />
          <div className="header-sideTab__dot" />
        </div>
      </aside>
    </>
  );
}
