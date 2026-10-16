import { Skeleton } from "@/shared/components/ui/Skeleton";
import { cn } from "@/shared/utils/cn";

export type SkeletonCell =
  | "text"
  | "avatar"
  | "badge"
  | "amount"
  | "checkbox"
  | "action";

export interface TableSkeletonColumn {
  /** Real header label, so the header row doesn't shift when data arrives. */
  label?: string;
  cell?: SkeletonCell;
  align?: "left" | "center" | "right";
  className?: string;
}

interface TableSkeletonProps {
  columns: TableSkeletonColumn[];
  rows?: number;
  /** Matches the real table's min width so columns line up. */
  minWidth?: number;
  className?: string;
}

function Cell({ kind }: { kind: SkeletonCell }) {
  switch (kind) {
    case "avatar":
      return (
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      );
    case "badge":
      return <Skeleton className="h-6 w-20 rounded-full" />;
    case "amount":
      return <Skeleton className="h-4 w-16" />;
    case "checkbox":
      return <Skeleton className="h-4 w-4 rounded" />;
    case "action":
      return <Skeleton className="h-4 w-4 rounded" />;
    default:
      return (
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      );
  }
}

/**
 * Loading placeholder that mirrors a real table: actual header labels plus
 * cell-shaped blocks (avatar + text, badge, amount) per column.
 */
export function TableSkeleton({
  columns,
  rows = 5,
  minWidth = 760,
  className,
}: TableSkeletonProps) {
  const align = (a?: TableSkeletonColumn["align"]) =>
    a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left";

  return (
    <div
      className={cn("overflow-x-auto", className)}
      aria-busy="true"
      aria-label="Loading"
    >
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/60 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-500">
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  "px-4 py-3 font-semibold",
                  align(col.align),
                  col.className,
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr
              key={r}
              className="border-b border-neutral-50 last:border-b-0 dark:border-neutral-800"
            >
              {columns.map((col, c) => (
                <td
                  key={c}
                  className={cn("px-4 py-4", align(col.align), col.className)}
                >
                  <div
                    className={cn(
                      col.align === "center" && "flex justify-center",
                      col.align === "right" && "flex justify-end",
                    )}
                  >
                    <Cell kind={col.cell ?? "text"} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
