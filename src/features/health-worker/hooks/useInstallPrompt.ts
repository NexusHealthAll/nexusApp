import { useCallback } from "react";
import { useInstallPromptStore } from "./useInstallPromptStore";

export function useInstallPrompt() {
  const deferredPrompt = useInstallPromptStore((s) => s.deferredPrompt);
  const isInstalled = useInstallPromptStore((s) => s.isInstalled);
  const isIos = useInstallPromptStore((s) => s.isIos);
  const setDeferredPrompt = useInstallPromptStore((s) => s.setDeferredPrompt);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome === "accepted";
  }, [deferredPrompt, setDeferredPrompt]);

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    // iOS Safari never fires `beforeinstallprompt` — this is how consumers
    // (e.g. InstallPromptBanner) know to show manual "Add to Home Screen"
    // instructions instead of a native install button.
    isIos: isIos && !isInstalled,
    promptInstall,
  };
}
