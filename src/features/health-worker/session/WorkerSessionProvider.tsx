import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useVirtualCallRoom } from "@/features/virtual-call/useVirtualCallRoom";
import { appToast } from "@/shared/components/feedback/toast";
import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";
import { useAuthStore } from "@/shared/auth/store/authStore";
import { getWorkerVerificationState } from "@/shared/auth/services/workerVerificationService";
import type { ApiShiftDetail } from "@/features/hospital/shifts/types";
import {
  PatientService,
  type PatientDetailResponse,
  type PredictionResponse,
} from "@/shared/patients/services/patientService";
import {
  useHealthWorkerShifts,
  type ClockinMethod,
  type EarningsSummary,
  type HandoverResponse,
  type MyApplicationEntry,
  type NearbyShiftCard,
} from "../hooks/useHealthWorkerShifts";
import type { PatientRecord } from "../types";
import { getWorkerPublic } from "@/features/hospital/workers/workerPublicService";
import {
  ROLE_OPTIONS,
  roleToApiRole,
  SPECIALTY_OPTIONS,
  type ProfileEditableFields,
  type ProfileLocalExtras,
} from "../profileOptions";
import { WorkerSessionContext, type WorkerSession } from "./workerSessionContext";

const STORAGE_KEY = "nexus.hw.shiftSession";
const MARKET_DEFAULT_RADIUS_KM = 5;
const LOCATION_HINT =
  "We couldn't get your location, so in-person shifts and real distances aren't shown — only virtual shifts. Enable location access and try again.";

type ClockIn = { at: string; method: ClockinMethod };

interface PersistedShiftSession {
  activeShift: ApiShiftDetail | null;
  clockIn: ClockIn | null;
  startedAt: string | null;
  patients: PatientRecord[];
  handover: HandoverResponse | null;
}

const EMPTY_SESSION: PersistedShiftSession = {
  activeShift: null,
  clockIn: null,
  startedAt: null,
  patients: [],
  handover: null,
};

function readPersisted(): PersistedShiftSession {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY_SESSION, ...JSON.parse(raw) } : EMPTY_SESSION;
  } catch {
    return EMPTY_SESSION;
  }
}

const EXTRAS_KEY = "nexus.hw.profileExtras";
const EMPTY_EXTRAS: ProfileLocalExtras = { experience: "none", languages: "" };

function readExtras(userId?: string): ProfileLocalExtras {
  try {
    const raw = localStorage.getItem(`${EXTRAS_KEY}.${userId ?? "anon"}`);
    return raw ? { ...EMPTY_EXTRAS, ...JSON.parse(raw) } : EMPTY_EXTRAS;
  } catch {
    return EMPTY_EXTRAS;
  }
}

function writeExtras(userId: string | undefined, extras: ProfileLocalExtras) {
  try {
    localStorage.setItem(`${EXTRAS_KEY}.${userId ?? "anon"}`, JSON.stringify(extras));
  } catch {
    // Storage unavailable — the values just won't persist.
  }
}

/**
 * Shared state for the health-worker routes: dashboard data, the shift in
 * progress (persisted to sessionStorage so a refresh mid-shift restores it),
 * patients seen, the virtual-call room, and profile editing. Screens are
 * routes now; this is what they have in common.
 */
export function WorkerSessionProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const workerApi = useHealthWorkerShifts();

  // ── Dashboard data ────────────────────────────────────────────────────────
  const [nearbyShifts, setNearbyShifts] = useState<NearbyShiftCard[]>([]);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [applications, setApplications] = useState<MyApplicationEntry[]>([]);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [earningsError, setEarningsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState(MARKET_DEFAULT_RADIUS_KM);
  const [isNearbyRefetching, setIsNearbyRefetching] = useState(false);

  // Each of these three calls fails independently on the real backend, so
  // they're tracked with separate error state rather than one shared flag.
  const reload = useCallback(async () => {
    setIsLoading(true);
    setNearbyError(null);
    setApplicationsError(null);
    setEarningsError(null);

    const [shiftsResult, appsResult, earnResult] = await Promise.allSettled([
      workerApi.getNearbyShifts(),
      workerApi.getMyApplications(),
      workerApi.getEarnings(),
    ]);

    if (shiftsResult.status === "fulfilled") {
      setNearbyShifts(shiftsResult.value.shifts);
      if (shiftsResult.value.locationRequired) setNearbyError(LOCATION_HINT);
    } else {
      setNearbyError(
        shiftsResult.reason instanceof ApiError
          ? shiftsResult.reason.message
          : "Failed to load nearby shifts.",
      );
    }

    if (appsResult.status === "fulfilled") {
      setApplications(appsResult.value);
    } else {
      setApplicationsError(
        appsResult.reason instanceof ApiError
          ? appsResult.reason.message
          : "Failed to load your applications.",
      );
    }

    if (earnResult.status === "fulfilled") {
      setEarnings(earnResult.value);
    } else {
      setEarningsError(
        earnResult.reason instanceof ApiError
          ? earnResult.reason.message
          : "Failed to load earnings.",
      );
    }

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // `radius_km` is the only marketplace filter backed by a real query param
  // (GET /worker/shifts/nearby) — changing it re-fetches.
  const changeRadius = useCallback((km: number) => {
    setRadiusKm(km);
    setIsNearbyRefetching(true);
    setNearbyError(null);
    workerApi
      .getNearbyShifts({ radius_km: km })
      .then((result) => {
        setNearbyShifts(result.shifts);
        if (result.locationRequired) setNearbyError(LOCATION_HINT);
      })
      .catch((err) =>
        setNearbyError(
          err instanceof ApiError ? err.message : "Failed to load nearby shifts.",
        ),
      )
      .finally(() => setIsNearbyRefetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Shift in progress (restored from sessionStorage on refresh) ──────────
  const [initial] = useState(readPersisted);
  const [activeShift, setActiveShift] = useState<ApiShiftDetail | null>(initial.activeShift);
  const [clockIn, setClockIn] = useState<ClockIn | null>(initial.clockIn);
  const [startedAt, setStartedAt] = useState<string | null>(initial.startedAt);
  const [handover, setHandover] = useState<HandoverResponse | null>(initial.handover);
  const [patients, setPatients] = useState<PatientRecord[]>(initial.patients);

  useEffect(() => {
    try {
      if (!activeShift) {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      const data: PersistedShiftSession = {
        activeShift,
        clockIn,
        startedAt,
        patients,
        handover,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage unavailable — the session just won't survive a refresh.
    }
  }, [activeShift, clockIn, startedAt, patients, handover]);

  const call = useVirtualCallRoom(
    activeShift?.id,
    "health worker consultation",
    "worker",
    activeShift?.hospital_location ?? null,
  );

  // The LiveKit webhook records the virtual clock-in on connect, so trust
  // `clock_in_recorded` if our explicit call was skipped or failed.
  const consultClockedIn = call.consultation?.clock_in_recorded ?? false;
  useEffect(() => {
    if (!consultClockedIn || clockIn) return;
    const at =
      call.consultation?.participants.find((p) => p.clocked_in_at)
        ?.clocked_in_at ?? new Date().toISOString();
    setClockIn({ at, method: "virtual" });
  }, [consultClockedIn, clockIn, call.consultation]);

  // Elapsed time is derived from the clock-in timestamp, so it keeps counting
  // correctly across route changes and refreshes.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!activeShift) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeShift]);
  const timerOrigin = clockIn?.at ?? startedAt;
  const shiftSeconds = timerOrigin
    ? Math.max(0, Math.floor((now - Date.parse(timerOrigin)) / 1000))
    : 0;

  const startShift = useCallback((shift: ApiShiftDetail, ci: ClockIn | null) => {
    setActiveShift(shift);
    setClockIn(ci);
    setStartedAt(new Date().toISOString());
    setPatients([]);
    setHandover(null);
    setNow(Date.now());
  }, []);

  const restoreShift = useCallback((shift: ApiShiftDetail) => {
    setActiveShift(shift);
    setStartedAt((prev) => prev ?? shift.actual_start ?? new Date().toISOString());
  }, []);

  const endShift = useCallback(() => {
    setActiveShift(null);
    setClockIn(null);
    setStartedAt(null);
    setHandover(null);
    setPatients([]);
  }, []);

  // ── Patients ─────────────────────────────────────────────────────────────
  const [isIngestingPatient, setIsIngestingPatient] = useState(false);
  const patientsRef = useRef(patients);
  patientsRef.current = patients;

  const ingestPatient = useCallback(async (patient: PatientRecord) => {
    setIsIngestingPatient(true);
    try {
      const res = await PatientService.ingest({
        full_name: patient.name,
        age: patient.age,
        gender: patient.gender,
        symptoms: patient.chiefComplaint,
        severity_level: patient.severityLevel ?? "Mild",
        existing_conditions: patient.existingConditions ?? "None",
      });

      const optimisticPrediction: PredictionResponse = {
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
      };

      setPatients((prev) => [
        ...prev,
        { ...patient, backendPatientId: res.patient_id, prediction: optimisticPrediction },
      ]);
      appToast.success("Patient submitted", "Running AI triage — results appear shortly.");
    } catch {
      // Graceful fallback if backend ingest fails or offline
      setPatients((prev) => [...prev, patient]);
      appToast.info("Patient added to shift", "AI triage offline or unavailable.");
    } finally {
      setIsIngestingPatient(false);
    }
  }, []);

  const startConsultation = useCallback((patient: PatientRecord) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patient.id ? { ...p, status: "in-consultation" } : p)),
    );
  }, []);

  const finalizeReport = useCallback(
    (patientId: string, notes: NonNullable<PatientRecord["reportNotes"]>) => {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId ? { ...p, status: "seen", reportNotes: notes } : p,
        ),
      );
    },
    [],
  );

  // Real-time SSE updates for AI Triage predictions during active shifts
  useEffect(() => {
    if (!accessToken) return;
    const url = `${apiClient.defaults.baseURL}/api/v1/pipeline/events?token=${encodeURIComponent(accessToken)}`;
    const source = new EventSource(url);

    source.addEventListener("prediction_completed", (e) => {
      try {
        const payload = JSON.parse((e as MessageEvent).data);
        setPatients((prev) =>
          prev.map((p) =>
            p.backendPatientId === payload.patient_id || p.id === payload.patient_id
              ? { ...p, prediction: payload.prediction }
              : p,
          ),
        );
      } catch {
        // parse error — ignore
      }
    });

    source.addEventListener("prediction_failed", (e) => {
      try {
        const payload = JSON.parse((e as MessageEvent).data);
        setPatients((prev) =>
          prev.map((p) =>
            p.backendPatientId === payload.patient_id || p.id === payload.patient_id
              ? {
                  ...p,
                  prediction: p.prediction
                    ? { ...p.prediction, status: "failed", last_error: payload.error }
                    : null,
                }
              : p,
          ),
        );
      } catch {
        // parse error — ignore
      }
    });

    return () => source.close();
  }, [accessToken]);

  // Safety-net poll for patients still in pending / processing AI Triage status
  useEffect(() => {
    const interval = setInterval(() => {
      patientsRef.current.forEach((p) => {
        const targetId = p.backendPatientId || p.id;
        if (
          targetId &&
          (p.prediction?.status === "pending" || p.prediction?.status === "processing")
        ) {
          PatientService.get(targetId)
            .then((detail: PatientDetailResponse) => {
              if (detail.prediction) {
                setPatients((prev) =>
                  prev.map((item) =>
                    item.id === p.id ? { ...item, prediction: detail.prediction } : item,
                  ),
                );
              }
            })
            .catch(() => {});
        }
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // ── Local mic / camera for the consultation screen ───────────────────────
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);

  const toggleMic = useCallback(async () => {
    try {
      if (audioTrackRef.current) {
        audioTrackRef.current.stop();
        audioTrackRef.current = null;
        setIsMicOn(false);
        return;
      }
      if (!navigator?.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];
      if (track) {
        audioTrackRef.current = track;
        setIsMicOn(true);
      }
    } catch (err) {
      console.error("toggleMic error:", err);
    }
  }, []);

  const toggleCam = useCallback(async () => {
    try {
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current = null;
        setIsCamOn(false);
        return;
      }
      if (!navigator?.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      if (track) {
        videoTrackRef.current = track;
        setIsCamOn(true);
      }
    } catch (err) {
      console.error("toggleCam error:", err);
    }
  }, []);

  const stopLocalTracks = useCallback(() => {
    audioTrackRef.current?.stop();
    videoTrackRef.current?.stop();
    audioTrackRef.current = null;
    videoTrackRef.current = null;
    setIsMicOn(false);
    setIsCamOn(false);
  }, []);

  // ── Profile ──────────────────────────────────────────────────────────────
  const [isBookingActive, setIsBookingActive] = useState(true);
  const [profileFields, setProfileFields] = useState<ProfileEditableFields | null>(null);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [profileExtras, setProfileExtras] = useState<ProfileLocalExtras>(() =>
    readExtras(user?.id),
  );
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const clinicianIdRef = useRef<string | null>(null);
  const profileLoadedRef = useRef(false);

  const resolveClinicianId = useCallback(async () => {
    if (clinicianIdRef.current) return clinicianIdRef.current;
    // `authStore.clinicianId` is only populated during onboarding — for a
    // returning worker the real id comes from /auth/me via the clinician
    // relation.
    const state = await getWorkerVerificationState();
    clinicianIdRef.current = state?.clinicianId ?? null;
    return clinicianIdRef.current;
  }, []);

  // GET /workers/{id} (saved profile) + GET /clinicians/{id}/qualifications.
  const loadProfile = useCallback(async () => {
    if (profileLoadedRef.current) return;
    setIsProfileLoading(true);
    try {
      const id = await resolveClinicianId();
      if (!id) return;
      const [pub, quals] = await Promise.allSettled([
        getWorkerPublic(id),
        apiClient.get<{ qualifications: string[] }>(
          `/api/v1/clinicians/${encodeURIComponent(id)}/qualifications`,
        ),
      ]);
      if (pub.status === "fulfilled") {
        const w = pub.value;
        const roleKey = w.role_title.trim().toLowerCase();
        const role =
          ROLE_OPTIONS.find(
            (r) => r.value === roleKey.replace(/\s+/g, "_") || r.label.toLowerCase() === roleKey,
          )?.value ?? "";
        const specialty = SPECIALTY_OPTIONS.some((o) => o.value === w.specialty)
          ? w.specialty
          : "";
        setProfileFields((prev) => prev ?? {
          firstName: w.first_name,
          lastName: w.last_name,
          role,
          licenseNumber: w.license_number ?? "",
          specialty,
        });
      }
      if (quals.status === "fulfilled") {
        setQualifications(quals.value.data.qualifications ?? []);
      }
      profileLoadedRef.current = pub.status === "fulfilled" || quals.status === "fulfilled";
    } finally {
      setIsProfileLoading(false);
    }
  }, [resolveClinicianId]);

  const saveProfile = useCallback(
    async (
      fields: ProfileEditableFields,
      quals: string[],
      extras: ProfileLocalExtras,
    ): Promise<boolean> => {
      setIsSavingProfile(true);
      setProfileSaveError(null);
      try {
        const clinicianId = await resolveClinicianId();
        if (!clinicianId) {
          setProfileSaveError("We couldn't find your clinician account for this session.");
          return false;
        }
        const base = `/api/v1/clinicians/${encodeURIComponent(clinicianId)}`;

        try {
          await apiClient.put(`${base}/profile`, {
            first_name: fields.firstName.trim(),
            last_name: fields.lastName.trim(),
            role: roleToApiRole(fields.role),
            license_number: fields.licenseNumber.trim(),
            specialty: fields.specialty,
          });
        } catch (err) {
          setProfileSaveError(err instanceof ApiError ? err.message : "Failed to save profile.");
          return false;
        }
        setProfileFields({ ...fields });
        useAuthStore.getState().setAuthSession({
          accessToken: useAuthStore.getState().accessToken,
          refreshToken: useAuthStore.getState().refreshToken,
          user: {
            ...(user ?? { id: "" }),
            first_name: fields.firstName.trim(),
            last_name: fields.lastName.trim(),
          },
        });

        // Experience / languages: no backend field yet — keep on-device.
        writeExtras(user?.id, extras);
        setProfileExtras(extras);

        try {
          const res = await apiClient.put<{ qualifications: string[] }>(
            `${base}/qualifications`,
            { qualifications: quals },
          );
          setQualifications(res.data?.qualifications ?? quals);
        } catch (err) {
          setProfileSaveError(
            `Profile saved, but your certificates couldn't be updated: ${
              err instanceof ApiError ? err.message : "please try again."
            }`,
          );
          return false;
        }

        appToast.success("Profile updated");
        return true;
      } finally {
        setIsSavingProfile(false);
      }
    },
    [user, resolveClinicianId],
  );

  const value = useMemo<WorkerSession>(
    () => ({
      nearbyShifts,
      nearbyError,
      applications,
      applicationsError,
      earnings,
      earningsError,
      isLoading,
      reload,
      radiusKm,
      isNearbyRefetching,
      changeRadius,
      activeShift,
      clockIn,
      shiftSeconds,
      handover,
      setHandover,
      setActiveShift,
      setClockIn,
      startShift,
      restoreShift,
      endShift,
      call,
      patients,
      ingestPatient,
      isIngestingPatient,
      startConsultation,
      finalizeReport,
      isMicOn,
      isCamOn,
      videoTrack: videoTrackRef.current,
      toggleMic,
      toggleCam,
      stopLocalTracks,
      isBookingActive,
      toggleBooking: () => setIsBookingActive((v) => !v),
      profileFields,
      qualifications,
      profileExtras,
      isProfileLoading,
      loadProfile,
      isSavingProfile,
      profileSaveError,
      saveProfile,
    }),
    [
      nearbyShifts, nearbyError, applications, applicationsError, earnings,
      earningsError, isLoading, reload, radiusKm, isNearbyRefetching,
      changeRadius, activeShift, clockIn, shiftSeconds, handover, startShift,
      restoreShift, endShift, call, patients, ingestPatient, isIngestingPatient,
      startConsultation, finalizeReport, isMicOn, isCamOn, toggleMic,
      toggleCam, stopLocalTracks, isBookingActive, profileFields,
      qualifications, profileExtras, isProfileLoading, loadProfile,
      isSavingProfile, profileSaveError, saveProfile,
    ],
  );

  return (
    <WorkerSessionContext.Provider value={value}>
      {children}
    </WorkerSessionContext.Provider>
  );
}
