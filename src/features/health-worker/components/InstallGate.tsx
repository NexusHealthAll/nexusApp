import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Download, LogOut, MonitorDown, Share, Smartphone } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/shared/auth/store/authStore";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

// Matches the gradient wordmark treatment on the Figma "NEXUSCARE" logo mark.
const GRADIENT_WORDMARK_CLASS =
  "bg-gradient-to-r from-brand-700 via-brand-600 to-brand-400 bg-clip-text text-transparent";

function isStandaloneDisplay(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function useIsStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(isStandaloneDisplay);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const onChange = () => setIsStandalone(isStandaloneDisplay());
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isStandalone;
}

/**
 * Hard gate for the health-worker area: the product decision is that health
 * workers must use the installed PWA, never the site in a browser tab. Any
 * post-login health-worker route rendered outside standalone display mode is
 * replaced wholesale by InstallRequiredScreen — there is deliberately no
 * "continue in browser" escape hatch. Dev builds skip the gate so local work
 * doesn't require installing the app.
 */
export function InstallGate({ children }: { children: ReactNode }) {
  const isStandalone = useIsStandalone();

  if (import.meta.env.DEV || isStandalone) return <>{children}</>;

  return <InstallRequiredScreen />;
}

function InstallRequiredScreen() {
  const { canInstall, isIos, isInstalled, promptInstall } = useInstallPrompt();

  function handleLogout() {
    useAuthStore.getState().clearAuthSession();
    window.location.href = "/auth/login";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5faff] px-6 py-10 text-neutral-950">
      <div className="w-full max-w-md">
        <p
          className={cn(
            "text-center text-xs font-extrabold uppercase tracking-wide",
            GRADIENT_WORDMARK_CLASS,
          )}
        >
          NEXUSCARE
        </p>

        <div className="mt-6 rounded-[32px] bg-white p-8 shadow-xl">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-700/10 text-brand-700">
            {isInstalled ? (
              <Smartphone className="h-8 w-8" />
            ) : isIos ? (
              <Share className="h-8 w-8" />
            ) : (
              <Download className="h-8 w-8" />
            )}
          </span>

          {isInstalled ? (
            <>
              <h1 className="mt-6 text-center text-xl font-bold">Open the NexusCare app</h1>
              <p className="mt-3 text-center text-sm text-neutral-600">
                NexusCare is installed on this device. For security and offline support during
                shifts, the health-worker workspace only runs in the app — open NexusCare from
                your home screen or app list to continue.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-6 text-center text-xl font-bold">Install NexusCare to continue</h1>
              <p className="mt-3 text-center text-sm text-neutral-600">
                The health-worker workspace runs as an installed app, not in the browser — so
                your shifts stay one tap away and keep working offline.
              </p>

              {canInstall && (
                <button
                  type="button"
                  onClick={() => promptInstall()}
                  className="mt-6 w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold text-white hover:bg-brand-600"
                >
                  Install App
                </button>
              )}

              {isIos && (
                <ol className="mt-6 space-y-3 rounded-2xl bg-[#f5faff] p-4 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-brand-700">1.</span>
                    <span>
                      Tap the <Share className="mx-0.5 -mt-0.5 inline h-4 w-4" aria-hidden />
                      {" "}Share button in Safari
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-brand-700">2.</span>
                    <span>Choose "Add to Home Screen"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-brand-700">3.</span>
                    <span>Open NexusCare from your home screen</span>
                  </li>
                </ol>
              )}

              {!canInstall && !isIos && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#f5faff] p-4 text-sm text-neutral-700">
                  <MonitorDown className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
                  <p>
                    Open your browser menu and choose <strong>"Install app"</strong> (or{" "}
                    <strong>"Add to Home Screen"</strong>). If you don't see that option, open
                    this page in Chrome or Edge to install NexusCare.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mx-auto mt-6 flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-error-700"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
}
