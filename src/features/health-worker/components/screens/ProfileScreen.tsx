import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Calendar, Camera, LogOut, Plus, Settings } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { appToast } from "@/shared/components/feedback/toast";
import { cn } from "@/shared/utils/cn";
import { AvatarService } from "@/shared/auth/services/avatarService";
import type { AuthUser } from "@/shared/auth/store/authStore";
import { Avatar } from "../DashboardChrome";

import { Skeleton } from "@/shared/components/ui/Skeleton";
import {
  DEFAULT_CERTIFICATES,
  EXPERIENCE_OPTIONS,
  ROLE_OPTIONS,
  SPECIALTY_OPTIONS,
  type ProfileEditableFields,
  type ProfileLocalExtras,
} from "../../profileOptions";

export type { ProfileEditableFields };

export function ProfileScreen({
  user,
  editableFields,
  qualifications,
  extras,
  isProfileLoading,
  isBookingActive,
  onToggleBooking,
  onSaveProfile,
  isSaving,
  saveError,
  onLogout,
  isEditing: editingProp,
  onEditingChange,
}: {
  user: AuthUser | null;
  editableFields: ProfileEditableFields | null;
  qualifications: string[];
  extras: ProfileLocalExtras;
  isProfileLoading: boolean;
  isBookingActive: boolean;
  onToggleBooking: () => void;
  /** Resolves true once everything saved (profile + certificates). */
  onSaveProfile: (
    fields: ProfileEditableFields,
    qualifications: string[],
    extras: ProfileLocalExtras,
  ) => Promise<boolean>;
  isSaving: boolean;
  saveError: string | null;
  onLogout: () => void;
  /** Controlled edit mode (driven by the URL); uncontrolled when omitted. */
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}) {
  const [localEditing, setLocalEditing] = useState(false);
  const isEditing = editingProp ?? localEditing;
  const setIsEditing = (v: boolean) =>
    onEditingChange ? onEditingChange(v) : setLocalEditing(v);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const emptyFields: ProfileEditableFields = {
    firstName: user?.first_name ?? "",
    lastName: user?.last_name ?? "",
    role: "",
    licenseNumber: "",
    specialty: "",
  };
  const [form, setForm] = useState<ProfileEditableFields>(editableFields ?? emptyFields);
  const [certs, setCerts] = useState<string[]>(qualifications);
  const [localExtras, setLocalExtras] = useState<ProfileLocalExtras>(extras);
  const [customCert, setCustomCert] = useState("");
  // Once the user starts typing, late-arriving server data must not overwrite it.
  const dirtyRef = useRef(false);
  const markDirty = () => {
    dirtyRef.current = true;
  };
  useEffect(() => {
    if (dirtyRef.current) return;
    if (editableFields) setForm(editableFields);
    setCerts(qualifications);
    setLocalExtras(extras);
  }, [editableFields, qualifications, extras]);

  const canSave =
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.role !== "" &&
    form.specialty !== "" &&
    form.licenseNumber.trim().length >= 2;

  const certOptions = [
    ...DEFAULT_CERTIFICATES,
    ...certs.filter((c) => !DEFAULT_CERTIFICATES.includes(c)),
  ];
  const toggleCert = (cert: string) => {
    markDirty();
    setCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert],
    );
  };
  const addCustomCert = () => {
    const value = customCert.trim();
    if (!value) return;
    markDirty();
    setCerts((prev) =>
      prev.some((c) => c.toLowerCase() === value.toLowerCase()) ? prev : [...prev, value],
    );
    setCustomCert("");
  };
  const setField = (patch: Partial<ProfileEditableFields>) => {
    markDirty();
    setForm((p) => ({ ...p, ...patch }));
  };

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "—";

  const handleSave = async () => {
    if (!canSave || isSaving) return;
    const ok = await onSaveProfile(form, certs, localExtras);
    // Stay on the form when something failed so the error stays next to the fields.
    if (ok) {
      dirtyRef.current = false;
      setIsEditing(false);
    }
  };

  const handlePhotoSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      await AvatarService.updateAvatar(file);
      appToast.success("Profile photo updated");
    } catch (err) {
      appToast.fromError(err, "Unable to update your profile photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isEditing) {
    const labelCls =
      "mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-ink-500 dark:text-neutral-500";
    const inputCls =
      "w-full rounded-lg bg-neutral-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 dark:bg-neutral-800";
    const cardCls =
      "space-y-4 rounded-[24px] bg-white p-5 dark:border dark:border-neutral-800 dark:bg-neutral-900";
    return (
      <main className="space-y-4 py-4 pb-6">
        <button
          type="button"
          onClick={() => !isSaving && setIsEditing(false)}
          disabled={isSaving}
          className="flex items-center gap-2 text-sm font-bold text-brand-700 disabled:opacity-50 dark:text-brand-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Edit Profile
        </button>

        {/* Everything locks while the save request is in flight. */}
        <fieldset disabled={isSaving} className="min-w-0 space-y-4 border-0 p-0">
          <section className={cardCls}>
            <h2 className="text-sm font-bold text-ink-900 dark:text-neutral-100">Personal details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>First Name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setField({ firstName: e.target.value })}
                  autoComplete="given-name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setField({ lastName: e.target.value })}
                  autoComplete="family-name"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          <section className={cardCls}>
            <h2 className="text-sm font-bold text-ink-900 dark:text-neutral-100">Professional details</h2>
            <Select
              className="border-transparent bg-neutral-100 dark:border-transparent dark:bg-neutral-800"
              label="Professional Role"
              value={form.role}
              onChange={(value) => setField({ role: value })}
              placeholder="Select role"
              searchable
              searchPlaceholder="Search..."
              options={ROLE_OPTIONS}
            />
            <Select
              className="border-transparent bg-neutral-100 dark:border-transparent dark:bg-neutral-800"
              label="Specialty"
              value={form.specialty}
              onChange={(value) => setField({ specialty: value })}
              placeholder="Select specialty"
              searchable
              searchPlaceholder="Search..."
              options={SPECIALTY_OPTIONS}
            />
            <div>
              <label className={labelCls}>License Number</label>
              <input
                value={form.licenseNumber}
                onChange={(e) => setField({ licenseNumber: e.target.value })}
                className={inputCls}
              />
              {form.licenseNumber.length > 0 && form.licenseNumber.trim().length < 2 && (
                <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                  License number must be at least 2 characters.
                </p>
              )}
            </div>
            <Select
              className="border-transparent bg-neutral-100 dark:border-transparent dark:bg-neutral-800"
              label="Years of Experience"
              value={localExtras.experience}
              onChange={(value) => {
                markDirty();
                setLocalExtras((p) => ({ ...p, experience: value }));
              }}
              options={EXPERIENCE_OPTIONS}
            />
            <div>
              <label className={labelCls}>Languages</label>
              <input
                value={localExtras.languages}
                onChange={(e) => {
                  markDirty();
                  setLocalExtras((p) => ({ ...p, languages: e.target.value }));
                }}
                placeholder="e.g. English, Yoruba"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-ink-500 dark:text-neutral-500">
                Experience and languages are saved on this device only for now.
              </p>
            </div>
          </section>

          <section className={cardCls}>
            <div>
              <h2 className="text-sm font-bold text-ink-900 dark:text-neutral-100">
                Certificates &amp; qualifications
              </h2>
              <p className="mt-1 text-xs text-ink-500 dark:text-neutral-500">
                Hospitals require these on shifts — they&apos;re matched against each shift&apos;s requirements.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {certOptions.map((cert) => {
                const selected = certs.includes(cert);
                return (
                  <button
                    key={cert}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleCert(cert)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                      selected
                        ? "border-brand-300 bg-brand-50 font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
                        : "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400",
                    )}
                  >
                    {cert}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={customCert}
                onChange={(e) => setCustomCert(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomCert();
                  }
                }}
                placeholder="Add another certificate"
                maxLength={60}
                className={inputCls}
              />
              <button
                type="button"
                onClick={addCustomCert}
                disabled={!customCert.trim()}
                aria-label="Add certificate"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>
        </fieldset>

        {saveError && (
          <p
            role="alert"
            className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 dark:bg-error-950/40 dark:text-error-300"
          >
            {saveError}
          </p>
        )}
        {!canSave && (
          <p className="text-xs text-ink-500 dark:text-neutral-500">
            Name, role, specialty and a license number are required.
          </p>
        )}
        <Button
          type="button"
          className="w-full bg-brand-700"
          isLoading={isSaving}
          disabled={!canSave || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Saving…" : "Save Changes"}
        </Button>
      </main>
    );
  }

  const roleLabel = editableFields?.role
    ? ROLE_OPTIONS.find((r) => r.value === editableFields.role)?.label
    : null;
  const specialtyLabel = editableFields?.specialty
    ? SPECIALTY_OPTIONS.find((s) => s.value === editableFields.specialty)?.label
    : null;
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-NG", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="space-y-4 py-4">
      <section className="flex flex-col items-center gap-3 rounded-[32px] bg-brand-100 p-8 text-center dark:bg-brand-950">
        <div className="relative">
          <Avatar name={displayName} photoUrl={user?.avatar_url} size="lg" />
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelected}
          />
          <button
            type="button"
            aria-label="Change profile photo"
            onClick={() => photoInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-700 text-white shadow-soft transition-colors hover:bg-brand-800 disabled:opacity-60 dark:border-neutral-900"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-neutral-100">
            {displayName}
          </h1>
          <p className="mt-1 text-base font-medium text-ink-700 dark:text-neutral-300">
            {[roleLabel, specialtyLabel].filter(Boolean).join(" • ") || "—"}
          </p>
        </div>
        {joinedDate && (
          <span className="flex items-center gap-1.5 text-sm text-ink-700 dark:text-neutral-400">
            <Calendar className="h-3.5 w-3.5" />
            Joined {joinedDate}
          </span>
        )}
      </section>

      <section className="rounded-[24px] bg-white p-6 dark:border dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-xs font-bold uppercase tracking-[1.2px] text-ink-700 dark:text-neutral-400">
          Credentials &amp; Licensing
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-700 dark:text-neutral-400">
              Email
            </span>
            <span className="text-sm font-bold text-ink-900 dark:text-neutral-100">
              {user?.email ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-700 dark:text-neutral-400">
              License Number
            </span>
            <span className="font-bold text-brand-700 dark:text-brand-300">
              {editableFields?.licenseNumber || "—"}
            </span>
          </div>
        </div>
      </section>

      {specialtyLabel && (
        <section className="rounded-[24px] bg-white p-6 dark:border dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-lg font-bold text-ink-900 dark:text-neutral-100">
            Specialties &amp; Expertise
          </h2>
          <span className="mt-3 inline-block rounded-xl bg-success-700/10 px-4 py-2 text-sm font-medium text-success-700 dark:bg-success-950/60 dark:text-success-300">
            {specialtyLabel}
          </span>
        </section>
      )}

      <section className="rounded-[24px] bg-white p-6 dark:border dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-lg font-bold text-ink-900 dark:text-neutral-100">
          Certificates &amp; Experience
        </h2>
        {isProfileLoading ? (
          <div className="mt-3 flex gap-2" aria-busy="true">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-14 rounded-full" />
          </div>
        ) : qualifications.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {qualifications.map((q) => (
              <span
                key={q}
                className="rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
              >
                {q}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink-500 dark:text-neutral-400">
            Add your certificates so hospitals can see you meet their shift requirements.
          </p>
        )}
        <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-700 dark:text-neutral-400">Experience</span>
            <span className="text-sm font-bold text-ink-900 dark:text-neutral-100">
              {EXPERIENCE_OPTIONS.find((o) => o.value === extras.experience)?.label ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-ink-700 dark:text-neutral-400">Languages</span>
            <span className="truncate text-sm font-bold text-ink-900 dark:text-neutral-100">
              {extras.languages || "—"}
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="px-2 text-sm font-bold uppercase tracking-[1.4px] text-ink-700 dark:text-neutral-400">
          Account Management
        </h2>
        <div className="overflow-hidden rounded-[24px] bg-white dark:border dark:border-neutral-800 dark:bg-neutral-900">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex w-full items-center justify-between p-5 text-left border-b border-neutral-100 dark:border-neutral-800"
          >
            <span className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700/10 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                <Settings className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-base font-semibold text-ink-900 dark:text-neutral-100">
                  Edit Profile
                </span>
                <span className="block text-xs text-ink-700 dark:text-neutral-400">
                  Update your details, license and certificates
                </span>
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-4 p-5 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-700/10 text-error-700 dark:bg-error-950/40 dark:text-error-400">
              <LogOut className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base font-semibold text-error-700 dark:text-error-400">
                Logout
              </span>
              <span className="block text-xs text-error-700/60 dark:text-error-400/60">
                Securely sign out of your session
              </span>
            </span>
          </button>
        </div>
      </section>

      <section className="flex items-center justify-between rounded-[32px] bg-gradient-to-br from-brand-700 to-brand-600 p-6 dark:from-neutral-900 dark:to-neutral-800 dark:border dark:border-neutral-800">
        <div>
          <p className="text-lg font-bold text-brand-100">Active for Booking</p>
          <p className="mt-1 text-sm text-brand-100/80">
            This session only — there's no availability endpoint to persist it
            yet.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleBooking}
          className={cn(
            "flex h-8 w-14 shrink-0 items-center rounded-xl p-1 transition",
            isBookingActive
              ? "justify-end bg-success-700"
              : "justify-start bg-white/20",
          )}
        >
          <span className="h-6 w-6 rounded-lg bg-white" />
        </button>
      </section>
    </main>
  );
}
