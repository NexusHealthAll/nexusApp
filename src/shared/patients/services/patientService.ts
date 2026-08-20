import apiClient from "@/lib/apiClient";

// Mirrors nexus-backend's src/models/patient.rs + src/models/patient_prediction.rs
// response shapes directly. See src/handlers/patients.rs for the live routes:
//   POST /api/v1/ingest/patient
//   GET  /api/v1/patients
//   GET  /api/v1/patients/{id}

/** Payload for POST /api/v1/ingest/patient. Every field but full_name/age has
 * a backend-side default, so partial submissions are fine. */
export interface NewPatientRequest {
  full_name: string;
  age: number;
  gender?: string;
  blood_group?: string;
  genotype?: string;
  height_cm?: number;
  weight_kg?: number;
  symptoms?: string;
  existing_conditions?: string;
  disease_type?: string | null;
  severity_level?: string;
  weather_condition?: string;
  smoking_status?: boolean;
  alcohol_consumption?: boolean;
  exercise_habits?: string;
  diet_type?: string;
  water_source?: string;
  patient_category?: string;
  predictive_risk_score?: number | null;
}

export interface PatientResponse {
  id: string;
  hospital_id: string;
  full_name: string;
  age: number;
  gender: string;
  symptoms: string;
  existing_conditions: string;
  severity_level: string;
  created_at: string;
}

export type PredictionStatus = "pending" | "processing" | "completed" | "failed";

export interface PredictionResponse {
  id: string;
  patient_id: string;
  status: PredictionStatus;
  diagnosis_condition: string | null;
  diagnosis_confidence: number | null;
  diagnosis_probabilities: Record<string, number> | null;
  risk_level: "Low" | "Medium" | "High" | null;
  risk_score: number | null;
  deterioration_probability: number | null;
  risk_probabilities: Record<string, number> | null;
  drug_recommendation: string | null;
  recommendation_confidence: number | null;
  recommendations: string[] | null;
  urgency: string | null;
  route_to: string | null;
  department: string | null;
  alert_priority: number | null;
  last_error: string | null;
  created_at: string;
  completed_at: string | null;
}

/** `PatientDetailResponse` on the backend flattens PatientResponse's fields
 * alongside a sibling `prediction` key — mirrored here the same way. */
export interface PatientDetailResponse extends PatientResponse {
  prediction: PredictionResponse | null;
}

export interface IngestPatientResponse {
  patient_id: string;
  prediction_id: string;
  status: string;
}

export class PatientService {
  static async list(limit = 50): Promise<PatientDetailResponse[]> {
    const res = await apiClient.get<PatientDetailResponse[]>("/api/v1/patients", {
      params: { limit },
    });
    return res.data;
  }

  static async get(patientId: string): Promise<PatientDetailResponse> {
    const res = await apiClient.get<PatientDetailResponse>(`/api/v1/patients/${patientId}`);
    return res.data;
  }

  static async ingest(payload: NewPatientRequest): Promise<IngestPatientResponse> {
    const res = await apiClient.post<IngestPatientResponse>("/api/v1/ingest/patient", payload);
    return res.data;
  }
}
