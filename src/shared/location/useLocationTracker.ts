import { useCallback, useEffect, useRef, useState } from "react";

export type GeoPermissionState =
  | "unknown" // not yet determined (Permissions API still resolving)
  | "prompt" // browser hasn't asked the user yet
  | "granted"
  | "denied"
  | "unavailable" // site permission is granted but the device/OS location toggle is off
  | "unsupported"; // no Geolocation API in this browser

// How often to retry while blocked, so an OS-level location toggle flipped
// back on is picked up without the user having to do anything — the
// Permissions API's "change" event only tracks the browser's site
// permission, it does NOT fire when the device/OS location service itself
// is switched off/on, so polling is the only way to detect that case.
const RECOVERY_POLL_MS = 3000;

export const useLocationTracker = () => {
  const [position, setPosition] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });
  const [error, setError] = useState<
    GeolocationPositionError | { message: string } | null
  >(null);
  const [permissionState, setPermissionState] =
    useState<GeoPermissionState>("unknown");

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionState("unsupported");
      setError({ message: "Geolocation is not supported by your browser." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setError(null);
        setPermissionState("granted");
      },
      (err) => {
        setError(err);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState("denied");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          // Site permission is fine, but the device/OS can't produce a fix —
          // most commonly the device's Location Services toggle is off.
          setPermissionState("unavailable");
        }
        // TIMEOUT (code 3): transient, leave the current state as-is.
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }, []);

  // Keep the latest requestLocation in a ref so the permission-change
  // listener (registered once) always calls the current version.
  const requestLocationRef = useRef(requestLocation);
  requestLocationRef.current = requestLocation;

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState("unsupported");
      setError({ message: "Geolocation is not supported by your browser." });
      return;
    }

    let permissionStatus: PermissionStatus | null = null;

    function handlePermissionChange(this: PermissionStatus) {
      setPermissionState(this.state as GeoPermissionState);
      // Re-fetch as soon as the user flips the browser toggle to allowed —
      // don't wait for a manual retry.
      if (this.state === "granted") requestLocationRef.current();
    }

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          permissionStatus = result;
          setPermissionState(result.state as GeoPermissionState);
          result.addEventListener("change", handlePermissionChange);
        })
        .catch(() => {
          // Permissions API doesn't support the "geolocation" name on this
          // browser (e.g. older Safari) — state still resolves via the
          // getCurrentPosition success/error callbacks below.
        });
    }

    requestLocation();

    return () => {
      permissionStatus?.removeEventListener("change", handlePermissionChange);
    };
  }, [requestLocation]);

  // Keep polling until we reach a definitive outcome. Covers: (a) something
  // the Permissions API can't observe on its own, like the device location
  // toggle being off, and (b) a plain GPS timeout on the very first fix,
  // which otherwise would leave permissionState stuck on "unknown"/"prompt"
  // forever with nothing left to retry it.
  useEffect(() => {
    if (permissionState === "granted" || permissionState === "unsupported")
      return;

    const interval = setInterval(() => {
      requestLocationRef.current();
    }, RECOVERY_POLL_MS);

    return () => clearInterval(interval);
  }, [permissionState]);

  return {
    ...position,
    error,
    permissionState,
    retry: requestLocation,
  };
};
