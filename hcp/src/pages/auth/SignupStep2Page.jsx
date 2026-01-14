import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import api from "../../api/axios";
import AppHeader from "../../components/common/AppHeader";
import AlertModal from "../../components/common/AlertModal";
import "../../styles/auth/SignupStep2Page.css";

export default function SignupStep2Page() {
  const navigate = useNavigate();
  const location = useLocation();

  const draft = location.state?.draft || {}; // Step1에서 넘어온 값
  const [loginId, setLoginId] = useState(""); // 화면상 "이메일" 입력칸 → API의 loginId로 매핑
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [doneOpen, setDoneOpen] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      loginId.trim().length > 0 &&
      code.trim().length > 0 &&
      pw.trim().length > 0 &&
      pw2.trim().length > 0 &&
      pw === pw2 &&
      !submitting
    );
  }, [loginId, code, pw, pw2, submitting]);

  const handleRequestCode = () => {
    // ✅ API 아직 없으므로 틀만
    alert("인증번호 API는 추후 연결 예정입니다.");
  };

  const handleSignup = async () => {
    if (!canSubmit) return;
    setErrorMsg("");

    // Step1 값이 없으면 가입 불가(직접 접근/새로고침 방지)
    if (!draft?.name || !draft?.studentNo || !draft?.department) {
      setErrorMsg("이전 단계 정보가 없습니다. 처음부터 다시 진행해 주세요.");
      return;
    }

    // ✅ 현재는 API 호출이 원활하지 않으므로 "무조건 성공" 처리
    // (나중에 배포되면 아래 주석 해제하고 try/catch 로 바꾸면 됨)
    setSubmitting(true);
    setDoneOpen(true);
    setSubmitting(false);

    /*
    try {
      setSubmitting(true);

      await api.post("/auth/signup", {
        loginId: loginId.trim(),
        password: pw.trim(),
        studentNo: draft.studentNo.trim(),
        name: draft.name.trim(),
        department: draft.department.trim(),
      });

      setDoneOpen(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
    */
  };

  const handleDoneClose = () => {
    setDoneOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="su2-page">
      <AppHeader title="회원가입" />

      <div className="su2-content">
        <div className="su2-form">
          {/* 이메일 + 인증하기 */}
          <div className="su2-row">
            <label className="su2-field">
              <span className="su2-label">이메일</span>
              <input
                className="su2-input"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="su2-verify-btn"
              onClick={handleRequestCode}
            >
              인증하기
            </button>
          </div>

          <div className="su2-hint">버튼 누르면 인증번호가 날아오게할 예정임</div>

          <label className="su2-field">
            <span className="su2-label">인증코드 작성칸</span>
            <input
              className="su2-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>

          <label className="su2-field">
            <span className="su2-label">비밀번호</span>
            <input
              className="su2-input"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </label>

          <label className="su2-field">
            <span className="su2-label">비밀번호 확인</span>
            <input
              className="su2-input"
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
            />
          </label>

          {pw2.length > 0 && pw !== pw2 ? (
            <div className="su2-error">비밀번호가 일치하지 않습니다.</div>
          ) : null}

          {errorMsg ? <div className="su2-error">{errorMsg}</div> : null}
        </div>
      </div>

      <div className="su2-footer">
        <button
          type="button"
          className={`su2-submit ${canSubmit ? "active" : ""}`}
          disabled={!canSubmit}
          onClick={handleSignup}
        >
          {submitting ? "처리중..." : "로그인 하러 가기"}
        </button>

        <div className="su2-footer-note">누르면 회원가입으로 이어짐</div>
      </div>

      <AlertModal
        open={doneOpen}
        title="회원가입 완료!"
        buttonText="확인"
        onClose={handleDoneClose}
      />
    </div>
  );
}
