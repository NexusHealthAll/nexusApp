import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Search, Plus, Filter } from 'lucide-react';
import { formatDate } from '@/shared/utils/date';

// Mock data - replace with actual API data
const mockPatients = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-03-15',
    gender: 'male' as const,
    lastVisit: '2024-01-15',
    upcomingAppointment: '2024-02-20',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    phone: '+1 (555) 987-6543',
    dateOfBirth: '1990-07-22',
    gender: 'female' as const,
    lastVisit: '2024-01-10',
    upcomingAppointment: null,
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.j@email.com',
    phone: '+1 (555) 456-7890',
    dateOfBirth: '1978-11-08',
    gender: 'male' as const,
    lastVisit: '2024-01-18',
    upcomingAppointment: '2024-02-15',
  },
];

export function PatientList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Patients</h1>
          <p className="text-neutral-600">Manage patient records and information</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
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
                  placeholder="Search patients by name, email, or phone..."
                  className="w-full rounded-lg border border-neutral-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Patients ({mockPatients.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Next Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {mockPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-neutral-500 capitalize">
                            {patient.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">{patient.email}</div>
                      <div className="text-sm text-neutral-500">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {formatDate(patient.lastVisit)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {patient.upcomingAppointment
                        ? formatDate(patient.upcomingAppointment)
                        : 'None scheduled'
                      }
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