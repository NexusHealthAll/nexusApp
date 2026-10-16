import { Pagination } from "@/shared/components/ui/Pagination";

/** Pagination footer shared by the health-worker lists; hidden when one page suffices. */
export function PagedFooter({
  page,
  pageCount,
  from,
  to,
  total,
  noun,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  noun: string;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <Pagination
      className="pt-2"
      page={page}
      pageCount={pageCount}
      onPageChange={onPageChange}
      summary={`Showing ${from}-${to} of ${total} ${noun}`}
    />
  );
}
