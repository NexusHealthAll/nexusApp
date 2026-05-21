import { NavLink } from "react-router-dom";
import { ComponentType } from "react";
import {
  CalendarClock,
  ClipboardList,
  Calendar,
  LayoutDashboard,
  MessageSquare,
  Stethoscope,
  UserCheck,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { AppProfile } from "@/types";

interface NavigationItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const profileNavigationItems: Record<AppProfile, NavigationItem[]> = {
  hospital: [
    { name: "Clinical Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Shift Schedule", href: "/shifts", icon: CalendarClock },
    { name: "Staff Rosters", href: "/doctors", icon: ClipboardList },
    { name: "Secure Messaging", href: "/analytics", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ],
  patient: [
    { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Appointments", href: "/appointments", icon: Calendar },
    { name: "Care Team", href: "/doctors", icon: Stethoscope },
    { name: "Messages", href: "/analytics", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ],
  "medical-staff": [
    { name: "Staff Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Schedule", href: "/appointments", icon: Calendar },
    { name: "Patient List", href: "/patients", icon: Users },
    { name: "Clinical Team", href: "/doctors", icon: UserCheck },
    { name: "Settings", href: "/settings", icon: Settings },
  ],
};

const profileBottomNavigationItems: Record<AppProfile, NavigationItem[]> = {
  hospital: [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Support", href: "/help", icon: HelpCircle },
  ],
  patient: [{ name: "Support", href: "/help", icon: HelpCircle }],
  "medical-staff": [{ name: "Support", href: "/help", icon: HelpCircle }],
};

const profileStyles: Record<AppProfile, { active: string; brandText: string }> =
  {
    hospital: {
      active:
        "bg-secondary-50 text-secondary-700 border-r-2 border-secondary-600",
      brandText: "text-secondary-700",
    },
    patient: {
      active: "bg-success-50 text-success-700 border-r-2 border-success-600",
      brandText: "text-success-700",
    },
    "medical-staff": {
      active: "bg-warning-50 text-warning-800 border-r-2 border-warning-600",
      brandText: "text-warning-800",
    },
  };

const profileBasePath: Record<AppProfile, string> = {
  hospital: "/hospital",
  "medical-staff": "/medical-staff",
  patient: "/patient",
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AppProfile;
}

export function Sidebar({ isOpen, onClose, profile }: SidebarProps) {
  const styles = profileStyles[profile];
  const navigationItems = profileNavigationItems[profile];
  const bottomNavigationItems = profileBottomNavigationItems[profile];
  const basePath = profileBasePath[profile];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          {/* Nexus Care Logo */}
          <img
            src="/nexus-care-logo.png"
            alt="Nexus Care Logo"
            className="h-10 w-10 object-contain"
          />
          <span className={cn("text-xl font-bold", styles.brandText)}>
            Nexus Care
          </span>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

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
        </ul>

        {/* Quick Schedule button — hospital only */}
        {profile === "hospital" && (
          <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-secondary-700 to-secondary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90">
            Quick Schedule
          </button>
        )}
      </nav>

      {/* Bottom Navigation */}
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
              onClick={onClose}
              className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
