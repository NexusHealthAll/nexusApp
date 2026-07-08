import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type ModalSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: ModalSize;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "lg",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
          <motion.button
            type="button"
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute inset-0 bg-[#071726]/55 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || "Dialog"}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-10 w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-strong sm:p-8",
              sizeClasses[size],
              className,
            )}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              {title ? (
                <h2 className="text-2xl font-semibold text-neutral-950 sm:text-3xl">
                  {title}
                </h2>
              ) : (
                <span aria-hidden="true" />
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
