import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, ChevronRight } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { PATHS } from "@/routes/paths";
import { HospitalMetricsService } from "@/features/hospital/services/hospitalMetricsService";
import { shiftStatusDisplay } from "@/features/hospital/shifts/shiftStatusDisplay";
import type { ApiShift } from "@/features/hospital/shifts/types";

function timeRange(shift: ApiShift): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  return `${fmt(shift.scheduled_start)} – ${fmt(shift.scheduled_end)}`;
}

/** Dashboard "Today's Active Shifts" list backed by the real shifts API. */
export function TodaysShiftsCard() {
  const [shifts, setShifts] = useState<ApiShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    HospitalMetricsService.getTodaysShifts().then((data) => {
      if (cancelled) return;
      setShifts(data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-neutral-900">
          Today's Active Shifts
        </h3>
        <Link
          to={PATHS.hospital.shifts}
          className="flex items-center gap-1 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
        >
          View all shifts
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : shifts.length === 0 ? (
          <EmptyState
            icon={<EmptyStateIcon icon={CalendarPlus} />}
            title="No shifts scheduled today"
            description="Shifts running today will show up here."
            action={
              <Link
                to={PATHS.hospital.createShift}
                className="mt-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                Create a Shift
              </Link>
            }
            className="border-0"
          />
        ) : (
          <ul className="divide-y divide-neutral-50">
            {shifts.map((shift) => {
              const status = shiftStatusDisplay[shift.status];
              return (
                <li key={shift.id}>
                  <Link
                    to={PATHS.hospital.shiftDetail(shift.id)}
                    className="flex items-center gap-3 rounded-xl px-1 py-3 transition-colors hover:bg-neutral-50"
                  >
                    <AvatarInitials
                      name={shift.shift_label || shift.role_title}
                      size="md"
                      className="rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {shift.shift_label || shift.role_title}
                        {shift.department ? ` · ${shift.department}` : ""}
                      </p>
                      <p className="truncate text-xs text-neutral-400">
                        {timeRange(shift)} · {shift.role_title}
                      </p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
