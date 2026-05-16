import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HospitalSetupState {
  locationSet: boolean;
  paymentSet: boolean;
  coordinates: { lat: number; lng: number } | null;
  setLocationDone: (coords: { lat: number; lng: number }) => void;
  setPaymentDone: () => void;
  reset: () => void;
}

export const useHospitalSetup = create<HospitalSetupState>()(
  persist(
    (set) => ({
      locationSet: false,
      paymentSet: false,
      coordinates: null,
      setLocationDone: (coords) =>
        set({ locationSet: true, coordinates: coords }),
      setPaymentDone: () => set({ paymentSet: true }),
      reset: () =>
        set({ locationSet: false, paymentSet: false, coordinates: null }),
    }),
    { name: "hospital-setup" },
  ),
);
