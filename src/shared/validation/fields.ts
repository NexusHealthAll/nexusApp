import { z } from "zod";
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Shared zod field primitives, reused across onboarding, auth (login/signup)
 * and any other form in nexus-frontend that needs the same validation rules.
 * Pair with the react-hook-form `zodResolver` pattern already used in
 * onboarding: `useForm({ resolver: zodResolver(mySchema) })`.
 */

export const requiredText = (label: string) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`);

export const emailField = z
  .string({ required_error: "Email is required" })
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const passwordField = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

/**
 * Normalizes any phone value to strict E.164 (e.g. "+2348012345678").
 * Values coming from <PhoneNumberInput> are already E.164; this exists as a
 * defensive fallback for values that might arrive from elsewhere (pasted
 * text, legacy stored values).
 */
export function normalizePhoneE164(raw: string, defaultCountry: "NG" = "NG"): string {
  if (!raw) return raw;
  const parsed = parsePhoneNumberFromString(raw, defaultCountry);
  return parsed ? parsed.format("E.164") : raw.trim();
}

/** Required phone field — must be a real, dialable number. */
export const requiredPhoneField = z
  .string({ required_error: "Phone number is required" })
  .trim()
  .min(1, "Phone number is required")
  .refine((v) => isValidPhoneNumber(v, "NG"), {
    message: "Enter a valid phone number",
  });

/** Optional phone field — empty is fine, but a non-empty value must be valid. */
export const optionalPhoneField = z
  .string()
  .trim()
  .refine((v) => v === "" || isValidPhoneNumber(v, "NG"), {
    message: "Enter a valid phone number",
  });
