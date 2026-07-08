import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/features/auth/store/authStore";

export type HospitalRegistrationStatus = "pending" | "approved" | "rejected";

export interface HospitalProfile {
  abbreviation: string;
  name: string;
  adminName: string;
  adminRole: string;
  adminInitials: string;
  adminRegistrationStatus: HospitalRegistrationStatus | null;
}

interface HospitalResponse {
  id: string;
  name: string;
  admin_registration_status: HospitalRegistrationStatus | null;
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
 * header and top-bar breadcrumb. Backed by `GET /api/v1/hospitals/:id`
 * (real endpoint — see nexus-backend `src/handlers/hospitals.rs`) using the
 * `hospital_id` embedded in the logged-in user's auth session. There is no
 * dedicated "abbreviation" field on the backend Hospital model, so it's
 * derived client-side from the hospital name.
 *
 * `admin_registration_status` is also read from this response — it's the
 * same field `POST /api/v1/shifts` checks server-side (must be "approved")
 * before allowing shift creation; see `useHospitalApprovalStatus`.
 */
export class HospitalProfileService {
  static async getProfile(): Promise<HospitalProfile | null> {
    const user = useAuthStore.getState().user;
    const hospitalId = user?.hospital_id;
    if (!hospitalId) return null;

    const res = await apiClient.get<HospitalResponse>(
      `/api/v1/hospitals/${encodeURIComponent(hospitalId)}`,
    );
    const hospital = res.data;

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
    };
  }
}
