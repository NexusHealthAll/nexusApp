import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { HospitalOnboardingLayout } from "./HospitalOnboardingLayout";
import { useOnboarding } from "../context/OnboardingContext";
import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";

// ─── Styles ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg bg-[#DAE8F3] dark:bg-neutral-800 border border-transparent px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 outline-none " +
  "focus:ring-2 focus:ring-[#349C93]/40 focus:border-[#349C93] focus:bg-[#D0E5F2] dark:focus:bg-neutral-700 " +
  "hover:bg-[#D0E5F2] dark:hover:bg-neutral-700 transition-all duration-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500";

const fieldError = "mt-1.5 text-[11px] text-red-500";

// Hospitals verify identity with a BVN only. Exactly 11 digits.
const IDENTITY_TYPE = "BVN";
const BVN_PATTERN = /^\d{11}$/;

// ─── Main component ───────────────────────────────────────────────────────────

type InitiateStatus = "idle" | "loading" | "success" | "error";
type ValidateStatus = "idle" | "loading" | "success" | "error";

export function IdentityVerificationStep() {
  const navigate = useNavigate();
  const { formData } = useOnboarding();
  const hospitalId = formData.hospitalId;

  // ── Card 1 state ─────────────────────────────────────────────────────────
  const [identityNumber, setIdentityNumber] = useState("");
  const [initiateStatus, setInitiateStatus] = useState<InitiateStatus>("idle");
  const [initiateError, setInitiateError] = useState<string | null>(null);
  const [identityNumberError, setIdentityNumberError] = useState<string | null>(null);

  // ── Card 2 state ─────────────────────────────────────────────────────────
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [validateStatus, setValidateStatus] = useState<ValidateStatus>("idle");
  const [validateError, setValidateError] = useState<string | null>(null);

  const card1Done = initiateStatus === "success";
  const card2Active = card1Done;

  // ── Initiate handler ─────────────────────────────────────────────────────
  async function handleInitiate() {
    const number = identityNumber.trim();
    if (!number) {
      setIdentityNumberError("Please enter your BVN");
      return;
    }
    if (!BVN_PATTERN.test(number)) {
      setIdentityNumberError("BVN must be exactly 11 digits");
      return;
    }
    setIdentityNumberError(null);

    setInitiateError(null);
    setInitiateStatus("loading");

    try {
      await apiClient.post(`/api/v1/hospitals/${hospitalId}/identity/initiate`, {
        number,
        type: IDENTITY_TYPE,
      });
      setInitiateStatus("success");
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      setInitiateError(
        apiErr?.message ?? "Identity initiation failed. Please check your details and try again."
      );
      setInitiateStatus("error");
    }
  }

  // ── OTP validate handler ─────────────────────────────────────────────────
  async function handleValidate(otpOverride?: string) {
    const codeToValidate = (otpOverride ?? otp).trim();
    if (!codeToValidate) {
      setOtpError("Please enter the OTP sent to you");
      return;
    }
    setOtpError(null);
    setValidateError(null);
    setValidateStatus("loading");

    try {
      await apiClient.post(`/api/v1/hospitals/${hospitalId}/identity/validate`, {
        otp: codeToValidate,
        type: IDENTITY_TYPE,
      });
      setValidateStatus("success");
      // Draft is kept — VerificationStatusStep still needs it for the
      // Application Summary card. Cleared once the user leaves that page.
      navigate("/hospital/onboarding/verification-status");
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      setValidateError(
        apiErr?.message ?? "OTP validation failed. Please check the code and try again."
      );
      setValidateStatus("error");
    }
  }

  return (
    <HospitalOnboardingLayout activeStep={2} lockedSteps={[0, 1]}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-[#EBF4FF] dark:bg-neutral-900 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-[#1A5888] dark:text-[#5AA6D6]" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
              Identity Verification
            </h1>
            <p className="text-[13px] text-neutral-500 leading-relaxed">
              Verify your identity with your BVN to complete hospital registration.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full space-y-4">

        {/* ── Card 1: Identity Initiate ─────────────────────────────────── */}
        <div
          className={[
            "rounded-xl border transition-all duration-300 overflow-hidden",
            card1Done
              ? "border-[#349C93]/40 bg-[#F0FBF9] dark:bg-teal-950"
              : "border-[#D6E8F5] dark:border-neutral-800 bg-[#EBF4FF] dark:bg-neutral-900",
          ].join(" ")}
        >
          {/* Card 1 Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div
                className={[
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold",
                  card1Done
                    ? "bg-[#349C93] text-white"
                    : "bg-[#1A5888] text-white",
                ].join(" ")}
              >
                {card1Done ? <CheckCircle2 className="h-4 w-4" /> : "1"}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100">
                  Identity Details
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {card1Done
                    ? "BVN verified successfully"
                    : "Enter your Bank Verification Number (BVN)"}
                </p>
              </div>
            </div>
            {card1Done && (
              <span className="inline-flex items-center gap-1.5 bg-[#349C93]/10 border border-[#349C93]/30 text-[#0F766E] text-[11px] font-semibold px-3 py-1 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          {/* Card 1 Body — collapsed on success */}
          {!card1Done && (
            <div className="px-6 pb-6 border-t border-[#D6E8F5] dark:border-neutral-800">
              <div className="pt-5 space-y-4">
                {/* Identity type — fixed to BVN */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Identity Type
                  </label>
                  <div className="w-full flex items-center gap-2 rounded-lg bg-[#DAE8F3] dark:bg-neutral-800 border border-transparent px-3.5 py-2.5 text-sm">
                    <ShieldCheck className="h-4 w-4 text-[#1A5888] dark:text-[#5AA6D6] shrink-0" />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-100">BVN</span>
                    <span className="text-neutral-500 dark:text-neutral-400 text-[12px]">
                      — Bank Verification Number
                    </span>
                  </div>
                </div>

                {/* BVN number input */}
                <div>
                  <label
                    htmlFor="identity-number"
                    className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5"
                  >
                    BVN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="identity-number"
                    inputMode="numeric"
                    maxLength={11}
                    value={identityNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setIdentityNumber(val);
                      setIdentityNumberError(null);
                      if (initiateStatus === "error") setInitiateStatus("idle");
                    }}
                    placeholder="e.g. 12345678901"
                    disabled={initiateStatus === "loading"}
                    className={`${inputCls} ${initiateStatus === "loading" ? "opacity-60 cursor-not-allowed" : ""}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleInitiate();
                    }}
                  />
                  {identityNumberError && (
                    <p className={fieldError}>{identityNumberError}</p>
                  )}
                </div>

                {/* Initiate error banner */}
                {initiateStatus === "error" && initiateError && (
                  <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-red-700 dark:text-red-300 font-medium leading-relaxed">
                      {initiateError}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleInitiate}
                    disabled={initiateStatus === "loading"}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-semibold transition-colors duration-150 shadow-sm"
                  >
                    {initiateStatus === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      "Verify Identity →"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Card 2: OTP Validation ────────────────────────────────────── */}
        <div
          className={[
            "rounded-xl border transition-all duration-300 overflow-hidden",
            !card2Active
              ? "border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 opacity-60"
              : validateStatus === "success"
                ? "border-[#349C93]/40 bg-[#F0FBF9] dark:bg-teal-950"
                : "border-[#D6E8F5] dark:border-neutral-800 bg-[#EBF4FF] dark:bg-neutral-900",
          ].join(" ")}
        >
          {/* Card 2 Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div
                className={[
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold",
                  !card2Active
                    ? "bg-gray-200 text-gray-400 dark:bg-neutral-700 dark:text-neutral-500"
                    : validateStatus === "success"
                      ? "bg-[#349C93] text-white"
                      : "bg-[#1A5888] text-white",
                ].join(" ")}
              >
                {validateStatus === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  "2"
                )}
              </div>
              <div>
                <p
                  className={[
                    "text-[13px] font-semibold",
                    card2Active ? "text-neutral-800 dark:text-neutral-100" : "text-neutral-400",
                  ].join(" ")}
                >
                  OTP Verification
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {!card2Active
                    ? "Complete step 1 first"
                    : validateStatus === "success"
                      ? "OTP verified successfully"
                      : "Enter the OTP sent to your BVN"}
                </p>
              </div>
            </div>
            {!card2Active && (
              <div className="h-5 w-5 rounded-full border-2 border-gray-200" />
            )}
            {validateStatus === "success" && (
              <span className="inline-flex items-center gap-1.5 bg-[#349C93]/10 border border-[#349C93]/30 text-[#0F766E] text-[11px] font-semibold px-3 py-1 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Confirmed
              </span>
            )}
          </div>

          {/* Card 2 Body — only shown when card 1 is done */}
          {card2Active && validateStatus !== "success" && (
            <div className="px-6 pb-6 border-t border-[#D6E8F5] dark:border-neutral-800">
              <div className="pt-5 space-y-4">
                {/* Info note */}
                <div className="flex items-start gap-2.5 bg-[#DAE8F3] dark:bg-neutral-800 rounded-lg px-4 py-3">
                  <KeyRound className="h-4 w-4 text-[#1A5888] dark:text-[#5AA6D6] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#1A5888] dark:text-[#5AA6D6] font-medium leading-relaxed">
                    An OTP has been sent to the phone number associated with your{" "}
                    <strong>BVN</strong>. Please enter it below to confirm.
                  </p>
                </div>

                {/* OTP input */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5">
                    One-Time Password (OTP) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="otp-input"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(val);
                      setOtpError(null);
                      if (validateStatus === "error") setValidateStatus("idle");

                      // Auto-submit once the code is fully entered.
                      if (val.length === 6 && validateStatus !== "loading") {
                        handleValidate(val);
                      }
                    }}
                    placeholder="Enter 6-digit OTP"
                    disabled={validateStatus === "loading"}
                    className={`${inputCls} tracking-[0.3em] text-center font-semibold text-lg ${
                      validateStatus === "loading" ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleValidate();
                    }}
                  />
                  {otpError && <p className={fieldError}>{otpError}</p>}
                </div>

                {/* Validate error banner */}
                {validateStatus === "error" && validateError && (
                  <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-red-700 dark:text-red-300 font-medium leading-relaxed">
                      {validateError}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleValidate()}
                    disabled={validateStatus === "loading"}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-semibold transition-colors duration-150 shadow-sm"
                  >
                    {validateStatus === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validating…
                      </>
                    ) : (
                      "Confirm OTP →"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </HospitalOnboardingLayout>
  );
}
