import { create } from "zustand";

interface PwaUpdateStoreState {
  needRefresh: boolean;
  updateServiceWorker: (() => Promise<void>) | null;
  setNeedRefresh: (needRefresh: boolean) => void;
  setUpdateServiceWorker: (fn: () => Promise<void>) => void;
}

// Populated by usePwaServiceWorker() once, at app boot — read from here
// (rather than calling useRegisterSW() again) so every consumer, e.g. the
// update-available toast, shares the same registration/update state instead
// of each triggering its own independent SW registration.
export const usePwaUpdateStore = create<PwaUpdateStoreState>((set) => ({
  needRefresh: false,
  updateServiceWorker: null,
  setNeedRefresh: (needRefresh) => set({ needRefresh }),
  setUpdateServiceWorker: (updateServiceWorker) => set({ updateServiceWorker }),
}));
