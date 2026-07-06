import { useEffect, useState } from "react";
import { Activity, AlertCircle, CalendarDays, DollarSign } from "lucide-react";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import {
  HospitalMetricsService,
  OverviewStats,
} from "@/features/hospital/services/hospitalMetricsService";

export function DashboardStatsRow() {
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    HospitalMetricsService.getOverviewStats().then((data) => {
      if (!cancelled) setStats(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={CalendarDays}
        value={stats.shiftsFilledThisMonth}
        label="Shifts filled this month"
        sublabel={`Out of ${stats.shiftsFilledTotal} total`}
        trend={
          stats.shiftsFilledTrendPct !== undefined
            ? { direction: "up", label: `+${stats.shiftsFilledTrendPct}%` }
            : undefined
        }
      />
      <StatCard
        icon={Activity}
        value={stats.activeNow}
        label="Active right now"
        sublabel="Currently in progress"
        trend={
          stats.activeNowTrendDelta !== undefined
            ? { direction: "up", label: `+${stats.activeNowTrendDelta}` }
            : undefined
        }
      />
      <StatCard
        icon={AlertCircle}
        value={stats.openShifts}
        label="Open shifts"
        sublabel="Awaiting assignment"
        trend={
          stats.openShiftsTrendDelta !== undefined
            ? {
                direction: stats.openShiftsTrendDelta >= 0 ? "up" : "down",
                label: `${stats.openShiftsTrendDelta}`,
              }
            : undefined
        }
      />
      <StatCard
        icon={DollarSign}
        value={stats.payrollThisWeek}
        label="Payroll this week"
        sublabel="Across all shifts"
        trend={
          stats.payrollThisWeekTrendPct !== undefined
            ? { direction: "up", label: `+${stats.payrollThisWeekTrendPct}%` }
            : undefined
        }
      />
    </div>
  );
}
