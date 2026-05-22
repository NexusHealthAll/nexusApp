import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { 
  Mic,
  MicOff,
  Volume2,
  Languages,
  FileText,
  Save,
  Send,
  Play,
  Pause
} from 'lucide-react';

interface AITranscriberViewProps {
  patientId: string;
  onSaveNotes: (notes: any) => void;
  onCompleteConsultation: () => void;
}

// Mock transcription data
const mockTranscriptionData = {
  isRecording: true,
  sourceLanguage: 'Hausa',
  targetLanguage: 'English',
  liveTranscription: 'Patient reports chest pain radiating to left arm, started 2 hours ago, severity 7/10...',
  audioWaveform: [12, 25, 18, 32, 28, 15, 22, 35, 29, 18, 24, 31, 19, 26, 33, 21, 17, 28, 34, 20],
  generatedNotes: {
    chiefComplaint: 'Chest pain radiating to left arm, onset 2 hours ago, severity 7/10',
    assessment: 'Patient presents with acute chest pain with radiation pattern suggestive of cardiac origin. Vital signs stable. No obvious respiratory distress.',
    plan: '1. ECG to rule out MI\n2. Cardiac enzymes (Troponin I)\n3. Chest X-ray\n4. Pain management with sublingual nitroglycerin\n5. Monitor vital signs q15min'
  },
  transcriptionHistory: [
    {
      timestamp: '00:01:23',
      hausa: 'Na ji zafi a kirjina wanda ya kai hannun hagu',
      english: 'I feel pain in my chest that reaches my left arm',
      confidence: 0.95
    },
    {
      timestamp: '00:01:45',
      hausa: 'Zafin ya fara tun sa\'a biyu da suka wuce',
      english: 'The pain started two hours ago',
      confidence: 0.92
    },
    {
      timestamp: '00:02:10',
      hausa: 'Zafin yana da karfi sosai, kamar 7 cikin 10',
      english: 'The pain is very severe, like 7 out of 10',
      confidence: 0.89
    }
  ]
};

export function AITranscriberView({ patientId, onSaveNotes, onCompleteConsultation }: AITranscriberViewProps) {
  const [isRecording, setIsRecording] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState('00:03:45');
  const [waveformData, setWaveformData] = useState(mockTranscriptionData.audioWaveform);

  // Simulate waveform animation
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setWaveformData(prev => 
        prev.map(() => Math.floor(Math.random() * 40) + 5)
      );
    }, 200);

    return () => clearInterval(interval);
  }, [isRecording]);

  // Simulate recording timer
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRecordingDuration(prev => {
        const [minutes, seconds] = prev.split(':').map(Number);
        const totalSeconds = minutes * 60 + seconds + 1;
        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;
        return `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">AI Transcriber/Translation</h1>
            <p className="text-sm text-neutral-600">Patient #{patientId} • Live Session</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Languages className="h-4 w-4 text-primary-600" />
              <span>{mockTranscriptionData.sourceLanguage} → {mockTranscriptionData.targetLanguage}</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-neutral-900">{recordingDuration}</p>
              <p className="text-xs text-neutral-500">Recording Time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Transcription Area */}
        <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
          {/* Live Transcription with Waveform */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Transcription</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={isRecording ? "primary" : "outline"}
                    size="sm"
                    onClick={toggleRecording}
                    className={isRecording ? "bg-error-600 hover:bg-error-700" : ""}
                  >
                    {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                    {isRecording ? 'Stop' : 'Record'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Waveform Visualizer */}
              <div className="bg-neutral-900 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {isRecording && (
                      <>
                        <div className="w-3 h-3 bg-error-500 rounded-full animate-pulse"></div>
                        <span className="text-error-400 text-sm font-medium">LIVE RECORDING</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-400 text-sm">{recordingDuration}</span>
                  </div>
                </div>
                
                {/* Waveform Display */}
                <div className="flex items-end justify-center space-x-1 h-20 mb-4">
                  {waveformData.map((height, index) => (
                    <div
                      key={index}
                      className={`w-2 rounded-t transition-all duration-200 ${
                        isRecording ? 'bg-primary-400' : 'bg-neutral-600'
                      }`}
                      style={{ height: `${height}px` }}
                    />
                  ))}
                </div>

                {/* Live Text */}
                <div className="border-t border-neutral-700 pt-4">
                  <div className="text-xs text-neutral-400 mb-2">LIVE TRANSCRIPTION</div>
                  <div className="text-white text-sm leading-relaxed">
                    {isRecording ? (
                      <span className="text-primary-300">
                        {mockTranscriptionData.liveTranscription}
                        <span className="animate-pulse">|</span>
                      </span>
                    ) : (
                      <span className="text-neutral-500">
                        Click "Record" to start live transcription
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Translation History */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                <h4 className="font-medium text-neutral-900">Translation History</h4>
                {mockTranscriptionData.transcriptionHistory.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <div className="text-xs font-medium text-neutral-500 mb-1">
                        {item.timestamp} • Hausa
                      </div>
                      <div className="text-sm text-neutral-900 font-medium">
                        {item.hausa}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-neutral-500 mb-1">
                        English • {Math.round(item.confidence * 100)}% confidence
                      </div>
                      <div className="text-sm text-neutral-900">
                        {item.english}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Generated Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary-600" />
                <span>Live Generated Note</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Chief Complaint */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Chief Complaint
                  </label>
                  <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <p className="text-sm text-primary-900">
                      {mockTranscriptionData.generatedNotes.chiefComplaint}
                    </p>
                  </div>
                </div>

                {/* Assessment */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Assessment
                  </label>
                  <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                    <p className="text-sm text-secondary-900">
                      {mockTranscriptionData.generatedNotes.assessment}
                    </p>
                  </div>
                </div>

                {/* Plan */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Plan
                  </label>
                  <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                    <pre className="text-sm text-success-900 whitespace-pre-wrap font-sans">
                      {mockTranscriptionData.generatedNotes.plan}
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                  <Button variant="outline" onClick={() => onSaveNotes(mockTranscriptionData.generatedNotes)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notes
                  </Button>
                  <Button onClick={onCompleteConsultation}>
                    <Send className="h-4 w-4 mr-2" />
                    Complete Consultation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Info Sidebar */}
        <div className="w-80 bg-white border-l border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4">Patient Information</h3>
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="text-sm font-medium text-neutral-700">Patient ID</p>
              <p className="text-lg font-semibold text-neutral-900">#{patientId}</p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="text-sm font-medium text-neutral-700">Session Duration</p>
              <p className="text-lg font-semibold text-neutral-900">{recordingDuration}</p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="text-sm font-medium text-neutral-700">Language Detected</p>
              <p className="text-lg font-semibold text-neutral-900">{mockTranscriptionData.sourceLanguage}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}