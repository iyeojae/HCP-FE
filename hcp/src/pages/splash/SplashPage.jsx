// src/pages/splash/SplashPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/splash/SplashPage.css";

// 실제 로고 파일이 준비되면 아래를 사용하세요.
// import Logo from "../../assets/logo.svg";

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // 다음 페이지가 생기면 여기서 분기:
    // - accessToken 존재하면 메인으로
    // - 없으면 로그인으로
    const t = setTimeout(() => {
      // navigate("/login"); // 예시
    }, 900);

    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="splash">
      <div className="splash-center">
        <div className="logo-circle" aria-label="logo">
          {/* 로고 이미지 사용 시 */}
          {/* <img src={Logo} alt="logo" className="logo-img" /> */}
          <span className="logo-text">logo</span>
        </div>
      </div>
    </div>
  );
}
