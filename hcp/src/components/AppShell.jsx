// src/components/AppShell.jsx
import React, { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import "../styles/layout/AppShell.css";

import Header from "./Header";
import Menu from "./Menu";

import nav1 from "../assets/nav/nav1.svg";
import nav2 from "../assets/nav/nav2.svg";
import nav3 from "../assets/nav/nav3.svg";

export default function AppShell() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // 안정적인 랜덤(리사이즈마다 같은 느낌 유지)
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

      // 별은 상단 위주로(산 영역은 비워두기)
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

        // 가끔 밝은 별 포인트
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
    ro.observe(canvas.parentElement);

    window.addEventListener("orientationchange", draw);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", draw);
    };
  }, []);

  return (
    <div className="app-shell">
      {/* ✅ 별(캔버스) */}
      <canvas ref={canvasRef} className="shell-stars" aria-hidden="true" />

      {/* ✅ 산 실루엣 */}
      <div className="shell-mountains" aria-hidden="true">
        <svg
          className="shell-mountains__svg"
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

      {/* ✅ 컨텐츠 레이어: 헤더 + 페이지 내용(Outlet) */}
      <div className="shell-content">
        <Header
          onSearch={() => console.log("search click")}
          onMenu={() => console.log("menu click")}
        />

        {/* ✅ Outlet을 고정 높이 영역(shell-main) 안에 가둠 */}
        <main className="shell-main">
          <Outlet />
        </main>
      </div>

      {/* ✅ 메뉴는 항상 유지 */}
      <Menu
        items={[
          { to: "/main", iconSrc: nav1, label: "메인" },
          { to: "/clubs", iconSrc: nav2, label: "동아리" },
          { to: "/mypage", iconSrc: nav3, label: "마이페이지" },
        ]}
      />
    </div>
  );
}
