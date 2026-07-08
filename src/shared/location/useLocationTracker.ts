import { useEffect, useState } from "react";

export const useLocationTracker = () => {
  const [position, setPosition] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });
  const [error, setError] = useState<GeolocationPositionError | { message: string } | null>(
    null,
  );

  useEffect(() => {
    // 1. Check if the browser supports the Geolocation API
    if (!navigator.geolocation) {
      setError({ message: "Geolocation is not supported by your browser." });
      return;
    }

    // 2. Success callback to handle the coordinates
    const handleSuccess = (pos: GeolocationPosition) => {
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    };

    // 3. Error callback to handle denials or timeouts
    const handleError = (err: GeolocationPositionError) => {
      console.log("Error callback: ", err);
      setError(err);
    };

    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") {
        // You already have access
        console.log("User allowed geolocation access");
      } else if (result.state === "prompt") {
        // User hasn't chosen yet; they will see a prompt when you request location
        console.log("User is being prompted for geolocation access");
      } else if (result.state === "denied") {
        // User blocked access. You must show instructions on how to reset browser settings
        console.log("User denied geolocation access");
      }
    });

    // 4. Request the current location
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true, // Uses GPS if available
      timeout: 5000, // Time before throwing a timeout error
      maximumAge: 0, // Force fresh location data instead of cached data
    });
  }, []);

  return {
    ...position,
    error,
  };
};
