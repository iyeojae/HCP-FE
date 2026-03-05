import { useEffect, useState } from "react";

export function useTrackImagesInElement(rootSelector) {
  const [pendingImages, setPendingImages] = useState(0);

  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    let alive = true;
    const tracked = new WeakSet();

    const isTrackTarget = (img) => {
      if (!img) return false;
      const src = img.currentSrc || img.src;
      if (!src) return false;
      // lazy는 아직 요청 안 들어갈 수 있어서 전역 로더가 무한 대기할 수 있음
      if (img.loading === "lazy") return false;
      return true;
    };

    const update = () => {
      if (!alive) return;
      const imgs = Array.from(root.querySelectorAll("img")).filter(isTrackTarget);

      let pending = 0;

      imgs.forEach((img) => {
        if (!tracked.has(img)) {
          tracked.add(img);

          const onDone = () => {
            if (!alive) return;
            requestAnimationFrame(update);
          };

          img.addEventListener("load", onDone, { once: true });
          img.addEventListener("error", onDone, { once: true });
        }

        if (!img.complete) pending += 1;
      });

      setPendingImages(pending);
    };

    update();

    const mo = new MutationObserver(() => update());
    mo.observe(root, { childList: true, subtree: true, attributes: true });

    return () => {
      alive = false;
      mo.disconnect();
    };
  }, [rootSelector]);

  return pendingImages;
}