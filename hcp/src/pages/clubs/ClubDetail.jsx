// src/pages/clubs/ClubDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import ClubDetailInfo from "./ClubDetailInfo";
import "../../styles/clubs/ClubDetail.css";

const categoryKo = (category) => {
  switch (category) {
    case "PERFORMANCE":
      return "공연";
    case "SPORTS":
      return "체육";
    case "ACADEMIC":
      return "학습";
    case "VOLUNTEER":
      return "봉사";
    case "ART":
      return "예술";
    case "HOBBY":
      return "취미";
    case "RELIGION":
      return "종교";
    default:
      return "동아리";
  }
};

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base =
    api?.defaults?.baseURL ||
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    "";

  const origin = base ? String(base).replace(/\/api\/?$/i, "") : window.location.origin;
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
};

const dday = (v) => {
  if (v === null || v === undefined) return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);

  if (n === 0) return "D-Day";
  if (n > 0) return `D-${n}`;

  // ✅ D-day 지난 경우
  return "지원 마감";
};

// ✅ "YYYY-MM-DD"를 로컬 날짜(자정)로 안전하게 파싱
const parseLocalDate = (ymd) => {
  const s = String(ymd || "").slice(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

// ✅ recruitEndAt 기준으로 '남은 일수' 계산 (오늘 0시 기준)
const calcDaysLeft = (recruitEndAt) => {
  const end = parseLocalDate(recruitEndAt);
  if (!end) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 로컬 0시
  const diffMs = end.getTime() - today.getTime();
  return Math.round(diffMs / 86400000);
};

const normalizeName = (s) => String(s || "").replace(/\s/g, "");
const isLikelion = (name) => normalizeName(name).includes("멋쟁이사자처럼");

const toExternalUrl = (raw) => {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
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
  const categoryLabel = useMemo(() => categoryKo(club?.category), [club]);
  const isLikelionClub = useMemo(() => isLikelion(club?.name), [club]);

  // ✅ 새 필드: everytimeUrl
  const externalEverytimeUrl = useMemo(() => toExternalUrl(club?.everytimeUrl), [club]);

  const applyBtnDisabled = useMemo(() => {
    if (isLikelionClub) return false;
    return !externalEverytimeUrl;
  }, [isLikelionClub, externalEverytimeUrl]);

  const onApply = () => {
    if (isLikelionClub) {
      navigate("/clubs/apply", { state: { clubId, clubName: club?.name } });
      return;
    }
    if (!externalEverytimeUrl) return;
    window.open(externalEverytimeUrl, "_blank", "noopener,noreferrer");
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

  // ✅ 프론트에서 recruitEndAt 기반으로 먼저 계산 (없으면 서버값 fallback)
  const daysLeftFromEndAt = calcDaysLeft(club?.recruitEndAt);
  const ddayValue =
    daysLeftFromEndAt !== null && daysLeftFromEndAt !== undefined
      ? daysLeftFromEndAt
      : club.daysLeftToRecruitEnd;

  return (
    <div className="clubDetail-page">
      <div className="clubDetail-topbar">
        <button className="clubDetail-back" onClick={() => navigate(-1)} aria-label="뒤로가기">
          ←
        </button>
        <div className="clubDetail-topTitle">동아리 상세</div>
        <div className="clubDetail-topSpace" />
      </div>

      <div className="clubDetail-scroll">
        <div className="clubDetail-heroWrap">
          <div className="clubDetail-badge">{categoryLabel}</div>

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
            <div className="clubDetail-statVal">{dday(ddayValue)}</div>
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
            className={`clubDetail-apply ${applyBtnDisabled ? "disabled" : ""}`}
            onClick={onApply}
            disabled={applyBtnDisabled}
            type="button"
          >
            {isLikelionClub ? "지원하러 가기" : "에브리타임 링크로 이동"}
          </button>

          {isLikelionClub ? (
            <div className="clubDetail-hint">
              현재는 <b>멋쟁이 사자처럼</b> 동아리만 지원 폼을 제공합니다.
            </div>
          ) : !externalEverytimeUrl ? (
            <div className="clubDetail-hint">
              아직 <b>에브리타임 링크</b>가 등록되지 않았습니다.
            </div>
          ) : (
            <div className="clubDetail-hint">
              지원은 <b>에브리타임 링크</b>로 진행됩니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}