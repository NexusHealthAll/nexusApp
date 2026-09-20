import { useEffect, useRef, useState } from "react";
import { Clock, ImagePlus, User, X } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { AttachmentGallery } from "@/shared/components/AttachmentGallery";
import type { ApiShift } from "@/features/hospital/shifts/types";
import { uploadImages } from "@/shared/services/mediaUpload";
import type { PatientRecord } from "../../types";
import type { HandoverResponse } from "../../hooks/useHealthWorkerShifts";
import { Header, Metric } from "../DashboardChrome";

const MAX_IMAGES = 8;

export function HandoverScreen({
  shift,
  seconds,
  patients,
  handover,
  isSubmitting,
  isClockingOut,
  submitError,
  onBack,
  onSubmitHandover,
  onClockOut,
}: {
  shift: ApiShift;
  seconds: number;
  patients: PatientRecord[];
  handover: HandoverResponse | null;
  isSubmitting: boolean;
  isClockingOut: boolean;
  submitError: string | null;
  onBack: () => void;
  onSubmitHandover: (instructions: string, imageUrls: string[]) => void;
  onClockOut: () => void;
}) {
  const [instructions, setInstructions] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  // Object URLs for local previews — revoke on change/unmount.
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const submittedImages = handover?.image_urls ?? [];

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (i: number) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setUploadError(null);
    let urls: string[] = [];
    if (files.length > 0) {
      setIsUploading(true);
      try {
        urls = await uploadImages(files, "handover");
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "Couldn't upload photos.",
        );
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }
    onSubmitHandover(instructions.trim(), urls);
  };

  return (
    <>
      <Header title="Shift Completion" subtitle="Review handover summary" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <section className="rounded-2xl bg-brand-700 p-5 text-white">
          <p className="text-xs text-brand-100">Time on shift</p>
          <p className="text-4xl font-bold">
            {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-brand-100">{shift.role_title}</p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Metric label="Duration" value={`${hours}h ${minutes}m`} icon={Clock} />
          <Metric label="Patients Seen" value={String(patients.length)} icon={User} />
        </div>

        {!handover ? (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Handover Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <textarea
                rows={5}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Summarize patient status and anything the next clinician needs to know..."
                className="w-full resize-none rounded-lg bg-neutral-50 px-3 py-2 text-sm outline-none dark:bg-neutral-800"
              />

              {/* Post-shift photos */}
              <div>
                <p className="mb-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Photos (optional) · {files.length}/{MAX_IMAGES}
                </p>
                {previews.length > 0 && (
                  <div className="mb-2 grid grid-cols-4 gap-2">
                    {previews.map((src, i) => (
                      <div key={src} className="relative aspect-square">
                        <img
                          src={src}
                          alt={`Attachment ${i + 1}`}
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          aria-label={`Remove photo ${i + 1}`}
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white shadow"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={files.length >= MAX_IMAGES || isSubmitting || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Add photos
                </Button>
              </div>

              {uploadError && (
                <p className="text-sm text-error-600 dark:text-error-400">{uploadError}</p>
              )}
              {submitError && (
                <p className="text-sm text-error-600 dark:text-error-400">{submitError}</p>
              )}
              <Button
                type="button"
                className="w-full bg-brand-700"
                disabled={!instructions.trim() || isSubmitting || isUploading}
                isLoading={isSubmitting || isUploading}
                onClick={handleSubmit}
              >
                {isUploading ? "Uploading photos…" : "Submit Handover"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Handover Submitted</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0 text-sm text-neutral-600 dark:text-neutral-400">
                <p>{handover.instructions}</p>
                {submittedImages.length > 0 && (
                  <AttachmentGallery urls={submittedImages} imageOnly className="pt-1" />
                )}
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Editable until{" "}
                  {new Date(handover.editable_until).toLocaleTimeString("en-NG", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  . Auto-approves for payout within 48 hours if the hospital doesn't act first.
                </p>
              </CardContent>
            </Card>
            {submitError && (
              <p className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 dark:bg-error-950 dark:text-error-300">
                {submitError}
              </p>
            )}
            <Button
              type="button"
              className="w-full bg-brand-700"
              isLoading={isClockingOut}
              onClick={onClockOut}
            >
              Confirm Handover & Clock-Out
            </Button>
          </>
        )}
      </main>
    </>
  );
}
