import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Left-hand summary, e.g. "Showing 1-8 of 24 shifts". */
  summary?: string;
  className?: string;
}

/**
 * Table footer pagination matching the redesign: summary on the left,
 * chevron + numbered page buttons (active page is a dark square) on the right.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  summary,
  className,
}: PaginationProps) {
  if (pageCount <= 0) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <p className="text-sm text-neutral-500">{summary}</p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
              p === page
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100",
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
