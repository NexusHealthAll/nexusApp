import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { Badge } from "@/shared/components/ui/Badge";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { PATHS } from "@/routes/paths";
import {
  WorkerRecord,
  WorkerService,
} from "@/features/hospital/services/workerService";

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

export function WorkforcePool() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    WorkerService.getWorkers().then((data) => {
      if (cancelled) return;
      setWorkers(data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const preview = workers.slice(0, 4);

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-neutral-900">
          Workforce Pool <span className="font-normal text-neutral-400">within 5km</span>
        </h2>
        <button
          onClick={() => navigate(PATHS.hospital.workers)}
          className="text-sm font-semibold text-secondary-700 hover:text-secondary-900"
        >
          View all workers
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : preview.length === 0 ? (
        <EmptyState
          className="min-h-[160px]"
          title="No clinicians yet"
          description="Your workforce pool will populate as clinicians join."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-neutral-400">
                <th className="pb-3 font-medium">Worker</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Distance</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 font-medium">Shifts</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((worker) => (
                <tr key={worker.id} className="border-t border-neutral-50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <AvatarInitials name={worker.name} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-neutral-900">
                          {worker.name}
                        </p>
                        <p className="truncate text-xs text-neutral-400">
                          {worker.specialty || worker.roleTitle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-neutral-600">
                    {worker.roleTitle}
                  </td>
                  <td className="py-3 pr-4 text-neutral-600">
                    {worker.distanceKm}km
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
                  <td className="py-3 pr-4">
                    <Badge variant={statusBadgeVariant[worker.status]}>
                      {statusLabel[worker.status]}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-sm font-semibold text-secondary-700 hover:text-secondary-900">
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
  );
}
