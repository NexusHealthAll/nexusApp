import { useCallback, useEffect, useRef, useState } from "react";
import apiClient from "@/lib/apiClient";
import { appToast } from "@/shared/components/feedback/toast";
import { useAuthStore } from "@/shared/auth/store/authStore";
import {
  PatientService,
  type NewPatientRequest,
  type PatientDetailResponse,
  type PredictionResponse,
} from "../services/patientService";

// SSE payloads from GET /api/v1/pipeline/events — mirrors the tagged enum
// `PipelineEvent` in nexus-backend's src/models/patient_prediction.rs.
interface PredictionCompletedEvent {
  event: "prediction_completed";
  hospital_id: string;
  patient_id: string;
  prediction: PredictionResponse;
}
interface PredictionFailedEvent {
  event: "prediction_failed";
  hospital_id: string;
  patient_id: string;
  prediction_id: string;
  error: string;
}

// Predictions still in flight are re-polled at this interval as a safety
// net for events dropped by a connection gap (broadcast channel has no
// replay) — the backend's own worker ticks every ~2s, so this stays well
// clear of it while bounding staleness.
const PENDING_POLL_MS = 8000;

export function usePatients() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [patients, setPatients] = useState<PatientDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIngesting, setIsIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const patientsRef = useRef(patients);
  patientsRef.current = patients;

  const applyPrediction = useCallback((patientId: string, prediction: PredictionResponse) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, prediction } : p)),
    );
  }, []);

  const loadPatients = useCallback(async () => {
    try {
      setError(null);
      const data = await PatientService.list();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Live updates via SSE. EventSource can't set an Authorization header, so
  // the token rides along as a query param — the backend's
  // extract_claims_with_query_fallback accepts either.
  useEffect(() => {
    if (!accessToken) return;

    const url = `${apiClient.defaults.baseURL}/api/v1/pipeline/events?token=${encodeURIComponent(accessToken)}`;
    const source = new EventSource(url);

    source.addEventListener("prediction_completed", (e) => {
      const payload = JSON.parse((e as MessageEvent).data) as PredictionCompletedEvent;
      applyPrediction(payload.patient_id, payload.prediction);
    });

    source.addEventListener("prediction_failed", (e) => {
      const payload = JSON.parse((e as MessageEvent).data) as PredictionFailedEvent;
      setPatients((prev) =>
        prev.map((p) =>
          p.id === payload.patient_id
            ? {
                ...p,
                prediction: p.prediction
                  ? { ...p.prediction, status: "failed", last_error: payload.error }
                  : null,
              }
            : p,
        ),
      );
    });

    return () => source.close();
  }, [accessToken, applyPrediction]);

  // Safety-net poll for rows still pending/processing.
  useEffect(() => {
    const interval = setInterval(() => {
      const inFlight = patientsRef.current.filter(
        (p) => p.prediction?.status === "pending" || p.prediction?.status === "processing",
      );
      inFlight.forEach((p) => {
        PatientService.get(p.id)
          .then((detail) => {
            if (detail.prediction) applyPrediction(p.id, detail.prediction);
          })
          .catch(() => {
            // Transient — the next tick or SSE will catch it up.
          });
      });
    }, PENDING_POLL_MS);
    return () => clearInterval(interval);
  }, [applyPrediction]);

  const ingestPatient = useCallback(async (payload: NewPatientRequest) => {
    setIsIngesting(true);
    try {
      const res = await PatientService.ingest(payload);
      const optimisticPatient: PatientDetailResponse = {
        id: res.patient_id,
        hospital_id: "",
        full_name: payload.full_name,
        age: payload.age,
        gender: payload.gender ?? "Male",
        symptoms: payload.symptoms ?? "",
        existing_conditions: payload.existing_conditions ?? "None",
        severity_level: payload.severity_level ?? "Mild",
        created_at: new Date().toISOString(),
        prediction: {
          id: res.prediction_id,
          patient_id: res.patient_id,
          status: "pending",
          diagnosis_condition: null,
          diagnosis_confidence: null,
          diagnosis_probabilities: null,
          risk_level: null,
          risk_score: null,
          deterioration_probability: null,
          risk_probabilities: null,
          drug_recommendation: null,
          recommendation_confidence: null,
          recommendations: null,
          urgency: null,
          route_to: null,
          department: null,
          alert_priority: null,
          last_error: null,
          created_at: new Date().toISOString(),
          completed_at: null,
        },
      };
      setPatients((prev) => [optimisticPatient, ...prev]);
      appToast.success("Patient submitted", "Running AI triage — results appear shortly.");
      return res;
    } catch (err) {
      appToast.fromError(err, "Failed to submit patient");
      throw err;
    } finally {
      setIsIngesting(false);
    }
  }, []);

  return { patients, isLoading, isIngesting, error, ingestPatient, refresh: loadPatients };
}
