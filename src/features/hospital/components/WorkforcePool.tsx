import { Filter, MapPin, User } from "lucide-react";

interface WorkerEntry {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  status: "Active" | "Off-Duty";
  distanceKm: number;
  availabilityLabel: string;
  availabilityColor: string;
  image?: string;
}

// const mockWorkers: WorkerEntry[] = [
//   {
//     id: "1",
//     name: "Dr. Abiola",
//     specialization: "Emergency Medicine",
//     rating: 4.9,
//     status: "Active",
//     distanceKm: 2.4,
//     availabilityLabel: "Available Now",
//     availabilityColor: "text-secondary-700",
//   },
//   {
//     id: "2",
//     name: "Dr. Bello",
//     specialization: "Pediatrics",
//     rating: 4.7,
//     status: "Off-Duty",
//     distanceKm: 5.1,
//     availabilityLabel: "Resumes 8 AM",
//     availabilityColor: "text-neutral-500",
//   },
//   {
//     id: "3",
//     name: "Nurse Chinwe",
//     specialization: "ICU Specialist",
//     rating: 5.0,
//     status: "Active",
//     distanceKm: 0.8,
//     availabilityLabel: "On Site",
//     availabilityColor: "text-secondary-700",
//   },
// ];

const mockWorkers: WorkerEntry[] = [];

const statusBadgeStyles: Record<WorkerEntry["status"], string> = {
  Active: "bg-secondary-100 text-secondary-700",
  "Off-Duty": "bg-neutral-100 text-neutral-600",
};

export function WorkforcePool() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-neutral-900">Workforce Pool</h2>
        <button className="text-neutral-400 hover:text-neutral-600">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Worker list */}
      {mockWorkers.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-8 text-center">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Background circle */}
            <circle cx="40" cy="40" r="36" fill="#F5F3FF" />
            <circle cx="40" cy="40" r="36" stroke="#DDD6FE" strokeWidth="1.5" strokeDasharray="4 3" />
            {/* Center person */}
            <circle cx="40" cy="32" r="9" fill="#C4B5FD" />
            <path d="M24 56C24 47.163 31.163 40 40 40C48.837 40 56 47.163 56 56" stroke="#C4B5FD" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Left person */}
            <circle cx="18" cy="36" r="6" fill="#DDD6FE" />
            <path d="M8 54C8 47.373 12.477 42 18 42C23.523 42 28 47.373 28 54" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Right person */}
            <circle cx="62" cy="36" r="6" fill="#DDD6FE" />
            <path d="M52 54C52 47.373 56.477 42 62 42C67.523 42 72 47.373 72 54" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Plus badge */}
            <circle cx="60" cy="20" r="10" fill="#7C3AED" />
            <line x1="60" y1="15" x2="60" y2="25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="55" y1="20" x2="65" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-neutral-800">No clinicians yet</p>
            <p className="mt-1.5 text-xs text-neutral-400 max-w-[180px] mx-auto leading-relaxed">
              Your workforce pool will populate as clinicians join.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {mockWorkers.map((worker) => (
            <div
              key={worker.id}
              className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary-100">
                {worker.image ? (
                  <img
                    src={worker.image}
                    alt={worker.name}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-secondary-600" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {worker.name}
                  </p>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeStyles[worker.status]}`}
                  >
                    {worker.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  {worker.specialization} • {worker.rating} ★
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <MapPin className="h-3 w-3" />
                    {worker.distanceKm}km
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${worker.availabilityColor}`}
                  >
                    {worker.availabilityLabel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staffing Insight card */}
      <div className="rounded-2xl bg-onboarding-inputBackground p-4">
        <p className="mb-1.5 text-xs font-bold text-secondary-700">
          Staffing Insight
        </p>
        <p className="mb-3 text-xs leading-relaxed text-neutral-600">
          Nurse availability is 15% higher than average on Fridays. Consider
          scheduling elective surgery coverage now.
        </p>
        <button className="text-xs font-semibold text-secondary-700 hover:text-secondary-900">
          Explore Trends →
        </button>
      </div>
    </div>
  );
}
