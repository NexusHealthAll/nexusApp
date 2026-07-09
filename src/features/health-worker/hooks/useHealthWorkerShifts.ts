import { useCallback, useState } from "react";
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/shared/auth/store/authStore";
import type {
  ApiPayType,
  ApiShiftPriority,
  ApiShiftStatus,
  ApiShiftType,
} from "@/features/hospital/shifts/types";

type WorkerApiError = {
  message: string;
  status?: number;
  data?: unknown;
};

// GET /api/v1/worker/shifts/nearby
export interface NearbyShiftCard {
  shift_id: string;
  hospital_id: string;
  hospital_name?: string | null;
  role_title: string;
  specialty?: string | null;
  shift_type: ApiShiftType;
  priority: ApiShiftPriority;
  scheduled_start: string;
  duration_hours: number;
  pay_type: ApiPayType;
  rate_kobo_per_hour?: number | null;
  fixed_rate_kobo?: number | null;
  stat_bonus_kobo?: number | null;
  distance_km?: number | null;
  interest_expressed: boolean;
}

// GET /api/v1/worker/shifts/my-applications
export type MyApplicationKind = "interest" | "application";
export type MyApplicationStatus =
  | "submitted"
  | "withdrawn"
  | "accepted"
  | "rejected";

export interface MyApplicationEntry {
  shift_id: string;
  hospital_id: string;
  role_title: string;
  scheduled_start: string;
  shift_status: ApiShiftStatus;
  kind: MyApplicationKind;
  application_status?: MyApplicationStatus | null;
  created_at: string;
}

// POST /api/v1/shifts/{id}/accept
export interface NdprConsent {
  ndpr_compliance: boolean;
  no_patient_capture: boolean;
  hospital_systems_only: boolean;
  complete_handover: boolean;
  understand_violation: boolean;
}

// POST /api/v1/shifts/{id}/clockin
export type ClockinMethod = "gps" | "qr_code" | "manual" | "virtual";

export interface ClockinResponse {
  attendance_id: string;
  shift_id: string;
  clockin_at: string;
  distance_meters?: number | null;
  late_minutes: number;
  late_penalty_applied: boolean;
}

// POST /api/v1/shifts/{id}/clockin/approval-request
export interface ClockinApprovalRequest {
  latitude?: number;
  longitude?: number;
  photo_base64: string;
  photo_mime_type?: string;
}

// POST /api/v1/shifts/{id}/handover
export interface SubmitHandoverRequest {
  patients_seen: number;
  critical_patients?: unknown[];
  pending_tasks?: unknown[];
  instructions: string;
  equipment_status?: string;
}

export interface HandoverResponse {
  id: string;
  shift_id: string;
  patients_seen: number;
  critical_patients: unknown;
  pending_tasks: unknown;
  instructions: string;
  equipment_status?: string | null;
  submitted_at: string;
  editable_until: string;
  auto_approve_after: string;
  hospital_approved_at?: string | null;
  revision_requested_at?: string | null;
  revision_notes?: string | null;
}

// POST /api/v1/shifts/{id}/clockout
export interface ClockoutResponse {
  attendance_id: string;
  shift_id: string;
  clockout_at: string;
  worked_minutes: number;
}

// GET /api/v1/worker/earnings
export interface EarningsTransaction {
  id: string;
  shift_id?: string | null;
  amount_kobo: number;
  status: string;
  hospital_name?: string | null;
  role_title?: string | null;
  scheduled_start?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface EarningsSummary {
  total_earned_kobo: number;
  this_month_kobo: number;
  pending_kobo: number;
  transactions: EarningsTransaction[];
  total_transactions: number;
  page: number;
  page_size: number;
}

// POST /api/v1/shifts/{id}/ratings/hospital
export interface HospitalRatingDimensions {
  staff_support: number;
  equipment_availability: number;
  communication: number;
  payment_timeliness: number;
}

export interface UseHealthWorkerShiftsResult {
  getNearbyShifts: () => Promise<NearbyShiftCard[]>;
  getMyApplications: () => Promise<MyApplicationEntry[]>;
  expressInterest: (shiftId: string) => Promise<void>;
  withdrawInterest: (shiftId: string) => Promise<void>;
  applyToShift: (
    shiftId: string,
    payload: { years_experience: number; experience_summary?: string },
  ) => Promise<void>;
  bookmarkShift: (shiftId: string) => Promise<void>;
  unbookmarkShift: (shiftId: string) => Promise<void>;
  dismissShift: (shiftId: string) => Promise<void>;
  acceptOffer: (shiftId: string, consent: NdprConsent) => Promise<void>;
  declineOffer: (shiftId: string, reason?: string) => Promise<void>;
  clockIn: (
    shiftId: string,
    payload: { method: ClockinMethod; latitude?: number; longitude?: number },
  ) => Promise<ClockinResponse>;
  requestClockinApproval: (
    shiftId: string,
    payload: ClockinApprovalRequest,
  ) => Promise<{ approval_request_id: string }>;
  submitHandover: (
    shiftId: string,
    payload: SubmitHandoverRequest,
  ) => Promise<HandoverResponse>;
  clockOut: (shiftId: string) => Promise<ClockoutResponse>;
  rateHospital: (
    shiftId: string,
    payload: {
      score: number;
      comment?: string;
      dimensions: HospitalRatingDimensions;
    },
  ) => Promise<void>;
  getEarnings: (params?: {
    page?: number;
    page_size?: number;
  }) => Promise<EarningsSummary>;
}

/**
 * Real, error-throwing calls for every worker-facing shift endpoint that
 * actually exists on the backend (see nexus-backend src/handlers/shifts.rs
 * and earnings.rs). Mirrors the useHospitalShift.ts pattern: no mock
 * fallback, callers see real failures.
 *
 * Note: /interest and /apply are the only two endpoints in this whole
 * surface that require clinician_id in the request body instead of
 * deriving it from the JWT like every other endpoint here does — a real
 * backend inconsistency. We source it from the auth store's clinicianId
 * (persisted at registration); it isn't recoverable any other way since
 * there's no GET /clinicians/me endpoint.
 */
export function useHealthWorkerShifts(): UseHealthWorkerShiftsResult {
  const [, setLastError] = useState<WorkerApiError | null>(null);
  const clinicianId = useAuthStore((s) => s.clinicianId);

  const getNearbyShifts = useCallback(async () => {
    setLastError(null);
    try {
      const res = await apiClient.get<NearbyShiftCard[]>(
        "/api/v1/worker/shifts/nearby",
      );
      return res.data;
    } catch (e) {
      setLastError(e as WorkerApiError);
      throw e;
    }
  }, []);

  const getMyApplications = useCallback(async () => {
    setLastError(null);
    try {
      const res = await apiClient.get<MyApplicationEntry[]>(
        "/api/v1/worker/shifts/my-applications",
      );
      return res.data;
    } catch (e) {
      setLastError(e as WorkerApiError);
      throw e;
    }
  }, []);

  const expressInterest = useCallback(
    async (shiftId: string) => {
      setLastError(null);
      try {
        await apiClient.post(
          `/api/v1/shifts/${encodeURIComponent(shiftId)}/interest`,
          { clinician_id: clinicianId },
        );
      } catch (e) {
        setLastError(e as WorkerApiError);
        throw e;
      }
    },
    [clinicianId],
  );

  const withdrawInterest = useCallback(async (shiftId: string) => {
    setLastError(null);
    try {
      await apiClient.delete(
        `/api/v1/shifts/${encodeURIComponent(shiftId)}/interest`,
      );
    } catch (e) {
      setLastError(e as WorkerApiError);
      throw e;
    }
  }, []);

  const applyToShift = useCallback(
    async (
      shiftId: string,
      payload: { years_experience: number; experience_summary?: string },
    ) => {
      setLastError(null);
      try {
        await apiClient.post(
          `/api/v1/shifts/${encodeURIComponent(shiftId)}/apply`,
          { clinician_id: clinicianId, ...payload },
        );
      } catch (e) {
        setLastError(e as WorkerApiError);
        throw e;
      }
    },
    [clinicianId],
  );

  const bookmarkShift = useCallback(async (shiftId: string) => {
    setLastError(null);
    try {
      await apiClient.post(
        `/api/v1/shifts/${encodeURIComponent(shiftId)}/bookmark`,
      );
    } catch (e) {
      setLastError(e as WorkerApiError);
      throw e;
    }
  }, []);

  const unbookmarkShift = useCallback(async (shiftId: string) => {
    setLastError(null);
    try {
      await apiClient.delete(
        `/api/v1/shifts/${encodeURIComponent(shiftId)}/bookmark`,
      );
    } catch (e) {
      setLastError(e as WorkerApiError);
      throw e;
    }
  }, []);

  const dismissShift = useCallback(async (shiftId: string) => {
    setLastError(null);
    try {
      await apiClient.post(
        `/api/v1/shifts/${encodeURIComponent(shiftId)}/dismiss`,
      );
    } catch (e) {
      setLastError(e as WorkerApiError);
      throw e;
    }
  }, []);

  const acceptOffer = useCallback(async (shiftId: string, consent: NdprConsent) => {
    setLastError(null);
    try {
      await apiClient.post(
        `/api/v1/shifts/${encodeURIComponent(shiftId)}/accept`,
        { ndpr_consent: consent },
      );
    } catch (e) {
      setLastError(e as WorkerApiError);
      throw e;
    }
  }, []);

  const declineOffer = useCallback(async (shiftId: string, reason?: string) => {
    setLastError(null);
    try {
      await apiClient.post(
        `/api/v1/shifts/${encodeURIComponent(shiftId)}/decline`,
        { reason },
      );
    } catch (e) {
      setLastError(e as WorkerApiError);
      throw e;
    }
  }, []);

  const clockIn = useCallback(
    async (
      shiftId: string,
      payload: { method: ClockinMethod; latitude?: number; longitude?: number },
    ) => {
      setLastError(null);
      try {
        const res = await apiClient.post<ClockinResponse>(
          `/api/v1/shifts/${encodeURIComponent(shiftId)}/clockin`,
          payload,
        );
        return res.data;
      } catch (e) {
        setLastError(e as WorkerApiError);
        throw e;
      }
    },
    [],
  );

  const requestClockinApproval = useCallback(
    async (shiftId: string, payload: ClockinApprovalRequest) => {
      setLastError(null);
      try {
        const res = await apiClient.post<{ approval_request_id: string }>(
          `/api/v1/shifts/${encodeURIComponent(shiftId)}/clockin/approval-request`,
          payload,
        );
        return res.data;
      } catch (e) {
        setLastError(e as WorkerApiError);
        throw e;
      }
    },
    [],
  );

  const submitHandover = useCallback(
    async (shiftId: string, payload: SubmitHandoverRequest) => {
      setLastError(null);
      try {
        const res = await apiClient.post<HandoverResponse>(
          `/api/v1/shifts/${encodeURIComponent(shiftId)}/handover`,
          payload,
        );
        return res.data;
      } catch (e) {
        setLastError(e as WorkerApiError);
        throw e;
      }
    },
    [],
  );

  const clockOut = useCallback(async (shiftId: string) => {
    setLastError(null);
    try {
      const res = await apiClient.post<ClockoutResponse>(
        `/api/v1/shifts/${encodeURIComponent(shiftId)}/clockout`,
      );
      return res.data;
    } catch (e) {
      setLastError(e as WorkerApiError);
      throw e;
    }
  }, []);

  const rateHospital = useCallback(
    async (
      shiftId: string,
      payload: {
        score: number;
        comment?: string;
        dimensions: HospitalRatingDimensions;
      },
    ) => {
      setLastError(null);
      try {
        await apiClient.post(
          `/api/v1/shifts/${encodeURIComponent(shiftId)}/ratings/hospital`,
          payload,
        );
      } catch (e) {
        setLastError(e as WorkerApiError);
        throw e;
      }
    },
    [],
  );

  const getEarnings = useCallback(
    async (params?: { page?: number; page_size?: number }) => {
      setLastError(null);
      try {
        const res = await apiClient.get<EarningsSummary>(
          "/api/v1/worker/earnings",
          { params },
        );
        return res.data;
      } catch (e) {
        setLastError(e as WorkerApiError);
        throw e;
      }
    },
    [],
  );

  return {
    getNearbyShifts,
    getMyApplications,
    expressInterest,
    withdrawInterest,
    applyToShift,
    bookmarkShift,
    unbookmarkShift,
    dismissShift,
    acceptOffer,
    declineOffer,
    clockIn,
    requestClockinApproval,
    submitHandover,
    clockOut,
    rateHospital,
    getEarnings,
  };
}
