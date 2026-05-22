import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { 
  AlertTriangle,
  Clock,
  User,
  CheckCircle,
  ArrowRight,
  Heart,
  Activity,
  Thermometer
} from 'lucide-react';

interface HandoverViewProps {
  shiftData: {
    hospital: string;
    department: string;
    duration: string;
    patientsSeenToday: number;
  };
  onCompleteHandover: () => void;
  onCancelHandover: () => void;
}

// Mock handover data
const mockHandoverData = {
  criticalPatients: [
    {
      id: '#2344',
      bedNumber: 'Bed E1',
      condition: 'Post-operative monitoring',
      priority: 'critical',
      vitals: {
        heartRate: 110,
        bloodPressure: '90/60',
        temperature: 39.2,
        oxygenSaturation: 94
      },
      lastUpdate: '15 mins ago',
      notes: 'Patient requires hourly vital monitoring. Blood pressure trending down, may need fluid resuscitation.',
      medications: ['IV Fluids', 'Antibiotics', 'Pain management'],
      nextAction: 'Vital signs check in 30 minutes'
    },
    {
      id: '#2347',
      bedNumber: 'Bed E3',
      condition: 'Chest pain - Rule out MI',
      priority: 'high',
      vitals: {
        heartRate: 95,
        bloodPressure: '140/90',
        temperature: 37.1,
        oxygenSaturation: 98
      },
      lastUpdate: '8 mins ago',
      notes: 'Awaiting troponin results. ECG shows ST depression in leads II, III, aVF.',
      medications: ['Aspirin', 'Nitroglycerin PRN'],
      nextAction: 'Troponin results due in 1 hour'
    }
  ],
  pendingTasks: [
    {
      id: '1',
      task: 'Lab results for Patient #2341',
      priority: 'high',
      dueTime: '30 mins',
      description: 'CBC and electrolytes pending for fever workup',
      completed: false
    },
    {
      id: '2',
      task: 'Medication administration',
      priority: 'medium',
      dueTime: '1 hour',
      description: 'Antibiotics due for Patient #2344',
      completed: false
    },
    {
      id: '3',
      task: 'Discharge planning',
      priority: 'low',
      dueTime: '2 hours',
      description: 'Patient #2339 ready for discharge, awaiting family',
      completed: true
    },
    {
      id: '4',
      task: 'Radiology follow-up',
      priority: 'medium',
      dueTime: '45 mins',
      description: 'Chest X-ray results for Patient #2345',
      completed: false
    }
  ],
  shiftSummary: {
    totalPatients: 18,
    criticalCases: 2,
    discharges: 5,
    admissions: 3,
    pendingLabs: 4,
    medicationErrors: 0
  }
};

export function HandoverView({ shiftData, onCompleteHandover, onCancelHandover }: HandoverViewProps) {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-error-100 text-error-800 border-error-300';
      case 'high': return 'bg-warning-100 text-warning-800 border-warning-300';
      case 'medium': return 'bg-primary-100 text-primary-800 border-primary-300';
      case 'low': return 'bg-success-100 text-success-800 border-success-300';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  const getVitalStatus = (vital: string, value: number | string) => {
    // Simple vital sign assessment
    if (vital === 'heartRate') {
      const hr = value as number;
      if (hr > 100 || hr < 60) return 'text-error-600';
      return 'text-success-600';
    }
    if (vital === 'temperature') {
      const temp = value as number;
      if (temp > 38.5) return 'text-error-600';
      if (temp > 37.5) return 'text-warning-600';
      return 'text-success-600';
    }
    if (vital === 'oxygenSaturation') {
      const spo2 = value as number;
      if (spo2 < 95) return 'text-error-600';
      if (spo2 < 98) return 'text-warning-600';
      return 'text-success-600';
    }
    return 'text-neutral-600';
  };

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Complete Handover</h1>
            <p className="text-sm text-neutral-600">
              {shiftData.hospital} • {shiftData.department} • {shiftData.duration} shift
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onCancelHandover}>
              Cancel
            </Button>
            <Button onClick={onCompleteHandover} className="bg-success-600 hover:bg-success-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              CONFIRM & CLOCK OUT
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Shift Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Shift Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">{mockHandoverData.shiftSummary.totalPatients}</p>
                  <p className="text-sm text-neutral-600">Total Patients</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-error-600">{mockHandoverData.shiftSummary.criticalCases}</p>
                  <p className="text-sm text-neutral-600">Critical Cases</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-success-600">{mockHandoverData.shiftSummary.discharges}</p>
                  <p className="text-sm text-neutral-600">Discharges</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Patients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-error-500" />
                <span>Critical Patients</span>
                <span className="text-sm font-normal text-neutral-500">
                  ({mockHandoverData.criticalPatients.length} patients)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHandoverData.criticalPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPatient === patient.id
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => setSelectedPatient(patient.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-error-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-error-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-neutral-900">
                            Patient {patient.id} • {patient.bedNumber}
                          </h4>
                          <p className="text-sm text-neutral-600">{patient.condition}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(patient.priority)}`}>
                          {patient.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-neutral-500">{patient.lastUpdate}</span>
                      </div>
                    </div>

                    {/* Vital Signs */}
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="text-center p-2 bg-neutral-50 rounded">
                        <Heart className="h-4 w-4 mx-auto mb-1 text-error-500" />
                        <p className={`text-sm font-semibold ${getVitalStatus('heartRate', patient.vitals.heartRate)}`}>
                          {patient.vitals.heartRate}
                        </p>
                        <p className="text-xs text-neutral-500">HR</p>
                      </div>
                      <div className="text-center p-2 bg-neutral-50 rounded">
                        <Activity className="h-4 w-4 mx-auto mb-1 text-primary-500" />
                        <p className="text-sm font-semibold text-neutral-900">
                          {patient.vitals.bloodPressure}
                        </p>
                        <p className="text-xs text-neutral-500">BP</p>
                      </div>
                      <div className="text-center p-2 bg-neutral-50 rounded">
                        <Thermometer className="h-4 w-4 mx-auto mb-1 text-warning-500" />
                        <p className={`text-sm font-semibold ${getVitalStatus('temperature', patient.vitals.temperature)}`}>
                          {patient.vitals.temperature}°C
                        </p>
                        <p className="text-xs text-neutral-500">Temp</p>
                      </div>
                      <div className="text-center p-2 bg-neutral-50 rounded">
                        <Activity className="h-4 w-4 mx-auto mb-1 text-secondary-500" />
                        <p className={`text-sm font-semibold ${getVitalStatus('oxygenSaturation', patient.vitals.oxygenSaturation)}`}>
                          {patient.vitals.oxygenSaturation}%
                        </p>
                        <p className="text-xs text-neutral-500">SpO2</p>
                      </div>
                    </div>

                    {/* Clinical Notes */}
                    <div className="p-3 bg-warning-50 border border-warning-200 rounded mb-3">
                      <p className="text-sm text-warning-900">{patient.notes}</p>
                    </div>

                    {/* Next Action */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-neutral-700">Next Action:</p>
                        <p className="text-sm text-neutral-900">{patient.nextAction}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-neutral-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning-500" />
                <span>Pending Tasks</span>
                <span className="text-sm font-normal text-neutral-500">
                  ({mockHandoverData.pendingTasks.filter(t => !t.completed && !completedTasks.includes(t.id)).length} remaining)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockHandoverData.pendingTasks.map((task) => {
                  const isCompleted = task.completed || completedTasks.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isCompleted 
                          ? 'bg-success-50 border-success-200' 
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleTaskCompletion(task.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isCompleted
                                ? 'bg-success-600 border-success-600'
                                : 'border-neutral-300 hover:border-neutral-400'
                            }`}
                          >
                            {isCompleted && <CheckCircle className="h-3 w-3 text-white" />}
                          </button>
                          <div className={isCompleted ? 'opacity-60' : ''}>
                            <h4 className={`font-medium ${isCompleted ? 'line-through' : ''}`}>
                              {task.task}
                            </h4>
                            <p className="text-sm text-neutral-600">{task.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <p className="text-xs text-neutral-500 mt-1">Due in {task.dueTime}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Handover Checklist Sidebar */}
        <div className="w-80 bg-white border-l border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4">Handover Checklist</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success-600" />
              <span className="text-sm">All critical patients reviewed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success-600" />
              <span className="text-sm">Medication schedules updated</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-warning-500" />
              <span className="text-sm">Pending tasks documented</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success-600" />
              <span className="text-sm">Equipment status checked</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-2">Shift Earnings</h4>
            <p className="text-2xl font-bold text-primary-600">₦{(parseFloat(shiftData.duration) * 8000).toLocaleString()}</p>
            <p className="text-sm text-primary-700">{shiftData.duration} hours @ ₦8,000/hr</p>
          </div>
        </div>
      </div>
    </div>
  );
}