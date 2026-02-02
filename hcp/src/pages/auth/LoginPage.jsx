import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { storage } from "../../utils/storage";
import "../../styles/auth/LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 별 캔버스
  const canvasRef = useRef(null);

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

  const loginPath = "/auth/login";

  // ✅ AppShell과 동일한 별 찍기 로직 (산 없음)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const mulberry32 = (seed) => () => {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      // AppShell과 동일: 상단 위주로 별 (산이 없더라도 “동일한 느낌” 유지)
      const starAreaH = cssH * 0.72;
      const density = 1 / 9000;
      const count = Math.max(40, Math.floor(cssW * starAreaH * density));

      const r = mulberry32(12345);

      for (let i = 0; i < count; i++) {
        const x = r() * cssW;
        const y = r() * starAreaH;

        const radius = 0.6 + r() * 1.2;
        const alpha = 0.25 + r() * 0.65;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (r() > 0.985) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,0.95)`;
          ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    draw();

    const ro = new ResizeObserver(() => draw());
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    window.addEventListener("orientationchange", draw);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", draw);
    };
  }, []);

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
      navigate("/main", { replace: true });
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
      {/* ✅ 배경 별 캔버스(추가) */}
      <canvas ref={canvasRef} className="login-stars" aria-hidden="true" />

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
