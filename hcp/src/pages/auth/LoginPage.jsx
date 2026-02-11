import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth/LoginPage.css";

import LogoImg from "../../assets/logo2.svg";

// ✅ 너가 나중에 넣을 관리자 SVG (경로만 맞춰서 교체하면 됨)
import AdminIcon from "../../assets/auth/admin.svg";

export default function LoginPage() {
  const navigate = useNavigate();
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

      const starAreaH = cssH * 0.78;
      const density = 1 / 8500;
      const count = Math.max(45, Math.floor(cssW * starAreaH * density));

      const r = mulberry32(12345);

      for (let i = 0; i < count; i++) {
        const x = r() * cssW;
        const y = r() * starAreaH;

        const radius = 0.6 + r() * 1.25;
        const alpha = 0.22 + r() * 0.62;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (r() > 0.985) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,0.92)`;
          ctx.arc(x, y, radius * 1.75, 0, Math.PI * 2);
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

  const onStart = () => {
    navigate("/main", { replace: true });
  };

  // ✅ 관리자 로그인 이동
  const onAdminLogin = () => {
    navigate("/admin/login");
  };

  return (
    <div className="login-page">
      <canvas ref={canvasRef} className="login-stars" aria-hidden="true" />

      <div className="login-content">
        <div className="login-hero" aria-label="시작 화면">
          <img src={LogoImg} alt="서비스 로고" className="login-logoImg" />

          <div className="login-copy">
            <h1 className="login-title">원하는 동아리에 지금 지원해보세요</h1>
            <p className="login-subtitle">이곳은 한서 동아리 플랫폼입니다.</p>
          </div>
        </div>

        <div className="login-cta">
          <button type="button" className="start-button" onClick={onStart}>
            시작하기
          </button>
        </div>
      </div>

      {/* ✅ 우측 하단 관리자 진입 SVG 버튼 */}
      <button
        type="button"
        className="login-adminBtn"
        onClick={onAdminLogin}
        aria-label="관리자 로그인"
      >
        <img src={AdminIcon} alt="" aria-hidden="true" className="login-adminIcon" />
      </button>
    </div>
  );
}
