import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

type UserRole = "medical-staff" | "hospital_admin";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: UserRole;
};

type UserData = {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
  loginAt?: string;
  createdAt?: string;
};

function isKnownRole(role: unknown): role is UserRole {
  return role === "medical-staff" || role === "hospital_admin";
}

function purgeAuth() {
  // localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("authToken"); // legacy
  localStorage.removeItem("pendingUser");

  // zustand
  useAuthStore.getState().clearAuthSession();
}

function getCanonicalDashboardPath(role: UserRole) {
  return role === "hospital_admin"
    ? "/hospital/dashboard"
    : "/medical-staff/dashboard";
}

function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/hospital/")) return "hospital_admin";
  if (pathname.startsWith("/medical-staff/")) return "medical-staff";
  return null;
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const currentRoleFromUrl = useMemo(
    () => getRoleFromPath(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    const checkAuth = () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const userDataStr = localStorage.getItem("userData");

        if (!accessToken || !userDataStr) {
          purgeAuth();
          setIsAuthenticated(false);
          setUserRole(null);
          return;
        }

        const userData: UserData = JSON.parse(userDataStr);
        const role = userData?.role;

        if (!isKnownRole(role) || !userData?.id) {
          purgeAuth();
          setIsAuthenticated(false);
          setUserRole(null);
          return;
        }

        setIsAuthenticated(true);
        setUserRole(role);

        // Extra safety: if the requiredRole is explicitly provided and mismatched,
        // let the redirect logic below handle it.
      } catch (error) {
        purgeAuth();
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-2 text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userRole) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 1) Explicit role requirement check
  if (requiredRole && userRole !== requiredRole) {
    return (
      <Navigate
        to={getCanonicalDashboardPath(userRole)}
        replace
        state={{ from: location }}
      />
    );
  }

  // 2) Role must match the section they are trying to access.
  //    - hospital_admin => /hospital/*
  //    - medical-staff => /medical-staff/*
  if (currentRoleFromUrl && currentRoleFromUrl !== userRole) {
    return <Navigate to={getCanonicalDashboardPath(userRole)} replace />;
  }

  return <>{children}</>;
}
