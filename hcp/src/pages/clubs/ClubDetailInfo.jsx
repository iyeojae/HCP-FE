// src/pages/club/ClubDetailInfo.jsx
import React from "react";

export default function ClubDetailInfo({
  activeTab,
  onChangeTab,
  introduction,
  interviewProcess,
}) {
  const isIntro = activeTab === "INTRO";

  return (
    <div className="clubD-infoWrap">
      <div className="clubD-tabs" role="tablist" aria-label="상세 탭">
        <button
          type="button"
          className={`clubD-tab ${isIntro ? "active" : ""}`}
          onClick={() => onChangeTab("INTRO")}
          role="tab"
          aria-selected={isIntro}
        >
          소개 글
        </button>
        <button
          type="button"
          className={`clubD-tab ${!isIntro ? "active" : ""}`}
          onClick={() => onChangeTab("PROCESS")}
          role="tab"
          aria-selected={!isIntro}
        >
          모집절차
        </button>
      </div>

      <div className="clubD-card">
        <div className="clubD-cardTitle">{isIntro ? "동아리 소개&설명" : "모집 절차"}</div>

        <div className="clubD-cardBody">
          {isIntro ? (
            introduction ? (
              <pre className="clubD-pre">{introduction}</pre>
            ) : (
              <div className="clubD-empty">소개글이 없습니다.</div>
            )
          ) : interviewProcess ? (
            <pre className="clubD-pre">{interviewProcess}</pre>
          ) : (
            <div className="clubD-empty">모집절차가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}