import {
  createContext,
  createElement,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { isEeveelutionPaletteId, type EeveelutionPaletteId } from "./eeveePalette";
import { setSiteAudioMuted } from "./siteAudioMute";
import { withThemeTransition } from "./themeTransition";
import { FloatingPokeball } from "./FloatingPokeball";
import { GlobalClickSounds } from "./useGlobalClickSounds";
import { GlobalScrollSounds } from "./useScrollSounds";

type ThemeContextValue = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  siteAudioMuted: boolean;
  toggleSiteAudioMuted: () => void;
  eeveelutionsUnlocked: boolean;
  activeEeveelutionPalette: EeveelutionPaletteId | null;
  onEeveelutionClick: (slug: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useDarkModeState(): ThemeContextValue {
  const [darkMode, setDarkMode] = useState(true);
  const [themeToggleClickCount, setThemeToggleClickCount] = useState(0);
  const [activeEeveelutionPalette, setActiveEeveelutionPalette] = useState<EeveelutionPaletteId | null>(null);
  const [siteAudioMuted, setSiteAudioMutedState] = useState(false);

  useEffect(() => {
    setDarkMode(true);
    setSiteAudioMuted(false);
    setSiteAudioMutedState(false);
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
    withThemeTransition(() => {
      setActiveEeveelutionPalette(null);
      setDarkMode((prev) => !prev);
      setThemeToggleClickCount((count) => count + 1);
    });
  }, []);

  const onEeveelutionClick = useCallback((slug: string) => {
    if (!isEeveelutionPaletteId(slug)) return;
    withThemeTransition(() => {
      setActiveEeveelutionPalette((current) => (current === slug ? null : slug));
    });
  }, []);

  const toggleSiteAudioMuted = useCallback(() => {
    setSiteAudioMutedState((prev) => {
      const next = !prev;
      setSiteAudioMuted(next);
      return next;
    });
  }, []);

  return {
    darkMode,
    toggleDarkMode,
    siteAudioMuted,
    toggleSiteAudioMuted,
    eeveelutionsUnlocked,
    activeEeveelutionPalette,
    onEeveelutionClick,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useDarkModeState();
  return createElement(
    ThemeContext.Provider,
    { value },
    createElement(
      GlobalClickSounds,
      null,
      createElement(
        GlobalScrollSounds,
        null,
        createElement(
          Fragment,
          null,
          createElement(FloatingPokeball, null),
          children,
        ),
      ),
    ),
  );
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
