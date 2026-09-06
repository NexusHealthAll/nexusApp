import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Star, Video, VideoOff, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { PATHS } from "@/routes/paths";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import { shiftStatusDisplay } from "@/features/hospital/shifts/shiftStatusDisplay";
import type { ApiShift } from "@/features/hospital/shifts/types";
import { PreJoinScreen } from "@/features/virtual-call/components/PreJoinScreen";
import { CallStage } from "@/features/virtual-call/components/CallStage";
import { useVirtualCallRoom } from "@/features/virtual-call/useVirtualCallRoom";
import { getCallWindowInfo, type CallWindowState } from "../callWindow";

interface WorkerPublicDetail {
  first_name: string;
  last_name: string;
  rating: number;
  role_title: string;
}

const CALL_BUTTON_LABEL: Record<CallWindowState, string> = {
  too_early: "Call Not Open Yet",
  open: "Connect Device & Join Call",
  elapsed: "Call Window Closed",
  completed: "Consultation Completed",
  unavailable: "Call Unavailable",
};

export function VirtualSessionPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { getShiftDetails } = useHospitalShift();

  const [shift, setShift] = useState<ApiShift | null>(null);
  const [loadError, setLoadError] = useState("");
  const [physician, setPhysician] = useState<WorkerPublicDetail | null>(null);
  const [now, setNow] = useState(() => new Date());

  const call = useVirtualCallRoom(shiftId, "hospital virtual shift page");

  // Load the real shift; recheck the call window every 30s so the button
  // flips from disabled -> enabled without a manual refresh.
  useEffect(() => {
    if (!shiftId) return;
    let cancelled = false;
    getShiftDetails(shiftId)
      .then((data) => {
        if (cancelled) return;
        setShift(data);
        if (data.assigned_clinician_id) {
          apiClient
            .get<WorkerPublicDetail>(
              `/api/v1/workers/${data.assigned_clinician_id}`,
            )
            .then((res) => {
              if (!cancelled) setPhysician(res.data);
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : "Couldn't load this shift.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {loadError}
        </p>
        <button
          onClick={() => navigate(PATHS.hospital.virtualShifts)}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Back to Virtual Shifts
        </button>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Loading session...
        </p>
      </div>
    );
  }

  const callWindow = getCallWindowInfo(shift, now);
  const isConnected = call.state === "connected";
  const isConnecting = call.state === "connecting";
  const isPreJoin =
    call.state === "prejoin" ||
    call.state === "connecting" ||
    call.state === "error";
  const canConnect = callWindow.state === "open" && call.state === "idle";
  const physicianName = physician
    ? `Dr. ${physician.first_name} ${physician.last_name}`
    : null;

  const statusPill = isConnected
    ? {
        label: "In Consultation",
        className:
          "border border-success-400/40 bg-success-500/10 text-success-700 dark:text-success-400",
      }
    : shift.status === "completed" || call.state === "ended"
      ? {
          label: "Completed",
          className:
            "border border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400",
        }
      : isPreJoin
        ? {
            label: isConnecting ? "Connecting Device" : "Device Check",
            className:
              "border border-primary-400/40 text-primary-600 dark:text-primary-300",
          }
        : {
            label: shiftStatusDisplay[shift.status].label,
            className:
              "border border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400",
          };

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-neutral-50 dark:bg-[#0d1424]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-neutral-100 bg-neutral-50/95 px-4 backdrop-blur dark:border-white/5 dark:bg-[#0d1424]/95 lg:px-6">
        <button
          onClick={() => navigate(PATHS.hospital.virtualShifts)}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-white/80 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Virtual Shifts
        </button>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            statusPill.className,
          )}
        >
          {isConnected && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-500" />
          )}
          {statusPill.label}
        </span>
      </div>

      {isPreJoin ? (
        <div className="flex-1 bg-[#0d1424]">
          <PreJoinScreen
            selfName="You"
            remotePresent={call.present}
            remotePresentName={call.presentName ?? physicianName}
            joining={isConnecting}
            error={call.error || undefined}
            onJoin={call.join}
            onCancel={call.cancelPreJoin}
          />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl px-4 pb-12 lg:px-6">
          {/* Heading */}
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary-600 dark:text-secondary-400">
                {shift.specialty ?? shift.role_title} • Virtual Visit
              </p>
              <h1 className="mt-1.5 text-3xl font-bold text-neutral-900 dark:text-white">
                {shift.role_title}
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-white/50">
              {new Date(shift.scheduled_start).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Video area */}
          {isConnected ? (
            <CallStage
              call={call}
              className="mt-6"
              selfLabel="You · Kiosk device"
              remoteLabel={physicianName ?? "Clinician"}
              remoteFallbackName={physicianName}
              remoteRole="clinician"
              onHangup={call.end}
              hangupLabel="End"
            />
          ) : (
            <div className="relative mt-6 flex aspect-video flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#202124] px-6 text-center">
              <VideoOff className="h-10 w-10 text-white/25" />
              <p className="mt-4 max-w-sm text-sm text-white/60">
                {call.state === "ended"
                  ? "This consultation has ended."
                  : callWindow.message}
              </p>
              {call.error && (
                <p className="mt-2 max-w-sm text-sm text-error-400">
                  {call.error}
                </p>
              )}
              {call.state !== "ended" && (
                <Tooltip content={!canConnect ? callWindow.message : undefined}>
                  <Button
                    onClick={call.openPreJoin}
                    disabled={!canConnect}
                    className="mt-6 flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    {CALL_BUTTON_LABEL[callWindow.state]}
                  </Button>
                </Tooltip>
              )}
            </div>
          )}

          {/* Bottom grid */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* Session summary */}
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Session
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-white/50">Status</dt>
                  <dd className="font-semibold text-neutral-900 dark:text-white">
                    {shiftStatusDisplay[shift.status].label}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-white/50">
                    Department
                  </dt>
                  <dd className="font-semibold text-neutral-900 dark:text-white">
                    {shift.department ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-white/50">
                    Call window
                  </dt>
                  <dd className="max-w-[220px] text-right font-semibold text-neutral-900 dark:text-white">
                    {callWindow.message}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-4">
              {/* Remote physician */}
              <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Remote Physician
                </h2>
                {physicianName ? (
                  <div className="mt-4 flex items-center gap-3">
                    <AvatarInitials
                      name={physicianName}
                      size="md"
                      className="bg-secondary-500 font-bold text-white"
                    />
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">
                        {physicianName}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-white/50">
                        {physician?.role_title ?? "Clinician"} •
                        <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
                        {physician?.rating?.toFixed(1) ?? "—"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-neutral-400 dark:text-white/40">
                    No clinician assigned yet.
                  </p>
                )}
              </div>

              {/* Diagnostics */}
              {isConnected && (
                <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    Device Diagnostics
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <span className="flex items-center justify-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-700 dark:border-white/10 dark:bg-black/30 dark:text-white/80">
                      {call.cameraOn ? (
                        <Check className="h-4 w-4 text-success-500" />
                      ) : (
                        <X className="h-4 w-4 text-error-500" />
                      )}
                      {call.cameraOn ? "Camera OK" : "Camera Off"}
                    </span>
                    <span className="flex items-center justify-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-700 dark:border-white/10 dark:bg-black/30 dark:text-white/80">
                      {call.micOn ? (
                        <Check className="h-4 w-4 text-success-500" />
                      ) : (
                        <X className="h-4 w-4 text-error-500" />
                      )}
                      {call.micOn ? "Microphone OK" : "Microphone Muted"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate(`${PATHS.hospital.shifts}/${shift.id}`)}
              className="h-12 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/85 dark:hover:bg-white/[0.07]"
            >
              View Shift Details
            </button>
            <button
              onClick={() => navigate(PATHS.hospital.handoverReports)}
              className="h-12 rounded-xl bg-[#2563eb] text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              View Handover Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
