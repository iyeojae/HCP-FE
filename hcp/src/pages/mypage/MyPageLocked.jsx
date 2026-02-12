import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/mypage/MyPageLocked.css";

import { storage } from "../../utils/storage";

export default function MyPageLocked() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = storage.isAdmin?.() || false;

  // ✅ 렌더 중 navigate 금지 → useEffect로 이동
  useEffect(() => {
    if (isAdmin) navigate("/mypage", { replace: true });
  }, [isAdmin, navigate]);

  const from = location.state?.from;

  // admin이면 위 useEffect가 이동시킬 예정이니, 잠깐 null 처리
  if (isAdmin) return null;

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
