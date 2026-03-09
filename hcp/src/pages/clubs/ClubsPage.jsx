import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../../styles/clubs/ClubsPage.css";

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
    case "CLUB_ADMIN":
      return "동아리 관리";
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

function buildCoverUrl(coverUrl) {
  if (!coverUrl) return "";
  if (/^https?:\/\//i.test(coverUrl)) return coverUrl;

  const base = api?.defaults?.baseURL || "";
  const origin = base ? base.replace(/\/api\/?$/i, "") : "https://api.likelionhsu.kr";

  const path = coverUrl.startsWith("/") ? coverUrl : `/${coverUrl}`;
  return `${origin}${path}`;
}

export default function ClubsPage() {
  const UNION_CLUB_ID = 44;
  const ADMIN_CATEGORY_KEY = "CLUB_ADMIN";

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

        // ✅ 1) 총동연(clubId=44)만 따로 빼기 (원래 그룹에서는 제거)
        let unionClub = null;

        const cleanedArr = arr.map((group) => {
          const original = Array.isArray(group?.clubs) ? group.clubs : [];
          const clubs = original.filter((c) => {
            if (c?.clubId === UNION_CLUB_ID) {
              unionClub = c;
              return false; // 원래 그룹에서 제거
            }
            return true;
          });
          return { ...group, clubs };
        });

        // ✅ 2) 일반 섹션 매핑
        const mapped = cleanedArr
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

        // ✅ 3) 정렬 (기존 CATEGORY_ORDER 유지)
        const byKey = new Map(mapped.map((s) => [s.key, s]));
        const ordered = [
          ...CATEGORY_ORDER.filter((k) => byKey.has(k)).map((k) => byKey.get(k)),
          ...mapped.filter((s) => !CATEGORY_ORDER.includes(s.key)),
        ].filter(Boolean);

        // ✅ 4) "동아리 관리" 섹션 생성(있으면 최상단)
        const adminSection = unionClub
          ? {
              key: ADMIN_CATEGORY_KEY,
              title: categoryTitle(ADMIN_CATEGORY_KEY),
              clubs: [
                {
                  id: unionClub.clubId,
                  name: unionClub.name,
                  description: unionClub.summary,
                  imageUrl: buildCoverUrl(unionClub.coverUrl),
                },
              ],
            }
          : null;

        const finalSections = adminSection ? [adminSection, ...ordered] : ordered;

        if (alive) setSections(finalSections);
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

  const goDetail = (clubId) => {
    if (!clubId && clubId !== 0) return;
    navigate(`/clubs/${clubId}`);
  };

  const onCardKeyDown = (e, clubId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goDetail(clubId);
    }
  };

  return (
    <div className="clubs-page">
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
                    tabIndex={0}
                    onClick={() => goDetail(club.id)}
                    onKeyDown={(e) => onCardKeyDown(e, club.id)}
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