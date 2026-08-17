import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { ArrowLeft } from "lucide-react";

import { useAuthStore, type AuthUser } from "@/shared/auth/store/authStore";
import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";

export function OtpVerify() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get email from previous step
    const pendingEmail = localStorage.getItem("pendingEmail");
    if (!pendingEmail) {
      navigate("/auth/login");
      return;
    }
    setPhoneNumber(pendingEmail); // Reusing phoneNumber state for email

    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Focus first input
    inputRefs.current[0]?.focus();

    return () => clearInterval(timer);
  }, [navigate]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (error) setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (value && index === 5 && newOtp.every((digit) => digit !== "")) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();

      // Auto-verify after paste
      setTimeout(() => {
        handleVerifyOtp(pastedData);
      }, 100);
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp.join("");

    if (codeToVerify.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    const email = localStorage.getItem("pendingEmail") ?? "";

    setIsLoading(true);
    setError("");

    try {
      // Decide which OTP verify endpoint to call based on the current auth flow.
      // - Health-worker registration uses clinicians OTP.
      // - Otherwise, default to normal auth OTP.
      const flowForOtpVerify = useAuthStore.getState().activeAuthFlow;
      const otpVerifyMode =
        flowForOtpVerify?.role === "health-worker" &&
        flowForOtpVerify?.action === "register"
          ? "clinicians"
          : "normal";

      const otpVerifyPath =
        otpVerifyMode === "clinicians"
          ? "/api/v1/clinicians/otp/verify"
          : "/api/v1/auth/otp/verify";

      const { data: body } = await apiClient.post<{
        message?: string;
        access_token?: string;
        refresh_token?: string;
        user?: AuthUser;
        token?: string;
        clinician_id?: string;
        [k: string]: unknown;
      }>(otpVerifyPath, { code: codeToVerify, email });

      // Save auth session (access/refresh tokens + user).
      // Only the real login/verify response (access_token + refresh_token +
      // user) is a usable session — the clinician-registration endpoint
      // returns a token of its own that isn't a full session (no refresh
      // token, different claims shape), so registration deliberately does
      // NOT set a session here; the user logs in for real afterwards.
      if (body.access_token && body.refresh_token && body.user) {
        useAuthStore.getState().setAuthSession({
          accessToken: body.access_token,
          refreshToken: body.refresh_token,
          user: body.user,
        });
      } else if (body.token) {
        // Backward compatibility with older token field
        localStorage.setItem("authToken", body.token as string);
      }

      localStorage.setItem("emailVerified", "true");
      localStorage.removeItem("pendingEmail");

      const userRole =
        body.user?.role ?? useAuthStore.getState().user?.role ?? null;

      if (!flowForOtpVerify) {
        // No stored flow context — most commonly the second, real login right
        // after a fresh clinician registration (activeAuthFlow is cleared
        // once the registration OTP is verified). Route by the verified role
        // instead: health workers with a pending clinicianId still need to
        // complete onboarding before landing on the dashboard.
        if (userRole === "hospital_admin") {
          navigate("/hospital/dashboard");
          return;
        }
        if (userRole === "health_worker") {
          const pendingClinicianId = useAuthStore.getState().clinicianId;
          navigate(
            pendingClinicianId
              ? "/medical-staff/onboarding/identity"
              : "/medical-staff/dashboard",
          );
          return;
        }
        navigate("/auth/verification-success");
        return;
      }

      const { role, action } = flowForOtpVerify;

      const clearFlow = () => {
        useAuthStore.getState().clearActiveAuthFlow();
      };

      // Hospital routes
      if (role === "hospital") {
        if (action === "login") {
          clearFlow();
          navigate("/hospital/dashboard");
          return;
        }

        // hospital/register => after verify, complete hospital onboarding first.
        // Hospital onboarding step will route into shared OTP login when done.
        clearFlow();
        navigate("/hospital/onboarding/registration");
        return;
      }

      // Health-worker routes
      if (role === "health-worker") {
        if (action === "login") {
          clearFlow();
          const pendingClinicianId = useAuthStore.getState().clinicianId;
          navigate(
            pendingClinicianId
              ? "/medical-staff/onboarding/identity"
              : "/medical-staff/dashboard",
          );
          return;
        }

        // health-worker/register => account created. Route through the onboarding
        // flow first (identity verification -> professional profile -> payout setup),
        // after which the user logs in to complete session setup.
        if (body.clinician_id) {
          useAuthStore.getState().setClinicianId(body.clinician_id);
        }
        clearFlow();
        useAuthStore.getState().setPendingEmail(email);
        localStorage.setItem("pendingEmail", email);
        navigate("/medical-staff/onboarding/identity");
        return;
      }

      // Fallback
      clearFlow();
      navigate(
        userRole === "hospital_admin"
          ? "/hospital/dashboard"
          : "/medical-staff/dashboard",
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Invalid verification code. Please try again.");
      } else {
        setError("Network error — please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    const email =
      useAuthStore.getState().pendingEmail ||
      localStorage.getItem("pendingEmail") ||
      "";

    if (!email) {
      setError("Session expired. Please start over from login or signup.");
      return;
    }

    setCanResend(false);
    setResendTimer(60);
    setError("");

    try {
      const flowForOtpVerify = useAuthStore.getState().activeAuthFlow;
      const shouldUseCliniciansOtp =
        flowForOtpVerify?.role === "health-worker" &&
        flowForOtpVerify?.action === "register";

      const otpSendPath = shouldUseCliniciansOtp
        ? "/api/v1/clinicians/otp/send"
        : "/api/v1/auth/otp/send";

      await apiClient.post(otpSendPath, { email });

      // Ensure session email memory remains set
      localStorage.setItem("pendingEmail", email);
      useAuthStore.getState().setPendingEmail(email);

      // Restart countdown timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to resend OTP. Please try again.");
      } else {
        setError("Network error — please check your connection and try again.");
      }
      setCanResend(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3FAFF] dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/auth/login")}
          className="flex items-center space-x-2 text-onboarding-textSecondary dark:text-neutral-400 hover:text-onboarding-textPrimary dark:hover:text-neutral-100 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <NexusCareLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-onboarding-textPrimary dark:text-neutral-50 mb-2">
            Verify Identity
          </h1>
          <p className="text-onboarding-textSecondary dark:text-neutral-400">
            We've sent a 6-digit code to{" "}
            <span className="font-semibold text-onboarding-textPrimary dark:text-neutral-100">
              {phoneNumber}
            </span>
          </p>
        </div>

        {/* OTP Verification Card */}
        <Card className="bg-white border-slate-100 shadow-md rounded-2xl dark:bg-neutral-900 dark:border-neutral-800 dark:shadow-none">
          <CardContent className="p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyOtp();
              }}
              className="space-y-8"
            >
              {/* OTP Input Fields */}
              <div className="space-y-4">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 text-center">
                  Enter Verification Code
                </label>

                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all ${
                        error
                          ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                          : digit
                            ? "border-secondary-500 bg-secondary-50 dark:bg-secondary-950"
                            : "border-slate-200 dark:border-neutral-700"
                      }`}
                      maxLength={1}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center space-x-1">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={isLoading || otp.some((digit) => !digit)}
                isLoading={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>
            </form>

            {/* Resend Code */}
            <div className="mt-6 text-center">
              {canResend ? (
                <button
                  onClick={handleResendOtp}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Resend Code
                </button>
              ) : (
                <p className="text-sm text-slate-500 dark:text-neutral-400">
                  Resend code in{" "}
                  <span className="font-semibold text-slate-700 dark:text-neutral-200">
                    {Math.floor(resendTimer / 60)}:
                    {(resendTimer % 60).toString().padStart(2, "0")}
                  </span>
                </p>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-neutral-500">
                Didn't receive the code?{" "}
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                  Contact Support
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
