import { useState } from "react";
import { Download, Share, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

const DISMISS_KEY = "nexuscare_install_prompt_dismissed_at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isDismissedRecently(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
}

/**
 * Dismissible install prompt — shows a native-install button where the
 * browser supports it (`beforeinstallprompt`, captured in
 * useInstallPromptStore), or manual "Add to Home Screen" instructions on
 * iOS Safari, which never fires that event at all. Mounted at each
 * checkpoint where we want to actively surface the prompt rather than wait
 * for the passive header button to be noticed.
 */
export function InstallPromptBanner({ className }: { className?: string }) {
  const { canInstall, isIos, isInstalled, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(isDismissedRecently);

  if (isInstalled || dismissed || (!canInstall && !isIos)) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }

  async function handleInstall() {
    const accepted = await promptInstall();
    if (!accepted) dismiss();
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-brand-700 p-4 text-white shadow-lg",
        className,
      )}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          {isIos ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">Install NexusCare</p>
          {isIos ? (
            <p className="mt-1 text-sm text-brand-50">
              Tap <Share className="mx-0.5 -mt-0.5 inline h-3.5 w-3.5" aria-hidden />
              {" "}then "Add to Home Screen" for quick, one-tap access to your shifts.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-brand-50">
                Add NexusCare to your home screen for quick access and offline support during
                shifts.
              </p>
              <button
                type="button"
                onClick={handleInstall}
                className="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-bold text-brand-700"
              >
                Install App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
