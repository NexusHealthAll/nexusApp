import { useMemo } from "react";
import { Calendar, CalendarCheck2, CalendarClock } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { cn } from "@/shared/utils/cn";
import type { MyApplicationEntry } from "../../hooks/useHealthWorkerShifts";

export type ScheduleTab = "upcoming" | "active" | "completed";

const upcomingStatuses = new Set(["assigned", "upcoming"]);

function weekStrip(today: Date): { label: string; date: number; isToday: boolean }[] {
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
    });
  }
  return days;
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
    <div className="w-full rounded-lg border border-[rgba(194,198,212,0.1)] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-block rounded-xl bg-[#8df9a8] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#007439]">
            {badgeLabel}
          </span>
          <h3 className="mt-1 text-lg font-extrabold text-ink-900">Hospital</h3>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 rounded bg-brand-100/50 p-3">
        <div>
          <p className="text-[10px] font-medium uppercase text-ink-700">Date</p>
          <p className="mt-1 text-sm font-semibold text-ink-900">
            {scheduled.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase text-ink-700">Shift Time</p>
          <p className="mt-1 text-sm font-semibold text-ink-900">
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
}: {
  entries: MyApplicationEntry[];
  scheduleTab: ScheduleTab;
  isLoading: boolean;
  loadError: string | null;
  onScheduleTabChange: (tab: ScheduleTab) => void;
  onOpenShift: (shiftId: string) => void;
  onShiftEntry: (shiftId: string) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => weekStrip(today), [today]);

  const upcoming = entries.filter((e) => upcomingStatuses.has(e.shift_status));
  const active = entries.filter((e) => e.shift_status === "in_progress");
  const completed = entries.filter((e) => e.shift_status === "completed");

  const tabs: { id: ScheduleTab; label: string }[] = [
    { id: "upcoming", label: "Upcoming" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <main className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold tracking-tight text-ink-900">
          {today.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
        </h1>
        <span className="flex items-center gap-1 text-sm font-medium text-brand-700">
          Full Calendar
          <Calendar className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <div
            key={day.label + day.date}
            className={cn(
              "flex h-20 w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-xl",
              day.isToday ? "bg-brand-700 shadow-[0_0_0_4px_rgba(0,65,162,0.1)]" : "bg-brand-100",
            )}
          >
            <span
              className={cn(
                "text-xs font-medium uppercase",
                day.isToday ? "text-white/80" : "text-ink-700/60",
              )}
            >
              {day.label}
            </span>
            <span className={cn("text-lg font-bold", day.isToday ? "text-white" : "text-ink-700")}>
              {day.date}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-start justify-center gap-1 rounded-xl bg-brand-100 p-1">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => onScheduleTabChange(tab.id)}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold",
              scheduleTab === tab.id ? "bg-white text-brand-700 shadow-sm" : "text-ink-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadError && (
        <p className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700">{loadError}</p>
      )}
      {isLoading && <p className="text-sm text-ink-500">Loading...</p>}

      {!isLoading && (
        <div className="space-y-4">
          {scheduleTab === "active" &&
            (active.length === 0 ? (
              <EmptyState
                className="bg-white"
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
                className="bg-white"
                icon={<CalendarCheck2 className="h-10 w-10 text-brand-300" />}
                title="No completed shifts yet"
              />
            ) : (
              completed.map((entry) => (
                <ScheduleEntryCard
                  key={entry.shift_id}
                  entry={entry}
                  badgeLabel={entry.role_title}
                  ctaLabel="View Summary"
                  onCta={() => onOpenShift(entry.shift_id)}
                />
              ))
            ))}

          {scheduleTab === "upcoming" &&
            (upcoming.length === 0 ? (
              <EmptyState
                className="bg-white"
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
