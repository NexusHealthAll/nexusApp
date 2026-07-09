import { useState } from "react";
import { BellOff } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { cn } from "@/shared/utils/cn";
import { Header } from "../DashboardChrome";

const FILTERS = ["All", "Shifts", "Payments", "Alerts"] as const;

export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  return (
    <>
      <Header title="Notifications" subtitle="Manage clinical updates" onBack={onBack} />
      <main className="space-y-4 px-5 py-4">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-bold",
                filter === f ? "bg-brand-700 text-white" : "bg-neutral-100 text-neutral-600",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <EmptyState
          className="bg-white"
          icon={<BellOff className="h-10 w-10 text-brand-300" />}
          title="No notifications yet"
          description="This app doesn't have a notifications backend connected yet — shift offers, payment confirmations, and compliance alerts will show up here once it does."
        />
      </main>
    </>
  );
}
