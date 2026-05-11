import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Search, Plus, Filter, Calendar, Clock } from 'lucide-react';

// Mock data - replace with actual API data
const mockAppointments = [
  {
    id: '1',
    patientName: 'John Doe',
    doctorName: 'whiteghost',
    dateTime: '2024-02-20T14:30:00',
    duration: 30,
    type: 'consultation' as const,
    status: 'confirmed' as const,
    reason: 'Regular checkup',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    doctorName: 'Dr. Michael Chen',
    dateTime: '2024-02-20T15:00:00',
    duration: 45,
    type: 'follow-up' as const,
    status: 'scheduled' as const,
    reason: 'Follow-up on test results',
  },
  {
    id: '3',
    patientName: 'Michael Johnson',
    doctorName: 'Dr. Emily Rodriguez',
    dateTime: '2024-02-20T16:15:00',
    duration: 30,
    type: 'routine-checkup' as const,
    status: 'in-progress' as const,
    reason: 'Annual physical examination',
  },
];

const statusColors = {
  scheduled: 'bg-neutral-100 text-neutral-800',
  confirmed: 'bg-primary-100 text-primary-800',
  'in-progress': 'bg-warning-100 text-warning-800',
  completed: 'bg-success-100 text-success-800',
  cancelled: 'bg-error-100 text-error-800',
  'no-show': 'bg-error-100 text-error-800',
};

const typeColors = {
  consultation: 'bg-blue-100 text-blue-800',
  'follow-up': 'bg-green-100 text-green-800',
  emergency: 'bg-red-100 text-red-800',
  'routine-checkup': 'bg-purple-100 text-purple-800',
};

export function AppointmentList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Appointments</h1>
          <p className="text-neutral-600">Manage patient appointments and schedules</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search appointments by patient, doctor, or reason..."
                  className="w-full rounded-lg border border-neutral-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments ({mockAppointments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {mockAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-neutral-400" />
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {new Date(appointment.dateTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {appointment.duration} min
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-700">
                            {appointment.patientName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-neutral-900">
                            {appointment.patientName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {appointment.doctorName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${typeColors[appointment.type]}`}>
                        {appointment.type.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[appointment.status]}`}>
                        {appointment.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 max-w-xs truncate">
                      {appointment.reason}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}