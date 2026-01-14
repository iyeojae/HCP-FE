import React from "react";
import { Routes, Route } from "react-router-dom";

import MobileAppLayout from "../components/layout/MobileAppLayout";
import SplashPage from "../pages/splash/SplashPage";
import LoginPage from "../pages/auth/LoginPage";

export default function Router() {
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

      <Route
        path="/login"
        element={
          <MobileAppLayout>
            <LoginPage />
          </MobileAppLayout>
        }
      />
    </Routes>
  );
}
