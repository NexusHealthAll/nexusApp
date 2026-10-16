const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

const DEFAULT_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

/** Formats an ISO date/date-time string, e.g. "Jan 5, 2026". Returns "—" for invalid input. */
export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS,
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", options);
}

/** Formats an ISO date/date-time string as a time, e.g. "2:30 PM". Returns "—" for invalid input. */
export function formatTime(
  iso: string,
  options: Intl.DateTimeFormatOptions = DEFAULT_TIME_OPTIONS,
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", options);
}

/**
 * Formats a shift-style start/end ISO pair as a combined date + time range,
 * e.g. `{ dateLabel: "Jan 5, 2026", timeLabel: "8:00 PM–6:00 AM" }`.
 */
export function formatDateTime(
  startIso: string,
  endIso?: string,
): { dateLabel: string; timeLabel: string } {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) {
    return { dateLabel: "—", timeLabel: "—" };
  }

  const dateLabel = formatDate(startIso);
  const startTime = formatTime(startIso);
  const endTime = endIso ? formatTime(endIso) : undefined;
  const timeLabel = endTime ? `${startTime}–${endTime}` : startTime;

  return { dateLabel, timeLabel };
}

/** Relative time for feeds, e.g. "just now", "8 minutes ago", "Yesterday", falling back to a date. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";
  const seconds = Math.max(0, Math.round((now.getTime() - then.getTime()) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(iso);
}
