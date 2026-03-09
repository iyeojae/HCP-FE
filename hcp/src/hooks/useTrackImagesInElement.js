import { useEffect, useRef, useState } from "react";

export function useTrackImagesInElement(
  rootSelector,
  { ignoreLazy = true, maxWaitMs = 8000 } = {}
) {
  const [pendingImages, setPendingImages] = useState(0);

  // ✅ 이미지별 완료 상태를 기록 (WeakMap: 메모리 안전)
  const statusRef = useRef(new WeakMap()); // img -> { done:boolean }
  const timersRef = useRef(new WeakMap()); // img -> timeoutId
  const trackedRef = useRef(new WeakSet()); // 이벤트 중복 등록 방지

  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    let alive = true;

    const cleanupTimer = (img) => {
      const t = timersRef.current.get(img);
      if (t) clearTimeout(t);
      timersRef.current.delete(img);
    };

    const markDone = (img) => {
      if (!alive || !img) return;

      const prev = statusRef.current.get(img) || { done: false };
      if (prev.done) return;

      statusRef.current.set(img, { done: true });
      cleanupTimer(img);
    };

    const isTrackTarget = (img) => {
      if (!img) return false;

      // ✅ lazy는 아직 요청이 안 들어갈 수 있어 무한 대기 위험 → 옵션으로 제어
      if (ignoreLazy && img.loading === "lazy") return false;

      const src = img.currentSrc || img.src;
      if (!src) return false;

      return true;
    };

    const ensureListeners = (img) => {
      if (!img || trackedRef.current.has(img)) return;
      trackedRef.current.add(img);

      const onDone = () => {
        if (!alive) return;
        markDone(img);
        // ✅ DOM/이미지 상태가 바뀐 직후 재계산
        requestAnimationFrame(update);
      };

      img.addEventListener("load", onDone, { once: true });
      img.addEventListener("error", onDone, { once: true });

      // ✅ safety: 이벤트가 절대 안 오는 케이스 대비
      const timerId = setTimeout(() => {
        if (!alive) return;
        markDone(img);
        requestAnimationFrame(update);
      }, maxWaitMs);

      timersRef.current.set(img, timerId);
    };

    const update = () => {
      if (!alive) return;

      const imgs = Array.from(root.querySelectorAll("img")).filter(isTrackTarget);

      // ✅ 현재 목록에 없는 이미지들은 굳이 건드릴 필요 없지만,
      //    pending 계산은 "현재 imgs"만을 기준으로 함.
      let pending = 0;

      imgs.forEach((img) => {
        ensureListeners(img);

        // ✅ 이미 완전 로드된 경우 즉시 done 처리
        if (img.complete && img.naturalWidth > 0) {
          markDone(img);
        }

        const st = statusRef.current.get(img);
        const done = st?.done === true;

        // ✅ done이 아니면 pending
        if (!done) pending += 1;
      });

      setPendingImages(pending);
    };

    update();

    const mo = new MutationObserver(() => update());
    mo.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      // ✅ 필요 속성만 감시(과도한 update 방지)
      attributeFilter: ["src", "srcset", "loading"],
    });

    return () => {
      alive = false;
      mo.disconnect();

      // ✅ 남은 타이머 정리
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = new WeakMap();
      statusRef.current = new WeakMap();
      trackedRef.current = new WeakSet();

      setPendingImages(0);
    };
  }, [rootSelector, ignoreLazy, maxWaitMs]);

  return pendingImages;
}