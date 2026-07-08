import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { X, Bell, ShieldCheck, Landmark, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";

export function IdentityVerification() {
  const navigate = useNavigate();
  const clinicianId = useAuthStore((s) => s.clinicianId);

  const [nin, setNin] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"nin" | "otp">("nin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNinChange = (value: string) => {
    setNin(value.replace(/\D/g, "").slice(0, 11));
    if (error) setError("");
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clinicianId) {
      setError(
        "We couldn't find your clinician account for this session. Please log in again to continue.",
      );
      return;
    }
    if (nin.length !== 11) {
      setError("Enter your 11-digit NIN.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post(
        `/api/v1/clinicians/${encodeURIComponent(clinicianId)}/identity/initiate`,
        { type: "NIN", number: nin },
      );
      setStage("otp");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Network error — please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length === 0) {
      setError("Enter the code sent to your registered phone number.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post(
        `/api/v1/clinicians/${encodeURIComponent(clinicianId)}/identity/validate`,
        { type: "NIN", otp: otp.trim() },
      );
      navigate("/medical-staff/onboarding/payout");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Network error — please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => navigate("/medical-staff/dashboard");
  const handleSkip = () => navigate("/medical-staff/dashboard");

  return (
    <div className="min-h-screen bg-[#F3FAFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white rounded-t-2xl px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <NexusCareLogo size="md" />
            </div>
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-slate-400" />
              <button
                onClick={handleClose}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              STEP 03 OF 04
            </p>
            <h1 className="text-2xl font-bold text-onboarding-textPrimary">
              Identity Verification
            </h1>
            <div className="w-full bg-slate-200 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue h-1 rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white rounded-t-none rounded-b-2xl border-t-0 shadow-md">
          <CardContent className="p-6 space-y-6">
            <p className="text-onboarding-textSecondary leading-relaxed">
              Verify your identity using your National Identification Number
              (NIN) to proceed with your clinical credentials.
            </p>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-secondary-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">
                    Data Security
                  </h4>
                  <p className="text-sm text-slate-600">
                    Your NIN is encrypted and never stored in plain text.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl">
                <Landmark className="h-5 w-5 flex-shrink-0 text-secondary-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">
                    NIMC Real-time Check
                  </h4>
                  <p className="text-sm text-slate-600">
                    Instant validation via the National Identity Management
                    Commission database.
                  </p>
                </div>
              </div>
            </div>

            {stage === "nin" ? (
              <form onSubmit={handleInitiate} className="space-y-6">
                <div className="space-y-3">
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                    NIN Number (11 digits)
                  </label>
                  <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={nin}
                      onChange={(e) => handleNinChange(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 font-mono"
                      placeholder="Enter 11-digit number"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  isLoading={isLoading}
                  className="w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? "Verifying..." : "Verify Identity"}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleValidate} className="space-y-6">
                <div className="space-y-3">
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                    Enter the code sent to your registered phone number
                  </label>
                  <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, ""));
                        if (error) setError("");
                      }}
                      className="flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 font-mono tracking-widest"
                      placeholder="123456"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  isLoading={isLoading}
                  className="w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg"
                >
                  {isLoading ? "Confirming..." : "Confirm Code"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStage("nin");
                      setOtp("");
                      setError("");
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Use a different NIN
                  </button>
                </div>
              </form>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                I'll complete this later
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
