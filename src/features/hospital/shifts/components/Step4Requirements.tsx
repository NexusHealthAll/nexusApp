import { useState } from "react";
import { CheckCircle2, Info, Search, X } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { ShiftFormData } from "../types";

interface Props {
  data: ShiftFormData;
  onUpdate: (patch: Partial<ShiftFormData>) => void;
  onNext: () => void;
  onNextLoading?: boolean;
  onBack: () => void;
}

export function Step4Requirements({ data, onUpdate, onNext, onNextLoading, onBack }: Props) {
  const [input, setInput] = useState("");

  const addQualification = () => {
    const trimmed = input.trim();
    if (!trimmed || data.qualifications.includes(trimmed)) return;
    onUpdate({ qualifications: [...data.qualifications, trimmed] });
    setInput("");
  };

  const removeQualification = (qual: string) => {
    onUpdate({
      qualifications: data.qualifications.filter((q) => q !== qual),
    });
  };

  return (
    <div>
        <div className="space-y-6">
          {/* Shift Requirements */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-secondary-600" />
              <h2 className="text-base font-bold text-neutral-900">
                Shift Requirements
              </h2>
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Add New Qualification
            </p>

            <div className="mb-4 flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
                <Search className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addQualification()}
                  placeholder="e.g. 2+ years emergency experience"
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none"
                />
              </div>
              <Button
                onClick={addQualification}
                className="bg-neutral-900 text-white hover:bg-neutral-700"
              >
                Add
              </Button>
            </div>

            {data.qualifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.qualifications.map((qual) => (
                  <span
                    key={qual}
                    className="flex items-center gap-1.5 rounded-full bg-secondary-700 px-3 py-1.5 text-sm font-medium text-white"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    {qual}
                    <button
                      onClick={() => removeQualification(qual)}
                      className="ml-0.5 text-secondary-300 hover:text-white transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Institutional Verification */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-2 text-sm font-bold text-neutral-900">
              Institutional Verification
            </h2>
            <p className="mb-4 text-sm text-neutral-600 leading-relaxed">
              By broadcasting this shift, you confirm that{" "}
              <span className="font-semibold">Emerald Clinical</span> is
              authorized to match this request with verified clinicians in the
              LUTH network.
            </p>
            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3">
              <Info className="h-4 w-4 flex-shrink-0 text-neutral-500" />
              <p className="text-sm text-neutral-600">
                The shift will be visible to{" "}
                <span className="font-semibold">48 matched clinicians</span>{" "}
                immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={() => {
              onNext();
            }}
            isLoading={onNextLoading}
            className="bg-secondary-700 px-8 text-white hover:bg-secondary-800"
          >
            Preview
          </Button>
        </div>
    </div>
  );
}
