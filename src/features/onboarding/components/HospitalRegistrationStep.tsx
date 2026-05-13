import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Headphones,
  Mail,
  MapPin,
  Phone,
  Shield,
  Zap,
  SquarePlus,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useRoleBasePath } from "@/features/onboarding/hooks/useRoleBasePath";
import { OnboardingNavbar } from "./OnboardingNavbar";
import { StepTracker } from "@/shared/components/ui/StepTracker";

interface FormState {
  hospitalName: string;
  registrationNumber: string;
  email: string;
  address: string;
  phoneNumber: string;
}

export function HospitalRegistrationStep() {
  const navigate = useNavigate();
  const basePath = useRoleBasePath();

  const [form, setForm] = useState<FormState>({
    hospitalName: "Lagos University Teaching Hospital",
    registrationNumber: "RC-1234567",
    email: "admin@luth.gov.ng",
    address: "Idi-Araba, Surulere, Lagos",
    phoneNumber: "+234 123 456 7890",
  });

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="min-h-screen bg-[#F3FAFF]">
      {/* Top Navigation */}
      <OnboardingNavbar />

      <div className="mx-auto max-w-2xl px-4 pt-8 mt-8 mb-6">
        <StepTracker activeIndex={0} />
      </div>

      {/* Main Card */}
      <div className="mx-auto max-w-2xl px-4 pb-8">
        <div className="rounded-2xl bg-white p-7 shadow-md py-10">
          <h1 className="mb-1 text-2xl font-bold text-onboarding-textPrimary">
            Hospital Registration
          </h1>
          <p className="mb-6 text-sm text-onboarding-textSecondary">
            Please verify and complete your institutional credentials to
            continue with staffing excellence.
          </p>

          <div className="space-y-5">
            {/* Hospital Name */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                Hospital Name
              </label>
              <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                <SquarePlus className="h-4 w-4 flex-shrink-0 text-secondary-600" />
                <input
                  type="text"
                  value={form.hospitalName}
                  onChange={(e) => handleChange("hospitalName", e.target.value)}
                  className="flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
                  placeholder="Enter hospital name"
                />
              </div>
            </div>

            {/* Registration Number + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Registration Number
                </label>
                <div className="flex items-center gap-2 rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                  <FileText className="h-4 w-4 flex-shrink-0 text-secondary-600" />
                  <input
                    type="text"
                    value={form.registrationNumber}
                    onChange={(e) =>
                      handleChange("registrationNumber", e.target.value)
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 outline-none"
                    placeholder="RC-XXXXXXX"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                  <Mail className="h-4 w-4 flex-shrink-0 text-secondary-600" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 outline-none"
                    placeholder="admin@hospital.org"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                Address
              </label>
              <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                <MapPin className="h-4 w-4 flex-shrink-0 text-secondary-600" />
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="flex-1 bg-transparent text-sm text-neutral-800 outline-none"
                  placeholder="Street, City, State"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                Phone Number
              </label>
              <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                <Phone className="h-4 w-4 flex-shrink-0 text-secondary-600" />
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  className="flex-1 bg-transparent text-sm text-neutral-800 outline-none"
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={() =>
              navigate(`${basePath}/onboarding/legal-verification`)
            }
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest"
          >
            Continue
          </Button>
          <p className="mt-3 text-center text-[11px] text-onboarding-textSecondary">
            Information provided here will be subject to verification against
            the CAC register.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {(
            [
              {
                icon: Shield,
                title: "Secure Data",
                desc: "Your data is encrypted with military-grade 256-bit institutional standards.",
              },
              {
                icon: Zap,
                title: "Instant Sync",
                desc: "Direct integration with medical regulatory bodies for rapid verification.",
              },
              {
                icon: Headphones,
                title: "Need Help?",
                desc: "Our clinical concierge team is available 24/7 for onboarding support.",
              },
            ] as const
          ).map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-xl bg-onboarding-fadedGreen/80 p-4 shadow-sm"
            >
              <Icon className="mb-2 h-5 w-5 text-secondary-600" />
              <p className="mb-1 text-sm font-semibold text-onboarding-textPrimary">
                {title}
              </p>
              <p className="text-[11px] text-onboarding-textSecondary">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 space-y-2 text-center">
          <div className="flex justify-center gap-4 text-[11px] uppercase tracking-wider text-neutral-400">
            <a href="#" className="hover:text-neutral-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-neutral-600">
              Terms of Service
            </a>
            <a href="#" className="hover:text-neutral-600">
              Help Center
            </a>
          </div>
          <p className="text-[11px] uppercase tracking-wider text-neutral-400">
            © 2024 Lagos University Teaching Hospital. Editorial Excellence in
            Clinical Staffing.
          </p>
        </div>
      </div>
    </div>
  );
}
