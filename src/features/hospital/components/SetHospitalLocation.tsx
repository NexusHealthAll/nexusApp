import { useState } from "react";
import { MapPin, Minus, Plus, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useHospitalSetup } from "../hooks/useHospitalSetup";

const DEFAULT_COORDS = { lat: 6.4965, lng: 3.3764 };

export function SetHospitalLocation() {
  const { setLocationDone } = useHospitalSetup();
  const [coords] = useState(DEFAULT_COORDS);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Set Hospital Location
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Drag pin to exact hospital entrance
        </p>
      </div>

      {/* Map + Sidebar */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Map area */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200">
          {/* Satellite map placeholder */}
          <div
            className="relative h-[420px] w-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://tile.openstreetmap.org/14/8136/7891.png')",
              backgroundColor: "#a8c98a",
            }}
          >
            {/* Green mosaic blocks to simulate satellite */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-80">
              {[
                "bg-green-700",
                "bg-green-600",
                "bg-neutral-400",
                "bg-neutral-300",
                "bg-green-700",
                "bg-green-800",
                "bg-green-600",
                "bg-neutral-300",
                "bg-neutral-200",
                "bg-neutral-300",
                "bg-green-600",
                "bg-green-700",
                "bg-neutral-400",
                "bg-neutral-200",
                "bg-neutral-100",
                "bg-neutral-200",
                "bg-neutral-400",
                "bg-green-600",
                "bg-green-600",
                "bg-neutral-300",
                "bg-neutral-200",
                "bg-neutral-100",
                "bg-neutral-300",
                "bg-green-700",
                "bg-green-700",
                "bg-green-600",
                "bg-neutral-300",
                "bg-neutral-400",
                "bg-green-600",
                "bg-green-700",
                "bg-green-800",
                "bg-green-700",
                "bg-green-600",
                "bg-green-700",
                "bg-green-800",
                "bg-green-900",
              ].map((color, i) => (
                <div key={i} className={color} />
              ))}
            </div>

            {/* Zoom controls */}
            <div className="absolute right-3 top-3 flex flex-col gap-1">
              <button className="flex h-8 w-8 items-center justify-center rounded bg-white shadow-md hover:bg-neutral-50">
                <Plus className="h-4 w-4 text-neutral-700" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded bg-white shadow-md hover:bg-neutral-50">
                <Minus className="h-4 w-4 text-neutral-700" />
              </button>
            </div>

            {/* Pin */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-700 shadow-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              {/* Coordinate badge */}
              <div className="mt-2 flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-md">
                <MapPin className="h-3 w-3 text-secondary-600" />
                {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
              </div>
            </div>

            {/* Search bar */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-md">
                <Search className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for street or landmark..."
                  className="flex-1 bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Verification Setup sidebar */}
        <div className="rounded-2xl bg-onboarding-inputBackground p-5">
          <div className="mb-3 flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary-600" />
            <h3 className="text-base font-bold text-onboarding-textPrimary">
              Verification Setup
            </h3>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-onboarding-textSecondary">
            Accurate entrance placement ensures your staff can clock-in without
            friction while maintaining clinical compliance.
          </p>

          <ul className="mb-6 space-y-2.5">
            {["GPS fencing auto-enabled", "Shift distance active"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary-600">
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      fill="none"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-onboarding-textPrimary">{item}</span>
                </li>
              ),
            )}
          </ul>

          <Button
            onClick={() => setLocationDone(coords)}
            className="w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest"
          >
            Confirm Location →
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-4 rounded-2xl bg-onboarding-inputBackground p-5">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white">
            <MapPin className="h-4 w-4 text-secondary-600" />
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-onboarding-textPrimary">
              Clock-In Verification
            </p>
            <p className="text-xs leading-relaxed text-onboarding-textSecondary">
              Workers must be within{" "}
              <span className="font-semibold text-secondary-700">100m</span> of
              this entrance to record their arrival. Geofencing is automatically
              applied to all assigned shifts.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl bg-onboarding-inputBackground p-5">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white">
            <ShieldCheck className="h-4 w-4 text-secondary-600" />
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-onboarding-textPrimary">
              Shift Broadcasting
            </p>
            <p className="text-xs leading-relaxed text-onboarding-textSecondary">
              New shifts are prioritized for workers within a{" "}
              <span className="font-semibold text-secondary-700">
                5km radius
              </span>{" "}
              of the hospital to minimize travel delays and ensure reliability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
