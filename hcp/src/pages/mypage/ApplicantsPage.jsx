import React, { useEffect, useMemo, useState } from "react";
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
  const tabs = ["멋쟁이 사자"]; // ✅ 동아리 1개 고정
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

      {/* ✅ 본문 텍스트 시작점 통일: body의 padding-left로 기준선 고정 */}
      <div className="applicant-card__body">
        <div className="applicant-card__dept">{item.department || "학과"}</div>

        <div className="applicant-card__row">
          <div className="applicant-card__name">{item.name || "이름"}</div>
          <div className="applicant-card__date">{formatDate(item.appliedDate)}</div>
        </div>

        {tagsText ? (
          <div className="applicant-card__tagsText" aria-label="기술스택">
            {tagsText}
          </div>
        ) : null}
      </div>

      <div className="applicant-card__right" aria-hidden="true">
        <span className="applicant-card__chev">›</span>
      </div>
    </button>
  );
}

export default function ApplicantsPage() {
  const [tab, setTab] = useState("멋쟁이 사자");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ 더미 데이터 30개(스크롤 테스트용)
  const dummyList = useMemo(() => {
    const base = [
      {
        name: "김형석",
        department: "항공소프트웨어공학과",
        techStackTags: ["Java", "Spring", "Boot", "JPA", "MySQL"],
      },
      {
        name: "홍길동",
        department: "컴퓨터공학과",
        techStackTags: ["React", "TypeScript", "CSS", "Figma"],
      },
      {
        name: "이몽룡",
        department: "항공전자공학과",
        techStackTags: ["Python", "OpenCV", "YOLO", "Docker"],
      },
      {
        name: "성춘향",
        department: "경영학과",
        techStackTags: ["Notion", "Excel", "PPT", "Communication"],
      },
      {
        name: "임꺽정",
        department: "기계공학과",
        techStackTags: ["C", "C++", "ROS", "Embedded", "Linux", "Git"],
      },
    ];

    const out = [];
    for (let i = 0; i < 30; i++) {
      const b = base[i % base.length];
      const day = String(10 + (i % 18)).padStart(2, "0"); // 10~27
      out.push({
        applicationId: i + 1,
        name: `${b.name}${i + 1}`,
        department: b.department,
        appliedDate: `2026-02-${day}`,
        techStackTags: b.techStackTags,
      });
    }
    return out;
  }, []);

  useEffect(() => {
    if (storage.setHasNewApplicants) storage.setHasNewApplicants(false);
  }, []);

  useEffect(() => {
    // ✅ 레이아웃 확인: 더미 데이터 사용
    setList(dummyList);
    setLoading(false);
    setErrorMsg("");

    /*
    // ✅ 백엔드 연동 시 (배포 전 주석 해제)
    const fetchList = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
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
    */
  }, [dummyList]);

  const filtered = useMemo(() => list, [list]); // 동아리 1개라 필터 없음

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
                    // 상세 페이지 연결 예정
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
