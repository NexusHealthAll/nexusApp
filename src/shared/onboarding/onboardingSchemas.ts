import { z } from "zod";
import {
  requiredText,
  emailField,
  optionalPhoneField,
  normalizePhoneE164,
} from "@/shared/validation/fields";

// ─── Shared field primitives ─────────────────────────────────────────────────

/** @deprecated use `normalizePhoneE164` from "@/shared/validation/fields" */
export const normalizePhone = normalizePhoneE164;

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
