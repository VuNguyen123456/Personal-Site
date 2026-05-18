import { createContext, createElement, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { isEeveelutionPaletteId, type EeveelutionPaletteId } from "./eeveePalette";

type ThemeContextValue = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  eeveelutionsUnlocked: boolean;
  activeEeveelutionPalette: EeveelutionPaletteId | null;
  onEeveelutionClick: (slug: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useDarkModeState(): ThemeContextValue {
  const [darkMode, setDarkMode] = useState(false);
  const [themeToggleClickCount, setThemeToggleClickCount] = useState(0);
  const [activeEeveelutionPalette, setActiveEeveelutionPalette] = useState<EeveelutionPaletteId | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (activeEeveelutionPalette) {
      root.dataset.palette = activeEeveelutionPalette;
    } else {
      delete root.dataset.palette;
    }
  }, [activeEeveelutionPalette]);

  const eeveelutionsUnlocked = themeToggleClickCount >= 2;

  const toggleDarkMode = useCallback(() => {
    setActiveEeveelutionPalette(null);
    setDarkMode((prev) => !prev);
    setThemeToggleClickCount((count) => count + 1);
  }, []);

  const onEeveelutionClick = useCallback((slug: string) => {
    if (!isEeveelutionPaletteId(slug)) return;
    setActiveEeveelutionPalette((current) => (current === slug ? null : slug));
  }, []);

  return {
    darkMode,
    toggleDarkMode,
    eeveelutionsUnlocked,
    activeEeveelutionPalette,
    onEeveelutionClick,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useDarkModeState();
  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx == null) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function useDarkMode() {
  return useTheme();
}
