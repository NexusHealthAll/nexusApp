// ── Real backend shapes (nexus-backend `Shift` / `ShiftListResponse`) ───────
// Mirrors `src/models/shift.rs` in nexus-backend exactly — see GET /api/v1/shifts
// in the live OpenAPI spec at http://0.0.0.0:8080/api/openapi.json.

export type ApiShiftStatus =
  | "open"
  | "assigned"
  | "upcoming"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type ApiShiftPriority = "normal" | "stat" | "urgent" | "scheduled";

export type ApiShiftType = "in_person" | "virtual";

export type ApiPayType = "hourly_rate" | "fixed_rate";

export interface ApiShift {
  id: string;
  hospital_id: string;
  hospital_name?: string | null;
  role_category: string;
  role_title: string;
  department?: string | null;
  specialty?: string | null;
  shift_label?: string | null;
  shift_type: ApiShiftType;
  status: ApiShiftStatus;
  priority: ApiShiftPriority;
  scheduled_start: string;
  scheduled_end: string;
  duration_hours: number;
  actual_start?: string | null;
  actual_end?: string | null;
  assigned_clinician_id?: string | null;
  /** Static formatted meeting URL for virtual shifts — not a real video-SDK session. */
  virtual_link?: string | null;
  pay_type: ApiPayType;
  rate_kobo_per_hour?: number | null;
  fixed_rate_kobo?: number | null;
  effective_rate_kobo_per_hour?: number | null;
  grand_total_kobo?: number | null;
  stat_bonus_kobo?: number | null;
  urgency_bonus_pct?: number | null;
  job_description?: string | null;
  notes?: string | null;
  created_by: string;
  broadcast_consent_confirmed: boolean;
  broadcast_at?: string | null;
  billing_triggered_at?: string | null;
  matched_clinicians_at_publish?: number | null;
  draft_quality_score?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApiPaginationMetadata {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ApiShiftListResponse {
  shifts: ApiShift[];
  pagination: ApiPaginationMetadata;
}

export interface ShiftBonus {
  id: string;
  name: string;
  description: string;
  amount: number;
}

/** Percentage bonus applied to base earnings based on the shift's urgency level. */
export const URGENCY_BONUS_PCT: Record<string, number> = {
  stat: 20,
  urgent: 10,
  standard: 0,
  elective: 0,
};

export interface ShiftEquipment {
  id: string;
  name: string;
  description: string;
}

export interface ShiftDeliverable {
  id: string;
  name: string;
  description: string;
}

export interface ShiftFormData {
  // Step 1 – Basic Information
  roleNeeded: string;
  department: string;
  specialty: string;
  shiftType: "in-person" | "virtual";
  startDate: string;
  startTime: string;
  /** End time (HH:mm); duration is derived from start → end. */
  endTime: string;
  /** Shift length in hours, set in Step 1 and reused as the pay-calc hours in Step 2. */
  duration: number;
  urgencyLevel: string;

  // Step 2 – Compensation
  payType: "hourly" | "fixed";
  hourlyRate: number;
  fixedRate: number;
  bonuses: ShiftBonus[];
  /** Optional discount percentage applied to the compensation total, if any. */
  discountPct?: number;

  // Step 3 – Description
  jobDescription: string;
  tasks: string[];
  deliverables: ShiftDeliverable[];
  equipment: ShiftEquipment[];
  requirements: string[];

  // Step 4 – Requirements
  qualifications: string[];
  minExperience: string;
  languages: string;
  certificates: string[];
}
