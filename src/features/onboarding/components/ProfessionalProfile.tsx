import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { X, Bell, Award, Stethoscope } from "lucide-react";

interface ProfessionalData {
  licenseNumber: string;
  specialties: string[];
  yearsOfExperience: string;
}

interface ProfessionalFormErrors {
  licenseNumber?: string;
  specialties?: string;
  yearsOfExperience?: string;
}

export function ProfessionalProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfessionalData>({
    licenseNumber: "",
    specialties: [],
    yearsOfExperience: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ProfessionalFormErrors>({});

  const handleLicenseChange = (value: string) => {
    // Format license number as MDCN/R/XXXX
    let formatted = value.toUpperCase().replace(/[^A-Z0-9/]/g, "");

    if (!formatted.startsWith("MDCN/R/") && formatted.length > 0) {
      if (formatted.startsWith("MDCN/R")) {
        formatted = formatted.replace("MDCN/R", "MDCN/R/");
      } else if (formatted.startsWith("MDCN")) {
        formatted = formatted.replace("MDCN", "MDCN/R/");
      } else {
        formatted = "MDCN/R/" + formatted;
      }
    }

    setFormData((prev) => ({ ...prev, licenseNumber: formatted }));

    if (errors.licenseNumber) {
      setErrors((prev) => ({ ...prev, licenseNumber: undefined }));
    }
  };

  const toggleSpecialty = (specialtyId: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialtyId)
        ? prev.specialties.filter((id) => id !== specialtyId)
        : [...prev.specialties, specialtyId],
    }));

    if (errors.specialties) {
      setErrors((prev) => ({ ...prev, specialties: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ProfessionalFormErrors = {};

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "License number is required";
    } else if (!formData.licenseNumber.match(/^MDCN\/R\/\d{4,}$/)) {
      newErrors.licenseNumber =
        "Please enter a valid MDCN license number (e.g., MDCN/R/12345)";
    }

    if (formData.specialties.length === 0) {
      newErrors.specialties = "Please select at least one specialty";
    }

    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = "Years of experience is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store professional data
      localStorage.setItem("professionalData", JSON.stringify(formData));

      // Navigate to payout setup
      navigate("/auth/onboarding/payout-setup");
    } catch (error) {
      console.error("Professional profile error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/auth/login");
  };

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
              STEP 02 OF 04
            </p>
            <h1 className="text-2xl font-bold text-onboarding-textPrimary">
              Professional Identity
            </h1>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue h-1 rounded-full"
                style={{ width: "50%" }}
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
                    onChange={(e) => handleLicenseChange(e.target.value)}
                    className={`flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 font-mono ${
                      errors.licenseNumber ? "text-red-600" : ""
                    }`}
                    placeholder="MDCN/R/0000"
                  />
                </div>
                {errors.licenseNumber && (
                  <p className="text-sm text-red-600">{errors.licenseNumber}</p>
                )}
              </div>

              {/* Identification Method */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Identification Method
                </label>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600">
                    Your license will be verified with the Medical and Dental
                    Council of Nigeria.
                  </p>
                </div>
              </div>

              {/* Years of Experience */}
              <div className="space-y-3">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 flex items-center space-x-2">
                  <Stethoscope className="h-4 w-4" />
                  <span>Years of Experience</span>
                </label>
                <Select
                  value={formData.yearsOfExperience}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      yearsOfExperience: value,
                    }))
                  }
                  placeholder="Select experience level"
                  className="bg-onboarding-inputBackground"
                  options={[
                    { value: "0-1", label: "0-1 years (Fresh Graduate)" },
                    { value: "2-5", label: "2-5 years" },
                    { value: "6-10", label: "6-10 years" },
                    { value: "11-15", label: "11-15 years" },
                    { value: "16-20", label: "16-20 years" },
                    { value: "20+", label: "20+ years" },
                  ]}
                  error={errors.yearsOfExperience}
                />
              </div>

              {/* Specialties & Expertise */}
              <div className="space-y-4">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Specialties & Expertise
                </label>
                <p className="text-sm text-onboarding-textSecondary">
                  Select all areas that match your qualifications (multiple
                  selections allowed)
                </p>

                <div className="space-y-3">
                  {/* First Row */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSpecialty("general-practice")}
                      className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                        formData.specialties.includes("general-practice")
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      General Practice ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSpecialty("surgery")}
                      className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                        formData.specialties.includes("surgery")
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      Surgery
                    </button>
                  </div>

                  {/* Second Row */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSpecialty("pediatrics")}
                      className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                        formData.specialties.includes("pediatrics")
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      Pediatrics
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSpecialty("nursing")}
                      className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                        formData.specialties.includes("nursing")
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      Nursing
                    </button>
                  </div>

                  {/* Third Row */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSpecialty("anesthesiology")}
                      className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                        formData.specialties.includes("anesthesiology")
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      Anesthesiology
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSpecialty("other")}
                      className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                        formData.specialties.includes("other")
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      + Other
                    </button>
                  </div>
                </div>

                {errors.specialties && (
                  <p className="text-sm text-red-600">{errors.specialties}</p>
                )}
              </div>

              {/* Data Privacy Section */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Data Privacy
                    </h4>
                    <p className="text-sm text-slate-600">
                      Your credentials are encrypted and stored following
                      international health data standards.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fast Track Section */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Fast Track
                    </h4>
                    <p className="text-sm text-slate-600">
                      Most licenses are verified automatically within 24 hours
                      of submission.
                    </p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg"
              >
                {isLoading ? "Verifying Profile..." : "Verify & Continue"}
              </Button>

              {/* Skip Option */}
              <div className="text-center">
                <button
                  type="button"
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
