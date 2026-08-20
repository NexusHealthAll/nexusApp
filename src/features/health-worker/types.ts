import type { PredictionResponse } from "@/shared/patients/services/patientService";

/**
 * A patient record captured during the current shift session.
 */
export interface PatientRecord {
  id: string;
  backendPatientId?: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  severityLevel?: string;
  existingConditions?: string;
  vitals: {
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    temperatureC: number;
    heartRateBpm: number;
  };
  intakeAt: string;
  status: "waiting" | "in-consultation" | "seen";
  prediction?: PredictionResponse | null;
  reportNotes?: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    assessment: string;
    clinicalPlan: string;
    prescriptions: string;
  };
}

