import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, ChevronRight, HelpCircle, Menu, Mic, Plus, Search, User } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { AppProfile } from "@/types";
import {
  HospitalProfileService,
} from "@/features/hospital/services/hospitalProfileService";
import { useCreateShiftModalStore } from "@/features/hospital/shifts/hooks/useCreateShiftModalStore";
import { authUtils } from "@/features/auth/utils/authUtils";
import { useRecordPatientModalStore } from "@/features/health-worker/hooks/useRecordPatientModalStore";

function getPageTitle(pathname: string): string {
  if (pathname.includes("/onboarding")) return "Onboarding";
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  const titles: Record<string, string> = {
    dashboard: "Clinical Dashboard",
    patients: "Patients",
    doctors: "Staff Rosters",
    workers: "Workers",
    appointments: "Shift Schedule",
    analytics: "Analytics",
    settings: "Settings",
    help: "Support",
  };
  return (
    titles[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
  );
}

const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  shifts: "Shift Management",
  workers: "Workforce Pool",
  analytics: "Analytics",
  patients: "Patients",
  doctors: "Staff Rosters",
  appointments: "Appointments",
  settings: "Settings",
  help: "Support",
  "find-shifts": "Find Shifts",
  "my-shifts": "My Shifts",
  "patient-notes": "Patient Notes",
  earnings: "Earnings",
  profile: "Profile",
};

function getBreadcrumbLabel(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  return (
    breadcrumbLabels[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
  );
}

interface TopNavigationProps {
  onMenuClick: () => void;
  profile: AppProfile;
}

const profileContent: Record<
  AppProfile,
  { roleLabel: string; searchPlaceholder: string; accent: string }
> = {
  hospital: {
    roleLabel: "Hospital Operations",
    searchPlaceholder: "Search anything...",
    accent: "text-secondary-700",
  },
  patient: {
    roleLabel: "Patient Portal",
    searchPlaceholder: "Search appointments, prescriptions, support...",
    accent: "text-success-700",
  },
  "medical-staff": {
    roleLabel: "Medical Staff Workspace",
    searchPlaceholder: "Search rounds, patients, case notes...",
    accent: "text-warning-800",
  },
};

function HospitalTopNavigation({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const [abbreviation, setAbbreviation] = useState<string | null>(null);
  const openCreateShift = useCreateShiftModalStore((s) => s.open);
  const content = profileContent.hospital;

  useEffect(() => {
    let cancelled = false;
    HospitalProfileService.getProfile().then((data) => {
      if (!cancelled) setAbbreviation(data?.abbreviation ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex min-w-0 items-center gap-1.5 text-sm">
          <span className="flex-shrink-0 font-medium text-neutral-400">
            {abbreviation ?? "—"}
          </span>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-neutral-300" />
          <span className="truncate font-semibold text-neutral-900">
            {getBreadcrumbLabel(location.pathname)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative hidden w-full max-w-xs sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder={content.searchPlaceholder}
            className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-secondary-500"
          />
        </div>

        <button className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:text-neutral-700">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-error-500" />
        </button>

        <Button
          size="sm"
          onClick={openCreateShift}
          className="hidden items-center gap-1.5 rounded-lg bg-gradient-to-r from-secondary-800 to-secondary-600 text-xs font-semibold text-white hover:opacity-90 sm:flex"
        >
          <Plus className="h-3.5 w-3.5" />
          New Shift
        </Button>
      </div>
    </header>
  );
}

function MedicalStaffTopNavigation({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const openRecordPatient = useRecordPatientModalStore((s) => s.open);
  const firstName =
    authUtils.getCurrentUser()?.fullName?.split(" ")[0] ?? "Dr.";

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex min-w-0 items-center gap-1.5 text-sm">
          <span className="flex-shrink-0 font-medium text-neutral-400">
            {firstName}
          </span>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-neutral-300" />
          <span className="truncate font-semibold text-neutral-900">
            {getBreadcrumbLabel(location.pathname)}
          </span>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <button className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:text-neutral-700">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-error-500" />
        </button>

        <Button
          size="sm"
          onClick={openRecordPatient}
          className="flex items-center gap-1.5 rounded-lg bg-error-600 text-xs font-semibold text-white hover:bg-error-700"
        >
          <Mic className="h-3.5 w-3.5" />
          Record Patient
        </Button>
      </div>
    </header>
  );
}

export function TopNavigation({ onMenuClick, profile }: TopNavigationProps) {
  const location = useLocation();

  if (profile === "hospital") {
    return <HospitalTopNavigation onMenuClick={onMenuClick} />;
  }

  if (profile === "medical-staff") {
    return <MedicalStaffTopNavigation onMenuClick={onMenuClick} />;
  }

  const title = getPageTitle(location.pathname);
  const content = profileContent[profile];

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6">
      {/* Left side — mobile menu + page title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className={"text-base font-semibold " + content.accent}>
          {title}
        </span>
      </div>

      {/* Right side — help + avatar */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-2 text-neutral-500 hover:text-neutral-700"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" className="rounded-lg p-1.5">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
