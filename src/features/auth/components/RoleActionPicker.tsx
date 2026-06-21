import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { Building2, Stethoscope, ArrowRight } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { PATHS } from "@/routes/paths";

type Role = "hospital" | "health-worker";
type Action = "register" | "login";

type OptionCardProps = {
  title: string;
  description: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
};

function OptionCard({
  title,
  description,
  active,
  icon,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 ease-out w-full ${
        active
          ? "border-teal-400 bg-teal-50/80 shadow-lg shadow-teal-200/50"
          : "border-gray-200 bg-white/70 hover:border-gray-300 hover:bg-white"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
            active
              ? "bg-gradient-to-br from-teal-100 to-teal-200"
              : "bg-gray-50"
          }`}
        >
          {icon}
        </div>
        <div>
          <div className="font-bold text-onboarding-textPrimary text-lg mb-1">
            {title}
          </div>
          <div className="text-sm text-onboarding-textSecondary leading-relaxed">
            {description}
          </div>
        </div>
      </div>
    </button>
  );
}

export function RoleActionPicker() {
  const navigate = useNavigate();
  const { setActiveAuthFlow } = useAuthStore();

  const [role, setRole] = useState<Role | null>(null);
  const [action, setAction] = useState<Action | null>(null);

  const selectedLabel = useMemo(() => {
    if (!role || !action) return "";
    return `${role} · ${action}`;
  }, [role, action]);

  const onContinue = async () => {
    if (!role || !action) return;

    setActiveAuthFlow({ role, action, origin: "landing" });

    if (role === "hospital") {
      if (action === "login") {
        navigate("/auth/login");
        return;
      }

      // hospital/register: onboarding first
      navigate(PATHS.hospital.onboarding.registration);
      return;
    }

    // health-worker
    if (action === "login") {
      navigate("/auth/login");
      return;
    }

    // health-worker/register: emailLogin first (OTP endpoints use clinicians)
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3FAFF] via-[#F8FBFF] to-[#EDF7FF] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-center">
          <NexusCareLogo size="sm" />
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-onboarding-textPrimary to-gray-700 bg-clip-text text-transparent">
              Welcome
            </h1>
            <p className="mt-2 text-onboarding-textSecondary">
              Choose your role and what you want to do.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Role
                </div>
                <OptionCard
                  title="Hospital"
                  description="Register your hospital or sign in to manage your facility."
                  active={role === "hospital"}
                  icon={<Building2 className="w-6 h-6 text-gray-700" />}
                  onClick={() => {
                    setRole("hospital");
                  }}
                />
                <OptionCard
                  title="Health Worker"
                  description="Sign in to start working or register as a clinician."
                  active={role === "health-worker"}
                  icon={<Stethoscope className="w-6 h-6 text-teal-700" />}
                  onClick={() => {
                    setRole("health-worker");
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Action
                </div>
                <OptionCard
                  title="Register"
                  description="Create your account and complete onboarding."
                  active={action === "register"}
                  icon={<span className="text-2xl">✨</span>}
                  onClick={() => setAction("register")}
                />
                <OptionCard
                  title="Login"
                  description="Use OTP to sign in."
                  active={action === "login"}
                  icon={<span className="text-2xl">🔐</span>}
                  onClick={() => setAction("login")}
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="text-sm text-onboarding-textSecondary">
                {selectedLabel ? `Selected: ${selectedLabel}` : ""}
              </div>
              <Button
                onClick={onContinue}
                disabled={!role || !action}
                className="rounded-xl py-4 text-base font-semibold uppercase tracking-widest text-white transition-all duration-300 ease-out transform disabled:opacity-50 bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="flex items-center justify-center space-x-2 group">
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
