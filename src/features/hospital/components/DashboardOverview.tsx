import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Download,
  UserRound,
} from "lucide-react";
import { MetricCard, MetricTrend } from "@/shared/components/ui/MetricCard";
import { downloadCsv } from "@/shared/utils/downloadCsv";
import { useHospitalProfile } from "@/features/hospital/hooks/useHospitalProfile";
import {
  HospitalMetricsService,
  type DashboardHeroStats,
  type SpendVsFillRatePoint,
} from "@/features/hospital/services/hospitalMetricsService";
import { WorkerDirectoryService } from "@/features/hospital/workers/workerDirectoryService";
import { SpendVsFillRateChart } from "./charts/SpendVsFillRateChart";
import { RecentActivityCard } from "./RecentActivityCard";
import { TodaysShiftsCard } from "./TodaysShiftsCard";
import { NearbyWorkersCard } from "./NearbyWorkersCard";

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** % change from the prior week; undefined when there is no baseline to compare. */
function weekOverWeek(
  series: SpendVsFillRatePoint[],
  pick: (p: SpendVsFillRatePoint) => number,
): number | undefined {
  if (series.length < 2) return undefined;
  const prev = pick(series[series.length - 2]);
  const curr = pick(series[series.length - 1]);
  if (prev <= 0) return undefined;
  return ((curr - prev) / prev) * 100;
}

/** Hospital dashboard matching the Figma redesign. */
export function DashboardOverview() {
  // Primes the shared hospital-profile cache as early as possible — the
  // header, approval-status gating, etc. all read from the same cache
  // instead of independently re-fetching (see `useHospitalProfile`).
  const { profile } = useHospitalProfile();

  const [stats, setStats] = useState<DashboardHeroStats | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<number | null>(null);
  const [series, setSeries] = useState<SpendVsFillRatePoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    HospitalMetricsService.getDashboardHeroStats().then((data) => {
      if (!cancelled) setStats(data);
    });
    HospitalMetricsService.getSpendVsFillRateSeries().then((data) => {
      if (!cancelled) setSeries(data);
    });
    WorkerDirectoryService.getAvailableCount().then((count) => {
      if (!cancelled) setAvailableWorkers(count);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExportReport = async () => {
    const series = await HospitalMetricsService.getSpendVsFillRateSeries();
    downloadCsv(
      "weekly-report.csv",
      ["Week", "Spending (NGN)", "Fill Rate (%)"],
      series.map((p) => [p.week, p.spending, p.fillRate]),
    );
  };

  const revenueTrend = weekOverWeek(series, (p) => p.spending);
  const fillRateTrend = weekOverWeek(series, (p) => p.fillRate);

  const adminFirstName = profile?.adminName?.split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl dark:text-neutral-50">
            {greetingForNow()}
            {adminFirstName ? `, ${adminFirstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {profile?.name ?? ""}
            {stats
              ? ` • ${stats.needsAttentionToday} shift${
                  stats.needsAttentionToday === 1 ? "" : "s"
                } need attention today`
              : ""}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            {today}
          </p>
          <button
            onClick={handleExportReport}
            className="flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Weekly Revenue"
            value={stats?.weeklyRevenue}
            loading={stats === null}
            icon={CircleDollarSign}
            sub={
              revenueTrend === undefined ? (
                "billed in the last 7 days"
              ) : (
                <MetricTrend pct={revenueTrend} />
              )
            }
          />
          <MetricCard
            label="Shift Fill Rate"
            value={`${stats?.fillRatePct}%`}
            loading={stats === null}
            icon={CheckCircle2}
            sub={
              fillRateTrend === undefined ? (
                "average over recent months"
              ) : (
                <MetricTrend pct={fillRateTrend} />
              )
            }
          />
          <MetricCard
            label="Open Shifts"
            value={stats?.openShifts}
            loading={stats === null}
            icon={Clock}
            tone="warning"
            sub={
              stats && stats.urgentOpenShifts > 0 ? (
                <span className="font-semibold text-warning-600 dark:text-warning-400">
                  {stats?.urgentOpenShifts} urgent ·{" "}
                  <span className="underline underline-offset-2">
                    needs review
                  </span>
                </span>
              ) : (
                "no urgent shifts"
              )
            }
          />
          <MetricCard
            label="Worker Availability"
            value={availableWorkers ?? "0"}
            loading={stats === null}
            icon={UserRound}
            sub={
              availableWorkers === null
                ? "no worker data yet"
                : "within 15 miles"
            }
          />
      </div>

      {/* Chart + activity */}
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <SpendVsFillRateChart />
        <RecentActivityCard />
      </div>

      {/* Today's shifts + nearby workers */}
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <TodaysShiftsCard />
        <NearbyWorkersCard />
      </div>
    </div>
  );
}
