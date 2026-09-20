import apiClient from "@/lib/apiClient";
import { getWorkerPublic } from "@/features/hospital/workers/workerPublicService";

export interface WorkerVerificationState {
  clinicianId: string;
  identityVerified: boolean;
  isVerified: boolean;
}

/**
 * Server-side source of truth for a health worker's onboarding state.
 * `GET /api/v1/auth/me` yields the caller's clinician id; `GET /api/v1/workers/{id}`
 * yields `identity_verified` (a verified BVN/NIN row exists) and `is_verified`.
 * Returns null when the caller has no clinician record or a request fails.
 */
export async function getWorkerVerificationState(): Promise<WorkerVerificationState | null> {
  try {
    const me = await apiClient.get<{ clinician?: { id: string } | null }>("/api/v1/auth/me");
    const clinicianId = me.data.clinician?.id;
    if (!clinicianId) return null;
    const worker = await getWorkerPublic(clinicianId);
    return {
      clinicianId,
      identityVerified: worker.identity_verified,
      isVerified: worker.is_verified,
    };
  } catch {
    return null;
  }
}
