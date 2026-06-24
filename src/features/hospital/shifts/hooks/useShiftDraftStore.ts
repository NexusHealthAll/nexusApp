import { create } from "zustand";
import type { ShiftFormData } from "../types";

type ShiftDraftState = {
  draft: ShiftFormData | null;
  setDraft: (data: ShiftFormData) => void;
  clearDraft: () => void;
};

export const useShiftDraftStore = create<ShiftDraftState>((set) => ({
  draft: null,
  setDraft: (data) => set({ draft: data }),
  clearDraft: () => set({ draft: null }),
}));
