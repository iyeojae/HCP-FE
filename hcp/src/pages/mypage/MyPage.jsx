// src/pages/mypage/MyPage.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/mypage/MyPage.css";

import { storage } from "../../utils/storage";

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

  // ✅ B안: 값 없으면 기본값 사용 X → 표시 자체를 숨김
  const adminName = (storage.getAdminName?.() || "").trim();
  const loginId = (storage.getLoginId?.() || "").trim();
  const dept = (storage.getAdminDept?.() || "").trim();

  // ✅ 학번/학과 표시 문자열 구성: 있는 것만 조합
  const studentLine = useMemo(() => {
    const parts = [];
    if (loginId) parts.push(loginId);
    if (dept) parts.push(dept);
    return parts.join(" ");
  }, [loginId, dept]);

  const hasNewApplicants = !!storage.getHasNewApplicants?.();

  return (
    <div className="mypage">
      <section className="mypage-profile" aria-label="관리자 정보">
        <div className="mypage-avatar" aria-hidden="true">
          <div className="mypage-avatar__inner" aria-hidden="true">
            <span className="mypage-avatar__userIcon" aria-hidden="true" />
          </div>
        </div>

        {/* ✅ 이름: 없으면 숨김 */}
        {adminName ? <div className="mypage-name">{adminName}</div> : null}

        {/* ✅ 학번/학과 pill: 둘 다 없으면 숨김 */}
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
          label="소개글 입력"
          onClick={() => navigate("/mypage/intro")}
        />

        <ActionRow
          iconSrc={IconApplicants}
          label="지원자 리스트"
          showDot={hasNewApplicants}
          onClick={() => navigate("/mypage/applicants")}
        />
      </section>
    </div>
  );
}