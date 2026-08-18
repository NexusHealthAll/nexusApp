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

function extractNamesFromResponse(body: Record<string, unknown>): {
  firstName: string;
  lastName: string;
} {
  const findKeyRecursive = (obj: unknown, keys: string[]): string | null => {
    if (!obj || typeof obj !== "object") return null;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const res = findKeyRecursive(item, keys);
        if (res) return res;
      }
      return null;
    }
    const record = obj as Record<string, unknown>;
    for (const key of keys) {
      if (typeof record[key] === "string" && (record[key] as string).trim()) {
        return (record[key] as string).trim();
      }
    }
    for (const k of Object.keys(record)) {
      if (record[k] && typeof record[k] === "object") {
        const res = findKeyRecursive(record[k], keys);
        if (res) return res;
      }
    }
    return null;
  };

  const fnKeys = ["firstName", "first_name", "first_Name", "firstnames", "givenName", "given_name"];
  const lnKeys = ["lastName", "last_name", "last_Name", "surname", "surName", "familyName", "family_name"];
  const mnKeys = ["middleName", "middle_name", "otherNames", "other_names"];
  const fullKeys = ["fullName", "full_name", "formattedName", "formatted_name", "name"];

  let fn = findKeyRecursive(body, fnKeys) || "";
  let ln = findKeyRecursive(body, lnKeys) || "";
  const mn = findKeyRecursive(body, mnKeys) || "";
  const full = findKeyRecursive(body, fullKeys) || "";

  if ((!fn || !ln) && full) {
    const parts = full.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      if (!fn) fn = parts[0];
      if (!ln) ln = parts.slice(1).join(" ");
    } else if (parts.length === 1 && !fn) {
      fn = parts[0];
    }
  }

  if (!ln && mn) {
    ln = mn;
  }

  const titleCase = (str: string) => {
    if (!str) return str;
    const isUpper = str.split("").every((c) => c === c.toUpperCase() && c !== c.toLowerCase());
    if (isUpper) {
      return str
        .toLowerCase()
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
    return str;
  };

  return {
    firstName: titleCase(fn),
    lastName: titleCase(ln),
  };
}

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

  const handleValidate = async (e?: React.FormEvent, otpOverride?: string) => {
    e?.preventDefault();
    setError("");

    const codeToValidate = (otpOverride ?? otp).trim();

    if (codeToValidate.length === 0) {
      setError("Enter the code sent to your registered phone number.");
      return;
    }

    setIsLoading(true);
    try {
      const { data: body } = await apiClient.post<Record<string, unknown>>(
        `/api/v1/clinicians/${encodeURIComponent(clinicianId)}/identity/validate`,
        { type: idType, otp: codeToValidate },
      );

      const userInStore = useAuthStore.getState().user;
      const { firstName: extractedFn, lastName: extractedLn } = extractNamesFromResponse(body);

      const resolvedFirstName = extractedFn || userInStore?.first_name || "";
      const resolvedLastName = extractedLn || userInStore?.last_name || "";

      // Save populated identity data into Zustand and localStorage so it is locked & non-editable in profile
      useAuthStore.getState().setVerifiedIdentity({
        type: idType,
        number: idNumber,
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
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
    <div className="min-h-screen bg-[#F3FAFF] dark:bg-neutral-950 flex items-center justify-center p-4 relative">
      {/* Modal to choose between NIN and BVN */}
      {showChoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-6 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-neutral-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-50">
                  Select Verification Method
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChoiceModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition-colors dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed dark:text-neutral-400">
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
                    ? "border-teal-500 bg-teal-50/60 ring-2 ring-teal-200 dark:bg-teal-950/60 dark:ring-teal-900"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-neutral-700 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                }`}
              >
                <div className="p-3 bg-teal-100 rounded-lg text-teal-700 flex-shrink-0 mt-0.5 dark:bg-teal-950 dark:text-teal-300">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base dark:text-neutral-50">
                      NIN (National Identity)
                    </h4>
                    {idType === "NIN" && (
                      <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 dark:text-neutral-400">
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
                    ? "border-teal-500 bg-teal-50/60 ring-2 ring-teal-200 dark:bg-teal-950/60 dark:ring-teal-900"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-neutral-700 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                }`}
              >
                <div className="p-3 bg-blue-100 rounded-lg text-blue-700 flex-shrink-0 mt-0.5 dark:bg-blue-950 dark:text-blue-300">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base dark:text-neutral-50">
                      BVN (Bank Verification)
                    </h4>
                    {idType === "BVN" && (
                      <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 dark:text-neutral-400">
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
        <div className="bg-white rounded-t-2xl px-6 py-4 border-b border-slate-100 dark:bg-neutral-900 dark:border-neutral-800">
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
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-colors dark:text-neutral-400 dark:hover:bg-neutral-800"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <NexusCareLogo size="md" />
            </div>
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
              <button
                type="button"
                onClick={handleClose}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide dark:text-neutral-400">
              STEP 01 OF 04
            </p>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-onboarding-textPrimary dark:text-neutral-50">
                Identity Verification
              </h1>
              <button
                type="button"
                onClick={() => setShowChoiceModal(true)}
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold underline dark:text-teal-400 dark:hover:text-teal-300"
              >
                Choose NIN / BVN
              </button>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1 dark:bg-neutral-800">
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
            <p className="text-onboarding-textSecondary leading-relaxed dark:text-neutral-400">
              Verify your identity using your 11-digit{" "}
              <span className="font-bold text-slate-800 dark:text-neutral-200">{idType}</span> to populate
              and lock your profile credentials.
            </p>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl dark:bg-neutral-800">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-secondary-600 mt-0.5 dark:text-secondary-400" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1 dark:text-neutral-50">
                    Data Security & Verification
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-neutral-400">
                    Your {idType} is encrypted and checked in real-time. Names retrieved will be strictly non-editable.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl dark:bg-neutral-800">
                <Landmark className="h-5 w-5 flex-shrink-0 text-secondary-600 mt-0.5 dark:text-secondary-400" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1 dark:text-neutral-50">
                    Selected Method: {idType}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-neutral-400">
                    Instant validation via secure central identity databases.
                  </p>
                </div>
              </div>
            </div>

            {stage === "input" ? (
              <form onSubmit={handleInitiate} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {idType} Number (11 digits)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowChoiceModal(true)}
                      className="text-[11px] text-teal-600 hover:text-teal-700 font-medium dark:text-teal-400 dark:hover:text-teal-300"
                    >
                      Switch to {idType === "NIN" ? "BVN" : "NIN"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5 dark:bg-neutral-800">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={idNumber}
                      onChange={(e) => handleNumberChange(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 font-mono dark:text-neutral-100"
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
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    Enter the code sent to your registered phone number
                  </label>
                  <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5 dark:bg-neutral-800">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const next = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtp(next);
                        if (error) setError("");

                        // Auto-submit once the code is fully entered.
                        if (next.length === 6 && !isLoading) {
                          handleValidate(undefined, next);
                        }
                      }}
                      className="flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 font-mono tracking-widest dark:text-neutral-100"
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
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors dark:text-neutral-400 dark:hover:text-neutral-200"
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
