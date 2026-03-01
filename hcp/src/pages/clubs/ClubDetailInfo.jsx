// src/pages/clubs/ClubDetailInfo.jsx
import React from "react";

export default function ClubDetailInfo({ tab, setTab, introduction, interviewProcess }) {
  const isIntro = tab === "INTRO";

  return (
    <section className="clubDetail-info">
      <div className="clubDetail-tabs" role="tablist" aria-label="상세 탭">
        <button
          type="button"
          className={`clubDetail-tab ${isIntro ? "active" : ""}`}
          onClick={() => setTab("INTRO")}
          role="tab"
          aria-selected={isIntro}
        >
          소개 글
        </button>
        <button
          type="button"
          className={`clubDetail-tab ${!isIntro ? "active" : ""}`}
          onClick={() => setTab("PROCESS")}
          role="tab"
          aria-selected={!isIntro}
        >
          모집절차
        </button>
      </div>

      <div className="clubDetail-card">
        <div className="clubDetail-cardTitle">{isIntro ? "동아리 소개&설명" : "모집 절차"}</div>

        <div className="clubDetail-cardBody">
          {isIntro ? (
            introduction ? (
              <pre className="clubDetail-pre">{introduction}</pre>
            ) : (
              <div className="clubDetail-empty">소개글이 없습니다.</div>
            )
          ) : interviewProcess ? (
            <pre className="clubDetail-pre">{interviewProcess}</pre>
          ) : (
            <div className="clubDetail-empty">모집절차가 없습니다.</div>
          )}
        </div>
      </div>
    </section>
  );
}