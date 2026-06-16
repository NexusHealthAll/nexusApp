import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, Map, Info } from "lucide-react";
import { HospitalOnboardingLayout } from "./HospitalOnboardingLayout";

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

const NIGERIA_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

export function LocationGeofencingStep() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    streetAddress: "",
    city: "",
    state: "",
    lga: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    radius: "500",
  });

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <HospitalOnboardingLayout activeStep={1}>
      {/* ── Page header ── */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900">Location &amp; Geofencing</h1>
        <p className="mt-2.5 text-sm text-neutral-500 max-w-lg leading-relaxed">
          Define your facility's physical location and geographic radius. This enables precise
          shift broadcasting to clinicians in your vicinity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-7 max-w-5xl mx-auto">

        {/* LEFT column */}
        <div className="space-y-6">

          {/* Physical Address card */}
          <div className="bg-[#F0F7FF] rounded-2xl p-8 border border-transparent hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-6">
              <MapPin className="h-4 w-4" />
              Physical Address
            </h2>

            <div className="mb-5">
              <label className="block text-xs font-medium text-neutral-500 mb-2">Street Address</label>
              <input
                type="text"
                value={form.streetAddress}
                onChange={(e) => handleChange("streetAddress", e.target.value)}
                placeholder="e.g. 15 Adeola Odeku Street"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="e.g. Lagos"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">State</label>
                <select
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select State</option>
                  {NIGERIA_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">LGA</label>
                <input
                  type="text"
                  value={form.lga}
                  onChange={(e) => handleChange("lga", e.target.value)}
                  placeholder="Local Government Area"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">Postal Code</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  placeholder="e.g. 100001"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Geofencing card */}
          <div className="bg-[#F0F7FF] rounded-2xl p-8 border border-transparent hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-1.5">
              <Navigation className="h-4 w-4" />
              Geofencing Configuration
            </h2>
            <p className="text-[11px] text-neutral-400 mb-6">
              Set GPS coordinates and radius for shift proximity matching.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">Latitude</label>
                <input
                  type="text"
                  value={form.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                  placeholder="e.g. 6.5244"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">Longitude</label>
                <input
                  type="text"
                  value={form.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                  placeholder="e.g. 3.3792"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Radius slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-neutral-500">Broadcast Radius</label>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  {form.radius}m
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={form.radius}
                onChange={(e) => handleChange("radius", e.target.value)}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1.5">
                <span>100m</span>
                <span>5km</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="space-y-6">

          {/* Map preview card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 h-52 flex flex-col items-center justify-center text-neutral-400 relative">
              <Map className="h-10 w-10 mb-2 text-teal-300" />
              <p className="text-xs text-neutral-400">Map preview</p>
              {form.latitude && form.longitude && (
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-[11px] text-neutral-700 rounded-lg px-3 py-1.5 shadow-sm font-medium">
                  📍 {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
                </div>
              )}
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-neutral-700 mb-1">Current Location</p>
              <p className="text-[11px] text-neutral-400">
                {form.streetAddress
                  ? `${form.streetAddress}${form.city ? `, ${form.city}` : ""}${form.state ? `, ${form.state}` : ""}`
                  : "Enter address details to preview location"}
              </p>
            </div>
          </div>

          {/* Info card */}
          <div className="bg-[#EBF5FF] rounded-2xl p-6 border border-transparent hover:border-blue-200/60 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-800 mb-2">Why Geofencing?</h3>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Geofencing allows NexusCare to automatically match your facility with nearby
                  clinicians, reducing commute times and improving shift fill rates by up to 40%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="max-w-5xl mx-auto mt-10 flex items-center justify-between">
        <button
          onClick={() => navigate("/hospital/onboarding/registration")}
          className="px-7 py-3 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400/50"
        >
          Back
        </button>
        <button
          onClick={() => navigate("/hospital/onboarding/financial-setup")}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-semibold shadow hover:opacity-90 hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
        >
          Save &amp; Continue →
        </button>
      </div>
    </HospitalOnboardingLayout>
  );
}
