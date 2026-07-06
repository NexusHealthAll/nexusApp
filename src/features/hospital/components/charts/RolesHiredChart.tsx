import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  HospitalMetricsService,
  RoleHiredSlice,
} from "@/features/hospital/services/hospitalMetricsService";
import { Skeleton } from "@/shared/components/ui/Skeleton";

export function RolesHiredChart() {
  const [slices, setSlices] = useState<RoleHiredSlice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    HospitalMetricsService.getRolesHiredBreakdown().then((data) => {
      if (cancelled) return;
      setSlices(data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-neutral-900">Roles Hired</h3>
        <p className="text-xs text-neutral-400">Last 30 days</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[220px] w-full" />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="h-[140px] w-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="percentage"
                  nameKey="role"
                  innerRadius={40}
                  outerRadius={64}
                  paddingAngle={2}
                  stroke="none"
                >
                  {slices.map((slice) => (
                    <Cell key={slice.role} fill={slice.colorClass} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="w-full space-y-2">
            {slices.map((slice) => (
              <li
                key={slice.role}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-neutral-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${slice.dotClass}`} />
                  {slice.role}
                </span>
                <span className="font-semibold text-neutral-900">
                  {slice.percentage}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
