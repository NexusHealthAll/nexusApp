import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { Select } from "@/shared/components/ui/Select";
import { HospitalOnboardingLayout } from "./HospitalOnboardingLayout";
import { useOnboarding } from "../context/OnboardingContext";
import { hospitalOnboardingService } from "../services/hospitalOnboardingService";
import { ApiError } from "@/lib/apiError";
import apiClient from "@/lib/apiClient";
import { useLocationTracker } from "@/shared/location/useLocationTracker";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg bg-[#DAE8F3] border border-transparent px-3.5 py-2.5 text-sm text-neutral-800 outline-none " +
  "focus:ring-2 focus:ring-[#349C93]/40 focus:border-[#349C93] focus:bg-[#D0E5F2] " +
  "hover:bg-[#D0E5F2] transition-all duration-200 placeholder:text-neutral-400";

const selectCls =
  "w-full rounded-lg bg-[#DAE8F3] border border-transparent px-3.5 py-2.5 text-sm text-neutral-700 outline-none " +
  "focus:ring-2 focus:ring-[#349C93]/40 focus:border-[#349C93] hover:bg-[#D0E5F2] transition-all duration-200";

const fieldError = "mt-1 text-[11px] text-red-500";

// ─── Nigeria states ───────────────────────────────────────────────────────────

const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

// ─── Reverse-geocode types ────────────────────────────────────────────────────

interface GeoItem {
  title: string;
  address: {
    label: string;
    country_code: string;
    country_name: string;
    state: string;
    city: string;
  };
  position: { lat: number; lng: number };
}

// ─── LandmarkDropdown ─────────────────────────────────────────────────────────

interface LandmarkDropdownProps {
  items: GeoItem[];
  loading: boolean;
  value: string;
  onChange: (val: string) => void;
}

function LandmarkDropdown({ items, loading, value, onChange }: LandmarkDropdownProps) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isKnownItem = items.some((i) => i.title === value);
  const triggerLabel =
    loading
      ? ""
      : value && isKnownItem
        ? value
        : value && !isKnownItem
          ? value
          : "Select a nearby landmark…";

  // ── custom text input mode ──
  if (customMode) {
    return (
      <div className="relative">
        <input
          autoFocus
          type="text"
          value={customText}
          onChange={(e) => {
            setCustomText(e.target.value);
            onChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setCustomMode(false);
          }}
          placeholder="Type a nearby landmark…"
          className={inputCls}
        />
        <button
          type="button"
          title="Back to list"
          onClick={() => setCustomMode(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors leading-none"
        >
          ✕
        </button>
      </div>
    );
  }

  // ── dropdown mode ──
  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          "w-full flex items-center justify-between rounded-lg bg-[#DAE8F3] border px-3.5 py-2.5 text-sm outline-none transition-all duration-200 hover:bg-[#D0E5F2]",
          open
            ? "ring-2 ring-[#349C93]/40 border-[#349C93] bg-[#D0E5F2]"
            : "border-transparent",
        ].join(" ")}
      >
        {loading ? (
          <span className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="text-sm">Detecting nearby places…</span>
          </span>
        ) : (
          <span className={value ? "text-neutral-800" : "text-neutral-400"}>
            {triggerLabel}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-white border border-gray-200 shadow-xl overflow-hidden">
          <ul className="max-h-52 overflow-y-auto py-1">
            {items.length === 0 && (
              <li className="px-4 py-3 text-[12px] text-neutral-400 italic">
                No nearby places found
              </li>
            )}
            {items.map((item, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(item.title);
                    setOpen(false);
                  }}
                  className={[
                    "w-full text-left px-4 py-2.5 text-[13px] transition-colors duration-100",
                    item.title === value
                      ? "bg-[#E8F5F4] text-[#0F766E] font-semibold"
                      : "text-neutral-700 hover:bg-[#F0F9F8]",
                  ].join(" ")}
                >
                  <span className="block truncate">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* ── Custom Landmark option ── */}
          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCustomText(value && !isKnownItem ? value : "");
                setCustomMode(true);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-[#0F766E] hover:bg-[#F0F9F8] transition-colors duration-100"
            >
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#0F766E] text-white text-sm font-bold leading-none">
                +
              </span>
              Custom Landmark
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LocationGeofencingStep() {
  const { latitude, longitude, error: geoError } = useLocationTracker();
  const navigate = useNavigate();
  const { formData, setField, setFields } = useOnboarding();

  const [local, setLocal] = useState({
    streetAddress: formData.streetAddress,
    addressLine2: formData.addressLine2,
    city: formData.city,
    state: formData.state,
    postalCode: formData.postalCode,
    radius: formData.radius,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof local, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reverse geocode state
  const [geoItems, setGeoItems] = useState<GeoItem[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const geocodeFetched = useRef(false);

  // ── Fetch reverse geocode once we have coordinates ──────────────────────────
  useEffect(() => {
    if (latitude == null || longitude == null) return;
    if (geocodeFetched.current) return;
    geocodeFetched.current = true;

    setGeoLoading(true);

    apiClient
      .get<{ items: GeoItem[] }>(`/api/v1/here/reverse-geocode`, {
        params: { at: `${latitude},${longitude}` },
      })
      .then(({ data: { items = [] } }) => {
        setGeoItems(items);

        if (items.length > 0) {
          const first = items[0];
          setLocal((prev) => ({
            ...prev,
            // Only auto-fill if the field is still empty
            city: prev.city || first.address.city || "",
            state:
              prev.state ||
              NIGERIA_STATES.find(
                (s) => s.toLowerCase() === (first.address.state ?? "").toLowerCase()
              ) ||
              "",
          }));
        }
      })
      .catch((err) => {
        console.warn("[LocationGeofencing] reverse-geocode failed:", err);
      })
      .finally(() => {
        setGeoLoading(false);
      });
  }, [latitude, longitude]);

  // ── Field helpers ────────────────────────────────────────────────────────────
  function handle(field: keyof typeof local, value: string) {
    setLocal((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!local.streetAddress.trim()) e.streetAddress = "Street address is required";
    if (!local.city.trim()) e.city = "City is required";
    if (!local.state) e.state = "State is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleContinue() {
    if (!validate()) return;

    setApiError(null);
    setSubmitting(true);
    setFields(local);
    const merged = { ...formData, ...local };

    try {
      const result = await hospitalOnboardingService.register(merged);
      // Store the returned hospital ID so the Identity Verification step can use it
      setField("hospitalId", result.hospital_id);
      navigate("/hospital/onboarding/identity-verification");
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      setApiError(apiErr?.message ?? "Registration failed. Please try again.");

      if (apiErr?.fieldErrors?.length) {
        const fieldMap: Partial<Record<keyof typeof local, string>> = {};
        for (const fe of apiErr.fieldErrors) {
          if (fe.field === "address.line1" || fe.field === "streetAddress")
            fieldMap.streetAddress = fe.message;
          else if (fe.field === "address.line2") fieldMap.addressLine2 = fe.message;
          else if (fe.field === "address.city") fieldMap.city = fe.message;
          else if (fe.field === "address.state") fieldMap.state = fe.message;
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
        <h1 className="text-[26px] font-bold text-neutral-900 leading-tight">
          Location &amp; Geofencing
        </h1>
        <p className="mt-1.5 text-[13px] text-neutral-500 max-w-md leading-relaxed">
          Define the precise geographical boundary for your facility. This ensures
          automated, location-verified clock-ins for all clinical staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 max-w-5xl mx-auto">
        {/* LEFT panel */}
        <div className="space-y-4">
          {/* Info box */}
          <div className="bg-[#EBF4FF] rounded-xl border border-[#C8DFEF] p-4 flex gap-3">
            <Info className="h-4 w-4 text-[#1A5888] shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-bold text-neutral-800 mb-1">
                Why Geofencing Matters
              </p>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Geofencing enables automated shift logging. Clinicians must be within
                this defined radius for their clock-in to register successfully on
                the NexusCare app.
              </p>
            </div>
          </div>

          {/* Facility Coordinates */}
          <div>
            <h2 className="text-[14px] font-bold text-neutral-800 mb-3">
              Facility Coordinates
            </h2>

            {/* Street Address */}
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
              {errors.streetAddress && (
                <p className={fieldError}>{errors.streetAddress}</p>
              )}
            </div>

            {/* Nearby Landmarks — custom dropdown */}
            <div className="mb-3">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
                Nearby Landmarks
              </label>
              <LandmarkDropdown
                items={geoItems}
                loading={geoLoading}
                value={local.addressLine2}
                onChange={(val) => handle("addressLine2", val)}
              />
            </div>

            {/* City + State */}
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
                <Select
                  value={local.state}
                  onChange={(value) => handle("state", value)}
                  placeholder="Select State"
                  error={errors.state}
                  className={selectCls}
                  options={NIGERIA_STATES.map((s) => ({ value: s, label: s }))}
                />
              </div>
            </div>

            {/* Postal Code */}
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
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  Current Center
                </p>
                <p className="text-neutral-700 font-medium">
                  {latitude != null && longitude != null
                    ? `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`
                    : "6.4541° N, 3.3947° E"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  Accuracy
                </p>
                {geoError ? (
                  <p className="flex items-center gap-1 text-amber-500 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
                    GPS Unavailable
                  </p>
                ) : latitude != null ? (
                  <p className="flex items-center gap-1 text-teal-600 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 inline-block" />
                    High (GPS Locked)
                  </p>
                ) : (
                  <p className="flex items-center gap-1 text-neutral-400 font-semibold">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Locating…
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API error banner */}
      {apiError && (
        <div className="max-w-5xl mx-auto mt-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[12px] text-red-700 font-medium leading-relaxed">
            {apiError}
          </p>
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
