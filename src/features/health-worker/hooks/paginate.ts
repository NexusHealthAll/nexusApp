/** Page size for the mobile health-worker lists (applications, schedule, earnings). */
export const HW_PAGE_SIZE = 3;

export interface Paged<T> {
  pageItems: T[];
  /** Current page, clamped into range. */
  page: number;
  pageCount: number;
  total: number;
  /** 1-based inclusive range shown, for "Showing 1-3 of 8". */
  from: number;
  to: number;
}

export function paginate<T>(items: T[], page: number, size = HW_PAGE_SIZE): Paged<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const start = (current - 1) * size;
  return {
    pageItems: items.slice(start, start + size),
    page: current,
    pageCount,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + size, total),
  };
}
