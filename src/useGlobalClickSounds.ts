import { useEffect, type ReactNode } from "react";
import { playUIClickFromUserGesture, primeAudioContext } from "./typingSound";

const CLICKABLE_SELECTOR = [
  "button:not(:disabled)",
  'a[href]:not([href=""])',
  '[role="button"]:not([aria-disabled="true"])',
  'input[type="button"]:not(:disabled)',
  'input[type="submit"]:not(:disabled)',
  'input[type="checkbox"]',
  'input[type="radio"]',
  "select",
  "summary",
  "label[for]",
  "[onclick]",
  '[tabindex="0"]',
].join(", ");

function findClickableElement(target: Element): Element | null {
  if (target.closest("[data-no-click-sound]")) return null;
  if (target.closest("[data-typewriter-accelerate]")) return null;
  return target.closest(CLICKABLE_SELECTOR);
}

export function useGlobalClickSounds(): void {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!findClickableElement(target)) return;
      playUIClickFromUserGesture();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!findClickableElement(target)) return;
      primeAudioContext();
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);
}

export function GlobalClickSounds({ children }: { children: ReactNode }) {
  useGlobalClickSounds();
  return children;
}
