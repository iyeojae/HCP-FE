// src/pages/mypage/MyPageLocked.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/mypage/MyPageLocked.css";

export default function MyPageLocked() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = useMemo(() => {
    const role = (localStorage.getItem("role") || "").toUpperCase().trim();
    const token = localStorage.getItem("accessToken");
    return role === "ADMIN" && !!token;
  }, [location.key]);

  // ✅ 혹시 admin인데 /mypage/locked로 오면 바로 /mypage로 보내버림
  if (isAdmin) {
    navigate("/mypage", { replace: true });
    return null;
  }

  const from = location.state?.from;

  return (
    <div className="mypage-locked">
      <div className="mypage-locked__card" role="status" aria-live="polite">
        <div className="mypage-locked__icon" aria-hidden="true">
          🔒
        </div>

        <div className="mypage-locked__title">마이페이지는 잠겨있어요</div>
        <div className="mypage-locked__desc">
          비회원은 마이페이지를 사용할 수 없습니다.
          <br />
          관리자 로그인 후 이용할 수 있어요.
        </div>

        <div className="mypage-locked__actions">
          <button
            type="button"
            className="mypage-locked__btn mypage-locked__btn--primary"
            onClick={() =>
              navigate("/admin/login", {
                state: { from: from || { pathname: "/mypage" } },
              })
            }
          >
            관리자 로그인
          </button>

          <button
            type="button"
            className="mypage-locked__btn"
            onClick={() => navigate("/main", { replace: true })}
          >
            메인으로
          </button>

          <button
            type="button"
            className="mypage-locked__btn mypage-locked__btn--ghost"
            onClick={() => navigate("/clubs")}
          >
            동아리 보러가기
          </button>
        </div>
      </div>
    </div>
  );
}
