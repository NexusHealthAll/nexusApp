import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

// Dedicated key, deliberately not shared with SettingsPage's
// "hospital-settings-prefs" blob — two independent modules doing
// read-modify-write on one JSON object risks one clobbering the other's
// field. SettingsPage reads/writes theme through useTheme() instead.
export const THEME_STORAGE_KEY = "nexus:hospital-theme";

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

/** No stored preference yet → defer to the device's own theme. */
function readStoredTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeMode(raw)) return raw;
  } catch {
    // fall through to device default
  }
  return "system";
}

function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === "system" ? (systemPrefersDark() ? "dark" : "light") : mode;
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

interface ThemeCtx {
  /** The user's chosen mode, including "system" if they haven't overridden it. */
  theme: ThemeMode;
  /** The actual light/dark value in effect right now. */
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(theme),
  );

  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);

    if (theme !== "system") return;

    // Stay live with the OS while the user hasn't overridden it explicitly.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const next: ResolvedTheme = media.matches ? "dark" : "light";
      setResolvedTheme(next);
      applyResolvedTheme(next);
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // in-memory state still updates even if persistence fails
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Context + accessor hook are intentionally co-located, matching
// OnboardingContext's pattern — splitting for fast-refresh purity isn't
// worth the indirection here.
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
