// src/routes/AppRouter.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import MobileAppLayout from "../components/layout/MobileAppLayout";
import SplashPage from "../pages/splash/SplashPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MobileAppLayout>
            <SplashPage />
          </MobileAppLayout>
        }
      />

      {/* 관리자 라우트는 추후 /admin/* 로 분리 */}
      {/* <Route path="/admin/*" element={<AdminLayout>...</AdminLayout>} /> */}
    </Routes>
  );
}
