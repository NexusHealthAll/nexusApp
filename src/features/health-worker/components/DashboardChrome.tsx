import type { ComponentType, ReactNode } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { cn } from "@/shared/utils/cn";

function getInitials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "N";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const avatarSizeClasses = {
  sm: "h-10 w-10 text-sm",
  lg: "h-24 w-24 text-2xl",
};

/**
 * Clinician avatar: renders the profile photo when one is set, otherwise
 * falls back to initials on the brand-tinted bordered circle used
 * throughout the health-worker app (top app bar + Profile screen).
 */
export function Avatar({
  name,
  photoUrl,
  size = "sm",
  className,
}: {
  name?: string | null;
  photoUrl?: string | null;
  size?: "sm" | "lg";
  className?: string;
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name ?? "Profile photo"}
        className={cn(
          "shrink-0 rounded-full border-2 border-brand-200 object-cover",
          avatarSizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-100 font-bold text-brand-700",
        avatarSizeClasses[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export function Header({
  title,
  subtitle,
  onBack,
  onNotifications,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onNotifications?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-100 bg-[#f6fbff]/95 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-full p-1.5 text-brand-700 hover:bg-brand-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-700">
              NexusCare
            </p>
            {title && (
              <h1 className="truncate text-xl font-bold text-neutral-950">
                {title}
              </h1>
            )}
            {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
          </div>
        </div>
        {onNotifications && (
          <button
            type="button"
            onClick={onNotifications}
            className="rounded-full p-2 text-brand-700 hover:bg-brand-50"
          >
            <Bell className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}

export function StatusBadge({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "green" | "red" | "amber";
}) {
  const tones = {
    blue: "bg-brand-50 text-brand-700",
    green: "bg-success-50 text-success-700",
    red: "bg-error-50 text-error-700",
    amber: "bg-warning-50 text-warning-700",
  };

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase", tones[tone])}>
      {children}
    </span>
  );
}

export function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <Icon className="h-5 w-5 text-brand-700" />
      <p className="mt-3 text-xs text-neutral-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

export function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <Icon className="h-5 w-5 text-brand-700" />
      <p className="mt-2 text-xs text-neutral-500">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

export function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-xl bg-brand-50 p-2 text-brand-700">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}

export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatKobo(kobo: number): string {
  return formatCurrency(Math.round(kobo / 100));
}
