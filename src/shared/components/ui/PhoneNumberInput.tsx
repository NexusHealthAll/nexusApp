import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhoneInput, { type Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/shared/utils/cn";

export interface PhoneNumberInputProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  /** Two-letter ISO country the dial-code selector defaults to. */
  defaultCountry?: Country;
  /** Current value, already (or eventually) in E.164 form, e.g. "+2348012345678". */
  value?: string;
  /** Called with the E.164-normalized value on every change (never a raw/local format). */
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Applied to the input+country-selector row — same slot `className` fills on <Input>. */
  className?: string;
  /** Applied to the outer wrapper (label + row + error/hint) — mirrors <Input containerClassName>. */
  containerClassName?: string;
}

/**
 * Country-code + flag phone input, reusable across every phone field in the
 * app. Wraps react-phone-number-input (backed by libphonenumber-js) so the
 * value is always normalized to E.164 before it reaches form state / the API
 * — callers never need their own normalizer.
 */
export function PhoneNumberInput({
  id,
  name,
  label,
  error,
  hint,
  required,
  disabled,
  autoFocus,
  placeholder = "801 234 5678",
  defaultCountry = "NG",
  value,
  onChange,
  onBlur,
  className,
  containerClassName,
}: PhoneNumberInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
        >
          {label} {required && <span className="text-error-500">*</span>}
        </label>
      )}

      <PhoneInput
        id={inputId}
        name={name}
        international
        defaultCountry={defaultCountry}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        onBlur={onBlur}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-required={required}
        numberInputProps={{ autoComplete: "tel" }}
        className={cn(
          "NexusPhoneInput w-full rounded-lg border bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 transition-colors duration-150 focus-within:outline-none focus-within:ring-2 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-800",
          error
            ? "border-error-300 focus-within:border-error-500 focus-within:ring-error-500 dark:border-error-700"
            : "border-neutral-200 focus-within:border-transparent focus-within:ring-secondary-500 dark:border-neutral-700",
          className,
        )}
      />

      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden text-xs text-error-600 dark:text-error-400"
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
            className="overflow-hidden text-xs text-neutral-400 dark:text-neutral-500"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
