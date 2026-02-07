import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import MobileAppLayout from "../components/layout/MobileAppLayout";
import SlideOverlay from "../components/transition/SlideOverlay";

import SplashPage from "../pages/splash/SplashPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupVerifyPage from "../pages/auth/SignupVerifyPage";
import SignupStep2Page from "../pages/auth/SignupStep2Page";

import ProtectedRoute from "./ProtectedRoute";
import AppShell from "../components/AppShell";

// ✅ 중요 페이지(껍데기 안에 들어갈 페이지들)
import MainPage from "../pages/main/MainPage";
import ClubsPage from "../pages/clubs/ClubsPage"; // ✅ 추가

// ✅ 임시 페이지(파일 추가 없이 Router에서만 임시로 처리)
function TempPage({ title }) {
  return (
    <div style={{ padding: "18px 20px" }}>
      <div
        style={{
          borderRadius: 14,
          padding: "18px 16px",
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          color: "#fff",
          fontWeight: 700,
        }}
      >
        {title} (임시 페이지)
      </div>
    </div>
  );
}

export default function Router() {
  const location = useLocation();

  const baseLocation = location.state?.backgroundLocation;
  const prevOverlayLocation = location.state?.prevOverlayLocation;

  return (
    <MobileAppLayout>
      {/* 1) 바닥(일반 라우트 + 보호 라우트) */}
      <Routes location={baseLocation || location}>
        {/* Public */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ✅ Protected App 영역 (배경/헤더/메뉴 고정) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/main" element={<MainPage />} />
            <Route path="/clubs" element={<ClubsPage />} /> {/* ✅ 교체 */}
            <Route path="/mypage" element={<TempPage title="마이페이지" />} />
          </Route>
        </Route>

        {/* signup (public) */}
        <Route path="/signup" element={<SignupVerifyPage />} />
        <Route path="/signup/step2" element={<SignupStep2Page />} />
      </Routes>

      {/* 2) Step1 정적 오버레이 유지 */}
      {prevOverlayLocation ? (
        <Routes
          location={prevOverlayLocation}
          key={`prev-${prevOverlayLocation.key}`}
        >
          <Route
            path="/signup"
            element={
              <SlideOverlay animated={false}>
                <SignupVerifyPage />
              </SlideOverlay>
            }
          />
        </Routes>
      ) : null}

      {/* 3) 현재 오버레이(애니메이션) */}
      <AnimatePresence initial={false}>
        {baseLocation ? (
          <Routes location={location} key={`cur-${location.key}`}>
            <Route
              path="/signup"
              element={
                <SlideOverlay>
                  <SignupVerifyPage />
                </SlideOverlay>
              }
            />
            <Route
              path="/signup/step2"
              element={
                <SlideOverlay>
                  <SignupStep2Page />
                </SlideOverlay>
              }
            />
          </Routes>
        ) : null}
      </AnimatePresence>
    </MobileAppLayout>
  );
}
