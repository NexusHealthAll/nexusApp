import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authUtils } from "../utils/authUtils";

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Show splash for at least 2 seconds for branding
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (authUtils.isAuthenticated()) {
        const user = authUtils.getCurrentUser();
        if (user?.role === "medical-staff") {
          navigate("/medical-staff/dashboard");
        } else if (user?.role === "hospital_admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/auth/login");
        }
      } else {
        navigate("/auth/login");
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center">
      <div className="text-center">
        {/* Brand Text */}
        <div className="mb-8 animate-pulse">
          <img
            src="/AUTH LOGO/nexus signup.png"
            alt="NexusCare"
            className="h-32 w-auto mx-auto"
          />
        </div>

        <p className="text-xl text-blue-100 font-medium mb-8 animate-fade-in-delay">
          Clinical Precision. Digital Care.
        </p>

        {/* Loading Indicator */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
