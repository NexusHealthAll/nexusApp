import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { DashboardSkeleton } from '@/shared/components/ui/Skeleton';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatDisplayCurrency } from '@/shared/utils/currency';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export function DashboardOverview() {
  const { stats, recentAppointments, weeklyAppointments, appointmentStatusDistribution, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to load dashboard</h3>
          <p className="text-neutral-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const summaryCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients.toLocaleString(),
      change: `+${stats.patientGrowth.percentage}%`,
      changeType: 'positive' as const,
      icon: Users,
      description: 'from last month',
    },
    {
      title: 'Active Doctors',
      value: stats.totalDoctors.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: UserCheck,
      description: 'new this month',
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: Calendar,
      description: 'vs yesterday',
    },
    {
      title: 'Monthly Revenue',
      value: formatDisplayCurrency(stats.revenue.thisMonth),
      change: `+${(((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100).toFixed(1)}%`,
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'from last month',
    },
  ];

  const statusCards = [
    {
      title: 'Completed Today',
      value: stats.completedAppointments.toString(),
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: 'Pending',
      value: stats.pendingAppointments.toString(),
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      title: 'Cancelled',
      value: stats.cancelledAppointments.toString(),
      icon: XCircle,
      color: 'text-error-600',
      bgColor: 'bg-error-50',
    },
  ];

  const maxAppointments = Math.max(...weeklyAppointments.map((d: any) => d.appointments));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 lg:text-3xl">Welcome back, whiteghost</h1>
          <p className="text-sm text-neutral-600 lg:text-base lg:mt-1">Here's what's happening at Nexus Care today.</p>
        </div>
        <div className="flex space-x-2 lg:space-x-3">
          <Button variant="outline" size="sm" className="text-xs lg:text-sm">
            <Activity className="mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">View Reports</span>
            <span className="sm:hidden">Reports</span>
          </Button>
          <Button size="sm" className="text-xs lg:text-sm">
            <Plus className="mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Quick Schedule</span>
            <span className="sm:hidden">Schedule</span>
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        {summaryCards.map((stat) => (
          <Card key={stat.title} variant="elevated" className="hover:shadow-strong transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-neutral-600 lg:text-sm">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-neutral-400 lg:h-5 lg:w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-neutral-900 mb-1 lg:text-3xl">{stat.value}</div>
              <div className="flex items-center space-x-1">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="h-2 w-2 text-success-600 lg:h-3 lg:w-3" />
                ) : (
                  <ArrowDownRight className="h-2 w-2 text-error-600 lg:h-3 lg:w-3" />
                )}
                <span className={`text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-neutral-500 hidden sm:inline">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-2 lg:gap-4">
        {statusCards.map((card) => (
          <Card key={card.title} className={`${card.bgColor} border-0`}>
            <CardContent className="p-3 lg:p-4">
              <div className="flex flex-col items-center space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
                <div className={`p-1.5 rounded-lg bg-white lg:p-2`}>
                  <card.icon className={`h-4 w-4 ${card.color} lg:h-5 lg:w-5`} />
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-xs font-medium text-neutral-600 lg:text-sm">{card.title}</p>
                  <p className={`text-lg font-bold ${card.color} lg:text-2xl`}>{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Data Visualization */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Appointments Chart */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Weekly Appointments
              <Button variant="ghost" size="sm">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyAppointments.map((day: any) => (
                <div key={day.day} className="flex items-center space-x-4">
                  <div className="w-8 text-sm font-medium text-neutral-600">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(day.appointments / maxAppointments) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-neutral-900 w-8">
                        {day.appointments}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appointment Status Distribution */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Appointment Status Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointmentStatusDistribution.map((item: any) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium text-neutral-700">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-neutral-900">{item.count}</span>
                    <span className="text-xs text-neutral-500">
                      ({((item.count / stats.todayAppointments) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Appointments - Takes 2 columns */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Today's Schedule
              <Button variant="ghost" size="sm">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment: any) => (
                <div key={appointment.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {appointment.patientName.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-900">{appointment.patientName}</p>
                      <span className="text-xs text-neutral-500">{appointment.time}</span>
                    </div>
                    <p className="text-xs text-neutral-600">{appointment.doctorName} • {appointment.type}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' ? 'bg-primary-100 text-primary-800' :
                    appointment.status === 'in-progress' ? 'bg-warning-100 text-warning-800' :
                    'bg-neutral-100 text-neutral-800'
                  }`}>
                    {appointment.status.replace('-', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-3 h-4 w-4" />
                Add New Patient
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-3 h-4 w-4" />
                Schedule Appointment
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <UserCheck className="mr-3 h-4 w-4" />
                Add Doctor
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <AlertCircle className="mr-3 h-4 w-4" />
                Emergency Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}