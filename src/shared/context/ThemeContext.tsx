import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "nexus-theme";
const HOSPITAL_PREFS_KEY = "hospital-settings-prefs";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;

  try {
    const prefs = localStorage.getItem(HOSPITAL_PREFS_KEY);
    if (prefs) {
      const parsed = JSON.parse(prefs);
      if (parsed.theme === "dark" || parsed.theme === "light") return parsed.theme;
    }
  } catch {
    // Ignore parse error
  }

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    try {
      const prefsRaw = localStorage.getItem(HOSPITAL_PREFS_KEY);
      const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
      prefs.theme = theme;
      localStorage.setItem(HOSPITAL_PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore error
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
