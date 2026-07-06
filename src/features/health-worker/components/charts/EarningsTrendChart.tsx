import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
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

export function EarningsTrendChart({ workerId }: { workerId: string }) {
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

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5">
      <h3 className="text-base font-bold text-neutral-900">Monthly Earnings Trend</h3>
      <p className="mb-4 text-xs text-neutral-400">Last 6 months</p>

      {isLoading ? (
        <Skeleton className="h-[240px] w-full" />
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
              <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
