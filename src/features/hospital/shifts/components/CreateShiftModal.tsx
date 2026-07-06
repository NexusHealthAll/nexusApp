import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { cn } from "@/shared/utils/cn";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import { useShiftDraftStore } from "@/features/hospital/shifts/hooks/useShiftDraftStore";
import { useCreateShiftModalStore } from "@/features/hospital/shifts/hooks/useCreateShiftModalStore";
import { appToast } from "@/shared/components/feedback/toast";
import type { ShiftFormData } from "@/features/hospital/shifts/types";
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
  requirements: [],
  qualifications: [],
};

const stepTitles: Record<CurrentStep, string> = {
  1: "New Shift · Basic Information",
  2: "New Shift · Compensation",
  3: "New Shift · Description",
  4: "New Shift · Requirements",
  preview: "New Shift · Preview",
};

function stepIndex(step: CurrentStep): number {
  return step === "preview" ? 5 : step;
}

export function CreateShiftModal() {
  const isOpen = useCreateShiftModalStore((s) => s.isOpen);
  const close = useCreateShiftModalStore((s) => s.close);
  const notifyCreated = useCreateShiftModalStore((s) => s.notifyCreated);

  const { previewShift } = useHospitalShift();
  const { clearDraft } = useShiftDraftStore();

  const [step, setStep] = useState<CurrentStep>(1);
  const [formData, setFormData] = useState<ShiftFormData>(defaultFormData);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const updateForm = (patch: Partial<ShiftFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const handleClose = () => {
    close();
    setStep(1);
    setFormData(defaultFormData);
  };

  const handleCreateShiftHandler = async () => {
    setIsPreviewing(true);
    try {
      await previewShift(formData);
      setStep("preview");
    } catch (err) {
      appToast.fromError(err, "Failed to preview shift. Please try again.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleBroadcasted = () => {
    clearDraft();
    setStep(1);
    setFormData(defaultFormData);
    notifyCreated();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={stepTitles[step]}
      className="max-h-[90vh] max-w-4xl overflow-y-auto"
    >
      <div className="mb-6 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "h-[3px] flex-1 rounded-full",
              i <= stepIndex(step) ? "bg-secondary-600" : "bg-neutral-200",
            )}
          />
        ))}
      </div>

      {step === 1 && (
        <Step1BasicInfo
          data={formData}
          onUpdate={updateForm}
          onNext={() => setStep(2)}
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
          onNext={handleCreateShiftHandler}
          onNextLoading={isPreviewing}
          onBack={() => setStep(3)}
        />
      )}
      {step === "preview" && (
        <ShiftPreview
          data={formData}
          onBack={() => setStep(4)}
          onBroadcast={handleBroadcasted}
        />
      )}
    </Modal>
  );
}
