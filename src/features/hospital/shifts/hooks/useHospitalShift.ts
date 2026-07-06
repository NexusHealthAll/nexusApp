import { useCallback, useState } from "react";
import apiClient from "@/lib/apiClient";
import type {
  ApiShiftListResponse,
  ApiShiftPriority,
  ApiShiftStatus,
  ShiftFormData,
} from "../types";

export type ShiftStatusFilter = ApiShiftStatus;

type ShiftApiError = {
  message: string;
  status?: number;
  data?: unknown;
};

const urgencyToPriority: Record<string, ApiShiftPriority> = {
  stat: "stat",
  urgent: "urgent",
  standard: "normal",
  elective: "scheduled",
};

const roleToCategory: Record<string, string> = {
  Doctor: "doctor",
  Nurse: "nurse",
  "Lab Technician": "lab_technician",
  Pharmacist: "pharmacist",
  Radiographer: "radiographer",
};

function parseDurationHours(duration: string, fallback: number): number {
  const match = duration.match(/[\d.]+/);
  if (match) return Number(match[0]);
  return fallback || 0.1;
}

function buildShiftPayload(data: ShiftFormData) {
  // Map frontend form model → backend create/preview payload.
  // Note: some fields in the backend payload were described as numbers in kobo.
  // We forward what we can; the exact backend schema may evolve.
  return {
    broadcast_consent_confirmed: true,
    department: data.specialty || "",
    duration_hours: parseDurationHours(data.duration, data.expectedHours),
    equipment: (data.equipment || []).map((e) => e.name),
    fixed_rate_kobo: Math.trunc(data.fixedRate * 100),
    job_description: data.jobDescription || "",
    notes: "",
    pay_type: data.payType === "fixed" ? "fixed_rate" : "hourly_rate",
    priority: urgencyToPriority[data.urgencyLevel] ?? "normal",
    rate_kobo_per_hour:
      data.payType === "hourly" ? Math.trunc(data.hourlyRate * 100) : 0,
    requirements: data.qualifications || [],
    role_category: roleToCategory[data.roleNeeded] ?? "doctor",
    role_title: data.roleNeeded || "",
    scheduled_start: new Date(
      `${data.startDate}T${data.startTime}`,
    ).toISOString(),
    shift_label: data.specialty || "Shift",
    shift_type: data.shiftType === "in-person" ? "in_person" : "virtual",
    specialty: data.specialty || "",
    stat_bonus_kobo: 0,
    tasks: data.tasks || [],
    urgency_bonus_pct: 0,
  };
}

export interface ShiftApplication {
  id: string;
  shift_id: string;
  clinician_id: string;
  applicant_name: string;
  license_number: string;
  role: string;
  years_experience: number;
  experience_summary?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RankedInterestedClinician {
  clinician_id: string;
  display_name: string;
  rating: number;
  rating_count: number;
  completed_shifts: number;
  quals_match: boolean;
  score: number;
  acceptance_rate_pct?: number | null;
  distance_km?: number | null;
}

export interface ShiftApplicationsResponse {
  applications: ShiftApplication[];
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export type UseHospitalShiftResult = {
  createShift: (payload: ShiftFormData) => Promise<{ id: string }>;
  previewShift: (payload: ShiftFormData) => Promise<unknown>;
  getShifts: (params: {
    status?: ShiftStatusFilter;
    page?: number;
    page_size?: number;
  }) => Promise<ApiShiftListResponse>;
  getShiftDetails: (shift_id: string) => Promise<unknown>;
  getShiftApplications: (params: {
    shift_id: string;
    page?: number;
    page_size?: number;
  }) => Promise<ShiftApplicationsResponse>;
  getInterestedClinicians: (
    shift_id: string,
  ) => Promise<RankedInterestedClinician[]>;
  assignClinician: (params: {
    shift_id: string;
    clinician_id: string;
  }) => Promise<unknown>;
  cancelShift: (params: {
    shift_id: string;
    reason: string;
  }) => Promise<unknown>;
  rescheduleShift: (params: {
    shift_id: string;
    duration_hours: number;
    scheduled_start: string;
  }) => Promise<unknown>;
};

export function useHospitalShift(): UseHospitalShiftResult {
  // Local state is kept minimal; this hook focuses on providing request
  // functions that can be used by any component.
  // Note: lastError is currently internal-only (kept for future UI hooks).
  const [, setLastError] = useState<ShiftApiError | null>(null);

  const createShift = useCallback(
    async (payload: ShiftFormData) => {
      setLastError(null);
      try {
        const res = await apiClient.post<{ id: string }>(
          "/api/v1/shifts",
          buildShiftPayload(payload),
        );
        return res.data;
      } catch (e) {
        console.log(e);
        setLastError(e as ShiftApiError);
        throw e;
      }
    },
    [],
  );

  const previewShift = useCallback(
    async (payload: ShiftFormData) => {
      setLastError(null);
      try {
        const res = await apiClient.post<unknown>(
          "/api/v1/shifts/preview",
          buildShiftPayload(payload),
        );
        return res.data;
      } catch (e) {
        setLastError(e as ShiftApiError);
        throw e;
      }
    },
    [],
  );

  const getShifts = useCallback(
    async (params: {
      status?: ShiftStatusFilter;
      page?: number;
      page_size?: number;
    }) => {
      setLastError(null);
      try {
        const res = await apiClient.get<ApiShiftListResponse>(
          "/api/v1/shifts",
          {
            params: {
              status: params.status,
              page: params.page,
              page_size: params.page_size,
            },
          },
        );
        return res.data;
      } catch (e) {
        setLastError(e as ShiftApiError);
        throw e;
      }
    },
    [],
  );

  const getShiftDetails = useCallback(
    async (shift_id: string) => {
      setLastError(null);
      try {
        const res = await apiClient.get<unknown>(
          `/api/v1/shifts/${encodeURIComponent(shift_id)}`,
        );
        return res.data;
      } catch (e) {
        setLastError(e as ShiftApiError);
        throw e;
      }
    },
    [],
  );

  const getShiftApplications = useCallback(
    async (params: { shift_id: string; page?: number; page_size?: number }) => {
      setLastError(null);
      try {
        const res = await apiClient.get<ShiftApplicationsResponse>(
          `/api/v1/shifts/${encodeURIComponent(params.shift_id)}/applications`,
          { params: { page: params.page, page_size: params.page_size } },
        );
        return res.data;
      } catch (e) {
        setLastError(e as ShiftApiError);
        throw e;
      }
    },
    [],
  );

  const getInterestedClinicians = useCallback(
    async (shift_id: string) => {
      setLastError(null);
      try {
        const res = await apiClient.get<RankedInterestedClinician[]>(
          `/api/v1/shifts/${encodeURIComponent(shift_id)}/interested`,
        );
        return res.data;
      } catch (e) {
        setLastError(e as ShiftApiError);
        throw e;
      }
    },
    [],
  );

  const assignClinician = useCallback(
    async (params: { shift_id: string; clinician_id: string }) => {
      setLastError(null);
      try {
        const res = await apiClient.post<unknown>(
          `/api/v1/shifts/${encodeURIComponent(params.shift_id)}/assign`,
          { clinician_id: params.clinician_id },
        );
        return res.data;
      } catch (e) {
        setLastError(e as ShiftApiError);
        throw e;
      }
    },
    [],
  );

  const cancelShift = useCallback(
    async (params: { shift_id: string; reason: string }) => {
      setLastError(null);
      try {
        const res = await apiClient.post<unknown>(
          `/api/v1/shifts/${encodeURIComponent(params.shift_id)}/cancel`,
          { reason: params.reason },
        );
        return res.data;
      } catch (e) {
        setLastError(e as ShiftApiError);
        throw e;
      }
    },
    [],
  );

  const rescheduleShift = useCallback(
    async (params: {
      shift_id: string;
      duration_hours: number;
      scheduled_start: string;
    }) => {
      setLastError(null);
      try {
        const res = await apiClient.post<unknown>(
          `/api/v1/shifts/${encodeURIComponent(params.shift_id)}/reschedule`,
          {
            duration_hours: params.duration_hours,
            scheduled_start: new Date(params.scheduled_start).toISOString(),
          },
        );
        return res.data;
      } catch (e) {
        setLastError(e as ShiftApiError);
        throw e;
      }
    },
    [],
  );

  return {
    createShift,
    previewShift,
    getShifts,
    getShiftDetails,
    getShiftApplications,
    getInterestedClinicians,
    assignClinician,
    cancelShift,
    rescheduleShift,
  };
}
