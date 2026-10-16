import { Skeleton } from "@/shared/components/ui/Skeleton";

const CARD =
  "rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900";

function LabelValue() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

/** Mirrors ShiftApprovalPage: back link, title + status badge, actions, info/description/tasks cards, side map + cost. */
export function ShiftDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading shift">
      <Skeleton className="h-5 w-16" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className={CARD}>
            <Skeleton className="mb-5 h-3 w-36" />
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <LabelValue key={i} />
              ))}
            </div>
            <div className="mt-6 flex gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>

          <div className={CARD}>
            <Skeleton className="mb-4 h-3 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          <div className={CARD}>
            <Skeleton className="mb-4 h-3 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-56 max-w-full" />
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={CARD}>
            <Skeleton className="mb-3 h-3 w-24" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="mt-3 h-4 w-40" />
          </div>
          <div className={CARD}>
            <Skeleton className="mb-4 h-3 w-28" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
