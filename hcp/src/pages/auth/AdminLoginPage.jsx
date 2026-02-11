import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth/AdminLoginPage.css";

import api from "../../api/axios";
import AdminIcon from "../../assets/auth/admin.svg";

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="admin-eyeSvg">
      <path
        d="M2.1 12.1C3.9 7.9 7.6 5 12 5c4.4 0 8.1 2.9 9.9 7.1.1.2.1.5 0 .7C20.1 17.1 16.4 20 12 20c-4.4 0-8.1-2.9-9.9-7.1a.8.8 0 0 1 0-.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="admin-eyeSvg">
      <path
        d="M2.1 12.1C3.9 7.9 7.6 5 12 5c4.4 0 8.1 2.9 9.9 7.1.1.2.1.5 0 .7C20.1 17.1 16.4 20 12 20c-4.4 0-8.1-2.9-9.9-7.1a.8.8 0 0 1 0-.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4 4l16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = useMemo(() => {
    return loginId.trim() && password.trim() && !submitting;
  }, [loginId, password, submitting]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const id = loginId.trim();
    const pw = password.trim();

    // ✅ 더미 요구사항
    if (id === "test1234" && pw === "test1234") {
      localStorage.setItem("accessToken", "DUMMY_TOKEN");
      localStorage.setItem("role", "ADMIN");
      navigate("/main", { replace: true });
      return;
    }

    try {
      setSubmitting(true);

      /*
      ✅ 백엔드 로그인 API
      POST http://localhost:8080/api/auth/login
      Body(JSON):
      {
        "loginId": "202200020",
        "password": "test1234"
      }
      */

      const res = await api.post("/auth/login", { loginId: id, password: pw });
      const data = res?.data || {};

      if (data?.accessToken) localStorage.setItem("accessToken", data.accessToken);
      if (data?.role) localStorage.setItem("role", data.role);
      if (data?.loginId) localStorage.setItem("loginId", data.loginId);
      if (data?.userId != null) localStorage.setItem("userId", String(data.userId));

      navigate("/main", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "로그인에 실패했습니다.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* ✅ 상단 아이콘(요청대로 크기 업 / admin.svg) */}
      <div className="admin-login-topIcons" aria-hidden="true">
        <div className="admin-login-topIcons__dot">
          <img src={AdminIcon} alt="" aria-hidden="true" />
        </div>
      </div>

      <form className="admin-login-card" onSubmit={onSubmit} aria-label="관리자 로그인">
        <div className="admin-field">
          <div className="admin-field__row">
            <label className="admin-field__label" htmlFor="admin-loginId">
              이메일
            </label>

            <button
              type="button"
              className="admin-field__ghostBtn"
              onClick={() => {
                // ✅ 나중에 인증번호 전송/인증 흐름 붙일 자리(UI만)
              }}
            >
              인증번호 전송
            </button>
          </div>

          <input
            id="admin-loginId"
            className="admin-field__input"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="test1234"
            autoComplete="username"
          />
          <div className="admin-field__underline" aria-hidden="true" />
        </div>

        <div className="admin-field">
          <div className="admin-field__row">
            <label className="admin-field__label" htmlFor="admin-password">
              비밀번호
            </label>

            <button
              type="button"
              className="admin-field__eyeBtn"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>

          <input
            id="admin-password"
            className="admin-field__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="test1234"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
          />
          <div className="admin-field__underline" aria-hidden="true" />
        </div>

        <button
          type="submit"
          className={`admin-login-btn ${canSubmit ? "is-active" : ""}`}
          disabled={!canSubmit}
        >
          {submitting ? "로그인 중..." : "로그인"}
        </button>

        {errorMsg ? <div className="admin-login-error">{errorMsg}</div> : null}
      </form>

      <button
        type="button"
        className="admin-login-back"
        onClick={() => navigate("/login", { replace: true })}
      >
        ← 시작 화면으로
      </button>
    </div>
  );
}
