// src/pages/mypage/MyPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/mypage/MyPage.css";

import { storage } from "../../utils/storage";
import api from "../../api/axios";

import IconClubs from "../../assets/mypage/clubs.svg";
import IconIntro from "../../assets/mypage/intro.svg";
import IconApplicants from "../../assets/mypage/list.svg";

function CurvedUnderline() {
  return (
    <svg
      className="mypage-action__underline"
      viewBox="0 0 320 26"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 18
           C18 6, 34 6, 42 18
           L278 18
           C286 6, 302 6, 310 18"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ActionRow({ iconSrc, label, onClick, showDot = false }) {
  return (
    <button type="button" className="mypage-action" onClick={onClick}>
      <span className="mypage-action__row">
        <span className="mypage-action__icon" aria-hidden="true">
          <img className="mypage-action__iconImg" src={iconSrc} alt="" />
        </span>

        <span className="mypage-action__labelWrap">
          <span className="mypage-action__label">{label}</span>
          {showDot ? (
            <span className="mypage-action__dot" aria-label="신규 신청 있음" />
          ) : null}
        </span>
      </span>

      <CurvedUnderline />
    </button>
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const adminName = (storage.getAdminName?.() || "").trim();
  const loginId = (storage.getLoginId?.() || "").trim();
  const dept = (storage.getAdminDept?.() || "").trim();

  const studentLine = useMemo(() => {
    const parts = [];
    if (loginId) parts.push(loginId);
    if (dept) parts.push(dept);
    return parts.join(" ");
  }, [loginId, dept]);

  const hasNewApplicants = !!storage.getHasNewApplicants?.();

  const handleLogout = async () => {
    if (logoutLoading) return;

    try {
      setLogoutLoading(true);

      // ✅ 로그아웃 호출 (보통 POST)
      await api.post("/api/auth/logout");
    } catch (e) {
      // 서버 로그아웃이 실패해도(토큰 만료 등) 로컬은 정리하고 로그인 화면으로 보냄
    } finally {
      // ✅ 로컬 저장값 정리 (프로젝트 storage 구현에 맞게 최대한 안전하게)
      try {
        storage.clear?.();
        storage.clearAll?.();
        storage.removeToken?.();
        storage.removeAccessToken?.();
        storage.removeRefreshToken?.();
        storage.setHasNewApplicants?.(false);
      } catch (e) {}

      setLogoutLoading(false);
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="mypage">
      <section className="mypage-profile" aria-label="관리자 정보">
        <div className="mypage-avatar" aria-hidden="true">
          <div className="mypage-avatar__inner" aria-hidden="true">
            <span className="mypage-avatar__userIcon" aria-hidden="true" />
          </div>
        </div>

        {adminName ? <div className="mypage-name">{adminName}</div> : null}
        {studentLine ? <div className="mypage-sub">{studentLine}</div> : null}
      </section>

      <section className="mypage-actions" aria-label="관리자 메뉴">
        <ActionRow
          iconSrc={IconClubs}
          label="동아리 목록 페이지"
          onClick={() => navigate("/clubs")}
        />

        <ActionRow
          iconSrc={IconIntro}
          label="동아리 등록 또는 수정"
          onClick={() => navigate("/mypage/intro")}
        />

        <ActionRow
          iconSrc={IconApplicants}
          label="지원자 리스트"
          showDot={hasNewApplicants}
          onClick={() => navigate("/mypage/applicants")}
        />
      </section>

      {/* ✅ 하단 로그아웃 */}
      <div className="mypage-logout">
        <button
          type="button"
          className="mypage-logout__btn"
          onClick={handleLogout}
          disabled={logoutLoading}
        >
          {logoutLoading ? "로그아웃 중..." : "관리자 로그아웃"}
        </button>
      </div>
    </div>
  );
}