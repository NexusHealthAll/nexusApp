import apiClient from "@/lib/apiClient";
import type {
  ApiShift,
  ApiShiftListResponse,
} from "@/features/hospital/shifts/types";
import type { HandoverReport, HandoverStatus } from "./types";

/**
 * Handover reports for the hospital review flow.
 *
 * The backend only exposes write endpoints for handovers —
 * `POST /shifts/{id}/handover` (worker submit), `/handover/approve` and
 * `/handover/revision` (hospital) — there is no GET that returns submitted
 * handover content to the hospital yet. So report rows are derived from the
 * real shifts list (completed → awaiting review, in-progress → in progress)
 * using only real shift fields; the report body content stays null and the
 * UI renders an empty state for it. Approve / Request Revision call the real
 * endpoints.
 */

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

    return shifts
      .filter((s) => ["completed", "in_progress"].includes(s.status))
      .map((shift) => {
        const status: HandoverStatus =
          shift.status === "in_progress" ? "in_progress" : "awaiting_review";
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
          submittedLabel: submittedLabel(shift.actual_end ?? shift.updated_at),
          amountKobo: shiftAmountKobo(shift),
          status,
          patientsSeen: null,
          tasksCompleted: null,
          executiveSummary: null,
          clinicalFindings: null,
          narrative: null,
        } satisfies HandoverReport;
      });
  },

  async getReport(shiftId: string): Promise<HandoverReport | null> {
    const reports = await this.getReports();
    return reports.find((r) => r.shiftId === shiftId) ?? null;
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
