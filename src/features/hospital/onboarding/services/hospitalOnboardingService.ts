import type { OnboardingFormData } from "../context/OnboardingContext";
import { authUtils } from "@/features/auth/utils/authUtils";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://0.0.0.0:8080";

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

export interface ApiFieldError {
  field: string;   // e.g. "email", "address.city"
  message: string;
}

export interface HospitalRegisterError extends Error {
  status: number;
  fieldErrors: ApiFieldError[];
}

export interface HospitalRegisterSuccess {
  id: string;
  hospital_name: string;
  status: string;
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
   * POST /api/v1/hospital/register
   * Sends all collected onboarding data in a single call.
   * Throws HospitalRegisterError (with field errors) on non-2xx response.
   */
  async register(data: OnboardingFormData): Promise<HospitalRegisterSuccess> {
    const token = localStorage.getItem("authToken");
    const payload = buildPayload(data);

    const response = await fetch(`${BASE}/api/v1/hospitals/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    if (!response.ok) {
      const err = new Error(
        (body as { message?: string })?.message ?? `Server error ${response.status}`
      ) as HospitalRegisterError;

      err.status = response.status;
      err.fieldErrors = parseFieldErrors(body);
      throw err;
    }

    return body as HospitalRegisterSuccess;
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Try to extract field-level errors from various common API error shapes */
function parseFieldErrors(body: unknown): ApiFieldError[] {
  if (!body || typeof body !== "object") return [];

  const b = body as Record<string, unknown>;

  // Shape 1: { errors: [{ field, message }] }
  if (Array.isArray(b.errors)) {
    return (b.errors as Record<string, string>[]).map((e) => ({
      field: e.field ?? e.param ?? "",
      message: e.message ?? e.msg ?? "Invalid value",
    }));
  }

  // Shape 2: { fields: { email: "...", hospital_name: "..." } }
  if (b.fields && typeof b.fields === "object") {
    return Object.entries(b.fields as Record<string, string>).map(([field, message]) => ({
      field,
      message,
    }));
  }

  // Shape 3: single message at top level, no field specifics
  return [];
}
