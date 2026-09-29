import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/auth/store/authStore";
import type { WaitlistRole } from "../components/waitlistFlowContext";

// Shared by the header "Login" menu and the landing page's role CTAs
// ("Partner with Us" / "Start Practicing") so both send an unauthenticated
// visitor into the same OTP/redirect-aware auth flow instead of diverging.
export function useWaitlistLoginNavigation() {
  const navigate = useNavigate();

  return useCallback(
    (role: WaitlistRole) => {
      const hasToken = !!localStorage.getItem("accessToken");
      if (!hasToken) {
        // Track which auth flow started from (so OTP + redirects can use correct API behavior)
        if (role === "hospital") {
          useAuthStore.getState().setAuthFlowOrigin("hospital-onboarding");
        } else {
          // store currently supports only "hospital-onboarding" | "normal" | null
          useAuthStore.getState().setAuthFlowOrigin("normal");
        }

        localStorage.setItem("selectedRole", role);

        // Start the same role/action auth selection flow as the landing screen.
        // This ensures OTP verification + redirects have consistent context.
        useAuthStore.getState().setActiveAuthFlow({
          role,
          action: "login",
          origin: "landing",
        });

        navigate("/auth/login");
        return;
      }

      // If already logged in, route to dashboards
      try {
        const raw = localStorage.getItem("userData");
        const parsed = raw ? JSON.parse(raw) : null;
        const currentRole = parsed?.role as string | undefined;

        if (currentRole === "hospital_admin") {
          navigate("/hospital/dashboard");
          return;
        }

        if (currentRole === "health_worker") {
          navigate("/medical-staff/dashboard");
          return;
        }
      } catch {
        // ignore
      }

      navigate("/auth/login");
    },
    [navigate],
  );
}
