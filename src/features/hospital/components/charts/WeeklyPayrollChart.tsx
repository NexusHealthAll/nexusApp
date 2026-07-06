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
  HospitalMetricsService,
  WeeklyPayrollPoint,
} from "@/features/hospital/services/hospitalMetricsService";
import { Skeleton } from "@/shared/components/ui/Skeleton";

function formatNaira(value: number): string {
  if (value >= 1000) return `₦${Math.round(value / 1000)}k`;
  return `₦${value}`;
}

export function WeeklyPayrollChart() {
  const [points, setPoints] = useState<WeeklyPayrollPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    HospitalMetricsService.getWeeklyPayrollSeries().then((data) => {
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
          Weekly Payroll
        </h3>
        <p className="text-xs text-neutral-400">₦ paid to workers</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[240px] w-full" />
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
