import { Settings } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/EmptyState";

export function SettingsPage() {
  return (
    <EmptyState
      className="h-64 bg-neutral-50"
      icon={<Settings className="h-10 w-10 text-neutral-300" />}
      title="Settings — Coming Soon"
    />
  );
}
