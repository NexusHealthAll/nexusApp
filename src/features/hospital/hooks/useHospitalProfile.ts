import { useEffect } from "react";
import { create } from "zustand";
import {
  HospitalProfileService,
  type HospitalProfile,
} from "@/features/hospital/services/hospitalProfileService";

interface HospitalProfileStoreState {
  profile: HospitalProfile | null;
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  fetchProfile: () => Promise<void>;
  refresh: () => Promise<void>;
}

let inFlightRequest: Promise<void> | null = null;

/**
 * Global hospital identity/approval store (name, abbreviation, admin,
 * `adminRegistrationStatus`) — the single source of truth for the header,
 * sidebar, and shift-creation gating, instead of each independently hitting
 * `GET /api/v1/hospitals/:id`. `DashboardOverview` triggers the initial
 * fetch on mount (the default landing route after login); any other
 * consumer that happens to mount first triggers it itself instead, via the
 * `useHospitalProfile` hook below, so nothing is left permanently empty.
 */
export const useHospitalProfileStore = create<HospitalProfileStoreState>(
  (set, get) => ({
    profile: null,
    isLoading: false,
    error: null,
    hasFetched: false,
    fetchProfile: async () => {
      if (get().hasFetched || inFlightRequest) {
        return inFlightRequest ?? Promise.resolve();
      }

      set({ isLoading: true, error: null });

      inFlightRequest = HospitalProfileService.getProfile()
        .then((profile) => {
          set({ profile, isLoading: false, hasFetched: true });
        })
        .catch(() => {
          set({
            error: "Unable to load hospital profile.",
            isLoading: false,
            hasFetched: true,
          });
        })
        .finally(() => {
          inFlightRequest = null;
        });

      return inFlightRequest;
    },
    refresh: async () => {
      inFlightRequest = null;
      set({ hasFetched: false, profile: null });
      return get().fetchProfile();
    },
  }),
);

/**
 * Convenience hook: reads the shared store and triggers its fetch on mount
 * if needed. Pass `enabled = false` from components that render across
 * multiple profiles (e.g. the shared `Sidebar`) so a non-hospital profile
 * doesn't trigger a hospital-only fetch.
 */
export function useHospitalProfile(enabled = true) {
  const profile = useHospitalProfileStore((s) => s.profile);
  const isLoading = useHospitalProfileStore((s) => s.isLoading);
  const error = useHospitalProfileStore((s) => s.error);
  const fetchProfile = useHospitalProfileStore((s) => s.fetchProfile);
  const refresh = useHospitalProfileStore((s) => s.refresh);

  useEffect(() => {
    if (enabled) fetchProfile();
  }, [enabled, fetchProfile]);

  return { profile, isLoading, error, refresh };
}
