import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/features/auth/store/authStore";

export interface HospitalProfile {
  abbreviation: string;
  name: string;
  adminName: string;
  adminRole: string;
  adminInitials: string;
}

interface HospitalResponse {
  id: string;
  name: string;
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
    };
  }
}
