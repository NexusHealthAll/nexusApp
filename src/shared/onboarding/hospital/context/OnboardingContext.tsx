import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Persists the in-progress draft across page reloads/tab closes so entered
// fields survive a failed registration submit or an accidental refresh.
// Only cleared explicitly when the user leaves the onboarding flow (see reset()).
const STORAGE_KEY = "nexus:hospital-onboarding-draft";

/** All onboarding form data collected across the 3 steps */
export interface OnboardingFormData {
  // ── Step 1: Hospital Details ──
  adminFirstName: string;   // → admin_first_name
  adminLastName: string;    // → admin_last_name
  hospitalName: string;     // → hospital_name
  mdcnNumber: string;       // → registration_number
  email: string;            // → email
  phone: string;            // → phone

  // ── Step 2: Location & Geofencing ──
  streetAddress: string;    // → address.line1
  addressLine2: string;     // → address.line2
  city: string;             // → address.city
  state: string;            // → address.state
  postalCode: string;       // → address.postal_code
  radius: string;
  latitude: number | null;  // → address.latitude, from geocoding the typed address
  longitude: number | null; // → address.longitude, from geocoding the typed address

  // ── Step 3: Identity Verification ──
  hospitalId: string;       // returned from register API, used in identity endpoints
}

const INITIAL: OnboardingFormData = {
  adminFirstName: "",
  adminLastName: "",
  hospitalName: "",
  mdcnNumber: "",
  email: "",
  phone: "",
  streetAddress: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  radius: "500",
  latitude: null,
  longitude: null,
  hospitalId: "",
};

function loadPersisted(): OnboardingFormData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...INITIAL, ...JSON.parse(raw) } : INITIAL;
  } catch {
    return INITIAL;
  }
}

interface OnboardingCtx {
  formData: OnboardingFormData;
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void;
  setFields: (partial: Partial<OnboardingFormData>) => void;
  /** Clears the draft, both in memory and in storage. Call only when the user leaves the flow entirely. */
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingCtx | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<OnboardingFormData>(loadPersisted);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // This provider is only ever mounted while a route inside the onboarding
  // flow is active (see hospitalOnboardingRoutes' layout route) — so its own
  // unmount *usually* means "the user left the flow" (a Back-to-login link,
  // browser back into the rest of the app, or any other in-app navigation).
  // But unmount can also fire for reasons that have nothing to do with the
  // user leaving — React 18 StrictMode's dev-only double-invoke, or a Vite
  // HMR reload of this (or an ancestor) module while iterating on onboarding
  // UI — and none of those change the actual URL. So re-check the real
  // browser location at the moment of cleanup rather than trusting the
  // unmount alone: only clear if it's genuinely no longer on an onboarding
  // route. A hard refresh/tab close never runs this cleanup at all (the page
  // just reloads), so the resume-after-refresh behavior above is unaffected.
  useEffect(() => {
    return () => {
      if (!window.location.pathname.startsWith("/hospital/onboarding")) {
        localStorage.removeItem(STORAGE_KEY);
      }
    };
  }, []);

  function setField<K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function setFields(partial: Partial<OnboardingFormData>) {
    setFormData((prev) => ({ ...prev, ...partial }));
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(INITIAL);
  }

  return (
    <OnboardingContext.Provider value={{ formData, setField, setFields, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Context + its accessor hook are intentionally co-located; splitting into a
// separate file for fast-refresh purity isn't worth the indirection here.
// eslint-disable-next-line react-refresh/only-export-components
export function useOnboarding(): OnboardingCtx {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside <OnboardingProvider>");
  return ctx;
}
