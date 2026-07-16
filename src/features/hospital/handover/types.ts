export type HandoverStatus =
  | "awaiting_review"
  | "in_progress"
  | "approved"
  | "revision_requested";

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
  /**
   * Submitted handover content. The backend has no read endpoint for
   * handover submissions yet, so these stay null and the UI shows an
   * empty state for the report body.
   */
  patientsSeen: number | null;
  tasksCompleted: { done: number; total: number } | null;
  executiveSummary: string | null;
  clinicalFindings: string | null;
  narrative: string | null;
  amountKobo: number;
  status: HandoverStatus;
}
