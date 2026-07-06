import { create } from "zustand";

type AuthUser = {
  id: string;
  hospital_id?: string;
  email?: string;
  phone?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
  is_active?: boolean;
  last_login_at?: string | null;
  created_at?: string;
  [k: string]: unknown;
};

export type AuthRole = "hospital" | "health-worker";

export type AuthAction = "register" | "login";

type AuthFlowOrigin =
  | "landing"
  | "hospital-onboarding"
  | "health-worker-onboarding";

type ActiveAuthFlow = {
  role: AuthRole;
  action: AuthAction;
  origin: AuthFlowOrigin;
} | null;

type AuthStoreState = {
  // Email used to prefill login/OTP screens
  pendingEmail: string;
  setPendingEmail: (email: string) => void;
  clearPendingEmail: () => void;

  // Active role/action selection for the auth journey
  activeAuthFlow: ActiveAuthFlow;
  setActiveAuthFlow: (flow: ActiveAuthFlow) => void;

  clearActiveAuthFlow: () => void;

  // Legacy: kept temporarily for backwards compatibility
  authFlowOrigin: "hospital-onboarding" | "normal" | null;
  setAuthFlowOrigin: (origin: "hospital-onboarding" | "normal" | null) => void;
  clearAuthFlowOrigin: () => void;

  accessToken: string;
  refreshToken: string;
  user: AuthUser | null;

  // Clinician-specific context for health-worker onboarding
  clinicianId: string;
  setClinicianId: (clinicianId: string) => void;
  clearClinicianId: () => void;

  setAuthSession: (args: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }) => void;

  clearAuthSession: () => void;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
  pendingEmail: "",
  setPendingEmail: (email) => set({ pendingEmail: email }),
  clearPendingEmail: () => set({ pendingEmail: "" }),

  activeAuthFlow: null,
  setActiveAuthFlow: (flow) => set({ activeAuthFlow: flow }),
  clearActiveAuthFlow: () => set({ activeAuthFlow: null }),

  clinicianId: localStorage.getItem("clinicianId") ?? "",
  setClinicianId: (clinicianId) => {
    localStorage.setItem("clinicianId", clinicianId);
    set({ clinicianId });
  },
  clearClinicianId: () => {
    localStorage.removeItem("clinicianId");
    set({ clinicianId: "" });
  },

  // Legacy
  authFlowOrigin: null,
  setAuthFlowOrigin: (origin) => set({ authFlowOrigin: origin }),
  clearAuthFlowOrigin: () => set({ authFlowOrigin: null }),

  accessToken: localStorage.getItem("accessToken") ?? "",
  refreshToken: localStorage.getItem("refreshToken") ?? "",
  user: (() => {
    const raw = localStorage.getItem("userData");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  })(),

  setAuthSession: ({ accessToken, refreshToken, user }) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userData", JSON.stringify(user));

    set({ accessToken, refreshToken, user });
  },

  clearAuthSession: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");

    // clinician onboarding context
    localStorage.removeItem("clinicianId");

    set({ accessToken: "", refreshToken: "", user: null, clinicianId: "" });
  },
}));
