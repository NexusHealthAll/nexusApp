import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import type { ShiftFormData } from "../types";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Compensation } from "./Step2Compensation";
import { Step3Description } from "./Step3Description";
import { Step4Requirements } from "./Step4Requirements";
import { ShiftPreview } from "./ShiftPreview";

type CurrentStep = 1 | 2 | 3 | 4 | "preview";

const defaultFormData: ShiftFormData = {
  roleNeeded: "",
  specialty: "",
  shiftType: "in-person",
  startDate: "",
  startTime: "",
  duration: "",
  urgencyLevel: "",
  payType: "hourly",
  hourlyRate: 8000,
  expectedHours: 8,
  fixedRate: 0,
  bonuses: [
    {
      id: "stat",
      name: "STAT Bonus",
      description: "Priority assignment allocation",
      amount: 5000,
    },
  ],
  jobDescription: "",
  tasks: [],
  deliverables: [],
  equipment: [],
  qualifications: [],
};

export function CreateShiftPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<CurrentStep>(1);
  const [formData, setFormData] = useState<ShiftFormData>(defaultFormData);

  const updateForm = (patch: Partial<ShiftFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  return (
    <div className="min-h-screen bg-neutral-50">
      {step === 1 && (
        <Step1BasicInfo
          data={formData}
          onUpdate={updateForm}
          onNext={() => setStep(2)}
          onBack={() => navigate(PATHS.hospital.shifts)}
        />
      )}
      {step === 2 && (
        <Step2Compensation
          data={formData}
          onUpdate={updateForm}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3Description
          data={formData}
          onUpdate={updateForm}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Step4Requirements
          data={formData}
          onUpdate={updateForm}
          onNext={() => setStep("preview")}
          onBack={() => setStep(3)}
        />
      )}
      {step === "preview" && (
        <ShiftPreview
          data={formData}
          onBack={() => setStep(4)}
          onBroadcast={() => navigate(PATHS.hospital.shifts)}
        />
      )}
    </div>
  );
}
