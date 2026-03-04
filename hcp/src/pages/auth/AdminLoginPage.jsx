// src/pages/auth/AdminLoginPage.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/auth/AdminLoginPage.css";

import api from "../../api/axios";
import { storage } from "../../utils/storage";

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
  const location = useLocation();

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
    if (!canSubmit) return;

    setErrorMsg("");

    const id = loginId.trim();
    const pw = password.trim();

    try {
      setSubmitting(true);

      // ✅ baseURL 기준: /auth/login (중복 /api 제거)
      const res = await api.post("/api/auth/login", { loginId: id, password: pw });
      const data = res?.data || {};

      storage.clearAuth?.();

      // ✅ 단일키(hcp.auth)로 바꿨다면 setAuth 사용 가능
      if (storage.setAuth) {
        storage.setAuth({
          accessToken: data?.accessToken || "",
          role: data?.role || "",
          loginId: data?.loginId || "",
          userId: data?.userId ?? null,
          adminName: data?.adminName || "",
          adminDept: data?.adminDept || "",
        });
      } else {
        if (data?.accessToken) storage.setAccessToken?.(data.accessToken);
        if (data?.role) storage.setRole?.(data.role);
        if (data?.loginId) storage.setLoginId?.(data.loginId);
        if (data?.userId != null) storage.setUserId?.(data.userId);
      }

      const redirectTo = location.state?.from?.pathname || "/main";
      navigate(redirectTo, { replace: true });
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
      <div className="admin-login-content">
        <div className="admin-login-topIcons" aria-hidden="true">
          <div className="admin-login-topIcons__dot">
            <img src={AdminIcon} alt="" aria-hidden="true" />
          </div>
        </div>

        <form className="admin-login-card" onSubmit={onSubmit} aria-label="관리자 로그인">
          <div className="admin-field">
            <div className="admin-field__row">
              <label className="admin-field__label" htmlFor="admin-loginId">
                로그인 ID
              </label>
            </div>

            <input
              id="admin-loginId"
              className="admin-field__input"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="이메일 주소"
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
              placeholder="비밀번호"
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
    </div>
  );
}