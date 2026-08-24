import { useId, useState, type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface TooltipProps {
  /** Tooltip text. When empty/undefined, children render with no tooltip wrapper behavior. */
  content?: string;
  children: ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

/**
 * Hover/focus tooltip that works even when the wrapped control is disabled —
 * a plain `title` attribute on a `disabled` element doesn't fire hover
 * events in Firefox/Safari, so the hint never shows. This wraps the child in
 * a span that owns the hover/focus state instead.
 */
export function Tooltip({ content, children, className, side = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const id = useId();

  if (!content) return <>{children}</>;

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      aria-describedby={isVisible ? id : undefined}
    >
      {children}
      {isVisible && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute left-1/2 z-50 w-max max-w-[240px] -translate-x-1/2 rounded-lg bg-neutral-900 px-3 py-1.5 text-center text-xs font-medium text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
