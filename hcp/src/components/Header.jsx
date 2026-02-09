import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Header.css";

import SearchIcon from "../assets/header/search.svg";
import Ham1 from "../assets/header/ham1.svg";
import Ham2 from "../assets/header/ham2.svg";
import Ham3 from "../assets/header/ham3.svg";

export default function Header({ onSearch, onMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [tabOpen, setTabOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const inputRef = useRef(null);

  // ✅ 추가: 검색바/검색버튼 ref (바깥 클릭 닫기용)
  const searchBarRef = useRef(null);
  const searchBtnRef = useRef(null);

  const isClubsPage = location.pathname === "/clubs";

  const currentStatus = useMemo(() => {
    return (searchParams.get("status") || "").toUpperCase().trim();
  }, [searchParams]);

  const currentQ = useMemo(() => {
    return (searchParams.get("q") || "").trim();
  }, [searchParams]);

  useEffect(() => {
    setKeyword(currentQ);
  }, [currentQ, location.pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  const openTab = () => {
    setTabOpen(true);
    setSearchOpen(false);
  };

  const closeTab = () => setTabOpen(false);

  // ESC로 닫기
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setTabOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ✅ 추가: 검색창 열려 있을 때, 바깥 클릭/터치 시 닫기
  useEffect(() => {
    if (!searchOpen) return;

    const onPointerDown = (e) => {
      const t = e.target;
      const inBar = searchBarRef.current?.contains(t);
      const inBtn = searchBtnRef.current?.contains(t);

      // 검색바/검색버튼 내부가 아니면 닫기
      if (!inBar && !inBtn) setSearchOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [searchOpen]);

  const updateQuery = (updater) => {
    const next = new URLSearchParams(searchParams);
    updater(next);

    const qs = next.toString();
    navigate(`${location.pathname}${qs ? `?${qs}` : ""}`, {
      replace: true,
      state: location.state,
    });
  };

  // ✅ 검색 실행(Enter/검색버튼 모두 여기로)
  // ✅ 요구사항: 검색되면 검색창 닫기
  const submitSearch = () => {
    const q = keyword.trim();

    if (!isClubsPage) {
      onSearch?.(q);
      setSearchOpen(false); // ✅ 검색 후 닫기
      return;
    }

    updateQuery((p) => {
      if (q) p.set("q", q);
      else p.delete("q");
    });

    onSearch?.(q);

    // ✅ Enter로 검색했든, 검색 아이콘으로 했든 무조건 닫기
    setSearchOpen(false);
  };

  // ✅ 검색 아이콘:
  // - 닫혀있으면 열기
  // - 열려있으면 검색 실행(=submitSearch가 닫아줌)
  const handleSearchClick = () => {
    setTabOpen(false);

    if (!searchOpen) {
      setSearchOpen(true);
      onSearch?.();
      return;
    }
    submitSearch();
  };

  const handleTabClick = (key) => {
    onMenu?.(key);

    if (!isClubsPage) {
      closeTab();
      return;
    }

    const map = { ham1: "PRE", ham2: "OPEN", ham3: "CLOSED" };
    const nextStatus = map[key] || "";

    updateQuery((p) => {
      const cur = (p.get("status") || "").toUpperCase().trim();
      if (cur === nextStatus) p.delete("status");
      else p.set("status", nextStatus);
    });

    closeTab();
  };

  const isActive = (statusKey) => currentStatus === statusKey;

  return (
    <>
      <header className="app-header" aria-label="상단 헤더">
        <div className="app-header__right">
          {/* ✅ 검색 아이콘 */}
          <button
            ref={searchBtnRef}
            type="button"
            className={`app-header__iconBtn ${searchOpen ? "is-active" : ""}`}
            onClick={handleSearchClick}
            aria-label={searchOpen ? "검색 실행" : "검색 열기"}
            aria-expanded={searchOpen}
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
            className={`app-header__iconBtn ${tabOpen ? "is-active" : ""}`}
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

        {/* ✅ 검색줄 */}
        <div
          className={`header-search ${searchOpen ? "is-open" : ""}`}
          role="search"
        >
          <form
            ref={searchBarRef}
            className="header-search__bar"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(); // ✅ Enter → 검색 + 닫힘
            }}
          >
            <input
              ref={inputRef}
              className="header-search__input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="동아리 이름 검색"
              aria-label="동아리 검색"
              autoComplete="off"
            />

            {keyword ? (
              <button
                type="button"
                className="header-search__clear"
                onClick={() => setKeyword("")}
                aria-label="검색어 지우기"
              >
                ×
              </button>
            ) : null}

            <button
              type="submit"
              className="header-search__submit"
              aria-label="검색"
            >
              <img src={SearchIcon} alt="" aria-hidden="true" />
            </button>
          </form>
        </div>
      </header>

      {/* ✅ 전체 흐림 오버레이 */}
      <div
        className={`header-overlay ${tabOpen ? "is-open" : ""}`}
        onClick={closeTab}
        aria-hidden={!tabOpen}
      />

      {/* ✅ 오른쪽 작은 탭 */}
      <aside
        id="header-side-tab"
        className={`header-sideTab ${tabOpen ? "is-open" : ""}`}
        role="dialog"
        aria-label="모집 상태 필터"
        aria-hidden={!tabOpen}
      >
        <div className="header-sideTab__content">
          <button
            type="button"
            className={`header-sideTab__itemBtn ${
              isActive("PRE") ? "is-active" : ""
            }`}
            onClick={() => handleTabClick("ham1")}
            aria-label="모집전"
            aria-pressed={isActive("PRE")}
          >
            <span className="header-sideTab__itemLabel">모집전</span>
            <img src={Ham1} alt="" aria-hidden="true" className="header-sideTab__itemImg" />
          </button>

          <button
            type="button"
            className={`header-sideTab__itemBtn ${
              isActive("OPEN") ? "is-active" : ""
            }`}
            onClick={() => handleTabClick("ham2")}
            aria-label="모집중"
            aria-pressed={isActive("OPEN")}
          >
            <span className="header-sideTab__itemLabel">모집중</span>
            <img src={Ham2} alt="" aria-hidden="true" className="header-sideTab__itemImg" />
          </button>

          <button
            type="button"
            className={`header-sideTab__itemBtn ${
              isActive("CLOSED") ? "is-active" : ""
            }`}
            onClick={() => handleTabClick("ham3")}
            aria-label="모집 종료"
            aria-pressed={isActive("CLOSED")}
          >
            <span className="header-sideTab__itemLabel">모집 종료</span>
            <img src={Ham3} alt="" aria-hidden="true" className="header-sideTab__itemImg" />
          </button>
        </div>
      </aside>
    </>
  );
}
