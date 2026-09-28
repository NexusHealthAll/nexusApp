import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";
import { useAuthStore } from "@/shared/auth/store/authStore";
import { uploadImage } from "@/shared/services/mediaUpload";

export type HospitalRegistrationStatus = "pending" | "approved" | "rejected";

export interface HospitalProfile {
  abbreviation: string;
  name: string;
  adminName: string;
  adminRole: string;
  adminInitials: string;
  adminRegistrationStatus: HospitalRegistrationStatus | null;
  registrationNumber: string;
  verificationStatus: string;
  approvedAt: string | null;
}

interface MeHospitalProfile {
  id: string;
  name: string;
  registration_number: string;
  verification_status: string;
  admin_registration_status: HospitalRegistrationStatus | null;
  approved_at: string | null;
}

interface MeResponse {
  hospital?: MeHospitalProfile | null;
}

/**
 * Business/CAC document verification sub-status, derived server-side from
 * `hospital_documents.submission_status` — see `get_hospital`'s SQL CASE in
 * nexus-backend `src/handlers/hospitals.rs`.
 */
export type DocumentsVerificationStatus =
  | "verified"
  | "under_review"
  | "submitted"
  | "unverified";

export interface HospitalDetails {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  address: string;
  phoneNumber: string;
  verificationStatus: string;
  adminRegistrationStatus: HospitalRegistrationStatus | null;
  logoUrl: string | null;
  /** Business/CAC document verification sub-status. */
  documentsStatus: DocumentsVerificationStatus;
  /** Whether the hospital's BVN/NIN identity check has been verified. */
  identityVerified: boolean;
}

interface HospitalDetailsResponse {
  id: string;
  name: string;
  registration_number: string;
  email: string;
  address: string;
  phone_number: string;
  verification_status: string;
  admin_registration_status: HospitalRegistrationStatus | null;
  logo_url: string | null;
  documents_status: DocumentsVerificationStatus;
  identity_verified: boolean;
}

/**
 * `GET /api/v1/hospitals/{id}/status` response (`registration::get_registration_status`
 * in nexus-backend). Unlike `GET /api/v1/hospitals/{id}`, this endpoint is meant
 * for the hospital's own overall admin-review status — it's the one place that
 * exposes it pre-auth (during onboarding, before there's a session for
 * `/auth/me`). NOTE: as of this writing, the backend service
 * (`RegistrationService::get_registration_status`) unconditionally returns
 * `rejection_reason: null` and `approved_at: null` — both fields are declared
 * on the response but never actually populated from the hospital row (see the
 * TODO comments in `src/services/registration_service.rs`). They're still
 * wired up here so the UI picks them up automatically once the backend fills
 * them in; until then, a rejected hospital will see the badge/rejected state
 * but no specific reason text.
 */
export interface HospitalRegistrationStatusDetail {
  hospitalId: string;
  hospitalName: string;
  status: HospitalRegistrationStatus;
  approvedAt: string | null;
  rejectionReason: string | null;
}

interface HospitalRegistrationStatusResponse {
  hospital_id: string;
  hospital_name: string;
  status: HospitalRegistrationStatus;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
}

export interface UpdateHospitalPatch {
  name?: string;
  address?: string;
  phone_number?: string;
}

/** Hospital's saved coordinates + geofence, from `hospital_locations`. */
export interface HospitalLocation {
  latitude: number | null;
  longitude: number | null;
  placeLabel: string | null;
  clockInRadiusMeters: number | null;
  locationConfirmed: boolean | null;
}

interface HospitalLocationResponse {
  hospital_id: string;
  latitude: number | null;
  longitude: number | null;
  place_label: string | null;
  clock_in_radius_meters: number | null;
  location_confirmed: boolean | null;
}

function deriveAbbreviation(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return name.slice(0, 4).toUpperCase();
  return words
    .filter((w) => /^[A-Za-z]/.test(w))
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function deriveInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "—";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Identity of the hospital + admin currently signed in, shown in the sidebar
 * header and top-bar breadcrumb. Backed by the protected `GET /api/v1/auth/me`
 * endpoint (see nexus-backend `src/handlers/auth.rs`), which derives the
 * hospital server-side from the caller's JWT — no client-supplied id needed.
 * There is no dedicated "abbreviation" field on the backend Hospital model,
 * so it's derived client-side from the hospital name.
 *
 * `admin_registration_status` is also read from this response — it's the
 * same field `POST /api/v1/shifts` checks server-side (must be "approved")
 * before allowing shift creation; see `useHospitalApprovalStatus`.
 */
export class HospitalProfileService {
  static async getProfile(): Promise<HospitalProfile | null> {
    const user = useAuthStore.getState().user;
    if (!user?.hospital_id) return null;

    const res = await apiClient.get<MeResponse>("/api/v1/auth/me");
    const hospital = res.data.hospital;
    if (!hospital) return null;

    const adminName =
      [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
      user?.email ||
      "—";

    return {
      abbreviation: deriveAbbreviation(hospital.name),
      name: hospital.name,
      adminName,
      adminRole: "Hospital Admin",
      adminInitials: deriveInitials(adminName),
      adminRegistrationStatus: hospital.admin_registration_status,
      registrationNumber: hospital.registration_number,
      verificationStatus: hospital.verification_status,
      approvedAt: hospital.approved_at,
    };
  }

  /**
   * Full hospital record for the Hospital Profile page (GET /hospitals/:id).
   * This is the public/ungated hospital detail endpoint — no auth required —
   * so it also doubles as the status source during onboarding, before a
   * session exists. Pass an explicit `hospitalId` for that case (e.g. from
   * the onboarding draft); omit it to use the signed-in hospital's own id.
   */
  static async getHospitalDetails(
    hospitalId?: string,
  ): Promise<HospitalDetails | null> {
    const id = hospitalId ?? useAuthStore.getState().user?.hospital_id;
    if (!id) return null;

    const res = await apiClient.get<HospitalDetailsResponse>(
      `/api/v1/hospitals/${encodeURIComponent(id)}`,
    );
    const h = res.data;
    return {
      id: h.id,
      name: h.name,
      registrationNumber: h.registration_number,
      email: h.email,
      address: h.address,
      phoneNumber: h.phone_number,
      verificationStatus: h.verification_status,
      adminRegistrationStatus: h.admin_registration_status,
      logoUrl: h.logo_url,
      documentsStatus: h.documents_status,
      identityVerified: h.identity_verified,
    };
  }

  /**
   * GET /api/v1/hospitals/:id/status — the hospital's own overall
   * admin-review status (approve/reject decision), usable pre-auth (see the
   * doc comment on `HospitalRegistrationStatusDetail`). Returns `null` if the
   * hospital id is unknown to the backend (404).
   */
  static async getRegistrationStatus(
    hospitalId: string,
  ): Promise<HospitalRegistrationStatusDetail | null> {
    try {
      const res = await apiClient.get<HospitalRegistrationStatusResponse>(
        `/api/v1/hospitals/${encodeURIComponent(hospitalId)}/status`,
      );
      const s = res.data;
      return {
        hospitalId: s.hospital_id,
        hospitalName: s.hospital_name,
        status: s.status,
        approvedAt: s.approved_at,
        rejectionReason: s.rejection_reason,
      };
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  /**
   * PATCH /hospitals/:id — name/address/phone are updatable.
   * `email` is deliberately excluded from the patch: the backend's UPDATE
   * has no pre-check for its UNIQUE constraint (unlike hospital creation),
   * so sending an email already used by another hospital 500s with a
   * generic "database error occurred" instead of a clean conflict.
   */
  static async updateHospitalDetails(
    patch: UpdateHospitalPatch,
  ): Promise<void> {
    const hospitalId = useAuthStore.getState().user?.hospital_id;
    if (!hospitalId) throw new Error("No hospital on the current session");
    await apiClient.patch(
      `/api/v1/hospitals/${encodeURIComponent(hospitalId)}`,
      patch,
    );
  }

  /**
   * Replaces the hospital's logo. `PATCH /hospitals/:id/logo` (base64 body)
   * never existed on the backend — every call 404'd despite this method
   * looking complete. The logo image goes through the same signed Cloudinary
   * upload pipeline used elsewhere, then the resulting URL is saved via the
   * real, already-working `PATCH /hospitals/:id` (`logo_url` is one of its
   * ordinary optional fields — see `updateHospitalDetails` above).
   */
  static async updateLogo(file: File): Promise<string> {
    const hospitalId = useAuthStore.getState().user?.hospital_id;
    if (!hospitalId) throw new Error("No hospital on the current session");
    const logoUrl = await uploadImage(file, "hospital_logo");
    await apiClient.patch(`/api/v1/hospitals/${encodeURIComponent(hospitalId)}`, {
      logo_url: logoUrl,
    });
    return logoUrl;
  }

  /**
   * GET /hospitals/:id/location — the hospital's saved coordinates/geofence
   * (from `hospital_locations`, set during onboarding). Returns `null` both
   * when there's no hospital on the session and when the backend 404s
   * because no location row exists yet (e.g. an old hospital that registered
   * before geofencing was collected) — callers should treat both the same:
   * fall back to a "no map yet" state.
   */
  static async getHospitalLocation(): Promise<HospitalLocation | null> {
    const hospitalId = useAuthStore.getState().user?.hospital_id;
    if (!hospitalId) return null;
    try {
      const res = await apiClient.get<HospitalLocationResponse>(
        `/api/v1/hospitals/${encodeURIComponent(hospitalId)}/location`,
      );
      const l = res.data;
      return {
        latitude: l.latitude,
        longitude: l.longitude,
        placeLabel: l.place_label,
        clockInRadiusMeters: l.clock_in_radius_meters,
        locationConfirmed: l.location_confirmed,
      };
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }
}
