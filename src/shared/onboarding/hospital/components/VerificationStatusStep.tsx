import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageSquare,
  Mail,
  Phone,
  LayoutDashboard,
  FileText,
  KeyRound,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { HospitalOnboardingLayout } from "./HospitalOnboardingLayout";
import { useOnboarding } from "../context/OnboardingContext";
import { authUtils } from "@/shared/auth/utils/authUtils";
import { useAuthStore } from "@/shared/auth/store/authStore";
import { Modal } from "@/shared/components/ui/Modal";
import {
  HospitalProfileService,
  type DocumentsVerificationStatus,
  type HospitalRegistrationStatus,
} from "@/features/hospital/services/hospitalProfileService";

// ─── Verification breakdown badge ──────────────────────────────────────────

type BadgeState =
  | "verified"
  | "under_review"
  | "submitted"
  | "pending"
  | "unverified"
  | "rejected";

const BADGE_CONFIG: Record<
  BadgeState,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  verified: {
    label: "Verified",
    className: "bg-[#349C93]/10 border-[#349C93]/30 text-[#0F766E]",
    icon: CheckCircle2,
  },
  under_review: {
    label: "Under Review",
    className:
      "bg-[#EBF4FF] dark:bg-neutral-800 border-[#C8DFEF] dark:border-neutral-700 text-[#1A5888] dark:text-[#5AA6D6]",
    icon: Clock,
  },
  submitted: {
    label: "Submitted",
    className:
      "bg-[#EBF4FF] dark:bg-neutral-800 border-[#C8DFEF] dark:border-neutral-700 text-[#1A5888] dark:text-[#5AA6D6]",
    icon: Clock,
  },
  pending: {
    label: "Pending",
    className:
      "bg-[#EBF4FF] dark:bg-neutral-800 border-[#C8DFEF] dark:border-neutral-700 text-[#1A5888] dark:text-[#5AA6D6]",
    icon: Clock,
  },
  unverified: {
    label: "Not Started",
    className:
      "bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400",
    icon: Clock,
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
    icon: XCircle,
  },
};

function VerificationBadge({ state }: { state: BadgeState }) {
  const { label, className, icon: Icon } = BADGE_CONFIG[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border text-[11px] font-semibold px-3 py-1 rounded-full shrink-0 ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function StatusRow({
  icon: Icon,
  label,
  note,
  state,
}: {
  icon: typeof FileText;
  label: string;
  note: string;
  state: BadgeState;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[#F7FAFC] dark:bg-neutral-800/60 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-[#EBF4FF] dark:bg-neutral-800 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-[#1A5888] dark:text-[#5AA6D6]" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100">
            {label}
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {note}
          </p>
        </div>
      </div>
      <VerificationBadge state={state} />
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

interface StatusBreakdown {
  documentsStatus: DocumentsVerificationStatus;
  identityVerified: boolean;
  overallStatus: HospitalRegistrationStatus;
  rejectionReason: string | null;
}

export function VerificationStatusStep() {
  const navigate = useNavigate();
  const { formData, reset } = useOnboarding();

  // Informational notice, shown as soon as this final page loads: the hospital
  // cannot sign in or reach the dashboard until an admin verifies the
  // registration. Free to dismiss — it doesn't block the "Continue" action.
  const [showApprovalNotice, setShowApprovalNotice] = useState(true);

  // ── Verification status breakdown ────────────────────────────────────────
  // Fetched once on mount via the same public/ungated hospital-detail
  // endpoint used elsewhere (HospitalProfileService.getHospitalDetails) plus
  // the registration-status endpoint, both of which work pre-auth using the
  // hospitalId already sitting in the onboarding draft — there's no session
  // yet at this point in the flow. No polling existed here before, so none
  // is added; the breakdown reflects status as of page load.
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown | null>(
    null,
  );
  const [statusLoadFailed, setStatusLoadFailed] = useState(false);

  useEffect(() => {
    const hospitalId = formData.hospitalId;
    if (!hospitalId) return;

    let cancelled = false;

    (async () => {
      try {
        const [details, registration] = await Promise.all([
          HospitalProfileService.getHospitalDetails(hospitalId),
          HospitalProfileService.getRegistrationStatus(hospitalId),
        ]);
        if (cancelled) return;
        setStatusBreakdown({
          documentsStatus: details?.documentsStatus ?? "unverified",
          identityVerified: details?.identityVerified ?? false,
          overallStatus: registration?.status ?? "pending",
          rejectionReason: registration?.rejectionReason ?? null,
        });
      } catch {
        if (!cancelled) setStatusLoadFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formData.hospitalId]);

  const checkingNote = statusLoadFailed
    ? "Unable to load the latest status"
    : "Checking status…";

  const documentsState: BadgeState = statusBreakdown
    ? statusBreakdown.documentsStatus
    : "pending";
  const documentsNote = statusBreakdown
    ? {
        verified: "Business/CAC documents verified",
        under_review: "Documents are currently being reviewed",
        submitted: "Documents submitted, awaiting review",
        unverified: "No documents submitted yet",
      }[statusBreakdown.documentsStatus]
    : checkingNote;

  const identityState: BadgeState = statusBreakdown
    ? statusBreakdown.identityVerified
      ? "verified"
      : "pending"
    : "pending";
  const identityNote = statusBreakdown
    ? statusBreakdown.identityVerified
      ? "BVN/NIN verified successfully"
      : "Awaiting identity verification"
    : checkingNote;

  const overallState: BadgeState = statusBreakdown
    ? statusBreakdown.overallStatus === "approved"
      ? "verified"
      : statusBreakdown.overallStatus === "rejected"
        ? "rejected"
        : "pending"
    : "pending";
  const overallNote = statusBreakdown
    ? statusBreakdown.overallStatus === "approved"
      ? "Registration approved — you can now sign in"
      : statusBreakdown.overallStatus === "rejected"
        ? "Registration was not approved"
        : "Awaiting final compliance decision"
    : checkingNote;

  const isRejected = statusBreakdown?.overallStatus === "rejected";
  const isApproved = statusBreakdown?.overallStatus === "approved";

  // Derive display values from context
  const facilityName = formData.hospitalName || "—";
  const facilityCity =
    [formData.city, formData.state].filter(Boolean).join(", ") || "Nigeria";
  const adminName =
    [formData.adminFirstName, formData.adminLastName]
      .filter(Boolean)
      .join(" ") || "—";
  const adminContact =
    formData.email || authUtils.getCurrentUser()?.email || "—";
  const adminPhone = formData.phone || "—";

  // Submission timestamp
  const submittedAt = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <HospitalOnboardingLayout activeStep={3} lockedSteps={[0, 1, 2]}>
      <div className="max-w-4xl mx-auto">
        {/* ── Success banner — light blue gradient as in design ── */}
        <div className="rounded-xl bg-gradient-to-br from-[#EBF4FF] via-[#DAE8F3] to-[#C8DFEF] dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 border border-[#C8DFEF] dark:border-neutral-700 px-7 py-6 mb-7">
          {/* Status chip — reflects the real overall status once loaded */}
          <div
            className={[
              "inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full mb-4 border",
              isRejected
                ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                : "bg-white/70 dark:bg-neutral-800/70 border-[#C8DFEF] dark:border-neutral-700 text-[#1A5888] dark:text-[#5AA6D6]",
            ].join(" ")}
          >
            {isRejected ? (
              <XCircle className="h-3 w-3" />
            ) : (
              <ShieldCheck className="h-3 w-3" />
            )}
            {isRejected
              ? "Registration Rejected"
              : isApproved
                ? "Approved"
                : "Pending Review"}
          </div>

          <h1 className="text-[24px] font-bold text-neutral-900 dark:text-neutral-50 leading-snug mb-2">
            {isRejected
              ? "Your Application Was Not Approved"
              : isApproved
                ? "Application Approved"
                : "Application Submitted Successfully"}
          </h1>
          <p className="text-[13px] text-neutral-600 dark:text-neutral-300 max-w-lg leading-relaxed">
            {isRejected
              ? "Our compliance team reviewed your submission and could not approve it at this time. See the details below."
              : isApproved
                ? "Your hospital has been verified and approved. You can sign in to access your dashboard."
                : "Thank you for completing the registration process. Our compliance team is currently reviewing your application. You will be notified once the review is complete."}
          </p>
        </div>

        {/* ── Rejection reason callout — only when the overall status is rejected ── */}
        {isRejected && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-6 py-5 mb-7">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-red-700 dark:text-red-300 mb-1">
                  Reason for rejection
                </p>
                <p className="text-[12px] text-red-700/90 dark:text-red-300/90 leading-relaxed">
                  {statusBreakdown?.rejectionReason ??
                    "No specific reason was recorded for this decision. Please contact support for details."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Verification Breakdown — mirrors what admin sees per sub-check ── */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 px-6 py-6 mb-7">
          <h2 className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-100 mb-5">
            Verification Breakdown
          </h2>
          <div className="space-y-3">
            <StatusRow
              icon={FileText}
              label="Business / CAC Verification"
              note={documentsNote}
              state={documentsState}
            />
            <StatusRow
              icon={KeyRound}
              label="Identity Verification (BVN/NIN)"
              note={identityNote}
              state={identityState}
            />
            <StatusRow
              icon={ShieldCheck}
              label="Overall Admin Review"
              note={overallNote}
              state={overallState}
            />
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-5">
          {/* LEFT: Review Timeline */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 px-6 py-6">
            <h2 className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-100 mb-7">
              Review Timeline
            </h2>

            <ol>
              {/* Item 1 — done */}
              <li className="flex gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <div className="h-9 w-9 rounded-full bg-[#349C93] flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="w-px flex-1 bg-gray-200 dark:bg-neutral-700 mt-1.5" />
                </div>
                <div className="pt-1">
                  <p className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100">
                    Documents Submitted
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {submittedAt}
                  </p>
                </div>
              </li>

              {/* Item 2 — in progress */}
              <li className="flex gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <div className="h-9 w-9 rounded-full bg-[#1A5888] flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="w-px flex-1 bg-gray-200 dark:bg-neutral-700 mt-1.5" />
                </div>
                <div className="pt-1">
                  <p className="text-[13px] font-semibold text-[#1A5888] mb-1">
                    Compliance Screening
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mb-3">
                    Currently verifying medical licenses and facility
                    credentials against national registries.
                  </p>
                  <div className="inline-flex items-center gap-1.5 bg-[#EBF4FF] dark:bg-neutral-800 border border-[#C8DFEF] dark:border-neutral-700 text-[#1A5888] dark:text-[#5AA6D6] text-[11px] font-medium px-3 py-1.5 rounded-full">
                    <Clock className="h-3 w-3" />
                    Estimated completion: 2-3 business days
                  </div>
                </div>
              </li>

              {/* Item 3 — pending */}
              <li className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center shrink-0">
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-neutral-500" />
                  </div>
                </div>
                <div className="pt-1">
                  <p className="text-[13px] font-semibold text-neutral-400">
                    Final Approval
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Account activation and platform access granted.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* RIGHT column */}
          <div className="space-y-4">
            {/* Need Assistance */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-[#EBF4FF] dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4 text-[#1A5888] dark:text-[#5AA6D6]" />
                </div>
                <h3 className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100">
                  Need Assistance?
                </h3>
              </div>
              <p className="text-[11px] text-neutral-500 mb-4 leading-relaxed">
                Our verification specialists are available to answer any
                questions about your application.
              </p>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#EBF4FF] dark:bg-neutral-800 border border-[#C8DFEF] dark:border-neutral-700 text-[12px] font-semibold text-[#1A5888] dark:text-[#5AA6D6] hover:bg-[#DAE8F3] dark:hover:bg-neutral-700 transition-colors duration-150">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Live Chat Support
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-[12px] font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors duration-150">
                  <Mail className="h-3.5 w-3.5" />
                  Email Support
                </button>
              </div>
            </div>

            {/* Application Summary */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5">
              <h3 className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                Application Summary
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Facility
                  </p>
                  <p className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100">
                    {facilityName}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {facilityCity}, Nigeria
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Administrator
                  </p>
                  <p className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100">
                    {adminName}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {adminContact}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Phone
                  </p>
                  <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-100">
                    <Phone className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="text-[13px] font-semibold">
                      {adminPhone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/hospital/onboarding/location")}
            className="px-6 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-semibold transition-colors duration-150"
          >
            Back
          </button>
          <button
            onClick={() => {
              // Mark that user is coming from hospital onboarding verification
              // so we can route them to the correct dashboard post-login.
              useAuthStore.getState().setActiveAuthFlow({
                role: "hospital",
                action: "login",
                origin: "hospital-onboarding",
              });

              // Onboarding is fully complete — safe to clear the draft now.
              reset();
              navigate("/auth/login");
            }}
            className="flex items-center gap-2 px-7 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-[13px] font-semibold transition-colors duration-150 shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            Continue
          </button>
        </div>
      </div>

      {/* ── "Verification required before login" notice ── */}
      <Modal
        isOpen={showApprovalNotice}
        onClose={() => setShowApprovalNotice(false)}
        size="sm"
        title="Verification required"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-[#C8DFEF] bg-[#EBF4FF] p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1A5888] dark:text-[#5AA6D6]" />
            <p className="text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              Your hospital can&apos;t sign in or access the dashboard until an
              administrator verifies this registration. We&apos;ll email you as
              soon as the review is complete — you can then log in with your
              admin email.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowApprovalNotice(false)}
            className="w-full rounded-lg bg-[#0F766E] py-2.5 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-[#0D9488]"
          >
            Got it
          </button>
        </div>
      </Modal>
    </HospitalOnboardingLayout>
  );
}
