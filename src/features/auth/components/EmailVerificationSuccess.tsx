import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import {
  Check,
  RefreshCw,
  ArrowRight,
  Lock,
  BarChart3,
  Repeat,
  Sparkles,
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";

export function EmailVerificationSuccess() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  // Staggered animations
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setShowFeatures(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleContinueToDashboard = async () => {
    setIsLoading(true);

    // Save verified email to zustand so login can autofill it
    // (EmailLogin reads this and then clears it)
    // If pendingEmail is empty, login will show an empty email field.
    // Use pendingEmail from localStorage (already set in EmailLogin)
    const pendingEmail = localStorage.getItem("pendingEmail") ?? "";

    // Store into zustand
    const { setPendingEmail } = useAuthStore.getState();
    setPendingEmail(pendingEmail);

    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Continue to login; login will autofill email from zustand store
      navigate("/auth/login");
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3FAFF] via-[#F8FBFF] to-[#EDF7FF] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main Verification Card with enhanced effects */}
        <Card
          className={`bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl shadow-green-500/10 rounded-3xl overflow-hidden min-h-[90vh] sm:min-h-[80vh] flex flex-col transition-all duration-700 ease-out ${
            isVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-8 opacity-0 scale-95"
          }`}
        >
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-gray-100/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="transition-transform duration-300 hover:scale-105">
                <NexusCareLogo size="sm" />
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-inner">
                <div className="w-2 h-2 bg-gradient-to-br from-green-400 to-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="bg-white/80 backdrop-blur-sm px-6 pb-2">
            <div className="w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue h-full rounded-full w-2/4 transition-all duration-1000 ease-out shadow-sm"></div>
            </div>
          </div>

          <CardContent className="px-6 py-8 text-center flex-1 flex flex-col justify-center">
            {/* Enhanced Success Icon with multiple animations */}
            <div
              className={`mx-auto mb-8 relative transition-all duration-1000 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-8 opacity-0 scale-75"
              }`}
            >
              <div className="w-28 h-28 bg-gradient-to-br from-green-100 via-green-50 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto animate-pulse shadow-lg">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 rounded-xl flex items-center justify-center animate-bounce shadow-inner">
                  <Check
                    className="w-10 h-10 text-white animate-pulse"
                    strokeWidth={3}
                  />
                </div>
              </div>
              {/* Multiple pulsing ring effects */}
              <div className="absolute inset-0 w-28 h-28 bg-green-200 rounded-2xl animate-ping opacity-20 mx-auto"></div>
              <div className="absolute inset-0 w-28 h-28 bg-emerald-300 rounded-2xl animate-ping opacity-10 mx-auto animation-delay-300"></div>

              {/* Sparkle effects */}
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-1 w-4 h-4 text-blue-400 animate-pulse animation-delay-500" />
            </div>

            {/* Enhanced Title with gradient text */}
            <div
              className={`transition-all duration-700 delay-300 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <h1 className="text-3xl font-bold text-onboarding-textPrimary mb-2">
                Email Verification
              </h1>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] bg-clip-text text-transparent mb-6">
                Confirmed.
              </h2>
            </div>

            {/* Enhanced Description */}
            <p
              className={`text-base text-onboarding-textSecondary mb-10 leading-relaxed px-2 transition-all duration-700 delay-500 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              Your email identity has been successfully mapped to our secure
              clinician network.
            </p>

            {/* Enhanced Feature List with staggered animations */}
            <div
              className={`space-y-6 mb-10 transition-all duration-700 delay-700 ease-out ${
                showFeatures
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              {/* Secure Access */}
              <div className="flex items-start space-x-4 text-left bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-100/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-inner">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-onboarding-textPrimary text-base">
                    Secure Access
                  </h3>
                  <p className="text-sm text-onboarding-textSecondary leading-relaxed mt-1">
                    Multi-layer encryption active on your account.
                  </p>
                </div>
              </div>

              {/* Advanced Insights */}
              <div className="flex items-start space-x-4 text-left bg-gradient-to-r from-green-50 to-emerald-100/50 p-4 rounded-xl border border-green-100/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animation-delay-200">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-inner">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-onboarding-textPrimary text-base">
                    Advanced Insights
                  </h3>
                  <p className="text-sm text-onboarding-textSecondary leading-relaxed mt-1">
                    Real-time clinical data and patient performance analytics.
                  </p>
                </div>
              </div>

              {/* Automatic Syncing */}
              <div className="flex items-start space-x-4 text-left bg-gradient-to-r from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-100/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animation-delay-400">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-inner">
                  <Repeat className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-onboarding-textPrimary text-base">
                    Automatic Syncing
                  </h3>
                  <p className="text-sm text-onboarding-textSecondary leading-relaxed mt-1">
                    Cross-platform integration with clinical terminals.
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Continue Button */}
            <Button
              onClick={handleContinueToDashboard}
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-semibold py-5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-base transform hover:scale-[1.02] active:scale-[0.98] ${
                isLoading ? "animate-pulse" : ""
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 group">
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              )}
            </Button>

            {/* Enhanced Verification ID */}
            <div
              className={`mt-8 pt-6 border-t border-gray-100/50 flex-shrink-0 transition-all duration-700 delay-1000 ease-out ${
                showFeatures
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <p className="text-sm text-gray-400 font-mono tracking-wider bg-gray-50/50 px-4 py-2 rounded-lg border border-gray-100/50">
                VERIFICATION ID: NX-992-KLR
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
