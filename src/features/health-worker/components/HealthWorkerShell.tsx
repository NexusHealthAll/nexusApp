import type { ReactNode } from "react";
import {
  Bell,
  BriefcaseMedical,
  Calendar,
  Home,
  Mic,
  MicOff,
  PhoneOff,
  User,
  Video,
  VideoOff,
  Wallet,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { VirtualCallRoom } from "@/features/virtual-call/useVirtualCallRoom";
import type { AuthUser } from "@/shared/auth/store/authStore";
import { ThemeToggle } from "@/shared/components/ui/ThemeToggle";
import { Avatar } from "./DashboardChrome";
import { InstallPromptBanner } from "./InstallPromptBanner";
import { UpdateAvailableToast } from "./UpdateAvailableToast";

export type MainTab = "home" | "marketplace" | "schedule" | "earnings" | "profile";

// Matches the gradient wordmark treatment on the Figma "NEXUSCARE" logo mark.
const GRADIENT_WORDMARK_CLASS =
  "bg-gradient-to-r from-brand-700 via-brand-600 to-brand-400 bg-clip-text text-transparent";

export function Shell({
  children,
  activeTab,
  onTabChange,
  user,
  onNotifications,
  showTabs = true,
  showTopBar = false,
  callBar = null,
}: {
  children: ReactNode;
  /** Highlighted tab; null when the current screen belongs to none. */
  activeTab: MainTab | null;
  onTabChange: (tab: MainTab) => void;
  user: AuthUser | null;
  onNotifications: () => void;
  showTabs?: boolean;
  showTopBar?: boolean;
  /** Persistent virtual-call status bar, floated above the content. */
  callBar?: ReactNode;
}) {
  const tabs = [
    { id: "home" as const, label: "Home", icon: Home },
    { id: "marketplace" as const, label: "Marketplace", icon: BriefcaseMedical },
    { id: "schedule" as const, label: "Schedule", icon: Calendar },
    { id: "earnings" as const, label: "Earnings", icon: Wallet },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || null;

  return (
    <div className="min-h-screen bg-[#f5faff] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-200">
      <div className="flex min-h-screen w-full bg-[#f5faff] shadow-2xl dark:bg-neutral-950">
        {showTabs && (
          <aside className="hidden md:flex md:w-72 md:flex-col md:shrink-0 border-r border-neutral-100 bg-white/95 p-4 dark:border-neutral-800 dark:bg-neutral-900/95">
            <div className="mb-4">
              <p className={cn("text-[10px] font-extrabold uppercase tracking-wide", GRADIENT_WORDMARK_CLASS)}>
                NEXUSCARE
              </p>
            </div>
            <nav className="flex flex-col gap-2 mt-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-brand-700 text-white dark:bg-brand-600"
                        : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        <div className="flex-1 overflow-y-auto pb-24">
          <div className="mx-auto w-full max-w-[430px] md:max-w-none">
            {showTopBar && (
              <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-[#f5faff]/80 px-4 py-3 backdrop-blur-md dark:bg-neutral-900/80 dark:border-b dark:border-neutral-800">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={displayName} photoUrl={user?.avatar_url} size="sm" />
                  <span className={cn("truncate text-sm font-extrabold tracking-tight", GRADIENT_WORDMARK_CLASS)}>
                    NEXUSCARE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    type="button"
                    onClick={onNotifications}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-neutral-800"
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                </div>
              </header>
            )}
            <div className="px-4 md:px-8">
              {showTopBar && <InstallPromptBanner className="mb-4" />}
              {children}
            </div>
          </div>
        </div>

        {callBar}

        {showTabs && (
          <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 items-center gap-1 rounded-t-2xl bg-[#f5faff]/80 px-2 py-2 shadow-[0_-8px_24px_0_rgba(15,29,37,0.06)] backdrop-blur-md dark:bg-neutral-900/90 dark:border-t dark:border-neutral-800 md:hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors",
                    isActive
                      ? "bg-brand-600 text-white dark:bg-brand-700"
                      : "text-neutral-500 dark:text-neutral-400",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className={isActive ? "text-brand-100" : ""}>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        <UpdateAvailableToast />
      </div>
    </div>
  );
}

/**
 * Persistent virtual-visit call bar for the health worker, floated bottom-centre
 * across the active-shift flow. Handles joining before connection, quick
 * mute/camera toggles while connected, and leaving (which keeps the room up for
 * the hospital). The full Meet-style stage lives inside ConsultationScreen.
 */
export function WorkerCallStrip({
  call,
  onOpen,
}: {
  call: VirtualCallRoom;
  onOpen: () => void;
}) {
  if (call.state === "prejoin" || call.state === "connecting") return null;

  const connected = call.state === "connected";

  return (
    <div className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-neutral-900/90 px-3 py-2 text-white shadow-2xl backdrop-blur md:bottom-6">
      <button
        type="button"
        onClick={connected ? onOpen : undefined}
        disabled={!connected}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-1 text-xs font-semibold",
          connected && "hover:text-white/80",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            connected ? "animate-pulse bg-success-400" : "bg-white/40",
          )}
        />
        {connected ? "In consultation call" : "Consultation call"}
      </button>

      {connected ? (
        <>
          <button
            type="button"
            onClick={call.toggleMic}
            aria-label={call.micOn ? "Mute microphone" : "Unmute microphone"}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              call.micOn
                ? "bg-white/15 hover:bg-white/25"
                : "bg-error-500 hover:bg-error-600",
            )}
          >
            {call.micOn ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={call.toggleCamera}
            aria-label={call.cameraOn ? "Turn off camera" : "Turn on camera"}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              call.cameraOn
                ? "bg-white/15 hover:bg-white/25"
                : "bg-error-500 hover:bg-error-600",
            )}
          >
            {call.cameraOn ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={call.leave}
            className="flex items-center gap-1.5 rounded-full bg-error-500 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-error-600"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            Leave
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={call.openPreJoin}
          // Presence is a polled, best-effort signal (webhooks/reconciler can
          // lag or miss) — it's a hint, never a hard gate on joining a room
          // that may already be live.
          title={
            !call.present && call.state !== "ended"
              ? "The hospital doesn't look present yet — you can still join and wait"
              : undefined
          }
          className="rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-bold transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {call.state === "ended" ? "Rejoin" : "Join call"}
        </button>
      )}
    </div>
  );
}
