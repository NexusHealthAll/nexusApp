import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
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

interface HospitalTopBarProps {
  onMenuClick: () => void;
}

/**
 * Hospital top bar per the Figma redesign: global search, dark Create Shift
 * CTA, messages + notifications icon buttons, and the admin avatar menu.
 */
export function HospitalTopBar({ onMenuClick }: HospitalTopBarProps) {
  const navigate = useNavigate();
  const { profile } = useHospitalProfile();
  const unreadCount = useUnreadNotificationCount();
  const fetchNotifications = useNotificationsStore((s) => s.fetch);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
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
    <header className="flex h-16 items-center gap-3 border-b border-neutral-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative min-w-0 flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search shifts, workers, invoices..."
          className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-secondary-500"
        />
      </div>

      <div className="ml-auto flex flex-shrink-0 items-center gap-2.5">
        <button
          onClick={() => navigate(PATHS.hospital.createShift)}
          className="hidden h-9 items-center gap-1.5 rounded-lg bg-neutral-800 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-900 sm:flex"
        >
          <Plus className="h-4 w-4" />
          Create Shift
        </button>

        <Link
          to={PATHS.hospital.messages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
          aria-label="Messages"
        >
          <MessageSquare className="h-4 w-4" />
        </Link>

        <Link
          to={PATHS.hospital.notifications}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-neutral-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
              {profile?.adminInitials ?? "—"}
            </span>
            <span className="hidden text-sm font-semibold text-neutral-900 md:block">
              {adminName}
            </span>
            <ChevronDown
              className={cn(
                "hidden h-4 w-4 text-neutral-400 transition-transform md:block",
                menuOpen && "rotate-180",
              )}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-strong">
              <div className="border-b border-neutral-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-neutral-900">
                  {adminName}
                </p>
                <p className="truncate text-xs text-neutral-400">
                  {profile?.name ?? ""}
                </p>
              </div>
              <Link
                to={PATHS.hospital.profile}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              >
                <Building2 className="h-4 w-4" />
                Hospital Profile
              </Link>
              <Link
                to={PATHS.hospital.settings}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 border-t border-neutral-100 px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
