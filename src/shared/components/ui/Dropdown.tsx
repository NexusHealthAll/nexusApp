import {
  ButtonHTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  panelClassName?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Headless-style trigger + floating panel primitive. Handles open state,
 * click-outside, Escape-to-close, and the enter/exit animation — callers
 * supply the trigger and panel content (see `Select` for a form-value
 * picker built on top, or use `DropdownItem` directly for action menus).
 */
export function Dropdown({
  trigger,
  children,
  align = "left",
  className,
  panelClassName,
  disabled,
  open: controlledOpen,
  onOpenChange,
  triggerProps,
}: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const containerRef = useRef<HTMLDivElement>(null);

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        disabled={disabled}
        {...triggerProps}
        onClick={(event) => {
          setOpen(!isOpen);
          triggerProps?.onClick?.(event);
        }}
        className={cn(
          "w-full disabled:pointer-events-none disabled:opacity-50",
          triggerProps?.className,
        )}
      >
        {trigger}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className={cn(
              "absolute z-20 mt-2 min-w-full origin-top rounded-xl border border-neutral-200 bg-white p-1.5 shadow-strong",
              align === "right" ? "right-0" : "left-0",
              panelClassName,
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  destructive?: boolean;
}

export function DropdownItem({
  className,
  active,
  destructive,
  ...props
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-100",
        destructive
          ? "text-error-600 hover:bg-error-50"
          : "text-neutral-700 hover:bg-neutral-50",
        active && "bg-neutral-50 font-medium text-neutral-900",
        className,
      )}
      {...props}
    />
  );
}
