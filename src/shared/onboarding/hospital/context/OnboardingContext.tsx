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
