import { useCallback, useState } from "react";
import apiClient from "@/lib/apiClient";
import type { ShiftFormData } from "../types";

export type ShiftStatusFilter =
  | "open"
  | "assigned"
  | "upcoming"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

type ShiftApiError = {
  message: string;
  status?: number;
  data?: unknown;
};

function buildShiftPayload(data: ShiftFormData) {
  // Map frontend form model → backend create/preview payload.
  // Note: some fields in the backend payload were described as numbers in kobo.
  // We forward what we can; the exact backend schema may evolve.
  return {
    broadcast_consent_confirmed: true,
    department: data.specialty || "",
    duration_hours: Number(data.duration) || Number(data.expectedHours) || 0.1,
    equipment: (data.equipment || []).map((e) => e.name),
    fixed_rate_kobo: Math.trunc(data.fixedRate * 100),
    job_description: data.jobDescription || "",
    notes: "",
    pay_type: data.payType === "fixed" ? "fixed_rate" : "hourly_rate",
    priority: "normal",
    rate_kobo_per_hour:
      data.payType === "hourly" ? Math.trunc(data.hourlyRate * 100) : 0,
    requirements: data.qualifications || [],
    role_category: "doctor",
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

export type UseHospitalShiftResult = {
  createShift: (payload: ShiftFormData) => Promise<{ id: string }>;
  previewShift: (payload: ShiftFormData) => Promise<unknown>;
  getShifts: (params: {
    status?: ShiftStatusFilter;
    page?: number;
    page_size?: number;
  }) => Promise<unknown>;
  getShiftDetails: (shift_id: string) => Promise<unknown>;
  getShiftApplications: (params: {
    shift_id: string;
    page?: number;
    page_size?: number;
  }) => Promise<unknown>;
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
        const res = await apiClient.get<unknown>("/api/v1/shifts", {
          params: {
            status: params.status,
            page: params.page,
            page_size: params.page_size,
          },
        });
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
        const res = await apiClient.get<unknown>(
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
    assignClinician,
    cancelShift,
    rescheduleShift,
  };
}
