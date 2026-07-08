import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  BriefcaseMedical,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  FileText,
  Home,
  LogOut,
  MapPin,
  MessageSquare,
  Mic,
  MicOff,
  Navigation,
  Settings,
  ShieldCheck,
  Star,
  Stethoscope,
  User,
  Video,
  Wallet,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { cn } from "@/shared/utils/cn";
import { authUtils } from "@/features/auth/utils/authUtils";
import {
  AvailableShift,
  ActiveShift,
  DashboardStats,
  HealthWorkerProfile,
  HealthWorkerService,
  ShiftEarnings,
  ShiftHistoryItem,
} from "../services/healthWorkerService";

type MainTab = "home" | "marketplace" | "schedule" | "earnings" | "profile";
type ScheduleTab = "upcoming" | "active" | "completed";
type FlowView =
  | "main"
  | "notifications"
  | "shift-detail"
  | "shift-confirmed"
  | "shift-entry"
  | "active-shift"
  | "waiting-room"
  | "consultation"
  | "clinical-review"
  | "handover";

interface HealthWorkerDashboardProps {
  workerId?: string;
}

interface PatientQueueItem {
  id: string;
  name: string;
  room: string;
  age: number;
  status: "medication" | "stable" | "monitoring" | "waiting";
  note: string;
}

const fallbackStats: DashboardStats = {
  rating: 4.9,
  ratingCount: 45,
  shiftsThisMonth: 8,
  shiftsCompleted: 4,
  totalEarnings: "₦385k",
  earningsMonthLabel: "Apr 2026",
  hoursWorked: "34.5h",
  hoursShiftCount: 8,
  weeklyEarnings: "₦429k",
};

const fallbackEarnings: ShiftEarnings = {
  weeklyHours: 32.5,
  weeklyEarnings: 428500,
  monthlyEarnings: 684200,
  totalEarnings: 248500,
  averageHourlyRate: 7500,
};

const patientQueue: PatientQueueItem[] = [
  {
    id: "P-5821",
    name: "Smith, John",
    room: "Room 302",
    age: 54,
    status: "medication",
    note: "Overdue 15m",
  },
  {
    id: "P-1184",
    name: "Lee, David",
    room: "Room 304",
    age: 45,
    status: "stable",
    note: "Pre-op",
  },
  {
    id: "P-9021",
    name: "Obi, Chinelo",
    room: "Room 310",
    age: 68,
    status: "monitoring",
    note: "Continuous monitoring",
  },
];

const notifications = [
  {
    title: "New Shift Offer: ICU",
    body: "Lagos University Teaching Hospital is requesting specialized nurse support.",
    meta: "2m ago",
    kind: "shift",
  },
  {
    title: "Payment Confirmed",
    body: "Your earnings for the week have been transferred.",
    meta: "1h ago",
    kind: "payment",
  },
  {
    title: "Compliance Update",
    body: "Your medical license documentation expires in 14 days.",
    meta: "4h ago",
    kind: "alert",
  },
];

function getStoredWorkerId(fallback?: string): string {
  const user = authUtils.getCurrentUser();
  return user?.id || fallback || "HW001";
}

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function getShiftPayout(shift: AvailableShift): string {
  const hours = Number.parseInt(shift.duration, 10) || 12;
  return formatCurrency(shift.hourlyRate * hours);
}

function Shell({
  children,
  activeTab,
  onTabChange,
  showTabs = true,
}: {
  children: ReactNode;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  showTabs?: boolean;
}) {
  const tabs = [
    { id: "home" as const, label: "Home", icon: Home },
    { id: "marketplace" as const, label: "Marketplace", icon: BriefcaseMedical },
    { id: "schedule" as const, label: "Schedule", icon: Calendar },
    { id: "earnings" as const, label: "Earnings", icon: Wallet },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#eef7fb] text-neutral-950">
      <div className="flex min-h-screen w-full bg-[#f6fbff] shadow-2xl">
        {/** Desktop left sidebar (md+) */}
        {showTabs && (
          <aside className="hidden md:flex md:w-72 md:flex-col md:shrink-0 border-r border-neutral-100 bg-white/95 p-4">
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-secondary-700">NEXUSCARE</p>
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
                      isActive ? "bg-secondary-700 text-white" : "text-neutral-700 hover:bg-neutral-50",
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

        <div className="flex-1 overflow-y-auto pb-24 px-4 md:px-8">
          <div className="mx-auto w-full max-w-[430px] md:max-w-none">{children}</div>
        </div>

        {/** Mobile bottom nav (hidden on md+) */}
        {showTabs && (
          <nav className="fixed bottom-0 left-1/2 z-40 grid h-16 w-full max-w-[430px] -translate-x-1/2 grid-cols-5 border-t border-neutral-200 bg-white/95 px-2 backdrop-blur md:hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 text-[10px] font-semibold",
                    isActive ? "text-secondary-700" : "text-neutral-500",
                  )}
                >
                  <span
                    className={cn(
                      "rounded-xl p-1.5",
                      isActive && "bg-secondary-700 text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

function Header({
  title,
  subtitle,
  onBack,
  onNotifications,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onNotifications?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-100 bg-[#f6fbff]/95 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-full p-1.5 text-secondary-700 hover:bg-secondary-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-secondary-700">
              NexusCare
            </p>
            {title && (
              <h1 className="truncate text-xl font-bold text-neutral-950">
                {title}
              </h1>
            )}
            {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
          </div>
        </div>
        {onNotifications && (
          <button
            type="button"
            onClick={onNotifications}
            className="rounded-full p-2 text-secondary-700 hover:bg-secondary-50"
          >
            <Bell className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}

function StatusBadge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "red" | "amber" }) {
  const tones = {
    blue: "bg-secondary-50 text-secondary-700",
    green: "bg-success-50 text-success-700",
    red: "bg-error-50 text-error-700",
    amber: "bg-warning-50 text-warning-700",
  };

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase", tones[tone])}>
      {children}
    </span>
  );
}

export function HealthWorkerDashboard({ workerId }: HealthWorkerDashboardProps) {
  const resolvedWorkerId = useMemo(() => getStoredWorkerId(workerId), [workerId]);
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [view, setView] = useState<FlowView>("main");
  const [scheduleTab, setScheduleTab] = useState<ScheduleTab>("upcoming");
  const [selectedShift, setSelectedShift] = useState<AvailableShift | null>(null);
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientQueueItem>(patientQueue[0]);
  const [shiftSeconds, setShiftSeconds] = useState(14 * 60 + 30);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<HealthWorkerProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>(fallbackStats);
  const [earnings, setEarnings] = useState<ShiftEarnings>(fallbackEarnings);
  const [shifts, setShifts] = useState<AvailableShift[]>([]);
  const [history, setHistory] = useState<ShiftHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBookingActive, setIsBookingActive] = useState(true);

  // Media controls for consultation (defensive, non-blocking)
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);

  async function toggleMic() {
    try {
      if (isMicOn) {
        audioTrackRef.current?.stop();
        audioTrackRef.current = null;
        setIsMicOn(false);
        return;
      }
      if (!navigator?.mediaDevices?.getUserMedia) {
        console.warn("Media devices not available");
        return;
      }
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
      if (!navigator?.mediaDevices?.getUserMedia) {
        console.warn("Media devices not available");
        return;
      }
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

  // Cleanup media tracks when leaving consultation view or unmounting
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

  useEffect(() => {
    let isMounted = true;

    async function loadFlowData() {
      setIsLoading(true);
      const [nextProfile, nextStats, nextEarnings, nextShifts, nextHistory] =
        await Promise.all([
          HealthWorkerService.getWorkerProfile(resolvedWorkerId),
          HealthWorkerService.getDashboardStats(resolvedWorkerId),
          HealthWorkerService.getEarnings(resolvedWorkerId),
          HealthWorkerService.getAvailableShifts(resolvedWorkerId),
          HealthWorkerService.getShiftHistory(resolvedWorkerId, 5),
        ]);

      if (!isMounted) return;
      setProfile(nextProfile);
      setStats(nextStats);
      setEarnings(nextEarnings);
      setShifts(nextShifts);
      setHistory(nextHistory);
      setIsBookingActive(nextProfile.currentStatus !== "off-duty");
      setIsLoading(false);
    }

    loadFlowData();

    return () => {
      isMounted = false;
    };
  }, [resolvedWorkerId]);

  useEffect(() => {
    if (view !== "active-shift") return;
    const timer = window.setInterval(() => {
      setShiftSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [view]);

  const filteredShifts = shifts.filter((shift) => {
    const haystack = `${shift.hospital} ${shift.department} ${shift.location}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const upcomingShift = shifts[0];

  async function openShiftDetail(shift: AvailableShift) {
    setSelectedShift(shift);
    setView("shift-detail");
  }

  async function confirmInterest() {
    if (!selectedShift) return;
    await HealthWorkerService.acceptShift(selectedShift.id, resolvedWorkerId);
    setView("shift-confirmed");
  }

  async function clockIn() {
    const shift = selectedShift || upcomingShift;
    if (!shift) return;
    const nextActiveShift = await HealthWorkerService.clockIn(
      shift.id,
      resolvedWorkerId,
    );
    setActiveShift({
      ...nextActiveShift,
      hospital: shift.hospital,
      department: shift.department,
      hourlyRate: shift.hourlyRate,
      location: shift.location,
    });
    setShiftSeconds(14 * 60 + 30);
    setView("active-shift");
    setScheduleTab("active");
  }

  async function completeClockOut() {
    await HealthWorkerService.clockOut(activeShift?.id || "ACTIVE_LOCAL", resolvedWorkerId);
    setActiveShift(null);
    setActiveTab("earnings");
    setView("main");
  }

  async function toggleBooking() {
    const nextActive = !isBookingActive;
    setIsBookingActive(nextActive);
    await HealthWorkerService.updateDutyStatus(
      resolvedWorkerId,
      nextActive ? "available" : "off-duty",
    );
  }

  function goTab(tab: MainTab) {
    setActiveTab(tab);
    setView("main");
  }

  function renderMainTab() {
    switch (activeTab) {
      case "marketplace":
        return (
          <MarketplaceScreen
            shifts={filteredShifts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onOpenShift={openShiftDetail}
            isLoading={isLoading}
          />
        );
      case "schedule":
        return (
          <ScheduleScreen
            activeShift={activeShift}
            scheduleTab={scheduleTab}
            selectedShift={selectedShift || upcomingShift}
            shifts={shifts}
            history={history}
            onScheduleTabChange={setScheduleTab}
            onOpenShift={openShiftDetail}
            onShiftEntry={(shift) => {
              setSelectedShift(shift);
              setView("shift-entry");
            }}
          />
        );
      case "earnings":
        return <EarningsScreen earnings={earnings} history={history} />;
      case "profile":
        return (
          <ProfileScreen
            profile={profile}
            isBookingActive={isBookingActive}
            onToggleBooking={toggleBooking}
            onLogout={() => {
              authUtils.clearAuth();
              window.location.href = "/auth/login";
            }}
          />
        );
      case "home":
      default:
        return (
          <HomeScreen
            profile={profile}
            stats={stats}
            upcomingShift={upcomingShift}
            history={history}
            isLoading={isLoading}
            isBookingActive={isBookingActive}
            onNotifications={() => setView("notifications")}
            onMarketplace={() => goTab("marketplace")}
            onOpenShift={(shift) => {
              setSelectedShift(shift);
              setView("shift-detail");
            }}
          />
        );
    }
  }

  if (view === "notifications") {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab}>
        <NotificationsScreen onBack={() => setView("main")} />
      </Shell>
    );
  }

  if (view === "shift-detail" && selectedShift) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} showTabs={false}>
        <ShiftDetailScreen
          shift={selectedShift}
          onBack={() => setView("main")}
          onInterested={confirmInterest}
        />
      </Shell>
    );
  }

  if (view === "shift-confirmed" && selectedShift) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} showTabs={false}>
        <ShiftConfirmedScreen
          shift={selectedShift}
          onActiveHub={() => {
            setActiveTab("schedule");
            setScheduleTab("upcoming");
            setView("main");
          }}
          onDashboard={() => {
            setActiveTab("home");
            setView("main");
          }}
        />
      </Shell>
    );
  }

  if (view === "shift-entry" && (selectedShift || upcomingShift)) {
    const shift = selectedShift || upcomingShift;
    return (
      <Shell activeTab={activeTab} onTabChange={goTab} showTabs={false}>
        <ShiftEntryScreen
          shift={shift}
          onBack={() => setView("main")}
          onClockIn={clockIn}
        />
      </Shell>
    );
  }

  if (view === "active-shift" && activeShift) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab}>
        <ActiveShiftScreen
          activeShift={activeShift}
          seconds={shiftSeconds}
          selectedPatient={selectedPatient}
          onPatientSelect={(patient) => {
            setSelectedPatient(patient);
            setView("waiting-room");
          }}
          onClockOut={() => setView("handover")}
        />
      </Shell>
    );
  }

  if (view === "waiting-room") {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab}>
        <WaitingRoomScreen
          patient={selectedPatient}
          onBack={() => setView("active-shift")}
          onStartConsultation={() => setView("consultation")}
        />
      </Shell>
    );
  }

  if (view === "consultation") {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab}>
        <ConsultationScreen
          patient={selectedPatient}
          onBack={() => setView("waiting-room")}
          onReview={() => setView("clinical-review")}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
          isMicOn={isMicOn}
          isCamOn={isCamOn}
        />
      </Shell>
    );
  }

  if (view === "clinical-review") {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab}>
        <ClinicalReviewScreen
          patient={selectedPatient}
          onBack={() => setView("consultation")}
          onFinalize={() => setView("active-shift")}
        />
      </Shell>
    );
  }

  if (view === "handover" && activeShift) {
    return (
      <Shell activeTab={activeTab} onTabChange={goTab}>
        <HandoverScreen
          activeShift={activeShift}
          seconds={shiftSeconds}
          onBack={() => setView("active-shift")}
          onConfirm={completeClockOut}
        />
      </Shell>
    );
  }

  return (
    <Shell activeTab={activeTab} onTabChange={goTab}>
      {renderMainTab()}
    </Shell>
  );
}

function HomeScreen({
  profile,
  stats,
  upcomingShift,
  history,
  isLoading,
  isBookingActive,
  onNotifications,
  onMarketplace,
  onOpenShift,
}: {
  profile: HealthWorkerProfile | null;
  stats: DashboardStats;
  upcomingShift?: AvailableShift;
  history: ShiftHistoryItem[];
  isLoading: boolean;
  isBookingActive: boolean;
  onNotifications: () => void;
  onMarketplace: () => void;
  onOpenShift: (shift: AvailableShift) => void;
}) {
  const navigate = useNavigate();

  return (
    <>
      <Header onNotifications={onNotifications} />
      <main className="space-y-5 px-5 py-4">
        <button
          type="button"
          onClick={() => navigate("/medical-staff/onboarding/profile")}
          className="flex w-full items-start gap-3 rounded-lg border border-warning-200 bg-warning-50 p-3 text-left transition-colors hover:bg-warning-100"
        >
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning-600" />
          <span>
            <span className="block text-sm font-semibold text-warning-800">
              Complete your professional profile
            </span>
            <span className="block text-sm text-warning-900">
              Verify your license, identity, and payout details to start
              receiving shifts.
            </span>
          </span>
        </button>

        <section className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
              Welcome back
            </p>
            <h1 className="mt-1 text-3xl font-bold leading-tight text-secondary-800">
              Good Morning,
              <br />
              {profile?.name?.split(" ")[1] || "Dr. Abiola"}
            </h1>
          </div>
          <StatusBadge tone={isBookingActive ? "green" : "amber"}>
            {isBookingActive ? "On duty" : "Off duty"}
          </StatusBadge>
        </section>

        {upcomingShift && (
          <section className="rounded-2xl bg-secondary-700 p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <StatusBadge>Upcoming Shift</StatusBadge>
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-xl font-bold">{upcomingShift.department}</h2>
            <p className="text-sm text-secondary-100">{upcomingShift.hospital}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-secondary-50">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {upcomingShift.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {upcomingShift.time}
              </span>
            </div>
            <Button
              type="button"
              onClick={() => onOpenShift(upcomingShift)}
              className="mt-4 w-full bg-white text-secondary-800 hover:bg-secondary-50"
            >
              View Details
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </section>
        )}

        <section className="grid grid-cols-2 gap-3">
          <Metric label="Monthly Earnings" value={stats.totalEarnings} icon={Wallet} />
          <Metric label="Weekly Hours" value={stats.hoursWorked} icon={Clock} />
        </section>

        <button
          type="button"
          onClick={onMarketplace}
          className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-secondary-50 p-2 text-secondary-700">
              <BriefcaseMedical className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold">Marketplace</p>
              <p className="text-xs text-neutral-500">Find new shifts near you</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-neutral-400" />
        </button>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Recent Activity</h2>
            <button type="button" className="text-xs font-bold text-secondary-700">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {(isLoading ? [] : history).slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
              >
                <div className="border-l-4 border-success-500 pl-3">
                  <p className="text-sm font-bold">{item.hospital}</p>
                  <p className="text-[10px] uppercase text-neutral-500">
                    {item.department}
                  </p>
                </div>
                <p className="text-sm font-bold">{formatCurrency(item.earnings)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <Icon className="h-5 w-5 text-secondary-700" />
      <p className="mt-3 text-xs text-neutral-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function MarketplaceScreen({
  shifts,
  searchTerm,
  onSearchChange,
  onOpenShift,
  isLoading,
}: {
  shifts: AvailableShift[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenShift: (shift: AvailableShift) => void;
  isLoading: boolean;
}) {
  return (
    <>
      <Header title="Shift Marketplace" subtitle={`${shifts.length} shifts found`} />
      <main className="space-y-4 px-5 py-4">
        <SearchInput
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search role or facility..."
          className="rounded-xl bg-neutral-100 border-transparent py-3"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Specialty", "5km", "Urgency", "Direct Deposit"].map((filter) => (
            <button
              type="button"
              key={filter}
              className="whitespace-nowrap rounded-full bg-white px-3 py-2 text-xs font-bold text-neutral-600 shadow-sm"
            >
              {filter}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-sm text-neutral-500">Loading shifts...</p>}

        <div className="space-y-4">
          {shifts.map((shift) => (
            <button
              type="button"
              key={shift.id}
              onClick={() => onOpenShift(shift)}
              className="w-full rounded-2xl bg-white p-4 text-left shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <StatusBadge tone={shift.urgency === "high" ? "red" : "green"}>
                    {shift.urgency === "high" ? "Stat" : "Scheduled"}
                  </StatusBadge>
                  <h3 className="mt-2 font-bold">{shift.department}</h3>
                  <p className="text-xs text-neutral-500">{shift.hospital}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-secondary-700">{getShiftPayout(shift)}</p>
                  <p className="text-[10px] uppercase text-neutral-400">per shift</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {shift.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {shift.duration}
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="rounded-lg bg-secondary-700 px-4 py-2 text-xs font-bold text-white">
                  Apply
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </>
  );
}

function ShiftDetailScreen({
  shift,
  onBack,
  onInterested,
}: {
  shift: AvailableShift;
  onBack: () => void;
  onInterested: () => void;
}) {
  return (
    <>
      <Header title="Shift Details" onBack={onBack} />
      <main className="space-y-4 px-5 py-4">
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="h-28 rounded-2xl bg-gradient-to-br from-secondary-50 to-secondary-100" />
          <div className="mt-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">{shift.hospital}</h2>
              <p className="text-xs text-neutral-500">{shift.location}</p>
              <div className="mt-2 flex gap-2">
                <StatusBadge tone="green">4.8</StatusBadge>
                <StatusBadge>{shift.department}</StatusBadge>
                <StatusBadge tone="red">Stat Need</StatusBadge>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-secondary-700 p-4 text-white">
          <p className="text-xs text-secondary-100">Estimated Pay</p>
          <p className="text-3xl font-bold">{getShiftPayout(shift)}</p>
          <p className="text-xs text-secondary-100">Direct deposit ready</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <InfoTile icon={Calendar} label="Date" value={shift.date} />
          <InfoTile icon={Clock} label="Duration" value={shift.time} />
        </section>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Shift Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 text-sm text-neutral-600">
            <p>
              {shift.description ||
                `${shift.hospital} is seeking a dedicated clinician for a critical daily shift with continuous monitoring and treatment support.`}
            </p>
            {["Ventilator management", "Hemodynamic monitoring", "Medication titration", "EHR documentation"].map((task) => (
              <div key={task} className="rounded-xl bg-neutral-50 px-3 py-2 font-medium text-neutral-700">
                <Check className="mr-2 inline h-4 w-4 text-success-600" />
                {task}
              </div>
            ))}
          </CardContent>
        </Card>

        <section className="rounded-2xl bg-neutral-900 p-4 text-white">
          <div className="flex h-36 items-center justify-center rounded-xl bg-neutral-800">
            <Navigation className="h-10 w-10 text-secondary-300" />
          </div>
          <p className="mt-3 text-sm font-bold">Idi-Araba Complex</p>
          <p className="text-xs text-neutral-300">Gate 4 entrance, staff parking available</p>
        </section>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {(shift.requirements || ["Valid license", "ACLS certification", "2+ yrs ICU experience"]).map((item) => (
              <p key={item} className="text-sm text-neutral-700">
                <ShieldCheck className="mr-2 inline h-4 w-4 text-secondary-700" />
                {item}
              </p>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-[1fr_2fr] gap-3 pb-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Decline
          </Button>
          <Button type="button" onClick={onInterested} className="bg-secondary-700">
            I'm Interested
          </Button>
        </div>
      </main>
    </>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <Icon className="h-5 w-5 text-secondary-700" />
      <p className="mt-2 text-xs text-neutral-500">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function ShiftConfirmedScreen({
  shift,
  onActiveHub,
  onDashboard,
}: {
  shift: AvailableShift;
  onActiveHub: () => void;
  onDashboard: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col px-5 py-8">
      <div className="mt-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100 text-success-700">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Shift Confirmed</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Your request has been processed successfully. You're all set for your next shift.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="space-y-4 p-4">
          <InfoRow icon={BriefcaseMedical} label="Facility" value={shift.hospital} />
          <InfoRow icon={Calendar} label="Date" value={shift.date} />
          <InfoRow icon={Clock} label="Time" value={shift.time} />
          <div className="flex h-32 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-700">
            <MapPin className="h-10 w-10" />
          </div>
        </CardContent>
      </Card>

      <div className="mt-auto space-y-3 pb-8">
        <Button type="button" className="w-full bg-secondary-700">
          <Calendar className="mr-2 h-4 w-4" />
          Add to Calendar
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" onClick={onActiveHub}>
            Active Hub
          </Button>
          <Button type="button" variant="outline" onClick={onDashboard}>
            Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-xl bg-secondary-50 p-2 text-secondary-700">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}

function ScheduleScreen({
  activeShift,
  scheduleTab,
  selectedShift,
  shifts,
  history,
  onScheduleTabChange,
  onOpenShift,
  onShiftEntry,
}: {
  activeShift: ActiveShift | null;
  scheduleTab: ScheduleTab;
  selectedShift?: AvailableShift;
  shifts: AvailableShift[];
  history: ShiftHistoryItem[];
  onScheduleTabChange: (tab: ScheduleTab) => void;
  onOpenShift: (shift: AvailableShift) => void;
  onShiftEntry: (shift: AvailableShift) => void;
}) {
  return (
    <>
      <Header title="September 2024" subtitle="Full calendar" />
      <main className="space-y-4 px-5 py-4">
        <div className="grid grid-cols-5 gap-2">
          {["Mon 16", "Tue 17", "Wed 18", "Thu 19", "Fri 20"].map((day, index) => (
            <button
              type="button"
              key={day}
              className={cn(
                "rounded-2xl p-3 text-xs font-bold",
                index === 1 ? "bg-secondary-700 text-white" : "bg-white text-neutral-600",
              )}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 rounded-xl bg-white p-1">
          {(["upcoming", "active", "completed"] as ScheduleTab[]).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => onScheduleTabChange(tab)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-bold capitalize",
                scheduleTab === tab ? "bg-secondary-50 text-secondary-700" : "text-neutral-500",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {scheduleTab === "active" && activeShift && (
          <Card>
            <CardContent className="p-4">
              <StatusBadge tone="green">Active now</StatusBadge>
              <h3 className="mt-3 font-bold">{activeShift.hospital}</h3>
              <p className="text-sm text-neutral-500">{activeShift.department}</p>
            </CardContent>
          </Card>
        )}

        {scheduleTab === "completed" &&
          history.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-bold">{item.hospital}</h3>
                  <p className="text-xs text-neutral-500">{item.date}</p>
                </div>
                <StatusBadge tone="green">Completed</StatusBadge>
              </CardContent>
            </Card>
          ))}

        {scheduleTab === "upcoming" &&
          shifts.map((shift) => (
            <Card key={shift.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <StatusBadge tone="green">{shift.department}</StatusBadge>
                    <h3 className="mt-2 font-bold">{shift.hospital}</h3>
                    <p className="text-xs text-neutral-500">{shift.location}</p>
                  </div>
                  <p className="font-bold text-secondary-700">{getShiftPayout(shift)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 p-3 text-xs">
                  <span>Date: {shift.date}</span>
                  <span>Shift: {shift.time}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" onClick={() => onOpenShift(shift)}>
                    View Details
                  </Button>
                  <Button
                    type="button"
                    className="bg-error-600 hover:bg-error-700"
                    onClick={() => onShiftEntry(selectedShift || shift)}
                  >
                    Clock In
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </main>
    </>
  );
}

function ShiftEntryScreen({
  shift,
  onBack,
  onClockIn,
}: {
  shift?: AvailableShift;
  onBack: () => void;
  onClockIn: () => void;
}) {
  if (!shift) return null;

  return (
    <>
      <Header title="Shift Entry" subtitle="Verify your location" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-neutral-500">Current Facility</p>
            <h2 className="mt-2 text-xl font-bold">{shift.hospital}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <p>
                <span className="block text-xs text-neutral-500">Department</span>
                {shift.department}
              </p>
              <p>
                <span className="block text-xs text-neutral-500">Time Slot</span>
                {shift.time}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-success-50">
              <span className="h-4 w-4 rounded-full bg-success-600" />
            </div>
            <h3 className="mt-4 font-bold">Within Range (50m)</h3>
            <p className="text-xs text-neutral-500">
              Geofence validation successful. You are currently on-site.
            </p>
          </CardContent>
        </Card>
        <div className="flex h-52 items-center justify-center rounded-3xl bg-neutral-900 text-secondary-300">
          <MapPin className="h-14 w-14" />
        </div>
        <Button
          type="button"
          onClick={onClockIn}
          className="h-28 w-full rounded-3xl bg-error-600 text-xl hover:bg-error-700"
        >
          <Clock className="mr-3 h-8 w-8" />
          Clock In
        </Button>
        <p className="text-center text-xs text-neutral-500">
          Syncing with Lagos Central Node...
        </p>
      </main>
    </>
  );
}

function ActiveShiftScreen({
  activeShift,
  seconds,
  selectedPatient,
  onPatientSelect,
  onClockOut,
}: {
  activeShift: ActiveShift;
  seconds: number;
  selectedPatient: PatientQueueItem;
  onPatientSelect: (patient: PatientQueueItem) => void;
  onClockOut: () => void;
}) {
  const time = new Date(seconds * 1000).toISOString().substring(11, 19);

  return (
    <>
      <Header title="Current Shift Status" subtitle={activeShift.department} />
      <main className="space-y-5 px-5 py-4">
        <section className="rounded-2xl bg-secondary-700 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-secondary-100">Current shift status</p>
              <p className="text-4xl font-bold">{time}</p>
            </div>
            <StatusBadge tone="green">Onsite</StatusBadge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-secondary-50">
            <p>Department: {activeShift.department}</p>
            <p>Duration: 08 Hours</p>
          </div>
          <Button type="button" className="mt-4 bg-white text-secondary-800 hover:secondary-50">
            Take a Break
          </Button>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Patient Queue</h2>
            <StatusBadge>{patientQueue.length} Active Patients</StatusBadge>
          </div>
          <div className="space-y-3">
            {patientQueue.map((patient) => (
              <button
                type="button"
                key={patient.id}
                onClick={() => onPatientSelect(patient)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm",
                  selectedPatient.id === patient.id && "ring-2 ring-secondary-200",
                )}
              >
                <div>
                  <p className="font-bold">{patient.name}</p>
                  <p className="text-xs text-neutral-500">
                    {patient.room} • {patient.age}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-[10px] font-bold uppercase",
                      patient.status === "medication" ? "text-error-600" : "text-success-600",
                    )}
                  >
                    {patient.note}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-400" />
              </button>
            ))}
          </div>
        </section>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Clinical Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {["Review patient charts (3)", "Administer morning meds", "Prepare discharge summaries", "Round with lead physician"].map((task, index) => (
              <label key={task} className="flex items-center gap-3 text-sm">
                <input type="checkbox" defaultChecked={index === 1} className="h-4 w-4 rounded" />
                <span>{task}</span>
              </label>
            ))}
            <Button type="button" variant="outline" className="w-full">
              + New Task
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-secondary-700" />
              <div>
                <p className="font-bold">2 Unread Messages</p>
                <p className="text-xs text-neutral-500">Shift coordinator and lab services</p>
              </div>
            </div>
            <Button type="button" size="sm" variant="outline">
              Open
            </Button>
          </CardContent>
        </Card>

        <Button
          type="button"
          onClick={onClockOut}
          className="w-full bg-error-600 hover:bg-error-700"
        >
          Clock Out
        </Button>
      </main>
    </>
  );
}

function WaitingRoomScreen({
  patient,
  onBack,
  onStartConsultation,
}: {
  patient: PatientQueueItem;
  onBack: () => void;
  onStartConsultation: () => void;
}) {
  return (
    <>
      <Header title="Virtual Waiting Room" subtitle="Live Queue" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <p className="text-sm text-neutral-600">
          Manage upcoming consultations. Patients are automatically screened and prioritized.
        </p>
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-700">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold">{patient.name}</h2>
                <p className="text-xs text-neutral-500">
                  Patient ID: {patient.id} • Waiting for 5 mins
                </p>
              </div>
            </div>
            <Button type="button" className="w-full bg-secondary-700" onClick={onStartConsultation}>
              Start Consultation
              <Video className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Reason for Visit</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm text-neutral-600">
            Follow-up hypertension. Patient reports consistent adherence and requests review of home BP readings.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Vital Signs Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 p-4 pt-0">
            <Metric label="Blood Pressure" value="138/84" icon={Activity} />
            <Metric label="Heart Rate" value="72 BPM" icon={Activity} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function ConsultationScreen({
  patient,
  onBack,
  onReview,
  onToggleMic,
  onToggleCam,
  isMicOn,
  isCamOn,
}: {
  patient: PatientQueueItem;
  onBack: () => void;
  onReview: () => void;
  onToggleMic?: () => void;
  onToggleCam?: () => void;
  isMicOn?: boolean;
  isCamOn?: boolean;
}) {
  return (
    <>
      <Header title={patient.name} subtitle={patient.id} onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <section className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white">
          <div className="flex h-80 items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-950">
            <User className="h-20 w-20 text-neutral-300" />
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
            <button
              type="button"
              onClick={onToggleMic}
              className={cn("rounded-full p-3", isMicOn ? "bg-error-600" : "bg-white/20 backdrop-blur")}
            >
              {isMicOn ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={onToggleCam}
              className={cn("rounded-full p-3", isCamOn ? "bg-error-600" : "bg-white/20 backdrop-blur")}
            >
              <Video className="h-5 w-5" />
            </button>

            <button type="button" className={cn("rounded-full p-3", "bg-white/20 backdrop-blur")}>
              <Activity className="h-5 w-5" />
            </button>

            <button type="button" className={cn("rounded-full p-3", "bg-white/20 backdrop-blur")}>
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Start AI Transcriber", icon: Mic },
            { label: "View Medical History", icon: FileText },
            { label: "Prescribe Meds", icon: Stethoscope },
            { label: "Mark STAT Follow-up", icon: AlertTriangle },
          ].map((action) => (
            <button
              type="button"
              key={action.label}
              className="rounded-2xl bg-white p-4 text-sm font-bold shadow-sm"
            >
              <action.icon className="mx-auto mb-2 h-5 w-5 text-secondary-700" />
              {action.label}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Patient Vitals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {["Heart Rate 72 BPM", "Temp 36.8 C", "Blood Pressure 120/80"].map((item) => (
              <div key={item} className="rounded-xl bg-neutral-50 px-3 py-2 text-sm">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <section className="rounded-3xl bg-secondary-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <p className="font-bold">AI Live Transcriber</p>
            <StatusBadge tone="green">Live</StatusBadge>
          </div>
          <p className="mt-4 rounded-2xl bg-secondary-800 p-4 text-sm text-secondary-50">
            Translation on: Yoruba to English. "I am happy, but I have pain in my stomach."
          </p>
        </section>

        <Button type="button" className="w-full bg-secondary-700" onClick={onReview}>
          Finish Consultation
        </Button>
      </main>
    </>
  );
}

function ClinicalReviewScreen({
  patient,
  onBack,
  onFinalize,
}: {
  patient: PatientQueueItem;
  onBack: () => void;
  onFinalize: () => void;
}) {
  return (
    <>
      <Header title="Active Review" subtitle={patient.name} onBack={onBack} />
      <main className="space-y-4 px-5 py-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <h2 className="font-bold">{patient.name}</h2>
              <p className="text-xs text-neutral-500">Patient ID: {patient.id}</p>
            </div>
            <StatusBadge tone="green">Draft</StatusBadge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-bold">96% High Confidence</p>
              <p className="text-xs text-neutral-500">AI insight cadence confirmed</p>
            </div>
            <Activity className="h-8 w-8 text-success-600" />
          </CardContent>
        </Card>
        {[
          ["Chief Complaint", "Patient presents with persistent dry cough and mild nocturnal dyspnea."],
          ["History of Present Illness", "Symptoms started after exposure to dust during harmattan."],
          ["Assessment", "Mild intermittent asthma exacerbated by environmental triggers."],
          ["Clinical Plan", "Initiate salbutamol inhaler, chest X-ray, follow-up in two weeks."],
          ["Prescriptions", "Salbutamol inhaler 100mcg, 1 puff every 4-6 hours PRN."],
        ].map(([title, body]) => (
          <Card key={title}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-neutral-600">
              {body}
            </CardContent>
          </Card>
        ))}
        <Button type="button" className="w-full bg-secondary-700" onClick={onFinalize}>
          Save & Finalize
        </Button>
        <div className="grid grid-cols-2 gap-3 pb-4">
          <Button type="button" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export to EHR
          </Button>
          <Button type="button" variant="outline">
            Print
          </Button>
        </div>
      </main>
    </>
  );
}

function HandoverScreen({
  activeShift,
  seconds,
  onBack,
  onConfirm,
}: {
  activeShift: ActiveShift;
  seconds: number;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return (
    <>
      <Header title="Shift Completion" subtitle="Review handover summary" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <section className="rounded-2xl bg-secondary-700 p-5 text-white">
          <p className="text-xs text-secondary-100">Current Shift Status</p>
          <p className="text-4xl font-bold">
            {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:30
          </p>
          <p className="text-xs text-secondary-100">{activeShift.department}</p>
        </section>
        <h1 className="text-2xl font-bold">Great job today, Dr. Abodey</h1>
        <p className="text-sm text-neutral-500">
          Your shift is nearing its end. Please review the patient handover summary before clocking out.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Duration" value={`${hours}h ${minutes}m`} icon={Clock} />
          <Metric label="Attended" value="8 Patients" icon={User} />
        </div>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Handover Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {[
              "Amina Yusuf: Hypertension follow-up, BP stable at 130/85.",
              "Chidi Okoro: Post-op recovery, monitor vitals every 30 mins.",
              "Emeka Nwosu: Blood sample taken for malaria screening.",
            ].map((note, index) => (
              <div
                key={note}
                className={cn(
                  "border-l-4 bg-neutral-50 p-3 text-sm",
                  index === 1 ? "border-error-500" : "border-success-500",
                )}
              >
                {note}
              </div>
            ))}
          </CardContent>
        </Card>
        <Button type="button" className="w-full bg-secondary-700" onClick={onConfirm}>
          Confirm Handover & Clock-Out
        </Button>
      </main>
    </>
  );
}

function EarningsScreen({
  earnings,
  history,
}: {
  earnings: ShiftEarnings;
  history: ShiftHistoryItem[];
}) {
  return (
    <>
      <Header title="Earnings" />
      <main className="space-y-5 px-5 py-4">
        <section className="rounded-2xl bg-secondary-700 p-5 text-white">
          <p className="text-xs text-secondary-100">Total Balance</p>
          <p className="text-3xl font-bold">{formatCurrency(earnings.totalEarnings)}</p>
          <Button type="button" className="mt-4 bg-white text-secondary-800 hover:bg-secondary-50">
            <CreditCard className="mr-2 h-4 w-4" />
            Withdraw Funds
          </Button>
          <p className="mt-3 text-xs text-secondary-100">Next payout: Friday, 24 Oct</p>
        </section>
        <Metric label="Pending Payouts" value={formatCurrency(42000)} icon={Clock} />
        <Metric label="Monthly Earnings" value={formatCurrency(earnings.monthlyEarnings)} icon={Activity} />
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Recent Earnings</h2>
            <button type="button" className="text-xs font-bold text-secondary-700">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {history.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold">{item.hospital}</p>
                    <p className="text-xs text-neutral-500">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success-700">
                      {formatCurrency(item.earnings)}
                    </p>
                    <StatusBadge tone="green">Completed</StatusBadge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function ProfileScreen({
  profile,
  isBookingActive,
  onToggleBooking,
  onLogout,
}: {
  profile: HealthWorkerProfile | null;
  isBookingActive: boolean;
  onToggleBooking: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <Header title="Profile" />
      <main className="space-y-5 px-5 py-4">
        <section className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-neutral-200">
            <User className="h-12 w-12 text-neutral-500" />
          </div>
          <h1 className="mt-4 text-xl font-bold">{profile?.name || "Dr. Chidi Okonjo"}</h1>
          <StatusBadge tone="green">Verified Professional</StatusBadge>
          <p className="mt-2 text-sm text-neutral-500">
            {profile?.specialization || "Consultant Cardiologist"} • Senior Registrar
          </p>
        </section>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Credentials & Licensing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 text-sm">
            <InfoRow icon={ShieldCheck} label="MDC Number" value={profile?.licenseNumber || "MDC/REG/774291"} />
            <InfoRow icon={ShieldCheck} label="NGR License" value="NGR-HEALTH-aA2" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Metric label="Avg Rating" value={(profile?.rating || 4.9).toFixed(1)} icon={Star} />
          <Metric label="Consults" value="1.2k" icon={MessageSquare} />
        </div>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Specialties & Expertise</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-4 pt-0">
            {["Cardiovascular Medicine", "Interventional Radiology", "Emergency Care", "Diagnostic Ultrasound"].map((item) => (
              <span key={item} className="rounded-full bg-success-50 px-3 py-1 text-xs font-bold text-success-700">
                {item}
              </span>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <ProfileLink icon={Settings} label="Account Settings" />
          <ProfileLink icon={Wallet} label="Payout Preferences" />
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left font-bold text-error-600 shadow-sm"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        <section className="flex items-center justify-between rounded-2xl bg-secondary-700 p-4 text-white">
          <div>
            <p className="font-bold">Active for Booking</p>
            <p className="text-xs text-secondary-100">Visible to patients for immediate consultation.</p>
          </div>
          <button
            type="button"
            onClick={onToggleBooking}
            className={cn(
              "flex h-8 w-14 items-center rounded-full p-1 transition",
              isBookingActive ? "justify-end bg-success-400" : "justify-start bg-neutral-300",
            )}
          >
            <span className="h-6 w-6 rounded-full bg-white" />
          </button>
        </section>
      </main>
    </>
  );
}

function ProfileLink({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm"
    >
      <span className="flex items-center gap-3 font-bold">
        <Icon className="h-5 w-5 text-secondary-700" />
        {label}
      </span>
      <ChevronRight className="h-5 w-5 text-neutral-400" />
    </button>
  );
}

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  return (
    <>
      <Header title="Notifications" subtitle="Manage clinical updates" onBack={onBack} />
      <main className="space-y-4 px-5 py-4">
        <div className="flex gap-2">
          {["All", "Shifts", "Payments", "Alerts"].map((filter, index) => (
            <button
              type="button"
              key={filter}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-bold",
                index === 0 ? "bg-secondary-700 text-white" : "bg-neutral-100 text-neutral-600",
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        {notifications.map((item) => (
          <Card key={item.title}>
            <CardContent className="flex gap-3 p-4">
              <span
                className={cn(
                  "rounded-xl p-2",
                  item.kind === "payment"
                    ? "bg-success-50 text-success-700"
                    : item.kind === "alert"
                      ? "bg-error-50 text-error-700"
                      : "bg-secondary-50 text-secondary-700",
                )}
              >
                {item.kind === "payment" ? (
                  <Wallet className="h-5 w-5" />
                ) : item.kind === "alert" ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Calendar className="h-5 w-5" />
                )}
              </span>
              <div className="flex-1">
                <div className="flex justify-between gap-3">
                  <h2 className="font-bold">{item.title}</h2>
                  <span className="text-[10px] text-neutral-400">{item.meta}</span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{item.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </>
  );
}
