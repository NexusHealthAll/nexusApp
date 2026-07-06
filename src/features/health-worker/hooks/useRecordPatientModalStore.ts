import { create } from "zustand";

type RecordPatientModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useRecordPatientModalStore = create<RecordPatientModalState>(
  (set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
  }),
);
