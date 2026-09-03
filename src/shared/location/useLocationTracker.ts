import { useCallback, useEffect, useRef, useState } from "react";

export type GeoPermissionState =
  | "unknown" // not yet determined (Permissions API still resolving)
  | "prompt" // browser hasn't asked the user yet
  | "granted"
  | "denied"
  | "unsupported"; // no Geolocation API in this browser

// How often to quietly re-try a position fix while we don't have one yet.
// This is a background convenience only — it never gates the UI. A fix that
// fails with POSITION_UNAVAILABLE / TIMEOUT (common on desktops with no GPS
// even when the browser permission is granted and OS location is on) simply
// leaves us without coordinates; the user can still type an address.
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
  // True once the very first getCurrentPosition attempt has come back (success
  // OR failure). Used purely to dismiss the brief "checking location…" splash —
  // never to block the form.
  const [hasAttempted, setHasAttempted] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionState("unsupported");
      setError({ message: "Geolocation is not supported by your browser." });
      setHasAttempted(true);
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
        setHasAttempted(true);
      },
      (err) => {
        setHasAttempted(true);
        // The ONLY blocking condition: the user has actively blocked location
        // for this site in the browser. Everything else (POSITION_UNAVAILABLE,
        // TIMEOUT) is treated as "no fix right now" — we keep the recorded
        // error for display but do not change permissionState, so the form
        // still renders and address-based geocoding takes over.
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState("denied");
        }
        setError(err);
      },
      {
        // High accuracy forces a GPS fix, which many laptops lack — Chrome
        // then fails outright with POSITION_UNAVAILABLE instead of falling
        // back to Wi-Fi-based positioning. Network-based positioning is
        // reliable across desktop and mobile, so use it here.
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }, []);
  const requestLocationRef = useRef(requestLocation);
  requestLocationRef.current = requestLocation;

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState("unsupported");
      setError({ message: "Geolocation is not supported by your browser." });
      setHasAttempted(true);
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
          // Only adopt a browser permission verdict — "granted" / "denied" /
          // "prompt". Never let anything else here override us.
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

  // Keep quietly retrying until we actually have a position. Stops once we do,
  // or once the browser has definitively denied/unsupported location (no point
  // retrying those). A transient POSITION_UNAVAILABLE / TIMEOUT keeps us
  // retrying in the background without ever blocking the UI.
  useEffect(() => {
    if (
      position.latitude != null ||
      permissionState === "denied" ||
      permissionState === "unsupported"
    )
      return;

    const interval = setInterval(() => {
      requestLocationRef.current();
    }, RECOVERY_POLL_MS);

    return () => clearInterval(interval);
  }, [position.latitude, permissionState]);

  return {
    ...position,
    error,
    permissionState,
    hasAttempted,
    retry: requestLocation,
  };
};
