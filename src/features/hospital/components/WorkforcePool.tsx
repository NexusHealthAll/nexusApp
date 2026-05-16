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

const mockWorkers: WorkerEntry[] = [
  {
    id: "1",
    name: "Dr. Abiola",
    specialization: "Emergency Medicine",
    rating: 4.9,
    status: "Active",
    distanceKm: 2.4,
    availabilityLabel: "Available Now",
    availabilityColor: "text-secondary-700",
  },
  {
    id: "2",
    name: "Dr. Bello",
    specialization: "Pediatrics",
    rating: 4.7,
    status: "Off-Duty",
    distanceKm: 5.1,
    availabilityLabel: "Resumes 8 AM",
    availabilityColor: "text-neutral-500",
  },
  {
    id: "3",
    name: "Nurse Chinwe",
    specialization: "ICU Specialist",
    rating: 5.0,
    status: "Active",
    distanceKm: 0.8,
    availabilityLabel: "On Site",
    availabilityColor: "text-secondary-700",
  },
];

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
