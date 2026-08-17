import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import {
  Mic,
  MicOff,
  User,
  FileText,
  Send,
  Save,
  ArrowLeft,
  Activity,
  Heart,
  Thermometer,
} from "lucide-react";

interface ActiveShiftViewProps {
  shiftId: string;
  onEndShift: () => void;
}

// Mock active shift data
const mockActiveShiftData = {
  hospital: "LUTH - Emergency Dept",
  department: "Emergency Medicine",
  startTime: "1:25 PM",
  duration: "00:03:45",
  currentPatient: {
    id: "P2341",
    name: "Sarah Jenkins",
    age: 28,
    condition: "Fever and cough for three days",
  },
  transcription: {
    isRecording: false,
    liveText:
      "Patient presents with fever and cough for 3 days. Temperature 38.5°C. Respiratory rate 22. Heart rate 95. Blood pressure 120/80.",
    segments: [
      {
        timestamp: "00:01:23",
        speaker: "Doctor",
        text: "Patient presents with fever and cough for three days with fever reaching up to 39°C",
      },
      {
        timestamp: "00:01:45",
        speaker: "Patient",
        text: "The cough started on Monday and has been getting worse. I also have body aches.",
      },
      {
        timestamp: "00:02:10",
        speaker: "Doctor",
        text: "Any shortness of breath or chest pain? Any recent travel or sick contacts?",
      },
    ],
  },
  vitals: {
    temperature: 38.5,
    heartRate: 95,
    bloodPressure: "120/80",
    respiratoryRate: 22,
    oxygenSaturation: 97,
  },
};

export function ActiveShiftView({ shiftId, onEndShift }: ActiveShiftViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [shiftDuration, setShiftDuration] = useState("00:03:45");
  const [clinicalNotes, setClinicalNotes] = useState("");

  // Simulate timer
  useEffect(() => {
    const interval = setInterval(() => {
      // Update duration every second (mock)
      setShiftDuration((prev) => {
        const [hours, minutes, seconds] = prev.split(":").map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds + 1;
        const newHours = Math.floor(totalSeconds / 3600);
        const newMinutes = Math.floor((totalSeconds % 3600) / 60);
        const newSecs = totalSeconds % 60;
        return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}:${newSecs.toString().padStart(2, "0")}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 dark:bg-neutral-900 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onEndShift}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              End Shift
            </Button>
            <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700" />
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Active Shift
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {mockActiveShiftData.hospital} •{" "}
                {mockActiveShiftData.department}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {shiftDuration}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">Shift Duration</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                12 seen so far
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">Patients</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
          {/* Current Patient */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span>Current Patient</span>
                </div>
                <span className="text-sm font-normal text-neutral-500 dark:text-neutral-500">
                  Anonymous #{mockActiveShiftData.currentPatient.id}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-400">
                    Patient ID
                  </p>
                  <p className="text-lg font-semibold">
                    {mockActiveShiftData.currentPatient.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-400">Age</p>
                  <p className="text-lg font-semibold">
                    {mockActiveShiftData.currentPatient.age} years
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-400">
                    Chief Complaint
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {mockActiveShiftData.currentPatient.condition}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Transcription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mic className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span>AI Transcriber/Translation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-normal text-neutral-500 dark:text-neutral-500">
                    Shift #{shiftId}
                  </span>
                  <Button
                    variant={isRecording ? "danger" : "outline"}
                    size="sm"
                    onClick={toggleRecording}
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Mic className="h-4 w-4 mr-2" />
                    )}
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Live Transcription Display */}
              <div className="bg-neutral-900 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-400">
                    LIVE TRANSCRIPTION
                  </span>
                  <div className="flex items-center space-x-2">
                    {isRecording && (
                      <>
                        <div className="w-2 h-2 bg-error-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-error-400">
                          Recording
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-white text-sm leading-relaxed">
                  {isRecording ? (
                    <span className="text-primary-400">
                      Patient reports chest pain radiating to left arm, started
                      2 hours ago, 7/10 severity...
                    </span>
                  ) : (
                    <span className="text-neutral-400">
                      Click "Start Recording" to begin live transcription
                    </span>
                  )}
                </div>
              </div>

              {/* Transcription History */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {mockActiveShiftData.transcription.segments.map(
                  (segment, index) => (
                    <div
                      key={index}
                      className="flex space-x-3 p-3 bg-neutral-50 rounded-lg dark:bg-neutral-800"
                    >
                      <div className="text-xs text-neutral-500 min-w-[60px] dark:text-neutral-500">
                        {segment.timestamp}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-neutral-700 mb-1 dark:text-neutral-400">
                          {segment.speaker}
                        </div>
                        <div className="text-sm text-neutral-900 dark:text-neutral-50">
                          {segment.text}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span>Clinical Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Document your clinical findings and observations..."
                className="w-full h-32 p-3 border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-neutral-700 dark:bg-neutral-800"
              />
              <div className="flex justify-end space-x-2 mt-3">
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Vitals Sidebar */}
        <div className="w-80 bg-white border-l border-neutral-200 flex flex-col dark:bg-neutral-900 dark:border-neutral-800">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Patient Vitals</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Real-time monitoring</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Temperature */}
            <div className="p-3 bg-error-50 border border-error-200 rounded-lg dark:bg-error-950 dark:border-error-800">
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="h-4 w-4 text-error-600 dark:text-error-400" />
                <span className="text-sm font-medium text-error-800 dark:text-error-300">
                  Temperature
                </span>
              </div>
              <p className="text-2xl font-bold text-error-900 dark:text-error-300">
                {mockActiveShiftData.vitals.temperature}°C
              </p>
              <p className="text-xs text-error-600 dark:text-error-400">Above normal</p>
            </div>

            {/* Heart Rate */}
            <div className="p-3 bg-neutral-50 rounded-lg dark:bg-neutral-800">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="h-4 w-4 text-error-500 dark:text-error-400" />
                <span className="text-sm font-medium">Heart Rate</span>
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {mockActiveShiftData.vitals.heartRate} bpm
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">Normal range</p>
            </div>

            {/* Blood Pressure */}
            <div className="p-3 bg-neutral-50 rounded-lg dark:bg-neutral-800">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-primary-500 dark:text-primary-400" />
                <span className="text-sm font-medium">Blood Pressure</span>
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {mockActiveShiftData.vitals.bloodPressure}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">mmHg</p>
            </div>

            {/* Respiratory Rate */}
            <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg dark:bg-warning-950 dark:border-warning-800">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-warning-600 dark:text-warning-400" />
                <span className="text-sm font-medium text-warning-800 dark:text-warning-300">
                  Respiratory Rate
                </span>
              </div>
              <p className="text-2xl font-bold text-warning-900 dark:text-warning-300">
                {mockActiveShiftData.vitals.respiratoryRate}/min
              </p>
              <p className="text-xs text-warning-600 dark:text-warning-400">Slightly elevated</p>
            </div>

            {/* O2 Saturation */}
            <div className="p-3 bg-neutral-50 rounded-lg dark:bg-neutral-800">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-primary-500 dark:text-primary-400" />
                <span className="text-sm font-medium">O2 Saturation</span>
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {mockActiveShiftData.vitals.oxygenSaturation}%
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">Normal</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                Complete Patient
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Request Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
