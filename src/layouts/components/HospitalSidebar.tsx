import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  BarChart2,
  Bell,
  ChevronLeft,
  ChevronRight,
  Banknote,
  FilePen,
  HelpCircle,
  LayoutGrid,
  Settings,
  Plus,
  Users,
  Video,
  X,
  CalendarCog,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { PATHS } from "@/routes/paths";
import { HospitalMetricsService } from "@/features/hospital/services/hospitalMetricsService";
import { PaymentsService } from "@/features/hospital/payments/paymentsService";
import { useUnreadNotificationCount } from "@/features/hospital/notifications/useNotificationsStore";
import { useHospitalProfile } from "@/features/hospital/hooks/useHospitalProfile";

interface NavItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  /** Key into the live badge counts, if this tab shows one. */
  badge?:
    | "ongoingShifts"
    | "pendingPayments"
    | "upcomingVirtual"
    | "unreadNotifications";
}

const mainNavItems: NavItem[] = [
  { name: "Dashboard", href: PATHS.hospital.dashboard, icon: LayoutGrid },
  {
    name: "Shift Management",
    href: PATHS.hospital.shifts,
    icon: CalendarCog,
    badge: "ongoingShifts",
  },
  { name: "Create Shift", href: PATHS.hospital.createShift, icon: Plus },
  {
    name: "Telehealth Visits",
    href: PATHS.hospital.virtualShifts,
    icon: Video,
    badge: "upcomingVirtual",
  },
  {
    name: "Handover Reports",
    href: PATHS.hospital.handoverReports,
    icon: FilePen,
  },
  { name: "Workers", href: PATHS.hospital.workers, icon: Users },
  {
    name: "Payments",
    href: PATHS.hospital.payments,
    icon: Banknote,
    badge: "pendingPayments",
  },
  {
    name: "Analytics",
    href: PATHS.hospital.analytics,
    icon: BarChart2,
  },
  {
    name: "Notifications",
    href: PATHS.hospital.notifications,
    icon: Bell,
    badge: "unreadNotifications",
  },
];

// "Hospital Profile" was folded into Settings (/hospital/settings now opens
// straight to its "Hospital Profile" section) — no separate nav entry needed.
const secondaryNavItems: NavItem[] = [
  { name: "Settings", href: PATHS.hospital.settings, icon: Settings },
  { name: "Help Center", href: PATHS.hospital.help, icon: HelpCircle },
];

function useSidebarBadgeCounts() {
  const [counts, setCounts] = useState({
    ongoingShifts: 0,
    pendingPayments: 0,
    upcomingVirtual: 0,
  });
  const unreadNotifications = useUnreadNotificationCount();
  const { pathname } = useLocation();

  // Refresh on navigation so the badges track changes made on those pages.
  useEffect(() => {
    let cancelled = false;
    HospitalMetricsService.countByStatus("in_progress")
      .then((n) => !cancelled && setCounts((c) => ({ ...c, ongoingShifts: n })))
      .catch(() => {});
    HospitalMetricsService.countUpcomingVirtual()
      .then(
        (n) => !cancelled && setCounts((c) => ({ ...c, upcomingVirtual: n })),
      )
      .catch(() => {});
    PaymentsService.getPendingCount()
      .then(
        (n) => !cancelled && setCounts((c) => ({ ...c, pendingPayments: n })),
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return { ...counts, unreadNotifications };
}

const COLLAPSED_KEY = "nexus.hospitalSidebar.collapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Hover/focus label for the icon-only rail. Rendered in a portal with fixed
 * positioning so the sidebar's scroll container can't clip it.
 */
function RailTooltip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: ReactNode;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = (el: HTMLElement) => {
    if (!enabled || !window.matchMedia(DESKTOP_QUERY).matches) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.top + r.height / 2, left: r.right + 12 });
  };
  const hide = () => setPos(null);

  useEffect(() => {
    if (!enabled) setPos(null);
  }, [enabled]);

  return (
    <div
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={hide}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={hide}
      onClick={hide}
    >
      {children}
      {pos &&
        createPortal(
          <span
            role="tooltip"
            style={{ top: pos.top, left: pos.left }}
            className="pointer-events-none fixed z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#2C4A1F] bg-[#1E3A12] px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:border-[#2A3547] dark:bg-[#1A2233] dark:text-[#E6EAF2]"
          >
            <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-[#2C4A1F] bg-[#1E3A12] dark:border-[#2A3547] dark:bg-[#1A2233]" />
            {label}
          </span>,
          document.body,
        )}
    </div>
  );
}

function SidebarNavLink({
  item,
  count,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  count: number;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <RailTooltip label={item.name} enabled={collapsed}>
      <NavLink
        to={item.href}
        onClick={onNavigate}
        aria-label={item.name}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-normal transition-colors",
            collapsed && "lg:justify-center lg:px-0",
            isActive
              ? "bg-[#E3EAD8] text-[#1E3A12] dark:bg-[#1A2233] dark:text-[#E6EAF2]"
              : "text-[#2F3B29] hover:bg-[#E9EFE0] hover:text-[#1E3A12] dark:text-[#A8B3C4] dark:hover:bg-[#141B24] dark:hover:text-[#E6EAF2]",
          )
        }
      >
        <span className="relative flex-shrink-0">
          <item.icon className="h-[20px] w-[20px]" />
          {count > 0 && collapsed && (
            <span className="absolute -right-1.5 -top-1.5 hidden h-2.5 w-2.5 rounded-full bg-[#1E3A12] lg:block dark:bg-[#E6EAF2]" />
          )}
        </span>
        <span className={cn("flex-1", collapsed && "lg:hidden")}>
          {item.name}
        </span>
        {count > 0 && (
          <span
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full bg-[#CDEB9F] px-1.5 text-xs font-semibold text-[#1E3A12] dark:bg-[#1A2233] dark:text-[#E6EAF2]",
              collapsed && "lg:hidden",
            )}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </NavLink>
    </RailTooltip>
  );
}

interface HospitalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Hospital-side navigation: logo + collapse caret on top, main product areas,
 * hospital-level pages below a divider, and the hospital identity block pinned
 * to the bottom. On desktop it can collapse to an icon-only rail (persisted);
 * the mobile drawer is always expanded.
 */
export function HospitalSidebar({ isOpen, onClose }: HospitalSidebarProps) {
  const { profile } = useHospitalProfile();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const counts = useSidebarBadgeCounts();

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      /* storage unavailable — state just won't persist */
    }
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border-r border-[#E1E6DA] bg-[#F4F6F1] dark:border-[#1E2733] dark:bg-[#0E131B] transition-[transform,width] duration-300 ease-in-out print:hidden lg:static lg:inset-0 lg:translate-x-0",
        collapsed && "lg:w-[84px]",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-5 pb-2 pt-6",
          collapsed && "lg:flex-col lg:gap-4 lg:px-0",
        )}
      >
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="h-9 w-9 flex-shrink-0" />
          <span
            className={cn(
              "text-[22px] font-bold tracking-tight text-[#1E3A12] dark:text-[#E6EAF2]",
              collapsed && "lg:hidden",
            )}
          >
            NexusCare
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="hidden h-8 w-8 items-center justify-center rounded-full border border-[#D5DCCB] bg-white text-[#1E3A12] transition-colors hover:bg-[#E9EFE0] dark:border-[#1E2733] dark:bg-[#141B24] dark:text-[#E6EAF2] lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav
        className={cn(
          "flex-1 overflow-y-auto px-4 py-5",
          collapsed && "lg:px-3",
        )}
      >
        <ul className="space-y-2">
          {mainNavItems.map((item) => (
            <li key={item.name}>
              <SidebarNavLink
                item={item}
                count={item.badge ? counts[item.badge] : 0}
                collapsed={collapsed}
                onNavigate={onClose}
              />
            </li>
          ))}
        </ul>

        <div className="my-5 border-t border-[#DDE3D5] dark:border-[#1E2733]" />

        <ul className="space-y-2">
          {secondaryNavItems.map((item) => (
            <li key={item.name}>
              <SidebarNavLink
                item={item}
                count={item.badge ? counts[item.badge] : 0}
                collapsed={collapsed}
                onNavigate={onClose}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-[#DDE3D5] p-4 dark:border-[#1E2733]">
        <RailTooltip label={profile?.name ?? "Hospital"} enabled={collapsed}>
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "lg:justify-center",
            )}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#1E3A12] text-xs font-bold text-white dark:bg-[#1A2233] dark:text-[#E6EAF2]">
              {profile?.abbreviation?.slice(0, 2) ?? "—"}
            </div>
            <div className={cn("min-w-0", collapsed && "lg:hidden")}>
              <p className="truncate text-sm font-semibold text-neutral-900 dark:text-[#E6EAF2]">
                {profile?.name ?? "—"}
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-[#7B8798]">
                {profile?.adminRole ?? "Administrator"}
              </p>
            </div>
          </div>
        </RailTooltip>
      </div>
    </aside>
  );
}
