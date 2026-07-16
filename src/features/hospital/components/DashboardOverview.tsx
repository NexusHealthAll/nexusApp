import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Download,
  UserRound,
} from "lucide-react";
import { MetricCard } from "@/shared/components/ui/MetricCard";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { downloadCsv } from "@/shared/utils/downloadCsv";
import { useHospitalProfile } from "@/features/hospital/hooks/useHospitalProfile";
import {
  HospitalMetricsService,
  type DashboardHeroStats,
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

/** Hospital dashboard matching the Figma redesign. */
export function DashboardOverview() {
  // Primes the shared hospital-profile cache as early as possible — the
  // header, approval-status gating, etc. all read from the same cache
  // instead of independently re-fetching (see `useHospitalProfile`).
  const { profile } = useHospitalProfile();

  const [stats, setStats] = useState<DashboardHeroStats | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    HospitalMetricsService.getDashboardHeroStats().then((data) => {
      if (!cancelled) setStats(data);
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-400">{today}</p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 lg:text-3xl">
            {greetingForNow()}
            {adminFirstName ? `, ${adminFirstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {profile?.name ?? ""}
            {stats
              ? ` • ${stats.needsAttentionToday} shift${
                  stats.needsAttentionToday === 1 ? "" : "s"
                } need attention today`
              : ""}
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Stat cards */}
      {stats === null ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[124px] w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Weekly Revenue"
            value={stats.weeklyRevenue}
            icon={CircleDollarSign}
            sub="billed in the last 7 days"
          />
          <MetricCard
            label="Shift Fill Rate"
            value={`${stats.fillRatePct}%`}
            icon={CheckCircle2}
            sub="average over recent months"
          />
          <MetricCard
            label="Open Shifts"
            value={stats.openShifts}
            icon={Clock}
            tone="warning"
            sub={
              stats.urgentOpenShifts > 0 ? (
                <span className="font-semibold text-warning-600">
                  {stats.urgentOpenShifts} urgent · needs review
                </span>
              ) : (
                "no urgent shifts"
              )
            }
          />
          <MetricCard
            label="Worker Availability"
            value={availableWorkers ?? "—"}
            icon={UserRound}
            sub={
              availableWorkers === null
                ? "no worker data yet"
                : "within 15 miles"
            }
          />
        </div>
      )}

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
