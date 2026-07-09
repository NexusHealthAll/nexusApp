import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { Stethoscope, Building2, ArrowRight, Sparkles } from "lucide-react";

type Role = "health-worker" | "hospital" | null;

export function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showCards, setShowCards] = useState(false);

  // Staggered animations
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setShowCards(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsLoading(true);

    try {
      // Store selected role
      localStorage.setItem("selectedRole", selectedRole);

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Route based on selected role
      if (selectedRole === "health-worker") {
        // Route to auth onboarding pipeline (unprotected)
        navigate("/auth/onboarding/professional-profile");
      } else if (selectedRole === "hospital") {
        // Create temporary auth token for hospital administrator
        const tempAuthToken = `temp_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tempUserData = {
          id: `user_${Date.now()}`,
          fullName: "Hospital Administrator",
          email: localStorage.getItem("pendingEmail") || "",
          role: "hospital_admin",
          onboardingComplete: false, // They still need to complete onboarding
          createdAt: new Date().toISOString(),
        };

        console.log("Creating hospital admin auth:", {
          tempAuthToken,
          tempUserData,
        });

        localStorage.setItem("authToken", tempAuthToken);
        localStorage.setItem("userData", JSON.stringify(tempUserData));
        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("emailVerified");

        // Route to hospital onboarding flow
        navigate("/hospital/onboarding/registration");
      }
    } catch (error) {
      console.error("Role selection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3FAFF] via-[#F8FBFF] to-[#EDF7FF] flex flex-col">
      {/* Header with Logo */}
      <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-gray-100/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="transition-transform duration-300 hover:scale-105">
            <NexusCareLogo size="sm" />
          </div>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-inner">
            <div className="w-2 h-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm px-6 pb-2">
        <div className="w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue h-full rounded-full w-3/4 transition-all duration-1000 ease-out shadow-sm"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Enhanced Title with staggered animation */}
          <div
            className={`text-center mb-12 transition-all duration-700 delay-200 ease-out ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div className="relative inline-block">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-onboarding-textPrimary to-gray-700 bg-clip-text text-transparent mb-4">
                Choose Your Professional Role
              </h1>
              <Sparkles className="absolute -top-2 -right-4 w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-base text-onboarding-textSecondary px-4 leading-relaxed max-w-2xl mx-auto">
              Select your medical specialization to view clinical opportunities
              tailored to your expertise.
            </p>
          </div>

          {/* Role Selection - Standalone Cards without Container */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto transition-all duration-700 delay-400 ease-out ${
              showCards
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            {/* Health Workers Card - Standalone */}
            <div
              onClick={() => handleRoleSelect("health-worker")}
              className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-out text-center transform hover:scale-[1.02] ${
                selectedRole === "health-worker"
                  ? "border-teal-400 bg-teal-50/80 shadow-lg shadow-teal-200/50"
                  : "border-gray-200 bg-transparent hover:border-gray-300 hover:bg-white/30"
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
                    selectedRole === "health-worker"
                      ? "bg-gradient-to-br from-teal-100 to-teal-200"
                      : "bg-gradient-to-br from-teal-50 to-teal-100"
                  }`}
                >
                  <Stethoscope
                    className={`w-10 h-10 transition-all duration-300 ${
                      selectedRole === "health-worker"
                        ? "text-teal-700 scale-110"
                        : "text-teal-600"
                    }`}
                  />
                </div>
                <h3 className="font-bold text-onboarding-textPrimary mb-4 text-xl">
                  Health Workers
                </h3>
                <p className="text-sm text-onboarding-textSecondary leading-relaxed mb-6 px-4">
                  Medical professionals providing direct patient care,
                  consultations, and clinical services.
                </p>

                {/* Feature List */}
                <div className="space-y-3 text-left w-full">
                  {[
                    "Direct patient consultations",
                    "Clinical assessments",
                    "Treatment planning",
                  ].map((feature, index) => (
                    <div
                      key={feature}
                      className={`flex items-center space-x-3 transition-all duration-300 delay-${index * 100}`}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                      <span className="text-sm text-onboarding-textSecondary">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hospital Administrator Card - Standalone */}
            <div
              onClick={() => handleRoleSelect("hospital")}
              className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-out text-center transform hover:scale-[1.02] ${
                selectedRole === "hospital"
                  ? "border-teal-400 bg-teal-50/80 shadow-lg shadow-teal-200/50"
                  : "border-gray-200 bg-transparent hover:border-gray-300 hover:bg-white/30"
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
                    selectedRole === "hospital"
                      ? "bg-gradient-to-br from-gray-100 to-gray-200"
                      : "bg-gradient-to-br from-gray-50 to-gray-100"
                  }`}
                >
                  <Building2
                    className={`w-10 h-10 transition-all duration-300 ${
                      selectedRole === "hospital"
                        ? "text-gray-700 scale-110"
                        : "text-gray-600"
                    }`}
                  />
                </div>
                <h3 className="font-bold text-onboarding-textPrimary mb-4 text-xl">
                  Hospital Administrator
                </h3>
                <p className="text-sm text-onboarding-textSecondary leading-relaxed mb-6 px-4">
                  Healthcare facility management, staff coordination, and
                  operational oversight.
                </p>

                {/* Feature List */}
                <div className="space-y-3 text-left w-full">
                  {[
                    "Staff management",
                    "Shift scheduling",
                    "Resource allocation",
                  ].map((feature, index) => (
                    <div
                      key={feature}
                      className={`flex items-center space-x-3 transition-all duration-300 delay-${index * 100}`}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"></div>
                      <span className="text-sm text-onboarding-textSecondary">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Continue Button */}
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleContinue}
              disabled={!selectedRole || isLoading}
              className={`w-full font-medium py-4 rounded-xl transition-all duration-300 ease-out transform ${
                selectedRole
                  ? "bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue text-white hover:opacity-90 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              } ${isLoading ? "animate-pulse" : ""}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Continue</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 group">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              )}
            </Button>

            {/* Enhanced Support Link */}
            <p
              className={`text-sm text-onboarding-textSecondary text-center mt-6 leading-relaxed transition-all duration-700 delay-800 ease-out ${
                showCards
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              Need help choosing your role?{" "}
              <button className="text-secondary-600 hover:text-secondary-700 font-medium transition-colors duration-200 hover:underline">
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
