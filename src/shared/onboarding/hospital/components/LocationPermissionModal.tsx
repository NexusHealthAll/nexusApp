import type { ReactNode } from "react";
import { MapPinOff, RefreshCw } from "lucide-react";
import type { GeoPermissionState } from "@/shared/location/useLocationTracker";

type BlockingState = Extract<
  GeoPermissionState,
  "denied" | "unavailable" | "unsupported"
>;

interface LocationPermissionModalProps {
  state: BlockingState;
  onRetry: () => void;
}

const COPY: Record<
  BlockingState,
  {
    title: string;
    body: ReactNode;
    instructions?: { heading: string; steps: string[] };
    showRetry: boolean;
  }
> = {
  denied: {
    title: "Location Access Required",
    body: (
      <>
        Hospital registration requires your device's location to set up
        geofencing. You've blocked location access for this site — please enable
        it in your browser's site settings, then try again.
      </>
    ),
    instructions: {
      heading: "How to enable location access",
      steps: [
        "Click the lock/info icon in your browser's address bar",
        'Find "Location" in the site permissions list',
        'Change it to "Allow"',
        'Click "Try Again" below',
      ],
    },
    showRetry: true,
  },
  unavailable: {
    title: "Turn On Device Location",
    body: (
      <>
        This site has permission to use your location, but your device's
        Location Services appear to be turned off, so we can't get a fix. We'll
        keep checking automatically — turn it back on to continue, or retry
        manually below.
      </>
    ),
    instructions: {
      heading: "How to turn on Location Services",
      steps: [
        "Open your device or computer's system settings",
        'Find "Location" or "Location Services"',
        "Turn it on for your browser",
        'Click "Try Again" below (or just wait — we auto-retry)',
      ],
    },
    showRetry: true,
  },
  unsupported: {
    title: "Location Not Supported",
    body: (
      <>
        Your browser doesn't support geolocation, which this step requires.
        Please switch to a modern browser (Chrome, Firefox, Safari, Edge) and
        reload the page.
      </>
    ),
    showRetry: false,
  },
};

export function LocationPermissionModal({
  state,
  onRetry,
}: LocationPermissionModalProps) {
  const copy = COPY[state];

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Location access required"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071726]/70 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-7 shadow-strong text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
          <MapPinOff className="h-6 w-6 text-red-500" />
        </div>

        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          {copy.title}
        </h2>

        <p className="text-[13px] text-neutral-500 leading-relaxed mb-5">
          {copy.body}
        </p>

        {copy.instructions && (
          <div className="text-left bg-[#EBF4FF] dark:bg-neutral-800 border border-[#C8DFEF] dark:border-neutral-700 rounded-xl px-4 py-3 mb-5">
            <p className="text-[11px] font-semibold text-[#1A5888] dark:text-[#5AA6D6] mb-1.5">
              {copy.instructions.heading}
            </p>
            <ol className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed list-decimal list-inside space-y-0.5">
              {copy.instructions.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {copy.showRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-[13px] font-semibold transition-colors duration-150 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
