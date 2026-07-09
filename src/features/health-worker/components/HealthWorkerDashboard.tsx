import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  BriefcaseMedical,
  Calendar,
  Home,
  User,
  Wallet,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { appToast } from "@/shared/components/feedback/toast";
import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";
import { useAuthStore } from "@/shared/auth/store/authStore";
import type { AuthUser } from "@/shared/auth/store/authStore";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import type { ApiShift } from "@/features/hospital/shifts/types";
import {
  useHealthWorkerShifts,
  type EarningsSummary,
  type HandoverResponse,
  type MyApplicationEntry,
  type NdprConsent,
  type NearbyShiftCard,
} from "../hooks/useHealthWorkerShifts";
import type { PatientRecord } from "../types";
import { Avatar } from "./DashboardChrome";
import { HomeScreen } from "./screens/HomeScreen";
import { MarketplaceScreen } from "./screens/MarketplaceScreen";
import { ShiftDetailScreen } from "./screens/ShiftDetailScreen";
import { ShiftInterestSentScreen } from "./screens/ShiftInterestSentScreen";
import { AlreadyAppliedScreen } from "./screens/AlreadyAppliedScreen";
import { MyApplicationsScreen } from "./screens/MyApplicationsScreen";
import { ScheduleScreen, type ScheduleTab } from "./screens/ScheduleScreen";
import { ConfirmShiftScreen } from "./screens/ConfirmShiftScreen";
import { ShiftEntryScreen } from "./screens/ShiftEntryScreen";
import { ActiveShiftScreen } from "./screens/ActiveShiftScreen";
import { WaitingRoomScreen } from "./screens/WaitingRoomScreen";
import { PatientIntakeScreen } from "./screens/PatientIntakeScreen";
import { PatientDetailScreen } from "./screens/PatientDetailScreen";
import { ConsultationScreen } from "./screens/ConsultationScreen";
import { ClinicalReviewScreen } from "./screens/ClinicalReviewScreen";
import { HandoverScreen } from "./screens/HandoverScreen";
import { EarningsScreen } from "./screens/EarningsScreen";
import { ProfileScreen, type ProfileEditableFields } from "./screens/ProfileScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";

type MainTab = "home" | "marketplace" | "schedule" | "earnings" | "profile";
type FlowView =
  | "main"
  | "notifications"
  | "shift-detail"
  | "shift-interest-sent"
  | "already-applied"
  | "my-applications"
  | "confirm-shift"
  | "shift-entry"
  | "active-shift"
  | "waiting-room"
  | "patient-intake"
  | "patient-detail"
  | "consultation"
  | "clinical-review"
  | "handover";

// Matches the gradient wordmark treatment on the Figma "NEXUSCARE" logo mark.
const GRADIENT_WORDMARK_CLASS =
  "bg-gradient-to-r from-brand-700 via-brand-600 to-brand-400 bg-clip-text text-transparent";

function Shell({
  children,
  activeTab,
  onTabChange,
  user,
  onNotifications,
  showTabs = true,
  showTopBar = false,
}: {
  children: ReactNode;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  user: AuthUser | null;
  onNotifications: () => void;
  showTabs?: boolean;
  // Only the main tab screens (home/marketplace/schedule/earnings/profile) get the
  // persistent NexusCare top app bar — every other view renders its own contextual
  // back/title header (see DashboardChrome's Header), so showing both would double up.
  showTopBar?: boolean;
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
    <div className="min-h-screen bg-[#f5faff] text-neutral-950">
      <div className="flex min-h-screen w-full bg-[#f5faff] shadow-2xl">
        {showTabs && (
          <aside className="hidden md:flex md:w-72 md:flex-col md:shrink-0 border-r border-neutral-100 bg-white/95 p-4">
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
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold",
                      isActive ? "bg-brand-700 text-white" : "text-neutral-700 hover:bg-neutral-50",
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
              <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-[#f5faff]/80 px-4 py-3 backdrop-blur-md">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={displayName} photoUrl={user?.avatar_url} size="sm" />
                  <span className={cn("truncate text-sm font-extrabold tracking-tight", GRADIENT_WORDMARK_CLASS)}>
                    NEXUSCARE
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onNotifications}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-brand-700 hover:bg-brand-50"
                >
                  <Bell className="h-5 w-5" />
                </button>
              </header>
            )}
            <div className="px-4 md:px-8">{children}</div>
          </div>
        </div>

        {showTabs && (
          <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 items-center gap-1 rounded-t-2xl bg-[#f5faff]/80 px-2 py-2 shadow-[0_-8px_24px_0_rgba(15,29,37,0.06)] backdrop-blur-md md:hidden">
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
                    isActive ? "bg-brand-600 text-white" : "text-neutral-500",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className={isActive ? "text-brand-100" : ""}>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

export function HealthWorkerDashboard() {
  const user = useAuthStore((s) => s.user);
  const workerApi = useHealthWorkerShifts();
  const { getShiftDetails } = useHospitalShift();

  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [view, setView] = useState<FlowView>("main");
  const [scheduleTab, setScheduleTab] = useState<ScheduleTab>("upcoming");
  const [searchTerm, setSearchTerm] = useState("");

  // Data — each of these three calls fails independently on the real backend
  // (nearby-shift discovery has a live bug unrelated to the other two), so
  // they're tracked with separate error state rather than one shared flag.
  const [nearbyShifts, setNearbyShifts] = useState<NearbyShiftCard[]>([]);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [applications, setApplications] = useState<MyApplicationEntry[]>([]);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [earningsError, setEarningsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<ApiShift | null>(null);
  const [isInterestSubmitting, setIsInterestSubmitting] = useState(false);

  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const [activeShift, setActiveShift] = useState<ApiShift | null>(null);
  const [shiftSeconds, setShiftSeconds] = useState(0);
  const [handover, setHandover] = useState<HandoverResponse | null>(null);
  const [isSubmittingHandover, setIsSubmittingHandover] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);
  const [handoverError, setHandoverError] = useState<string | null>(null);

  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  const [isBookingActive, setIsBookingActive] = useState(true);
  const [profileFields, setProfileFields] = useState<ProfileEditableFields | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setNearbyError(null);
    setApplicationsError(null);
    setEarningsError(null);

    const [shiftsResult, appsResult, earnResult] = await Promise.allSettled([
      workerApi.getNearbyShifts(),
      workerApi.getMyApplications(),
      workerApi.getEarnings(),
    ]);

    if (shiftsResult.status === "fulfilled") {
      setNearbyShifts(shiftsResult.value);
    } else {
      setNearbyError(
        shiftsResult.reason instanceof ApiError
          ? shiftsResult.reason.message
          : "Failed to load nearby shifts.",
      );
    }

    if (appsResult.status === "fulfilled") {
      setApplications(appsResult.value);
    } else {
      setApplicationsError(
        appsResult.reason instanceof ApiError
          ? appsResult.reason.message
          : "Failed to load your applications.",
      );
    }

    if (earnResult.status === "fulfilled") {
      setEarnings(earnResult.value);
    } else {
      setEarningsError(
        earnResult.reason instanceof ApiError
          ? earnResult.reason.message
          : "Failed to load earnings.",
      );
    }

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (view !== "active-shift") return;
    const timer = window.setInterval(() => setShiftSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, [view]);

  useEffect(() => {
    if (view !== "consultation") return;
    return () => {
      audioTrackRef.current?.stop();
      videoTrackRef.current?.stop();
      audioTrackRef.current = null;
      videoTrackRef.current = null;
      setIsMicOn(false);
      setIsCamOn(false);
    };
  }, [view]);

  async function toggleMic() {
    try {
      if (isMicOn) {
        audioTrackRef.current?.stop();
        audioTrackRef.current = null;
        setIsMicOn(false);
        return;
      }
      if (!navigator?.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];
      if (track) {
        audioTrackRef.current = track;
        setIsMicOn(true);
      }
    } catch (err) {
      console.error("toggleMic error:", err);
    }
  }

  async function toggleCam() {
    try {
      if (isCamOn) {
        videoTrackRef.current?.stop();
        videoTrackRef.current = null;
        setIsCamOn(false);
        return;
      }
      if (!navigator?.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      if (track) {
        videoTrackRef.current = track;
        setIsCamOn(true);
      }
    } catch (err) {
      console.error("toggleCam error:", err);
    }
  }

  function goTab(tab: MainTab) {
    setActiveTab(tab);
    setView("main");
  }

  function openShiftDetail(shiftId: string) {
    setSelectedShiftId(shiftId);
    setView("shift-detail");
  }

  async function handleInterested() {
    if (!selectedShiftId) return;
    setIsInterestSubmitting(true);
    try {
      await workerApi.expressInterest(selectedShiftId);
      setView("shift-interest-sent");
      loadDashboardData();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setView("already-applied");
      } else {
        appToast.fromError(err, "Failed to express interest. Please try again.");
      }
    } finally {
      setIsInterestSubmitting(false);
    }
  }

  async function openConfirmShift(shiftId: string) {
    setSelectedShiftId(shiftId);
    setAcceptError(null);
    try {
      const shift = await getShiftDetails(shiftId);
      setSelectedShift(shift);
      setView("confirm-shift");
    } catch {
      appToast.error("Couldn't load this shift. Please try again.");
    }
  }

  async function handleAccept(consent: NdprConsent) {
    if (!selectedShiftId) return;
    setIsAccepting(true);
    setAcceptError(null);
    try {
      await workerApi.acceptOffer(selectedShiftId, consent);
      appToast.success("Shift accepted", "You're confirmed for this shift.");
      await loadDashboardData();
      setActiveTab("schedule");
      setScheduleTab("upcoming");
      setView("main");
    } catch (err) {
      setAcceptError(err instanceof ApiError ? err.message : "Failed to accept this shift.");
    } finally {
      setIsAccepting(false);
    }
  }

  async function openShiftEntry(shiftId: string) {
    setSelectedShiftId(shiftId);
    try {
      const shift = await getShiftDetails(shiftId);
      setSelectedShift(shift);
      setView("shift-entry");
    } catch {
      appToast.error("Couldn't load this shift. Please try again.");
    }
  }

  async function handleClockIn(payload: { method: "gps" | "virtual" | "manual"; latitude?: number; longitude?: number }) {
    if (!selectedShiftId || !selectedShift) return;
    await workerApi.clockIn(selectedShiftId, payload);
    setActiveShift(selectedShift);
    setShiftSeconds(0);
    setPatients([]);
    setHandover(null);
    setView("active-shift");
    setScheduleTab("active");
    appToast.success("Clocked in", "Have a great shift.");
  }

  async function handleRequestApproval(payload: { latitude?: number; longitude?: number; photo_base64: string; photo_mime_type?: string }) {
    if (!selectedShiftId) return;
    await workerApi.requestClockinApproval(selectedShiftId, payload);
  }

  function handleNewPatientSubmit(patient: PatientRecord) {
    setPatients((prev) => [...prev, patient]);
    setView("waiting-room");
  }

  function handleStartConsultation(patient: PatientRecord) {
    setSelectedPatient(patient);
    setPatients((prev) =>
      prev.map((p) => (p.id === patient.id ? { ...p, status: "in-consultation" } : p)),
    );
    setView("consultation");
  }

  function handleFinalizeReport(notes: NonNullable<PatientRecord["reportNotes"]>) {
    if (!selectedPatient) return;
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient.id ? { ...p, status: "seen", reportNotes: notes } : p,
      ),
    );
    setView("active-shift");
  }

  async function handleSubmitHandover(instructions: string) {
    if (!selectedShiftId) return;
    setIsSubmittingHandover(true);
    setHandoverError(null);
    try {
      const response = await workerApi.submitHandover(selectedShiftId, {
        patients_seen: patients.length,
        instructions,
      });
      setHandover(response);
    } catch (err) {
      setHandoverError(err instanceof ApiError ? err.message : "Failed to submit handover.");
    } finally {
      setIsSubmittingHandover(false);
    }
  }

  async function handleClockOut() {
    if (!selectedShiftId) return;
    setIsClockingOut(true);
    setHandoverError(null);
    try {
      await workerApi.clockOut(selectedShiftId);
      appToast.success("Clocked out", "Nice work today.");
      setActiveShift(null);
      setHandover(null);
      setPatients([]);
      setActiveTab("earnings");
      setView("main");
      loadDashboardData();
    } catch (err) {
      setHandoverError(err instanceof ApiError ? err.message : "Failed to clock out.");
    } finally {
      setIsClockingOut(false);
    }
  }

  async function handleSaveProfile(fields: ProfileEditableFields) {
    const clinicianId = useAuthStore.getState().clinicianId;
    if (!clinicianId) {
      setProfileSaveError("We couldn't find your clinician account for this session.");
      return;
    }
    setIsSavingProfile(true);
    setProfileSaveError(null);
    try {
      await apiClient.put(`/api/v1/clinicians/${encodeURIComponent(clinicianId)}/profile`, {
        first_name: fields.firstName,
        last_name: fields.lastName,
        role: fields.role,
        license_number: fields.licenseNumber,
        specialty: fields.specialty,
      });
      setProfileFields(fields);
      useAuthStore.getState().setAuthSession({
        accessToken: useAuthStore.getState().accessToken,
        refreshToken: useAuthStore.getState().refreshToken,
        user: { ...(user ?? { id: "" }), first_name: fields.firstName, last_name: fields.lastName },
      });
      appToast.success("Profile updated");
    } catch (err) {
      setProfileSaveError(err instanceof ApiError ? err.message : "Failed to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  function renderMainTab() {
    switch (activeTab) {
      case "marketplace":
        return (
          <MarketplaceScreen
            shifts={nearbyShifts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onOpenShift={(shift) => openShiftDetail(shift.shift_id)}
            onMyApplications={() => setView("my-applications")}
            isLoading={isLoading}
            loadError={nearbyError}
          />
        );
      case "schedule":
        return (
          <ScheduleScreen
            entries={applications}
            scheduleTab={scheduleTab}
            isLoading={isLoading}
            loadError={applicationsError}
            onScheduleTabChange={setScheduleTab}
            onOpenShift={openShiftDetail}
            onShiftEntry={openShiftEntry}
          />
        );
      case "earnings":
        return <EarningsScreen earnings={earnings} isLoading={isLoading} loadError={earningsError} />;
      case "profile":
        return (
          <ProfileScreen
            user={user}
            editableFields={profileFields}
            isBookingActive={isBookingActive}
            onToggleBooking={() => setIsBookingActive((v) => !v)}
            onSaveProfile={handleSaveProfile}
            isSaving={isSavingProfile}
            saveError={profileSaveError}
            onLogout={() => {
              useAuthStore.getState().clearAuthSession();
              window.location.href = "/auth/login";
            }}
          />
        );
      case "home":
      default:
        return (
          <HomeScreen
            user={user}
            applications={applications}
            earnings={earnings}
            isLoading={isLoading}
            isBookingActive={isBookingActive}
            onMarketplace={() => goTab("marketplace")}
            onOpenShift={openShiftDetail}
          />
        );
    }
  }

  if (view === "notifications") {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")}>
        <NotificationsScreen onBack={() => setView("main")} />
      </Shell>
    );
  }

  if (view === "shift-detail" && selectedShiftId) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")} showTabs={false}>
        <ShiftDetailScreen
          shiftId={selectedShiftId}
          onBack={() => setView("main")}
          onInterested={handleInterested}
          onLoaded={setSelectedShift}
          isSubmitting={isInterestSubmitting}
        />
      </Shell>
    );
  }

  if (view === "shift-interest-sent" && selectedShift) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")} showTabs={false}>
        <ShiftInterestSentScreen
          shift={selectedShift}
          onGoToApplications={() => {
            setActiveTab("home");
            setView("my-applications");
          }}
          onDashboard={() => {
            setActiveTab("home");
            setView("main");
          }}
        />
      </Shell>
    );
  }

  if (view === "already-applied") {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")} showTabs={false}>
        <AlreadyAppliedScreen
          onBack={() => setView("main")}
          onGoToApplications={() => setView("my-applications")}
        />
      </Shell>
    );
  }

  if (view === "my-applications") {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")}>
        <MyApplicationsScreen
          entries={applications}
          isLoading={isLoading}
          loadError={applicationsError}
          onBack={() => setView("main")}
          onRefresh={loadDashboardData}
          onRespondToOffer={openConfirmShift}
        />
      </Shell>
    );
  }

  if (view === "confirm-shift" && selectedShift) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")} showTabs={false}>
        <ConfirmShiftScreen
          shift={selectedShift}
          onBack={() => setView("main")}
          onConfirm={handleAccept}
          isSubmitting={isAccepting}
          submitError={acceptError}
        />
      </Shell>
    );
  }

  if (view === "shift-entry" && selectedShift) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")} showTabs={false}>
        <ShiftEntryScreen
          shift={selectedShift}
          onBack={() => setView("main")}
          onClockIn={handleClockIn}
          onRequestApproval={handleRequestApproval}
        />
      </Shell>
    );
  }

  if (view === "active-shift" && activeShift) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")}>
        <ActiveShiftScreen
          shift={activeShift}
          seconds={shiftSeconds}
          patients={patients}
          onPatientSelect={(patient) => {
            setSelectedPatient(patient);
            setView("patient-detail");
          }}
          onNewPatient={() => setView("patient-intake")}
          onClockOut={() => setView("handover")}
        />
      </Shell>
    );
  }

  if (view === "patient-intake") {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")} showTabs={false}>
        <PatientIntakeScreen
          onBack={() => setView("active-shift")}
          onSubmit={handleNewPatientSubmit}
        />
      </Shell>
    );
  }

  if (view === "waiting-room") {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")}>
        <WaitingRoomScreen
          patients={patients}
          onBack={() => setView("active-shift")}
          onStartConsultation={handleStartConsultation}
          onNewPatient={() => setView("patient-intake")}
        />
      </Shell>
    );
  }

  if (view === "patient-detail" && selectedPatient) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")}>
        <PatientDetailScreen
          patient={selectedPatient}
          onBack={() => setView("active-shift")}
          onStartConsultation={() => handleStartConsultation(selectedPatient)}
        />
      </Shell>
    );
  }

  if (view === "consultation" && selectedPatient && activeShift) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")}>
        <ConsultationScreen
          shift={activeShift}
          patient={selectedPatient}
          onBack={() => setView("waiting-room")}
          onViewPatient={() => setView("patient-detail")}
          onReview={() => setView("clinical-review")}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
          isMicOn={isMicOn}
          isCamOn={isCamOn}
        />
      </Shell>
    );
  }

  if (view === "clinical-review" && selectedPatient) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")}>
        <ClinicalReviewScreen
          patient={selectedPatient}
          onBack={() => setView("consultation")}
          onFinalize={handleFinalizeReport}
        />
      </Shell>
    );
  }

  if (view === "handover" && activeShift) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} user={user} onNotifications={() => setView("notifications")}>
        <HandoverScreen
          shift={activeShift}
          seconds={shiftSeconds}
          patients={patients}
          handover={handover}
          isSubmitting={isSubmittingHandover}
          isClockingOut={isClockingOut}
          submitError={handoverError}
          onBack={() => setView("active-shift")}
          onSubmitHandover={handleSubmitHandover}
          onClockOut={handleClockOut}
        />
      </Shell>
    );
  }

  return (
    <Shell
      activeTab={activeTab}
      onTabChange={goTab}
      user={user}
      onNotifications={() => setView("notifications")}
      showTopBar
    >
      {renderMainTab()}
    </Shell>
  );
}
