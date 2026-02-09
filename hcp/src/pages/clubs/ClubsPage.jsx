import React, { useMemo /*, useEffect, useState */ } from "react";
import { useSearchParams } from "react-router-dom";
import "../../styles/clubs/ClubsPage.css";

/*
✅ [백엔드 연동 예정] (배포 전 → 주석)

- 전체 목록(파라미터 없음):
  GET http://localhost:8080/api/common/clubs
  → 모든 동아리

- 상태 목록:
  GET http://localhost:8080/api/common/clubs?status=PRE
  → PRE(모집전) 동아리 전부

- 검색 목록(검색어만):
  GET http://localhost:8080/api/common/clubs?q=항공
  → "항공" 포함 동아리 (status 무관, 전부)

- status 값:
  PRE(모집전) | OPEN(모집중) | CLOSED(모집완료) | UNKNOWN(모집시간 null)

- 응답 형태(배열):
  [
    {
      "category": "ACADEMIC",
      "clubs": [
        { "clubId": 1, "coverUrl": "/uploads/..png", "name": "...", "summary": "..." }
      ]
    },
    ...
  ]

- axios 인스턴스 사용 시(예: baseURL=http://localhost:8080/api):
  import api from "../../api/axios";
*/

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

export default function ClubsPage() {
  const [searchParams] = useSearchParams();

  // ✅ status: 없으면 "전체(파라미터 없음)"
  const rawStatus = (searchParams.get("status") || "").toUpperCase().trim();
  const q = (searchParams.get("q") || "").trim();

  // ✅ 허용 status만 통과, 없거나 이상하면 ""(전체)
  const status = useMemo(() => {
    const allowed = new Set(["PRE", "OPEN", "CLOSED", "UNKNOWN"]);
    if (!rawStatus) return "";
    return allowed.has(rawStatus) ? rawStatus : "";
  }, [rawStatus]);

  // ✅ 핵심 규칙:
  // q가 있으면 status는 무조건 무시(전체에서 검색)
  const effectiveStatus = useMemo(() => {
    return q ? "" : status;
  }, [q, status]);

  // ✅ 더미 유저(나중에 storage/API로 교체)
  const user = useMemo(
    () => ({
      department: "물리치료학과",
      nickname: "부침개 최고야",
      avatarUrl: "",
    }),
    []
  );

  /*
  // =========================
  // ✅ 연동 시 사용할 상태들 (주석 해제)
  // =========================
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // coverUrl이 "/uploads/..." 같은 상대경로로 올 때
  const API_ORIGIN = "http://localhost:8080";
  const toCoverUrl = (coverUrl) => {
    if (!coverUrl) return "";
    if (/^https?:\/\//i.test(coverUrl)) return coverUrl;
    return `${API_ORIGIN}${coverUrl}`;
  };

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        // ✅ 파라미터 구성 규칙(요구사항 반영)
        // 1) q가 있으면: status 무시 → { q } 만 전달
        // 2) q 없고 status 있으면: { status }
        // 3) 둘 다 없으면: params 없이 호출 → /common/clubs (전체)
        const params = {};
        if (q) params.q = q;
        else if (status) params.status = status;

        // ✅ params가 비어있으면 "/common/clubs" (모든 동아리)
        const res = await api.get("/common/clubs", { params });

        const arr = Array.isArray(res?.data) ? res.data : [];

        const mapped = arr
          .map((group) => ({
            key: group.category,
            title: categoryTitle(group.category),
            clubs: (group.clubs || []).map((c) => ({
              id: c.clubId,
              name: c.name,
              description: c.summary,
              imageUrl: toCoverUrl(c.coverUrl),
            })),
          }))
          // ✅ 결과가 없는 카테고리는 화면에서 제외(UX)
          .filter((s) => (s.clubs || []).length > 0);

        setSections(mapped);
      } catch (e) {
        setErrorMsg(
          e?.response?.data?.message ||
          e?.message ||
          "동아리 목록을 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [status, q]);
  */

  // =========================
  // ✅ 연동 전: 더미 데이터(필터 동작 확인용)
  // =========================
  const dummyAllClubs = useMemo(
    () => [
      // ACADEMIC
      {
        id: 1,
        category: "ACADEMIC",
        status: "PRE",
        name: "항공동아리 A",
        summary: "한줄소개 수정 ✈️",
        coverUrl:
          "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=60",
      },
      {
        id: 2,
        category: "ACADEMIC",
        status: "OPEN",
        name: "항공동아리 B",
        summary: "모집중 ✈️ 합격하면 같이 해요",
        coverUrl:
          "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1200&q=60",
      },
      {
        id: 3,
        category: "ACADEMIC",
        status: "CLOSED",
        name: "알고리즘 스터디",
        summary: "모집 종료 · 주 2회 풀이 + 코드리뷰",
        coverUrl: "",
      },

      // PERFORMANCE
      {
        id: 4,
        category: "PERFORMANCE",
        status: "OPEN",
        name: "쉐이크",
        summary: "한줄소개",
        coverUrl:
          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=60",
      },

      // SPORTS
      {
        id: 5,
        category: "SPORTS",
        status: "PRE",
        name: "히바",
        summary: "한줄소개",
        coverUrl: "",
      },

      // VOLUNTEER
      {
        id: 6,
        category: "VOLUNTEER",
        status: "OPEN",
        name: "로타렉트",
        summary: "한줄소개",
        coverUrl: "",
      },

      // ART
      {
        id: 7,
        category: "ART",
        status: "UNKNOWN",
        name: "미술동아리",
        summary: "모집시간 미정(UNKNOWN) · 한줄소개",
        coverUrl:
          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=60",
      },

      // HOBBY
      {
        id: 8,
        category: "HOBBY",
        status: "PRE",
        name: "사진동아리",
        summary: "한줄소개",
        coverUrl: "",
      },

      // RELIGION
      {
        id: 9,
        category: "RELIGION",
        status: "CLOSED",
        name: "붓다랑",
        summary: "한줄소개",
        coverUrl: "",
      },
    ],
    []
  );

  // ✅ 더미 기준 필터(요구사항 반영):
  // - q가 있으면 status 무시(전체에서 name 검색)
  // - q가 없으면 status 필터 적용
  const filteredClubs = useMemo(() => {
    const keyword = q.trim();
    const hasKeyword = !!keyword;

    const kwLower = keyword.toLowerCase();

    return dummyAllClubs.filter((c) => {
      const okStatus = effectiveStatus ? c.status === effectiveStatus : true;
      const okKeyword = hasKeyword ? c.name.toLowerCase().includes(kwLower) : true;
      return okStatus && okKeyword;
    });
  }, [dummyAllClubs, effectiveStatus, q]);

  // ✅ 섹션으로 그룹핑(결과 없는 섹션은 숨김)
  const sections = useMemo(() => {
    const byCat = new Map();
    filteredClubs.forEach((c) => {
      if (!byCat.has(c.category)) byCat.set(c.category, []);
      byCat.get(c.category).push(c);
    });

    const cats = CATEGORY_ORDER.filter((cat) => byCat.has(cat));
    for (const cat of byCat.keys()) {
      if (!cats.includes(cat)) cats.push(cat);
    }

    return cats.map((cat) => ({
      key: cat,
      title: categoryTitle(cat),
      clubs: byCat.get(cat).map((c) => ({
        id: c.id,
        name: c.name,
        description: c.summary,
        imageUrl: c.coverUrl,
      })),
    }));
  }, [filteredClubs]);

  const totalClubs = filteredClubs.length;

  const initial = useMemo(() => {
    const n = (user.nickname || "").trim();
    return n ? n[0] : "U";
  }, [user.nickname]);

  return (
    <div className="clubs-page">
      {/* ✅ 유저 정보(고정) */}
      <section className="clubs-user" aria-label="사용자 정보">
        {user.avatarUrl ? (
          <img className="clubs-user__avatar" src={user.avatarUrl} alt="프로필" />
        ) : (
          <div
            className="clubs-user__avatar clubs-user__avatar--fallback"
            aria-hidden="true"
          >
            {initial}
          </div>
        )}

        <div className="clubs-user__meta">
          <div className="clubs-user__dept">{user.department}</div>
          <div className="clubs-user__nick">{user.nickname}</div>
        </div>
      </section>

      {/* ✅ 결과 0개면: 상자 없이 문구만 */}
      {totalClubs === 0 ? (
        <div className="clubs-empty">서비스 준비중입니다.</div>
      ) : (
        <div className="clubs-scroll" role="region" aria-label="동아리 목록">
          {sections.map((section) => (
            <section key={section.key} className="clubs-section">
              <div className="clubs-section__title">{section.title}</div>

              <div className="clubs-grid" role="list">
                {section.clubs.map((club) => (
                  <article key={club.id} className="club-card" role="listitem">
                    <div className="club-card__media">
                      {club.imageUrl ? (
                        <img
                          className="club-card__img"
                          src={club.imageUrl}
                          alt={`${club.name} 대표 이미지`}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="club-card__placeholder"
                          aria-label="대표사진 없음"
                        >
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
