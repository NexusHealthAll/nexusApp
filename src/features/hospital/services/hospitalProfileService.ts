import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/shared/auth/store/authStore";

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
}

export interface UpdateHospitalPatch {
  name?: string;
  email?: string;
  address?: string;
  phone_number?: string;
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

  /** Full hospital record for the Hospital Profile page (GET /hospitals/:id). */
  static async getHospitalDetails(): Promise<HospitalDetails | null> {
    const hospitalId = useAuthStore.getState().user?.hospital_id;
    if (!hospitalId) return null;

    const res = await apiClient.get<HospitalDetailsResponse>(
      `/api/v1/hospitals/${encodeURIComponent(hospitalId)}`,
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
    };
  }

  /** PATCH /hospitals/:id — only name/email/address/phone are updatable. */
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
}
