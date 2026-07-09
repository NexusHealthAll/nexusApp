import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { Mail, Check, AlertCircle, CheckCircle2 } from "lucide-react";

import { useAuthStore } from "@/shared/auth/store/authStore";
import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";

export function EmailLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean(
    (location.state as { justRegistered?: boolean } | null)?.justRegistered,
  );

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [healthWorkerFallback, setHealthWorkerFallback] = useState(false);

  const { pendingEmail, clearPendingEmail } = useAuthStore();

  // Animation + autofill on mount
  useEffect(() => {
    setIsVisible(true);

    if (pendingEmail) {
      setEmail(pendingEmail);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsValidEmail(emailRegex.test(pendingEmail));

      // Clear after reading so it doesn't keep refilling
      clearPendingEmail();
    }

    // Auto-focus on email input
    const timer = setTimeout(() => {
      const emailInput = document.querySelector(
        'input[type="email"]',
      ) as HTMLInputElement | null;
      if (emailInput) emailInput.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, [pendingEmail, clearPendingEmail]);

  const activeAuthFlow = useAuthStore((s) => s.activeAuthFlow);
  const roleFromStore = activeAuthFlow?.role ?? null;

  const handleSendOTP = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!isValidEmail) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setHealthWorkerFallback(false);

    try {
      // Registration uses the clinician-onboarding OTP endpoints; signing in
      // to an existing account always goes through the normal auth OTP
      // endpoint, regardless of role.
      const shouldUseCliniciansOtp =
        roleFromStore === "health-worker" && activeAuthFlow?.action === "register";
      const otpSendPath = shouldUseCliniciansOtp
        ? "/api/v1/clinicians/otp/send"
        : "/api/v1/auth/otp/send";

      await apiClient.post(otpSendPath, { email });

      // Persist email so the verify-otp screen can read it
      localStorage.setItem("pendingEmail", email);
      navigate("/auth/verify-otp");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message ||
            `Failed to send OTP (${err.status}). Please try again.`,
        );
      } else {
        setError("Network error — please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    // Real-time email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(value));

    if (error) {
      setError("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email.trim() && isValidEmail && !isLoading) {
      handleSendOTP(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3FAFF] via-[#F8FBFF] to-[#EDF7FF] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main Login Card with enhanced shadows and animations */}
        <Card
          className={`bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl shadow-blue-500/10 rounded-3xl overflow-hidden min-h-[90vh] sm:min-h-[80vh] flex flex-col transition-all duration-700 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Header with Logo */}
          <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-gray-100/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="transition-transform duration-300 hover:scale-105">
                <NexusCareLogo size="sm" />
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
                <div className="w-2 h-2 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="bg-white/80 backdrop-blur-sm px-6 pb-2">
            <div className="w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue h-full rounded-full w-1/4 transition-all duration-1000 ease-out shadow-sm"></div>
            </div>
          </div>

          <CardContent className="px-6 py-8 flex-1 flex flex-col justify-center">
            {justRegistered && (
              <div className="mb-8 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Account created
                  </p>
                  <p className="text-sm text-green-700">
                    Log in with the email you just verified to finish setting
                    up your profile.
                  </p>
                </div>
              </div>
            )}
            {/* Welcome Section with staggered animation */}
            <div
              className={`text-center mb-12 transition-all duration-700 delay-200 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <h1 className="text-4xl sm:text-3xl font-bold bg-gradient-to-r from-onboarding-textPrimary to-gray-700 bg-clip-text text-transparent mb-4">
                Start your professional journey.
              </h1>
              <p className="text-lg sm:text-base text-onboarding-textSecondary leading-relaxed">
                Enter your work email to begin.
              </p>
            </div>

            <form
              onSubmit={handleSendOTP}
              className={`space-y-8 transition-all duration-700 delay-400 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              {/* Enhanced Email Input Section */}
              <div className="space-y-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500 transition-colors duration-200">
                  Work Email
                </label>

                {/* Email Input Container with enhanced styling */}
                <div
                  className={`relative flex items-center gap-3 rounded-xl px-4 py-4 transition-all duration-300 ease-out ${
                    email
                      ? "bg-onboarding-inputBackground shadow-inner"
                      : "bg-onboarding-inputBackground"
                  } ${
                    error
                      ? "ring-2 ring-red-200 bg-red-50/50"
                      : isValidEmail && email
                        ? "ring-2 ring-green-200 bg-green-50/50"
                        : "focus-within:ring-2 focus-within:ring-blue-200 focus-within:bg-blue-50/30"
                  }`}
                >
                  {/* Email Icon with animation */}
                  <Mail
                    className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                      error
                        ? "text-red-500"
                        : isValidEmail && email
                          ? "text-green-500"
                          : "text-secondary-600"
                    }`}
                  />

                  {/* Email Input */}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-transparent text-base text-neutral-800 placeholder:text-neutral-400 outline-none transition-all duration-200"
                    placeholder="name@medicalcenter.com"
                  />

                  {/* Validation Icon */}
                  {email && (
                    <div className="transition-all duration-300 ease-out">
                      {isValidEmail ? (
                        <Check className="h-5 w-5 text-green-500 animate-in fade-in duration-200" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 animate-in fade-in duration-200" />
                      )}
                    </div>
                  )}
                </div>

                {/* Enhanced Error Display */}
                {error && (
                  <div className="animate-in slide-in-from-left-2 duration-300">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  </div>
                )}

                {healthWorkerFallback && !error && (
                  <div className="animate-in slide-in-from-left-2 duration-300">
                    <p className="text-sm text-neutral-800 mb-3">
                      Click continue to register worker with otp.
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Continue Button */}
              <Button
                type="submit"
                disabled={isLoading || !email.trim() || !isValidEmail}
                className={`w-full rounded-xl py-5 text-base font-semibold uppercase tracking-widest text-white transition-all duration-300 ease-out transform ${
                  isLoading || !email.trim() || !isValidEmail
                    ? "bg-gray-300 cursor-not-allowed scale-100"
                    : "bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Continue</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                )}
              </Button>

              {/* Enhanced Security Notice */}
              <div className="flex items-center justify-center space-x-2 text-sm text-onboarding-textSecondary transition-opacity duration-300 hover:opacity-80">
                <svg
                  className="w-4 h-4 transition-transform duration-200 hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secure OTP will be sent to your email.</span>
              </div>
            </form>

            {/* Create Account CTA removed per requirements */}
            <div className="mt-10" />

            {/* Enhanced Footer Text */}
            <div
              className={`mt-8 pt-6 border-t border-gray-100/50 flex-shrink-0 transition-all duration-700 delay-700 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium text-center">
                Trusted by Healthcare Professionals Across Nigeria
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
