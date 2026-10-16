import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { PATHS } from "@/routes/paths";
import { authUtils } from "@/shared/auth/utils/authUtils";
import { useHospitalProfile } from "@/features/hospital/hooks/useHospitalProfile";
import {
  useNotificationsStore,
  useUnreadNotificationCount,
} from "@/features/hospital/notifications/useNotificationsStore";
import { ThemeToggle } from "@/shared/components/ui/ThemeToggle";

interface HospitalTopBarProps {
  onMenuClick: () => void;
}

/**
 * Hospital top bar per the Figma redesign: global search, notifications,
 * theme toggle, and the admin avatar menu.
 */
export function HospitalTopBar({ onMenuClick }: HospitalTopBarProps) {
  const navigate = useNavigate();
  const { profile } = useHospitalProfile();
  const unreadCount = useUnreadNotificationCount();
  const fetchNotifications = useNotificationsStore((s) => s.fetch);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load once, then keep the bell badge fresh without a page reload.
  useEffect(() => {
    fetchNotifications();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications({ force: true });
      }
    }, 60_000);
    return () => window.clearInterval(id);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleLogout = () => {
    authUtils.clearAuth();
    navigate("/auth/login");
  };

  const adminName = profile?.adminName ?? "—";

  return (
    <header className="border-b border-neutral-200 bg-neutral-50 print:hidden dark:border-[#1E2733] dark:bg-[#0B0F17] dark:text-neutral-100 transition-colors duration-200">
      {/* Same max-width + horizontal padding as <main> in MainLayout, so the top bar and page content share edges. */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 lg:px-8">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative min-w-0 flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search shifts, workers, invoices..."
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-secondary-500 dark:border-[#1E2733] dark:bg-[#121824] dark:text-[#E6EAF2] dark:placeholder:text-[#7B8798]"
          />
        </div>

        <div className="ml-auto flex flex-shrink-0 items-center gap-2.5">
          <ThemeToggle className="dark:border-[#1E2733] dark:bg-[#121824] dark:hover:bg-[#1A2233]" />

          <Link
            to={PATHS.hospital.notifications}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700 dark:border-[#1E2733] dark:bg-[#121824] dark:text-[#A8B3C4] dark:hover:bg-[#1A2233] dark:hover:text-neutral-200"
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span
                aria-hidden
                className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-neutral-50 dark:ring-[#0B0F17]"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
                {profile?.adminInitials ?? "—"}
              </span>
              <span className="hidden text-sm font-semibold text-neutral-900 dark:text-neutral-100 md:block">
                {adminName}
              </span>
              <ChevronDown
                className={cn(
                  "hidden h-4 w-4 text-neutral-400 transition-transform dark:text-neutral-500 md:block",
                  menuOpen && "rotate-180",
                )}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-strong dark:border-neutral-800 dark:bg-neutral-900">
                <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {adminName}
                  </p>
                  <p className="truncate text-xs text-neutral-400 dark:text-neutral-500">
                    {profile?.name ?? ""}
                  </p>
                </div>
                {/* "Hospital Profile" was folded into Settings — one link now
                  covers both (Settings opens to its "Hospital Profile" tab). */}
                <Link
                  to={PATHS.hospital.settings}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 border-t border-neutral-100 px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:border-neutral-800 dark:text-error-400 dark:hover:bg-error-950/40"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
