import { RefreshCw } from "lucide-react";
import { usePwaUpdateStore } from "../hooks/usePwaUpdateStore";

/**
 * The service worker is registered with registerType: "prompt" (see
 * vite.config.ts) specifically so a background update never silently
 * reloads the page mid-shift — this toast is the manual "apply it now"
 * control that replaces that silent auto-reload.
 */
export function UpdateAvailableToast() {
  const needRefresh = usePwaUpdateStore((s) => s.needRefresh);
  const updateServiceWorker = usePwaUpdateStore((s) => s.updateServiceWorker);

  if (!needRefresh || !updateServiceWorker) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-50 flex items-center justify-between gap-3 rounded-2xl bg-neutral-900 px-4 py-3 text-white shadow-lg md:inset-x-auto md:bottom-4 md:right-4 md:w-80">
      <div className="flex items-center gap-2 text-sm">
        <RefreshCw className="h-4 w-4 shrink-0" />
        <span>New version available</span>
      </div>
      <button
        type="button"
        onClick={() => updateServiceWorker()}
        className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-neutral-900"
      >
        Refresh
      </button>
    </div>
  );
}
