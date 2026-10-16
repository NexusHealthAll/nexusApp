import { useMemo, useState } from "react";
import Map, {
  FullscreenControl,
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MarkerDragEvent,
} from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";

// maplibre-gl v6 looks for its worker file next to the bundled chunk, which
// Vite never emits (dev: .vite/deps, prod: hashed chunk) — so the worker 404s
// and the map renders blank. Point it at the worker asset Vite does serve.
setWorkerUrl(new URL(workerUrl, window.location.href).href);

/** Free OpenStreetMap-based vector tiles — no API key or account. */
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
  /** Draws a geofence circle of this radius (metres) around the point. */
  radiusMeters?: number;
  /** When set, the marker can be dragged and the new position is reported. */
  onMarkerChange?: (coords: { latitude: number; longitude: number }) => void;
}

/** GeoJSON polygon approximating a circle (64 segments) around a point. */
function circlePolygon(lat: number, lng: number, radiusM: number) {
  const points = 64;
  const coords: [number, number][] = [];
  const dLat = radiusM / 111_320;
  const dLng = radiusM / (111_320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * 2 * Math.PI;
    coords.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: [coords] },
  };
}

/**
 * Interactive map (MapLibre GL). Scroll-zoom is off until the user clicks the
 * map, so scrolling the page never gets hijacked by an embedded map.
 */
export default function InteractiveMap({
  latitude,
  longitude,
  zoom = 14,
  className,
  radiusMeters,
  onMarkerChange,
}: InteractiveMapProps) {
  const [scrollZoom, setScrollZoom] = useState(false);
  const circle = useMemo(
    () =>
      radiusMeters ? circlePolygon(latitude, longitude, radiusMeters) : null,
    [latitude, longitude, radiusMeters],
  );

  const handleDragEnd = (e: MarkerDragEvent) =>
    onMarkerChange?.({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });

  return (
    <div className={className ?? "h-full w-full"}>
      <Map
        key={onMarkerChange ? "static" : `${latitude},${longitude}`}
        initialViewState={{ latitude, longitude, zoom }}
        mapStyle={MAP_STYLE}
        scrollZoom={scrollZoom}
        onClick={() => setScrollZoom(true)}
        onMouseOut={() => setScrollZoom(false)}
        style={{ width: "100%", height: "100%" }}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <FullscreenControl position="top-right" />
        {circle && (
          <Source id="geofence" type="geojson" data={circle}>
            <Layer
              id="geofence-fill"
              type="fill"
              paint={{ "fill-color": "#0f766e", "fill-opacity": 0.12 }}
            />
            <Layer
              id="geofence-line"
              type="line"
              paint={{ "line-color": "#0f766e", "line-width": 2 }}
            />
          </Source>
        )}
        <Marker
          latitude={latitude}
          longitude={longitude}
          anchor="bottom"
          draggable={!!onMarkerChange}
          onDragEnd={handleDragEnd}
        >
          <MapPin
            className="h-8 w-8 fill-secondary-600 text-white drop-shadow"
            aria-hidden
          />
        </Marker>
      </Map>
    </div>
  );
}
