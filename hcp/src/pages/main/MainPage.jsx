// src/pages/main/MainPage.jsx
import React, { useEffect, useRef, useState } from "react";
import "../../styles/main/MainPage.css";

import Header from "../../components/Header";
import Menu from "../../components/Menu";

export default function MainPage() {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

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
      const density = 1 / 9000; // 숫자 조절용 (작을수록 별 많아짐)
      const count = Math.max(40, Math.floor(cssW * starAreaH * density));

      const r = mulberry32(12345);

      for (let i = 0; i < count; i++) {
        const x = r() * cssW;
        const y = r() * starAreaH;

        const radius = 0.6 + r() * 1.2; // 0.6~1.8
        const alpha = 0.25 + r() * 0.65; // 0.25~0.9

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // 가끔 “밝은 별” 하나 더 (사진처럼 포인트)
        if (r() > 0.985) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,0.95)`;
          ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // 최초 1회 + 리사이즈 대응
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
    <div className="main-page">
      {/* 별(캔버스) */}
      <canvas ref={canvasRef} className="main-stars" aria-hidden="true" />

      {/* 산 실루엣 (SVG) */}
      <div className="main-mountains" aria-hidden="true">
        <svg
          className="main-mountains__svg"
          viewBox="0 0 430 932"
          preserveAspectRatio="none"
        >
          {/* 먼 산(어두운 그린/그레이) */}
          <path
            d="M0,690 C60,640 120,645 175,690 C230,735 290,775 430,720 L430,932 L0,932 Z"
            fill="#1C2B2A"
          />
          {/* 중간 산(그린) */}
          <path
            d="M0,760 C70,700 150,710 220,770 C285,825 330,845 430,810 L430,932 L0,932 Z"
            fill="#2E6B55"
            opacity="0.95"
          />
          {/* 앞 산(더 어두운 그린) */}
          <path
            d="M0,820 C90,780 190,790 255,840 C315,885 350,900 430,875 L430,932 L0,932 Z"
            fill="#2B3C33"
          />
          {/* 하단 바닥(아주 어두운) */}
          <path d="M0,880 L430,880 L430,932 L0,932 Z" fill="#243229" />
        </svg>
      </div>

      {/* ✅ 컨텐츠 레이어(헤더를 페이지 안쪽으로) */}
      <div className="main-content">
        <Header
          onSearch={() => {
            // TODO: 검색 페이지 이동
            console.log("search click");
          }}
          onMenu={() => {
            // TODO: 햄버거 메뉴 열기
            console.log("menu click");
          }}
        />

        {/* 여기부터 메인 컨텐츠를 쌓아가면 됨 */}
        {/* 예: <div className="main-center-card" /> */}
      </div>

      {/* ✅ 하단 메뉴바 */}
      <Menu
        active={activeTab}
        onChange={(idx) => {
          setActiveTab(idx);
          // TODO: 탭별 라우팅/동작 연결
          console.log("tab:", idx);
        }}
      />
    </div>
  );
}
