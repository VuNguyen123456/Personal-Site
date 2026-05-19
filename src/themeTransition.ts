/** Smooth cross-fade when palette or dark/light mode changes (respects reduced motion). */
export function withThemeTransition(update: () => void): void {
  if (typeof document === "undefined") {
    update();
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }

  if ("startViewTransition" in document) {
    document.startViewTransition(() => {
      update();
    });
    return;
  }

  update();
}
