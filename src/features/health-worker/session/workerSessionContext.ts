import { createContext, useContext } from "react";
import type { VirtualCallRoom } from "@/features/virtual-call/useVirtualCallRoom";
import type { ApiShiftDetail } from "@/features/hospital/shifts/types";
import type {
  ClockinMethod,
  EarningsSummary,
  HandoverResponse,
  MyApplicationEntry,
  NearbyShiftCard,
} from "../hooks/useHealthWorkerShifts";
import type { PatientRecord } from "../types";
import type { ProfileEditableFields, ProfileLocalExtras } from "../profileOptions";

export interface WorkerSession {
  // Dashboard data
  nearbyShifts: NearbyShiftCard[];
  nearbyError: string | null;
  applications: MyApplicationEntry[];
  applicationsError: string | null;
  earnings: EarningsSummary | null;
  earningsError: string | null;
  isLoading: boolean;
  reload: () => Promise<void>;
  radiusKm: number;
  isNearbyRefetching: boolean;
  changeRadius: (km: number) => void;

  // Shift in progress (survives refresh via sessionStorage)
  activeShift: ApiShiftDetail | null;
  clockIn: { at: string; method: ClockinMethod } | null;
  shiftSeconds: number;
  handover: HandoverResponse | null;
  setHandover: (h: HandoverResponse | null) => void;
  setActiveShift: (shift: ApiShiftDetail) => void;
  setClockIn: (c: { at: string; method: ClockinMethod } | null) => void;
  /** Begin tracking a shift: resets patients/handover and starts the timer. */
  startShift: (
    shift: ApiShiftDetail,
    clockIn: { at: string; method: ClockinMethod } | null,
  ) => void;
  /** Re-adopt an in-progress shift fetched from the server (e.g. after a refresh on a deep link). */
  restoreShift: (shift: ApiShiftDetail) => void;
  /** Clear everything tied to the shift (after clock-out / logout). */
  endShift: () => void;
  call: VirtualCallRoom;

  // Patients seen during the shift
  patients: PatientRecord[];
  ingestPatient: (patient: PatientRecord) => Promise<void>;
  isIngestingPatient: boolean;
  startConsultation: (patient: PatientRecord) => void;
  finalizeReport: (
    patientId: string,
    notes: NonNullable<PatientRecord["reportNotes"]>,
  ) => void;

  // Local mic/cam used by the consultation screen
  isMicOn: boolean;
  isCamOn: boolean;
  videoTrack: MediaStreamTrack | null;
  toggleMic: () => Promise<void>;
  toggleCam: () => Promise<void>;
  stopLocalTracks: () => void;

  // Profile
  isBookingActive: boolean;
  toggleBooking: () => void;
  profileFields: ProfileEditableFields | null;
  /** Certificate / qualification tags (matched against shift requirements). */
  qualifications: string[];
  /** Experience + languages — no backend field yet, kept on this device. */
  profileExtras: ProfileLocalExtras;
  isProfileLoading: boolean;
  /** Fetch the saved profile + qualifications (idempotent). */
  loadProfile: () => Promise<void>;
  isSavingProfile: boolean;
  profileSaveError: string | null;
  /** Resolves true when everything saved. */
  saveProfile: (
    fields: ProfileEditableFields,
    qualifications: string[],
    extras: ProfileLocalExtras,
  ) => Promise<boolean>;
}

export const WorkerSessionContext = createContext<WorkerSession | null>(null);

export function useWorkerSession(): WorkerSession {
  const ctx = useContext(WorkerSessionContext);
  if (!ctx) {
    throw new Error("useWorkerSession must be used inside <HealthWorkerLayout />");
  }
  return ctx;
}
