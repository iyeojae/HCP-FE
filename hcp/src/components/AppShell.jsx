import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../styles/layout/AppShell.css";

import Header from "./Header";
import Menu from "./Menu";

import nav1 from "../assets/nav/nav1.svg";
import nav2 from "../assets/nav/nav2.svg";
import nav3 from "../assets/nav/nav3.svg";

import { storage } from "../utils/storage";

/** ✅ 전역 로더 */
import GlobalLoaderOverlay from "./common/GlobalLoaderOverlay";
import { globalLoaderStore } from "../utils/globalLoaderStore";
import { useTrackImagesInElement } from "../hooks/useTrackImagesInElement";

export default function AppShell({ showHeader = true, showMenu = true }) {
  const canvasRef = useRef(null);
  const location = useLocation();

  const isAdmin = storage.isAdmin?.() || false;

  const isMyPage = location.pathname.startsWith("/mypage");
  const lockMyPageScroll = isMyPage && !isAdmin;

  const [pendingApi, setPendingApi] = useState(globalLoaderStore.get());
  useEffect(() => globalLoaderStore.subscribe(setPendingApi), []);

  const pendingImgs = useTrackImagesInElement(".shell-main");

  const isLogin = location.pathname.startsWith("/login");
  const isAdminLogin = location.pathname.startsWith("/admin/login");
  const isMain = location.pathname.startsWith("/main");
  const isAssetGateRoute = isLogin || isAdminLogin || isMain;

  const [routeHold, setRouteHold] = useState(false);
  const [svgScanned, setSvgScanned] = useState(false);
  const [pendingLocalSvg, setPendingLocalSvg] = useState(0);
  const trackedRef = useRef(new WeakSet());

  useEffect(() => {
    if (isAssetGateRoute) {
      setRouteHold(true);
      setSvgScanned(false);
      setPendingLocalSvg(0);
      trackedRef.current = new WeakSet();
    } else {
      setRouteHold(false);
    }
  }, [isAssetGateRoute, location.pathname]);

  useEffect(() => {
    if (!isAssetGateRoute) return;

    const root = document.querySelector(".shell-main");
    if (!root) return;

    let alive = true;

    const isLocalSvg = (img) => {
      const src = img?.currentSrc || img?.src || "";
      if (!src) return false;
      if (src.startsWith("data:")) return false;

      try {
        const u = new URL(src, window.location.href);
        if (u.origin !== window.location.origin) return false;
        return u.pathname.toLowerCase().endsWith(".svg");
      } catch {
        return String(src).toLowerCase().includes(".svg");
      }
    };

    const update = () => {
      if (!alive) return;

      const imgs = Array.from(root.querySelectorAll("img")).filter(isLocalSvg);
      let p = 0;

      imgs.forEach((img) => {
        if (!trackedRef.current.has(img)) {
          trackedRef.current.add(img);

          const onDone = () => {
            if (!alive) return;
            requestAnimationFrame(update);
          };

          img.addEventListener("load", onDone, { once: true });
          img.addEventListener("error", onDone, { once: true });
        }

        if (!img.complete) p += 1;
      });

      setSvgScanned(true);
      setPendingLocalSvg(p);
    };

    update();

    const mo = new MutationObserver(() => update());
    mo.observe(root, { childList: true, subtree: true, attributes: true });

    return () => {
      alive = false;
      mo.disconnect();
    };
  }, [isAssetGateRoute, location.pathname]);

  useEffect(() => {
    if (!isAssetGateRoute) return;

    if (svgScanned && pendingLocalSvg === 0) {
      requestAnimationFrame(() => setRouteHold(false));
    } else {
      setRouteHold(true);
    }
  }, [isAssetGateRoute, svgScanned, pendingLocalSvg]);

  const loaderOpen = isAssetGateRoute
    ? routeHold || !svgScanned || pendingLocalSvg > 0
    : pendingApi > 0 || pendingImgs > 0;

  const menuItems = useMemo(() => {
    return [
      { to: "/main", iconSrc: nav2, label: "메인" },
      { to: "/clubs", iconSrc: nav3, label: "목록" },
      {
        to: "/mypage",
        iconSrc: nav1,
        label: "마이페이지",
        disabled: !isAdmin,
        disabledMessage: "관리자만 접근 가능한 마이페이지입니다.",
      },
    ];
  }, [isAdmin]);

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

  const shellClassName = [
    "app-shell",
    showMenu ? "" : "app-shell--noMenu",
    lockMyPageScroll ? "app-shell--lockMyPageScroll" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName}>
      <GlobalLoaderOverlay open={loaderOpen} />

      {/* ✅ 배경만 따로 래핑 */}
      <div className="shell-bg" aria-hidden="true">
        <canvas ref={canvasRef} className="shell-stars" />

        <div className="shell-mountains">
          <svg className="shell-mountains__svg" viewBox="0 0 430 932" preserveAspectRatio="none">
            <path
              d="M431.252 6.06578C475.286 -17.5493 470.568 33.4572 462.705 61.9123L431.252 539L-99.0898 547.776C59.3427 377.046 387.217 29.6809 431.252 6.06578Z"
              fill="#28392F"
              opacity="0.95"
            />
            <path
              d="M40.7955 191.233C8.0994 1.79653 -98.0249 -11.5919 -147 5.39343V598.881H146.851C125.122 541.93 73.4915 380.67 40.7955 191.233Z"
              fill="#3C4A42"
            />
            <path
              d="M351.655 290.293C286.309 429.881 81.5774 530.116 42.2458 571.731C2.91408 613.346 -60.7617 745.806 -60.7617 745.806H495V0C474.445 38.6028 417.001 150.705 351.655 290.293Z"
              fill="#3C6C54"
            />
            <path d="M0,880 L430,880 L430,932 L0,932 Z" fill="#243229" />
          </svg>
        </div>
      </div>

      <div className="shell-content">
        {showHeader ? <Header /> : null}

        <main className="shell-main">
          <Outlet />
        </main>
      </div>

      {showMenu ? <Menu items={menuItems} /> : null}
    </div>
  );
}