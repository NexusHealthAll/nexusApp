import { ApiError } from "@/lib/apiError";

/**
 * Wording a backend might use to say a hospital account exists but hasn't been
 * approved by an admin yet. Matched case-insensitively against the error
 * message on a 403 response.
 */
const PENDING_APPROVAL_MESSAGE_PATTERN =
  /not approved|pending .*approv|awaiting .*(admin|approv|verif)|admin (verification|approval)|verified by an? admin|not yet verified/i;

export const HOSPITAL_APPROVAL_TOAST_TITLE = "Awaiting admin verification";

export const HOSPITAL_APPROVAL_MESSAGE =
  "Your hospital registration is still under review. You can sign in and access your dashboard once an administrator verifies it.";

/**
 * True when a failed login means the hospital's registration was submitted but
 * an admin hasn't verified it yet.
 *
 * Backend reality (`nexus-backend`): the hospital admin's `users` row is only
 * created when an admin approves the hospital (`approve_hospital`). Until then,
 * `POST /api/v1/auth/otp/send` fails with `404 "User not found"`
 * (`AuthError::NotFound`). A later backend may instead reject the login with an
 * explicit `403` carrying approval wording — both shapes are handled here.
 *
 * The 404 branch is only trusted when we know the user is on a hospital login
 * flow (`isHospitalLogin`); otherwise a genuinely mistyped / unregistered email
 * would be misreported as "pending approval".
 */
export function isHospitalPendingApprovalError(
  err: unknown,
  opts: { isHospitalLogin: boolean },
): boolean {
  if (!(err instanceof ApiError)) return false;

  if (err.status === 403 && PENDING_APPROVAL_MESSAGE_PATTERN.test(err.message)) {
    return true;
  }

  if (
    opts.isHospitalLogin &&
    err.status === 404 &&
    /user not found|no such user|not registered/i.test(err.message)
  ) {
    return true;
  }

  return false;
}
