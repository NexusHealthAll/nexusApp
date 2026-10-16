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
import { renderGridLineSkipTop } from "@/shared/utils/chartGrid";
import {
  HospitalMetricsService,
  type SpendVsFillRatePoint,
} from "@/features/hospital/services/hospitalMetricsService";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { cn } from "@/shared/utils/cn";

/** Loading placeholder: same plot structure as the chart (y-axes, grid, two series, 7 week labels). */
function ChartSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading chart" className="h-[280px] w-full">
      <div className="flex h-[252px] gap-2">
        <div className="flex w-11 flex-col justify-between py-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-8" />
          ))}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-0 flex flex-col justify-between py-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-px w-full bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full animate-pulse"
          >
            <path
              d="M0 70 C12 55 20 40 33 48 S55 72 66 52 S88 22 100 30 L100 100 L0 100 Z"
              className="fill-neutral-200/70 dark:fill-neutral-700/50"
            />
            <path
              d="M0 40 C12 30 20 52 33 38 S55 18 66 34 S88 44 100 20 L100 100 L0 100 Z"
              className="fill-neutral-200/40 dark:fill-neutral-700/30"
            />
            <path
              d="M0 70 C12 55 20 40 33 48 S55 72 66 52 S88 22 100 30"
              fill="none"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
              className="stroke-neutral-300 dark:stroke-neutral-600"
            />
            <path
              d="M0 40 C12 30 20 52 33 38 S55 18 66 34 S88 44 100 20"
              fill="none"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
              className="stroke-neutral-300/70 dark:stroke-neutral-600/70"
            />
          </svg>
        </div>
        <div className="flex w-9 flex-col justify-between py-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="ml-auto h-2.5 w-6" />
          ))}
        </div>
      </div>
      <div className="ml-[52px] mr-[44px] mt-2 flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 w-8" />
        ))}
      </div>
    </div>
  );
}

/** Illustrative curves drawn (dimmed) behind the empty-state message — not real data. */
const GHOST_POINTS: SpendVsFillRatePoint[] = [
  { week: "Wk 1", spending: 30, fillRate: 45 },
  { week: "Wk 2", spending: 55, fillRate: 62 },
  { week: "Wk 3", spending: 42, fillRate: 58 },
  { week: "Wk 4", spending: 70, fillRate: 74 },
  { week: "Wk 5", spending: 60, fillRate: 68 },
  { week: "Wk 6", spending: 85, fillRate: 82 },
  { week: "Wk 7", spending: 78, fillRate: 90 },
];

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

  const isEmpty =
    !isLoading && points.every((p) => p.spending === 0 && p.fillRate === 0);
  const spendColor = isEmpty ? "#cbd5e1" : "#2563eb";
  const fillColor = isEmpty ? "#94a3b8" : "#0d9488";

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
            Weekly Spending vs. Fill Rate
          </h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Last 7 weeks
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
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
        <ChartSkeleton />
      ) : (
        <div className="relative h-[280px] w-full">
          {isEmpty && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
              <div className="max-w-xs rounded-xl border border-neutral-100 bg-white/90 px-5 py-4 text-center shadow-soft backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  No spending or shifts yet
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Weekly spending and fill rate will chart here once your shifts
                  start running.
                </p>
              </div>
            </div>
          )}
          <div
            aria-hidden={isEmpty || undefined}
            className={cn(
              "h-full w-full",
              isEmpty && "pointer-events-none select-none opacity-50",
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={isEmpty ? GHOST_POINTS : points}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="spendGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={spendColor}
                      stopOpacity={0.35}
                    />
                    <stop offset="95%" stopColor={spendColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="fillRateGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={fillColor}
                      stopOpacity={0.35}
                    />
                    <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  horizontal={renderGridLineSkipTop}
                  stroke="#f1f5f9"
                />
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
                  tick={isEmpty ? false : { fill: "#94a3b8", fontSize: 12 }}
                  width={44}
                />
                <YAxis
                  yAxisId="fillRate"
                  orientation="right"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={isEmpty ? false : { fill: "#94a3b8", fontSize: 12 }}
                  width={36}
                  tickFormatter={(v) => `${v}%`}
                />
                {!isEmpty && (
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
                )}
                <Area
                  yAxisId="spending"
                  type="monotone"
                  dataKey="spending"
                  name="Spending"
                  stroke={spendColor}
                  strokeWidth={2.5}
                  fill="url(#spendGradient)"
                  dot={
                    isEmpty ? false : { r: 3, fill: spendColor, strokeWidth: 0 }
                  }
                  isAnimationActive={!isEmpty}
                />
                <Area
                  yAxisId="fillRate"
                  type="monotone"
                  dataKey="fillRate"
                  name="Fill Rate"
                  stroke={fillColor}
                  strokeWidth={2.5}
                  fill="url(#fillRateGradient)"
                  dot={
                    isEmpty ? false : { r: 3, fill: fillColor, strokeWidth: 0 }
                  }
                  isAnimationActive={!isEmpty}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
