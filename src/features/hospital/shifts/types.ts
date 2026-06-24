export interface ShiftBonus {
  id: string;
  name: string;
  description: string;
  amount: number;
}

export interface ShiftEquipment {
  id: string;
  name: string;
  description: string;
}

export interface ShiftDeliverable {
  id: string;
  name: string;
  description: string;
}

export interface ShiftFormData {
  // Step 1 – Basic Information
  roleNeeded: string;
  specialty: string;
  shiftType: "in-person" | "virtual";
  startDate: string;
  startTime: string;
  duration: string;
  urgencyLevel: string;

  // Step 2 – Compensation
  payType: "hourly" | "fixed";
  hourlyRate: number;
  expectedHours: number;
  fixedRate: number;
  bonuses: ShiftBonus[];

  // Step 3 – Description
  jobDescription: string;
  tasks: string[];
  deliverables: ShiftDeliverable[];
  equipment: ShiftEquipment[];
  requirements: string[];

  // Step 4 – Requirements
  qualifications: string[];
}
