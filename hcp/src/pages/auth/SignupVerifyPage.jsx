import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../../components/common/AppHeader";
import "../../styles/auth/SignupVerifyPage.css";

export default function SignupVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [department, setDepartment] = useState("");

  const canNext = useMemo(() => {
    return (
      name.trim().length > 0 &&
      nickname.trim().length > 0 &&
      studentNo.trim().length > 0 &&
      department.trim().length > 0
    );
  }, [name, nickname, studentNo, department]);

  const handleNext = () => {
    if (!canNext) return;

    navigate("/signup/step2", {
      state: {
        backgroundLocation: location, // ✅ Step2가 Step1 위로 오버레이
        draft: { name, nickname, studentNo, department },
      },
    });
  };

  return (
    <div className="sv-page">
      <AppHeader title="회원가입" />

      <div className="sv-content">
        <div className="sv-title">
          <p>
            가입을 위한 정보를
            <br />
            입력해주세요
          </p>
        </div>

        <div className="sv-form">
          <label className="sv-field">
            <span className="sv-label">이름</span>
            <input
              className="sv-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="sv-field">
            <span className="sv-label">닉네임</span>
            <input
              className="sv-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </label>

          <label className="sv-field">
            <span className="sv-label">학번</span>
            <input
              className="sv-input"
              value={studentNo}
              onChange={(e) => setStudentNo(e.target.value)}
              inputMode="numeric"
            />
          </label>

          <label className="sv-field">
            <span className="sv-label">학과</span>
            <input
              className="sv-input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="sv-footer">
        <button
          type="button"
          className={`sv-next ${canNext ? "active" : ""}`}
          disabled={!canNext}
          onClick={handleNext}
        >
          다음
        </button>
      </div>
    </div>
  );
}
