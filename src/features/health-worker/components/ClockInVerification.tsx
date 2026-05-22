import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { 
  MapPin,
  Clock,
  Building2,
  CheckCircle,
  ArrowLeft,
  Navigation
} from 'lucide-react';

interface ClockInVerificationProps {
  shiftData: {
    hospital: string;
    department: string;
    location: string;
    time: string;
    hourlyRate: number;
  };
  onConfirmClockIn: () => void;
  onCancel: () => void;
}

export function ClockInVerification({ shiftData, onConfirmClockIn, onCancel }: ClockInVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleConfirmClockIn = () => {
    setIsVerifying(true);
    // Simulate verification process
    setTimeout(() => {
      onConfirmClockIn();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onCancel} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-base sm:text-xl font-semibold text-neutral-900">Clock-In Verification</h1>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Shift Details Card - Mobile First */}
          <Card className="border-primary-200 bg-primary-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-primary-900 text-sm sm:text-lg">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Shift Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-primary-700 mb-1">Hospital</p>
                  <p className="text-sm font-semibold text-primary-900">{shiftData.hospital}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-primary-700 mb-1">Department</p>
                  <p className="text-sm text-primary-900">{shiftData.department}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-primary-700 mb-1">Schedule</p>
                  <p className="text-sm text-primary-900">{shiftData.time}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-primary-700 mb-1">Rate</p>
                  <p className="text-sm font-semibold text-primary-900">₦{shiftData.hourlyRate.toLocaleString()}/hr</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Verification Card - Mobile Optimized */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-600" />
                <span>Location Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Map Placeholder - Premium Glassmorphism */}
              <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-4 sm:p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <Navigation className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-emerald-500" />
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">Location Confirmed</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-3">
                  You are within proximity of {shiftData.location}
                </p>
                <div className="flex items-center justify-center space-x-2 text-emerald-600">
                  <CheckCircle className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">GPS Verified</span>
                </div>
              </div>

              {/* Location Details - Mobile Card */}
              <div className="bg-neutral-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{shiftData.hospital}</p>
                    <p className="text-xs text-neutral-600">{shiftData.location}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-xs text-neutral-600">Distance</p>
                    <p className="text-sm font-semibold text-success-600">0.2 km</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clock-In Confirmation - Mobile Perfect */}
          <Card className="border-success-200 bg-success-50">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2 text-success-700">
                  <Clock className="h-5 w-5" />
                  <span className="text-base font-semibold">Ready to Clock In</span>
                </div>
                <p className="text-sm text-success-800 px-2">
                  Confirm your location and start your shift
                </p>
                
                {/* Mobile Buttons */}
                <div className="space-y-2 pt-2">
                  <Button 
                    onClick={handleConfirmClockIn}
                    disabled={isVerifying}
                    isLoading={isVerifying}
                    className="w-full bg-success-600 hover:bg-success-700 py-3"
                  >
                    {isVerifying ? 'Verifying Location...' : 'Confirm Clock In'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onCancel} 
                    disabled={isVerifying}
                    className="w-full py-3"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}