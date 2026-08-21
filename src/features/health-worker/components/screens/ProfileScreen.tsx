import { useRef, useState } from "react";
import { ArrowLeft, Calendar, Camera, LogOut, Settings } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { appToast } from "@/shared/components/feedback/toast";
import { cn } from "@/shared/utils/cn";
import { fileToBase64 } from "@/shared/utils/fileToBase64";
import { AvatarService } from "@/shared/auth/services/avatarService";
import type { AuthUser } from "@/shared/auth/store/authStore";
import { Avatar } from "../DashboardChrome";

export interface ProfileEditableFields {
  firstName: string;
  lastName: string;
  role: string;
  licenseNumber: string;
  specialty: string;
}

const ROLE_OPTIONS = [
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "lab_technician", label: "Lab Technician" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "radiographer", label: "Radiographer" },
  { value: "physiotherapist", label: "Physiotherapist" },
  { value: "other", label: "Other" },
];

const SPECIALTY_OPTIONS = [
  { value: "emergency_medicine", label: "Emergency Medicine" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "icu_specialist", label: "ICU Specialist" },
  { value: "general_nursing", label: "General Nursing" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "lab_technician", label: "Lab Technician" },
  { value: "surgery", label: "Surgery" },
  { value: "radiology", label: "Radiology" },
  { value: "anesthesiology", label: "Anesthesiology" },
  { value: "cardiology", label: "Cardiology" },
  { value: "obstetrics", label: "Obstetrics" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "other", label: "Other" },
];

export function ProfileScreen({
  user,
  editableFields,
  isBookingActive,
  onToggleBooking,
  onSaveProfile,
  isSaving,
  saveError,
  onLogout,
}: {
  user: AuthUser | null;
  editableFields: ProfileEditableFields | null;
  isBookingActive: boolean;
  onToggleBooking: () => void;
  onSaveProfile: (fields: ProfileEditableFields) => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
  onLogout: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<ProfileEditableFields>(
    editableFields ?? {
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
      role: "",
      licenseNumber: "",
      specialty: "",
    },
  );

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "—";

  const handleSave = async () => {
    await onSaveProfile(form);
    setIsEditing(false);
  };

  const handlePhotoSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const photoBase64 = await fileToBase64(file);
      await AvatarService.updateAvatar(photoBase64, file.type);
      appToast.success("Profile photo updated");
    } catch (err) {
      appToast.fromError(err, "Unable to update your profile photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isEditing) {
    return (
      <>
        <main className="space-y-5 py-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 text-sm font-bold text-brand-700 dark:text-brand-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Edit Profile
          </button>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-ink-500 dark:text-neutral-500">
                First Name
              </label>
              <input
                value={form.firstName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, firstName: e.target.value }))
                }
                className="w-full rounded-lg bg-neutral-100 px-3 py-2.5 text-sm outline-none dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-ink-500 dark:text-neutral-500">
                Last Name
              </label>
              <input
                value={form.lastName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lastName: e.target.value }))
                }
                className="w-full rounded-lg bg-neutral-100 px-3 py-2.5 text-sm outline-none dark:bg-neutral-800"
              />
            </div>
          </div>
          <Select
            label="Professional Role"
            value={form.role}
            onChange={(value) => setForm((p) => ({ ...p, role: value }))}
            placeholder="Select role"
            options={ROLE_OPTIONS}
          />
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-ink-500 dark:text-neutral-500">
              License Number
            </label>
            <input
              value={form.licenseNumber}
              onChange={(e) =>
                setForm((p) => ({ ...p, licenseNumber: e.target.value }))
              }
              className="w-full rounded-lg bg-neutral-100 px-3 py-2.5 text-sm outline-none dark:bg-neutral-800"
            />
          </div>
          <Select
            label="Specialty"
            value={form.specialty}
            onChange={(value) => setForm((p) => ({ ...p, specialty: value }))}
            placeholder="Select specialty"
            options={SPECIALTY_OPTIONS}
          />
          {saveError && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {saveError}
            </p>
          )}
          <Button
            type="button"
            className="w-full bg-brand-700"
            isLoading={isSaving}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </main>
      </>
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

      <p className="text-center text-xs text-ink-500 dark:text-neutral-400">
        There's no endpoint to fetch your saved profile yet — this only shows
        what you entered during onboarding or in this session's edits.
      </p>

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
                  Update your role, specialty, and license
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
