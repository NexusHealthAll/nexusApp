// ── Typed API Error ──────────────────────────────────────────────────────────
//
// All API calls made through apiClient throw this class on non-2xx responses.
// Callers can inspect `status`, `message`, and `fieldErrors` without parsing
// the raw axios error themselves.

export interface ApiFieldError {
  /** Backend field name, e.g. "email" or "address.city" */
  field: string;
  /** Human-readable validation message */
  message: string;
}

export class ApiError extends Error {
  /** HTTP status code (e.g. 400, 401, 422, 500) */
  readonly status: number;
  /** Parsed field-level validation errors (may be empty) */
  readonly fieldErrors: ApiFieldError[];

  constructor(message: string, status: number, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;

    // Restore prototype chain when transpiling to ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ── Field-error parser ───────────────────────────────────────────────────────

/**
 * Attempts to extract field-level errors from the various API error shapes
 * used across the Nexus backend.
 */
export function parseFieldErrors(body: unknown): ApiFieldError[] {
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
    return Object.entries(b.fields as Record<string, string>).map(
      ([field, message]) => ({ field, message }),
    );
  }

  // Shape 3: single message, no field specifics
  return [];
}
