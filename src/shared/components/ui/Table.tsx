import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { cn } from "@/shared/utils/cn";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyState?: ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
}

/**
 * Generic data table. Rows animate in with a staggered fade/slide on
 * mount and whenever `data` changes (e.g. filtering) — exit animation for
 * removed rows is intentionally skipped, since AnimatePresence unmount
 * timing inside <table>/<tbody> tends to break table layout.
 */
export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  skeletonRows = 5,
  emptyState,
  className,
  onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <>{emptyState ?? <EmptyState title="No data found" />}</>;
  }

  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm", className)}>
        <thead>
          <tr className="text-left text-xs font-semibold text-neutral-400">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn("pb-3 font-medium", column.headerClassName)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <motion.tr
              key={keyExtractor(row)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index, 12) * 0.02 }}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-t border-neutral-50",
                onRowClick && "cursor-pointer hover:bg-neutral-50",
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn("py-3 pr-4", column.className)}>
                  {column.render(row)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
