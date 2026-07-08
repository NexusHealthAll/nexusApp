import { useEffect, useState } from "react";

import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

// Matches the backend's UserRole enum, not the frontend-only "medical-staff"
// AppProfile/URL-section label.
type KnownRole = "health_worker" | "hospital_admin";

type UserData = {
  role?: string;
  [k: string]: unknown;
};

function getRoleFromStorage(): {
  role: KnownRole | null;
  validUserData: boolean;
} {
  const accessToken = localStorage.getItem("accessToken");
  const userDataStr = localStorage.getItem("userData");

  if (!accessToken || !userDataStr) {
    return { role: null, validUserData: false };
  }

  try {
    const userData = JSON.parse(userDataStr) as UserData;
    const role = userData?.role;
    if (role === "health_worker" || role === "hospital_admin") {
      return { role, validUserData: true };
    }

    return { role: null, validUserData: false };
  } catch {
    return { role: null, validUserData: false };
  }
}

function getCanonicalPathForRole(role: KnownRole): string {
  return role === "hospital_admin"
    ? "/hospital/dashboard"
    : "/medical-staff/dashboard";
}

interface PublicOnlyAuthRouteProps {
  children: React.ReactNode;
}

/**
 * Blocks authenticated users from visiting auth pages.
 * If authenticated, redirects them to their canonical dashboard.
 */
export function PublicOnlyAuthRoute({ children }: PublicOnlyAuthRouteProps) {
  const location = useLocation();

  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      const { role, validUserData } = getRoleFromStorage();

      // If token exists but userData is missing/invalid, treat as logged out
      if (!validUserData || !role) {
        useAuthStore.getState().clearAuthSession();
        localStorage.removeItem("pendingUser");
        setRedirectTo(null);
        return;
      }

      const canonical = getCanonicalPathForRole(role);

      // Auth pages
      if (location.pathname.startsWith("/auth")) {
        setRedirectTo(canonical);
        return;
      }

      // Onboarding pages
      if (location.pathname.startsWith("/hospital/onboarding")) {
        setRedirectTo(canonical);
        return;
      }

      setRedirectTo(null);
    };

    check();
  }, [location.pathname]);

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
