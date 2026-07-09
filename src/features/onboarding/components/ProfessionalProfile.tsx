import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { X, Bell, Award, User } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";

const ROLE_OPTIONS = [
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "lab_technician", label: "Lab Technician" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "radiographer", label: "Radiographer" },
  { value: "physiotherapist", label: "Physiotherapist" },
  { value: "other", label: "Other" },
];

const SPECIALTY_OPTIONS = [
  { value: "emergency_medicine", label: "Emergency Medicine" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "icu_specialist", label: "ICU Specialist" },
  { value: "general_nursing", label: "General Nursing" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "lab_technician", label: "Lab Technician" },
  { value: "surgery", label: "Surgery" },
  { value: "radiology", label: "Radiology" },
  { value: "anesthesiology", label: "Anesthesiology" },
  { value: "cardiology", label: "Cardiology" },
  { value: "obstetrics", label: "Obstetrics" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "other", label: "Other" },
];

interface ProfessionalFormData {
  firstName: string;
  lastName: string;
  role: string;
  licenseNumber: string;
  specialty: string;
}

interface ProfessionalFormErrors {
  firstName?: string;
  lastName?: string;
  role?: string;
  licenseNumber?: string;
  specialty?: string;
}

export function ProfessionalProfile() {
  const navigate = useNavigate();
  const clinicianId = useAuthStore((s) => s.clinicianId);
  const [formData, setFormData] = useState<ProfessionalFormData>({
    firstName: "",
    lastName: "",
    role: "",
    licenseNumber: "",
    specialty: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ProfessionalFormErrors>({});
  const [submitError, setSubmitError] = useState("");

  const validateForm = (): boolean => {
    const newErrors: ProfessionalFormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.role) newErrors.role = "Please select your professional role";
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "License number is required";
    } else if (formData.licenseNumber.trim().length < 2) {
      newErrors.licenseNumber = "License number is too short";
    }
    if (!formData.specialty) newErrors.specialty = "Please select a specialty";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!clinicianId) {
      setSubmitError(
        "We couldn't find your clinician account for this session. Please log in again to continue.",
      );
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await apiClient.put(
        `/api/v1/clinicians/${encodeURIComponent(clinicianId)}/profile`,
        {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          role: formData.role,
          license_number: formData.licenseNumber.trim(),
          specialty: formData.specialty,
        },
      );

      const { accessToken, refreshToken, user } = useAuthStore.getState();
      if (user) {
        useAuthStore.getState().setAuthSession({
          accessToken,
          refreshToken,
          user: {
            ...user,
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
          },
        });
      }

      navigate("/medical-staff/onboarding/payout");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "Network error — please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => navigate("/medical-staff/dashboard");
  const handleSkip = () => navigate("/medical-staff/dashboard");

  return (
    <div className="min-h-screen bg-[#F3FAFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white rounded-t-2xl px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <NexusCareLogo size="md" />
            </div>
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-slate-400" />
              <button
                onClick={handleClose}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              STEP 03 OF 04
            </p>
            <h1 className="text-2xl font-bold text-onboarding-textPrimary">
              Professional Identity
            </h1>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue h-1 rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white rounded-t-none rounded-b-2xl border-t-0 shadow-md">
          <CardContent className="p-6 space-y-6">
            {/* Description */}
            <p className="text-onboarding-textSecondary leading-relaxed">
              To ensure clinical safety and maintain our high standards of care,
              please provide your current medical registration details.
            </p>
            <form onSubmit={handleContinue} className="space-y-8">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="mb-1.5 flex items-center space-x-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                    <User className="h-4 w-4" />
                    <span>First Name</span>
                  </label>
                  <div className="rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
                      placeholder="Adaeze"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                    Last Name
                  </label>
                  <div className="rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
                      placeholder="Okafor"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Professional Role */}
              <div className="space-y-3">
                <Select
                  label="Professional Role"
                  value={formData.role}
                  onChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                  placeholder="Select your role"
                  className="bg-onboarding-inputBackground"
                  options={ROLE_OPTIONS}
                  error={errors.role}
                />
              </div>

              {/* License Number */}
              <div className="space-y-3">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>License Number</span>
                </label>
                <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        licenseNumber: e.target.value,
                      }))
                    }
                    className={`flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 font-mono ${
                      errors.licenseNumber ? "text-red-600" : ""
                    }`}
                    placeholder="e.g., MDC/NGR/12345"
                  />
                </div>
                {errors.licenseNumber && (
                  <p className="text-sm text-red-600">{errors.licenseNumber}</p>
                )}
              </div>

              {/* Specialty */}
              <div className="space-y-4">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Specialty
                </label>
                <div className="flex flex-wrap gap-3">
                  {SPECIALTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, specialty: opt.value }))
                      }
                      className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                        formData.specialty === opt.value
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {errors.specialty && (
                  <p className="text-sm text-red-600">{errors.specialty}</p>
                )}
              </div>

              {/* Data Privacy Section */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Data Privacy</h4>
                    <p className="text-sm text-slate-600">
                      Your credentials are encrypted and stored following
                      international health data standards.
                    </p>
                  </div>
                </div>
              </div>

              {submitError && (
                <p className="text-sm text-red-600 text-center">{submitError}</p>
              )}

              {/* Continue Button */}
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg"
              >
                {isLoading ? "Saving..." : "Verify & Continue"}
              </Button>

              {/* Skip Option */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  I'll complete this later
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
