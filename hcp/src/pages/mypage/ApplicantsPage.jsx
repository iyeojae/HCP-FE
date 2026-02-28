// src/pages/mypage/ApplicantsPage.jsx
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
  // ✅ 동아리 1개 고정
  const tabs = ["멋쟁이 사자"];
  return (
    <div className="applicants-tabs" role="tablist" aria-label="동아리 탭">
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
  const tagsText = (item.techStackTags || []).join(" · ");

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

        {/* ✅ 태그는 상자 제거 → 그냥 텍스트만 */}
        {tagsText ? (
          <div className="applicant-card__tagsText" aria-label="기술스택">
            {tagsText}
          </div>
        ) : null}
      </div>

      {/* ✅ 우측 세로영역 전체를 #D9CBDF */}
      <div className="applicant-card__right" aria-hidden="true">
        <span className="applicant-card__chev">›</span>
      </div>
    </button>
  );
}

export default function ApplicantsPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("멋쟁이 사자");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // ✅ 지원자 페이지 열면 신규 알림 확인 처리(빨간 점 끄기)
    storage.setHasNewApplicants?.(false);
  }, []);

  useEffect(() => {
    let alive = true;

    const fetchList = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        // ✅ 실제 API 연동
        const res = await api.get("/clubadmin/applications/summary");
        const arr = Array.isArray(res?.data) ? res.data : [];

        // 응답 형태:
        // [{ applicationId, name, department, appliedDate, techStackTags }, ...]
        if (alive) setList(arr);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "지원자 목록을 불러오는 데 실패했습니다.";
        if (alive) {
          setErrorMsg(msg);
          setList([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchList();
    return () => {
      alive = false;
    };
  }, []);

  // ✅ 동아리 1개라서 필터 없음(탭은 UI용)
  const filtered = useMemo(() => list, [list, tab]);

  return (
    <div className="applicants-page">
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
                    // ✅ 클릭 → 지원서 상세(관리자 열람)로 이동
                    navigate(`/mypage/applicants/${it.applicationId}`);
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