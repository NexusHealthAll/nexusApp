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
  FillRatePoint,
  HospitalMetricsService,
} from "@/features/hospital/services/hospitalMetricsService";
import { Skeleton } from "@/shared/components/ui/Skeleton";

export function ShiftFillRateChart() {
  const [points, setPoints] = useState<FillRatePoint[]>([]);
  const [avgFillRate, setAvgFillRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    HospitalMetricsService.getFillRateSeries().then((data) => {
      if (cancelled) return;
      setPoints(data.points);
      setAvgFillRate(data.avgFillRate);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-neutral-900">
            Shift Fill Rate
          </h3>
          <p className="text-xs text-neutral-400">
            Filled vs total shifts per month
          </p>
        </div>
        {avgFillRate !== null && (
          <span className="rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-700">
            {avgFillRate}% avg fill rate
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
                <linearGradient id="fillRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
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
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #f1f5f9",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="filled"
                stroke="#0d9488"
                strokeWidth={2.5}
                fill="url(#fillRateGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
