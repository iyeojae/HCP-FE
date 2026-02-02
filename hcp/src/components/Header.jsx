import React, { useEffect, useState } from "react";
import "../styles/components/Header.css";

import SearchIcon from "../assets/header/search.svg";
import Ham1 from "../assets/header/ham1.svg";
import Ham2 from "../assets/header/ham2.svg";
import Ham3 from "../assets/header/ham3.svg";

export default function Header({ onSearch, onMenu }) {
  const [tabOpen, setTabOpen] = useState(false);

  const openTab = () => {
    setTabOpen(true);
    // ❗️여기서 onMenu?.() 호출하면 상위 로직 때문에 탭이 바로 닫히거나 리마운트될 수 있음
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

  // ✅ 탭 아이콘 클릭 핸들러 (원하면 onMenu로 위임)
  const handleTabClick = (key) => {
    // 여기서 원하는 동작 넣으면 됨
    // 예: navigate("/mypage") 같은 거
    onMenu?.(key); // 상위에서 key로 분기하고 싶으면 사용
    closeTab();
  };

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
        {/* ✅ 3개의 점 대신 ham1~3 SVG 버튼 */}
        <div className="header-sideTab__content">
          <button
            type="button"
            className="header-sideTab__itemBtn"
            onClick={() => handleTabClick("ham1")}
            aria-label="메뉴 항목 1"
          >
            <img
              src={Ham1}
              alt=""
              aria-hidden="true"
              className="header-sideTab__itemImg"
            />
          </button>

          <button
            type="button"
            className="header-sideTab__itemBtn"
            onClick={() => handleTabClick("ham2")}
            aria-label="메뉴 항목 2"
          >
            <img
              src={Ham2}
              alt=""
              aria-hidden="true"
              className="header-sideTab__itemImg"
            />
          </button>

          <button
            type="button"
            className="header-sideTab__itemBtn"
            onClick={() => handleTabClick("ham3")}
            aria-label="메뉴 항목 3"
          >
            <img
              src={Ham3}
              alt=""
              aria-hidden="true"
              className="header-sideTab__itemImg"
            />
          </button>
        </div>
      </aside>
    </>
  );
}
