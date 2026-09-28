export interface LocationMapPreviewProps {
  latitude: number;
  longitude: number;
  /** Used only for the iframe's accessible title, e.g. the hospital name. */
  label?: string;
  /** Applied to the iframe itself — control height/width from the caller. */
  className?: string;
  /** How far the map's bounding box extends past the marker, in degrees. */
  bboxDelta?: number;
}

/**
 * Lightweight OpenStreetMap iframe embed centered on a lat/lng with a
 * marker — no JS map library, no API key. Same approach already used in the
 * hospital onboarding "Location & Geofencing" step and the health-worker
 * clock-in screen, factored out here so it can be reused wherever the app
 * needs to show "where is this hospital" from saved coordinates.
 */
export function LocationMapPreview({
  latitude,
  longitude,
  label,
  className,
  bboxDelta = 0.01,
}: LocationMapPreviewProps) {
  const mapSrc =
    `https://www.openstreetmap.org/export/embed.html?bbox=` +
    `${longitude - bboxDelta}%2C${latitude - bboxDelta}%2C${longitude + bboxDelta}%2C${latitude + bboxDelta}` +
    `&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <iframe
      title={label ? `Map showing ${label}` : "Location map"}
      src={mapSrc}
      className={className ?? "h-full w-full"}
      style={{ border: 0 }}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
