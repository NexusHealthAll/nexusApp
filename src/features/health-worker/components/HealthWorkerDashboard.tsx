import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { ActiveShiftOverlay } from './ActiveShiftOverlay';
import { AITranscriberView } from './AITranscriberView';
import { HandoverView } from './HandoverView';
import { ClockInVerification } from './ClockInVerification';
import { authUtils } from '@/features/auth/components';
import { 
  Clock,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Activity,
  Users,
  Pause,
  Timer,
  Stethoscope,
  Plus,
  AlertCircle,
  LogOut
} from 'lucide-react';

interface HealthWorkerDashboardProps {
  workerId?: string;
}

// Mock data matching Figma design
const mockHealthWorkerData = {
  profile: {
    name: 'Dr. Abode',
    rating: 4.9,
    totalEarnings: 385000, // ₦385k
    currentStatus: 'available', // available, on-shift, off-duty
    specialization: 'Emergency Doctor'
  },
  currentShift: {
    isActive: false,
    hospital: 'LUTH - Emergency Dept',
    startTime: null,
    duration: '00:00:00',
    hourlyRate: 8000,
    location: 'Lagos Island'
  },
  availableShifts: [
    {
      id: '1',
      hospital: 'LUTH - Emergency Dept',
      department: 'Emergency Medicine',
      date: 'Today',
      time: '2:00 PM - 10:00 PM',
      duration: '8 hours',
      hourlyRate: 8000,
      location: 'Lagos Island',
      urgency: 'high',
      description: 'Emergency department coverage needed'
    },
    {
      id: '2',
      hospital: 'General Nurse',
      department: 'General Medicine',
      date: 'Tomorrow',
      time: '6:00 AM - 2:00 PM',
      duration: '8 hours',
      hourlyRate: 6000,
      location: 'Victoria Island',
      urgency: 'medium'
    },
    {
      id: '3',
      hospital: 'GP Consultation',
      department: 'General Practice',
      date: 'Oct 28',
      time: '9:00 AM - 5:00 PM',
      duration: '8 hours',
      hourlyRate: 6000,
      location: 'Ikeja',
      urgency: 'low'
    }
  ],
  recentShifts: [
    {
      hospital: 'Lagos University Teaching Hospital',
      date: 'Oct 25',
      duration: '8 hours',
      earnings: 64000,
      rating: 5.0
    },
    {
      hospital: 'Emergency Hospital',
      date: 'Oct 23',
      duration: '6 hours',
      earnings: 48000,
      rating: 4.8
    }
  ],
  weeklyStats: {
    hoursWorked: 34.5,
    earnings: 428500,
    shiftsCompleted: 5,
    averageRating: 4.9
  }
};

export function HealthWorkerDashboard({ workerId }: HealthWorkerDashboardProps) {
  const navigate = useNavigate();
  const [shiftStatus, setShiftStatus] = useState<'available' | 'on-shift' | 'off-duty'>('available');
  const [activeShift, setActiveShift] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'clock-in-verification' | 'active-shift' | 'transcriber' | 'handover'>('dashboard');
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [shiftTimer, setShiftTimer] = useState(0);
  const [selectedShift, setSelectedShift] = useState<any>(null);

  // Live shift timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentView === 'active-shift' && activeShift) {
      interval = setInterval(() => {
        setShiftTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentView, activeShift]);

  const formatShiftTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClockIn = (shift: any) => {
    setSelectedShift(shift);
    setCurrentView('clock-in-verification');
  };

  const handleConfirmClockIn = () => {
    const shiftWithStartTime = {
      ...selectedShift,
      startTime: new Date().toISOString()
    };
    setActiveShift(shiftWithStartTime);
    setShiftStatus('on-shift');
    setCurrentView('active-shift');
    setShiftTimer(0); // Reset timer when starting new shift
  };

  const handleCancelClockIn = () => {
    setSelectedShift(null);
    setCurrentView('dashboard');
  };

  const handleClockOut = () => {
    setCurrentView('handover');
  };

  const handleRecordNewPatient = () => {
    const newPatientId = `P${Date.now().toString().slice(-4)}`;
    setCurrentPatientId(newPatientId);
    setCurrentView('transcriber');
  };

  const handleCompleteConsultation = () => {
    setCurrentView('active-shift');
    setCurrentPatientId(null);
  };

  const handleCompleteHandover = () => {
    setActiveShift(null);
    setShiftStatus('available');
    setCurrentView('dashboard');
    setCurrentPatientId(null);
  };

  const handleCancelHandover = () => {
    setCurrentView('active-shift');
  };

  const handlePauseShift = () => {
    // Handle shift pause logic
    console.log('Shift paused/resumed');
  };

  const handleSaveNotes = (notes: any) => {
    console.log('Notes saved:', notes);
  };

  const toggleDutyStatus = () => {
    setShiftStatus(shiftStatus === 'off-duty' ? 'available' : 'off-duty');
  };

  const handleLogout = () => {
    authUtils.clearAuth();
    navigate('/auth/login');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Render different views based on current state
  if (currentView === 'clock-in-verification' && selectedShift) {
    return (
      <ClockInVerification
        shiftData={selectedShift}
        onConfirmClockIn={handleConfirmClockIn}
        onCancel={handleCancelClockIn}
      />
    );
  }

  if (currentView === 'active-shift' && activeShift) {
    return (
      <div className="min-h-screen bg-[#F3FAFF]">
        {/* Active Shift Header - Hospital Color Scheme */}
        <div className="bg-white border-b border-onboarding-inputBackground px-4 py-3 sm:px-6 sm:py-4">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-onboarding-primaryGreen/10 flex items-center justify-center">
                <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-onboarding-primaryGreen" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-semibold text-onboarding-textPrimary">Active Shift</h1>
                <p className="text-xs sm:text-sm text-onboarding-textSecondary">{activeShift.hospital}</p>
              </div>
            </div>
            
            {/* Mobile Timer and Controls */}
            <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
              <div className="text-center">
                <p className="text-xl sm:text-3xl font-bold text-onboarding-primaryGreen">{formatShiftTime(shiftTimer)}</p>
                <p className="text-xs text-onboarding-textSecondary">Live Timer</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handlePauseShift} className="px-2 sm:px-3 border-onboarding-inputBackground text-onboarding-textSecondary hover:text-onboarding-textPrimary">
                  <Pause className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Pause</span>
                </Button>
                <Button variant="danger" size="sm" onClick={handleClockOut} className="px-2 sm:px-3 bg-red-600 hover:bg-red-700 text-white">
                  <span className="hidden sm:inline">End Shift</span>
                  <span className="sm:hidden">End</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 sm:p-6 sm:space-y-6">
          {/* Primary Action Button - Mobile Perfect */}
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleRecordNewPatient}
              className="w-full sm:w-auto bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue hover:opacity-90 text-white px-6 py-4 text-base font-semibold transition-all shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              RECORD NEW PATIENT
            </Button>
          </div>

          {/* Today's Patients Queue - Mobile First Design */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                <span>Today's Patients</span>
                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                  <span className="text-neutral-500">12 seen</span>
                  <span className="px-2 py-0.5 bg-success-100 text-success-800 rounded-full text-xs font-medium">
                    5 Active
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile Card Layout */}
              <div className="space-y-2 sm:hidden">
                {[
                  { id: '#2361', time: '2:15 PM', complaint: 'Fever, cough', priority: 'Medium', status: 'completed', duration: '18m' },
                  { id: '#2362', time: '2:45 PM', complaint: 'Abdominal pain', priority: 'High', status: 'completed', duration: '25m' },
                  { id: '#2363', time: '3:20 PM', complaint: 'Headache, dizziness', priority: 'Low', status: 'completed', duration: '12m' },
                  { id: '#2364', time: '3:55 PM', complaint: 'Chest pain', priority: 'High', status: 'in-progress', duration: '15m' },
                  { id: '#2365', time: '4:10 PM', complaint: 'Back pain', priority: 'Medium', status: 'waiting', duration: '-' },
                  { id: '#2366', time: '4:25 PM', complaint: 'Skin rash', priority: 'Low', status: 'waiting', duration: '-' },
                ].map((patient) => (
                  <div key={patient.id} className="bg-neutral-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-neutral-900 text-sm">{patient.id}</span>
                        <span className="text-xs text-neutral-600">{patient.time}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        patient.priority === 'High' 
                          ? 'bg-error-100 text-error-800' 
                          : patient.priority === 'Medium'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}>
                        {patient.priority}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-800">{patient.complaint}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        patient.status === 'completed' 
                          ? 'bg-success-100 text-success-800' 
                          : patient.status === 'in-progress'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}>
                        {patient.status === 'completed' ? 'Done' : 
                         patient.status === 'in-progress' ? 'Active' : 'Waiting'}
                      </span>
                      {patient.status === 'in-progress' ? (
                        <Button size="sm" variant="outline" className="px-3 py-1 text-xs">
                          Continue
                        </Button>
                      ) : patient.status === 'waiting' ? (
                        <Button size="sm" className="px-3 py-1 text-xs">
                          Start
                        </Button>
                      ) : (
                        <span className="text-xs text-neutral-500">{patient.duration}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Patient ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Chief Complaint</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Priority</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: '#2361', time: '2:15 PM', complaint: 'Fever, cough', priority: 'Medium', status: 'completed', duration: '18m' },
                      { id: '#2362', time: '2:45 PM', complaint: 'Abdominal pain', priority: 'High', status: 'completed', duration: '25m' },
                      { id: '#2363', time: '3:20 PM', complaint: 'Headache, dizziness', priority: 'Low', status: 'completed', duration: '12m' },
                      { id: '#2364', time: '3:55 PM', complaint: 'Chest pain', priority: 'High', status: 'in-progress', duration: '15m' },
                      { id: '#2365', time: '4:10 PM', complaint: 'Back pain', priority: 'Medium', status: 'waiting', duration: '-' },
                      { id: '#2366', time: '4:25 PM', complaint: 'Skin rash', priority: 'Low', status: 'waiting', duration: '-' },
                    ].map((patient) => (
                      <tr key={patient.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-3 px-4 font-semibold text-neutral-900">{patient.id}</td>
                        <td className="py-3 px-4 text-neutral-600">{patient.time}</td>
                        <td className="py-3 px-4 text-neutral-800">{patient.complaint}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            patient.priority === 'High' 
                              ? 'bg-error-100 text-error-800' 
                              : patient.priority === 'Medium'
                              ? 'bg-warning-100 text-warning-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {patient.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            patient.status === 'completed' 
                              ? 'bg-success-100 text-success-800' 
                              : patient.status === 'in-progress'
                              ? 'bg-primary-100 text-primary-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {patient.status === 'completed' ? 'Completed' : 
                             patient.status === 'in-progress' ? 'In Progress' : 'Waiting'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {patient.status === 'in-progress' ? (
                            <Button size="sm" variant="outline">
                              Continue
                            </Button>
                          ) : patient.status === 'waiting' ? (
                            <Button size="sm">
                              Start
                            </Button>
                          ) : (
                            <span className="text-sm text-neutral-500">{patient.duration}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Shift Statistics - Premium Design */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <Card className="bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Patients</p>
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">12</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Time</p>
                    <Clock className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">18m</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Waiting</p>
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">2</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Earnings</p>
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    ₦{((shiftTimer / 3600) * activeShift.hourlyRate).toLocaleString('en-NG', { 
                      minimumFractionDigits: 0, 
                      maximumFractionDigits: 0 
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'transcriber' && currentPatientId) {
    return (
      <AITranscriberView
        patientId={currentPatientId}
        onSaveNotes={handleSaveNotes}
        onCompleteConsultation={handleCompleteConsultation}
      />
    );
  }

  if (currentView === 'handover' && activeShift) {
    return (
      <HandoverView
        shiftData={{
          hospital: activeShift.hospital,
          department: activeShift.department || 'Emergency Medicine',
          duration: '4:23',
          patientsSeenToday: 12
        }}
        onCompleteHandover={handleCompleteHandover}
        onCancelHandover={handleCancelHandover}
      />
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-[#F3FAFF]">
      <div className="space-y-3 sm:space-y-6 px-4 sm:px-0 py-6">
        {/* Header with Status Toggle - Mobile Optimized */}
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-onboarding-textPrimary">Health Worker Dashboard</h1>
            <p className="text-sm text-onboarding-textSecondary">Manage your shifts and earnings</p>
          </div>
          <div className="flex items-center justify-between sm:justify-start space-x-4">
            <span className="text-sm font-medium text-onboarding-textPrimary">Status:</span>
            <div className="flex rounded-lg border border-onboarding-inputBackground p-0.5 bg-white">
              <button
                onClick={() => setShiftStatus('available')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  shiftStatus === 'available' 
                    ? 'bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue text-white' 
                    : 'text-onboarding-textSecondary hover:text-onboarding-textPrimary'
                }`}
              >
                On Duty
              </button>
              <button
                onClick={() => setShiftStatus('off-duty')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  shiftStatus === 'off-duty' 
                    ? 'bg-neutral-600 text-white' 
                    : 'text-onboarding-textSecondary hover:text-onboarding-textPrimary'
                }`}
              >
                Off Duty
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-onboarding-textSecondary hover:text-onboarding-textPrimary border-onboarding-inputBackground hover:border-onboarding-primaryBlue bg-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Profile Stats - Hospital Color Scheme */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <Card className="bg-white border-onboarding-inputBackground shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-onboarding-textSecondary uppercase tracking-wide">Rating</p>
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-onboarding-textPrimary">{mockHealthWorkerData.profile.rating}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-onboarding-inputBackground shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-onboarding-textSecondary uppercase tracking-wide">Total Earnings</p>
                  <DollarSign className="h-5 w-5 text-onboarding-primaryGreen" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-onboarding-textPrimary">₦{(mockHealthWorkerData.profile.totalEarnings / 1000).toFixed(0)}k</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-onboarding-inputBackground shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-onboarding-textSecondary uppercase tracking-wide">Hours Worked</p>
                  <Clock className="h-5 w-5 text-onboarding-primaryBlue" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-onboarding-textPrimary">{mockHealthWorkerData.weeklyStats.hoursWorked}h</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-onboarding-inputBackground shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-onboarding-textSecondary uppercase tracking-wide">Weekly Earnings</p>
                  <Activity className="h-5 w-5 text-secondary-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-onboarding-textPrimary">₦{(mockHealthWorkerData.weeklyStats.earnings / 1000).toFixed(0)}k</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Off Duty Status - Hospital Color Scheme */}
        {shiftStatus === 'off-duty' && (
          <Card className="bg-onboarding-inputBackground border-onboarding-inputBackground">
            <CardContent className="p-4 sm:p-8 text-center">
              <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center mb-3 sm:mb-4">
                <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-onboarding-textSecondary" />
              </div>
              <h3 className="text-base sm:text-xl font-semibold text-onboarding-textPrimary mb-2">You are currently Off Duty</h3>
              <p className="text-sm text-onboarding-textSecondary mb-4">You won't receive notifications while in this mode.</p>
              <Button 
                onClick={toggleDutyStatus} 
                className="w-full sm:w-auto bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue text-white hover:opacity-90"
              >
                Go Online to See Shifts
              </Button>
              <p className="text-xs text-onboarding-textSecondary mt-2">Last shift: Today, 8:43 AM</p>
            </CardContent>
          </Card>
        )}

        {/* Available Shifts - Hospital Color Scheme */}
        <Card className="bg-white border-onboarding-inputBackground shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base sm:text-lg text-onboarding-textPrimary">
              <span>Available Shifts</span>
              <span className="text-xs sm:text-sm font-normal text-onboarding-textSecondary">
                {mockHealthWorkerData.availableShifts.length} shifts
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockHealthWorkerData.availableShifts.map((shift) => (
              <div
                key={shift.id}
                className="p-3 sm:p-4 rounded-lg border border-onboarding-inputBackground hover:border-onboarding-primaryBlue transition-all bg-white"
              >
                {/* Mobile Layout */}
                <div className="block sm:hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-onboarding-textPrimary text-sm">{shift.hospital}</h4>
                      <p className="text-xs text-onboarding-textSecondary">{shift.department}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-bold text-onboarding-primaryGreen">₦{shift.hourlyRate.toLocaleString()}/hr</p>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getUrgencyColor(shift.urgency)}`}>
                        {shift.urgency}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-onboarding-textSecondary">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{shift.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{shift.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-onboarding-textSecondary">
                      <MapPin className="h-3 w-3" />
                      <span>{shift.location}</span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleClockIn(shift)}
                      disabled={shiftStatus === 'off-duty'}
                      className="px-4 py-1.5 text-xs bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue hover:opacity-90 text-white transition-all"
                    >
                      Accept
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-onboarding-textPrimary">{shift.hospital}</h4>
                      <p className="text-sm text-onboarding-textSecondary">{shift.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-onboarding-primaryGreen">₦{shift.hourlyRate.toLocaleString()}/hr</p>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getUrgencyColor(shift.urgency)}`}>
                        {shift.urgency} priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-onboarding-textSecondary">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{shift.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{shift.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{shift.location}</span>
                    </div>
                  </div>
                  
                    <Button 
                      size="sm"
                      onClick={() => handleClockIn(shift)}
                      disabled={shiftStatus === 'off-duty'}
                      className="bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue hover:opacity-90 text-white transition-all"
                    >
                      Accept Shift
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity - Hospital Color Scheme */}
        <Card className="sm:hidden bg-white border-onboarding-inputBackground shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-onboarding-textPrimary">Recent Shifts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockHealthWorkerData.recentShifts.slice(0, 3).map((shift, index) => (
              <div key={index} className="p-2 bg-onboarding-inputBackground rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-onboarding-textPrimary text-xs">{shift.hospital}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-warning-500 fill-warning-500" />
                    <span className="text-xs font-medium text-onboarding-textPrimary">{shift.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-onboarding-textSecondary">
                  <span>{shift.date}</span>
                  <span className="font-semibold text-onboarding-primaryGreen">₦{shift.earnings.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}