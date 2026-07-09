import { useState, useRef, useEffect } from "react";
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
  Languages,
  Save,
  Send,
  ArrowLeft,
  User,
  Volume2,
  VolumeX,
  RotateCcw,
  Clock,
} from "lucide-react";

interface ConsultationViewProps {
  appointmentId: string;
  patientId: string;
  onClose?: () => void;
}

interface ClinicalNotes {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  assessment: string;
}

// Mock patient data for health worker consultation
const mockPatientData = {
  id: "P002",
  name: "Amina Yusuf",
  age: 28,
  gender: "Female",
  language: "Hausa",
  visitReason: "Abdominal pain",
};

export function ConsultationView({
  appointmentId,
  patientId,
  onClose,
}: ConsultationViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<"transcript" | "history">(
    "transcript",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNotes>({
    chiefComplaint: "",
    historyOfPresentIllness: "",
    assessment: "",
  });

  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const audioLevelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Simulate audio recording and waveform
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      audioLevelIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
      setAudioLevel(0);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
    };
  }, [isRecording]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPlaying(false);
  };

  const resetRecording = () => {
    setIsRecording(false);
    setIsPlaying(false);
    setRecordingDuration(0);
    setAudioLevel(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const updateClinicalNote = (field: keyof ClinicalNotes, value: string) => {
    setClinicalNotes((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Generate waveform bars based on audio level
  const generateWaveformBars = () => {
    const bars = [];
    for (let i = 0; i < 50; i++) {
      const height = isRecording
        ? Math.random() * audioLevel + 10
        : Math.random() * 15 + 5;
      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-100 ${
            isRecording ? "bg-primary-500" : "bg-neutral-300"
          }`}
          style={{ height: `${Math.min(height, 80)}px` }}
        />,
      );
    }
    return bars;
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-neutral-300 hidden sm:block" />
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-neutral-900 truncate">
                  {mockPatientData.name}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600">
                  {mockPatientData.age} years • {mockPatientData.gender} •{" "}
                  {mockPatientData.visitReason}
                </p>
                <p className="text-xs text-neutral-500">
                  Visit #{appointmentId} • Patient #{patientId}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Save className="h-4 w-4 mr-2" />
              Save Notes
            </Button>
            <Button size="sm">
              <Send className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Complete</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("transcript")}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "transcript"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            }`}
          >
            Live Transcript
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "history"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            }`}
          >
            Patient Medical History
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          {activeTab === "transcript" ? (
            <>
              {/* Live Recording Audio Waveform Block */}
              <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center space-x-2">
                      <Mic className="h-5 w-5 text-primary-600" />
                      <span>Live Audio Recording</span>
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-sm font-normal text-neutral-600">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(recordingDuration)}</span>
                      </div>
                      {isRecording && (
                        <div className="h-2 w-2 bg-error-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Waveform Visualization */}
                  <div className="bg-white rounded-lg p-6 border border-neutral-200">
                    <div className="flex items-end justify-center space-x-1 h-20">
                      {generateWaveformBars()}
                    </div>
                  </div>

                  {/* Recording Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant={isRecording ? "danger" : "primary"}
                      size="lg"
                      onClick={toggleRecording}
                      className="rounded-full h-14 w-14 p-0"
                    >
                      {isRecording ? (
                        <MicOff className="h-6 w-6" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetRecording}
                      disabled={recordingDuration === 0}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>

                  {/* Recording Action Controls */}
                  <div className="flex items-center justify-center space-x-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePlayback}
                      disabled={recordingDuration === 0}
                      className="flex items-center space-x-2"
                    >
                      {isPlaying ? (
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span>{isPlaying ? "Pause" : "Play"}</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopRecording}
                      disabled={!isRecording && !isPlaying}
                      className="flex items-center space-x-2"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Stop</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Hausa ⇄ English Translation Toggle Bar */}
              <Card className="border-secondary-200 bg-secondary-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Languages className="h-6 w-6 text-secondary-600" />
                      <div>
                        <p className="font-semibold text-secondary-900">
                          Hausa ⇄ English Translation
                        </p>
                        <p className="text-sm text-secondary-700">
                          {isTranslationEnabled
                            ? "Real-time translation active"
                            : "Translation disabled"}{" "}
                          • Patient speaks {mockPatientData.language}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={isTranslationEnabled ? "primary" : "outline"}
                      size="sm"
                      onClick={() =>
                        setIsTranslationEnabled(!isTranslationEnabled)
                      }
                      className={
                        isTranslationEnabled
                          ? "bg-secondary-600 hover:bg-secondary-700"
                          : ""
                      }
                    >
                      {isTranslationEnabled ? (
                        <>
                          <Volume2 className="h-4 w-4 mr-2" />
                          ON
                        </>
                      ) : (
                        <>
                          <VolumeX className="h-4 w-4 mr-2" />
                          OFF
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Structured Editable Text Fields */}
              <div className="space-y-4 sm:space-y-6">
                {/* Chief Complaint */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Chief Complaint</span>
                      <span className="text-sm font-normal text-neutral-500">
                        {clinicalNotes.chiefComplaint.length}/500
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={clinicalNotes.chiefComplaint}
                      onChange={(e) =>
                        updateClinicalNote("chiefComplaint", e.target.value)
                      }
                      placeholder="What is the patient's primary concern? Document the main reason for today's visit..."
                      maxLength={500}
                      className="w-full h-24 sm:h-32 p-4 border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                    />
                  </CardContent>
                </Card>

                {/* History of Present Illness */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>History of Present Illness</span>
                      <span className="text-sm font-normal text-neutral-500">
                        {clinicalNotes.historyOfPresentIllness.length}/1000
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={clinicalNotes.historyOfPresentIllness}
                      onChange={(e) =>
                        updateClinicalNote(
                          "historyOfPresentIllness",
                          e.target.value,
                        )
                      }
                      placeholder="Detailed history of the current illness: onset, duration, severity, associated symptoms, aggravating/relieving factors..."
                      maxLength={1000}
                      className="w-full h-32 sm:h-40 p-4 border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                    />
                  </CardContent>
                </Card>

                {/* Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Assessment</span>
                      <span className="text-sm font-normal text-neutral-500">
                        {clinicalNotes.assessment.length}/1000
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={clinicalNotes.assessment}
                      onChange={(e) =>
                        updateClinicalNote("assessment", e.target.value)
                      }
                      placeholder="Clinical assessment, differential diagnosis, examination findings, and medical impression..."
                      maxLength={1000}
                      className="w-full h-32 sm:h-40 p-4 border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Mobile Action Buttons */}
              <div className="lg:hidden flex space-x-3 pt-4">
                <Button variant="outline" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
                <Button className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Patient Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Medical History Sections */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-neutral-900">
                        Previous Visits
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-neutral-50 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-neutral-900">
                              Oct 15, 2024
                            </span>
                            <span className="text-xs px-2 py-1 bg-success-100 text-success-800 rounded-full">
                              Resolved
                            </span>
                          </div>
                          <p className="text-sm text-neutral-700">
                            Headache, prescribed paracetamol
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Dr. Ibrahim Musa
                          </p>
                        </div>
                        <div className="p-3 bg-neutral-50 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-neutral-900">
                              Sep 28, 2024
                            </span>
                            <span className="text-xs px-2 py-1 bg-success-100 text-success-800 rounded-full">
                              Resolved
                            </span>
                          </div>
                          <p className="text-sm text-neutral-700">
                            Routine checkup, all normal
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Dr. Fatima Ali
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-neutral-900">
                        Allergies & Medications
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-warning-50 rounded-lg border border-warning-200">
                          <h5 className="text-sm font-medium text-warning-800 mb-1">
                            Known Allergies
                          </h5>
                          <p className="text-sm text-warning-700">
                            Penicillin - Skin rash
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <h5 className="text-sm font-medium text-blue-800 mb-1">
                            Current Medications
                          </h5>
                          <p className="text-sm text-blue-700">None reported</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vital Signs History */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-4">
                      Recent Vital Signs
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-neutral-200">
                            <th className="text-left py-2 px-3 font-medium text-neutral-700">
                              Date
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-neutral-700">
                              BP
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-neutral-700">
                              Temp
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-neutral-700">
                              Pulse
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-neutral-700">
                              Weight
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-neutral-100">
                            <td className="py-2 px-3 text-neutral-900">
                              Oct 15, 2024
                            </td>
                            <td className="py-2 px-3 text-neutral-700">
                              120/80
                            </td>
                            <td className="py-2 px-3 text-neutral-700">
                              36.5°C
                            </td>
                            <td className="py-2 px-3 text-neutral-700">
                              72 bpm
                            </td>
                            <td className="py-2 px-3 text-neutral-700">
                              65 kg
                            </td>
                          </tr>
                          <tr className="border-b border-neutral-100">
                            <td className="py-2 px-3 text-neutral-900">
                              Sep 28, 2024
                            </td>
                            <td className="py-2 px-3 text-neutral-700">
                              118/78
                            </td>
                            <td className="py-2 px-3 text-neutral-700">
                              36.2°C
                            </td>
                            <td className="py-2 px-3 text-neutral-700">
                              68 bpm
                            </td>
                            <td className="py-2 px-3 text-neutral-700">
                              64 kg
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Family History */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-4">
                      Family History
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-3 bg-neutral-50 rounded-lg">
                        <h5 className="text-sm font-medium text-neutral-900 mb-1">
                          Maternal
                        </h5>
                        <p className="text-sm text-neutral-700">
                          Hypertension (Mother)
                        </p>
                      </div>
                      <div className="p-3 bg-neutral-50 rounded-lg">
                        <h5 className="text-sm font-medium text-neutral-900 mb-1">
                          Paternal
                        </h5>
                        <p className="text-sm text-neutral-700">
                          Diabetes Type 2 (Father)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Action Buttons for History Tab */}
              <div className="lg:hidden flex space-x-3 pt-4">
                <Button variant="outline" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
                <Button className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Patient Info Sidebar - Hidden on mobile, shown on larger screens */}
        <div className="hidden lg:block w-80 bg-white border-l border-neutral-200 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">
                Patient Information
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-sm font-medium text-neutral-700">
                    Patient ID
                  </p>
                  <p className="text-neutral-900">{mockPatientData.id}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-sm font-medium text-neutral-700">
                    Primary Language
                  </p>
                  <p className="text-neutral-900">{mockPatientData.language}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-sm font-medium text-neutral-700">
                    Visit Reason
                  </p>
                  <p className="text-neutral-900">
                    {mockPatientData.visitReason}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-sm font-medium text-neutral-700">
                    Demographics
                  </p>
                  <p className="text-neutral-900">
                    {mockPatientData.age} years, {mockPatientData.gender}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">
                Session Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral-700">
                    Recording
                  </span>
                  <span
                    className={`text-sm font-semibold ${isRecording ? "text-error-600" : "text-neutral-500"}`}
                  >
                    {isRecording ? "LIVE" : "Stopped"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral-700">
                    Translation
                  </span>
                  <span
                    className={`text-sm font-semibold ${isTranslationEnabled ? "text-success-600" : "text-neutral-500"}`}
                  >
                    {isTranslationEnabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral-700">
                    Duration
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {formatDuration(recordingDuration)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
