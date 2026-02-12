// src/routes/Router.jsx
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import MobileAppLayout from "../components/layout/MobileAppLayout";
import SlideOverlay from "../components/transition/SlideOverlay";

import SplashPage from "../pages/splash/SplashPage";
import LoginPage from "../pages/auth/LoginPage";
import AdminLoginPage from "../pages/auth/AdminLoginPage";

import SignupVerifyPage from "../pages/auth/SignupVerifyPage";
import SignupStep2Page from "../pages/auth/SignupStep2Page";

import AppShell from "../components/AppShell";
import AdminRoute from "./AdminRoute";

import MainPage from "../pages/main/MainPage";
import ClubsPage from "../pages/clubs/ClubsPage";

// ✅ 추가
import MyPageLocked from "../pages/mypage/MyPageLocked";

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
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/splash" element={<SplashPage />} />

        {/* ✅ 관리자 로그인도 AppShell 배경은 유지, 단 헤더/메뉴만 숨김 */}
        <Route element={<AppShell showHeader={false} showMenu={false} />}>
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* ✅ 게스트도 접근 가능한 공개 App 영역 */}
        <Route element={<AppShell />}>
          <Route path="/main" element={<MainPage />} />
          <Route path="/clubs" element={<ClubsPage />} />

          {/* ✅ 잠김 안내 페이지(게스트용) */}
          <Route path="/mypage/locked" element={<MyPageLocked />} />

          {/* ✅ 마이페이지는 ADMIN만 */}
          <Route
            path="/mypage"
            element={
              <AdminRoute guestFallbackPath="/mypage/locked">
                <TempPage title="마이페이지" />
              </AdminRoute>
            }
          />
        </Route>

        {/* signup (public) */}
        <Route path="/signup" element={<SignupVerifyPage />} />
        <Route path="/signup/step2" element={<SignupStep2Page />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 2) Step1 정적 오버레이 유지 */}
      {prevOverlayLocation ? (
        <Routes location={prevOverlayLocation} key={`prev-${prevOverlayLocation.key}`}>
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
