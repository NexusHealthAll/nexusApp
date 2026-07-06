import { useEffect, useMemo, useState } from "react";
import { Download, Star, Users, UserCheck, Activity, Star as StarIcon } from "lucide-react";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Badge } from "@/shared/components/ui/Badge";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { Button } from "@/shared/components/ui/Button";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import {
  WorkerPoolStats,
  WorkerRecord,
  WorkerService,
} from "@/features/hospital/services/workerService";

type WorkerTab = "all" | "available" | "on_shift" | "off_duty";

const tabOptions: { label: string; value: WorkerTab }[] = [
  { label: "All", value: "all" },
  { label: "Available", value: "available" },
  { label: "On shift", value: "on_shift" },
  { label: "Off duty", value: "off_duty" },
];

const statusBadgeVariant: Record<WorkerRecord["status"], "success" | "info" | "neutral"> = {
  available: "success",
  on_shift: "info",
  off_duty: "neutral",
};

const statusLabel: Record<WorkerRecord["status"], string> = {
  available: "Available",
  on_shift: "On shift",
  off_duty: "Off duty",
};

export function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [stats, setStats] = useState<WorkerPoolStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkerTab>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      WorkerService.getWorkers(),
      WorkerService.getWorkerPoolStats(),
    ]).then(([workerList, poolStats]) => {
      if (cancelled) return;
      setWorkers(workerList);
      setStats(poolStats);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      if (activeTab !== "all" && worker.status !== activeTab) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${worker.name} ${worker.roleTitle} ${worker.specialty}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [workers, activeTab, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Workforce Pool</h1>
          <p className="text-sm text-neutral-400">
            {stats
              ? `${stats.totalInPool} workers within 5km • ${stats.availableNow} available • ${stats.onShift} on shift`
              : "Loading…"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 rounded-lg text-xs font-semibold"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      {!stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} value={stats.totalInPool} label="Total in pool" />
          <StatCard
            icon={UserCheck}
            value={stats.availableNow}
            label="Available now"
            trend={
              stats.availableNowTrendDelta !== undefined
                ? { direction: "up", label: `+${stats.availableNowTrendDelta}` }
                : undefined
            }
          />
          <StatCard icon={Activity} value={stats.onShift} label="Currently on shift" />
          <StatCard
            icon={StarIcon}
            value={stats.avgRating}
            label="Avg. rating"
            trend={
              stats.avgRatingTrendDelta !== undefined
                ? { direction: "up", label: `+${stats.avgRatingTrendDelta}` }
                : undefined
            }
          />
        </div>
      )}

      <div className="rounded-2xl border border-neutral-100 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <FilterTabs options={tabOptions} value={activeTab} onChange={setActiveTab} />
          <SearchInput
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="ml-auto w-full max-w-xs"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 py-10 text-center">
            <p className="text-sm font-semibold text-neutral-800">No workers found</p>
            <p className="max-w-[240px] text-xs text-neutral-400">
              Try a different filter or search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-neutral-400">
                  <th className="pb-3 font-medium">Worker</th>
                  <th className="pb-3 font-medium">Role / Specialty</th>
                  <th className="pb-3 font-medium">Distance</th>
                  <th className="pb-3 font-medium">Languages</th>
                  <th className="pb-3 font-medium">Rating</th>
                  <th className="pb-3 font-medium">Shifts Done</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Total Earned</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="border-t border-neutral-50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <AvatarInitials name={worker.name} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-neutral-900">
                            {worker.name}
                          </p>
                          <p className="text-xs text-neutral-400">{worker.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-neutral-600">
                      <p className="font-medium text-neutral-800">
                        {worker.roleTitle}
                      </p>
                      {worker.specialty && (
                        <p className="text-xs text-neutral-400">
                          {worker.specialty}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-neutral-600">
                      {worker.distanceKm}km
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {worker.languages.map((lang) => (
                          <Badge key={lang} variant="info">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-1 font-semibold text-neutral-800">
                        <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
                        {worker.rating}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-neutral-600">
                      {worker.shiftsDone}
                    </td>
                    <td className="py-3 pr-4 text-neutral-600">{worker.joined}</td>
                    <td className="py-3 pr-4 font-medium text-neutral-800">
                      {worker.totalEarned}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={statusBadgeVariant[worker.status]}>
                        {statusLabel[worker.status]}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-xs font-semibold text-secondary-700 hover:text-secondary-900">
                        Send offer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
