import type { ApiShiftStatus, ApiShiftType } from "@/features/hospital/shifts/types";

export type CallWindowState = "too_early" | "open" | "elapsed" | "completed" | "unavailable";

export interface CallWindowInfo {
  state: CallWindowState;
  /** Tooltip/inline copy explaining why the button is (or isn't) enabled. */
  message: string;
}

/** Mirrors the backend's ±60 min clock-in window (see nexus-backend `clock_in`). */
const CALL_WINDOW_MINUTES = 60;

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * Computes whether the "Connect Device & Join Call" action should be enabled
 * for a virtual shift, and what to tell the hospital admin when it isn't.
 * Kept in lockstep with `ShiftService::generate_virtual_call_token` in
 * nexus-backend, which enforces the same rule server-side.
 */
export function getCallWindowInfo(
  shift: { shift_type: ApiShiftType; status: ApiShiftStatus; scheduled_start: string },
  now: Date = new Date(),
): CallWindowInfo {
  if (shift.shift_type !== "virtual") {
    return { state: "unavailable", message: "This is an in-person shift — no call session." };
  }

  if (shift.status === "completed") {
    return { state: "completed", message: "This consultation has already taken place." };
  }
  if (shift.status === "cancelled") {
    return { state: "unavailable", message: "This shift was cancelled." };
  }
  if (shift.status === "no_show") {
    return { state: "unavailable", message: "The clinician did not show up for this shift." };
  }
  if (shift.status === "open") {
    return {
      state: "unavailable",
      message: "Assign a clinician to this shift before starting the call.",
    };
  }

  const start = new Date(shift.scheduled_start);
  const opensAt = new Date(start.getTime() - CALL_WINDOW_MINUTES * 60_000);
  const closesAt = new Date(start.getTime() + CALL_WINDOW_MINUTES * 60_000);

  if (now < opensAt) {
    return {
      state: "too_early",
      message: `Call opens at ${formatTime(opensAt)} — 1 hour before the scheduled start.`,
    };
  }
  if (now > closesAt) {
    return {
      state: "elapsed",
      message: `The call window closed at ${formatTime(closesAt)} — 1 hour after the scheduled start.`,
    };
  }
  return { state: "open", message: "Ready to connect." };
}
