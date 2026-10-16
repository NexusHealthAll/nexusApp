import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PreJoinScreen } from "@/features/virtual-call/components/PreJoinScreen";
import { useAuthStore } from "@/shared/auth/store/authStore";
import { PATHS } from "@/routes/paths";
import { WorkerSessionProvider } from "../session/WorkerSessionProvider";
import { useWorkerSession } from "../session/workerSessionContext";
import { Shell, WorkerCallStrip, type MainTab } from "./HealthWorkerShell";

interface Chrome {
  activeTab: MainTab | null;
  showTabs: boolean;
  showTopBar: boolean;
  showCallBar: boolean;
}

/** Which shell chrome a route gets — mirrors the old per-view `Shell` props. */
function chromeFor(pathname: string): Chrome {
  const path = pathname.replace(/^\/medical-staff/, "").replace(/\/+$/, "") || "/";
  const tab = path.match(/^\/(home|marketplace|schedule|earnings|profile)(\/|$)/)?.[1];
  if (tab) {
    return {
      activeTab: tab as MainTab,
      showTabs: true,
      showTopBar: true,
      showCallBar: false,
    };
  }
  if (path === "/applications") {
    return { activeTab: "home", showTabs: true, showTopBar: false, showCallBar: false };
  }
  if (path === "/notifications") {
    return { activeTab: null, showTabs: true, showTopBar: false, showCallBar: false };
  }
  // /shifts/:id/... — screens that hide the tab bar while you're mid-action.
  const sub = path.replace(/^\/shifts\/[^/]+/, "");
  const bare =
    sub === "" ||
    sub === "/interest-sent" ||
    sub === "/already-applied" ||
    sub === "/confirm" ||
    sub === "/clock-in" ||
    sub === "/patients/new" ||
    sub === "/handover/review";
  const callBar =
    sub === "/active" ||
    sub === "/waiting-room" ||
    /^\/patients\/[^/]+$/.test(sub) ||
    /^\/patients\/[^/]+\/review$/.test(sub);
  return {
    activeTab: "schedule",
    showTabs: !bare,
    showTopBar: false,
    showCallBar: callBar,
  };
}

function LayoutInner() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const { activeShift, call } = useWorkerSession();
  const chrome = chromeFor(pathname);

  // Land on the dedicated call screen the moment the consultation connects.
  const prevCallState = useRef(call.state);
  useEffect(() => {
    if (prevCallState.current !== "connected" && call.state === "connected" && activeShift) {
      navigate(PATHS.medicalStaff.shiftCall(activeShift.id));
    }
    prevCallState.current = call.state;
  }, [call.state, activeShift, navigate]);

  const workerName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "You";
  const isVirtualShift = activeShift?.shift_type === "virtual";

  // Green room — gates the whole active-shift flow while the worker previews
  // devices / connects to the shift's consultation room.
  if (
    isVirtualShift &&
    (call.state === "prejoin" || call.state === "connecting" || call.state === "error")
  ) {
    return (
      <div className="min-h-screen bg-[#0d1424]">
        <PreJoinScreen
          selfName={workerName}
          remoteRoleLabel="Hospital"
          remotePresent={call.present}
          remotePresentName={call.presentName ?? activeShift?.hospital_name ?? null}
          joinBlockedReason={
            call.present
              ? undefined
              : "The hospital doesn't look present yet, but you can still join now and wait for them."
          }
          joining={call.state === "connecting"}
          error={call.error || undefined}
          onJoin={call.join}
          onCancel={call.cancelPreJoin}
        />
      </div>
    );
  }

  const goTab = (tab: MainTab) => {
    navigate(
      tab === "home"
        ? PATHS.medicalStaff.home
        : tab === "marketplace"
          ? PATHS.medicalStaff.marketplace
          : tab === "schedule"
            ? PATHS.medicalStaff.schedule
            : tab === "earnings"
              ? PATHS.medicalStaff.earnings
              : PATHS.medicalStaff.profile,
    );
  };

  return (
    <Shell
      activeTab={chrome.activeTab}
      onTabChange={goTab}
      user={user}
      onNotifications={() => navigate(PATHS.medicalStaff.notifications)}
      showTabs={chrome.showTabs}
      showTopBar={chrome.showTopBar}
      callBar={
        chrome.showCallBar && isVirtualShift ? (
          <WorkerCallStrip
            call={call}
            onOpen={() => navigate(PATHS.medicalStaff.shiftCall(activeShift.id))}
          />
        ) : null
      }
    >
      <Outlet />
    </Shell>
  );
}

/** Layout route for every post-login health-worker screen. */
export function HealthWorkerLayout() {
  return (
    <WorkerSessionProvider>
      <LayoutInner />
    </WorkerSessionProvider>
  );
}
