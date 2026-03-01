// src/pages/clubs/ClubDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import ClubDetailInfo from "./ClubDetailInfo";
import "../../styles/mypage/ClubDetail.css"; // ✅ styles로 통일

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base =
    api?.defaults?.baseURL ||
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    "";

  if (!base) return path;

  const b = String(base).replace(/\/$/, "");
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
};

const dday = (v) => {
  if (v === null || v === undefined) return "null";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  if (n === 0) return "D-Day";
  if (n > 0) return `D-${n}`;
  return `D+${Math.abs(n)}`;
};

export default function ClubDetail() {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [tab, setTab] = useState("INTRO");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/api/common/clubs/${clubId}`);
        if (!alive) return;
        setClub(res.data);
      } catch (e) {
        if (!alive) return;
        setError("동아리 정보를 불러오지 못했습니다.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [clubId]);

  const imageUrl = useMemo(() => toImageUrl(club?.mainImageUrl), [club]);

  const canApply = useMemo(() => {
    const name = String(club?.name || "").replace(/\s/g, "");
    return name.includes("멋쟁이사자처럼");
  }, [club]);

  const onApply = () => {
    if (!canApply) return;
    navigate("/clubs/apply", { state: { clubId, clubName: club?.name } });
  };

  if (loading) return <div className="clubDetail-page clubDetail-center">불러오는 중...</div>;

  if (error || !club) {
    return (
      <div className="clubDetail-page clubDetail-center">
        <div className="clubDetail-error">{error || "오류가 발생했습니다."}</div>
        <button className="clubDetail-ghost" onClick={() => navigate(-1)}>
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <div className="clubDetail-page">
      <div className="clubDetail-topbar">
        <button className="clubDetail-back" onClick={() => navigate(-1)} aria-label="뒤로가기">
          ←
        </button>
        <div className="clubDetail-topTitle">동아리 상세</div>
        <div className="clubDetail-topSpace" />
      </div>

      <div className="clubDetail-heroWrap">
        <div className="clubDetail-badge">{club.category || "동아리"}</div>

        <div className="clubDetail-hero">
          {imageUrl ? (
            <img className="clubDetail-heroImg" src={imageUrl} alt="동아리 대표 이미지" />
          ) : (
            <div className="clubDetail-heroFallback">이미지 없음</div>
          )}
        </div>
      </div>

      <div className="clubDetail-head">
        <h1 className="clubDetail-name">{club.name}</h1>
        <p className="clubDetail-summary">{club.summary || "한 줄 소개가 없습니다."}</p>
      </div>

      <div className="clubDetail-stats">
        <div className="clubDetail-stat">
          <div className="clubDetail-statVal">{club.viewCount ?? 0}</div>
          <div className="clubDetail-statLab">조회수</div>
        </div>

        <div className="clubDetail-divider" />

        <div className="clubDetail-stat">
          <div className="clubDetail-statVal">{dday(club.daysLeftToRecruitEnd)}</div>
          <div className="clubDetail-statLab">마감기한</div>
        </div>
      </div>

      <ClubDetailInfo
        tab={tab}
        setTab={setTab}
        introduction={club.introduction}
        interviewProcess={club.interviewProcess}
      />

      <div className="clubDetail-bottom">
        <button
          className={`clubDetail-apply ${!canApply ? "disabled" : ""}`}
          onClick={onApply}
          disabled={!canApply}
          type="button"
        >
          지원하러 가기
        </button>

        {!canApply && (
          <div className="clubDetail-hint">
            현재는 <b>멋쟁이 사자처럼</b> 동아리만 지원 가능
          </div>
        )}
      </div>
    </div>
  );
}