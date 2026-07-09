import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { Header } from "../DashboardChrome";
import type { PatientRecord } from "../../types";

export function PatientIntakeScreen({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (patient: PatientRecord) => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [temp, setTemp] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!name.trim() || !age || !gender || !chiefComplaint.trim()) {
      setError("Please fill in patient name, age, gender, and chief complaint.");
      return;
    }
    onSubmit({
      id: crypto.randomUUID(),
      name: name.trim(),
      age: Number(age),
      gender,
      chiefComplaint: chiefComplaint.trim(),
      vitals: {
        bloodPressureSystolic: Number(systolic) || 0,
        bloodPressureDiastolic: Number(diastolic) || 0,
        temperatureC: Number(temp) || 0,
        heartRateBpm: Number(heartRate) || 0,
      },
      intakeAt: new Date().toISOString(),
      status: "waiting",
    });
  };

  return (
    <>
      <Header title="Patient Intake" subtitle="Consultation phase 1" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-800">
          Recorded for this shift session only — not saved to a patient record system.
        </p>

        <section className="space-y-3">
          <p className="text-xs font-bold uppercase text-neutral-500">Identification</p>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              Patient Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chinua Achebe"
              className="w-full rounded-lg bg-neutral-100 px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                Age
              </label>
              <input
                type="number"
                min={0}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Years"
                className="w-full rounded-lg bg-neutral-100 px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <Select
              label="Gender"
              value={gender}
              onChange={setGender}
              placeholder="Select"
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-bold uppercase text-neutral-500">Presentation</p>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              Chief Complaint
            </label>
            <textarea
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Describe the primary reason for the visit..."
              className="w-full resize-none rounded-lg bg-neutral-100 px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-bold uppercase text-neutral-500">Initial Vitals</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-neutral-100 p-3">
              <p className="text-[10px] font-semibold uppercase text-neutral-500">Blood Pressure</p>
              <div className="mt-1 flex items-center gap-1">
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="120"
                  className="w-full bg-transparent text-lg font-bold outline-none"
                />
                <span>/</span>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="80"
                  className="w-full bg-transparent text-lg font-bold outline-none"
                />
                <span className="text-xs text-neutral-400">mmHg</span>
              </div>
            </div>
            <div className="rounded-xl bg-neutral-100 p-3">
              <p className="text-[10px] font-semibold uppercase text-neutral-500">Temp</p>
              <div className="mt-1 flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="36.5"
                  className="w-full bg-transparent text-lg font-bold outline-none"
                />
                <span className="text-xs text-neutral-400">°C</span>
              </div>
            </div>
            <div className="rounded-xl bg-neutral-100 p-3">
              <p className="text-[10px] font-semibold uppercase text-neutral-500">Heart Rate</p>
              <div className="mt-1 flex items-center gap-1">
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="72"
                  className="w-full bg-transparent text-lg font-bold outline-none"
                />
                <span className="text-xs text-neutral-400">BPM</span>
              </div>
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-error-600">{error}</p>}

        <Button type="button" className="w-full bg-brand-700" onClick={handleContinue}>
          Continue
        </Button>
      </main>
    </>
  );
}
