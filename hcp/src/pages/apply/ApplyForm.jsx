// src/pages/apply/ApplyForm.jsx
import React, { useMemo, useState } from "react";
import "../../styles/apply/ApplicationFormPage.css"; // ✅ 기존 CSS 그대로 재사용

const STEPS = [
  { key: "name", title: "이름을 적어주세요.", sub: "지원자님의 이름을 적어주세요." },
  { key: "dept", title: "학과를 적어주세요.", sub: "" },
  { key: "contact", title: "연락처를 적어주세요.", sub: "학번도 적어주세요." },
  { key: "tech", title: "자신있는 분야 3가지", sub: "최소 3개 선택 가능해요" },
  { key: "part", title: "지원파트가 있을까요?", sub: "원하시는 파트를 선택해주세요" },
  { key: "motivation", title: "지원 계기가 뭔가요?", sub: "" },
];

// ✅ UI 라벨(띄어쓰기 포함 OK) — 전송할 때만 공백 제거하면 됨
const TECH_OPTIONS = [
  "GCP",
  "Google",
  "Figma",
  "Python",
  "C",
  "Redis",
  "TS",
  "AWS",
  "Git",
  "Java",
  "MySQL",
  "Adobe Illustrator",
  "Spring Boot",
  "JS",
];

const PART_OPTIONS = ["디자인", "백엔드", "프론트 엔드", "선택 미정"];

const normalizeTag = (s) => String(s || "").replace(/\s+/g, "");
const splitTechStack = (s) =>
  String(s || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

function StepHeader({ stepIndex, onPrev, onNext, canPrev, canNext }) {
  const progressPct = useMemo(() => {
    const total = STEPS.length;
    return total <= 1 ? 0 : (stepIndex / (total - 1)) * 100;
  }, [stepIndex]);

  return (
    <header className="apply-top">
      <button
        type="button"
        className={`apply-arrow ${canPrev ? "" : "is-disabled"}`}
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="이전 단계"
      >
        ‹
      </button>

      <div className="apply-progress" aria-label="진행도">
        <div className="apply-progress__track" />
        <div className="apply-progress__fill" style={{ width: `${progressPct}%` }} />
      </div>

      <button
        type="button"
        className={`apply-arrow ${canNext ? "" : "is-disabled"}`}
        onClick={onNext}
        disabled={!canNext}
        aria-label="다음 단계"
      >
        ›
      </button>
    </header>
  );
}

function Chip({ active, onClick, disabled, children }) {
  return (
    <button
      type="button"
      className={`apply-chip ${active ? "is-active" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* ✅ 아이콘은 네가 <img src={ICON}>로 교체할 슬롯 */}
      <span className="apply-chip__iconSlot" aria-hidden="true" />
      <span className="apply-chip__label">{children}</span>
    </button>
  );
}

export default function ApplyForm({
  mode = "write", // "write" | "read"
  value,
  onChange, // (patchObj) => void
  loading = false,
  errorMsg = "",
  onSubmit, // write에서만
  onClose, // read에서만
}) {
  const [step, setStep] = useState(0);

  const canPrev = step > 0;
  const canNext = step < STEPS.length - 1;

  const readOnly = mode === "read";

  const selectedTechRaw = useMemo(() => {
    // write: value.techTags 배열(라벨)
    // read: value.techStack 문자열 or value.techTags 배열(토큰)
    if (Array.isArray(value?.techTags)) return value.techTags;
    if (value?.techStack) return splitTechStack(value.techStack);
    return [];
  }, [value]);

  const selectedTechSet = useMemo(() => {
    return new Set(selectedTechRaw.map(normalizeTag));
  }, [selectedTechRaw]);

  const techOptionsUnion = useMemo(() => {
    const extras = selectedTechRaw.filter((t) => !TECH_OPTIONS.includes(t));
    return [...TECH_OPTIONS, ...extras];
  }, [selectedTechRaw]);

  const toggleTech = (label) => {
    if (readOnly) return;

    const norm = normalizeTag(label);
    const cur = Array.isArray(value?.techTags) ? value.techTags : [];
    const curSet = new Set(cur.map(normalizeTag));

    // 이미 선택됨 → 제거
    if (curSet.has(norm)) {
      const next = cur.filter((t) => normalizeTag(t) !== norm);
      onChange({ techTags: next });
      return;
    }

    // 최대 3개 제한
    if (cur.length >= 3) return;

    onChange({ techTags: [...cur, label] });
  };

  const goPrev = () => canPrev && setStep((v) => v - 1);
  const goNext = () => canNext && setStep((v) => v + 1);

  const footerBtnText = useMemo(() => {
    if (readOnly) return step < STEPS.length - 1 ? "다음" : "목록으로";
    return step < STEPS.length - 1 ? "다음" : "지원하기";
  }, [readOnly, step]);

  const onFooter = () => {
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }
    if (readOnly) {
      onClose?.();
      return;
    }
    onSubmit?.();
  };

  return (
    <div className="apply-page">
      <StepHeader
        stepIndex={step}
        onPrev={goPrev}
        onNext={goNext}
        canPrev={canPrev}
        canNext={canNext}
      />

      <div className="apply-body">
        <div className="apply-titleWrap">
          <div className="apply-title">{STEPS[step].title}</div>
          {STEPS[step].sub ? <div className="apply-sub">{STEPS[step].sub}</div> : null}
        </div>

        {loading ? (
          <div className="apply-msg">불러오는 중…</div>
        ) : errorMsg ? (
          <div className="apply-msg apply-msg--error">{errorMsg}</div>
        ) : (
          <>
            {/* 1) 이름 */}
            {step === 0 ? (
              <section className="apply-section" aria-label="이름">
                <input
                  className="apply-input"
                  value={value?.name || ""}
                  readOnly={readOnly}
                  onChange={(e) => onChange({ name: e.target.value })}
                />
                <div className="apply-underline" aria-hidden="true" />
              </section>
            ) : null}

            {/* 2) 학과 */}
            {step === 1 ? (
              <section className="apply-section" aria-label="학과">
                <input
                  className="apply-input apply-input--pill"
                  value={value?.department || ""}
                  readOnly={readOnly}
                  onChange={(e) => onChange({ department: e.target.value })}
                />
              </section>
            ) : null}

            {/* 3) 연락처 + 학번 */}
            {step === 2 ? (
              <section className="apply-section" aria-label="연락처 및 학번">
                <div className="apply-fieldGroup">
                  <div className="apply-fieldLabel">연락처</div>
                  <input
                    className="apply-input apply-input--pill"
                    value={value?.contact || ""}
                    readOnly={readOnly}
                    onChange={(e) => onChange({ contact: e.target.value })}
                    placeholder="010-1234-5678"
                  />
                </div>

                <div className="apply-fieldGroup">
                  <div className="apply-fieldLabel">학번</div>
                  <input
                    className="apply-input apply-input--pill"
                    value={value?.studentNo || ""}
                    readOnly={readOnly}
                    onChange={(e) => onChange({ studentNo: e.target.value })}
                  />
                </div>
              </section>
            ) : null}

            {/* 4) 자신있는 분야 3개 */}
            {step === 3 ? (
              <section className="apply-section" aria-label="자신있는 분야">
                <div className="apply-chipGrid" role="list">
                  {techOptionsUnion.map((label) => {
                    const active = selectedTechSet.has(normalizeTag(label));
                    return (
                      <Chip
                        key={label}
                        active={active}
                        disabled={readOnly}
                        onClick={() => toggleTech(label)}
                      >
                        {label}
                      </Chip>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {/* 5) 지원 파트 */}
            {step === 4 ? (
              <section className="apply-section" aria-label="지원 파트">
                <div className="apply-partList">
                  {PART_OPTIONS.map((label) => {
                    const active = (value?.applyPart || "") === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        className={`apply-partBtn ${active ? "is-active" : ""}`}
                        disabled={readOnly}
                        onClick={() => onChange({ applyPart: label })}
                      >
                        <span className="apply-partBtn__iconSlot" aria-hidden="true" />
                        <span className="apply-partBtn__label">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {/* 6) 지원 동기 */}
            {step === 5 ? (
              <section className="apply-section" aria-label="지원 동기">
                <textarea
                  className="apply-textarea"
                  value={value?.motivation || ""}
                  readOnly={readOnly}
                  onChange={(e) => onChange({ motivation: e.target.value })}
                  rows={10}
                />
              </section>
            ) : null}
          </>
        )}
      </div>

      <div className="apply-footer">
        <button type="button" className="apply-cta is-active" onClick={onFooter}>
          {footerBtnText}
        </button>
      </div>
    </div>
  );
}
