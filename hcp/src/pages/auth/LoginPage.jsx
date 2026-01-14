import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { storage } from "../../utils/storage";
import "../../styles/auth/LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

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

  // baseURL이 http://localhost:8080/api 라면 항상 이 경로 사용
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

    // ✅ 더미 로그인
    if (sn === "test1234" && pw === "test1234") {
      storage.setAccessToken("DUMMY_ACCESS_TOKEN");
      storage.setUser({ loginId: "test1234", studentNo: "test1234" });
      navigate("/", { replace: true });
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.post(loginPath, {
        studentNo: sn,
        password: pw,
      });

      const data = res?.data ?? {};

      let token =
        data.accessToken ||
        data.token ||
        data.access_token ||
        data?.data?.accessToken ||
        data?.result?.accessToken ||
        null;

      const authHeader =
        res?.headers?.authorization || res?.headers?.Authorization || null;
      if (!token && authHeader && typeof authHeader === "string") {
        token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7)
          : authHeader;
      }

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
      <div className="login-brand">
        <div className="login-brand-box" aria-label="로고 영역">
          로고나 브랜드 또는<br />아이콘 캐릭터
        </div>
      </div>

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
            // ✅ 오버레이 슬라이드용 backgroundLocation 전달
            onClick={() =>
              navigate("/signup", { state: { backgroundLocation: location } })
            }
          >
            회원가입
          </button>
        </div>
      </form>

      <div className="login-easy">
        <button type="button" className="easy-login-btn" onClick={() => {}}>
          간편 로그인 네이버,구글 ...
        </button>
      </div>
    </div>
  );
}
