import { useEffect, useState } from "react";
import { useVirtualCallRoom } from "../useVirtualCallRoom";
import { CallStage } from "./CallStage";
import { PreJoinScreen } from "./PreJoinScreen";

/**
 * Standalone, unauthenticated page for "continue on phone"
 * (nexus-backend/docs/FRONTEND_HANDOFF.md §5) — reached by scanning the QR
 * from ContinueOnPhoneButton. Deliberately outside the authenticated route
 * trees: this device has no app session, the code itself is the credential.
 *
 * The code is read from the URL *fragment* (`#c=...`), never a query
 * string — browsers never send a fragment to the server, which keeps the
 * credential out of logs and Referer headers. Never move it to a query
 * param, and never log it.
 */
export function HandoffRedeemPage() {
  const call = useVirtualCallRoom(undefined, "Phone", "worker");
  const [code, setCode] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const value = new URLSearchParams(hash).get("c");
    setCode(value);
    if (value) call.openPreJoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showPreJoin =
    call.state === "prejoin" || call.state === "connecting" || call.state === "error";

  if (code === undefined) return null;

  if (!code) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0d1424] px-6 text-center">
        <p className="text-lg font-semibold text-white">Invalid link</p>
        <p className="max-w-sm text-sm text-white/60">
          This "continue on phone" link is missing its code. Ask for a fresh QR code from the
          device already in the call.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1424]">
      {showPreJoin ? (
        <PreJoinScreen
          selfName="You"
          remotePresent
          remotePresentName={null}
          joining={call.state === "connecting"}
          error={call.error || undefined}
          onJoin={(opts) => call.joinWithCode(code, opts)}
          onCancel={() => window.history.back()}
        />
      ) : call.state === "connected" ? (
        <div className="p-4">
          <CallStage call={call} selfLabel="You" remoteLabel="Call" remoteFallbackName={null} remoteRole="the other party" onHangup={call.leave} hangupLabel="Leave" />
        </div>
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-lg font-semibold text-white">You've left the call.</p>
        </div>
      )}
    </div>
  );
}
