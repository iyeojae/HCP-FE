import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import MobileAppLayout from "../components/layout/MobileAppLayout";
import SlideOverlay from "../components/transition/SlideOverlay";

import SplashPage from "../pages/splash/SplashPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupVerifyPage from "../pages/auth/SignupVerifyPage";
import SignupStep2Page from "../pages/auth/SignupStep2Page";

export default function Router() {
  const location = useLocation();

  const baseLocation = location.state?.backgroundLocation;      // 로그인(바닥)
  const prevOverlayLocation = location.state?.prevOverlayLocation; // Step1(한 장 아래)

  return (
    <MobileAppLayout>
      {/* 1) 바닥(로그인 등) */}
      <Routes location={baseLocation || location}>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* 직접 접근 대비 */}
        <Route path="/signup" element={<SignupVerifyPage />} />
        <Route path="/signup/step2" element={<SignupStep2Page />} />
      </Routes>

      {/* 2) Step1을 "정적 오버레이"로 유지 (Step2에서만 존재) */}
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

      {/* 3) 현재 오버레이(애니메이션): Step1 또는 Step2 */}
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
