import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageSquare,
  Mail,
  Building2,
  Banknote,
  LayoutDashboard,
} from "lucide-react";
import { HospitalOnboardingLayout } from "./HospitalOnboardingLayout";

export function VerificationStatusStep() {
  const navigate = useNavigate();

  return (
    <HospitalOnboardingLayout activeStep={3}>
      <div className="max-w-5xl mx-auto">

        {/* ── Success banner ── */}
        <div className="bg-gradient-to-br from-slate-100 to-blue-50 rounded-2xl px-8 py-8 mb-8 border border-blue-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-3">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-3">
            Application Submitted Successfully
          </h1>
          <p className="text-sm text-neutral-600 max-w-lg leading-relaxed">
            Thank you for completing the registration process. Our compliance team is currently
            reviewing your application. You will be notified once the review is complete.
          </p>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-7">

          {/* LEFT: Review Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 px-8 py-8 hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
            <h2 className="text-base font-semibold text-neutral-800 mb-8">Review Timeline</h2>

            <ol className="relative">
              {/* Timeline item 1 — done */}
              <li className="flex gap-5 mb-9">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                </div>
                <div className="pt-1.5">
                  <p className="text-sm font-semibold text-neutral-800">Documents Submitted</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Oct 24, 2023 at 10:45 AM</p>
                </div>
              </li>

              {/* Timeline item 2 — in progress */}
              <li className="flex gap-5 mb-9">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                </div>
                <div className="pt-1.5">
                  <p className="text-sm font-semibold text-blue-600">Compliance Screening</p>
                  <p className="text-[11px] text-neutral-500 mt-1 mb-3 leading-relaxed">
                    Currently verifying medical licenses and facility credentials against national
                    registries.
                  </p>
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] font-medium px-3 py-1.5 rounded-full">
                    <Clock className="h-3 w-3" />
                    Estimated completion: 2-3 business days
                  </div>
                </div>
              </li>

              {/* Timeline item 3 — pending */}
              <li className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <div className="h-3 w-3 rounded-full bg-gray-400" />
                  </div>
                </div>
                <div className="pt-1.5">
                  <p className="text-sm font-semibold text-neutral-400">Final Approval</p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Account activation and platform access granted.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* RIGHT column */}
          <div className="space-y-6">

            {/* Need Assistance */}
            <div className="bg-white rounded-2xl border border-gray-200 p-7 hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-neutral-500" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-800">Need Assistance?</h3>
              </div>
              <p className="text-[11px] text-neutral-500 mb-5 leading-relaxed">
                Our verification specialists are available to answer any questions about your
                application.
              </p>
              <div className="space-y-2.5">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F0F7FF] text-sm font-semibold text-teal-700 border border-teal-100 hover:bg-teal-50 hover:border-teal-300 hover:shadow-sm active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/40">
                  <MessageSquare className="h-4 w-4" />
                  Live Chat Support
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-sm font-semibold text-neutral-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300/50">
                  <Mail className="h-4 w-4" />
                  Email Support
                </button>
              </div>
            </div>

            {/* Application Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-7 hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
              <h3 className="text-sm font-semibold text-neutral-800 mb-5">Application Summary</h3>

              <div className="space-y-4 text-[11px]">
                <div>
                  <p className="font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Facility
                  </p>
                  <div className="flex items-center gap-1.5 text-neutral-800 font-semibold">
                    <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                    St. Jude Medical Center
                  </div>
                  <p className="text-neutral-400 mt-0.5 pl-5">Lagos, Nigeria</p>
                </div>

                <div>
                  <p className="font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Administrator
                  </p>
                  <p className="text-neutral-800 font-semibold">Dr. Adebayo Johnson</p>
                </div>

                <div>
                  <p className="font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Bank Details
                  </p>
                  <div className="flex items-center gap-1.5 text-neutral-800 font-semibold">
                    <Banknote className="h-3.5 w-3.5 text-neutral-400" />
                    Guaranty Trust Bank
                  </div>
                  <p className="text-neutral-400 mt-0.5 pl-5">•••• •••• 4892</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => navigate("/hospital/onboarding/financial-setup")}
            className="px-7 py-3 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400/50"
          >
            Back
          </button>
          <button
            onClick={() => navigate("/hospital/dashboard")}
            className="flex items-center gap-2.5 px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-semibold shadow hover:opacity-90 hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </HospitalOnboardingLayout>
  );
}
