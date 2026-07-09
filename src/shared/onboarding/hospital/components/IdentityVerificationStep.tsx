import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
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
  "w-full rounded-lg bg-[#DAE8F3] border border-transparent px-3.5 py-2.5 text-sm text-neutral-800 outline-none " +
  "focus:ring-2 focus:ring-[#349C93]/40 focus:border-[#349C93] focus:bg-[#D0E5F2] " +
  "hover:bg-[#D0E5F2] transition-all duration-200 placeholder:text-neutral-400";

const fieldError = "mt-1.5 text-[11px] text-red-500";

// ─── Identity type options ────────────────────────────────────────────────────

const IDENTITY_OPTIONS = [
  { value: "BVN", label: "BVN — Bank Verification Number" },
  { value: "NIN", label: "NIN — National Identification Number" },
];

// ─── Custom Dropdown ──────────────────────────────────────────────────────────

interface IdentityDropdownProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

function IdentityDropdown({ value, onChange, disabled }: IdentityDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = IDENTITY_OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          "w-full flex items-center justify-between rounded-lg bg-[#DAE8F3] border px-3.5 py-2.5 text-sm outline-none transition-all duration-200",
          open ? "ring-2 ring-[#349C93]/40 border-[#349C93] bg-[#D0E5F2]" : "border-transparent",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#D0E5F2] cursor-pointer",
        ].join(" ")}
      >
        <span className={selected ? "text-neutral-800" : "text-neutral-400"}>
          {selected ? selected.label : "Select identity type…"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-white border border-gray-200 shadow-xl overflow-hidden">
          <ul className="py-1">
            {IDENTITY_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={[
                    "w-full text-left px-4 py-3 text-[13px] transition-colors duration-100",
                    opt.value === value
                      ? "bg-[#E8F5F4] text-[#0F766E] font-semibold"
                      : "text-neutral-700 hover:bg-[#F0F9F8]",
                  ].join(" ")}
                >
                  <span className="font-bold mr-1">{opt.value}</span>
                  <span className="text-neutral-500 text-[12px]">
                    — {opt.value === "BVN" ? "Bank Verification Number" : "National Identification Number"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type InitiateStatus = "idle" | "loading" | "success" | "error";
type ValidateStatus = "idle" | "loading" | "success" | "error";

export function IdentityVerificationStep() {
  const navigate = useNavigate();
  const { formData, reset } = useOnboarding();
  const hospitalId = formData.hospitalId;

  // ── Card 1 state ─────────────────────────────────────────────────────────
  const [identityType, setIdentityType] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [initiateStatus, setInitiateStatus] = useState<InitiateStatus>("idle");
  const [initiateError, setInitiateError] = useState<string | null>(null);
  const [identityTypeError, setIdentityTypeError] = useState<string | null>(null);
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
    let valid = true;
    if (!identityType) {
      setIdentityTypeError("Please select an identity type");
      valid = false;
    } else {
      setIdentityTypeError(null);
    }
    if (!identityNumber.trim()) {
      setIdentityNumberError("Please enter your identity number");
      valid = false;
    } else {
      setIdentityNumberError(null);
    }
    if (!valid) return;

    setInitiateError(null);
    setInitiateStatus("loading");

    try {
      await apiClient.post(`/api/v1/hospitals/${hospitalId}/identity/initiate`, {
        number: identityNumber.trim(),
        type: identityType,
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
  async function handleValidate() {
    if (!otp.trim()) {
      setOtpError("Please enter the OTP sent to you");
      return;
    }
    setOtpError(null);
    setValidateError(null);
    setValidateStatus("loading");

    try {
      await apiClient.post(`/api/v1/hospitals/${hospitalId}/identity/validate`, {
        otp: otp.trim(),
        type: identityType,
      });
      setValidateStatus("success");
      reset();
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
          <div className="h-10 w-10 rounded-xl bg-[#EBF4FF] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-[#1A5888]" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-neutral-900 leading-tight">
              Identity Verification
            </h1>
            <p className="text-[13px] text-neutral-500 leading-relaxed">
              Verify your identity to complete hospital registration.
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
              ? "border-[#349C93]/40 bg-[#F0FBF9]"
              : "border-[#D6E8F5] bg-[#EBF4FF]",
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
                <p className="text-[13px] font-semibold text-neutral-800">
                  Identity Details
                </p>
                <p className="text-[11px] text-neutral-500">
                  {card1Done
                    ? `${identityType} verified successfully`
                    : "Select your identity type and enter your number"}
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
            <div className="px-6 pb-6 border-t border-[#D6E8F5]">
              <div className="pt-5 space-y-4">
                {/* Identity type dropdown */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
                    Identity Type <span className="text-red-500">*</span>
                  </label>
                  <IdentityDropdown
                    value={identityType}
                    onChange={(v) => {
                      setIdentityType(v);
                      setIdentityTypeError(null);
                    }}
                    disabled={initiateStatus === "loading"}
                  />
                  {identityTypeError && (
                    <p className={fieldError}>{identityTypeError}</p>
                  )}
                </div>

                {/* Identity number input */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
                    {identityType ? `${identityType} Number` : "Identity Number"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="identity-number"
                    value={identityNumber}
                    onChange={(e) => {
                      setIdentityNumber(e.target.value);
                      setIdentityNumberError(null);
                      if (initiateStatus === "error") setInitiateStatus("idle");
                    }}
                    placeholder={
                      identityType === "BVN"
                        ? "e.g. 12345678901"
                        : identityType === "NIN"
                          ? "e.g. 12345678901"
                          : "Enter your identity number"
                    }
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
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-red-700 font-medium leading-relaxed">
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
              ? "border-gray-200 bg-white opacity-60"
              : validateStatus === "success"
                ? "border-[#349C93]/40 bg-[#F0FBF9]"
                : "border-[#D6E8F5] bg-[#EBF4FF]",
          ].join(" ")}
        >
          {/* Card 2 Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div
                className={[
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold",
                  !card2Active
                    ? "bg-gray-200 text-gray-400"
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
                    card2Active ? "text-neutral-800" : "text-neutral-400",
                  ].join(" ")}
                >
                  OTP Verification
                </p>
                <p className="text-[11px] text-neutral-500">
                  {!card2Active
                    ? "Complete step 1 first"
                    : validateStatus === "success"
                      ? "OTP verified successfully"
                      : `Enter the OTP sent to your ${identityType}`}
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
            <div className="px-6 pb-6 border-t border-[#D6E8F5]">
              <div className="pt-5 space-y-4">
                {/* Info note */}
                <div className="flex items-start gap-2.5 bg-[#DAE8F3] rounded-lg px-4 py-3">
                  <KeyRound className="h-4 w-4 text-[#1A5888] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#1A5888] font-medium leading-relaxed">
                    An OTP has been sent to the phone number associated with your{" "}
                    <strong>{identityType}</strong>. Please enter it below to confirm.
                  </p>
                </div>

                {/* OTP input */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
                    One-Time Password (OTP) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="otp-input"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setOtp(val);
                      setOtpError(null);
                      if (validateStatus === "error") setValidateStatus("idle");
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
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-red-700 font-medium leading-relaxed">
                      {validateError}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleValidate}
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
