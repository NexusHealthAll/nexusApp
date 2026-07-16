import { create } from "zustand";

export type VirtualSessionStage =
  | "checked_in"
  | "device_connected"
  | "doctor_joined"
  | "completed";

export interface VirtualSession {
  id: string;
  patientLabel: string;
  visitType: string;
  kiosk: string;
  doctor: string;
  doctorRating: number;
  startedAt: string;
  stage: VirtualSessionStage;
  /** Timeline events accumulated as the session progresses. */
  timeline: { label: string; time: string }[];
}

export const STAGES: VirtualSessionStage[] = [
  "checked_in",
  "device_connected",
  "doctor_joined",
  "completed",
];

export const stageLabels: Record<VirtualSessionStage, string> = {
  checked_in: "Checked In",
  device_connected: "Device Connected",
  doctor_joined: "Doctor Joined",
  completed: "Completed",
};

export function stageIndex(stage: VirtualSessionStage): number {
  return STAGES.indexOf(stage);
}

/**
 * Virtual telehealth session store. The backend has no kiosk/session
 * endpoints yet (shifts only carry a static `virtual_link`), so this starts
 * empty and the Virtual Shifts page shows empty states. The lifecycle
 * helpers (Checked In → Device Connected → Doctor Joined → Completed)
 * remain for when sessions arrive from a real API.
 */
interface VirtualSessionsState {
  sessions: VirtualSession[];
  advance: (id: string) => void;
  end: (id: string) => void;
}

function nowLabel(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const advanceEventLabel: Record<VirtualSessionStage, string> = {
  checked_in: "Patient checked in at kiosk",
  device_connected: "Device connected to session",
  doctor_joined: "Doctor joined the call",
  completed: "Consultation completed",
};

export const useVirtualSessionsStore = create<VirtualSessionsState>((set) => ({
  sessions: [],
  advance: (id) =>
    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id !== id || s.stage === "completed") return s;
        const next = STAGES[stageIndex(s.stage) + 1];
        return {
          ...s,
          stage: next,
          timeline: [
            ...s.timeline,
            { label: advanceEventLabel[next], time: nowLabel() },
          ],
        };
      }),
    })),
  end: (id) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id && s.stage !== "completed"
          ? {
              ...s,
              stage: "completed",
              timeline: [
                ...s.timeline,
                { label: "Consultation completed", time: nowLabel() },
              ],
            }
          : s,
      ),
    })),
}));
