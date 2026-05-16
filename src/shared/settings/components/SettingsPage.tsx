import { Settings } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50">
      <Settings className="h-10 w-10 text-neutral-300" />
      <p className="text-sm font-semibold text-neutral-400">
        Settings — Coming Soon
      </p>
    </div>
  );
}
