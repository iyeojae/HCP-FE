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

/**
 * ✅ techStackTags가 아래처럼 와도 "태그 배열"로 정리
 * - [] / null
 * - "[]" (문자열)
 * - '["Java","JS"]' (문자열)
 * - ["[]"] (배열인데 원소가 "[]")
 * - ["[\"Java\",\"JS\"]"] (배열인데 원소가 JSON 문자열)
 */
function normalizeTechTags(raw) {
  const out = [];

  const push = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return;

    const lower = s.toLowerCase();
    if (s === "[]" || lower === "null" || lower === "undefined") return;

    out.push(s);
  };

  const handle = (x) => {
    if (x == null) return;

    // 배열이면 flatten
    if (Array.isArray(x)) {
      x.forEach(handle);
      return;
    }

    // 문자열 처리
    if (typeof x === "string") {
      let s = x.trim();
      if (!s || s === "[]") return;

      // 1) 양끝 따옴표 제거( "...." or '....' )
      if (
        (s.startsWith('"') && s.endsWith('"')) ||
        (s.startsWith("'") && s.endsWith("'"))
      ) {
        s = s.slice(1, -1).trim();
      }

      // 2) 이스케이프 제거 ( \" -> " )
      s = s.replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
      if (!s || s === "[]") return;

      // 3) JSON 배열 문자열이면 파싱 시도
      if (s.startsWith("[") && s.endsWith("]")) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            parsed.forEach(handle);
            return;
          }
        } catch {
          // 파싱 실패면 bracket 제거 후 콤마 split
          const inner = s.slice(1, -1).trim();
          if (!inner) return;
          inner.split(",").map((v) => v.trim()).forEach(handle);
          return;
        }
      }

      // 4) 콤마로 이어진 문자열이면 분리
      if (s.includes(",")) {
        s.split(",").map((v) => v.trim()).forEach(handle);
        return;
      }

      // 5) 최종 토큰: 남아있는 따옴표/괄호 제거
      s = s.replace(/^\[|\]$/g, "").replace(/^["']|["']$/g, "").trim();
      push(s);
      return;
    }

    // 그 외 타입은 문자열화
    push(x);
  };

  handle(raw);

  // ✅ 최종 필터: 혹시 남은 '["Java"]' 같은 문자열도 한번 더 정리
  const cleaned = out
    .map((s) => s.replace(/^\[|\]$/g, "").replace(/"/g, "").replace(/'/g, "").trim())
    .filter((s) => s && s !== "[]");

  // ✅ 중복 제거
  return Array.from(new Set(cleaned));
}

function TopTabs({ value, onChange }) {
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

function PersonIcon() {
  return (
    <svg
      className="applicant-card__avatarSvg"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {/* head */}
      <circle cx="32" cy="22" r="12" fill="rgba(255,255,255,0.75)" />
      {/* shoulders */}
      <path
        d="M10 58c2-14 14-20 22-20s20 6 22 20"
        fill="rgba(255,255,255,0.55)"
      />
    </svg>
  );
}

function ApplicantCard({ item, onClick }) {
  const tags = normalizeTechTags(item.techStackTags);
  const tagsText = tags.length ? tags.join(" · ") : "";

  return (
    <button type="button" className="applicant-card" onClick={onClick}>
      <div className="applicant-card__left" aria-hidden="true">
        <div className="applicant-card__avatar">
          <PersonIcon />
        </div>
      </div>

      <div className="applicant-card__body">
        <div className="applicant-card__dept">{item.department || "학과"}</div>

        <div className="applicant-card__row">
          <div className="applicant-card__name">{item.name || "이름"}</div>
          <div className="applicant-card__date">{formatDate(item.appliedDate)}</div>
        </div>

        <div
          className={`applicant-card__tagsText ${tagsText ? "" : "is-empty"}`}
          aria-label="자신있는 분야"
        >
          {tagsText || "자신있는 분야 X"}
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

  const [tab, setTab] = useState("멋쟁이 사자");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    storage.setHasNewApplicants?.(false);
  }, []);

  useEffect(() => {
    let alive = true;

    const fetchList = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await api.get("/api/clubadmin/applications/summary");
        const arr = Array.isArray(res?.data) ? res.data : [];

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
                  onClick={() => navigate(`/mypage/applicants/${it.applicationId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}