import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { 
  Calendar,
  Clock,
  User,
  Heart,
  Activity,
  Thermometer,
  Stethoscope,
  FileText,
  Plus,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface MedicalStaffDashboardProps {
  doctorId?: string;
}

// Mock data for medical staff - will be replaced with API calls
const mockMedicalData = {
  todayAppointments: [
    {
      id: '1',
      time: '09:00 AM',
      patient: {
        name: 'John Doe',
        age: 45,
        id: 'P001',
        condition: 'Hypertension Follow-up'
      },
      status: 'scheduled',
      duration: 30,
      type: 'follow-up'
    },
    {
      id: '2',
      time: '09:30 AM',
      patient: {
        name: 'Sarah Wilson',
        age: 32,
        id: 'P002',
        condition: 'Annual Checkup'
      },
      status: 'in-progress',
      duration: 45,
      type: 'consultation'
    },
    {
      id: '3',
      time: '10:15 AM',
      patient: {
        name: 'Michael Brown',
        age: 28,
        id: 'P003',
        condition: 'Chest Pain'
      },
      status: 'scheduled',
      duration: 30,
      type: 'consultation'
    },
    {
      id: '4',
      time: '11:00 AM',
      patient: {
        name: 'Emily Davis',
        age: 55,
        id: 'P004',
        condition: 'Diabetes Management'
      },
      status: 'scheduled',
      duration: 30,
      type: 'follow-up'
    }
  ],
  currentPatientVitals: {
    patientName: 'Sarah Wilson',
    patientId: 'P002',
    vitals: {
      bloodPressure: { systolic: 120, diastolic: 80, status: 'normal' },
      heartRate: { value: 72, status: 'normal' },
      temperature: { value: 98.6, status: 'normal' },
      oxygenSaturation: { value: 98, status: 'normal' },
      respiratoryRate: { value: 16, status: 'normal' }
    },
    lastUpdated: '2 minutes ago'
  },
  todayStats: {
    totalAppointments: 8,
    completed: 2,
    inProgress: 1,
    upcoming: 5,
    avgConsultationTime: 28
  }
};

export function MedicalStaffDashboard({ doctorId }: MedicalStaffDashboardProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStartConsultation = (appointmentId: string, patientId: string) => {
    navigate(`/medical-staff/consultation/${appointmentId}/${patientId}`);
  };

  const handleContinueConsultation = (appointmentId: string, patientId: string) => {
    navigate(`/medical-staff/consultation/${appointmentId}/${patientId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'in-progress':
        return 'bg-warning-100 text-warning-800';
      case 'scheduled':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getVitalStatus = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-success-600';
      case 'high':
        return 'text-warning-600';
      case 'critical':
        return 'text-error-600';
      default:
        return 'text-neutral-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">Clinical Dashboard</h1>
          <p className="text-neutral-600">Today's schedule and patient overview</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Emergency Consult
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-primary-700">Today's Appointments</p>
                <p className="text-2xl font-bold text-primary-900">{mockMedicalData.todayStats.totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success-50 border-success-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-success-600" />
              <div>
                <p className="text-sm font-medium text-success-700">Completed</p>
                <p className="text-2xl font-bold text-success-900">{mockMedicalData.todayStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning-50 border-warning-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-warning-600" />
              <div>
                <p className="text-sm font-medium text-warning-700">In Progress</p>
                <p className="text-2xl font-bold text-warning-900">{mockMedicalData.todayStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-secondary-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-secondary-600" />
              <div>
                <p className="text-sm font-medium text-secondary-700">Avg Time</p>
                <p className="text-2xl font-bold text-secondary-900">{mockMedicalData.todayStats.avgConsultationTime}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Appointments */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Schedule</span>
              <span className="text-sm font-normal text-neutral-500">
                {mockMedicalData.todayAppointments.length} appointments
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockMedicalData.todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    selectedAppointment === appointment.id
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => setSelectedAppointment(appointment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-neutral-900">{appointment.time}</p>
                        <p className="text-xs text-neutral-500">{appointment.duration}min</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">{appointment.patient.name}</p>
                        <p className="text-sm text-neutral-600">
                          {appointment.patient.condition} • Age {appointment.patient.age}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('-', ' ')}
                      </span>
                      {appointment.status === 'scheduled' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStartConsultation(appointment.id, appointment.patient.id)}
                        >
                          Start Consultation
                        </Button>
                      )}
                      {appointment.status === 'in-progress' && (
                        <Button 
                          size="sm"
                          onClick={() => handleContinueConsultation(appointment.id, appointment.patient.id)}
                        >
                          Continue
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patient Vitals Widget */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-error-500" />
              <span>Current Patient Vitals</span>
            </CardTitle>
            <p className="text-sm text-neutral-600">
              {mockMedicalData.currentPatientVitals.patientName} • {mockMedicalData.currentPatientVitals.patientId}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Blood Pressure */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-error-500" />
                  <div>
                    <p className="text-sm font-medium">Blood Pressure</p>
                    <p className="text-xs text-neutral-500">Systolic/Diastolic</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getVitalStatus(mockMedicalData.currentPatientVitals.vitals.bloodPressure.status)}`}>
                    {mockMedicalData.currentPatientVitals.vitals.bloodPressure.systolic}/
                    {mockMedicalData.currentPatientVitals.vitals.bloodPressure.diastolic}
                  </p>
                  <p className="text-xs text-neutral-500">mmHg</p>
                </div>
              </div>

              {/* Heart Rate */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-error-500" />
                  <div>
                    <p className="text-sm font-medium">Heart Rate</p>
                    <p className="text-xs text-neutral-500">Beats per minute</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getVitalStatus(mockMedicalData.currentPatientVitals.vitals.heartRate.status)}`}>
                    {mockMedicalData.currentPatientVitals.vitals.heartRate.value}
                  </p>
                  <p className="text-xs text-neutral-500">bpm</p>
                </div>
              </div>

              {/* Temperature */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Thermometer className="h-5 w-5 text-warning-500" />
                  <div>
                    <p className="text-sm font-medium">Temperature</p>
                    <p className="text-xs text-neutral-500">Body temperature</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getVitalStatus(mockMedicalData.currentPatientVitals.vitals.temperature.status)}`}>
                    {mockMedicalData.currentPatientVitals.vitals.temperature.value}°F
                  </p>
                </div>
              </div>

              {/* Oxygen Saturation */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm font-medium">O2 Saturation</p>
                    <p className="text-xs text-neutral-500">Blood oxygen</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getVitalStatus(mockMedicalData.currentPatientVitals.vitals.oxygenSaturation.status)}`}>
                    {mockMedicalData.currentPatientVitals.vitals.oxygenSaturation.value}%
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">
                  Last updated: {mockMedicalData.currentPatientVitals.lastUpdated}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Stethoscope className="h-6 w-6" />
              <span className="text-sm">Start Consultation</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Write Prescription</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <User className="h-6 w-6" />
              <span className="text-sm">Patient History</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <AlertCircle className="h-6 w-6" />
              <span className="text-sm">Emergency Alert</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}