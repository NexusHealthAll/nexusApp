import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/shared/context/ThemeContext";
import { cn } from "@/shared/utils/cn";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "pill" | "subtle";
  showLabel?: boolean;
}

export function ThemeToggle({
  className,
  variant = "icon",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className={cn(
          "flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600",
          className
        )}
      >
        {isDark ? (
          <>
            <Sun className="h-4 w-4 text-amber-400" />
            {showLabel && <span>Light Mode</span>}
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-brand-600" />
            {showLabel && <span>Dark Mode</span>}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-all hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white",
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-neutral-600 transition-transform hover:-rotate-12 dark:text-neutral-300" />
      )}
    </button>
  );
}
