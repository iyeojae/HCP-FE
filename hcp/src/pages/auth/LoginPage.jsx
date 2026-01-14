import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { storage } from "../../utils/storage";
import "../../styles/auth/LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [studentNo, setStudentNo] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = useMemo(() => {
    return (
      studentNo.trim().length > 0 &&
      password.trim().length > 0 &&
      !submitting
    );
  }, [studentNo, password, submitting]);

  // ✅ baseURL이 http://localhost:8080/api 로 고정이라면, 경로는 항상 아래처럼 쓰면 됩니다.
  const loginPath = "/auth/login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const sn = studentNo.trim();
    const pw = password.trim();

    if (!sn || !pw) {
      setErrorMsg("학번(아이디)과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.post(loginPath, {
        studentNo: sn,
        password: pw,
      });

      const data = res?.data ?? {};

      // 1) 바디에서 토큰 찾기
      let token =
        data.accessToken ||
        data.token ||
        data.access_token ||
        data?.data?.accessToken ||
        data?.result?.accessToken ||
        null;

      // 2) 헤더에서 토큰 찾기(Authorization: Bearer xxx 형태)
      const authHeader =
        res?.headers?.authorization || res?.headers?.Authorization || null;
      if (!token && authHeader && typeof authHeader === "string") {
        token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7)
          : authHeader;
      }

      // 3) 유저 정보(선택)
      const user =
        data.user ||
        data.member ||
        data?.data?.user ||
        data?.result?.user ||
        null;

      if (token) {
        storage.setAccessToken(token);
      } else {
        console.warn(
          "Login succeeded but accessToken not found in response. Check backend response.",
          data
        );
      }

      if (user) storage.setUser(user);
      else storage.setUser({ studentNo: sn });

      // 다음 페이지는 추후 메인 라우트로 교체
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "로그인에 실패했습니다. 학번/비밀번호를 확인해 주세요.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* 상단 로고 영역(틀만) */}
      <div className="login-brand">
        <div className="login-brand-box" aria-label="로고 영역">
          로고나 브랜드 또는
          <br />
          아이콘 캐릭터
        </div>
      </div>

      {/* 입력/버튼 */}
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          placeholder="Id"
          value={studentNo}
          onChange={(e) => setStudentNo(e.target.value)}
          autoComplete="username"
        />

        <input
          className="login-input"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          type="submit"
          className={`login-button ${canSubmit ? "active" : ""}`}
          disabled={!canSubmit}
        >
          {submitting ? "Loading..." : "Login"}
        </button>

        {errorMsg ? <div className="login-error">{errorMsg}</div> : null}

        {/* 비밀번호 찾기 | 회원가입 */}
        <div className="login-links">
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/find-password")}
          >
            비밀번호 찾기
          </button>

          <div className="link-divider" aria-hidden="true" />

          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/signup")}
          >
            회원가입
          </button>
        </div>
      </form>

      {/* 간편 로그인 버튼(틀만) */}
      <div className="login-easy">
        <button type="button" className="easy-login-btn" onClick={() => {}}>
          간편 로그인 네이버,구글 ...
        </button>
      </div>
    </div>
  );
}
