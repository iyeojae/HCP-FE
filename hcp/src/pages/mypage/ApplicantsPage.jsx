import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/mypage/ApplicantsPage.css";

import api from "../../api/axios";
import { storage } from "../../utils/storage";

/** 날짜 표시용: "2026-02-10" -> "2026.02.10" */
function formatDate(iso) {
  if (!iso) return "";
  const s = String(iso).slice(0, 10);
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${y}.${m}.${d}`;
}

function TopTabs({ value, onChange }) {
  // ✅ UI만(나중에 동아리별 필터 붙일 자리)
  const tabs = ["전체", "동아리A", "동아리B", "동아리C"];
  return (
    <div className="applicants-tabs" role="tablist" aria-label="필터 탭">
      {tabs.map((t) => {
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={active}
            className={`applicants-tab ${active ? "is-active" : ""}`}
            onClick={() => onChange(t)}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

function ApplicantCard({ item, onClick }) {
  return (
    <button type="button" className="applicant-card" onClick={onClick}>
      <div className="applicant-card__left" aria-hidden="true">
        <div className="applicant-card__avatar" />
      </div>

      <div className="applicant-card__body">
        <div className="applicant-card__dept">{item.department || "학과"}</div>

        <div className="applicant-card__row">
          <div className="applicant-card__name">{item.name || "이름"}</div>
          <div className="applicant-card__date">{formatDate(item.appliedDate)}</div>
        </div>

        <div className="applicant-card__tags" aria-label="기술스택">
          {(item.techStackTags || []).slice(0, 8).map((tag) => (
            <span key={tag} className="applicant-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="applicant-card__right" aria-hidden="true">
        <span className="applicant-card__chev">›</span>
      </div>
    </button>
  );
}

export default function ApplicantsPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("전체");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // ✅ 관리자가 지원자 페이지를 열었다 = 신규 알림 확인 처리(빨간 점 끄기)
    if (storage.setHasNewApplicants) storage.setHasNewApplicants(false);
  }, []);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        // ✅ baseURL이 ".../api"라면 여기서는 "/clubadmin/..." 만
        const res = await api.get("/clubadmin/applications/summary");
        const arr = Array.isArray(res?.data) ? res.data : [];
        setList(arr);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "지원자 목록을 불러오지 못했습니다.";
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  // ✅ 탭은 지금 UI만 (API에 club 정보가 없어서 실제 필터는 미적용)
  const filtered = useMemo(() => {
    if (tab === "전체") return list;
    // 나중에 item.clubName 같은 필드 생기면 여기서 필터
    return list;
  }, [list, tab]);

  return (
    <div className="applicants-page">
      {/* 중앙 큰 흰색 테두리 박스 */}
      <section className="applicants-shell" aria-label="지원자 목록">
        <div className="applicants-header">
          <div className="applicants-title">지원자 리스트</div>
          <div className="applicants-sub">총 {filtered.length}명</div>
        </div>

        <TopTabs value={tab} onChange={setTab} />

        <div className="applicants-content">
          {loading ? (
            <div className="applicants-state">불러오는 중…</div>
          ) : errorMsg ? (
            <div className="applicants-state applicants-state--error">{errorMsg}</div>
          ) : filtered.length === 0 ? (
            <div className="applicants-state">지원자가 없습니다.</div>
          ) : (
            <div className="applicants-list" role="list">
              {filtered.map((it) => (
                <ApplicantCard
                  key={it.applicationId}
                  item={it}
                  onClick={() => {
                    // ✅ 나중에 상세 페이지 만들면 여기로 연결
                    // navigate(`/mypage/applicants/${it.applicationId}`);
                    // 지금은 클릭해도 아무 동작 없게 하고 싶으면 아래 줄 지워도 됨
                    navigate("/mypage/applicants", { replace: false });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
