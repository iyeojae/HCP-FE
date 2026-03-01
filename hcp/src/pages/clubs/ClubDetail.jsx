// src/pages/club/ClubDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios"; // 너 프로젝트 경로에 맞게 유지/수정
import ClubDetailInfo from "./ClubDetailInfo";
import "../../css/clubs/clubDetail.css";

const joinUrl = (base, path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (!base) return path;

  const b = String(base).replace(/\/$/, "");
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
};

const ddayText = (daysLeft) => {
  // 요구사항: null로 오면 그대로 "null"
  if (daysLeft === null || daysLeft === undefined) return "null";

  const n = Number(daysLeft);
  if (Number.isNaN(n)) return String(daysLeft);

  if (n === 0) return "D-Day";
  if (n > 0) return `D-${n}`;
  return `D+${Math.abs(n)}`; // 마감 지난 경우
};

export default function ClubDetail() {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("INTRO"); // INTRO | PROCESS
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/api/common/clubs/${clubId}`);
        if (!mounted) return;
        setClub(res.data);
      } catch (e) {
        if (!mounted) return;
        setError("동아리 정보를 불러오지 못했습니다.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [clubId]);

  const canApply = useMemo(() => {
    const name = String(club?.name || "").replace(/\s/g, "");
    return name.includes("멋쟁이사자처럼");
  }, [club]);

  const imageUrl = useMemo(() => {
    // axios baseURL이 env를 따라가면, 이미지도 그 base로 붙여주는 게 안전함
    const base =
      api?.defaults?.baseURL ||
      process.env.REACT_APP_API_URL ||
      process.env.REACT_APP_API_BASE_URL ||
      "";

    return joinUrl(base, club?.mainImageUrl);
  }, [club]);

  const onApply = () => {
    if (!canApply) return;
    navigate(`/clubs/${clubId}/apply`);
  };

  if (loading) {
    return <div className="clubD-page clubD-center">불러오는 중...</div>;
  }

  if (error || !club) {
    return (
      <div className="clubD-page clubD-center">
        <div className="clubD-error">{error || "오류가 발생했습니다."}</div>
        <button className="clubD-btnGhost" onClick={() => navigate(-1)}>
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <div className="clubD-page">
      {/* top bar */}
      <div className="clubD-topbar">
        <button className="clubD-iconBtn" onClick={() => navigate(-1)} aria-label="뒤로가기">
          ←
        </button>
        <div className="clubD-topTitle">동아리 상세</div>
        <div className="clubD-topSpacer" />
      </div>

      {/* hero */}
      <div className="clubD-heroWrap">
        <div className="clubD-badge">{club.category || "동아리"}</div>

        <div className="clubD-hero">
          {imageUrl ? (
            <img className="clubD-heroImg" src={imageUrl} alt="동아리 대표 이미지" />
          ) : (
            <div className="clubD-heroFallback">이미지 없음</div>
          )}
        </div>
      </div>

      {/* title / summary */}
      <div className="clubD-head">
        <div className="clubD-name">{club.name}</div>
        <div className="clubD-summary">{club.summary || "한 줄 소개가 없습니다."}</div>
      </div>

      {/* stats */}
      <div className="clubD-stats">
        <div className="clubD-stat">
          <div className="clubD-statVal">{club.viewCount ?? 0}</div>
          <div className="clubD-statLab">조회수</div>
        </div>

        <div className="clubD-divider" />

        <div className="clubD-stat">
          <div className="clubD-statVal">{ddayText(club.daysLeftToRecruitEnd)}</div>
          <div className="clubD-statLab">마감기한</div>
        </div>
      </div>

      {/* intro / process (분리 컴포넌트) */}
      <ClubDetailInfo
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        introduction={club.introduction}
        interviewProcess={club.interviewProcess}
      />

      {/* bottom */}
      <div className="clubD-bottom">
        <button
          className={`clubD-applyBtn ${!canApply ? "disabled" : ""}`}
          onClick={onApply}
          disabled={!canApply}
          type="button"
        >
          지원하러 가기
        </button>

        {!canApply && (
          <div className="clubD-hint">
            현재는 <b>멋쟁이 사자처럼</b> 동아리만 지원 가능
          </div>
        )}
      </div>
    </div>
  );
}