import { create } from "zustand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosDevice(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandaloneDisplay(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

interface InstallPromptStoreState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isIos: boolean;
  setDeferredPrompt: (event: BeforeInstallPromptEvent | null) => void;
  setInstalled: (installed: boolean) => void;
}

export const useInstallPromptStore = create<InstallPromptStoreState>((set) => ({
  deferredPrompt: null,
  isInstalled: isStandaloneDisplay(),
  isIos: isIosDevice(),
  setDeferredPrompt: (deferredPrompt) => set({ deferredPrompt }),
  setInstalled: (isInstalled) => set({ isInstalled }),
}));

// Registered once at module scope (not inside a component effect) so the
// event is captured regardless of which component happens to be mounted
// when the browser fires it — it must survive the route change between the
// onboarding flow and the dashboard, which unmount/remount independently.
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  useInstallPromptStore.getState().setDeferredPrompt(event as BeforeInstallPromptEvent);
});

window.addEventListener("appinstalled", () => {
  useInstallPromptStore.getState().setInstalled(true);
  useInstallPromptStore.getState().setDeferredPrompt(null);
});
