import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  Camera,
  Check,
  Clock,
  MapPin,
  Monitor,
  Moon,
  Plus,
  Sun,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { Input } from "@/shared/components/ui/Input";
import { LocationMapPreview } from "@/shared/components/ui/LocationMapPreview";
import { PhoneNumberInput } from "@/shared/components/ui/PhoneNumberInput";
import { Select } from "@/shared/components/ui/Select";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { appToast } from "@/shared/components/feedback/toast";
import { cn } from "@/shared/utils/cn";
import { authUtils } from "@/shared/auth/utils/authUtils";
import { useAuthStore } from "@/shared/auth/store/authStore";
import {
  HospitalProfileService,
  type HospitalDetails,
  type HospitalLocation,
} from "@/features/hospital/services/hospitalProfileService";
import {
  useHospitalProfile,
  useHospitalProfileStore,
} from "@/features/hospital/hooks/useHospitalProfile";
import { useTheme, type ThemeMode } from "@/shared/theme/ThemeContext";

type SettingsSection =
  | "profile"
  | "account"
  | "security"
  | "notifications"
  | "payment"
  | "appearance"
  | "privacy";

const SECTIONS: { id: SettingsSection; label: string }[] = [
  { id: "profile", label: "Hospital Profile" },
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
  theme?: ThemeMode;
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
  };
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
  { mode: "system", label: "System", icon: Monitor },
];

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
        checked ? "bg-brand-600" : "bg-neutral-200 dark:bg-neutral-700",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all dark:bg-neutral-100",
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
  const refreshSharedProfile = useHospitalProfileStore((s) => s.refresh);
  const { theme, setTheme } = useTheme();

  // Landing on the "Hospital Profile" section by default matches the old
  // /profile nav entries, which now redirect here (see hospital.routes.tsx).
  const [section, setSection] = useState<SettingsSection>("profile");
  const [prefs, setPrefsState] = useState<StoredPrefs>(() => {
    const loaded = loadPrefs();
    return { ...loaded, theme };
  });
  const [newPassword, setNewPassword] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  // ── Hospital Profile section state (was HospitalProfilePage) ─────────────
  const [details, setDetails] = useState<HospitalDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    address: "",
    phoneNumber: "",
  });
  // No backend field for departments yet — additions are local-only.
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [hospitalLocation, setHospitalLocation] = useState<HospitalLocation | null>(null);

  useEffect(() => {
    let cancelled = false;
    HospitalProfileService.getHospitalDetails()
      .then((data) => {
        if (cancelled) return;
        setDetails(data);
        if (data) {
          setProfileForm({
            name: data.name,
            address: data.address,
            phoneNumber: data.phoneNumber,
          });
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsLoadingDetails(false);
      });
    HospitalProfileService.getHospitalLocation()
      .then((loc) => {
        if (!cancelled) setHospitalLocation(loc);
      })
      .catch(() => {
        if (!cancelled) setHospitalLocation(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The backend bug this detects: newly-registering hospitals self-heal via
  // `syncAddress` right after registration (see LocationGeofencingStep), but
  // hospitals that registered before that fix still have `address` stuck
  // equal to their own `email`. Recomputed from the *current* form value (not
  // just the original load) so the banner clears the moment the admin edits
  // the field, even before they hit Save.
  const addressLooksCorrupted = Boolean(
    details?.email &&
      profileForm.address.trim().toLowerCase() ===
        details.email.trim().toLowerCase(),
  );

  const handleSaveProfile = async () => {
    if (!details) return;
    setIsSavingProfile(true);
    try {
      await HospitalProfileService.updateHospitalDetails({
        name: profileForm.name,
        address: profileForm.address,
        phone_number: profileForm.phoneNumber,
      });
      setDetails({
        ...details,
        name: profileForm.name,
        address: profileForm.address,
        phoneNumber: profileForm.phoneNumber,
      });
      appToast.success("Hospital profile updated");
      refreshSharedProfile();
    } catch (err) {
      appToast.fromError(err, "Unable to update the hospital profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDiscardProfileChanges = () => {
    if (!details) return;
    setProfileForm({
      name: details.name,
      address: details.address,
      phoneNumber: details.phoneNumber,
    });
  };

  const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !details) return;
    setIsUploadingLogo(true);
    try {
      const logoUrl = await HospitalProfileService.updateLogo(file);
      setDetails({ ...details, logoUrl });
      appToast.success("Hospital logo updated");
      refreshSharedProfile();
    } catch (err) {
      appToast.fromError(err, "Unable to update the hospital logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const isVerified =
    details?.adminRegistrationStatus === "approved" ||
    details?.verificationStatus === "verified";

  const profileDirty =
    !!details &&
    (profileForm.name !== details.name ||
      profileForm.address !== details.address ||
      profileForm.phoneNumber !== details.phoneNumber);

  const setPrefs = (next: StoredPrefs) => {
    setPrefsState(next);
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
    if (next.theme && next.theme !== theme) {
      setTheme(next.theme);
    }
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
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-50 lg:text-3xl">
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
                      ? "bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <button
              onClick={handleLogout}
              className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-error-600 transition-colors hover:bg-error-50 dark:hover:bg-error-950"
            >
              Log Out
            </button>
          </div>
        </nav>

        {/* Panels */}
        <div className="space-y-4">
          {section === "profile" && (
            <>
              {isLoadingDetails ? (
                <>
                  <Skeleton className="h-32 w-full rounded-2xl" />
                  <Skeleton className="h-64 w-full rounded-2xl" />
                </>
              ) : !details ? (
                <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No hospital record found for this account.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header card */}
                  <div className="flex flex-wrap items-start gap-5 rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="relative shrink-0">
                      {details.logoUrl ? (
                        <img
                          src={details.logoUrl}
                          alt={`${details.name} logo`}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                      ) : (
                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-700 text-white">
                          <Building2 className="h-8 w-8" />
                        </span>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoSelected}
                      />
                      <button
                        type="button"
                        aria-label="Change hospital logo"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-secondary-700 text-white shadow-soft transition-colors hover:bg-secondary-800 disabled:opacity-60 dark:border-neutral-900"
                      >
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-2xl font-bold text-secondary-800 dark:text-secondary-300">
                        {details.name}
                      </h2>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {details.address}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <Badge variant={isVerified ? "success" : "warning"}>
                          {isVerified ? (
                            <>
                              <Check className="h-3 w-3" /> Verified
                            </>
                          ) : (
                            "Pending Verification"
                          )}
                        </Badge>
                        <Badge variant="info" className="uppercase">
                          {details.registrationNumber}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Hospital information */}
                  <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                      Hospital Information
                    </h3>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <Input
                        label="Legal Name"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, name: e.target.value })
                        }
                      />
                      <Input
                        label="Registration Number"
                        value={details.registrationNumber}
                        readOnly
                        className="bg-neutral-50 dark:bg-neutral-800"
                      />
                      {/* Hospital type / staff size have no backend field yet. */}
                      <Input
                        label="Hospital Type"
                        value=""
                        placeholder="Coming soon"
                        readOnly
                        className="bg-neutral-50 dark:bg-neutral-800"
                      />
                      <Input
                        label="Staff Size"
                        value=""
                        placeholder="Coming soon"
                        readOnly
                        className="bg-neutral-50 dark:bg-neutral-800"
                      />
                      <div className="sm:col-span-2">
                        {addressLooksCorrupted && (
                          <div className="mb-2 flex items-start gap-2 rounded-lg border border-warning-200 bg-warning-50 px-3.5 py-2.5 text-xs text-warning-800 dark:border-warning-800 dark:bg-warning-950 dark:text-warning-300">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>
                              We couldn&apos;t confirm your saved address —
                              please re-enter and save it below.
                            </span>
                          </div>
                        )}
                        <Input
                          label="Address"
                          value={profileForm.address}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>
                      <PhoneNumberInput
                        label="Phone"
                        value={profileForm.phoneNumber}
                        onChange={(value) =>
                          setProfileForm({ ...profileForm, phoneNumber: value })
                        }
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={details.email}
                        readOnly
                        hint="Email can't be changed here"
                        className="bg-neutral-50 dark:bg-neutral-800"
                      />
                    </div>
                    <div className="mt-5 flex gap-2">
                      {profileDirty && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDiscardProfileChanges}
                        >
                          Discard Changes
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="bg-secondary-700 hover:bg-secondary-800 active:bg-secondary-800"
                        isLoading={isSavingProfile}
                        disabled={!profileDirty}
                        onClick={handleSaveProfile}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>

                  {/* Location card */}
                  <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                    {hospitalLocation?.latitude != null &&
                    hospitalLocation?.longitude != null ? (
                      <LocationMapPreview
                        latitude={hospitalLocation.latitude}
                        longitude={hospitalLocation.longitude}
                        label={details.name}
                        className="h-36 w-full"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center bg-secondary-50 dark:bg-secondary-950">
                        <span className="flex items-center gap-2 rounded-lg border border-secondary-200 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-secondary-700 dark:border-secondary-800 dark:bg-neutral-900/70 dark:text-secondary-300">
                          <MapPin className="h-3.5 w-3.5" />
                          Map view — {details.address.split(",")[0]}
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                        Main Campus Location
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {details.address}
                      </p>
                    </div>
                  </div>

                  {/* Departments */}
                  <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                      Departments
                    </h3>
                    {departments.length === 0 && newDepartment === null && (
                      <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
                        No departments added yet — add the units your hospital
                        staffs.
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {departments.map((dept) => (
                        <span
                          key={dept}
                          className="rounded-full bg-secondary-50 px-4 py-1.5 text-sm font-medium text-secondary-700 dark:bg-secondary-950 dark:text-secondary-300"
                        >
                          {dept}
                        </span>
                      ))}
                      {newDepartment === null ? (
                        <button
                          onClick={() => setNewDepartment("")}
                          className="flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Department
                        </button>
                      ) : (
                        <input
                          autoFocus
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newDepartment.trim()) {
                              setDepartments([...departments, newDepartment.trim()]);
                              setNewDepartment(null);
                            } else if (e.key === "Escape") {
                              setNewDepartment(null);
                            }
                          }}
                          onBlur={() => {
                            if (newDepartment.trim()) {
                              setDepartments([...departments, newDepartment.trim()]);
                            }
                            setNewDepartment(null);
                          }}
                          placeholder="Department name"
                          className="w-44 rounded-full border border-secondary-300 px-4 py-1.5 text-sm focus:outline-none dark:border-secondary-700 dark:bg-neutral-800 dark:text-neutral-100"
                        />
                      )}
                    </div>
                  </div>

                  {/* Operating hours — no backend field yet. */}
                  <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                      Operating Hours
                    </h3>
                    <EmptyState
                      icon={<EmptyStateIcon icon={Clock} tone="neutral" />}
                      title="Not configured"
                      description="Department operating hours will appear here once they can be set."
                      className="mt-3 min-h-[120px] border-0 py-6"
                    />
                  </div>

                  {/* Emergency contacts */}
                  <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                      Emergency Contacts
                    </h3>
                    <ul className="mt-4 space-y-4">
                      <li>
                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                          Hospital Admin Desk
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                          Front Office • {details.phoneNumber}
                        </p>
                      </li>
                      <li>
                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                          Billing & Payments
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                          Accounts • {details.email}
                        </p>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </>
          )}

          {section === "account" && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
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
              <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
                Admin identity comes from your hospital registration — contact
                support to change it.
              </p>
            </div>
          )}

          {section === "security" && (
            <>
              <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Password</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Current Password"
                    type="password"
                    value="••••••••••"
                    readOnly
                    className="bg-neutral-50 dark:bg-neutral-800"
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
                <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
                  For security, updating your password sends a confirmation
                  link to your email.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white px-6 py-5 dark:border-neutral-800 dark:bg-neutral-900 sm:px-8">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                    Two-Factor Authentication
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
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
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Notification Preferences
              </h2>
              <ul className="mt-4 divide-y divide-neutral-50 dark:divide-neutral-800">
                {NOTIFICATION_PREFS.map((pref) => (
                  <li
                    key={pref.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                        {pref.title}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
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
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Payment Settings
              </h2>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Shift payments are funded from your hospital's SafeHaven wallet
                and released to workers when handover reports are approved.
              </p>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-neutral-50 px-5 py-4 dark:bg-neutral-800">
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                    Default Billing Method
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
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
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
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
                  <p className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Theme
                  </p>
                  <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                    {THEME_OPTIONS.map(({ mode, label, icon: Icon }) => (
                      <button
                        key={mode}
                        onClick={() => setTheme(mode)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors",
                          theme === mode
                            ? "bg-secondary-50 font-semibold text-secondary-700 dark:bg-secondary-950 dark:text-secondary-300"
                            : "bg-white text-neutral-500 hover:text-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-neutral-400">
                    {theme === "system"
                      ? "Following your device's theme."
                      : `Always ${theme}, regardless of your device.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {section === "privacy" && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Privacy</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                Control how your hospital's data is shared with verified
                healthcare professionals and used to improve NexusCare's
                matching algorithms.
              </p>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-secondary-700 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-300"
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
