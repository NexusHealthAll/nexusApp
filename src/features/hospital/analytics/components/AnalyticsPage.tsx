import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Star } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { PATHS } from "@/routes/paths";
import { cn } from "@/shared/utils/cn";
import { downloadCsv } from "@/shared/utils/downloadCsv";
import { HospitalMetricsService } from "@/features/hospital/services/hospitalMetricsService";

type AnalyticsOverview = Awaited<
  ReturnType<typeof HospitalMetricsService.getAnalyticsOverview>
>;

type Period = "weekly" | "monthly" | "yearly";

/** Analytics page per the Figma redesign, computed from the shifts API. */
export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [period, setPeriod] = useState<Period>("weekly");

  useEffect(() => {
    let cancelled = false;
    HospitalMetricsService.getAnalyticsOverview().then((overview) => {
      if (!cancelled) setData(overview);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = () => {
    if (!data) return;
    downloadCsv(
      "analytics-report.csv",
      ["Week", "Committed (NGN)", "Spending (NGN)"],
      data.trend.map((p) => [p.week, p.committed, p.spending]),
    );
  };

  const maxRoleCount = Math.max(1, ...(data?.rolesRequested.map((r) => r.count) ?? [1]));

  return (
    <div>
      <PageHeader
        title="Analytics"
        breadcrumbs={[
          { label: "Dashboard", href: PATHS.hospital.dashboard },
          { label: "Analytics" },
        ]}
        actions={
          <>
            <FilterTabs<Period>
              options={[
                { label: "Weekly", value: "weekly" },
                { label: "Monthly", value: "monthly" },
                { label: "Yearly", value: "yearly" },
              ]}
              value={period}
              onChange={setPeriod}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-1.5 text-sm font-semibold"
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </>
        }
      />

      {data === null ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[110px] w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-[340px] w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "Total Revenue", value: data.totalRevenue },
              { label: "Shift Fill Rate", value: `${data.fillRatePct}%` },
              { label: "Avg. Response Time", value: "—" },
              { label: "Completion Rate", value: `${data.completionRatePct}%` },
              {
                label: "Cancelled Shifts",
                value: data.cancelledShifts,
                tone: "text-error-600",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-neutral-100 bg-white p-5"
              >
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <p
                  className={cn(
                    "mt-2 text-2xl font-bold tracking-tight",
                    stat.tone ?? "text-neutral-900",
                  )}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Trend + roles */}
          <div className="mt-4 grid gap-4 xl:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-neutral-100 bg-white p-5">
              <h2 className="text-base font-bold text-neutral-900">
                Revenue & Spending Trend
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Last 8 weeks
              </p>
              <div className="mt-4 h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.trend}
                    margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="committedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0f766e" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#0f766e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      width={48}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #f1f5f9",
                        fontSize: 12,
                      }}
                      formatter={(value, name) => [
                        `₦${Number(value ?? 0).toLocaleString()}`,
                        name,
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="committed"
                      name="Revenue"
                      stroke="#0f766e"
                      strokeWidth={2.5}
                      fill="url(#committedFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="spending"
                      name="Spending"
                      stroke="#14b8a6"
                      strokeWidth={2.5}
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#0f766e]" />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#14b8a6]" />
                  Spending
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-white p-5">
              <h2 className="text-base font-bold text-neutral-900">
                Most Requested Roles
              </h2>
              <div className="mt-5 space-y-5">
                {data.rolesRequested.length === 0 ? (
                  <p className="text-sm text-neutral-400">No shifts yet.</p>
                ) : (
                  data.rolesRequested.map((role) => (
                    <div key={role.role}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-700">{role.role}</span>
                        <span className="font-semibold text-neutral-400">
                          {role.count}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-secondary-600"
                          style={{
                            width: `${(role.count / maxRoleCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Ratings + departments */}
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-neutral-100 bg-white p-5">
              <h2 className="text-base font-bold text-neutral-900">
                Worker Ratings Distribution
              </h2>
              {/* No aggregate ratings endpoint yet — rate workers after shifts to populate this. */}
              <EmptyState
                icon={<EmptyStateIcon icon={Star} tone="warning" />}
                title="No worker ratings yet"
                description="Rate workers after completed shifts and the ratings distribution will appear here."
                className="mt-4 border-0"
              />
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-white p-5">
              <h2 className="text-base font-bold text-neutral-900">
                Department Performance
              </h2>
              {data.departments.length === 0 ? (
                <p className="mt-4 text-sm text-neutral-400">No shifts yet.</p>
              ) : (
                <ul className="mt-2 divide-y divide-neutral-50">
                  {data.departments.map((dept) => (
                    <li
                      key={dept.name}
                      className="flex items-center justify-between gap-4 py-3.5 text-sm"
                    >
                      <span className="font-medium text-neutral-800">
                        {dept.name}
                      </span>
                      <span className="ml-auto text-neutral-400">
                        {dept.shifts} shift{dept.shifts === 1 ? "" : "s"}
                      </span>
                      <span
                        className={cn(
                          "w-24 text-right font-bold",
                          dept.fillRatePct >= 90
                            ? "text-success-600"
                            : dept.fillRatePct >= 85
                              ? "text-secondary-600"
                              : "text-warning-500",
                        )}
                      >
                        {dept.fillRatePct}% fill rate
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
