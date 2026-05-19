import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "./useDarkMode";

const POKEBALL_SRC = "/assets/pokeballs/pokeball.png";

const SCROLL_ROTATION_PER_PX = 0.45;
const WHEEL_ROTATION_SCALE = 0.22;

function getScrollY(): number {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

export function FloatingPokeball() {
  const { activeEeveelutionPalette } = useTheme();
  const visible = activeEeveelutionPalette != null;
  const ballRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const lastScrollYRef = useRef(getScrollY());

  const applyRotation = useCallback(() => {
    const el = ballRef.current;
    if (!el) return;
    el.style.transform = `rotate(${rotationRef.current}deg)`;
  }, []);

  useEffect(() => {
    if (!visible) return;

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return;
      rotationRef.current += event.deltaY * WHEEL_ROTATION_SCALE;
      applyRotation();
    };

    const onScroll = () => {
      const y = getScrollY();
      const delta = y - lastScrollYRef.current;
      lastScrollYRef.current = y;
      if (delta === 0) return;
      rotationRef.current += delta * SCROLL_ROTATION_PER_PX;
      applyRotation();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [visible, applyRotation]);

  if (!visible) return null;

  return (
    <div
      ref={ballRef}
      className="pointer-events-none fixed right-3 top-3 z-[60] size-11 sm:right-4 sm:top-4 sm:size-12"
      aria-hidden
    >
      <img
        src={POKEBALL_SRC}
        alt=""
        className="size-full object-contain"
        draggable={false}
      />
    </div>
  );
}
