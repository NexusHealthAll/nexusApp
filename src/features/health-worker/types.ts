/**
 * A patient record captured during the current shift session.
 *
 * There is no backend model for patient records, intake forms, or
 * consultations in nexus-backend (confirmed: the handler file exists but
 * isn't compiled into the binary, no DB migration for it). This type and
 * everything built on it is local-session-only — it never leaves the
 * browser and does not survive a refresh. Every screen that uses it says
 * so explicitly in its UI.
 */
export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  vitals: {
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    temperatureC: number;
    heartRateBpm: number;
  };
  intakeAt: string;
  status: "waiting" | "in-consultation" | "seen";
  reportNotes?: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    assessment: string;
    clinicalPlan: string;
    prescriptions: string;
  };
}
