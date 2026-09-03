import { z } from "zod";

// ─── Shared field primitives ─────────────────────────────────────────────────

const NIGERIA_LOCAL = /^0\d{10}$/; // 08012345678
const E164 = /^\+[1-9]\d{9,14}$/; // +2348012345678

const stripPhonePunctuation = (v: string) => v.replace(/[\s()\-.]/g, "");

/**
 * Promote a Nigerian `0`-prefixed number to `+234` E.164, and strip spacing /
 * punctuation. Anything already in `+` form (or unrecognised) is just cleaned.
 * Call this on submit before sending the value onward — the schema validates,
 * this normalises.
 */
export function normalizePhone(raw: string): string {
  const cleaned = stripPhonePunctuation(raw.trim());
  if (NIGERIA_LOCAL.test(cleaned)) return `+234${cleaned.slice(1)}`;
  return cleaned;
}

const requiredText = (label: string) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`);

const emailField = z
  .string({ required_error: "Email is required" })
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

/** Optional, but if provided must be a Nigerian local or E.164 number. */
const optionalPhoneField = z
  .string()
  .trim()
  .refine((v) => {
    if (v === "") return true;
    const cleaned = stripPhonePunctuation(v);
    return NIGERIA_LOCAL.test(cleaned) || E164.test(cleaned);
  }, "Enter a valid phone number (e.g. 08012345678 or +2348012345678)");

// ─── Step 1a: HospitalDetailsStep (/hospital/onboarding/registration) ─────────

export const hospitalDetailsSchema = z.object({
  adminFirstName: requiredText("First name"),
  adminLastName: requiredText("Last name"),
  hospitalName: requiredText("Hospital name"),
  mdcnNumber: requiredText("Registration number"),
  email: emailField,
  phone: optionalPhoneField,
});

export type HospitalDetailsValues = z.infer<typeof hospitalDetailsSchema>;

// ─── Step 1b: HospitalRegistrationStep (buildOnboardingRoutes flow) ───────────

export const hospitalRegistrationSchema = z.object({
  hospitalName: requiredText("Hospital name"),
  registrationNumber: requiredText("Registration number"),
  email: emailField,
  address: requiredText("Address"),
  phoneNumber: optionalPhoneField,
});

export type HospitalRegistrationValues = z.infer<typeof hospitalRegistrationSchema>;
