import { Check, Clock3, Users, UserRound, VideoOff } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
import type { ApiShift } from "@/features/hospital/shifts/types";
import { CallStage } from "@/features/virtual-call/components/CallStage";
import type { VirtualCallRoom } from "@/features/virtual-call/useVirtualCallRoom";
import { Header } from "../DashboardChrome";

/**
 * The health worker's dedicated consultation-call view — the same Meet-style
 * layout the hospital sees (self-view as the main stage, hospital as the corner
 * tile, floating controls). Reachable straight after joining; the shift's
 * patient / documentation screens are one tap away.
 */
export function VirtualCallScreen({
  shift,
  call,
  patientsCount,
  clockIn,
  onRecordClockIn,
  onBackToShift,
  onWaitingRoom,
}: {
  shift: ApiShift;
  call: VirtualCallRoom;
  patientsCount: number;
  clockIn?: { at: string; method: string } | null;
  onRecordClockIn: () => void;
  onBackToShift: () => void;
  onWaitingRoom: () => void;
}) {
  const hospitalName = shift.hospital_name ?? "Hospital";
  const connected = call.state === "connected";
  const clockedIn = Boolean(clockIn) || Boolean(call.consultation?.clock_in_recorded);
  const clockInTime = clockIn
    ? new Date(clockIn.at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <Header
        title="Consultation Call"
        subtitle={`${hospitalName} • ${shift.role_title}`}
        onBack={onBackToShift}
      />
      <main className="space-y-5 px-5 py-4">
        {/* Attendance for this shift */}
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm",
            clockedIn
              ? "border-success-200 bg-success-50/70 text-success-800 dark:border-success-900 dark:bg-success-950/30 dark:text-success-300"
              : "border-warning-200 bg-warning-50/70 text-warning-800 dark:border-warning-900 dark:bg-warning-950/30 dark:text-warning-300",
          )}
        >
          <span className="flex items-center gap-2 font-semibold">
            {clockedIn ? (
              <Check className="h-4 w-4" />
            ) : (
              <Clock3 className="h-4 w-4" />
            )}
            {clockedIn
              ? `Clocked in for this shift${clockInTime ? ` · ${clockInTime}` : ""}`
              : connected
                ? "Confirming clock-in…"
                : "Not clocked in yet"}
          </span>
          {!clockedIn && (
            <button
              type="button"
              onClick={onRecordClockIn}
              className="shrink-0 rounded-lg bg-warning-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-warning-700"
            >
              Record clock-in
            </button>
          )}
        </div>

        {connected ? (
          <CallStage
            call={call}
            selfLabel="You"
            remoteLabel={hospitalName}
            remoteFallbackName={hospitalName}
            remoteRole="the hospital"
            onHangup={call.leave}
            hangupLabel="Leave"
          />
        ) : (
          <section className="flex flex-col items-center gap-3 rounded-3xl border border-neutral-200 bg-white px-6 py-14 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <div className="rounded-full bg-neutral-100 p-5 dark:bg-neutral-800">
              <VideoOff className="h-10 w-10 text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {call.state === "ended"
                ? "You've left the consultation call."
                : "You're not connected to the consultation call."}
            </p>
            <Button
              type="button"
              onClick={call.openPreJoin}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {call.state === "ended" ? "Rejoin call" : "Join call"}
            </Button>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onWaitingRoom}
            className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Users className="h-4 w-4" />
            Waiting Room
          </button>
          <button
            type="button"
            onClick={onBackToShift}
            className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <UserRound className="h-4 w-4" />
            Patients ({patientsCount})
          </button>
        </div>
      </main>
    </>
  );
}
