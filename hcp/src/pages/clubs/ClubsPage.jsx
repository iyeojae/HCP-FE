// src/pages/clubs/ClubsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom"; // ✅ useNavigate 추가
import "../../styles/clubs/ClubsPage.css";
import LogoImg from "../../assets/logo2.svg";

import api from "../../api/axios";

const CATEGORY_ORDER = [
  "PERFORMANCE",
  "SPORTS",
  "ACADEMIC",
  "VOLUNTEER",
  "ART",
  "HOBBY",
  "RELIGION",
];

function categoryTitle(category) {
  switch (category) {
    case "PERFORMANCE":
      return "공연 동아리";
    case "SPORTS":
      return "체육 동아리";
    case "ACADEMIC":
      return "학습 동아리";
    case "VOLUNTEER":
      return "봉사 동아리";
    case "ART":
      return "예술 동아리";
    case "HOBBY":
      return "취미 동아리";
    case "RELIGION":
      return "종교 동아리";
    default:
      return "동아리";
  }
}

/** coverUrl이 "/uploads/..." 같은 상대경로면 API 도메인 붙여서 절대경로로 */
function buildCoverUrl(coverUrl) {
  if (!coverUrl) return "";
  if (/^https?:\/\//i.test(coverUrl)) return coverUrl;

  const base = api?.defaults?.baseURL || ""; // ex) https://api.likelionhsu.kr/api
  const origin = base ? base.replace(/\/api\/?$/i, "") : "https://api.likelionhsu.kr";

  const path = coverUrl.startsWith("/") ? coverUrl : `/${coverUrl}`;
  return `${origin}${path}`;
}

export default function ClubsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // ✅ 추가

  const rawStatus = (searchParams.get("status") || "").toUpperCase().trim();
  const q = (searchParams.get("q") || "").trim();

  const status = useMemo(() => {
    const allowed = new Set(["PRE", "OPEN", "CLOSED", "UNKNOWN"]);
    if (!rawStatus) return "";
    return allowed.has(rawStatus) ? rawStatus : "";
  }, [rawStatus]);

  const effectiveStatus = useMemo(() => {
    return q ? "" : status;
  }, [q, status]);

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchClubs = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const params = {};
        if (q) params.q = q;
        else if (effectiveStatus) params.status = effectiveStatus;

        const res = await api.get("/api/common/clubs", {
          params: Object.keys(params).length ? params : undefined,
        });

        const arr = Array.isArray(res?.data) ? res.data : [];

        const mapped = arr
          .map((group) => ({
            key: group.category,
            title: categoryTitle(group.category),
            clubs: (group.clubs || []).map((c) => ({
              id: c.clubId,
              name: c.name,
              description: c.summary,
              imageUrl: buildCoverUrl(c.coverUrl),
            })),
          }))
          .filter((s) => (s.clubs || []).length > 0);

        const byKey = new Map(mapped.map((s) => [s.key, s]));
        const ordered = [
          ...CATEGORY_ORDER.filter((k) => byKey.has(k)).map((k) => byKey.get(k)),
          ...mapped.filter((s) => !CATEGORY_ORDER.includes(s.key)),
        ].filter(Boolean);

        if (alive) setSections(ordered);
      } catch (e) {
        if (!alive) return;
        setErrorMsg(
          e?.response?.data?.message ||
            e?.response?.data?.error ||
            e?.message ||
            "동아리 목록을 불러오지 못했습니다."
        );
        setSections([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchClubs();
    return () => {
      alive = false;
    };
  }, [q, effectiveStatus]);

  const totalClubs = useMemo(() => {
    return sections.reduce((acc, s) => acc + (s.clubs?.length || 0), 0);
  }, [sections]);

  // ✅ 카드 클릭 시 상세로 이동
  const goDetail = (clubId) => {
    if (!clubId && clubId !== 0) return;
    navigate(`/clubs/${clubId}`);
  };

  // ✅ 키보드(Enter/Space)도 클릭처럼 동작
  const onCardKeyDown = (e, clubId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goDetail(clubId);
    }
  };

  return (
    <div className="clubs-page">
      <section className="clubs-user" aria-label="서비스 정보">
        <Link to="/" className="clubs-user__avatarLink" aria-label="시작 화면으로 이동">
          <img className="clubs-user__avatar" src={LogoImg} alt="HCP 로고" />
        </Link>

        <div className="clubs-user__meta">
          <div className="clubs-user__dept clubs-user__dept--brand">Hanseo Club Portal</div>
          <div className="clubs-user__nick clubs-user__nick--brand">HCP</div>
        </div>
      </section>

      {loading ? (
        <div className="clubs-empty">불러오는 중입니다…</div>
      ) : errorMsg ? (
        <div className="clubs-empty">{errorMsg}</div>
      ) : totalClubs === 0 ? (
        <div className="clubs-empty">서비스 준비중입니다.</div>
      ) : (
        <div className="clubs-scroll" role="region" aria-label="동아리 목록">
          {sections.map((section) => (
            <section key={section.key} className="clubs-section">
              <div className="clubs-section__title">{section.title}</div>

              <div className="clubs-grid" role="list">
                {section.clubs.map((club) => (
                  <article
                    key={club.id}
                    className="club-card"
                    role="listitem"
                    tabIndex={0}                 // ✅ 포커스 가능
                    onClick={() => goDetail(club.id)} // ✅ 클릭 이동
                    onKeyDown={(e) => onCardKeyDown(e, club.id)} // ✅ Enter/Space 이동
                    aria-label={`${club.name} 상세 보기`}
                  >
                    <div className="club-card__media">
                      {club.imageUrl ? (
                        <img
                          className="club-card__img"
                          src={club.imageUrl}
                          alt={`${club.name} 대표 이미지`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="club-card__placeholder" aria-label="대표사진 없음">
                          사진을 준비중입니다.
                        </div>
                      )}
                    </div>

                    <div className="club-card__body">
                      <div className="club-card__name">{club.name}</div>
                      <div className="club-card__desc">{club.description}</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}