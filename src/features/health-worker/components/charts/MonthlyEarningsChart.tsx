import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  EarningsSeriesPoint,
  HealthWorkerService,
} from "@/features/health-worker/services/healthWorkerService";
import { Skeleton } from "@/shared/components/ui/Skeleton";

function formatNaira(value: number): string {
  if (value >= 1000) return `₦${Math.round(value / 1000)}k`;
  return `₦${value}`;
}

export function MonthlyEarningsChart({ workerId }: { workerId: string }) {
  const [points, setPoints] = useState<EarningsSeriesPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    HealthWorkerService.getMonthlyEarningsSeries(workerId).then((data) => {
      if (!cancelled) {
        setPoints(data);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [workerId]);

  const last = points[points.length - 1]?.amount ?? 0;
  const prev = points[points.length - 2]?.amount ?? 0;
  const trendPct = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-neutral-900">Monthly Earnings</h3>
          <p className="text-xs text-neutral-400">Last 6 months</p>
        </div>
        {!isLoading && (
          <span className="rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-700">
            {trendPct >= 0 ? "+" : ""}
            {trendPct}% vs last month
          </span>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-[220px] w-full" />
      ) : (
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="hwEarningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatNaira}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={48}
              />
              <Tooltip
                formatter={(value) => formatNaira(Number(value))}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #f1f5f9",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#hwEarningsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
