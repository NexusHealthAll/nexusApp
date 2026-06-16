import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Building2, BadgeCheck, ShieldCheck } from "lucide-react";
import { HospitalOnboardingLayout } from "./HospitalOnboardingLayout";

/* ── shared input class token ── */
const inputCls =
  "w-full rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-neutral-800 outline-none " +
  "focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 focus:bg-white " +
  "hover:border-gray-300 hover:shadow-sm " +
  "transition-all duration-200 placeholder:text-neutral-400";

const selectCls =
  "w-full rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-neutral-700 outline-none " +
  "focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 " +
  "hover:border-gray-300 hover:shadow-sm " +
  "transition-all duration-200";

export function HospitalDetailsStep() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    hospitalName: "",
    facilityType: "",
    yearEstablished: "",
    mdcnNumber: "",
    about: "",
  });
  const [logoFile, setLogoFile] = useState<string | null>(null);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <HospitalOnboardingLayout activeStep={0}>
      {/* ── Page header ── */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4 shadow-sm">
          <Building2 className="h-7 w-7 text-neutral-700" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900">Hospital Registration</h1>
        <p className="mt-2.5 text-sm text-neutral-500 max-w-lg leading-relaxed">
          Establish your facility's core identity on the NexusCare network. This information will be
          verified against the MDCN database.
        </p>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-7 max-w-5xl mx-auto">

        {/* LEFT column */}
        <div className="space-y-6">

          {/* Facility Identity card */}
          <div className="bg-[#F0F7FF] rounded-2xl p-8 border border-transparent hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-6">
              <Building2 className="h-4 w-4" />
              Facility Identity
            </h2>

            <div className="mb-5">
              <label className="block text-xs font-medium text-neutral-500 mb-2">Official Hospital Name</label>
              <input
                type="text"
                value={form.hospitalName}
                onChange={(e) => handleChange("hospitalName", e.target.value)}
                placeholder="e.g. St. Nicholas Hospital"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">Facility Type</label>
                <select
                  value={form.facilityType}
                  onChange={(e) => handleChange("facilityType", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select Type</option>
                  <option>Teaching Hospital</option>
                  <option>Private Hospital</option>
                  <option>Specialist Clinic</option>
                  <option>General Hospital</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">Year Established</label>
                <input
                  type="text"
                  value={form.yearEstablished}
                  onChange={(e) => handleChange("yearEstablished", e.target.value)}
                  placeholder="YYYY"
                  maxLength={4}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Clinical Credentials card */}
          <div className="bg-[#F0F7FF] rounded-2xl p-8 border border-transparent hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-6">
              <BadgeCheck className="h-4 w-4" />
              Clinical Credentials
            </h2>

            <div className="mb-5">
              <label className="block text-xs font-medium text-neutral-500 mb-2">
                MDCN Registration Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.mdcnNumber}
                  onChange={(e) => handleChange("mdcnNumber", e.target.value)}
                  placeholder="e.g. MDCN/XYZ/12345"
                  className={`${inputCls} pr-11`}
                />
                <ShieldCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 pointer-events-none" />
              </div>
              <p className="text-[11px] text-neutral-400 mt-2">
                This will be verified by our clinical audit team within 48 hours.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-2">About the Hospital</label>
              <textarea
                value={form.about}
                onChange={(e) => handleChange("about", e.target.value)}
                placeholder="Provide a brief overview of specialties, mission, and patient care philosophy..."
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="space-y-6">

          {/* Logo upload */}
          <div className="bg-white rounded-2xl border border-gray-200 p-7 hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-semibold text-neutral-700 mb-5">Facility Logo</h3>
            <label className="block cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setLogoFile(f.name);
                }}
              />
              <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-10 px-4 group-hover:border-teal-400 group-hover:bg-teal-50/30 group-focus-within:border-teal-400 group-focus-within:ring-2 group-focus-within:ring-teal-300/40 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                  <UploadCloud className="h-6 w-6 text-white" />
                </div>
                <p className="text-xs font-semibold text-blue-600 text-center">
                  {logoFile ?? "Click to upload or drag and drop"}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1.5 text-center">
                  SVG, PNG, JPG or GIF (max. 2MB)
                </p>
              </div>
            </label>
          </div>

          {/* Live Marketplace Preview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-7 hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-neutral-700">Live Marketplace Preview</h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Preview
              </span>
            </div>
            <div className="bg-[#F8FBFF] rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                  <Building2 className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-800">
                    {form.hospitalName || "Hospital Name"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {form.facilityType || "Private Facility"} • Est.{" "}
                    {form.yearEstablished || "YYYY"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit mb-3">
                <ShieldCheck className="h-3 w-3" />
                MDCN Verification Pending
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                {form.about ||
                  "Your hospital's description will appear here, giving patients an overview of your specialties and care philosophy."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="max-w-5xl mx-auto mt-10 flex items-center justify-between">
        <button
          onClick={() => navigate("/auth/role-selection")}
          className="px-7 py-3 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400/50"
        >
          Cancel
        </button>
        <button
          onClick={() => navigate("/hospital/onboarding/location")}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-semibold shadow hover:opacity-90 hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
        >
          Save &amp; Continue →
        </button>
      </div>
    </HospitalOnboardingLayout>
  );
}
