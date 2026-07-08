import { useEffect, useState } from "react";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import { useCreateShiftModalStore } from "@/features/hospital/shifts/hooks/useCreateShiftModalStore";
import { formatTime } from "@/shared/utils/date";
import type { ApiShift } from "@/features/hospital/shifts/types";

type ActiveShiftStatus = "in-progress" | "upcoming";

type ActiveShiftUi = {
  id: string;
  status: ActiveShiftStatus;
  roleTitle: string;
  specialty?: string;
  timeStart?: string;
  timeEnd?: string;
  startsInHours?: number;
  startsInMins?: number;
};

const statusBadgeVariant: Record<ActiveShiftStatus, "success" | "warning"> = {
  "in-progress": "success",
  upcoming: "warning",
};

const statusLabels: Record<ActiveShiftStatus, string> = {
  "in-progress": "Live",
  upcoming: "Upcoming",
};

function computeStartsIn(
  scheduledStart: string,
): { hours: number; mins: number } | null {
  const start = new Date(scheduledStart);
  if (Number.isNaN(start.getTime())) return null;

  const diffMs = start.getTime() - Date.now();
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return { hours, mins };
}

function toUi(shifts: ApiShift[], status: ActiveShiftStatus): ActiveShiftUi[] {
  return shifts.slice(0, 6).map((s) => {
    if (status === "upcoming") {
      const starts = computeStartsIn(s.scheduled_start);
      return {
        id: s.id,
        status,
        roleTitle: s.role_title,
        specialty: s.specialty ?? s.department ?? undefined,
        startsInHours: starts?.hours,
        startsInMins: starts?.mins,
      } satisfies ActiveShiftUi;
    }

    return {
      id: s.id,
      status,
      roleTitle: s.role_title,
      specialty: s.specialty ?? s.department ?? undefined,
      timeStart: formatTime(s.scheduled_start, { hour: "2-digit", minute: "2-digit" }),
      timeEnd: formatTime(s.scheduled_end, { hour: "2-digit", minute: "2-digit" }),
    } satisfies ActiveShiftUi;
  });
}

export function ActiveShiftsSection() {
  const { getShifts } = useHospitalShift();
  const refreshKey = useCreateShiftModalStore((s) => s.refreshKey);

  const [upcoming, setUpcoming] = useState<ActiveShiftUi[]>([]);
  const [inProgress, setInProgress] = useState<ActiveShiftUi[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [upRes, inRes] = await Promise.all([
          getShifts({ status: "upcoming", page: 1, page_size: 5 }),
          getShifts({ status: "in_progress", page: 1, page_size: 5 }),
        ]);

        if (!cancelled) {
          setUpcoming(toUi(upRes.shifts, "upcoming"));
          setInProgress(toUi(inRes.shifts, "in-progress"));
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
  }, [getShifts, refreshKey]);

  const shifts = [...inProgress, ...upcoming];
  const liveCount = inProgress.length;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900">
          <span className="h-2 w-2 rounded-full bg-success-500" />
          Active Shifts
        </h2>
        <span className="text-xs text-neutral-400">{liveCount} live</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[56px] animate-pulse rounded-xl bg-neutral-50"
            />
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <EmptyState
          className="min-h-[220px]"
          icon={
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Background card */}
              <rect x="8" y="18" width="80" height="62" rx="12" fill="#F0FDF4" />
              <rect x="8" y="18" width="80" height="62" rx="12" stroke="#BBF7D0" strokeWidth="1.5" strokeDasharray="4 3" />
              {/* Calendar header */}
              <rect x="8" y="18" width="80" height="20" rx="12" fill="#6EE7B7" />
              <rect x="8" y="30" width="80" height="8" fill="#6EE7B7" />
              {/* Header dots */}
              <circle cx="24" cy="28" r="3.5" fill="white" fillOpacity="0.6" />
              <circle cx="48" cy="28" r="3.5" fill="white" fillOpacity="0.6" />
              <circle cx="72" cy="28" r="3.5" fill="white" fillOpacity="0.6" />
              {/* Row lines */}
              <line x1="20" y1="50" x2="76" y2="50" stroke="#D1FAE5" strokeWidth="1" />
              <line x1="20" y1="62" x2="76" y2="62" stroke="#D1FAE5" strokeWidth="1" />
              {/* Empty placeholder bars */}
              <rect x="20" y="54" width="18" height="3.5" rx="1.75" fill="#D1FAE5" />
              <rect x="42" y="54" width="30" height="3.5" rx="1.75" fill="#D1FAE5" />
              <rect x="20" y="65" width="24" height="3.5" rx="1.75" fill="#D1FAE5" />
              <rect x="48" y="65" width="20" height="3.5" rx="1.75" fill="#D1FAE5" />
              {/* Moon badge */}
              <circle cx="74" cy="20" r="14" fill="#ECFDF5" />
              <circle cx="74" cy="20" r="14" stroke="#6EE7B7" strokeWidth="1.5" />
              <path d="M76 12C72.134 12 69 15.134 69 19C69 22.866 72.134 26 76 26C77.657 26 79.172 25.414 80.356 24.443C79.507 24.799 78.578 25 77.6 25C73.84 25 70.8 21.96 70.8 18.2C70.8 15.14 72.773 12.537 75.536 11.617C75.69 11.54 75.845 12 76 12Z" fill="#34D399" />
            </svg>
          }
          title="No active shifts right now"
          description="Active and upcoming shifts will appear here once they're scheduled."
        />
      ) : (
        <div className="divide-y divide-neutral-50">
          {shifts.map((shift) => (
            <div key={shift.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">
                  {shift.roleTitle || "—"}
                </p>
                <p className="truncate text-xs text-neutral-500">
                  {shift.specialty ?? "—"}
                  {shift.status === "in-progress" &&
                    ` • ${shift.timeStart}–${shift.timeEnd}`}
                  {shift.status === "upcoming" &&
                    ` • Starts in ${shift.startsInHours ?? 0}h ${shift.startsInMins ?? 0}m`}
                </p>
              </div>
              <Badge variant={statusBadgeVariant[shift.status]} className="flex-shrink-0">
                {statusLabels[shift.status]}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
