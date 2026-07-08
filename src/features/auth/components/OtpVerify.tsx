import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { ArrowLeft } from "lucide-react";

import { useAuthStore, type AuthUser } from "@/features/auth/store/authStore";
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
          navigate("/medical-staff/dashboard");
          return;
        }

        // health-worker/register => account created, but the registration
        // response isn't a usable session (see note above). Send them to a
        // real login instead of straight into the app; keep the clinician
        // id around so the post-login onboarding steps know which profile
        // to complete, and prefill the email on the login screen.
        if (body.clinician_id) {
          useAuthStore.getState().setClinicianId(body.clinician_id);
        }
        clearFlow();
        useAuthStore.getState().setPendingEmail(email);
        navigate("/auth/login", { state: { justRegistered: true } });
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

    const email = localStorage.getItem("pendingEmail") ?? "";

    setCanResend(false);
    setResendTimer(60);
    setError("");

    try {
      await apiClient.post("/api/v1/auth/otp/send", { email });

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
    <div className="min-h-screen bg-[#F3FAFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/auth/login")}
          className="flex items-center space-x-2 text-onboarding-textSecondary hover:text-onboarding-textPrimary mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <NexusCareLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-onboarding-textPrimary mb-2">
            Verify Identity
          </h1>
          <p className="text-onboarding-textSecondary">
            We've sent a 6-digit code to{" "}
            <span className="font-semibold text-onboarding-textPrimary">
              {phoneNumber}
            </span>
          </p>
        </div>

        {/* OTP Verification Card */}
        <Card className="bg-white border-slate-100 shadow-md rounded-2xl">
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
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 text-center">
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
                      className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all ${
                        error
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : digit
                            ? "border-secondary-500 bg-secondary-50"
                            : "border-slate-200"
                      }`}
                      maxLength={1}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center flex items-center justify-center space-x-1">
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
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Resend Code
                </button>
              ) : (
                <p className="text-sm text-slate-500">
                  Resend code in{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.floor(resendTimer / 60)}:
                    {(resendTimer % 60).toString().padStart(2, "0")}
                  </span>
                </p>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                Didn't receive the code?{" "}
                <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
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
