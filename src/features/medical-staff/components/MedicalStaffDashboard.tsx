import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import {
  Bell,
  Calendar,
  Clock,
  DollarSign,
  Home,
  ShoppingBag,
  User,
  ChevronRight,
  Briefcase,
  CreditCard,
} from "lucide-react";

interface MedicalStaffDashboardProps {
  doctorId?: string;
}

// Mock data for health worker dashboard
const mockHealthWorkerData = {
  user: {
    name: "Dr. Abiola",
    status: "OFF DUTY",
    avatar: "/api/placeholder/40/40"
  },
  upcomingShift: {
    title: "Emergency Ward",
    location: "Lagos State Gen.",
    date: "Today, Oct 24",
    time: "08:00 - 16:00",
    type: "UPCOMING SHIFT"
  },
  stats: {
    monthlyEarnings: "₦450.2k",
    weeklyHours: "32.5h",
    monthlyChange: "+12%",
    goal: "Goal: 40H"
  },
  recentActivity: [
    {
      id: "1",
      hospital: "HealthPlus Pharmacy",
      type: "CONSULTATION",
      duration: "4 HOURS",
      amount: "₦18,500",
      color: "bg-green-500"
    },
    {
      id: "2", 
      hospital: "St. Nicholas Hospital",
      type: "PEDIATRICS",
      duration: "4 HOURS",
      amount: "₦42,000",
      color: "bg-green-500"
    },
    {
      id: "3",
      hospital: "HealthPlus Pharmacy", 
      type: "CONSULTATION",
      duration: "4 HOURS",
      amount: "₦18,500",
      color: "bg-green-500"
    },
    {
      id: "4",
      hospital: "St. Nicholas Hospital",
      type: "PEDIATRICS", 
      duration: "4 HOURS",
      amount: "₦42,000",
      color: "bg-green-500"
    },
    {
      id: "5",
      hospital: "HealthPlus Pharmacy",
      type: "CONSULTATION",
      duration: "4 HOURS", 
      amount: "₦18,500",
      color: "bg-green-500"
    }
  ]
};

export function MedicalStaffDashboard({
  doctorId: _doctorId,
}: MedicalStaffDashboardProps) {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <span className="text-lg font-bold text-gray-900">NEXUSCARE</span>
        </div>
        <Bell className="w-6 h-6 text-gray-600" />
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div>
          <p className="text-sm text-gray-500 mb-1">WELCOME BACK</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">
              Good Morning,<br />
              {mockHealthWorkerData.user.name}
            </h1>
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">
                {mockHealthWorkerData.user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Shift Card */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
                {mockHealthWorkerData.upcomingShift.type}
              </span>
              <Briefcase className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-1">
              {mockHealthWorkerData.upcomingShift.title}
            </h2>
            <p className="text-blue-100 mb-4">
              {mockHealthWorkerData.upcomingShift.location}
            </p>
            <div className="flex items-center space-x-4 text-sm mb-6">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{mockHealthWorkerData.upcomingShift.date}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{mockHealthWorkerData.upcomingShift.time}</span>
              </div>
            </div>
            <Button className="bg-white text-blue-600 hover:bg-gray-50 font-medium">
              View Details →
            </Button>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Monthly Earnings */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Monthly Earnings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {mockHealthWorkerData.stats.monthlyEarnings}
            </p>
            <p className="text-sm text-green-600 font-medium">
              {mockHealthWorkerData.stats.monthlyChange}
            </p>
          </div>

          {/* Weekly Hours */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Weekly Hours</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {mockHealthWorkerData.stats.weeklyHours}
            </p>
            <p className="text-sm text-gray-500">
              {mockHealthWorkerData.stats.goal}
            </p>
          </div>
        </div>

        {/* Marketplace Section */}
        <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Marketplace</p>
              <p className="text-sm text-gray-600">Find New Shifts near you</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button className="text-blue-600 font-medium text-sm">VIEW ALL</button>
          </div>
          <div className="space-y-3">
            {mockHealthWorkerData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 py-2">
                <div className={`w-1 h-12 ${activity.color} rounded-full`}></div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.hospital}</p>
                  <p className="text-sm text-gray-500">
                    {activity.type} • {activity.duration}
                  </p>
                </div>
                <p className="font-bold text-gray-900">{activity.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg ${
              activeTab === "home" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg ${
              activeTab === "marketplace" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-medium">Marketplace</span>
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg ${
              activeTab === "calendar" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-medium">Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg ${
              activeTab === "earnings" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs font-medium">Earnings</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg ${
              activeTab === "profile" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
