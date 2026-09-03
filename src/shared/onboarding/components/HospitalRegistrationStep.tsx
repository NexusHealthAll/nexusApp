import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useRoleBasePath } from "@/shared/onboarding/hooks/useRoleBasePath";
import { OnboardingNavbar } from "./OnboardingNavbar";
import { StepTracker } from "@/shared/components/ui/StepTracker";
import {
  hospitalRegistrationSchema,
  type HospitalRegistrationValues,
} from "@/shared/onboarding/onboardingSchemas";

const fieldError = "mt-1 text-[11px] text-red-500";

export function HospitalRegistrationStep() {
  const navigate = useNavigate();
  const basePath = useRoleBasePath();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HospitalRegistrationValues>({
    resolver: zodResolver(hospitalRegistrationSchema),
    defaultValues: {
      hospitalName: "Lagos University Teaching Hospital",
      registrationNumber: "RC-1234567",
      email: "admin@luth.gov.ng",
      address: "Idi-Araba, Surulere, Lagos",
      phoneNumber: "+234 123 456 7890",
    },
  });

  function onValid() {
    navigate(`${basePath}/onboarding/legal-verification`);
  }

  return (
    <div className="min-h-screen bg-[#F3FAFF] dark:bg-neutral-950">
      {/* Top Navigation */}
      <OnboardingNavbar />

      <div className="mx-auto max-w-2xl px-4 pt-8 mt-8 mb-6">
        <StepTracker activeIndex={0} />
      </div>

      {/* Main Card */}
      <div className="mx-auto max-w-2xl px-4 pb-8">
        <div className="rounded-2xl bg-white p-7 shadow-md py-10 dark:bg-neutral-900">
          <h1 className="mb-1 text-2xl font-bold text-onboarding-textPrimary dark:text-neutral-50">
            Hospital Registration
          </h1>
          <p className="mb-6 text-sm text-onboarding-textSecondary dark:text-neutral-400">
            Please verify and complete your institutional credentials to
            continue with staffing excellence.
          </p>

          <form onSubmit={handleSubmit(onValid)} noValidate>
            <div className="space-y-5">
              {/* Hospital Name */}
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Hospital Name
                </label>
                <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5 dark:bg-neutral-800">
                  <SquarePlus className="h-4 w-4 flex-shrink-0 text-secondary-600" />
                  <input
                    type="text"
                    {...register("hospitalName")}
                    className="flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
                    placeholder="Enter hospital name"
                  />
                </div>
                {errors.hospitalName && <p className={fieldError}>{errors.hospitalName.message}</p>}
              </div>

              {/* Registration Number + Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    Registration Number
                  </label>
                  <div className="flex items-center gap-2 rounded-lg bg-onboarding-inputBackground px-3 py-2.5 dark:bg-neutral-800">
                    <FileText className="h-4 w-4 flex-shrink-0 text-secondary-600" />
                    <input
                      type="text"
                      {...register("registrationNumber")}
                      className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 outline-none dark:text-neutral-100"
                      placeholder="RC-XXXXXXX"
                    />
                  </div>
                  {errors.registrationNumber && <p className={fieldError}>{errors.registrationNumber.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    Email
                  </label>
                  <div className="flex items-center gap-2 rounded-lg bg-onboarding-inputBackground px-3 py-2.5 dark:bg-neutral-800">
                    <Mail className="h-4 w-4 flex-shrink-0 text-secondary-600" />
                    <input
                      type="email"
                      {...register("email")}
                      className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 outline-none dark:text-neutral-100"
                      placeholder="admin@hospital.org"
                    />
                  </div>
                  {errors.email && <p className={fieldError}>{errors.email.message}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Address
                </label>
                <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5 dark:bg-neutral-800">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-secondary-600" />
                  <input
                    type="text"
                    {...register("address")}
                    className="flex-1 bg-transparent text-sm text-neutral-800 outline-none dark:text-neutral-100"
                    placeholder="Street, City, State"
                  />
                </div>
                {errors.address && <p className={fieldError}>{errors.address.message}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Phone Number
                </label>
                <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5 dark:bg-neutral-800">
                  <Phone className="h-4 w-4 flex-shrink-0 text-secondary-600" />
                  <input
                    type="tel"
                    {...register("phoneNumber")}
                    className="flex-1 bg-transparent text-sm text-neutral-800 outline-none dark:text-neutral-100"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
                {errors.phoneNumber && <p className={fieldError}>{errors.phoneNumber.message}</p>}
              </div>
            </div>

            <Button
              type="submit"
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest"
            >
              Continue
            </Button>
          </form>
          <p className="mt-3 text-center text-[11px] text-onboarding-textSecondary dark:text-neutral-400">
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
              className="flex flex-col gap-2 rounded-xl bg-onboarding-fadedGreen/80 p-4 shadow-sm dark:bg-neutral-900"
            >
              <Icon className="mb-2 h-5 w-5 text-secondary-600 dark:text-secondary-400" />
              <p className="mb-1 text-sm font-semibold text-onboarding-textPrimary dark:text-neutral-50">
                {title}
              </p>
              <p className="text-[11px] text-onboarding-textSecondary dark:text-neutral-400">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 space-y-2 text-center">
          <div className="flex justify-center gap-4 text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            <a href="#" className="hover:text-neutral-600 dark:hover:text-neutral-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-neutral-600 dark:hover:text-neutral-300">
              Terms of Service
            </a>
            <a href="#" className="hover:text-neutral-600 dark:hover:text-neutral-300">
              Help Center
            </a>
          </div>
          <p className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            © 2024 Lagos University Teaching Hospital. Editorial Excellence in
            Clinical Staffing.
          </p>
        </div>
      </div>
    </div>
  );
}
