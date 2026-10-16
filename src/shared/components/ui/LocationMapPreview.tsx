import { lazy, Suspense } from "react";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import type { InteractiveMapProps } from "./InteractiveMap";

// MapLibre is ~200KB gzipped — load it only on screens that actually show a map.
const InteractiveMap = lazy(() => import("./InteractiveMap"));

export interface LocationMapPreviewProps
  extends Pick<InteractiveMapProps, "radiusMeters" | "onMarkerChange" | "zoom"> {
  latitude: number;
  longitude: number;
  /** Accessible name for the map region, e.g. the hospital name. */
  label?: string;
  /** Sizing classes for the map container — control height/width from the caller. */
  className?: string;
}

/**
 * Interactive, zoomable map centred on a lat/lng with a marker. Uses MapLibre
 * GL with free OpenFreeMap tiles (no API key). Optionally draws a geofence
 * radius and/or lets the marker be dragged.
 */
export function LocationMapPreview({
  latitude,
  longitude,
  label,
  className,
  ...mapProps
}: LocationMapPreviewProps) {
  const size = className ?? "h-full w-full";
  return (
    <div
      role="region"
      aria-label={label ? `Map showing ${label}` : "Location map"}
      className={size}
    >
      <Suspense fallback={<Skeleton className="h-full w-full rounded-none" />}>
        <InteractiveMap
          latitude={latitude}
          longitude={longitude}
          className="h-full w-full"
          {...mapProps}
        />
      </Suspense>
    </div>
  );
}
