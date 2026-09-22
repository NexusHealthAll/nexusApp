import { useMemo, useState } from "react";
import { Calendar, CalendarCheck2, CalendarClock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Modal } from "@/shared/components/ui/Modal";
import { cn } from "@/shared/utils/cn";
import type { MyApplicationEntry } from "../../hooks/useHealthWorkerShifts";

export type ScheduleTab = "upcoming" | "active" | "completed";

const upcomingStatuses = new Set(["assigned", "upcoming"]);

function weekStrip(today: Date): { label: string; date: number; isToday: boolean; iso: string }[] {
  const days = [];
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1); // Monday
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      label: d.toLocaleDateString("en-NG", { weekday: "short" }).slice(0, 3).toUpperCase(),
      date: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      iso: d.toDateString(),
    });
  }
  return days;
}

/** Days of the currently-viewed month, padded with the tail of the previous
 * month and the head of the next so the grid always starts on a Monday. */
function monthGrid(viewedMonth: Date): Date[] {
  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // getDay(): 0=Sun..6=Sat; shift so Monday=0.
  const leadingDays = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - leadingDays);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

function MonthCalendarModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  today,
  shiftDates,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  today: Date;
  /** `toDateString()` of every entry's scheduled_start, for the "has a shift" dot. */
  shiftDates: Set<string>;
}) {
  const [viewedMonth, setViewedMonth] = useState(
    () => new Date((selectedDate ?? today).getFullYear(), (selectedDate ?? today).getMonth(), 1),
  );

  const days = useMemo(() => monthGrid(viewedMonth), [viewedMonth]);
  const weekLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Full Calendar" size="sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() =>
              setViewedMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
            }
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-600 hover:bg-brand-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-bold text-ink-900 dark:text-neutral-50">
            {viewedMonth.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
          </p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() =>
              setViewedMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
            }
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-600 hover:bg-brand-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {weekLabels.map((label) => (
            <span
              key={label}
              className="py-1 text-[10px] font-semibold uppercase text-ink-500 dark:text-neutral-500"
            >
              {label}
            </span>
          ))}
          {days.map((d) => {
            const inMonth = d.getMonth() === viewedMonth.getMonth();
            const isToday = d.toDateString() === today.toDateString();
            const isSelected = !!selectedDate && d.toDateString() === selectedDate.toDateString();
            const hasShift = shiftDates.has(d.toDateString());

            return (
              <button
                type="button"
                key={d.toISOString()}
                onClick={() => {
                  onSelectDate(isSelected ? null : d);
                  onClose();
                }}
                className={cn(
                  "relative flex h-9 flex-col items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                  !inMonth && "text-ink-300 dark:text-neutral-700",
                  inMonth && !isSelected && "text-ink-800 hover:bg-brand-100 dark:text-neutral-200 dark:hover:bg-neutral-800",
                  isSelected && "bg-brand-700 text-white hover:bg-brand-700",
                  !isSelected && isToday && "ring-1 ring-inset ring-brand-400",
                )}
              >
                {d.getDate()}
                {hasShift && (
                  <span
                    className={cn(
                      "absolute bottom-1 h-1 w-1 rounded-full",
                      isSelected ? "bg-white" : "bg-brand-500",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <button
            type="button"
            onClick={() => {
              onSelectDate(null);
              onClose();
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 py-2.5 text-sm font-bold text-ink-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <X className="h-3.5 w-3.5" />
            Clear date filter
          </button>
        )}
      </div>
    </Modal>
  );
}

function ScheduleEntryCard({
  entry,
  badgeLabel,
  ctaLabel,
  ctaTone = "brand",
  onCta,
}: {
  entry: MyApplicationEntry;
  badgeLabel: string;
  ctaLabel: string;
  ctaTone?: "brand" | "urgent";
  onCta: () => void;
}) {
  const scheduled = new Date(entry.scheduled_start);

  return (
    <div className="w-full rounded-lg border border-[rgba(194,198,212,0.1)] bg-white p-5 shadow-sm dark:bg-neutral-900 dark:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-block rounded-xl bg-[#8df9a8] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#007439] dark:bg-success-950 dark:text-success-300">
            {badgeLabel}
          </span>
          <h3 className="mt-1 text-lg font-extrabold text-ink-900 dark:text-neutral-50">Hospital</h3>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 rounded bg-brand-100/50 p-3 dark:bg-brand-950/50">
        <div>
          <p className="text-[10px] font-medium uppercase text-ink-700 dark:text-neutral-400">Date</p>
          <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-neutral-50">
            {scheduled.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase text-ink-700 dark:text-neutral-400">Shift Time</p>
          <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-neutral-50">
            {scheduled.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onCta}
        className={cn(
          "mt-4 w-full rounded-xl py-3 text-sm font-bold text-white",
          ctaTone === "urgent" ? "bg-[#c0071a]" : "bg-brand-700",
        )}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

export function ScheduleScreen({
  entries,
  scheduleTab,
  isLoading,
  loadError,
  onScheduleTabChange,
  onOpenShift,
  onShiftEntry,
  onOpenHandover,
}: {
  entries: MyApplicationEntry[];
  scheduleTab: ScheduleTab;
  isLoading: boolean;
  loadError: string | null;
  onScheduleTabChange: (tab: ScheduleTab) => void;
  onOpenShift: (shiftId: string) => void;
  onShiftEntry: (shiftId: string) => void;
  onOpenHandover: (shiftId: string) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => weekStrip(today), [today]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const shiftDates = useMemo(
    () => new Set(entries.map((e) => new Date(e.scheduled_start).toDateString())),
    [entries],
  );
  const matchesSelectedDate = (e: MyApplicationEntry) =>
    !selectedDate || new Date(e.scheduled_start).toDateString() === selectedDate.toDateString();

  const upcoming = entries
    .filter((e) => upcomingStatuses.has(e.shift_status))
    .filter(matchesSelectedDate);
  const active = entries
    .filter((e) => e.shift_status === "in_progress")
    .filter(matchesSelectedDate);
  const completed = entries
    .filter((e) => e.shift_status === "completed")
    .filter(matchesSelectedDate);

  const tabs: { id: ScheduleTab; label: string; count: number }[] = [
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "active", label: "Active", count: active.length },
    { id: "completed", label: "Completed", count: completed.length },
  ];

  return (
    <main className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold tracking-tight text-ink-900 dark:text-neutral-50">
          {selectedDate
            ? selectedDate.toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })
            : today.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
        </h1>
        <div className="flex items-center gap-2">
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              aria-label="Clear date filter"
              className="flex items-center gap-1 rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700 dark:bg-neutral-800 dark:text-brand-300"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-1 text-sm font-medium text-brand-700 dark:text-brand-300"
          >
            Full Calendar
            <Calendar className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const isSelected = !!selectedDate && day.iso === selectedDate.toDateString();
          return (
            <button
              type="button"
              key={day.label + day.date}
              onClick={() =>
                setSelectedDate((prev) =>
                  prev && prev.toDateString() === day.iso ? null : new Date(day.iso),
                )
              }
              className={cn(
                "flex h-20 w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-xl transition-colors",
                isSelected || day.isToday
                  ? "bg-brand-700 text-white shadow-[0_0_0_4px_rgba(0,65,162,0.1)] dark:bg-brand-600"
                  : "bg-brand-100 dark:bg-neutral-800 dark:text-neutral-200",
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium uppercase",
                  isSelected || day.isToday ? "text-white/80" : "text-ink-700/60 dark:text-neutral-400",
                )}
              >
                {day.label}
              </span>
              <span
                className={cn(
                  "text-lg font-bold",
                  isSelected || day.isToday ? "text-white" : "text-ink-700 dark:text-neutral-100",
                )}
              >
                {day.date}
              </span>
            </button>
          );
        })}
      </div>

      <MonthCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        today={today}
        shiftDates={shiftDates}
      />

      <div className="flex items-start justify-center gap-1 rounded-xl bg-brand-100 p-1 dark:bg-neutral-800">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => onScheduleTabChange(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
              scheduleTab === tab.id
                ? "bg-white text-brand-700 shadow-sm dark:bg-neutral-900 dark:text-brand-400"
                : "text-ink-700 dark:text-neutral-400 hover:text-ink-900 dark:hover:text-neutral-200",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[11px] font-bold",
                scheduleTab === tab.id
                  ? "bg-brand-700 text-white dark:bg-brand-500"
                  : "bg-brand-200 text-ink-700 dark:bg-neutral-700 dark:text-neutral-300",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loadError && (
        <p className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 dark:bg-error-950 dark:text-error-300">{loadError}</p>
      )}
      {isLoading && <p className="text-sm text-ink-500 dark:text-neutral-500">Loading...</p>}

      {!isLoading && (
        <div className="space-y-4">
          {scheduleTab === "active" &&
            (active.length === 0 ? (
              <EmptyState
                className="bg-white dark:bg-neutral-900"
                icon={<CalendarClock className="h-10 w-10 text-brand-300" />}
                title="No active shift right now"
              />
            ) : (
              active.map((entry) => (
                <ScheduleEntryCard
                  key={entry.shift_id}
                  entry={entry}
                  badgeLabel={entry.role_title}
                  ctaLabel="Resume Shift"
                  ctaTone="urgent"
                  onCta={() => onShiftEntry(entry.shift_id)}
                />
              ))
            ))}

          {scheduleTab === "completed" &&
            (completed.length === 0 ? (
              <EmptyState
                className="bg-white dark:bg-neutral-900"
                icon={<CalendarCheck2 className="h-10 w-10 text-brand-300" />}
                title="No completed shifts yet"
              />
            ) : (
              completed.map((entry) => (
                <div key={entry.shift_id} className="space-y-2">
                  <ScheduleEntryCard
                    entry={entry}
                    badgeLabel={entry.role_title}
                    ctaLabel="View Summary"
                    onCta={() => onOpenShift(entry.shift_id)}
                  />
                  <button
                    type="button"
                    onClick={() => onOpenHandover(entry.shift_id)}
                    className="w-full rounded-xl border border-brand-200 py-2.5 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-950/40"
                  >
                    Handover status &amp; payout
                  </button>
                </div>
              ))
            ))}

          {scheduleTab === "upcoming" &&
            (upcoming.length === 0 ? (
              <EmptyState
                className="bg-white dark:bg-neutral-900"
                icon={<Calendar className="h-10 w-10 text-brand-300" />}
                title="No upcoming shifts"
                description="Accepted shifts will show up here."
              />
            ) : (
              upcoming.map((entry) => {
                const isDueToday = new Date(entry.scheduled_start) <= today;
                return (
                  <ScheduleEntryCard
                    key={entry.shift_id}
                    entry={entry}
                    badgeLabel={entry.role_title}
                    ctaLabel={isDueToday ? "Clock In" : "View Details"}
                    ctaTone={isDueToday ? "urgent" : "brand"}
                    onCta={() =>
                      isDueToday ? onShiftEntry(entry.shift_id) : onOpenShift(entry.shift_id)
                    }
                  />
                );
              })
            ))}
        </div>
      )}
    </main>
  );
}
