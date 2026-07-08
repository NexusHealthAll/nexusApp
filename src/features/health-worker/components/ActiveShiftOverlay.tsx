import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/Button";
import { formatTime } from "@/shared/utils/date";
import {
  Clock,
  Plus,
  Pause,
  Play,
  Square,
  Users,
  Activity,
} from "lucide-react";

interface ActiveShiftOverlayProps {
  shiftData: {
    hospital: string;
    department: string;
    startTime: string;
    hourlyRate: number;
  };
  onRecordNewPatient: () => void;
  onPauseShift: () => void;
  onEndShift: () => void;
}

export function ActiveShiftOverlay({
  shiftData,
  onRecordNewPatient,
  onPauseShift,
  onEndShift,
}: ActiveShiftOverlayProps) {
  const [elapsedTime, setElapsedTime] = useState("4:23");
  const [isPaused, setIsPaused] = useState(false);
  const [patientsSeenToday] = useState(12);

  // Simulate timer counting up
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const [hours, minutes] = prev.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + 1;
        const newHours = Math.floor(totalMinutes / 60);
        const newMins = totalMinutes % 60;
        return `${newHours}:${newMins.toString().padStart(2, "0")}`;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    onPauseShift();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 shadow-md">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Shift Info */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Active Shift</h3>
                <p className="text-sm text-neutral-600">{shiftData.hospital}</p>
              </div>
            </div>

            {/* Timer Display */}
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary-600" />
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600">
                  {elapsedTime}
                </p>
                <p className="text-xs text-neutral-500">Hours Active</p>
              </div>
            </div>

            {/* Patients Seen */}
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-secondary-600" />
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary-600">
                  {patientsSeenToday}
                </p>
                <p className="text-xs text-neutral-500">Patients Today</p>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={onRecordNewPatient}
              className="bg-success-600 hover:bg-success-700 text-white px-6 py-3"
            >
              <Plus className="mr-2 h-5 w-5" />
              RECORD NEW PATIENT
            </Button>

            <Button
              variant="outline"
              onClick={handlePauseResume}
              className="px-4 py-3"
            >
              {isPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onEndShift}
              className="px-4 py-3 border-error-300 text-error-600 hover:bg-error-50"
            >
              <Square className="mr-2 h-4 w-4" />
              End Shift
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-200">
          <div className="flex items-center space-x-6 text-sm text-neutral-600">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${isPaused ? "bg-warning-500" : "bg-success-500"}`}
              ></div>
              <span>{isPaused ? "Shift Paused" : "Shift Active"}</span>
            </div>
            <div>
              Started: {formatTime(shiftData.startTime)}
            </div>
            <div>Rate: ₦{shiftData.hourlyRate.toLocaleString()}/hour</div>
          </div>

          <div className="text-sm text-neutral-600">
            <span>Estimated Earnings: </span>
            <span className="font-semibold text-success-600">
              ₦
              {(
                parseFloat(elapsedTime.replace(":", ".")) * shiftData.hourlyRate
              ).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
