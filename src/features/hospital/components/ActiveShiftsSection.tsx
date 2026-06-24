import { MoreHorizontal, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";

type ActiveShiftStatus = "in-progress" | "upcoming";

type ActiveShiftUi = {
  id: string;
  status: ActiveShiftStatus;
  workerName: string;
  workerRole: string;
  workerImage?: string;
  timeStart?: string;
  timeEnd?: string;
  startsInHours?: number;
  startsInMins?: number;
  progressPercent?: number;
};

const statusStyles: Record<ActiveShiftStatus, string> = {
  "in-progress": "bg-secondary-100 text-secondary-700",
  upcoming: "bg-warning-100 text-warning-700",
};

const statusLabels: Record<ActiveShiftStatus, string> = {
  "in-progress": "IN-PROGRESS",
  upcoming: "UPCOMING",
};

function computeStartsIn(
  scheduledStart?: string,
): { hours: number; mins: number } | null {
  if (!scheduledStart) return null;
  const start = new Date(scheduledStart);
  if (Number.isNaN(start.getTime())) return null;

  const diffMs = start.getTime() - Date.now();
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return { hours, mins };
}

export function ActiveShiftsSection() {
  const { getShifts } = useHospitalShift();

  const [upcoming, setUpcoming] = useState<ActiveShiftUi[]>([]);
  const [inProgress, setInProgress] = useState<ActiveShiftUi[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mappedUpcoming = useMemo(() => upcoming, [upcoming]);
  const mappedInProgress = useMemo(() => inProgress, [inProgress]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [upRes, inRes] = await Promise.all([
          getShifts({ status: "upcoming", page: 1, page_size: 5 }),
          getShifts({ status: "in_progress", page: 1, page_size: 5 }),
        ]);

        const toUi = (
          res: unknown,
          status: ActiveShiftStatus,
        ): ActiveShiftUi[] => {
          const payload = res as any;
          const list = payload?.data ?? payload?.shifts ?? payload ?? [];
          if (!Array.isArray(list)) return [];

          return list
            .slice(0, 6)
            .map((s: any) => {
              const id = String(s?.id ?? "");
              if (!id) return null;

              // Best-effort mapping from unknown backend shape.
              const scheduledStart =
                s?.scheduled_start ??
                s?.time_start ??
                s?.start_time ??
                undefined;
              const scheduledEnd =
                s?.scheduled_end ?? s?.time_end ?? s?.end_time ?? undefined;

              if (status === "upcoming") {
                const starts = computeStartsIn(scheduledStart);
                return {
                  id,
                  status,
                  workerName:
                    s?.clinician_name ??
                    s?.worker_name ??
                    s?.worker?.name ??
                    "",
                  workerRole:
                    s?.clinician_role ??
                    s?.worker_role ??
                    s?.worker?.role ??
                    "",
                  workerImage:
                    s?.clinician_avatar_url ?? s?.worker_image ?? undefined,
                  timeStart: undefined,
                  timeEnd: undefined,
                  startsInHours: starts?.hours,
                  startsInMins: starts?.mins,
                } satisfies ActiveShiftUi;
              }

              // in_progress mapping
              const durationProgress =
                typeof s?.progress_percent === "number"
                  ? s.progress_percent
                  : typeof s?.progressPercent === "number"
                    ? s.progressPercent
                    : undefined;

              return {
                id,
                status,
                workerName:
                  s?.clinician_name ?? s?.worker_name ?? s?.worker?.name ?? "",
                workerRole:
                  s?.clinician_role ?? s?.worker_role ?? s?.worker?.role ?? "",
                workerImage:
                  s?.clinician_avatar_url ?? s?.worker_image ?? undefined,
                timeStart:
                  typeof s?.time_start === "string"
                    ? s.time_start
                    : typeof scheduledStart === "string"
                      ? new Date(scheduledStart).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : undefined,
                timeEnd:
                  typeof s?.time_end === "string"
                    ? s.time_end
                    : typeof scheduledEnd === "string"
                      ? new Date(scheduledEnd).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : undefined,
                progressPercent: durationProgress,
              } satisfies ActiveShiftUi;
            })
            .filter(Boolean) as ActiveShiftUi[];
        };

        if (!cancelled) {
          setUpcoming(toUi(upRes, "upcoming"));
          setInProgress(toUi(inRes, "in-progress"));
        }
      } catch {
        if (!cancelled) {
          setUpcoming([]);
          setInProgress([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [getShifts]);

  const shifts = [...mappedInProgress, ...mappedUpcoming];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-neutral-900">
          Today's Active Shifts
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-secondary-700 hover:text-secondary-900"
        >
          View All
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-neutral-100 bg-white p-4 h-[160px]"
            />
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-neutral-800">
            No active shifts right now
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Check back later for upcoming or in-progress sessions.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="rounded-2xl border border-neutral-100 bg-white p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusStyles[shift.status]}`}
                >
                  {statusLabels[shift.status]}
                </span>
                <button className="text-neutral-400 hover:text-neutral-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary-100">
                  {shift.workerImage ? (
                    <img
                      src={shift.workerImage}
                      alt={shift.workerName || "Shift clinician"}
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-secondary-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {shift.workerName || "—"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {shift.workerRole || "—"}
                  </p>
                </div>
              </div>

              {shift.status === "in-progress" && (
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
                    <span>Duration:</span>
                    <span className="font-semibold text-neutral-700">
                      {shift.timeStart ?? "—"} - {shift.timeEnd ?? "—"}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-secondary-600 to-secondary-400"
                      style={{ width: `${shift.progressPercent ?? 0}%` }}
                    />
                  </div>
                </div>
              )}

              {shift.status === "upcoming" && (
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Starts In:</span>
                  <span className="font-bold text-neutral-800">
                    {shift.startsInHours ?? 0}h {shift.startsInMins ?? 0}m
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
