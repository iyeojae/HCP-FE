// src/App.js
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/Router";
import "./styles/globals.css"; // ✅ index.js 안 건드리니 전역 CSS는 App에서 로드

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
