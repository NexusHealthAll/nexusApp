import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Navigation, Loader2, AlertCircle } from "lucide-react";
import { HospitalOnboardingLayout } from "./HospitalOnboardingLayout";
import { useOnboarding } from "../context/OnboardingContext";
import { hospitalOnboardingService } from "../services/hospitalOnboardingService";
import type { HospitalRegisterError } from "../services/hospitalOnboardingService";

const inputCls =
  "w-full rounded-lg bg-[#DAE8F3] border border-transparent px-3.5 py-2.5 text-sm text-neutral-800 outline-none " +
  "focus:ring-2 focus:ring-[#349C93]/40 focus:border-[#349C93] focus:bg-[#D0E5F2] " +
  "hover:bg-[#D0E5F2] transition-all duration-200 placeholder:text-neutral-400";

const selectCls =
  "w-full rounded-lg bg-[#DAE8F3] border border-transparent px-3.5 py-2.5 text-sm text-neutral-700 outline-none " +
  "focus:ring-2 focus:ring-[#349C93]/40 focus:border-[#349C93] hover:bg-[#D0E5F2] transition-all duration-200";

const fieldError = "mt-1 text-[11px] text-red-500";

const NIGERIA_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

export function LocationGeofencingStep() {
  const navigate = useNavigate();
  const { formData, setFields, reset } = useOnboarding();

  const [local, setLocal] = useState({
    streetAddress: formData.streetAddress,
    addressLine2:  formData.addressLine2,
    city:          formData.city,
    state:         formData.state,
    postalCode:    formData.postalCode,
    radius:        formData.radius,
  });

  const [errors, setErrors]     = useState<Partial<Record<keyof typeof local, string>>>({});
  const [gpsVerified, setGpsVerified] = useState(false);
  const [verifying, setVerifying]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [apiError, setApiError]       = useState<string | null>(null);

  function handle(field: keyof typeof local, value: string) {
    setLocal((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    setGpsVerified(false);
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!local.streetAddress.trim()) e.streetAddress = "Street address is required";
    if (!local.city.trim())          e.city          = "City is required";
    if (!local.state)                e.state         = "State is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleVerifyGPS() {
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setGpsVerified(true); }, 1500);
  }

  async function handleContinue() {
    if (!validate()) return;

    setApiError(null);
    setSubmitting(true);

    // Flush local address fields into context, then build merged payload
    setFields(local);
    const merged = { ...formData, ...local };

    try {
      await hospitalOnboardingService.register(merged);
      reset();
      navigate("/hospital/onboarding/verification-status");
    } catch (err) {
      const regErr = err as HospitalRegisterError;
      // Surface a top-level banner message
      setApiError(regErr.message ?? "Registration failed. Please try again.");

      // Map any field-level errors back to local form fields where possible
      if (regErr.fieldErrors?.length) {
        const fieldMap: Partial<Record<keyof typeof local, string>> = {};
        for (const fe of regErr.fieldErrors) {
          if (fe.field === "address.line1" || fe.field === "streetAddress") fieldMap.streetAddress = fe.message;
          else if (fe.field === "address.line2")  fieldMap.addressLine2 = fe.message;
          else if (fe.field === "address.city")   fieldMap.city         = fe.message;
          else if (fe.field === "address.state")  fieldMap.state        = fe.message;
          else if (fe.field === "address.postal_code") fieldMap.postalCode = fe.message;
        }
        if (Object.keys(fieldMap).length) setErrors((e) => ({ ...e, ...fieldMap }));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=3.2%2C6.4%2C3.5%2C6.65&layer=mapnik&marker=6.5244%2C3.3792`;

  return (
    <HospitalOnboardingLayout activeStep={1}>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[26px] font-bold text-neutral-900 leading-tight">Location &amp; Geofencing</h1>
        <p className="mt-1.5 text-[13px] text-neutral-500 max-w-md leading-relaxed">
          Define the precise geographical boundary for your facility. This ensures automated,
          location-verified clock-ins for all clinical staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 max-w-5xl mx-auto">

        {/* LEFT panel */}
        <div className="space-y-4">

          {/* Info box */}
          <div className="bg-[#EBF4FF] rounded-xl border border-[#C8DFEF] p-4 flex gap-3">
            <Info className="h-4 w-4 text-[#1A5888] shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-bold text-neutral-800 mb-1">Why Geofencing Matters</p>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Geofencing enables automated shift logging. Clinicians must be within this defined
                radius for their clock-in to register successfully on the NexusCare app.
              </p>
            </div>
          </div>

          {/* Facility Coordinates */}
          <div>
            <h2 className="text-[14px] font-bold text-neutral-800 mb-3">Facility Coordinates</h2>

            <div className="mb-3">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="street-address"
                value={local.streetAddress}
                onChange={(e) => handle("streetAddress", e.target.value)}
                placeholder="14 Broad Street, Victoria Island"
                className={inputCls}
              />
              {errors.streetAddress && <p className={fieldError}>{errors.streetAddress}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
                Address Line 2 <span className="text-neutral-300">(optional)</span>
              </label>
              <input
                type="text"
                id="address-line2"
                value={local.addressLine2}
                onChange={(e) => handle("addressLine2", e.target.value)}
                placeholder="Suite, floor, building name…"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={local.city}
                  onChange={(e) => handle("city", e.target.value)}
                  placeholder="Lagos"
                  className={inputCls}
                />
                {errors.city && <p className={fieldError}>{errors.city}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
                  State <span className="text-red-500">*</span>
                </label>
                <select value={local.state} onChange={(e) => handle("state", e.target.value)} className={selectCls}>
                  <option value="">Select State</option>
                  {NIGERIA_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                {errors.state && <p className={fieldError}>{errors.state}</p>}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
                Postal Code
              </label>
              <input
                type="text"
                value={local.postalCode}
                onChange={(e) => handle("postalCode", e.target.value)}
                placeholder="e.g. 100001"
                className={inputCls}
              />
            </div>

            {/* Radius slider */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[14px] font-bold text-neutral-800">Geofence Radius</label>
                <span className="text-[11px] font-bold text-[#1A5888] bg-[#DAE8F3] px-2.5 py-0.5 rounded">
                  {local.radius} meters
                </span>
              </div>
              <input
                type="range" min="100" max="5000" step="100"
                value={local.radius}
                onChange={(e) => handle("radius", e.target.value)}
                className="w-full accent-[#349C93] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>100m</span><span>5km</span>
              </div>
            </div>

            {/* Verify GPS */}
            <button
              type="button"
              onClick={handleVerifyGPS}
              disabled={verifying}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-[13px] font-semibold transition-all duration-150 ${
                gpsVerified
                  ? "bg-teal-50 border-[#349C93] text-[#349C93]"
                  : "bg-[#EBF4FF] border-[#C8DFEF] text-[#1A5888] hover:bg-[#DAE8F3]"
              }`}
            >
              <Navigation className="h-3.5 w-3.5" />
              {verifying ? "Verifying…" : gpsVerified ? "✓ GPS Verified" : "Verify GPS Coordinates"}
            </button>
          </div>
        </div>

        {/* RIGHT — full-height OSM map */}
        <div className="relative rounded-xl overflow-hidden border border-gray-200 min-h-[460px] lg:min-h-0">
          <iframe
            title="Facility location map"
            src={mapSrc}
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-white/95 backdrop-blur px-4 py-3 border-t border-gray-200">
            <div className="flex items-center gap-6 text-[11px]">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Current Center</p>
                <p className="text-neutral-700 font-medium">6.4541° N, 3.3947° E</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Accuracy</p>
                <p className="flex items-center gap-1 text-teal-600 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 inline-block" />
                  High (GPS Locked)
                </p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-[12px] font-semibold transition-colors duration-150">
              Confirm Location
            </button>
          </div>
        </div>
      </div>

      {/* API error banner */}
      {apiError && (
        <div className="max-w-5xl mx-auto mt-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[12px] text-red-700 font-medium leading-relaxed">{apiError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="max-w-5xl mx-auto mt-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/hospital/onboarding/registration")}
          disabled={submitting}
          className="px-6 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 text-white text-[13px] font-semibold transition-colors duration-150"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={submitting}
          className="flex items-center gap-2 px-7 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-semibold transition-colors duration-150 shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>Save &amp; Continue →</>
          )}
        </button>
      </div>
    </HospitalOnboardingLayout>
  );
}
