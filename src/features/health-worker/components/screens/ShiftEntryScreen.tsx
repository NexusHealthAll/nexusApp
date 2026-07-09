import { useRef, useState } from "react";
import { Camera, Clock, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { ApiError } from "@/lib/apiError";
import type { ApiShift } from "@/features/hospital/shifts/types";
import { Header } from "../DashboardChrome";

type Stage = "ready" | "locating" | "out-of-range" | "awaiting-approval" | "error";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ShiftEntryScreen({
  shift,
  onBack,
  onClockIn,
  onRequestApproval,
}: {
  shift: ApiShift;
  onBack: () => void;
  onClockIn: (payload: { method: "gps" | "virtual" | "manual"; latitude?: number; longitude?: number }) => Promise<void>;
  onRequestApproval: (payload: { latitude?: number; longitude?: number; photo_base64: string; photo_mime_type?: string }) => Promise<void>;
}) {
  const [stage, setStage] = useState<Stage>("ready");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClockIn = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      if (shift.shift_type === "virtual") {
        await onClockIn({ method: "virtual" });
        return;
      }

      setStage("locating");
      if (!navigator.geolocation) {
        setError("Location services aren't available on this device.");
        setStage("error");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await onClockIn({
              method: "gps",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          } catch (err) {
            if (err instanceof ApiError && err.status === 409 && /geofence/i.test(err.message)) {
              setStage("out-of-range");
            } else {
              setError(err instanceof ApiError ? err.message : "Failed to clock in.");
              setStage("error");
            }
          } finally {
            setIsSubmitting(false);
          }
        },
        () => {
          setError("We couldn't read your location. Enable location access and try again.");
          setStage("error");
          setIsSubmitting(false);
        },
      );
      return;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to clock in.");
      setStage("error");
    } finally {
      if (shift.shift_type === "virtual") setIsSubmitting(false);
    }
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSubmitting(true);
    setError("");
    try {
      const base64 = await fileToBase64(file);
      const position = await new Promise<GeolocationPosition | null>((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(resolve, () => resolve(null));
      });
      await onRequestApproval({
        latitude: position?.coords.latitude,
        longitude: position?.coords.longitude,
        photo_base64: base64,
        photo_mime_type: file.type,
      });
      setStage("awaiting-approval");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit for review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualRetry = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await onClockIn({ method: "manual" });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Manual clock-in isn't approved yet — please wait for the hospital to review your request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Shift Entry" subtitle="Verify your location" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-neutral-500">Current Facility</p>
            <h2 className="mt-2 text-xl font-bold">{shift.hospital_name ?? "Hospital"}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <p>
                <span className="block text-xs text-neutral-500">Role</span>
                {shift.role_title}
              </p>
              <p>
                <span className="block text-xs text-neutral-500">Type</span>
                {shift.shift_type === "virtual" ? "Virtual" : "In-person"}
              </p>
            </div>
          </CardContent>
        </Card>

        {stage === "out-of-range" && (
          <Card>
            <CardContent className="space-y-3 p-5 text-center">
              <MapPin className="mx-auto h-8 w-8 text-error-600" />
              <h3 className="font-bold">Outside geofence range</h3>
              <p className="text-xs text-neutral-500">
                We couldn't confirm you're on-site. Submit a photo of the entrance for hospital
                review instead.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoSelected}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isSubmitting}
                className="w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                Submit Photo for Review
              </Button>
            </CardContent>
          </Card>
        )}

        {stage === "awaiting-approval" && (
          <Card>
            <CardContent className="space-y-2 p-5 text-center">
              <h3 className="font-bold">Submitted for review</h3>
              <p className="text-xs text-neutral-500">
                The hospital needs to approve this before you can clock in manually. Check back
                shortly.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleManualRetry}
                isLoading={isSubmitting}
                className="w-full"
              >
                Try Clocking In Again
              </Button>
            </CardContent>
          </Card>
        )}

        {error && (
          <p className="rounded-xl bg-error-50 px-4 py-3 text-center text-sm text-error-700">
            {error}
          </p>
        )}

        {(stage === "ready" || stage === "locating" || stage === "error") && (
          <>
            <div className="flex h-52 items-center justify-center rounded-3xl bg-neutral-900 text-brand-300">
              <MapPin className="h-14 w-14" />
            </div>
            <Button
              type="button"
              onClick={handleClockIn}
              isLoading={stage === "locating" || isSubmitting}
              className="h-28 w-full rounded-3xl bg-error-600 text-xl hover:bg-error-700"
            >
              <Clock className="mr-3 h-8 w-8" />
              {shift.shift_type === "virtual" ? "Start Virtual Shift" : "Clock In"}
            </Button>
          </>
        )}
      </main>
    </>
  );
}
