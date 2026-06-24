import { useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Package,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
import { ShiftService } from "../services/shiftService";
import type { ShiftDeliverable, ShiftEquipment, ShiftFormData } from "../types";

interface Props {
  data: ShiftFormData;
  onUpdate: (patch: Partial<ShiftFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function StepDashes({ current }: { current: number }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            "h-[3px] w-7 rounded-full",
            i <= current ? "bg-secondary-600" : "bg-neutral-300",
          )}
        />
      ))}
    </div>
  );
}

function draftQuality(data: ShiftFormData): number {
  let score = 0;
  if (data.jobDescription.trim().length > 20) score += 40;
  else if (data.jobDescription.trim().length > 0) score += 15;
  if (data.tasks.length > 0) score += 20;
  if (data.deliverables.length > 0) score += 20;
  if (data.equipment.length > 0) score += 20;
  return score;
}

export function Step3Description({ data, onUpdate, onNext, onBack }: Props) {
  const [taskInput, setTaskInput] = useState("");
  const [deliverableInput, setDeliverableInput] = useState("");

  const [equipmentInput, setEquipmentInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const quality = draftQuality(data);

  const addTask = () => {
    if (!taskInput.trim()) return;
    onUpdate({ tasks: [...data.tasks, taskInput.trim()] });
    setTaskInput("");
  };

  const removeTask = (idx: number) => {
    onUpdate({ tasks: data.tasks.filter((_, i) => i !== idx) });
  };

  const addDeliverable = () => {
    if (!deliverableInput.trim()) return;
    const item: ShiftDeliverable = {
      id: crypto.randomUUID(),
      name: deliverableInput.trim(),
      description: "",
    };
    onUpdate({ deliverables: [...data.deliverables, item] });
    setDeliverableInput("");
  };

  const removeDeliverable = (id: string) => {
    onUpdate({ deliverables: data.deliverables.filter((d) => d.id !== id) });
  };

  const addEquipment = () => {
    if (!equipmentInput.trim()) return;
    const item: ShiftEquipment = {
      id: crypto.randomUUID(),
      name: equipmentInput.trim(),
      description: "",
    };
    onUpdate({ equipment: [...data.equipment, item] });
    setEquipmentInput("");
  };

  const removeEquipment = (id: string) => {
    onUpdate({ equipment: data.equipment.filter((e) => e.id !== id) });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    await ShiftService.saveDraft(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Shift Description
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Define the clinical responsibilities and provided resources for
              this rotation.
            </p>
          </div>
          <div className="text-right">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Step 3 of 4
            </p>
            <StepDashes current={3} />
          </div>
        </div>
        <div className="mb-8 h-px bg-neutral-200" />

        <div className="grid grid-cols-[1fr_260px] gap-8 items-start">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Job Description */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary-600" />
                  <h2 className="text-base font-bold text-neutral-900">
                    Job Description
                  </h2>
                </div>
                <span className="text-xs font-semibold text-error-500">
                  (Required)
                </span>
              </div>
              <textarea
                rows={5}
                value={data.jobDescription}
                onChange={(e) => onUpdate({ jobDescription: e.target.value })}
                placeholder="We need an experienced Emergency Doctor to cover the evening shift..."
                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
            </div>

            {/* Tasks */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary-600" />
                <h2 className="text-base font-bold text-neutral-900">Tasks</h2>
              </div>

              <div className="mb-4 flex gap-2">
                <input
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Add a new task..."
                  className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
                <Button
                  onClick={addTask}
                  size="sm"
                  className="bg-secondary-600 text-white hover:bg-secondary-700"
                >
                  + Add
                </Button>
              </div>

              {data.tasks.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {data.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary-600" />
                      <span className="flex-1 text-sm text-neutral-800">
                        {task}
                      </span>
                      <button
                        onClick={() => removeTask(idx)}
                        className="text-neutral-400 hover:text-error-500 transition-colors flex-shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deliverables */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-secondary-600" />
                <h2 className="text-base font-bold text-neutral-900">
                  Deliverables
                </h2>
              </div>

              <div className="mb-4 flex gap-2">
                <input
                  value={deliverableInput}
                  onChange={(e) => setDeliverableInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addDeliverable()}
                  placeholder="Add Deliverables..."
                  className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
                <Button
                  onClick={addDeliverable}
                  size="sm"
                  className="bg-secondary-600 text-white hover:bg-secondary-700"
                >
                  + Add
                </Button>
              </div>

              {data.deliverables.length > 0 && (
                <div className="space-y-2">
                  {data.deliverables.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                        <FileText className="h-4 w-4 text-neutral-500" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-neutral-800">
                        {item.name}
                      </span>
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-secondary-600" />
                      <button
                        onClick={() => removeDeliverable(item.id)}
                        className="text-neutral-400 hover:text-error-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Equipment Provided */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-secondary-600" />
                <h2 className="text-base font-bold text-neutral-900">
                  Equipment Provided
                </h2>
              </div>

              <div className="mb-4 flex gap-2">
                <input
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEquipment()}
                  placeholder="Add provided equipment..."
                  className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
                <Button
                  onClick={addEquipment}
                  size="sm"
                  className="bg-secondary-600 text-white hover:bg-secondary-700"
                >
                  + Add
                </Button>
              </div>

              {data.equipment.length > 0 && (
                <div className="space-y-2">
                  {data.equipment.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                        <Package className="h-4 w-4 text-neutral-500" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-neutral-800">
                        {item.name}
                      </span>
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-secondary-600" />
                      <button
                        onClick={() => removeEquipment(item.id)}
                        className="text-neutral-400 hover:text-error-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar cards */}
          <div className="sticky top-8 space-y-4 self-start">
            {/* Nexuscare Standards */}
            <div className="rounded-2xl bg-gradient-to-br from-secondary-700 to-secondary-900 p-5 text-white">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">
                    Nexuscare Institutional Standards
                  </p>
                  <p className="mt-1 text-xs text-secondary-200">
                    All job descriptions must comply with the National Clinical
                    Staffing Framework v2.4.
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-secondary-300 hover:text-white transition-colors">
                Read Guidelines
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            {/* Draft Quality */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Draft Quality
              </p>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-neutral-900">
                  {quality}
                </span>
                <span className="text-sm text-neutral-400">/100</span>
              </div>
              <p className="mb-3 text-xs text-neutral-500">
                {quality >= 80
                  ? "Your description is comprehensive and likely to attract top-tier candidates."
                  : quality >= 50
                    ? "Good start — add more detail to improve your match rate."
                    : "Add a job description, tasks, and equipment to improve quality."}
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-secondary-600 transition-all"
                  style={{ width: `${quality}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="text-sm font-semibold uppercase tracking-wide text-neutral-500 hover:text-neutral-700 transition-colors disabled:opacity-60"
          >
            {saved ? "✓ Saved!" : saving ? "Saving..." : "Save as Draft"}
          </button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button
              onClick={onNext}
              disabled={!data.jobDescription.trim()}
              className="bg-secondary-700 text-white hover:bg-secondary-800 disabled:opacity-50"
            >
              Next Step
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
