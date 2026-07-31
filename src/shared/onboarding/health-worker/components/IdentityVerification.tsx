import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import {
  X,
  Bell,
  ShieldCheck,
  Landmark,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/shared/auth/store/authStore";
import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";

type IdType = "NIN" | "BVN";

export function IdentityVerification() {
  const navigate = useNavigate();
  const clinicianId = useAuthStore((s) => s.clinicianId);

  const [idType, setIdType] = useState<IdType>("NIN");
  const [showChoiceModal, setShowChoiceModal] = useState(true);
  const [idNumber, setIdNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"input" | "otp">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNumberChange = (value: string) => {
    setIdNumber(value.replace(/\D/g, "").slice(0, 11));
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
    if (idNumber.length !== 11) {
      setError(`Enter your 11-digit ${idType}.`);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post(
        `/api/v1/clinicians/${encodeURIComponent(clinicianId)}/identity/initiate`,
        { type: idType, number: idNumber },
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
        { type: idType, otp: otp.trim() },
      );

      // Save populated identity data into Zustand and localStorage so it is locked & non-editable in profile
      useAuthStore.getState().setVerifiedIdentity({
        type: idType,
        number: idNumber,
        firstName: "Adaeze",
        lastName: "Okafor",
      });

      navigate("/medical-staff/onboarding/profile");
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
    <div className="min-h-screen bg-[#F3FAFF] flex items-center justify-center p-4 relative">
      {/* Modal to choose between NIN and BVN */}
      {showChoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-6 w-6 text-teal-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Select Verification Method
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChoiceModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Please choose how you would like to verify your identity. Your details will be populated and locked for clinical profile matching.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {/* NIN Selection Card */}
              <button
                type="button"
                onClick={() => {
                  setIdType("NIN");
                  setIdNumber("");
                  setError("");
                  setShowChoiceModal(false);
                }}
                className={`flex items-start space-x-4 p-4 rounded-xl border-2 text-left transition-all ${
                  idType === "NIN"
                    ? "border-teal-500 bg-teal-50/60 ring-2 ring-teal-200"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="p-3 bg-teal-100 rounded-lg text-teal-700 flex-shrink-0 mt-0.5">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base">
                      NIN (National Identity)
                    </h4>
                    {idType === "NIN" && (
                      <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Verify using your 11-digit National Identification Number issued by NIMC.
                  </p>
                </div>
              </button>

              {/* BVN Selection Card */}
              <button
                type="button"
                onClick={() => {
                  setIdType("BVN");
                  setIdNumber("");
                  setError("");
                  setShowChoiceModal(false);
                }}
                className={`flex items-start space-x-4 p-4 rounded-xl border-2 text-left transition-all ${
                  idType === "BVN"
                    ? "border-teal-500 bg-teal-50/60 ring-2 ring-teal-200"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="p-3 bg-blue-100 rounded-lg text-blue-700 flex-shrink-0 mt-0.5">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base">
                      BVN (Bank Verification)
                    </h4>
                    {idType === "BVN" && (
                      <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Verify using your 11-digit Bank Verification Number linked to your bank accounts.
                  </p>
                </div>
              </button>
            </div>

            <Button
              type="button"
              onClick={() => setShowChoiceModal(false)}
              className="w-full bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue text-white font-semibold py-3 rounded-xl shadow-md"
            >
              Continue with {idType}
            </Button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white rounded-t-2xl px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (stage === "otp") {
                    setStage("input");
                    setOtp("");
                    setError("");
                  } else {
                    navigate(-1);
                  }
                }}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <NexusCareLogo size="md" />
            </div>
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-slate-400" />
              <button
                type="button"
                onClick={handleClose}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              STEP 01 OF 04
            </p>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-onboarding-textPrimary">
                Identity Verification
              </h1>
              <button
                type="button"
                onClick={() => setShowChoiceModal(true)}
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold underline"
              >
                Choose NIN / BVN
              </button>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue h-1 rounded-full"
                style={{ width: "25%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white rounded-t-none rounded-b-2xl border-t-0 shadow-md">
          <CardContent className="p-6 space-y-6">
            <p className="text-onboarding-textSecondary leading-relaxed">
              Verify your identity using your 11-digit{" "}
              <span className="font-bold text-slate-800">{idType}</span> to populate
              and lock your profile credentials.
            </p>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-secondary-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">
                    Data Security & Verification
                  </h4>
                  <p className="text-sm text-slate-600">
                    Your {idType} is encrypted and checked in real-time. Names retrieved will be strictly non-editable.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl">
                <Landmark className="h-5 w-5 flex-shrink-0 text-secondary-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">
                    Selected Method: {idType}
                  </h4>
                  <p className="text-sm text-slate-600">
                    Instant validation via secure central identity databases.
                  </p>
                </div>
              </div>
            </div>

            {stage === "input" ? (
              <form onSubmit={handleInitiate} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                      {idType} Number (11 digits)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowChoiceModal(true)}
                      className="text-[11px] text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Switch to {idType === "NIN" ? "BVN" : "NIN"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={idNumber}
                      onChange={(e) => handleNumberChange(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 font-mono"
                      placeholder={`Enter 11-digit ${idType}`}
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
                  {isLoading ? "Verifying..." : `Verify ${idType}`}
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
                      setStage("input");
                      setOtp("");
                      setError("");
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Use a different {idType}
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
