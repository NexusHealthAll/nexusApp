import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/apiClient";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { appToast } from "@/shared/components/feedback/toast";
import { cn } from "@/shared/utils/cn";
import { authUtils } from "@/shared/auth/utils/authUtils";
import { useAuthStore } from "@/shared/auth/store/authStore";
import { useHospitalProfile } from "@/features/hospital/hooks/useHospitalProfile";

type SettingsSection =
  | "account"
  | "security"
  | "notifications"
  | "payment"
  | "appearance"
  | "privacy";

const SECTIONS: { id: SettingsSection; label: string }[] = [
  { id: "account", label: "Account Settings" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "payment", label: "Payment Settings" },
  { id: "appearance", label: "Language & Appearance" },
  { id: "privacy", label: "Privacy" },
];

const NOTIFICATION_PREFS = [
  {
    id: "shift_updates",
    title: "Shift Updates",
    description: "Applications, acceptances, and cancellations",
    default: true,
  },
  {
    id: "worker_activity",
    title: "Worker Activity",
    description: "Clock-ins, clock-outs, and messages",
    default: true,
  },
  {
    id: "payment_alerts",
    title: "Payment Alerts",
    description: "Invoices, payouts, and refunds",
    default: true,
  },
  {
    id: "product_updates",
    title: "Product Updates",
    description: "New features and platform announcements",
    default: false,
  },
  {
    id: "system_notices",
    title: "System Notices",
    description: "Maintenance and account security alerts",
    default: true,
  },
];

const PREFS_STORAGE_KEY = "hospital-settings-prefs";

interface StoredPrefs {
  twoFactor: boolean;
  notifications: Record<string, boolean>;
  language: string;
  theme: "light" | "dark";
}

function loadPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to defaults
  }
  return {
    twoFactor: true,
    notifications: Object.fromEntries(
      NOTIFICATION_PREFS.map((p) => [p.id, p.default]),
    ),
    language: "en-US",
    theme: "light",
  };
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 flex-shrink-0 rounded-full transition-colors",
        checked ? "bg-brand-600" : "bg-neutral-200",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

/** Settings page with left sub-nav and per-section panels, per the Figma redesign. */
export function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { profile } = useHospitalProfile();

  const [section, setSection] = useState<SettingsSection>("account");
  const [prefs, setPrefsState] = useState<StoredPrefs>(loadPrefs);
  const [newPassword, setNewPassword] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  const setPrefs = (next: StoredPrefs) => {
    setPrefsState(next);
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
  };

  const fullName =
    profile?.adminName ??
    [user?.first_name].filter(Boolean).join(" ") ??
    "—";
  const email = user?.email ?? "—";

  const handleLogout = () => {
    authUtils.clearAuth();
    navigate("/auth/login");
  };

  const handlePasswordUpdate = async () => {
    // There is no change-password endpoint yet — the real flow is the
    // email-based reset (POST /auth/forgot-password), so trigger that.
    setIsSendingReset(true);
    try {
      await apiClient.post("/api/v1/auth/forgot-password", { email });
      appToast.success(
        "Password reset link sent",
        `Check ${email} to confirm your new password.`,
      );
      setNewPassword("");
    } catch (err) {
      appToast.fromError(err, "Unable to start the password reset");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 lg:text-3xl">
        Settings
      </h1>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Section nav */}
        <nav>
          <ul className="space-y-1">
            {SECTIONS.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors",
                    section === item.id
                      ? "bg-primary-50 font-semibold text-primary-700"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-neutral-200 pt-4">
            <button
              onClick={handleLogout}
              className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-error-600 transition-colors hover:bg-error-50"
            >
              Log Out
            </button>
          </div>
        </nav>

        {/* Panels */}
        <div className="space-y-4">
          {section === "account" && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900">
                Account Settings
              </h2>
              <div className="mt-6 flex items-center gap-4">
                <AvatarInitials
                  name={fullName}
                  className="h-14 w-14 bg-secondary-600 text-lg font-bold text-white"
                />
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Input label="Full Name" value={fullName} readOnly />
                <Input
                  label="Job Title"
                  value={profile?.adminRole ?? "Hospital Administrator"}
                  readOnly
                />
                <Input
                  label="Email"
                  value={email}
                  readOnly
                  containerClassName="sm:col-span-2"
                />
              </div>
              <p className="mt-4 text-xs text-neutral-400">
                Admin identity comes from your hospital registration — contact
                support to change it.
              </p>
            </div>
          )}

          {section === "security" && (
            <>
              <div className="rounded-2xl border border-neutral-100 bg-white p-6 sm:p-8">
                <h2 className="text-lg font-bold text-neutral-900">Password</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Current Password"
                    type="password"
                    value="••••••••••"
                    readOnly
                    className="bg-neutral-50"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  className="mt-5 bg-brand-800 hover:bg-brand-900 active:bg-brand-900"
                  isLoading={isSendingReset}
                  onClick={handlePasswordUpdate}
                >
                  Update Password
                </Button>
                <p className="mt-3 text-xs text-neutral-400">
                  For security, updating your password sends a confirmation
                  link to your email.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white px-6 py-5 sm:px-8">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Two-Factor Authentication
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Add an extra layer of security to your account.
                  </p>
                </div>
                <Toggle
                  label="Two-factor authentication"
                  checked={prefs.twoFactor}
                  onChange={(next) => setPrefs({ ...prefs, twoFactor: next })}
                />
              </div>
            </>
          )}

          {section === "notifications" && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900">
                Notification Preferences
              </h2>
              <ul className="mt-4 divide-y divide-neutral-50">
                {NOTIFICATION_PREFS.map((pref) => (
                  <li
                    key={pref.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-neutral-900">
                        {pref.title}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {pref.description}
                      </p>
                    </div>
                    <Toggle
                      label={pref.title}
                      checked={prefs.notifications[pref.id] ?? pref.default}
                      onChange={(next) =>
                        setPrefs({
                          ...prefs,
                          notifications: {
                            ...prefs.notifications,
                            [pref.id]: next,
                          },
                        })
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section === "payment" && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900">
                Payment Settings
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Shift payments are funded from your hospital's SafeHaven wallet
                and released to workers when handover reports are approved.
              </p>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-neutral-50 px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    Default Billing Method
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    SafeHaven hospital wallet
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/hospital/payments")}
                >
                  View Payments
                </Button>
              </div>
            </div>
          )}

          {section === "appearance" && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900">
                Language & Appearance
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Select
                  label="Language"
                  options={[
                    { value: "en-US", label: "English (US)" },
                    { value: "en-GB", label: "English (UK)" },
                    { value: "fr", label: "Français" },
                  ]}
                  value={prefs.language}
                  onChange={(language) => setPrefs({ ...prefs, language })}
                />
                <div>
                  <p className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Theme
                  </p>
                  <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-neutral-200">
                    {(["light", "dark"] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setPrefs({ ...prefs, theme })}
                        className={cn(
                          "py-2.5 text-sm font-medium capitalize transition-colors",
                          prefs.theme === theme
                            ? "bg-secondary-50 font-semibold text-secondary-700"
                            : "bg-white text-neutral-500 hover:text-neutral-800",
                        )}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === "privacy" && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900">Privacy</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
                Control how your hospital's data is shared with verified
                healthcare professionals and used to improve NexusCare's
                matching algorithms.
              </p>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-secondary-700 hover:text-secondary-800"
              >
                View Privacy Policy →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
