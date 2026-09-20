export type HandoverStatus =
  | "awaiting_review"
  | "in_progress"
  | "approved"
  | "revision_requested";

/**
 * Submitted handover content, mapped from
 * `GET /api/v1/shifts/{shift_id}/handover` (nexus-backend `HandoverResponse`,
 * F1-H01..H05). `null` on a report row until the worker submits.
 */
export interface HandoverContent {
  /** Handover row id. */
  id: string;
  /** F1-H01 — total patients seen during the shift. */
  patientsSeen: number;
  /** F1-H04 — instructions for the incoming staff (required, non-empty). */
  instructions: string;
  /** F1-H05 — equipment issues (optional). */
  equipmentStatus: string | null;
  /** F1-H02 — patients needing immediate follow-up (free-form objects). */
  criticalPatients: Array<Record<string, unknown>>;
  /** F1-H03 — lab results, referrals, medications still pending. */
  pendingTasks: Array<Record<string, unknown>>;
  /**
   * Post-shift photos the worker attached, from the handover's `image_urls`
   * (Cloudinary `secure_url`s). Rendered as a thumbnail gallery.
   */
  shiftImages: string[];
  submittedAt: string;
  /** Worker can still edit until this instant (1h after clock-out). */
  editableUntil: string;
  /** Auto-approves (Tier 3) if the hospital takes no action by this instant (48h). */
  autoApproveAfter: string;
  hospitalApprovedAt: string | null;
  revisionRequestedAt: string | null;
  revisionNotes: string | null;
  /**
   * Set once the worker has nudged the hospital about a handover that's been
   * awaiting approval for over a day (see F3). One appeal only.
   */
  appealRaisedAt: string | null;
  appealNote: string | null;
}

export interface HandoverReport {
  /** Shift this report belongs to — used for the approve/revision endpoints. */
  shiftId: string;
  /** Display ID, e.g. "NC-2203". */
  reportId: string;
  workerName: string;
  /** Credential shown after the name, e.g. "LT", "RN". */
  credential: string;
  role: string;
  shiftLabel: string;
  department: string;
  submittedLabel: string;
  amountKobo: number;
  status: HandoverStatus;
  /**
   * The worker's submitted handover, from
   * `GET /api/v1/shifts/{shift_id}/handover`. `null` while the shift is still
   * in progress (or the worker hasn't submitted yet) — the UI renders an empty
   * state for the report body in that case.
   */
  handover: HandoverContent | null;
}
