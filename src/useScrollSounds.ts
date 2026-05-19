import { useEffect, type ReactNode } from "react";
import { playScrollAmbient, primeAudioContext } from "./typingSound";

/** Wheel delta before one ambient tick (trackpad-friendly). */
const WHEEL_DELTA_THRESHOLD = 14;
/** Scroll position delta before one ambient tick (touch / scrollbar). */
const SCROLL_DELTA_THRESHOLD = 12;

function getScrollY(): number {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

export function useScrollSounds(): void {
  useEffect(() => {
    let wheelAccum = 0;
    let scrollAccum = 0;
    let lastScrollY = getScrollY();

    const tick = (direction: "up" | "down") => {
      playScrollAmbient(direction);
    };

    const onWheel = (event: WheelEvent) => {
      const delta = event.deltaY;
      if (delta === 0) return;

      wheelAccum += Math.abs(delta);
      if (wheelAccum < WHEEL_DELTA_THRESHOLD) return;
      wheelAccum = 0;

      tick(delta > 0 ? "down" : "up");
    };

    const onScroll = () => {
      const y = getScrollY();
      const delta = y - lastScrollY;
      lastScrollY = y;
      if (delta === 0) return;

      scrollAccum += Math.abs(delta);
      if (scrollAccum < SCROLL_DELTA_THRESHOLD) return;
      scrollAccum = 0;

      tick(delta > 0 ? "down" : "up");
    };

    const prime = () => primeAudioContext();

    window.addEventListener("wheel", onWheel, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("pointerdown", prime, { passive: true });
    window.addEventListener("keydown", prime, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
    };
  }, []);
}

export function GlobalScrollSounds({ children }: { children: ReactNode }) {
  useScrollSounds();
  return children;
}
