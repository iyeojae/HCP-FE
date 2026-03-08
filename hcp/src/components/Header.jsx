import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Header.css";

import SearchIcon from "../assets/header/search.svg";
import Ham1 from "../assets/header/ham1.svg";
import Ham2 from "../assets/header/ham2.svg";
import Ham3 from "../assets/header/ham3.svg";
import LogoImg from "../assets/logo2.svg";

export default function Header({ onSearch, onMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [tabOpen, setTabOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const inputRef = useRef(null);
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

  useEffect(() => {
    if (!searchOpen) return;

    const onPointerDown = (e) => {
      const t = e.target;
      const inBar = searchBarRef.current?.contains(t);
      const inBtn = searchBtnRef.current?.contains(t);

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

  const submitSearch = () => {
    const q = keyword.trim();

    if (!isClubsPage) {
      onSearch?.(q);
      setSearchOpen(false);
      return;
    }

    updateQuery((p) => {
      if (q) p.set("q", q);
      else p.delete("q");
    });

    onSearch?.(q);
    setSearchOpen(false);
  };

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
        <div className="app-header__top">
          {isClubsPage ? (
            <button
              type="button"
              className="app-header__brand"
              onClick={() => navigate("/")}
              aria-label="시작 화면으로 이동"
            >
              <img className="app-header__brandAvatar" src={LogoImg} alt="HCP 로고" />

              <span className="app-header__brandMeta">
                <span className="app-header__brandDept">Hanseo Club Portal</span>
                <span className="app-header__brandNick">HCP</span>
              </span>
            </button>
          ) : (
            <div className="app-header__brandPlaceholder" aria-hidden="true" />
          )}

          <div className="app-header__right">
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
        </div>

        <div
          className={`header-search ${searchOpen ? "is-open" : ""}`}
          role="search"
        >
          <form
            ref={searchBarRef}
            className="header-search__bar"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
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

      <div
        className={`header-overlay ${tabOpen ? "is-open" : ""}`}
        onClick={closeTab}
        aria-hidden={!tabOpen}
      />

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
            className={`header-sideTab__itemBtn ${isActive("PRE") ? "is-active" : ""}`}
            onClick={() => handleTabClick("ham1")}
            aria-label="모집전"
            aria-pressed={isActive("PRE")}
          >
            <span className="header-sideTab__itemLabel">모집전</span>
            <img src={Ham1} alt="" aria-hidden="true" className="header-sideTab__itemImg" />
          </button>

          <button
            type="button"
            className={`header-sideTab__itemBtn ${isActive("OPEN") ? "is-active" : ""}`}
            onClick={() => handleTabClick("ham2")}
            aria-label="모집중"
            aria-pressed={isActive("OPEN")}
          >
            <span className="header-sideTab__itemLabel">모집중</span>
            <img src={Ham2} alt="" aria-hidden="true" className="header-sideTab__itemImg" />
          </button>

          <button
            type="button"
            className={`header-sideTab__itemBtn ${isActive("CLOSED") ? "is-active" : ""}`}
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