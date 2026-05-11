import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Search, Plus, Filter, Star } from 'lucide-react';

// Mock data - replace with actual API data
const mockDoctors = [
  {
    id: '1',
    firstName: 'whiteghost',
    lastName: '',
    email: 'whiteghost@nexuscare.com',
    phone: '+1 (555) 123-4567',
    specialization: 'Cardiology',
    department: 'Cardiology',
    experience: 12,
    rating: 4.8,
    isActive: true,
    todayAppointments: 8,
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@nexuscare.com',
    phone: '+1 (555) 987-6543',
    specialization: 'Neurology',
    department: 'Neurology',
    experience: 8,
    rating: 4.9,
    isActive: true,
    todayAppointments: 6,
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@nexuscare.com',
    phone: '+1 (555) 456-7890',
    specialization: 'Pediatrics',
    department: 'Pediatrics',
    experience: 15,
    rating: 4.7,
    isActive: true,
    todayAppointments: 12,
  },
];

export function DoctorList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Doctors</h1>
          <p className="text-neutral-600">Manage doctor profiles and schedules</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
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
                  placeholder="Search doctors by name, specialization, or department..."
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

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockDoctors.map((doctor) => (
          <Card key={doctor.id} variant="elevated">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-700">
                    {doctor.firstName[0]}{doctor.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </CardTitle>
                  <p className="text-sm text-neutral-600">{doctor.specialization}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-warning-400 text-warning-400" />
                  <span className="text-sm font-medium">{doctor.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Department:</span>
                  <span className="font-medium">{doctor.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Experience:</span>
                  <span className="font-medium">{doctor.experience} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Today's Appointments:</span>
                  <span className="font-medium">{doctor.todayAppointments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Status:</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    doctor.isActive 
                      ? 'bg-success-100 text-success-800' 
                      : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Profile
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}