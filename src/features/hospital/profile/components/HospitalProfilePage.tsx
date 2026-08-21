import { useEffect, useRef, useState } from "react";
import { Building2, Camera, Check, Clock, MapPin, Plus } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { Input } from "@/shared/components/ui/Input";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { appToast } from "@/shared/components/feedback/toast";
import { cn } from "@/shared/utils/cn";
import { fileToBase64 } from "@/shared/utils/fileToBase64";
import {
  HospitalProfileService,
  type HospitalDetails,
} from "@/features/hospital/services/hospitalProfileService";
import { useHospitalProfileStore } from "@/features/hospital/hooks/useHospitalProfile";

/** Hospital Profile page per Figma 28:14671, wired to GET/PATCH /hospitals/:id. */
export function HospitalProfilePage() {
  const [details, setDetails] = useState<HospitalDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phoneNumber: "",
  });
  // No backend field for departments yet — additions are local-only.
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const refreshShared = useHospitalProfileStore((s) => s.refresh);

  useEffect(() => {
    let cancelled = false;
    HospitalProfileService.getHospitalDetails()
      .then((data) => {
        if (cancelled) return;
        setDetails(data);
        if (data) {
          setForm({
            name: data.name,
            email: data.email,
            address: data.address,
            phoneNumber: data.phoneNumber,
          });
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (!details) return;
    setIsSaving(true);
    try {
      await HospitalProfileService.updateHospitalDetails({
        name: form.name,
        address: form.address,
        phone_number: form.phoneNumber,
      });
      setDetails({
        ...details,
        name: form.name,
        address: form.address,
        phoneNumber: form.phoneNumber,
      });
      setIsEditing(false);
      appToast.success("Hospital profile updated");
      refreshShared();
    } catch (err) {
      appToast.fromError(err, "Unable to update the hospital profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !details) return;
    setIsUploadingLogo(true);
    try {
      const photoBase64 = await fileToBase64(file);
      const logoUrl = await HospitalProfileService.updateLogo(
        photoBase64,
        file.type,
      );
      setDetails({ ...details, logoUrl });
      appToast.success("Hospital logo updated");
      refreshShared();
    } catch (err) {
      appToast.fromError(err, "Unable to update the hospital logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const isVerified =
    details?.adminRegistrationStatus === "approved" ||
    details?.verificationStatus === "verified";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!details) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No hospital record found for this account.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 lg:text-3xl dark:text-neutral-50">
        Hospital Profile
      </h1>

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
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{details.address}</p>
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
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setForm({
                  name: details.name,
                  email: details.email,
                  address: details.address,
                  phoneNumber: details.phoneNumber,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-secondary-700 hover:bg-secondary-800 active:bg-secondary-800"
              isLoading={isSaving}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="bg-secondary-700 hover:bg-secondary-800 active:bg-secondary-800"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {/* Hospital information */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
              Hospital Information
            </h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Input
                label="Legal Name"
                value={form.name}
                readOnly={!isEditing}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={cn(!isEditing && "bg-neutral-50 dark:bg-neutral-800")}
              />
              <Input
                label="Registration Number"
                value={details.registrationNumber}
                readOnly
                className="bg-neutral-50 dark:bg-neutral-800"
              />
              {/* Hospital type / staff size have no backend fields yet. */}
              <Input
                label="Hospital Type"
                value=""
                placeholder="Not set"
                readOnly
                className="bg-neutral-50 dark:bg-neutral-800"
              />
              <Input
                label="Staff Size"
                value=""
                placeholder="Not set"
                readOnly
                className="bg-neutral-50 dark:bg-neutral-800"
              />
              <Input
                label="Address"
                value={form.address}
                readOnly={!isEditing}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                containerClassName="sm:col-span-2"
                className={cn(!isEditing && "bg-neutral-50 dark:bg-neutral-800")}
              />
              <Input
                label="Phone"
                value={form.phoneNumber}
                readOnly={!isEditing}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                className={cn(!isEditing && "bg-neutral-50 dark:bg-neutral-800")}
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                readOnly
                hint={isEditing ? "Email can't be changed here" : undefined}
                className="bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
          </div>

          {/* Departments */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">Departments</h3>
            {departments.length === 0 && newDepartment === null && (
              <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
                No departments added yet — add the units your hospital staffs.
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
        </div>

        <div className="space-y-4">
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

          {/* Location card */}
          <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-36 items-center justify-center bg-secondary-50 dark:bg-secondary-950">
              <span className="flex items-center gap-2 rounded-lg border border-secondary-200 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-secondary-700 dark:border-secondary-800 dark:bg-neutral-900/70 dark:text-secondary-300">
                <MapPin className="h-3.5 w-3.5" />
                Map view — {details.address.split(",")[0]}
              </span>
            </div>
            <div className="p-5">
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                Main Campus Location
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {details.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
