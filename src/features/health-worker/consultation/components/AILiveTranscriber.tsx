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
  Languages,
  Save,
  Send,
  ArrowLeft,
  Pause,
  Play,
  Square,
  Brain,
} from "lucide-react";

interface SOAPNotes {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  assessment: string;
}

interface AILiveTranscriberProps {
  patientId: string;
  onSaveNotes?: (notes: SOAPNotes) => void;
  onCompleteConsultation?: () => void;
  onClose?: () => void;
}

// Mock patient data
const mockPatientData = {
  id: "P002",
  name: "Amina Yusuf",
  age: 28,
  gender: "Female",
  language: "Hausa",
  visitReason: "Abdominal pain",
};

export function AILiveTranscriber({
  patientId,
  onSaveNotes,
  onCompleteConsultation,
  onClose,
}: AILiveTranscriberProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [soapNotes] = useState<SOAPNotes>({
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
  // Simulate AI processing and waveform
  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      audioLevelIntervalRef.current = setInterval(() => {
        Math.random();
      }, 100);

      setIsAIProcessing(true);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
      setIsAIProcessing(false);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setIsPaused(false);
    } else {
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    if (isRecording) {
      setIsPaused(!isPaused);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with glassmorphism effect */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0 hover:bg-white/50 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-semibold text-neutral-900 truncate">
                AI Transcriber
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 truncate">
                Patient #{patientId || mockPatientData.id}
              </p>
            </div>
          </div>

          {/* Recording Status - Mobile Optimized */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="flex flex-col items-end">
              <div className="hidden sm:flex items-center space-x-1">
                <span className="text-xs text-neutral-500">
                  {mockPatientData.language}
                </span>
                <Languages className="h-3 w-3 text-neutral-500" />
                <span className="text-xs text-neutral-500">EN</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm sm:text-lg font-mono font-bold text-neutral-900">
                  {formatDuration(recordingDuration)}
                </span>
                {isRecording && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="text-xs text-neutral-500 hidden sm:block">
                Recording Time
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 pb-20 sm:pb-4">
        {/* Patient Information Card - Mobile Optimized */}
        <Card className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div className="flex justify-between sm:block">
                <span className="text-neutral-500">Patient ID</span>
                <span className="font-semibold text-neutral-900">
                  #{mockPatientData.id}
                </span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-neutral-500">Duration</span>
                <span className="font-semibold text-neutral-900">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
              <div className="flex justify-between sm:block sm:col-span-2">
                <span className="text-neutral-500">Language</span>
                <span className="font-semibold text-neutral-900">
                  {mockPatientData.language} → English
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Transcript Section - Mobile First Design */}
        <div className="space-y-3 sm:space-y-4">
          {/* Transcript Panel - Full Width on Mobile */}
          <Card className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
            <CardHeader className="pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-base flex items-center justify-between">
                <span>Live Transcript</span>
                {isRecording && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-600 font-medium">
                      REC
                    </span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="h-48 sm:h-64 lg:h-80 overflow-y-auto">
                {isRecording ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-white font-bold">
                            P
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-blue-900 mb-1 break-words">
                            Patient reports chest pain radiating to left arm,
                            started 2 hours ago...
                          </p>
                          <p className="text-xs text-blue-600 italic break-words">
                            Translation: Mai ciwon kirji da ke zuwa hannun hagu,
                            ya fara sa'o'i 2 da suka wuce...
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-white font-bold">
                            D
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-green-900 mb-1 break-words">
                            Can you describe the severity of the pain on a scale
                            of 1 to 10?
                          </p>
                          <p className="text-xs text-green-600 italic break-words">
                            Translation: Za ka iya bayyana girman zafin a
                            sikelin 1 zuwa 10?
                          </p>
                        </div>
                      </div>
                    </div>

                    {isAIProcessing && (
                      <div className="flex items-center justify-center py-4">
                        <div className="flex items-center space-x-2 text-purple-600">
                          <Brain className="h-4 w-4 animate-pulse" />
                          <span className="text-sm">
                            AI processing speech...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-500">
                    <div className="text-center">
                      <Mic className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        Start recording to see live transcript
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Translation History Panel - Separate Card on Mobile */}
          <Card className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
            <CardHeader className="pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">
                Translation History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="h-32 sm:h-48 lg:h-64 overflow-y-auto">
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-neutral-50 rounded border-l-2 border-blue-400">
                    <p className="font-medium text-neutral-900 break-words">
                      Chest pain
                    </p>
                    <p className="text-neutral-600 text-xs break-words">
                      Ciwon kirji
                    </p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded border-l-2 border-green-400">
                    <p className="font-medium text-neutral-900 break-words">
                      Severe pain
                    </p>
                    <p className="text-neutral-600 text-xs break-words">
                      Zafi mai tsanani
                    </p>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded border-l-2 border-purple-400">
                    <p className="font-medium text-neutral-900 break-words">
                      Medical history
                    </p>
                    <p className="text-neutral-600 text-xs break-words">
                      Tarihin likitanci
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recording Controls - Fixed on Mobile */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto bg-white/95 backdrop-blur-xl border-t sm:border-t-0 sm:bg-transparent sm:backdrop-blur-none p-3 sm:p-0">
          <Card className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  variant={isRecording ? "danger" : "primary"}
                  size="lg"
                  onClick={toggleRecording}
                  className="rounded-full h-12 w-12 sm:h-14 sm:w-14 p-0 shadow-lg"
                >
                  {isRecording ? (
                    <Square className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={togglePause}
                  disabled={!isRecording}
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 p-0"
                >
                  {isPaused ? (
                    <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>

                <div className="flex-1 max-w-xs w-full sm:w-auto">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span>Translation</span>
                    <span>{isTranslationEnabled ? "ON" : "OFF"}</span>
                  </div>
                  <button
                    onClick={() =>
                      setIsTranslationEnabled(!isTranslationEnabled)
                    }
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 ${
                      isTranslationEnabled
                        ? "bg-gradient-to-r from-emerald-400 to-cyan-500 shadow-lg"
                        : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        isTranslationEnabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons - Fixed on Mobile */}
        <div className="fixed bottom-20 left-3 right-3 sm:relative sm:bottom-auto sm:left-auto sm:right-auto flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 bg-white/95 backdrop-blur-xl border-white/30"
            onClick={() => onSaveNotes?.(soapNotes)}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Notes
          </Button>
          <Button
            className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white"
            onClick={onCompleteConsultation}
          >
            <Send className="h-4 w-4 mr-2" />
            Complete
          </Button>
        </div>
      </div>
    </div>
  );
}
