import { create } from "zustand";

type HandoverModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useHandoverModalStore = create<HandoverModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
