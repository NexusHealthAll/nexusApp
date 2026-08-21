import {
  ButtonHTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
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

interface PanelPosition {
  top: number;
  left?: number;
  right?: number;
  minWidth: number;
}

/**
 * Headless-style trigger + floating panel primitive. Handles open state,
 * click-outside, Escape-to-close, and the enter/exit animation — callers
 * supply the trigger and panel content (see `Select` for a form-value
 * picker built on top, or use `DropdownItem` directly for action menus).
 *
 * The panel is rendered through a portal into `document.body` and
 * positioned from the trigger's live bounding rect (fixed positioning),
 * so it always overlays above ancestors with `overflow: hidden`/`auto`
 * (e.g. scrollable table containers) instead of being clipped by them.
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
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PanelPosition | null>(null);

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
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

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({
        top: rect.bottom + 8,
        minWidth: rect.width,
        ...(align === "right"
          ? { right: window.innerWidth - rect.right }
          : { left: rect.left }),
      });
    };

    updatePosition();
    // capture:true so this also fires for scroll on non-window scroll
    // containers (e.g. the table's own overflow-y-auto), which don't bubble.
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, align]);

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

      {position &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              right: position.right,
              minWidth: position.minWidth,
              zIndex: 1000,
            }}
          >
            <AnimatePresence onExitComplete={() => setPosition(null)}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                  className={cn(
                    "origin-top rounded-xl border border-neutral-200 bg-white p-1.5 shadow-strong dark:border-neutral-700 dark:bg-neutral-800",
                    panelClassName,
                  )}
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body,
        )}
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
          ? "text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-950/40"
          : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
        active &&
          "bg-neutral-50 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
        className,
      )}
      {...props}
    />
  );
}
