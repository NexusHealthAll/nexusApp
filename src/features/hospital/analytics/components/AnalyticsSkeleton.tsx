import { Skeleton } from "@/shared/components/ui/Skeleton";

const CARD =
  "rounded-2xl border border-neutral-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900";

/** Mirrors AnalyticsPage: 5 stat cards, trend chart + roles bars, ratings + departments. */
export function AnalyticsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading analytics">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          "Total Revenue",
          "Shift Fill Rate",
          "Avg. Response Time",
          "Completion Rate",
          "Cancelled Shifts",
        ].map((label) => (
          <div key={label} className={CARD}>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
            <Skeleton className="mt-3 h-7 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className={CARD}>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2 h-2.5 w-20" />
          <div className="mt-4 flex h-[260px] items-end gap-3">
            {[45, 60, 40, 75, 55, 85, 65, 90].map((h, i) => (
              <Skeleton
                key={i}
                className="w-full rounded-t-md"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className={CARD}>
          <Skeleton className="h-5 w-40" />
          <div className="mt-5 space-y-5">
            {[90, 70, 55, 35].map((w, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-6" />
                </div>
                <Skeleton className="mt-1.5 h-1.5 rounded-full" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className={CARD}>
          <Skeleton className="h-5 w-52" />
          <div className="mt-5 flex flex-col items-center gap-3 py-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
        </div>
        <div className={CARD}>
          <Skeleton className="h-5 w-44" />
          <div className="mt-3 divide-y divide-neutral-50 dark:divide-neutral-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="ml-auto h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
