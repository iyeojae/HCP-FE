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
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <MobileAppLayout>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupVerifyPage />} />
        <Route path="/signup/step2" element={<SignupStep2Page />} />
      </Routes>

      <AnimatePresence mode="wait">
        {backgroundLocation ? (
          <Routes location={location} key={location.key}>
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
