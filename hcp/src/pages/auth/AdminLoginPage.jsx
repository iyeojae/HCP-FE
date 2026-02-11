import React, { useEffect, useMemo, useRef, useState } from "react";
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

  // ✅ AppShell 느낌 그대로: 별 캔버스
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const mulberry32 = (seed) => () => {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      // AppShell과 동일 컨셉: 상단 위주로 별
      const starAreaH = cssH * 0.72;
      const density = 1 / 9000;
      const count = Math.max(40, Math.floor(cssW * starAreaH * density));

      const r = mulberry32(12345);

      for (let i = 0; i < count; i++) {
        const x = r() * cssW;
        const y = r() * starAreaH;

        const radius = 0.6 + r() * 1.2;
        const alpha = 0.25 + r() * 0.65;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (r() > 0.985) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,0.95)`;
          ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    draw();

    const ro = new ResizeObserver(() => draw());
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    window.addEventListener("orientationchange", draw);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", draw);
    };
  }, []);

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
      {/* ✅ 별 */}
      <canvas ref={canvasRef} className="admin-login-stars" aria-hidden="true" />

      {/* ✅ 산 (AppShell과 동일) */}
      <div className="admin-login-mountains" aria-hidden="true">
        <svg
          className="admin-login-mountains__svg"
          viewBox="0 0 430 932"
          preserveAspectRatio="none"
        >
          <path
            d="M0,690 C60,640 120,645 175,690 C230,735 290,775 430,720 L430,932 L0,932 Z"
            fill="#1C2B2A"
          />
          <path
            d="M0,760 C70,700 150,710 220,770 C285,825 330,845 430,810 L430,932 L0,932 Z"
            fill="#2E6B55"
            opacity="0.95"
          />
          <path
            d="M0,820 C90,780 190,790 255,840 C315,885 350,900 430,875 L430,932 L0,932 Z"
            fill="#2B3C33"
          />
          <path d="M0,880 L430,880 L430,932 L0,932 Z" fill="#243229" />
        </svg>
      </div>

      {/* ✅ 실제 콘텐츠 레이어 */}
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
    </div>
  );
}
