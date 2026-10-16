import { Skeleton } from "@/shared/components/ui/Skeleton";

const CARD =
  "rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900";

/** Mirrors VirtualSessionCard: icon tile, title/subtitle, status badge, step row, bar. */
export function VirtualSessionsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${CARD} p-5`}>
          <div className="flex items-start gap-4">
            <Skeleton className="h-11 w-11 flex-shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-56 max-w-full" />
              <Skeleton className="h-3 w-40 max-w-full" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="mt-5 flex items-center justify-between gap-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-3 w-20" />
            ))}
          </div>
          <Skeleton className="mt-2 h-1 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}
