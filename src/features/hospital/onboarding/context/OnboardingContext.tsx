import { createContext, useContext, useState, type ReactNode } from "react";

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
};

interface OnboardingCtx {
  formData: OnboardingFormData;
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void;
  setFields: (partial: Partial<OnboardingFormData>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingCtx | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL);

  function setField<K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function setFields(partial: Partial<OnboardingFormData>) {
    setFormData((prev) => ({ ...prev, ...partial }));
  }

  function reset() {
    setFormData(INITIAL);
  }

  return (
    <OnboardingContext.Provider value={{ formData, setField, setFields, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingCtx {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside <OnboardingProvider>");
  return ctx;
}
