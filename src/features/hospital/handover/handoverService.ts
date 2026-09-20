import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";
import type {
  ApiShift,
  ApiShiftListResponse,
} from "@/features/hospital/shifts/types";
import type {
  HandoverContent,
  HandoverReport,
  HandoverStatus,
} from "./types";

/**
 * Handover reports for the hospital review flow.
 *
 * Backend endpoints (nexus-backend `src/routes/app_routes.rs`, tag "shifts"):
 *   • `GET  /api/v1/shifts/{id}/handover`          — read the submitted handover
 *       (owning hospital / super admin / assigned worker). 200 `HandoverResponse`,
 *       404 when nothing submitted yet, 403 when not authorised.
 *   • `POST /api/v1/shifts/{id}/handover`          — worker submit/update (≤1h after clock-out).
 *   • `POST /api/v1/shifts/{id}/handover/revision` — hospital requests a revision
 *       ({ revision_notes }), within 24h of clock-out. 204.
 *   • `POST /api/v1/shifts/{id}/handover/approve`  — hospital approves; the
 *       PayoutScheduler then releases the clinician's net pay. 204.
 *
 * The list of reports is still derived from `GET /api/v1/shifts` (there is no
 * "list handovers" endpoint) — one row per completed / in-progress shift — and
 * the submitted body is hydrated per-row from the handover GET.
 */

/** Raw `HandoverResponse` shape from nexus-backend (`src/models/shift.rs`). */
interface ApiHandoverResponse {
  id: string;
  shift_id: string;
  patients_seen: number;
  critical_patients: unknown;
  pending_tasks: unknown;
  instructions: string;
  equipment_status?: string | null;
  /** Post-shift photo URLs (Cloudinary). */
  image_urls?: string[] | null;
  submitted_at: string;
  editable_until: string;
  auto_approve_after: string;
  hospital_approved_at?: string | null;
  revision_requested_at?: string | null;
  revision_notes?: string | null;
  appeal_raised_at?: string | null;
  appeal_note?: string | null;
}

/** Coerce a free-form handover array into a list of plain objects. */
function toEntries(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null && !Array.isArray(item),
  );
}

function mapHandover(api: ApiHandoverResponse): HandoverContent {
  return {
    id: api.id,
    patientsSeen: api.patients_seen,
    instructions: api.instructions,
    equipmentStatus: api.equipment_status ?? null,
    criticalPatients: toEntries(api.critical_patients),
    pendingTasks: toEntries(api.pending_tasks),
    shiftImages: api.image_urls ?? [],
    submittedAt: api.submitted_at,
    editableUntil: api.editable_until,
    autoApproveAfter: api.auto_approve_after,
    hospitalApprovedAt: api.hospital_approved_at ?? null,
    revisionRequestedAt: api.revision_requested_at ?? null,
    revisionNotes: api.revision_notes ?? null,
    appealRaisedAt: api.appeal_raised_at ?? null,
    appealNote: api.appeal_note ?? null,
  };
}

/** Resolve the display status from the shift + its (maybe-missing) handover. */
function statusFor(
  shiftStatus: string,
  handover: HandoverContent | null,
): HandoverStatus {
  if (handover?.hospitalApprovedAt) return "approved";
  if (handover?.revisionRequestedAt) return "revision_requested";
  if (shiftStatus === "in_progress") return "in_progress";
  return "awaiting_review";
}

function shiftAmountKobo(s: ApiShift): number {
  if (typeof s.grand_total_kobo === "number" && s.grand_total_kobo > 0) {
    return s.grand_total_kobo;
  }
  const rate = s.effective_rate_kobo_per_hour ?? s.rate_kobo_per_hour;
  if (typeof rate === "number" && rate > 0) {
    return Math.round(rate * s.duration_hours);
  }
  return s.fixed_rate_kobo ?? 0;
}

function submittedLabel(iso: string): string {
  const d = new Date(iso);
  return `Submitted ${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

function reportIdFor(shiftId: string): string {
  // Stable short display id derived from the UUID.
  const digits = shiftId.replace(/\D/g, "").slice(0, 4).padEnd(4, "0");
  return `NC-${digits}`;
}

/** GET the submitted handover for a shift; `null` when none exists yet (404). */
async function fetchHandover(shiftId: string): Promise<HandoverContent | null> {
  try {
    const res = await apiClient.get<ApiHandoverResponse>(
      `/api/v1/shifts/${encodeURIComponent(shiftId)}/handover`,
    );
    return mapHandover(res.data);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      return null;
    }
    throw err;
  }
}

function toReport(shift: ApiShift, handover: HandoverContent | null): HandoverReport {
  return {
    shiftId: shift.id,
    reportId: reportIdFor(shift.id),
    workerName: shift.assigned_clinician_id
      ? "Assigned Clinician"
      : shift.role_title,
    credential: "",
    role: shift.role_title,
    shiftLabel: shift.shift_label ?? shift.role_title,
    department: shift.department ?? "General",
    submittedLabel: handover
      ? submittedLabel(handover.submittedAt)
      : submittedLabel(shift.actual_end ?? shift.updated_at),
    amountKobo: shiftAmountKobo(shift),
    status: statusFor(shift.status, handover),
    handover,
  };
}

export const HandoverService = {
  async getReports(): Promise<HandoverReport[]> {
    let shifts: ApiShift[] = [];
    try {
      const res = await apiClient.get<ApiShiftListResponse>("/api/v1/shifts", {
        params: { page: 1, page_size: 100 },
      });
      shifts = res.data.shifts;
    } catch {
      shifts = [];
    }

    const relevant = shifts.filter((s) =>
      ["completed", "in_progress"].includes(s.status),
    );

    // Hydrate the submitted handover for completed shifts (in-progress shifts
    // have nothing submitted yet). One GET per row — there is no bulk endpoint.
    const handovers = await Promise.all(
      relevant.map((s) =>
        s.status === "completed"
          ? fetchHandover(s.id).catch(() => null)
          : Promise.resolve(null),
      ),
    );

    return relevant.map((shift, i) => toReport(shift, handovers[i]));
  },

  async getReport(shiftId: string): Promise<HandoverReport | null> {
    let shift: ApiShift | undefined;
    try {
      const res = await apiClient.get<ApiShiftListResponse>("/api/v1/shifts", {
        params: { page: 1, page_size: 100 },
      });
      shift = res.data.shifts.find((s) => s.id === shiftId);
    } catch {
      shift = undefined;
    }
    if (!shift) return null;

    const handover = await fetchHandover(shiftId).catch(() => null);
    return toReport(shift, handover);
  },

  /** POST /shifts/{id}/handover/approve — releases payment on the backend. */
  async approve(report: HandoverReport): Promise<void> {
    await apiClient.post(
      `/api/v1/shifts/${encodeURIComponent(report.shiftId)}/handover/approve`,
    );
  },

  /** POST /shifts/{id}/handover/revision */
  async requestRevision(
    report: HandoverReport,
    revisionNotes: string,
  ): Promise<void> {
    await apiClient.post(
      `/api/v1/shifts/${encodeURIComponent(report.shiftId)}/handover/revision`,
      { revision_notes: revisionNotes },
    );
  },
};
