import React, { useEffect, useRef, useState } from "react";
import "./GlobalLoaderOverlay.css";
import WifiLoader from "./WifiLoader";

const FADE_MS = 220; // CSS transition 시간과 맞춰야 함

export default function GlobalLoaderOverlay({ open, minDurationMs = 1000 }) {
  const [mounted, setMounted] = useState(false); // DOM에 렌더링 여부
  const [visible, setVisible] = useState(false); // 애니메이션(opacity) 상태

  const openedAtRef = useRef(0);
  const hideTimerRef = useRef(null);
  const unmountTimerRef = useRef(null);

  const clearTimers = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (unmountTimerRef.current) {
      clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }
  };

  useEffect(() => {
    clearTimers();

    if (open) {
      // ✅ 즉시 mount → 다음 프레임에 visible로 전환(transition 트리거)
      openedAtRef.current = Date.now();
      setMounted(true);

      // mounted 직후 바로 visible=true하면 transition이 안 먹는 경우가 있어서 rAF 사용
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    // open=false: 최소 표시시간 채운 뒤 fade-out → unmount
    if (!mounted) return;

    const elapsed = Date.now() - openedAtRef.current;
    const remain = Math.max(0, minDurationMs - elapsed);

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      unmountTimerRef.current = setTimeout(() => {
        setMounted(false);
      }, FADE_MS);
    }, remain);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, minDurationMs]);

  useEffect(() => clearTimers, []);

  if (!mounted) return null;

  return (
    <div
      className={`globalLoaderOverlay ${visible ? "is-visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="globalLoaderOverlay__center">
        <WifiLoader />
      </div>
    </div>
  );
}