import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import MobileAppLayout from "../components/layout/MobileAppLayout";
import SlideOverlay from "../components/transition/SlideOverlay";

import SplashPage from "../pages/splash/SplashPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupVerifyPage from "../pages/auth/SignupVerifyPage";
import SignupStep2Page from "../pages/auth/SignupStep2Page";

import ProtectedRoute from "./ProtectedRoute";
import AppShell from "../components/AppShell";

import MainPage from "../pages/main/MainPage";
import ClubsPage from "../pages/clubs/ClubsPage";

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
      <Routes location={baseLocation || location}>
        {/* ✅ 첫 진입 스플래시 유지 */}
        <Route path="/" element={<SplashPage />} />

        {/* ✅ 너가 만든 "시작하기" 화면(현재 LoginPage)을 /login에 유지 */}
        <Route path="/login" element={<LoginPage />} />

        {/* ✅ (선택) 스플래시를 별도 주소로도 접근 가능하게 두고 싶다면 유지 */}
        <Route path="/splash" element={<SplashPage />} />

        {/* ✅ Protected App 영역 */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/main" element={<MainPage />} />
            <Route path="/clubs" element={<ClubsPage />} />
            <Route path="/mypage" element={<TempPage title="마이페이지" />} />
          </Route>
        </Route>

        {/* signup (public) */}
        <Route path="/signup" element={<SignupVerifyPage />} />
        <Route path="/signup/step2" element={<SignupStep2Page />} />

        {/* 기타 잘못된 경로는 스플래시로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
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
