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
  HoursWorkedPoint,
  HealthWorkerService,
} from "@/features/health-worker/services/healthWorkerService";
import { Skeleton } from "@/shared/components/ui/Skeleton";

export function HoursWorkedChart({ workerId }: { workerId: string }) {
  const [points, setPoints] = useState<HoursWorkedPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    HealthWorkerService.getHoursWorkedSeries(workerId).then((data) => {
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
      <h3 className="text-base font-bold text-neutral-900">Hours Worked</h3>
      <p className="mb-4 text-xs text-neutral-400">This month by week</p>

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
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={32}
              />
              <Tooltip
                formatter={(value) => `${value}h`}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #f1f5f9",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="hours" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
