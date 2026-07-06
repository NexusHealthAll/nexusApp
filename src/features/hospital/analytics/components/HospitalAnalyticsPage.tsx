import { useEffect, useState } from "react";
import { CalendarDays, Clock, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import {
  AnalyticsStats,
  HospitalMetricsService,
  UrgencyBreakdownRow,
} from "@/features/hospital/services/hospitalMetricsService";
import { WeeklyPayrollChart } from "@/features/hospital/components/charts/WeeklyPayrollChart";
import { FillRateTrendChart } from "@/features/hospital/components/charts/FillRateTrendChart";

const urgencyBarClass: Record<UrgencyBreakdownRow["variant"], string> = {
  error: "bg-error-500",
  warning: "bg-warning-500",
  success: "bg-success-500",
  info: "bg-primary-500",
  neutral: "bg-neutral-400",
};

const urgencyTextClass: Record<UrgencyBreakdownRow["variant"], string> = {
  error: "text-error-600",
  warning: "text-warning-600",
  success: "text-success-700",
  info: "text-primary-700",
  neutral: "text-neutral-600",
};

export function HospitalAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [urgencyRows, setUrgencyRows] = useState<UrgencyBreakdownRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      HospitalMetricsService.getAnalyticsStats(),
      HospitalMetricsService.getUrgencyBreakdown(),
    ]).then(([analyticsStats, urgency]) => {
      if (cancelled) return;
      setStats(analyticsStats);
      setUrgencyRows(urgency);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Analytics</h1>
        <p className="text-sm text-neutral-400">Performance overview for your hospital</p>
      </div>

      {!stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={CalendarDays}
            value={stats.shiftsThisMonth}
            label="Shifts this month"
            sublabel={`${stats.shiftsRemaining} remaining`}
            trend={
              stats.shiftsTrendPct !== undefined
                ? { direction: "up", label: `+${stats.shiftsTrendPct}%` }
                : undefined
            }
          />
          <StatCard
            icon={TrendingUp}
            value={`${stats.fillRate}%`}
            label="Fill rate"
            sublabel={
              stats.fillRateLastMonth !== undefined
                ? `vs ${stats.fillRateLastMonth}% last month`
                : undefined
            }
            trend={
              stats.fillRateTrendPp !== undefined
                ? { direction: "up", label: `+${stats.fillRateTrendPp}pp` }
                : undefined
            }
          />
          <StatCard
            icon={Clock}
            value={stats.avgTimeToFill}
            label="Avg time to fill"
            sublabel={`STAT shifts: ${stats.statAvgTimeToFill}`}
            trend={
              stats.avgTimeToFillTrendLabel
                ? { direction: "up", label: stats.avgTimeToFillTrendLabel }
                : undefined
            }
          />
          <StatCard
            icon={DollarSign}
            value={stats.totalPayroll}
            label="Total payroll"
            sublabel={stats.totalPayrollMonthLabel}
            trend={
              stats.totalPayrollTrendPct !== undefined
                ? { direction: "up", label: `+${stats.totalPayrollTrendPct}%` }
                : undefined
            }
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyPayrollChart />
        <FillRateTrendChart />
      </div>

      <div className="rounded-2xl border border-neutral-100 bg-white p-5">
        <h3 className="mb-4 text-base font-bold text-neutral-900">
          Shifts by Urgency Level
        </h3>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : urgencyRows.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-400">
            No shifts yet to break down by urgency.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {urgencyRows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className={`font-semibold ${urgencyTextClass[row.variant]}`}>
                    {row.label}
                  </span>
                  <span className="font-bold text-neutral-900">{row.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full ${urgencyBarClass[row.variant]}`}
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-neutral-400">
                  {row.percentage}% of total
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
