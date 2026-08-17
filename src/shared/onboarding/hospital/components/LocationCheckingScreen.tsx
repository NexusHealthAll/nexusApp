import { Loader2, MapPin } from "lucide-react";

/**
 * Shown while permission/device location is still being resolved, so the
 * form (or the blocking modal) never flashes before we actually know the
 * outcome.
 */
export function LocationCheckingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F4FAFF] dark:bg-neutral-950 px-4">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF4FF] dark:bg-neutral-900">
          <MapPin className="h-6 w-6 text-[#1A5888] dark:text-[#5AA6D6]" />
          <Loader2 className="absolute -right-1 -top-1 h-5 w-5 animate-spin text-[#349C93]" />
        </div>
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Checking location access…</p>
        <p className="mt-1 text-[12px] text-neutral-500">
          Confirming your browser and device location settings.
        </p>
      </div>
    </div>
  );
}
