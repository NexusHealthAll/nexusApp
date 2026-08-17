import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { Bell, Landmark, CheckCircle2, RefreshCw, UserCheck, Rocket, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/shared/auth/store/authStore";

interface PayoutState {
  bankName?: string;
  accountNumberMasked?: string;
  accountName?: string;
}

export function VerificationPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const payout = (location.state as PayoutState | null) ?? {};

  return (
    <div className="min-h-screen bg-[#F3FAFF] dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-t-2xl px-6 py-4 border-b border-slate-100 flex items-center justify-between dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/medical-staff/onboarding/payout")}
              className="rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-colors dark:text-neutral-400 dark:hover:bg-neutral-800"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <NexusCareLogo size="md" />
          </div>
          <Bell className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
        </div>

        <div className="bg-white rounded-b-2xl shadow-md p-6 space-y-6 dark:bg-neutral-900">
          <div className="flex justify-center gap-2 pt-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-blue-300" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-onboarding-textPrimary dark:text-neutral-50">
              Verification in Progress
            </h1>
            <p className="text-onboarding-textSecondary leading-relaxed dark:text-neutral-400">
              Your account is now under review. Our clinical verification
              team typically approves new profiles within 24 hours.
            </p>
          </div>

          {payout.accountNumberMasked && (
            <div className="flex items-center gap-3 rounded-xl bg-secondary-50 p-4 dark:bg-secondary-950">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white dark:bg-neutral-900">
                <Landmark className="h-5 w-5 text-secondary-700 dark:text-secondary-300" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary-600 dark:text-secondary-400">
                  Bank Linked
                </p>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                  {payout.bankName ?? "Bank account"}
                </p>
                <p className="text-xs text-neutral-500 font-mono dark:text-neutral-400">
                  {payout.accountNumberMasked}
                </p>
              </div>
              <CheckCircle2 className="ml-auto h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 p-5 space-y-5 dark:border-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-neutral-400">
              What Happens Next?
            </p>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary-700 text-white">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-neutral-50">Verification</p>
                <p className="text-sm text-slate-600 dark:text-neutral-400">
                  We're validating your medical license and credentials.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-neutral-50">Profile Activation</p>
                <p className="text-sm text-slate-600 dark:text-neutral-400">
                  Once verified, your profile becomes visible to hospitals.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400">
                <Rocket className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-neutral-50">Start Working</p>
                <p className="text-sm text-slate-600 dark:text-neutral-400">
                  Apply for shifts, manage appointments, and receive payouts.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              // Onboarding is completed — user now logs in to establish an active session.
              useAuthStore.getState().clearClinicianId();
              navigate("/auth/login", { state: { justRegistered: true } });
            }}
            className="w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg"
          >
            Proceed to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
