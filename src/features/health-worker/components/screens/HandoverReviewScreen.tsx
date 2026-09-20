import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Modal } from "@/shared/components/ui/Modal";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { AttachmentGallery } from "@/shared/components/AttachmentGallery";
import { appToast } from "@/shared/components/feedback/toast";
import { ApiError } from "@/lib/apiError";
import { useHealthWorkerShifts } from "../../hooks/useHealthWorkerShifts";
import type { HandoverResponse } from "../../hooks/useHealthWorkerShifts";
import { Header, StatusBadge } from "../DashboardChrome";

/** Hours a handover must sit unapproved before the worker may nudge the hospital. */
const APPEAL_AFTER_HOURS = 24;
const APPEAL_NOTE_MAX = 1000;

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  })}, ${d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}`;
}

type DisplayStatus = "approved" | "revision_requested" | "awaiting_review";

function statusOf(h: HandoverResponse): DisplayStatus {
  if (h.hospital_approved_at) return "approved";
  if (h.revision_requested_at) return "revision_requested";
  return "awaiting_review";
}

export function HandoverReviewScreen({
  shiftId,
  onBack,
}: {
  shiftId: string;
  onBack: () => void;
}) {
  const { getHandover, appealHandover } = useHealthWorkerShifts();

  const [handover, setHandover] = useState<HandoverResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [appealOpen, setAppealOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isAppealing, setIsAppealing] = useState(false);
  const [appealError, setAppealError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    getHandover(shiftId)
      .then((data) => setHandover(data))
      .catch(() =>
        setLoadError("This handover couldn't be loaded. Please try again."),
      )
      .finally(() => setIsLoading(false));
  }, [getHandover, shiftId]);

  useEffect(load, [load]);

  const status = handover ? statusOf(handover) : null;

  const canAppeal =
    !!handover &&
    !handover.hospital_approved_at &&
    !handover.appeal_raised_at &&
    hoursSince(handover.submitted_at) > APPEAL_AFTER_HOURS;

  const sendAppeal = async () => {
    if (!handover) return;
    setIsAppealing(true);
    setAppealError(null);
    try {
      const updated = await appealHandover(
        shiftId,
        note.trim() ? { note: note.trim() } : undefined,
      );
      setHandover(updated);
      setAppealOpen(false);
      setNote("");
      appToast.success(
        "Reminder sent",
        "The hospital has been notified to review your handover.",
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // too early, already approved, or already appealed — reload to resync
        setAppealError(
          err.message ||
            "This handover can't be nudged right now — it may already be approved or appealed.",
        );
        load();
      } else if (err instanceof ApiError && err.status === 403) {
        setAppealError("Only the assigned worker can send this reminder.");
      } else if (err instanceof ApiError && err.status === 404) {
        setAppealError("No handover has been submitted for this shift yet.");
      } else {
        setAppealError(
          err instanceof ApiError ? err.message : "Couldn't send the reminder.",
        );
      }
    } finally {
      setIsAppealing(false);
    }
  };

  return (
    <>
      <Header title="Handover Status" subtitle="Approval & payout" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        {isLoading && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading…</p>
        )}

        {loadError && (
          <p className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 dark:bg-error-950/40 dark:text-error-300">
            {loadError}
          </p>
        )}

        {!isLoading && !loadError && !handover && (
          <EmptyState
            className="bg-white dark:bg-neutral-900"
            title="No handover submitted"
            description="You'll be able to track approval here once you submit a handover at clock-out."
          />
        )}

        {handover && status && (
          <>
            {/* Status card */}
            <section className="rounded-2xl bg-brand-700 p-5 text-white dark:bg-brand-800">
              <div className="flex items-center justify-between">
                <p className="text-xs text-brand-100">Handover</p>
                <StatusBadge
                  tone={
                    status === "approved"
                      ? "green"
                      : status === "revision_requested"
                        ? "red"
                        : "amber"
                  }
                >
                  {status === "approved"
                    ? "Approved"
                    : status === "revision_requested"
                      ? "Revision requested"
                      : "Awaiting review"}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm text-brand-50">
                Submitted {formatDateTime(handover.submitted_at)}
              </p>
              {status === "approved" && handover.hospital_approved_at && (
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Approved {formatDateTime(handover.hospital_approved_at)} — payout
                  released.
                </p>
              )}
              {status === "awaiting_review" && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-50">
                  <Clock className="h-4 w-4" />
                  Auto-approves {formatDateTime(handover.auto_approve_after)} if the
                  hospital doesn't act.
                </p>
              )}
            </section>

            {status === "revision_requested" && handover.revision_notes && (
              <div className="flex items-start gap-3 rounded-xl bg-warning-50 px-4 py-3.5 dark:bg-warning-950/40">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning-600 dark:text-warning-400" />
                <div>
                  <p className="text-sm font-semibold text-warning-800 dark:text-warning-300">
                    The hospital asked for changes
                  </p>
                  <p className="mt-1 text-sm text-warning-700 dark:text-warning-400">
                    {handover.revision_notes}
                  </p>
                </div>
              </div>
            )}

            {/* Submitted content */}
            <Card>
              <CardContent className="space-y-3 p-4 text-sm text-neutral-600 dark:text-neutral-400">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    Instructions
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{handover.instructions}</p>
                </div>
                {handover.equipment_status?.trim() && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                      Equipment
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">
                      {handover.equipment_status}
                    </p>
                  </div>
                )}
                {handover.image_urls.length > 0 && (
                  <AttachmentGallery urls={handover.image_urls} imageOnly />
                )}
              </CardContent>
            </Card>

            {/* Appeal / reminder */}
            {handover.appeal_raised_at ? (
              <p className="flex items-center gap-1.5 rounded-lg bg-warning-50 px-3 py-2.5 text-xs font-medium text-warning-800 dark:bg-warning-950/40 dark:text-warning-300">
                <ShieldAlert className="h-3.5 w-3.5" />
                Reminder sent {formatDateTime(handover.appeal_raised_at)} — the
                hospital has been notified.
              </p>
            ) : canAppeal ? (
              <Button
                type="button"
                className="w-full bg-brand-700"
                onClick={() => setAppealOpen(true)}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Remind hospital to approve
              </Button>
            ) : status === "awaiting_review" ? (
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                You can send the hospital a reminder once the handover has been
                awaiting approval for more than a day.
              </p>
            ) : null}
          </>
        )}
      </main>

      <Modal
        isOpen={appealOpen}
        onClose={() => setAppealOpen(false)}
        title="Remind the hospital"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            This handover has been awaiting approval for over a day. We'll record
            the reminder and email the hospital.
          </p>
          <textarea
            rows={4}
            value={note}
            maxLength={APPEAL_NOTE_MAX}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional: add anything that helps the hospital review this faster…"
            className="w-full resize-none rounded-lg bg-neutral-50 px-3 py-2 text-sm outline-none dark:bg-neutral-800"
          />
          <p className="text-right text-[11px] text-neutral-400 dark:text-neutral-500">
            {note.length}/{APPEAL_NOTE_MAX}
          </p>
          {appealError && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {appealError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAppealOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-brand-700"
              isLoading={isAppealing}
              onClick={sendAppeal}
            >
              Send reminder
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
