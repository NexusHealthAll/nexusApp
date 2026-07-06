import { create } from "zustand";

type CreateShiftModalState = {
  isOpen: boolean;
  /** Bumped whenever a shift is successfully created, so any mounted shift
   * list can include it in a fetch effect's dependency array to auto-refresh. */
  refreshKey: number;
  open: () => void;
  close: () => void;
  notifyCreated: () => void;
};

export const useCreateShiftModalStore = create<CreateShiftModalState>(
  (set) => ({
    isOpen: false,
    refreshKey: 0,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    notifyCreated: () =>
      set((state) => ({ isOpen: false, refreshKey: state.refreshKey + 1 })),
  }),
);
