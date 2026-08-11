import { useHospitalProfile } from "@/features/hospital/hooks/useHospitalProfile";
import type { HospitalRegistrationStatus } from "@/features/hospital/services/hospitalProfileService";

interface HospitalApprovalState {
  isLoading: boolean;
  isApproved: boolean;
  status: HospitalRegistrationStatus | null;
}

/**
 * Whether the hospital's registration has been approved by an admin yet.
 * `POST /api/v1/shifts` returns 403 Forbidden ("Only approved hospitals can
 * create shifts...") until `admin_registration_status` is "approved" — this
 * mirrors that check client-side so the UI can gate/inform ahead of time.
 * Also treats `verificationStatus === "verified"` as approved, matching the
 * same OR logic used on the Hospital Profile page.
 * Backed by `useHospitalProfile`'s shared cache rather than its own fetch.
 */
export function useHospitalApprovalStatus(): HospitalApprovalState {
  const { profile, isLoading } = useHospitalProfile();
  const status = profile?.adminRegistrationStatus ?? null;
  const isVerified = profile?.verificationStatus === "verified";

  return {
    isLoading,
    isApproved: status === "approved" || isVerified,
    status,
  };
}
