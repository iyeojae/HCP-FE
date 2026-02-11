import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { storage } from "../../utils/storage";
import "../../styles/auth/LoginForm.css";

function safeMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "로그인에 실패했습니다."
  );
}

export default function LoginForm() {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = useMemo(() => {
    return loginId.trim().length > 0 && password.trim().length > 0 && !submitting;
  }, [loginId, password, submitting]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const id = loginId.trim();
    const pw = password.trim();

    if (!id || !pw) return;

    // ✅ 더미(원하면 유지): 둘 다 test1234면 바로 통과
    if (id === "test1234" && pw === "test1234") {
      storage.setAccessToken?.("DUMMY_ACCESS_TOKEN");
      storage.setUser?.({ userId: 0, role: "ADMIN", loginId: "test1234" });
      navigate("/main", { replace: true });
      return;
    }

    try {
      setSubmitting(true);

      // ✅ 실제 로그인 API (Postman 스펙 반영)
      // POST http://localhost:8080/api/auth/login
      // body: { loginId, password }
      const res = await api.post("/auth/login", {
        loginId: id,
        password: pw,
      });

      const data = res?.data ?? {};
      const token = data.accessToken || null;

      if (token) storage.setAccessToken?.(token);
      storage.setUser?.({
        userId: data.userId,
        role: data.role,
        loginId: data.loginId ?? id,
      });

      // ✅ 로그인 성공 후 이동(원하면 /mypage로 바꿔도 됨)
      navigate("/main", { replace: true });
    } catch (err) {
      setErrorMsg(safeMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-login-form" onSubmit={onSubmit}>
      <div className="auth-field">
        <div className="auth-field__labelRow">
          <span className="auth-field__label">아이디</span>
        </div>

        <input
          className="auth-field__input"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="loginId"
          autoComplete="username"
        />
        <div className="auth-field__underline" aria-hidden="true" />
      </div>

      <div className="auth-field">
        <div className="auth-field__labelRow">
          <span className="auth-field__label">비밀번호</span>
        </div>

        <div className="auth-pwRow">
          <input
            className="auth-field__input auth-pwRow__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
          />

          <button
            type="button"
            className="auth-pwRow__eye"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {showPw ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="auth-field__underline" aria-hidden="true" />
      </div>

      <button type="submit" className={`auth-loginBtn ${canSubmit ? "is-active" : ""}`} disabled={!canSubmit}>
        {submitting ? "Loading..." : "로그인"}
      </button>

      {errorMsg ? <div className="auth-error">{errorMsg}</div> : null}
    </form>
  );
}
