import React, { useMemo } from "react";
import "../../styles/main/MainPage.css";
import AlertModal from "../../components/common/AlertModal";

export default function MainPage() {
  // ✅ 상시 표시 (개발자가 나중에 false로 바꾸면 됨)
  const modalOpen = true;

  const title = useMemo(
    () => (
      <>
        아직 오픈기간이 아니기 때문에
        <br />
        지금은 정보를 확인할 수 없습니다.
      </>
    ),
    []
  );

  return (
    <>
      <div className="main-page-content">
        {/* ✅ 블러는 회색 상자만 */}
        <div
          className={`main-center-panel ${modalOpen ? "is-blurred" : ""}`}
          aria-label="메인 중앙 영역"
          aria-hidden={modalOpen}
        />
      </div>

      <AlertModal
        open={modalOpen}
        variant="glass"
        showIcon
        hideButton      // ✅ 버튼 제거
        lock            // ✅ overlay 클릭으로 닫히지 않게
        title={title}
      />
    </>
  );
}
