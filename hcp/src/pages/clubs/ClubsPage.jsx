import React, { useMemo /*, useEffect, useState */ } from "react";
import { useSearchParams } from "react-router-dom";
import "../../styles/clubs/ClubsPage.css";

/*
✅ [백엔드 연동 예정] (아직 배포 전 → 주석 처리)

- 기본 목록:
  GET http://localhost:8080/api/common/clubs?status=PRE
  → PRE(모집전) 동아리 전부

- 검색 목록:
  GET http://localhost:8080/api/common/clubs?status=PRE&q=항공
  → PRE + "항공" 포함 동아리

- status 값:
  PRE(모집전) | OPEN(모집중) | CLOSED(모집완료)

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

export default function ClubsPage() {
  const [searchParams] = useSearchParams();

  // ✅ URL 쿼리로 제어하는 값(없으면 기본값)
  // 예) /clubs?status=OPEN&q=항공
  const rawStatus = (searchParams.get("status") || "PRE").toUpperCase().trim();
  const q = (searchParams.get("q") || "").trim();

  // ✅ 허용 status만 통과 (이외는 PRE로)
  const status = useMemo(() => {
    const allowed = new Set(["PRE", "OPEN", "CLOSED"]);
    return allowed.has(rawStatus) ? rawStatus : "PRE";
  }, [rawStatus]);

  // ✅ 더미 유저 (나중에 storage/API로 교체)
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

  // ✅ coverUrl이 "/uploads/..." 같은 상대경로로 오므로 절대 URL로 변환
  // 배포 시에는 ENV(예: REACT_APP_API_ORIGIN)로 분리 추천
  const API_ORIGIN = "http://localhost:8080";

  const toCoverUrl = (coverUrl) => {
    if (!coverUrl) return "";
    if (/^https?:\/\//i.test(coverUrl)) return coverUrl;
    return `${API_ORIGIN}${coverUrl}`;
  };

  const categoryTitle = (category) => {
    switch (category) {
      case "PERFORMANCE": return "공연 동아리";
      case "SPORTS": return "체육 동아리";
      case "ACADEMIC": return "학습 동아리";
      case "VOLUNTEER": return "봉사 동아리";
      case "ART": return "예술 동아리";
      case "HOBBY": return "취미 동아리";
      case "RELIGION": return "종교 동아리";
      default: return "동아리";
    }
  };

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        // ✅ q가 있을 때만 params에 넣는다 (검색)
        // ✅ q가 없으면 status 전체 목록 (기본 목록)
        const params = { status };
        if (q) params.q = q;

        const res = await api.get("/common/clubs", { params });

        // ✅ 응답은 배열
        const arr = Array.isArray(res?.data) ? res.data : [];

        const mapped = arr.map((group) => ({
          key: group.category,
          title: categoryTitle(group.category),
          clubs: (group.clubs || []).map((c) => ({
            id: c.clubId,
            name: c.name,
            description: c.summary,
            imageUrl: toCoverUrl(c.coverUrl),
          })),
        }));

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
  // ✅ 현재는 더미 데이터로 렌더(연동 전)
  // =========================
  const sections = useMemo(
    () => [
      {
        key: "ACADEMIC",
        title: "학습 동아리",
        clubs: [
          {
            id: 1,
            name: "항공동아리 A",
            description: `status=${status}${q ? `, q=${q}` : ""} (더미)`,
            imageUrl: "",
          },
        ],
      },
      {
        key: "HOBBY",
        title: "취미 동아리",
        clubs: [
          {
            id: 2,
            name: "사진 동아리",
            description: "사진을 준비중입니다. 케이스 확인용 더미",
            imageUrl: "",
          },
        ],
      },
    ],
    [status, q]
  );

  const totalClubs = useMemo(
    () => sections.reduce((acc, s) => acc + (s.clubs?.length || 0), 0),
    [sections]
  );

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
          <div className="clubs-user__avatar clubs-user__avatar--fallback" aria-hidden="true">
            {initial}
          </div>
        )}

        <div className="clubs-user__meta">
          <div className="clubs-user__dept">{user.department}</div>
          <div className="clubs-user__nick">{user.nickname}</div>
        </div>
      </section>

      {/*
      ✅ 연동 시(주석 해제 후) 로딩/에러 처리 예시

      {loading ? <div className="clubs-empty">불러오는 중...</div> : null}
      {errorMsg ? <div className="clubs-empty">{errorMsg}</div> : null}
      */}

      {/* ✅ 동아리 0개면: 상자 없이 문구만 */}
      {totalClubs === 0 ? (
        <div className="clubs-empty">서비스 준비중입니다.</div>
      ) : (
        <div className="clubs-scroll" role="region" aria-label="동아리 목록">
          {sections.map((section) => {
            const clubs = section.clubs || [];
            return (
              <section key={section.key} className="clubs-section">
                <div className="clubs-section__title">{section.title}</div>

                {clubs.length === 0 ? (
                  <div className="clubs-section__empty">서비스 준비중입니다.</div>
                ) : (
                  <div className="clubs-grid" role="list">
                    {clubs.map((club) => (
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
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
