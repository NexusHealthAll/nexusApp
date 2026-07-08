import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, containerClassName, label, error, hint, id, required, rows = 4, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500"
          >
            {label} {required && <span className="text-error-500">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full resize-y rounded-lg border bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2",
            error
              ? "border-error-300 focus:border-error-500 focus:ring-error-500"
              : "border-neutral-200 focus:border-transparent focus:ring-secondary-500",
            className,
          )}
          {...props}
        />

        <AnimatePresence initial={false}>
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 6 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="overflow-hidden text-xs text-error-600"
            >
              {error}
            </motion.p>
          ) : hint ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 6 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="overflow-hidden text-xs text-neutral-400"
            >
              {hint}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
