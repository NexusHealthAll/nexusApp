import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, ShieldCheck, Mail, Phone, User } from "lucide-react";
import { HospitalOnboardingLayout } from "./HospitalOnboardingLayout";
import { useOnboarding } from "../context/OnboardingContext";
import { authUtils } from "@/shared/auth/utils/authUtils";
import {
  hospitalDetailsSchema,
  normalizePhone,
  type HospitalDetailsValues,
} from "@/shared/onboarding/onboardingSchemas";

const inputCls =
  "w-full rounded-lg bg-[#DAE8F3] dark:bg-neutral-800 border border-transparent px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 outline-none " +
  "focus:ring-2 focus:ring-[#349C93]/40 focus:border-[#349C93] focus:bg-[#D0E5F2] dark:focus:bg-neutral-700 " +
  "hover:bg-[#D0E5F2] dark:hover:bg-neutral-700 " +
  "transition-all duration-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500";

const sectionCard =
  "bg-[#EBF4FF] dark:bg-neutral-900 rounded-xl p-6 border border-[#D6E8F5] dark:border-neutral-800";

const fieldError = "mt-1 text-[11px] text-red-500";

export function HospitalDetailsStep() {
  const navigate = useNavigate();
  const { formData, setFields, reset } = useOnboarding();

  // Pre-fill email from auth if available
  const authEmail = authUtils.getCurrentUser()?.email ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HospitalDetailsValues>({
    resolver: zodResolver(hospitalDetailsSchema),
    defaultValues: {
      adminFirstName: formData.adminFirstName,
      adminLastName: formData.adminLastName,
      hospitalName: formData.hospitalName,
      mdcnNumber: formData.mdcnNumber,
      email: formData.email || authEmail,
      phone: formData.phone,
    },
  });

  function onValid(values: HospitalDetailsValues) {
    setFields({
      ...values,
      phone: values.phone ? normalizePhone(values.phone) : "",
    });
    navigate("/hospital/onboarding/location");
  }

  return (
    <HospitalOnboardingLayout activeStep={0}>
      {/* ── Page header ── */}
      <div className="flex flex-col items-center text-center mb-8">
        <svg className="w-9 h-9 text-neutral-800 dark:text-neutral-100 mb-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 21V7l6-4 6 4v2h3v12H3zm2-2h4v-3H5v3zm0-5h4v-3H5v3zm0-5h4V7H5v2zm6 10h4v-3h-4v3zm0-5h4v-3h-4v3zm0-5h4V7h-4v2zm6 10h2v-8h-2v8z" />
        </svg>
        <h1 className="text-[26px] font-bold text-neutral-900 dark:text-neutral-50 leading-tight">Hospital Registration</h1>
        <p className="mt-2 text-[13px] text-neutral-500 max-w-md leading-relaxed">
          Establish your facility's core identity on the NexusCare network. This information will be
          verified against the MDCN database.
        </p>
      </div>

      <form onSubmit={handleSubmit(onValid)} noValidate>
        <div className="grid grid-cols-1 gap-5 max-w-2xl mx-auto w-full">
          {/* Administrator Info */}
          <div className={sectionCard}>
            <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[#349C93] mb-5">
              <User className="h-4 w-4" />
              Administrator Details
            </h2>

            {/* First Name + Last Name */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label htmlFor="admin-first-name" className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    id="admin-first-name"
                    {...register("adminFirstName")}
                    placeholder="e.g. Amara"
                    className={`${inputCls} pl-9`}
                  />
                </div>
                {errors.adminFirstName && <p className={fieldError}>{errors.adminFirstName.message}</p>}
              </div>
              <div>
                <label htmlFor="admin-last-name" className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    id="admin-last-name"
                    {...register("adminLastName")}
                    placeholder="e.g. Okafor"
                    className={`${inputCls} pl-9`}
                  />
                </div>
                {errors.adminLastName && <p className={fieldError}>{errors.adminLastName.message}</p>}
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="contact-email" className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type="email"
                    id="contact-email"
                    {...register("email")}
                    placeholder="admin@hospital.org"
                    className={`${inputCls} pl-9`}
                  />
                </div>
                {errors.email && <p className={fieldError}>{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="phone-number" className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type="tel"
                    id="phone-number"
                    {...register("phone")}
                    placeholder="e.g. 08012345678 or +2348012345678"
                    className={`${inputCls} pl-9`}
                  />
                </div>
                {errors.phone && <p className={fieldError}>{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          {/* Facility Identity */}
          <div className={sectionCard}>
            <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[#349C93] mb-5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              Facility Identity
            </h2>

            {/* Hospital Name */}
            <div className="mb-4">
              <label htmlFor="hospital-name" className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                Official Hospital Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="hospital-name"
                {...register("hospitalName")}
                placeholder="e.g. St. Nicholas Hospital"
                className={inputCls}
              />
              {errors.hospitalName && <p className={fieldError}>{errors.hospitalName.message}</p>}
            </div>

            {/* MDCN Registration Number */}
            <div>
              <label htmlFor="mdcn-number" className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                MDCN / Registration Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="mdcn-number"
                  {...register("mdcnNumber")}
                  placeholder="e.g. MDCN/XYZ/12345"
                  className={`${inputCls} pr-10`}
                />
                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
              </div>
              {errors.mdcnNumber
                ? <p className={fieldError}>{errors.mdcnNumber.message}</p>
                : <p className="text-[11px] text-neutral-400 mt-1.5">Verified by the clinical audit team within 48 hours.</p>
              }
            </div>
          </div>

          {/* Verification badge */}
          <div className="flex items-start gap-3 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-xl px-5 py-4">
            <BadgeCheck className="h-5 w-5 text-[#349C93] shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-100">MDCN Verification</p>
              <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                Your registration details will be cross-checked against the MDCN national database
                within 48 hours of submission.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="max-w-2xl mx-auto mt-8 flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => {
              // User is abandoning the flow entirely — clear the draft.
              reset();
              navigate("/auth/role-selection");
            }}
            className="px-6 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-semibold transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-7 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-[13px] font-semibold transition-colors duration-150 shadow-sm"
          >
            Save &amp; Continue →
          </button>
        </div>
      </form>
    </HospitalOnboardingLayout>
  );
}
