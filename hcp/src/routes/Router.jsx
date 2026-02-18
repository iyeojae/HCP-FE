// src/routes/Router.jsx (핵심만 반영한 전체 교체본)
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

import MyPageLocked from "../pages/mypage/MyPageLocked";
import MyPage from "../pages/mypage/MyPage";
import ApplicantsPage from "../pages/mypage/ApplicantsPage";

// ✅ 지원서 양식/열람 (파일명 단순화)
import ApplyWrite from "../pages/apply/ApplyWrite";
import ApplyRead from "../pages/apply/ApplyRead";

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

        {/* ✅ 배경만(헤더/메뉴 없음): 관리자 로그인 + 지원서(작성/열람) */}
        <Route element={<AppShell showHeader={false} showMenu={false} />}>
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ✅ 지원자 작성용(비회원 가능) */}
          <Route path="/clubs/apply" element={<ApplyWrite />} />

          {/* ✅ 관리자 열람용(ADMIN만) */}
          <Route
            path="/mypage/applicants/:applicationId"
            element={
              <AdminRoute guestFallbackPath="/mypage/locked">
                <ApplyRead />
              </AdminRoute>
            }
          />
        </Route>

        {/* ✅ 일반 App 영역(헤더/메뉴 있음) */}
        <Route element={<AppShell />}>
          <Route path="/main" element={<MainPage />} />
          <Route path="/clubs" element={<ClubsPage />} />

          <Route path="/mypage/locked" element={<MyPageLocked />} />

          <Route
            path="/mypage"
            element={
              <AdminRoute guestFallbackPath="/mypage/locked">
                <MyPage />
              </AdminRoute>
            }
          />

          <Route
            path="/mypage/intro"
            element={
              <AdminRoute guestFallbackPath="/mypage/locked">
                <TempPage title="소개글 입력" />
              </AdminRoute>
            }
          />

          <Route
            path="/mypage/applicants"
            element={
              <AdminRoute guestFallbackPath="/mypage/locked">
                <ApplicantsPage />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="/signup" element={<SignupVerifyPage />} />
        <Route path="/signup/step2" element={<SignupStep2Page />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

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
