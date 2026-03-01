// src/pages/apply/ApplyForm.jsx
import React, { useMemo, useState } from "react";
import "../../styles/apply/ApplicationFormPage.css";

// ✅ tech 아이콘들
import IconAdobe from "../../assets/apply/adobe.svg";
import IconAws from "../../assets/apply/aws.svg";
import IconC from "../../assets/apply/c.svg";
import IconFigma from "../../assets/apply/figma.svg";
import IconGcp from "../../assets/apply/gcp.svg";
import IconGit from "../../assets/apply/git.svg";
import IconJava from "../../assets/apply/java.svg";
import IconJs from "../../assets/apply/js.svg";
import IconMysql from "../../assets/apply/mysql.svg";
import IconPython from "../../assets/apply/python.svg";
import IconRedis from "../../assets/apply/redis.svg";
import IconTs from "../../assets/apply/ts.svg";

// ✅ part 아이콘들
import IconDesign from "../../assets/apply/design.svg";
import IconBackend from "../../assets/apply/backend.svg";
import IconFrontend from "../../assets/apply/frontend.svg";
import IconNoChoice from "../../assets/apply/nochoice.svg";

const STEPS = [
  { key: "name", title: "이름을 적어주세요.", sub: "지원자님의 이름을 적어주세요." },
  { key: "dept", title: "학과를 적어주세요.", sub: "" },
  { key: "contact", title: "연락처를 적어주세요.", sub: "학번도 적어주세요." },
  { key: "tech", title: "자신있는 분야 3가지", sub: "최대 3개 선택 가능해요 (선택 안 해도 돼요)" },
  { key: "part", title: "지원파트가 있을까요?", sub: "원하시는 파트를 선택해주세요" },
  { key: "motivation", title: "지원 계기가 뭔가요?", sub: "" },
];

const TECH_OPTIONS = [
  "GCP",
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
  "JS",
];

const PART_OPTIONS = ["디자인", "백엔드", "프론트 엔드", "선택 미정"];

const TECH_ICON_MAP = {
  GCP: IconGcp,
  Figma: IconFigma,
  Python: IconPython,
  C: IconC,
  Redis: IconRedis,
  TS: IconTs,
  AWS: IconAws,
  Git: IconGit,
  Java: IconJava,
  MySQL: IconMysql,
  "Adobe Illustrator": IconAdobe,
  JS: IconJs,
};

const PART_ICON_MAP = {
  디자인: IconDesign,
  백엔드: IconBackend,
  "프론트 엔드": IconFrontend,
  "선택 미정": IconNoChoice,
};

const normalizeTag = (s) => String(s || "").replace(/\s+/g, "");
const splitTechStack = (s) =>
  String(s || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const digitsOnly = (s) => String(s || "").replace(/[^\d]/g, "");

function contactToRest(contact) {
  const d = digitsOnly(contact);
  const rest = (d.startsWith("010") ? d.slice(3) : d).slice(0, 8);
  if (!rest) return "";
  if (rest.length <= 4) return rest;
  return `${rest.slice(0, 4)}-${rest.slice(4)}`;
}

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

function Chip({ active, onClick, disabled, label, iconSrc }) {
  return (
    <button
      type="button"
      className={`apply-chip ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="apply-chip__iconSlot" aria-hidden="true">
        {iconSrc ? <img className="apply-chip__iconImg" src={iconSrc} alt="" aria-hidden="true" /> : null}
      </span>
      <span className="apply-chip__label">{label}</span>
    </button>
  );
}

export default function ApplyForm({
  mode = "write",
  value,
  onChange,
  loading = false,
  errorMsg = "",
  onSubmit,
  onClose,
}) {
  const [step, setStep] = useState(0);
  const readOnly = mode === "read";

  // ✅ read: value.techTags(배열) 우선 사용 (우리가 판단해서 넘김)
  // ✅ fallback: techStack 문자열
  const selectedTechRaw = useMemo(() => {
    if (Array.isArray(value?.techTags)) return value.techTags;
    if (value?.techStack) return splitTechStack(value.techStack);
    return [];
  }, [value]);

  const selectedTechSet = useMemo(
    () => new Set(selectedTechRaw.map(normalizeTag)),
    [selectedTechRaw]
  );

  const isStepValid = useMemo(() => {
    if (readOnly) return () => true;

    return (s) => {
      if (s === 0) return !!(value?.name || "").trim();
      if (s === 1) return !!(value?.department || "").trim();

      if (s === 2) {
        const contactDigits = digitsOnly(value?.contact || "");
        const studentNoOk = !!String(value?.studentNo || "").trim();
        return contactDigits.length === 11 && studentNoOk;
      }

      if (s === 3) return true; // ✅ 0~3개 허용
      if (s === 4) return !!(value?.applyPart || "").trim();
      if (s === 5) return !!(value?.motivation || "").trim();
      return true;
    };
  }, [readOnly, value]);

  const canPrev = !loading && step > 0;
  const canNext = !loading && step < STEPS.length - 1 && isStepValid(step);

  const toggleTech = (label) => {
    if (readOnly) return;

    const norm = normalizeTag(label);
    const cur = Array.isArray(value?.techTags) ? value.techTags : [];
    const curSet = new Set(cur.map(normalizeTag));

    if (curSet.has(norm)) {
      onChange({ techTags: cur.filter((t) => normalizeTag(t) !== norm) });
      return;
    }

    if (cur.length >= 3) return; // ✅ 최대 3개
    onChange({ techTags: [...cur, label] });
  };

  const goPrev = () => canPrev && setStep((v) => v - 1);
  const goNext = () => canNext && setStep((v) => v + 1);

  const footerBtnText = useMemo(() => {
    if (readOnly) return step < STEPS.length - 1 ? "다음" : "목록으로";
    return step < STEPS.length - 1 ? "다음" : "지원하기";
  }, [readOnly, step]);

  const footerEnabled = useMemo(() => {
    if (loading) return false;
    if (readOnly) return true;
    if (step < STEPS.length - 1) return isStepValid(step);
    return isStepValid(5);
  }, [loading, readOnly, step, isStepValid]);

  const onFooter = () => {
    if (!footerEnabled) return;
    if (step < STEPS.length - 1) return goNext();
    if (readOnly) return onClose?.();
    return onSubmit?.();
  };

  const contactRest = useMemo(() => contactToRest(value?.contact || ""), [value?.contact]);

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

            {step === 2 ? (
              <section className="apply-section" aria-label="연락처 및 학번">
                <div className="apply-fieldGroup">
                  <div className="apply-fieldLabel">연락처</div>

                  <div className="apply-contactRow">
                    <div className="apply-contactPrefix" aria-label="010 고정">
                      010
                    </div>

                    <input
                      className="apply-input apply-input--pill apply-contactInput"
                      value={contactRest}
                      readOnly={readOnly}
                      onChange={(e) => onChange({ contact: e.target.value })}
                      placeholder="1234-5678"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div className="apply-fieldGroup">
                  <div className="apply-fieldLabel">학번</div>
                  <input
                    className="apply-input apply-input--pill"
                    value={value?.studentNo || ""}
                    readOnly={readOnly}
                    onChange={(e) => onChange({ studentNo: e.target.value })}
                    inputMode="numeric"
                  />
                </div>

                {!readOnly ? (
                  <div className="apply-hint">※ 연락처는 010을 제외한 8자리만 입력하면 됩니다.</div>
                ) : null}
              </section>
            ) : null}

            {step === 3 ? (
              <section className="apply-section" aria-label="자신있는 분야">
                <div className="apply-chipGrid" role="list">
                  {TECH_OPTIONS.map((label) => {
                    const active = selectedTechSet.has(normalizeTag(label));
                    const limitReached = !readOnly && selectedTechRaw.length >= 3 && !active;

                    return (
                      <Chip
                        key={label}
                        label={label}
                        iconSrc={TECH_ICON_MAP[label]}
                        active={active}
                        disabled={readOnly || limitReached}
                        onClick={() => toggleTech(label)}
                      />
                    );
                  })}
                </div>

                {!readOnly ? <div className="apply-hint">선택됨: {selectedTechRaw.length} / 3</div> : null}
              </section>
            ) : null}

            {step === 4 ? (
              <section className="apply-section" aria-label="지원 파트">
                <div className="apply-partList">
                  {PART_OPTIONS.map((label) => {
                    const active = (value?.applyPart || "") === label;
                    const iconSrc = PART_ICON_MAP[label];

                    return (
                      <button
                        key={label}
                        type="button"
                        className={`apply-partBtn ${active ? "is-active" : ""}`}
                        disabled={readOnly}
                        onClick={() => onChange({ applyPart: label })}
                      >
                        <span className="apply-partBtn__iconSlot" aria-hidden="true">
                          {iconSrc ? (
                            <img className="apply-partBtn__iconImg" src={iconSrc} alt="" aria-hidden="true" />
                          ) : null}
                        </span>
                        <span className="apply-partBtn__label">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

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
        <button
          type="button"
          className={`apply-cta ${footerEnabled ? "is-active" : ""}`}
          onClick={onFooter}
          disabled={!footerEnabled}
        >
          {footerBtnText}
        </button>
      </div>
    </div>
  );
}