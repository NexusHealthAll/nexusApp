import type { ReactNode } from "react";
import { Clock, Filter, MapPin, SearchX } from "lucide-react";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { cn } from "@/shared/utils/cn";
import { formatCurrency } from "../DashboardChrome";
import type { NearbyShiftCard } from "../../hooks/useHealthWorkerShifts";

export function shiftPayoutKobo(shift: NearbyShiftCard): number {
  if (shift.pay_type === "fixed_rate") return shift.fixed_rate_kobo ?? 0;
  return Math.round((shift.rate_kobo_per_hour ?? 0) * shift.duration_hours);
}

export function shiftPayoutLabel(shift: NearbyShiftCard): string {
  return formatCurrency(Math.round(shiftPayoutKobo(shift) / 100));
}

function formatShiftTiming(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const time = date.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });

  if (date.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;
  return `${date.toLocaleDateString("en-NG", { month: "short", day: "numeric" })}, ${time}`;
}

const priorityTagStyle: Record<NearbyShiftCard["priority"], string> = {
  stat: "bg-error-800 text-white",
  urgent: "bg-error-100 text-error-800",
  normal: "bg-success-100 text-success-800",
  scheduled: "bg-success-700 text-white",
};

const priorityTagLabel: Record<NearbyShiftCard["priority"], string> = {
  stat: "STAT",
  urgent: "Urgent",
  normal: "Open",
  scheduled: "Scheduled",
};

function priorityCaption(shift: NearbyShiftCard): string {
  return shift.priority === "stat" ? "Immediate Start" : formatShiftTiming(shift.scheduled_start);
}

function ShiftCard({ shift, onOpen }: { shift: NearbyShiftCard; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-xl bg-white p-5 text-left shadow-sm ring-1 ring-neutral-900/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                priorityTagStyle[shift.priority],
              )}
            >
              {priorityTagLabel[shift.priority]}
            </span>
            <span
              className={cn(
                "text-xs font-semibold",
                shift.priority === "stat" ? "text-error-800" : "text-ink-500",
              )}
            >
              {priorityCaption(shift)}
            </span>
          </div>
          <h3 className="mt-1 text-lg font-extrabold text-ink-900">{shift.role_title}</h3>
          <p className="text-sm font-medium text-ink-700">
            {shift.hospital_name ?? "Hospital"}
            {shift.specialty ? ` • ${shift.specialty}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-extrabold text-brand-700">{shiftPayoutLabel(shift)}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">
            {shift.pay_type === "fixed_rate" ? "Fixed" : "Per shift"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
        <div className="flex min-w-0 items-center gap-3 text-xs text-ink-700">
          {typeof shift.distance_km === "number" && (
            <span className="flex shrink-0 items-center gap-1">
              <MapPin className="h-3 w-3" />
              {shift.distance_km.toFixed(1)}km
            </span>
          )}
          <span className="flex shrink-0 items-center gap-1">
            <Clock className="h-3 w-3" />
            {shift.duration_hours}h
          </span>
          {shift.shift_type === "virtual" ? (
            <span className="shrink-0 rounded-full bg-brand-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              Virtual
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-brand-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-700">
              Physical
            </span>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-xl px-6 py-2 text-xs font-bold",
            shift.interest_expressed
              ? "bg-neutral-200 text-neutral-600"
              : "bg-brand-700 text-white shadow-sm",
          )}
        >
          {shift.interest_expressed ? "Applied" : "Apply"}
        </span>
      </div>
    </button>
  );
}

function FeaturedFacilityCard() {
  return (
    <div className="relative flex h-40 items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 p-8">
      <div>
        <h4 className="text-xl font-extrabold text-white">Premium Shifts Available</h4>
        <p className="mt-2 max-w-[200px] text-sm text-white/80">
          Unlock exclusive roles at Eko Hospitals with Nexus Gold.
        </p>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-success-300">
          Learn more →
        </p>
      </div>
    </div>
  );
}

export function MarketplaceScreen({
  shifts,
  searchTerm,
  onSearchChange,
  onOpenShift,
  onMyApplications,
  isLoading,
  loadError,
}: {
  shifts: NearbyShiftCard[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenShift: (shift: NearbyShiftCard) => void;
  onMyApplications: () => void;
  isLoading: boolean;
  loadError: string | null;
}) {
  const filtered = shifts.filter((shift) => {
    const haystack = `${shift.hospital_name ?? ""} ${shift.role_title} ${shift.specialty ?? ""}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const cards: ReactNode[] = [];
  filtered.forEach((shift, index) => {
    cards.push(<ShiftCard key={shift.shift_id} shift={shift} onOpen={() => onOpenShift(shift)} />);
    if (index === 1 && filtered.length > 2) {
      cards.push(<FeaturedFacilityCard key="featured-facility" />);
    }
  });

  return (
    <main className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-extrabold text-ink-900">Shift Marketplace</h1>
        <button
          type="button"
          onClick={onMyApplications}
          className="rounded-lg bg-brand-700 px-3 py-1 text-xs font-bold text-white"
        >
          My Applications
        </button>
      </div>

      <SearchInput
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search role or facility..."
        className="rounded-lg border-transparent bg-brand-input py-3.5 text-ink-900 placeholder:text-ink-700/60"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white">
          <Filter className="h-3 w-3" />
          Specialty
        </span>
        <span className="shrink-0 whitespace-nowrap rounded-xl bg-brand-100 px-4 py-2 text-xs font-semibold text-ink-700">
          5km
        </span>
        <span className="shrink-0 whitespace-nowrap rounded-xl bg-brand-100 px-4 py-2 text-xs font-semibold text-ink-700">
          Urgency
        </span>
        <span className="shrink-0 whitespace-nowrap rounded-xl bg-brand-100 px-4 py-2 text-xs font-semibold text-ink-700">
          More
        </span>
      </div>

      {loadError && (
        <p className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700">{loadError}</p>
      )}

      {isLoading && <p className="text-sm text-ink-500">Loading shifts...</p>}

      {!isLoading && !loadError && filtered.length === 0 && (
        <EmptyState
          className="bg-white"
          icon={<SearchX className="h-10 w-10 text-brand-300" />}
          title="No shifts nearby right now"
          description="Check back soon, or widen your filters to see more roles."
        />
      )}

      <div className="space-y-4">{cards}</div>
    </main>
  );
}
