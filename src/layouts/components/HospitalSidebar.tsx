import { NavLink } from "react-router-dom";
import type { ComponentType } from "react";
import {
  BarChart2,
  Bell,
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutGrid,
  MessageSquare,
  Settings,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { PATHS } from "@/routes/paths";
import { useHospitalProfile } from "@/features/hospital/hooks/useHospitalProfile";

interface NavItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { name: "Dashboard", href: PATHS.hospital.dashboard, icon: LayoutGrid },
  {
    name: "Shift Management",
    href: PATHS.hospital.shifts,
    icon: CalendarDays,
  },
  { name: "Create Shift", href: PATHS.hospital.createShift, icon: UserPlus },
  { name: "Virtual Shifts", href: PATHS.hospital.virtualShifts, icon: Video },
  {
    name: "Handover Reports",
    href: PATHS.hospital.handoverReports,
    icon: FileText,
  },
  { name: "Workers", href: PATHS.hospital.workers, icon: Users },
  {
    name: "Messages",
    href: PATHS.hospital.messages,
    icon: MessageSquare,
  },
  { name: "Payments", href: PATHS.hospital.payments, icon: CreditCard },
  {
    name: "Analytics",
    href: PATHS.hospital.analytics,
    icon: BarChart2,
  },
  { name: "Notifications", href: PATHS.hospital.notifications, icon: Bell },
];

const secondaryNavItems: NavItem[] = [
  {
    name: "Hospital Profile",
    href: PATHS.hospital.profile,
    icon: Building2,
  },
  { name: "Settings", href: PATHS.hospital.settings, icon: Settings },
  { name: "Help Center", href: PATHS.hospital.help, icon: HelpCircle },
];

function SidebarNavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      to={item.href}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-secondary-50 font-semibold text-secondary-700"
            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
        )
      }
    >
      <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
      <span>{item.name}</span>
    </NavLink>
  );
}

interface HospitalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Hospital-side navigation matching the Figma redesign: main product areas
 * on top, hospital-level pages below a divider, and the hospital identity
 * block pinned to the bottom.
 */
export function HospitalSidebar({ isOpen, onClose }: HospitalSidebarProps) {
  const { profile } = useHospitalProfile();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-neutral-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 items-center px-5">
        <NexusCareLogo size="md" />
        <button
          onClick={onClose}
          className="absolute right-4 top-5 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.name}>
              <SidebarNavLink item={item} onNavigate={onClose} />
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-neutral-200" />

        <ul className="space-y-1">
          {secondaryNavItems.map((item) => (
            <li key={item.name}>
              <SidebarNavLink item={item} onNavigate={onClose} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-neutral-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-xs font-bold text-white">
            {profile?.abbreviation?.slice(0, 2) ?? "—"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {profile?.name ?? "—"}
            </p>
            <p className="truncate text-xs text-neutral-400">
              {profile?.adminRole ?? "Administrator"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
