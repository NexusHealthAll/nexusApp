import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { usePwaUpdateStore } from "./usePwaUpdateStore";

/**
 * Registers the service worker exactly once, for the whole app's lifetime
 * (mount at the top of App.tsx). The SW's own `scope: "/medical-staff/"`
 * (see vite.config.ts) keeps it from ever controlling hospital pages, so
 * it's safe — and necessary, for `beforeinstallprompt` to fire at all — to
 * register unconditionally here rather than only under the health-worker
 * route tree.
 */
export function usePwaServiceWorker() {
  const setNeedRefresh = usePwaUpdateStore((s) => s.setNeedRefresh);
  const setUpdateServiceWorker = usePwaUpdateStore((s) => s.setUpdateServiceWorker);

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisterError(error) {
      console.error("Service worker registration failed:", error);
    },
  });

  useEffect(() => {
    setNeedRefresh(needRefresh[0]);
  }, [needRefresh, setNeedRefresh]);

  useEffect(() => {
    setUpdateServiceWorker(() => updateServiceWorker(true));
  }, [updateServiceWorker, setUpdateServiceWorker]);
}
