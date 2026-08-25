import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Plus, Upload, X } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { Select } from "@/shared/components/ui/Select";
import { Modal } from "@/shared/components/ui/Modal";
import { WizardSteps } from "@/shared/components/ui/WizardSteps";
import { appToast } from "@/shared/components/feedback/toast";
import { cn } from "@/shared/utils/cn";
import { PATHS } from "@/routes/paths";
import { useHospitalProfile } from "@/features/hospital/hooks/useHospitalProfile";
import { useHospitalApprovalStatus } from "@/features/hospital/hooks/useHospitalApprovalStatus";
import { useWalletFunding } from "@/features/hospital/hooks/useWalletFunding";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import { useShiftDraftStore } from "@/features/hospital/shifts/hooks/useShiftDraftStore";
import { ShiftService } from "@/features/hospital/shifts/services/shiftService";
import { ShiftPreview } from "./ShiftPreview";
import type { ShiftFormData } from "@/features/hospital/shifts/types";

const STEPS = ["Basic Info", "Compensation", "Description", "Requirements"];

const ROLE_OPTIONS = [
  "Registered Nurse",
  "Physician",
  "Pharmacist",
  "Midwife",
  "Lab Technician",
].map((v) => ({ value: v, label: v }));

const DEPARTMENT_OPTIONS = [
  "Emergency",
  "ICU",
  "Pharmacy",
  "Laboratory",
  "Maternity",
  "Med-Surg",
  "Radiology",
].map((v) => ({ value: v, label: v }));

const SHIFT_TYPE_OPTIONS = [
  { value: "in-person", label: "In-Person" },
  { value: "virtual", label: "Virtual" },
];

const URGENCY_OPTIONS = [
  { value: "elective", label: "Scheduled" },
  { value: "standard", label: "Temporary" },
  { value: "urgent", label: "Urgent" },
];

const EXPERIENCE_OPTIONS = [
  { value: "none", label: "No minimum" },
  { value: "1+ years", label: "1+ years" },
  { value: "3+ years", label: "3+ years" },
  { value: "5+ years", label: "5+ years" },
  { value: "10+ years", label: "10+ years" },
];

const DEFAULT_CERTIFICATES = ["BLS", "ACLS", "PALS", "RN License", "NRP", "CPR"];

/** Platform fee/tax rates used in the live cost preview (matches design copy). */
const SERVICE_FEE_RATE = 0.12;
const TAX_RATE = 0.053;

const defaultFormData: ShiftFormData = {
  roleNeeded: "",
  department: "",
  specialty: "",
  shiftType: "in-person",
  startDate: "",
  startTime: "",
  endTime: "",
  duration: 0,
  urgencyLevel: "elective",
  payType: "hourly",
  hourlyRate: 0,
  fixedRate: 0,
  bonuses: [],
  jobDescription: "",
  tasks: [],
  deliverables: [],
  equipment: [],
  requirements: [],
  qualifications: [],
  minExperience: "none",
  languages: "",
  certificates: [],
};

function durationHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let hours = eh + em / 60 - (sh + sm / 60);
  if (hours <= 0) hours += 24; // overnight shift
  return Math.round(hours * 10) / 10;
}

function naira(amount: number): string {
  return `₦${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Full-page 4-step Create Shift wizard (replaces the old modal flow),
 * matching the Figma redesign: Basic Info → Compensation → Description →
 * Requirements, with live cost preview, Save & Exit draft, Preview Shift,
 * and a Broadcast success screen.
 */
export function CreateShiftPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isVirtualLocked = searchParams.get("type") === "virtual";
  const { profile } = useHospitalProfile();
  const { isLoading: isApprovalLoading, isApproved, status } =
    useHospitalApprovalStatus();
  const { isLoading: isWalletLoading, isFunded, hasSubAccount } = useWalletFunding();
  const { createShift, previewShift } = useHospitalShift();
  const { draft, setDraft, clearDraft } = useShiftDraftStore();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<ShiftFormData>(() => {
    const initial = draft ?? defaultFormData;
    return isVirtualLocked ? { ...initial, shiftType: "virtual" } : initial;
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [customCertificate, setCustomCertificate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);

  const update = (patch: Partial<ShiftFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const duration = useMemo(
    () => durationHours(formData.startTime, formData.endTime) || formData.duration,
    [formData.startTime, formData.endTime, formData.duration],
  );

  const basePay =
    formData.payType === "hourly"
      ? formData.hourlyRate * duration
      : formData.fixedRate;
  const urgencyBonus = formData.bonuses.find((b) => b.id === "stat")?.amount ?? 0;
  const serviceFee = (basePay + urgencyBonus) * SERVICE_FEE_RATE;
  const taxes = (basePay + urgencyBonus) * TAX_RATE;
  const totalCost = basePay + urgencyBonus + serviceFee + taxes;

  const gateBlocked = !isApprovalLoading && !isApproved;
  const walletBlocked = !isWalletLoading && !isFunded;

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(
          formData.roleNeeded &&
            formData.department &&
            formData.startDate &&
            formData.startTime &&
            formData.endTime,
        );
      case 1:
        return formData.payType === "hourly"
          ? formData.hourlyRate > 0
          : formData.fixedRate > 0;
      default:
        return true;
    }
  }, [step, formData]);

  const withDuration = (data: ShiftFormData): ShiftFormData => ({
    ...data,
    duration,
  });

  const handleSaveAndExit = async () => {
    setDraft(withDuration(formData));
    await ShiftService.saveDraft(formData);
    appToast.success("Draft saved", "Resume from Create Shift any time.");
    navigate(PATHS.hospital.dashboard);
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      await previewShift(withDuration(formData));
    } catch {
      // Preview endpoint validation is advisory — still show the local preview.
    } finally {
      setIsPreviewing(false);
      setShowPreview(true);
    }
  };

  const handleBroadcast = async () => {
    setIsBroadcasting(true);
    try {
      await createShift(withDuration(formData));
      clearDraft();
      setShowPreview(false);
      setBroadcastDone(true);
    } catch (err) {
      appToast.fromError(err, "Failed to broadcast shift. Please try again.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const toggleCertificate = (cert: string) => {
    update({
      certificates: formData.certificates.includes(cert)
        ? formData.certificates.filter((c) => c !== cert)
        : [...formData.certificates, cert],
    });
  };

  const allCertificates = useMemo(() => {
    const extras = formData.certificates.filter(
      (c) => !DEFAULT_CERTIFICATES.includes(c),
    );
    return [...DEFAULT_CERTIFICATES, ...extras];
  }, [formData.certificates]);

  if (broadcastDone) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-xl rounded-2xl border border-neutral-100 bg-white px-8 py-12 text-center shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-950">
            <CheckCircle2 className="h-8 w-8 text-success-600 dark:text-success-400" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Shift Broadcast Successfully
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {formData.roleNeeded} Shift has been sent to verified{" "}
            {formData.roleNeeded} professionals nearby. You'll be notified as
            workers apply.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(PATHS.hospital.shifts)}
            >
              View Shift Management
            </Button>
            <Button
              className="bg-brand-800 hover:bg-brand-900 active:bg-brand-900"
              onClick={() => navigate(PATHS.hospital.dashboard)}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Wizard header row */}
      <div className="-mx-4 -mt-4 mb-8 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:-mx-8 lg:-mt-8 lg:px-8 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50">Create Shift</h2>
        <button
          onClick={handleSaveAndExit}
          className="text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
        >
          Save & Exit
        </button>
      </div>

      <div className="mx-auto max-w-3xl pb-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Create a New Shift
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Fill in the details below to broadcast this shift to verified
            healthcare professionals.
          </p>
        </div>

        <WizardSteps steps={STEPS} current={step} className="mt-8" />

        {(gateBlocked || walletBlocked) && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800 dark:border-warning-800 dark:bg-warning-950 dark:text-warning-300">
            <span>
              {gateBlocked
                ? status === "rejected"
                  ? "Your hospital registration was not approved — contact support before creating shifts."
                  : "Your hospital registration is pending admin review. You can prepare a shift, but broadcasting is disabled until approval."
                : hasSubAccount
                  ? "Your hospital wallet has no funds yet — fund it before broadcasting a shift."
                  : "Your hospital has no wallet yet — create one before broadcasting a shift."}
            </span>
            {walletBlocked && !gateBlocked && (
              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0 whitespace-nowrap border-warning-400 bg-white text-xs font-semibold text-warning-800 hover:bg-warning-100 dark:border-warning-700 dark:bg-transparent dark:text-warning-300 dark:hover:bg-warning-900"
                onClick={() =>
                  navigate(PATHS.hospital.payments, { state: { openWalletModal: true } })
                }
              >
                {hasSubAccount ? "Fund Wallet" : "Create Wallet"}
              </Button>
            )}
          </div>
        )}

        {/* Step card */}
        <div className="mt-8 rounded-2xl border border-neutral-100 bg-white p-6 shadow-soft sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
          {step === 0 && (
            <section>
              <h2 className="mb-6 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Basic Information
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  label="Role"
                  options={ROLE_OPTIONS}
                  value={formData.roleNeeded}
                  onChange={(v) => update({ roleNeeded: v })}
                  placeholder="Select role"
                  required
                />
                <Select
                  label="Department"
                  options={DEPARTMENT_OPTIONS}
                  value={formData.department}
                  onChange={(v) => update({ department: v })}
                  placeholder="Select department"
                  required
                />
                <Input
                  label="Specialty"
                  placeholder="e.g. Trauma, Neonatal"
                  value={formData.specialty}
                  onChange={(e) => update({ specialty: e.target.value })}
                />
                <Select
                  label="Shift Type"
                  options={SHIFT_TYPE_OPTIONS}
                  value={formData.shiftType}
                  onChange={(v) =>
                    update({ shiftType: v as ShiftFormData["shiftType"] })
                  }
                  disabled={isVirtualLocked}
                />
                <Input
                  label="Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => update({ startDate: e.target.value })}
                  required
                />
                <div>
                  <p className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Time & Duration <span className="text-error-500">*</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => update({ startTime: e.target.value })}
                      aria-label="Start time"
                    />
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => update({ endTime: e.target.value })}
                      aria-label="End time"
                    />
                  </div>
                  {duration > 0 && (
                    <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                      {duration} hour shift
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Urgency
                  </p>
                  <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-700 dark:bg-neutral-800">
                    {URGENCY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => update({ urgencyLevel: option.value })}
                        className={cn(
                          "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                          formData.urgencyLevel === option.value
                            ? "border border-brand-200 bg-white font-semibold text-brand-600 shadow-sm dark:border-brand-800 dark:bg-neutral-900 dark:text-brand-400"
                            : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  label="Location"
                  value={profile?.name ?? ""}
                  readOnly
                  className="bg-neutral-50 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                />
              </div>
            </section>
          )}

          {step === 1 && (
            <section>
              <h2 className="mb-6 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Compensation
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  label="Rate Type"
                  options={[
                    { value: "hourly", label: "Hourly Rate" },
                    { value: "fixed", label: "Fixed Rate" },
                  ]}
                  value={formData.payType}
                  onChange={(v) =>
                    update({ payType: v as ShiftFormData["payType"] })
                  }
                />
                {formData.payType === "hourly" ? (
                  <Input
                    label="Hourly Rate (₦)"
                    type="number"
                    min={0}
                    value={formData.hourlyRate || ""}
                    onChange={(e) =>
                      update({ hourlyRate: Number(e.target.value) })
                    }
                    placeholder="Per hour"
                    required
                  />
                ) : (
                  <Input
                    label="Fixed Rate (₦)"
                    type="number"
                    min={0}
                    value={formData.fixedRate || ""}
                    onChange={(e) =>
                      update({ fixedRate: Number(e.target.value) })
                    }
                    placeholder="Total for the shift"
                    required
                  />
                )}
                <Input
                  label="Urgency Bonus (₦)"
                  type="number"
                  min={0}
                  value={urgencyBonus || ""}
                  onChange={(e) =>
                    update({
                      bonuses: Number(e.target.value)
                        ? [
                            {
                              id: "stat",
                              name: "Urgency Bonus",
                              description: "Bonus for urgent coverage",
                              amount: Number(e.target.value),
                            },
                          ]
                        : [],
                    })
                  }
                  placeholder="0"
                />
                <Input
                  label="Estimated Duration (hrs)"
                  type="number"
                  min={0}
                  value={duration || ""}
                  onChange={(e) => update({ duration: Number(e.target.value) })}
                  hint={
                    formData.startTime && formData.endTime
                      ? "Derived from the shift times in Step 1"
                      : undefined
                  }
                />
              </div>

              {/* Live cost preview */}
              <div className="mt-6 rounded-xl bg-neutral-50 p-5 dark:bg-neutral-800">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                  Live Cost Preview
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-neutral-500 dark:text-neutral-400">
                      Base pay
                      {formData.payType === "hourly" && duration > 0
                        ? ` (${duration} hrs × ₦${formData.hourlyRate.toLocaleString()})`
                        : ""}
                    </dt>
                    <dd className="text-neutral-700 dark:text-neutral-300">{naira(basePay)}</dd>
                  </div>
                  {urgencyBonus > 0 && (
                    <div className="flex items-center justify-between">
                      <dt className="text-neutral-500 dark:text-neutral-400">Urgency bonus</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300">{naira(urgencyBonus)}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="text-neutral-500 dark:text-neutral-400">Platform service fee</dt>
                    <dd className="text-neutral-700 dark:text-neutral-300">{naira(serviceFee)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-neutral-500 dark:text-neutral-400">Estimated taxes</dt>
                    <dd className="text-neutral-700 dark:text-neutral-300">{naira(taxes)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                    Total Cost
                  </span>
                  <span className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                    {naira(totalCost)}
                  </span>
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="mb-6 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Job Description
              </h2>
              <div className="space-y-6">
                <Textarea
                  label="Description"
                  placeholder="Describe the shift, ward, and patient load..."
                  value={formData.jobDescription}
                  onChange={(e) => update({ jobDescription: e.target.value })}
                  rows={4}
                />

                <ListEditor
                  label="Responsibilities & Tasks"
                  addLabel="+ Add Responsibility"
                  placeholder="e.g. Patient monitoring and vitals documentation"
                  items={formData.tasks}
                  onChange={(tasks) => update({ tasks })}
                />

                <ListEditor
                  label="Equipment Provided"
                  addLabel="+ Add Equipment"
                  placeholder="e.g. PPE, scrubs, badge"
                  items={formData.equipment.map((e) => e.name)}
                  onChange={(names) =>
                    update({
                      equipment: names.map((name, i) => ({
                        id: `eq-${i}`,
                        name,
                        description: "",
                      })),
                    })
                  }
                />

                <ListEditor
                  label="Deliverables"
                  addLabel="+ Add Deliverable"
                  placeholder="e.g. End-of-shift handover notes"
                  items={formData.deliverables.map((d) => d.name)}
                  onChange={(names) =>
                    update({
                      deliverables: names.map((name, i) => ({
                        id: `del-${i}`,
                        name,
                        description: "",
                      })),
                    })
                  }
                />

                {/* Attachments — local only; the backend has no upload endpoint yet. */}
                <div>
                  <p className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Attachments
                  </p>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-10 text-center transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/60 dark:hover:border-neutral-600">
                    <Upload className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
                    <span className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                      Drag files here or{" "}
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        click to upload
                      </span>
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        setAttachments((prev) => [
                          ...prev,
                          ...Array.from(e.target.files ?? []),
                        ])
                      }
                    />
                  </label>
                  {attachments.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {attachments.map((file, i) => (
                        <li
                          key={`${file.name}-${i}`}
                          className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
                        >
                          <span className="truncate">{file.name}</span>
                          <button
                            onClick={() =>
                              setAttachments((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              )
                            }
                            className="text-neutral-400 hover:text-error-600 dark:text-neutral-500 dark:hover:text-error-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="mb-6 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Requirements
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  label="Minimum Experience"
                  options={EXPERIENCE_OPTIONS}
                  value={formData.minExperience}
                  onChange={(v) => update({ minExperience: v })}
                />
                <Input
                  label="Languages"
                  placeholder="e.g. English, Spanish"
                  value={formData.languages}
                  onChange={(e) => update({ languages: e.target.value })}
                />
              </div>

              <div className="mt-6">
                <p className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Required Certificates
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {allCertificates.map((cert) => {
                    const isSelected = formData.certificates.includes(cert);
                    return (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => toggleCertificate(cert)}
                        className={cn(
                          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                          isSelected
                            ? "border-brand-300 bg-brand-50 font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
                            : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200",
                        )}
                      >
                        {cert}
                      </button>
                    );
                  })}
                  {customCertificate === null ? (
                    <button
                      type="button"
                      onClick={() => setCustomCertificate("")}
                      className="rounded-full border border-dashed border-brand-300 px-4 py-1.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-950"
                    >
                      + Add More
                    </button>
                  ) : (
                    <input
                      autoFocus
                      value={customCertificate}
                      onChange={(e) => setCustomCertificate(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customCertificate.trim()) {
                          toggleCertificate(customCertificate.trim());
                          setCustomCertificate(null);
                        } else if (e.key === "Escape") {
                          setCustomCertificate(null);
                        }
                      }}
                      onBlur={() => {
                        if (customCertificate.trim()) {
                          toggleCertificate(customCertificate.trim());
                        }
                        setCustomCertificate(null);
                      }}
                      placeholder="Certificate name"
                      className="w-40 rounded-full border border-brand-300 px-4 py-1.5 text-sm focus:outline-none dark:border-brand-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Textarea
                  label="Skills & Qualifications"
                  placeholder="e.g. IV insertion, EMR proficiency..."
                  value={formData.qualifications.join("\n")}
                  onChange={(e) =>
                    update({
                      qualifications: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={4}
                />
              </div>
            </section>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() =>
              step === 0 ? navigate(-1) : setStep((s) => Math.max(0, s - 1))
            }
            className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePreview}
              isLoading={isPreviewing}
              disabled={!stepValid}
            >
              Preview Shift
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                className="bg-brand-800 hover:bg-brand-900 active:bg-brand-900 px-6"
                disabled={!stepValid}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
              </Button>
            ) : (
              <Button
                className="bg-brand-800 hover:bg-brand-900 active:bg-brand-900 px-6"
                isLoading={isBroadcasting}
                disabled={!stepValid || gateBlocked || walletBlocked}
                title={
                  gateBlocked
                    ? "Hospital registration must be approved first"
                    : walletBlocked
                      ? "Fund your hospital wallet first"
                      : undefined
                }
                onClick={handleBroadcast}
              >
                Broadcast Shift
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Shift Preview"
        size="lg"
      >
        {/* ShiftPreview submits the shift itself; onBroadcast fires after success. */}
        <ShiftPreview
          data={withDuration(formData)}
          onBack={() => setShowPreview(false)}
          onBroadcast={() => {
            setShowPreview(false);
            setBroadcastDone(true);
          }}
        />
      </Modal>
    </div>
  );
}

interface ListEditorProps {
  label: string;
  addLabel: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}

/** Row list with per-row remove and a dashed "+ Add" button, per the design. */
function ListEditor({
  label,
  addLabel,
  placeholder,
  items,
  onChange,
}: ListEditorProps) {
  return (
    <div>
      <p className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={item}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...items];
                next[index] = e.target.value;
                onChange(next);
              }}
              className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition-colors hover:text-error-600 dark:border-neutral-700 dark:text-neutral-500 dark:hover:text-error-400"
              aria-label={`Remove ${label.toLowerCase()} row`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="flex items-center gap-1 rounded-lg border border-dashed border-brand-300 px-3.5 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-950"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel.replace(/^\+\s*/, "")}
        </button>
      </div>
    </div>
  );
}
