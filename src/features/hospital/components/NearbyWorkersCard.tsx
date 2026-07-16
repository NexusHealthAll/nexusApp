import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Star, Users } from "lucide-react";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { PATHS } from "@/routes/paths";
import {
  WorkerDirectoryService,
  availabilityDisplay,
  type DirectoryWorker,
} from "@/features/hospital/workers/workerDirectoryService";

/** Dashboard "Nearby Available Workers" card (mock directory service). */
export function NearbyWorkersCard() {
  const [workers, setWorkers] = useState<DirectoryWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    WorkerDirectoryService.getNearbyAvailable().then((data) => {
      if (cancelled) return;
      setWorkers(data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-100 bg-white p-5">
      <h3 className="text-base font-bold text-neutral-900">
        Nearby Available Workers
      </h3>

      <div className="mt-4 flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <EmptyState
            icon={<EmptyStateIcon icon={Users} />}
            title="No nearby workers yet"
            description="Available workers around your hospital will appear here as they join NexusCare."
            className="min-h-[160px] border-0"
          />
        ) : (
          <ul className="divide-y divide-neutral-50">
            {workers.map((worker) => {
              const availability = availabilityDisplay(worker.availability);
              return (
                <li
                  key={worker.id}
                  className="flex items-center gap-3 py-3"
                >
                  <AvatarInitials name={worker.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {worker.name}, {worker.credential}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-neutral-400">
                      {worker.distanceMi.toFixed(1)} mi ·
                      <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
                      {worker.rating} ·
                      <span className={availability.className}>
                        {availability.label}
                      </span>
                    </p>
                  </div>
                  <Link
                    to={PATHS.hospital.workerDetail(worker.id)}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    Invite
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Link
        to={PATHS.hospital.workers}
        className="mt-4 flex items-center justify-center gap-1 border-t border-neutral-100 pt-4 text-sm font-semibold text-neutral-700 transition-colors hover:text-neutral-900"
      >
        Browse all workers
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
