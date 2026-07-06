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
  FillRateTrendPoint,
  HospitalMetricsService,
} from "@/features/hospital/services/hospitalMetricsService";
import { Skeleton } from "@/shared/components/ui/Skeleton";

export function FillRateTrendChart() {
  const [points, setPoints] = useState<FillRateTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    HospitalMetricsService.getFillRateTrendSeries().then((data) => {
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
      <div className="mb-4">
        <h3 className="text-base font-bold text-neutral-900">
          Fill Rate Trend
        </h3>
        <p className="text-xs text-neutral-400">% of shifts filled on time</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[240px] w-full" />
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRateTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
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
                domain={[60, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={40}
              />
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #f1f5f9",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#16a34a"
                strokeWidth={2.5}
                fill="url(#fillRateTrendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
