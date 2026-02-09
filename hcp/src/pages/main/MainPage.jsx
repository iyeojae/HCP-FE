import React, { useEffect, useState } from "react";
import "../../styles/main/MainPage.css";
import AlertModal from "../../components/common/AlertModal";

export default function MainPage() {
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ 메인 페이지 들어오면 자동으로 모달 띄움
  useEffect(() => {
    setModalOpen(true);
  }, []);

  return (
    <>
      {/* ✅ 모달 제외하고 "메인 박스"만 더 흐릿하게 */}
      <div className="main-page-content">
        <div
          className={`main-center-panel ${modalOpen ? "is-blurred" : ""}`}
          aria-label="메인 중앙 영역"
          aria-hidden={modalOpen}
        />
      </div>

      {/* ✅ 사진 느낌(아이콘 + 글래스)로 쓰고 싶으면 variant="glass" + showIcon */}
      <AlertModal
        open={modalOpen}
        variant="glass"
        showIcon
        title={
          <>
            아직 오픈기간이 아니기 때문에
            <br />
            지금은 정보를 확인할 수 없습니다.
          </>
        }
        buttonText="확인"
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
