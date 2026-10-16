import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone } from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { ApiError } from "@/lib/apiError";
import { VirtualCallService, type CallHandoff } from "../virtualCallService";

function secondsRemaining(expiresAt: string): number {
  return Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

/**
 * "Continue on phone" (nexus-backend/docs/FRONTEND_HANDOFF.md §5) — issues a
 * short-lived code from the device already in the call and shows it as a QR
 * + link for a second device to redeem. This device stays in the call; both
 * end up connected once redeemed.
 */
export function ContinueOnPhoneButton({ shiftId }: { shiftId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [handoff, setHandoff] = useState<CallHandoff | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function issueCode() {
    setIsLoading(true);
    setError("");
    setHandoff(null);
    try {
      const result = await VirtualCallService.createHandoff(shiftId);
      setHandoff(result);
      setSecondsLeft(secondsRemaining(result.expiresAt));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't generate a code.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    issueCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!handoff) return;
    tickRef.current = setInterval(() => {
      setSecondsLeft(secondsRemaining(handoff.expiresAt));
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [handoff]);

  const expired = handoff != null && secondsLeft <= 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <Smartphone className="h-3.5 w-3.5" />
        Continue on phone
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Continue on phone" size="sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Scan this on your phone to join the same call from a second device. This device stays
            connected.
          </p>

          {isLoading ? (
            <div className="flex h-48 w-48 items-center justify-center">
              <p className="text-sm text-neutral-400 dark:text-neutral-500">Generating…</p>
            </div>
          ) : error ? (
            <p className="rounded-lg bg-error-50 px-3 py-2 text-xs text-error-700 dark:bg-error-950 dark:text-error-300">
              {error}
            </p>
          ) : handoff && !expired ? (
            <>
              <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700">
                <QRCodeSVG value={handoff.handoffUrl} size={176} />
              </div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Expires in {secondsLeft}s
              </p>
            </>
          ) : expired ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              This code expired. Generate a new one to try again.
            </p>
          ) : null}

          {(expired || error) && (
            <Button type="button" onClick={issueCode} className="w-full bg-brand-700">
              Generate new code
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}
