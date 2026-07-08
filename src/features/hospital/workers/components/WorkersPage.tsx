import { useEffect, useMemo, useState } from "react";
import { Download, Star, Users, UserCheck, Activity, Star as StarIcon } from "lucide-react";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Badge } from "@/shared/components/ui/Badge";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { Button } from "@/shared/components/ui/Button";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { Table, type TableColumn } from "@/shared/components/ui/Table";
import { EmptyState } from "@/shared/components/ui/EmptyState";
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

const workerColumns: TableColumn<WorkerRecord>[] = [
  {
    key: "worker",
    header: "Worker",
    render: (worker) => (
      <div className="flex items-center gap-2.5">
        <AvatarInitials name={worker.name} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-neutral-900">{worker.name}</p>
          <p className="text-xs text-neutral-400">{worker.id}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role / Specialty",
    render: (worker) => (
      <div className="text-neutral-600">
        <p className="font-medium text-neutral-800">{worker.roleTitle}</p>
        {worker.specialty && (
          <p className="text-xs text-neutral-400">{worker.specialty}</p>
        )}
      </div>
    ),
  },
  {
    key: "distance",
    header: "Distance",
    render: (worker) => <span className="text-neutral-600">{worker.distanceKm}km</span>,
  },
  {
    key: "languages",
    header: "Languages",
    render: (worker) => (
      <div className="flex flex-wrap gap-1">
        {worker.languages.map((lang) => (
          <Badge key={lang} variant="info">
            {lang}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: "rating",
    header: "Rating",
    render: (worker) => (
      <span className="flex items-center gap-1 font-semibold text-neutral-800">
        <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
        {worker.rating}
      </span>
    ),
  },
  {
    key: "shiftsDone",
    header: "Shifts Done",
    render: (worker) => <span className="text-neutral-600">{worker.shiftsDone}</span>,
  },
  {
    key: "joined",
    header: "Joined",
    render: (worker) => <span className="text-neutral-600">{worker.joined}</span>,
  },
  {
    key: "totalEarned",
    header: "Total Earned",
    render: (worker) => (
      <span className="font-medium text-neutral-800">{worker.totalEarned}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (worker) => (
      <Badge variant={statusBadgeVariant[worker.status]}>
        {statusLabel[worker.status]}
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    className: "text-right",
    render: () => (
      <button className="text-xs font-semibold text-secondary-700 hover:text-secondary-900">
        Send offer
      </button>
    ),
  },
];

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

        <Table
          columns={workerColumns}
          data={filteredWorkers}
          keyExtractor={(worker) => worker.id}
          isLoading={isLoading}
          className="min-w-[960px]"
          emptyState={
            <EmptyState
              title="No workers found"
              description="Try a different filter or search term."
            />
          }
        />
      </div>
    </div>
  );
}
