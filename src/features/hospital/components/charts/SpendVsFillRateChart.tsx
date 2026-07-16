import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  HospitalMetricsService,
  type SpendVsFillRatePoint,
} from "@/features/hospital/services/hospitalMetricsService";
import { Skeleton } from "@/shared/components/ui/Skeleton";

/**
 * Dashboard "Weekly Spending vs. Fill Rate" dual-line chart from the Figma
 * redesign — spending in blue, fill rate in teal, one point per week.
 */
export function SpendVsFillRateChart() {
  const [points, setPoints] = useState<SpendVsFillRatePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    HospitalMetricsService.getSpendVsFillRateSeries().then((data) => {
      if (cancelled) return;
      setPoints(data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-neutral-900">
            Weekly Spending vs. Fill Rate
          </h3>
          <p className="text-xs text-neutral-400">Last 7 weeks</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
            Spending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#0d9488]" />
            Fill Rate
          </span>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[280px] w-full" />
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={points}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                yAxisId="spending"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={44}
              />
              <YAxis
                yAxisId="fillRate"
                orientation="right"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={36}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #f1f5f9",
                  fontSize: 12,
                }}
                formatter={(value, name) =>
                  name === "Fill Rate"
                    ? [`${value}%`, name]
                    : [`₦${Number(value ?? 0).toLocaleString()}`, name]
                }
              />
              <Line
                yAxisId="spending"
                type="monotone"
                dataKey="spending"
                name="Spending"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
              />
              <Line
                yAxisId="fillRate"
                type="monotone"
                dataKey="fillRate"
                name="Fill Rate"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#0d9488", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
