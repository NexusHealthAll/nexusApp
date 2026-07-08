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
