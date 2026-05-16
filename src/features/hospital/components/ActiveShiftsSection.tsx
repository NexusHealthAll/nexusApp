import { MoreHorizontal, User } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

interface Shift {
  id: string;
  status: "in-progress" | "upcoming";
  workerName: string;
  workerRole: string;
  workerImage?: string;
  timeStart?: string;
  timeEnd?: string;
  startsInHours?: number;
  startsInMins?: number;
  progressPercent?: number;
}

const mockShifts: Shift[] = [
  {
    id: "1",
    status: "in-progress",
    workerName: "Dr. Abiola",
    workerRole: "Emergency Doctor",
    timeStart: "08:00",
    timeEnd: "20:00",
    progressPercent: 40,
  },
  {
    id: "2",
    status: "upcoming",
    workerName: "General Nurse",
    workerRole: "Scheduled for Night Shift",
    startsInHours: 3,
    startsInMins: 45,
  },
];

const statusStyles = {
  "in-progress": "bg-secondary-100 text-secondary-700",
  upcoming: "bg-warning-100 text-warning-700",
};

const statusLabels = {
  "in-progress": "IN-PROGRESS",
  upcoming: "UPCOMING",
};

export function ActiveShiftsSection() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-neutral-900">
          Today's Active Shifts
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-secondary-700 hover:text-secondary-900"
        >
          View All
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {mockShifts.map((shift) => (
          <div
            key={shift.id}
            className="rounded-2xl border border-neutral-100 bg-white p-4"
          >
            <div className="mb-3 flex items-start justify-between">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusStyles[shift.status]}`}
              >
                {statusLabels[shift.status]}
              </span>
              <button className="text-neutral-400 hover:text-neutral-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary-100">
                {shift.workerImage ? (
                  <img
                    src={shift.workerImage}
                    alt={shift.workerName}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-secondary-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {shift.workerName}
                </p>
                <p className="text-xs text-neutral-500">{shift.workerRole}</p>
              </div>
            </div>

            {shift.status === "in-progress" && (
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
                  <span>Duration:</span>
                  <span className="font-semibold text-neutral-700">
                    {shift.timeStart} - {shift.timeEnd}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-secondary-600 to-secondary-400"
                    style={{ width: `${shift.progressPercent ?? 0}%` }}
                  />
                </div>
              </div>
            )}

            {shift.status === "upcoming" && (
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Starts In:</span>
                <span className="font-bold text-neutral-800">
                  {shift.startsInHours}h {shift.startsInMins}m
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
