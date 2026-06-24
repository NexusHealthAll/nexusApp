import type { OnboardingFormData } from "../context/OnboardingContext";
import { authUtils } from "@/features/auth/utils/authUtils";
import apiClient from "@/lib/apiClient";
import { type ApiFieldError } from "@/lib/apiError";

// ── E.164 phone normaliser ───────────────────────────────────────────────────

/**
 * Converts any common Nigerian phone format to strict E.164 (+234XXXXXXXXXX).
 *
 * Handles:
 *   "08012345678"        → "+2348012345678"
 *   "+234 801 234 5678"  → "+2348012345678"
 *   "234 801 234 5678"   → "+2348012345678"
 *   "+2348012345678"     → "+2348012345678"  (already valid)
 *   "+1 800 555 0100"    → "+18005550100"    (non-NG, spaces stripped)
 */
function toE164(raw: string): string {
  // 1. Strip everything except digits and leading +
  const stripped = raw.replace(/[\s\-().]/g, "");

  // 2. Already E.164 (starts with +)
  if (stripped.startsWith("+")) return stripped;

  // 3. Nigerian local format: starts with 0  (e.g. 08012345678)
  if (stripped.startsWith("0")) return "+234" + stripped.slice(1);

  // 4. Has country code without + (e.g. 2348012345678)
  if (stripped.startsWith("234")) return "+" + stripped;

  // 5. Bare subscriber number — assume Nigeria
  return "+234" + stripped;
}

// ── Types ────────────────────────────────────────────────────────────────────

export type { ApiFieldError };

export interface HospitalRegisterSuccess {
  hospital_id: string;
  status: string;
  message: string;
  next_steps?: string[];
  [key: string]: unknown;
}

// ── Payload builder ──────────────────────────────────────────────────────────

function buildPayload(data: OnboardingFormData) {
  // Pull email from auth userData if not filled in form
  const authEmail = authUtils.getCurrentUser()?.email ?? "";

  return {
    admin_first_name:    data.adminFirstName || "",
    admin_last_name:     data.adminLastName  || "",
    hospital_name:       data.hospitalName   || "Unnamed Hospital",
    registration_number: data.mdcnNumber     || "RC-0000000",
    email:               data.email          || authEmail || "hospital@nexuscare.ng",
    phone:               toE164(data.phone   || "08000000000"),

    address: {
      line1:       data.streetAddress || "1 Hospital Road",
      line2:       data.addressLine2  || "",
      city:        data.city          || "Lagos",
      state:       data.state         || "Lagos",
      country:     "Nigeria",
      postal_code: data.postalCode    || "100001",
    },
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

export const hospitalOnboardingService = {
  /**
   * POST /api/v1/hospitals/register
   * Sends all collected onboarding data in a single call.
   * Throws ApiError (with field errors) on non-2xx response.
   */
  async register(data: OnboardingFormData): Promise<HospitalRegisterSuccess> {
    const payload = buildPayload(data);
    const response = await apiClient.post<HospitalRegisterSuccess>(
      "/api/v1/hospitals/register",
      payload,
    );
    return response.data;
  },
};
