import { NavLink, useNavigate } from "react-router-dom";
import { ComponentType, useEffect, useState } from "react";
import {
  BarChart2,
  CalendarClock,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  Stethoscope,
  Users,
  Building2,
  Settings,
  HelpCircle,
  LogOut,
  Wallet,
  User,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { AppProfile } from "@/types";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { Badge, type BadgeVariant } from "@/shared/components/ui/Badge";
import { authUtils } from "@/features/auth/utils/authUtils";
import { useHospitalProfile } from "@/features/hospital/hooks/useHospitalProfile";
import type { HospitalRegistrationStatus } from "@/features/hospital/services/hospitalProfileService";
import { HospitalMetricsService } from "@/features/hospital/services/hospitalMetricsService";
import {
  HealthWorkerProfile,
  HealthWorkerService,
} from "@/features/health-worker/services/healthWorkerService";

function getStoredWorkerId(): string {
  const user = authUtils.getCurrentUser();
  return user?.id || "HW001";
}

interface NavigationItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const profileNavigationItems: Record<AppProfile, NavigationItem[]> = {
  hospital: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Shifts", href: "/shifts", icon: CalendarClock },
    { name: "Workers", href: "/workers", icon: Users },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    // { name: "Staff Rosters", href: "/doctors", icon: ClipboardList },
    // { name: "Messages", href: "/messages", icon: MessageSquare },
  ],
  patient: [
    { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Appointments", href: "/appointments", icon: Calendar },
    { name: "Care Team", href: "/doctors", icon: Stethoscope },
    { name: "Messages", href: "/analytics", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ],
  "medical-staff": [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Find Shifts", href: "/find-shifts", icon: Search },
    { name: "My Shifts", href: "/my-shifts", icon: CalendarClock },
    { name: "Patient Notes", href: "/patient-notes", icon: FileText },
    { name: "Earnings", href: "/earnings", icon: Wallet },
    { name: "Profile", href: "/profile", icon: User },
  ],
};

const profileBottomNavigationItems: Record<AppProfile, NavigationItem[]> = {
  hospital: [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Support", href: "/help", icon: HelpCircle },
  ],
  patient: [{ name: "Support", href: "/help", icon: HelpCircle }],
  "medical-staff": [{ name: "Settings", href: "/settings", icon: Settings }],
};

const profileStyles: Record<AppProfile, { active: string; brandText: string }> =
{
  hospital: {
    active:
      "bg-gradient-to-r from-secondary-700 to-secondary-500 text-white shadow-sm",
    brandText: "text-secondary-700",
  },
  patient: {
    active: "bg-success-50 text-success-700 border-r-2 border-success-600",
    brandText: "text-success-700",
  },
  "medical-staff": {
    active: "bg-primary-700 text-white shadow-sm",
    brandText: "text-primary-700",
  },
};

const profileBasePath: Record<AppProfile, string> = {
  hospital: "/hospital",
  "medical-staff": "/medical-staff",
  patient: "/patient",
};

const registrationStatusBadge: Record<
  HospitalRegistrationStatus,
  { variant: BadgeVariant; label: string }
> = {
  pending: { variant: "warning", label: "Pending Review" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "error", label: "Rejected" },
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AppProfile;
}

export function Sidebar({ isOpen, onClose, profile }: SidebarProps) {
  const navigate = useNavigate();
  const styles = profileStyles[profile];
  const navigationItems = profileNavigationItems[profile];
  const bottomNavigationItems = profileBottomNavigationItems[profile];
  const basePath = profileBasePath[profile];
  const isHospital = profile === "hospital";
  const isMedicalStaff = profile === "medical-staff";

  const { profile: hospitalProfile } = useHospitalProfile(isHospital);
  const [shiftsBadge, setShiftsBadge] = useState<number | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [workerProfile, setWorkerProfile] = useState<HealthWorkerProfile | null>(null);
  const [findShiftsBadge, setFindShiftsBadge] = useState<number | null>(null);
  const [activeShift, setActiveShift] = useState<{ hospitalAbbr: string; timeRange: string } | null>(null);

  useEffect(() => {
    if (!isHospital) return;
    let cancelled = false;
    HospitalMetricsService.getOverviewStats().then((data) => {
      if (!cancelled) setShiftsBadge(data.openShifts);
    });
    return () => {
      cancelled = true;
    };
  }, [isHospital]);

  useEffect(() => {
    if (!isMedicalStaff) return;
    let cancelled = false;
    const workerId = getStoredWorkerId();
    HealthWorkerService.getWorkerProfile(workerId).then((data) => {
      if (!cancelled) setWorkerProfile(data);
    });
    HealthWorkerService.getAvailableShifts(workerId).then((data) => {
      if (!cancelled) setFindShiftsBadge(data.length);
    });
    HealthWorkerService.getShiftHistory(workerId).then((data) => {
      if (cancelled) return;
      const inProgress = data.find((s) => s.status === "in_progress");
      setActiveShift(
        inProgress
          ? { hospitalAbbr: "LUTH", timeRange: "2PM–10PM" }
          : null,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [isMedicalStaff]);

  const handleLogout = () => {
    authUtils.clearAuth();
    navigate("/auth/login");
    onClose(); // Close sidebar after logout
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center px-6 border-b border-neutral-200">
        {/* Nexus Care Logo */}
        <NexusCareLogo size="md" />

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute right-6 top-4 p-2 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Hospital identity */}
      {isHospital && hospitalProfile && (
        <div className="mx-4 mt-4 flex items-start gap-2.5 rounded-xl bg-primary-50 px-3.5 py-3">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
            <Building2 className="h-4 w-4 text-primary-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-primary-700">
              {hospitalProfile.abbreviation}
            </p>
            <p className="truncate text-xs leading-snug text-primary-600/80">
              {hospitalProfile.name}
            </p>
            {hospitalProfile.adminRegistrationStatus && (
              <Badge
                variant={registrationStatusBadge[hospitalProfile.adminRegistrationStatus].variant}
                className="mt-1.5"
              >
                {registrationStatusBadge[hospitalProfile.adminRegistrationStatus].label}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Health-worker identity + active shift */}
      {isMedicalStaff && workerProfile && (
        <div className="mx-4 mt-4 space-y-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-primary-50 px-3.5 py-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {workerProfile.name
                .replace(/^Dr\.\s+/, "")
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-primary-700">
                {workerProfile.name}
              </p>
              <p className="truncate text-xs text-neutral-500">
                {workerProfile.rating.toFixed(1)} •{" "}
                {workerProfile.specialization.split(" ")[0]}
              </p>
            </div>
          </div>

          {activeShift && (
            <div className="rounded-xl bg-success-50 px-3.5 py-2.5">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-success-700">
                <span className="h-1.5 w-1.5 rounded-full bg-success-600" />
                Active Shift
              </p>
              <p className="mt-0.5 text-xs text-success-700">
                {activeShift.hospitalAbbr} • {activeShift.timeRange}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={`${basePath}${item.href}`}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? styles.active
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </span>
                    {isHospital && item.name === "Shifts" && !!shiftsBadge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          isActive
                            ? "bg-white/25 text-white"
                            : "bg-error-100 text-error-700",
                        )}
                      >
                        {shiftsBadge}
                      </span>
                    )}
                    {isMedicalStaff &&
                      item.name === "Find Shifts" &&
                      !!findShiftsBadge && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            isActive
                              ? "bg-white/25 text-white"
                              : "bg-primary-100 text-primary-700",
                          )}
                        >
                          {findShiftsBadge}
                        </span>
                      )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom */}
      {isHospital ? (
        <div className="relative border-t border-neutral-200 p-3">
          {profileMenuOpen && (
            <div className="absolute inset-x-3 bottom-full mb-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-strong">
              {bottomNavigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={`${basePath}${item.href}`}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border-t border-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-neutral-50"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
              {hospitalProfile?.adminInitials ?? "—"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-900">
                {hospitalProfile?.adminName ?? "—"}
              </p>
              <p className="truncate text-xs text-neutral-400">
                {hospitalProfile?.adminRole ?? ""}
              </p>
            </div>
            {profileMenuOpen ? (
              <ChevronUp className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            ) : (
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            )}
          </button>
        </div>
      ) : (
        <div className="border-t border-neutral-200 p-4">
          <ul className="space-y-2">
            {bottomNavigationItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={`${basePath}${item.href}`}
                  onClick={onClose} // Close sidebar on mobile when navigating
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? styles.active
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}

            {/* Logout Button */}
            <li>
              <button
                onClick={handleLogout}
                className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </aside>
  );
}
