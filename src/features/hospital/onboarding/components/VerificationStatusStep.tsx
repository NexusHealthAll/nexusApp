import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageSquare,
  Mail,
  Phone,
  LayoutDashboard,
} from "lucide-react";
import { HospitalOnboardingLayout } from "./HospitalOnboardingLayout";
import { useOnboarding } from "../context/OnboardingContext";
import { authUtils } from "@/features/auth/utils/authUtils";
import { useAuthStore } from "@/features/auth/store/authStore";

export function VerificationStatusStep() {
  const navigate = useNavigate();
  const { formData } = useOnboarding();

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
        <div className="rounded-xl bg-gradient-to-br from-[#EBF4FF] via-[#DAE8F3] to-[#C8DFEF] border border-[#C8DFEF] px-7 py-6 mb-7">
          {/* "Pending Review" chip */}
          <div className="inline-flex items-center gap-1.5 bg-white/70 border border-[#C8DFEF] text-[#1A5888] text-[11px] font-semibold px-3 py-1 rounded-full mb-4">
            <ShieldCheck className="h-3 w-3" />
            Pending Review
          </div>

          <h1 className="text-[24px] font-bold text-neutral-900 leading-snug mb-2">
            Application Submitted Successfully
          </h1>
          <p className="text-[13px] text-neutral-600 max-w-lg leading-relaxed">
            Thank you for completing the registration process. Our compliance
            team is currently reviewing your application. You will be notified
            once the review is complete.
          </p>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-5">
          {/* LEFT: Review Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-6">
            <h2 className="text-[15px] font-semibold text-neutral-800 mb-7">
              Review Timeline
            </h2>

            <ol>
              {/* Item 1 — done */}
              <li className="flex gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <div className="h-9 w-9 rounded-full bg-[#349C93] flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="w-px flex-1 bg-gray-200 mt-1.5" />
                </div>
                <div className="pt-1">
                  <p className="text-[13px] font-semibold text-neutral-800">
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
                  <div className="w-px flex-1 bg-gray-200 mt-1.5" />
                </div>
                <div className="pt-1">
                  <p className="text-[13px] font-semibold text-[#1A5888] mb-1">
                    Compliance Screening
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mb-3">
                    Currently verifying medical licenses and facility
                    credentials against national registries.
                  </p>
                  <div className="inline-flex items-center gap-1.5 bg-[#EBF4FF] border border-[#C8DFEF] text-[#1A5888] text-[11px] font-medium px-3 py-1.5 rounded-full">
                    <Clock className="h-3 w-3" />
                    Estimated completion: 2-3 business days
                  </div>
                </div>
              </li>

              {/* Item 3 — pending */}
              <li className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
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
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-[#EBF4FF] flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4 text-[#1A5888]" />
                </div>
                <h3 className="text-[13px] font-semibold text-neutral-800">
                  Need Assistance?
                </h3>
              </div>
              <p className="text-[11px] text-neutral-500 mb-4 leading-relaxed">
                Our verification specialists are available to answer any
                questions about your application.
              </p>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#EBF4FF] border border-[#C8DFEF] text-[12px] font-semibold text-[#1A5888] hover:bg-[#DAE8F3] transition-colors duration-150">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Live Chat Support
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-[12px] font-semibold text-neutral-700 hover:bg-gray-100 transition-colors duration-150">
                  <Mail className="h-3.5 w-3.5" />
                  Email Support
                </button>
              </div>
            </div>

            {/* Application Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">
                Application Summary
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Facility
                  </p>
                  <p className="text-[13px] font-semibold text-neutral-800">
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
                  <p className="text-[13px] font-semibold text-neutral-800">
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
                  <div className="flex items-center gap-1.5 text-neutral-800">
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

              navigate("/auth/login");
            }}
            className="flex items-center gap-2 px-7 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-[13px] font-semibold transition-colors duration-150 shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            Continue
          </button>
        </div>
      </div>
    </HospitalOnboardingLayout>
  );
}
