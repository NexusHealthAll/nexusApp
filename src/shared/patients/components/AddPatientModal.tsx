import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { Select } from "@/shared/components/ui/Select";
import { Button } from "@/shared/components/ui/Button";
import type { NewPatientRequest } from "../services/patientService";

// Option lists mirror ml-service/generate_training_data.py's fixed
// categories exactly — the models were trained on these values only.
const GENDERS = ["Male", "Female"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const GENOTYPES = ["AA", "AS", "SS", "AC"];
const SEVERITIES = ["Mild", "Moderate", "Severe", "Critical"];
const WEATHER = ["Dry", "Rainy", "Hot", "Cold", "Humid"];
const EXERCISE = ["None", "Weekly", "Daily"];
const DIET = ["Mixed", "Vegetarian", "Vegan", "Pescatarian"];
const WATER = ["Borehole", "Tap", "Bottled", "River"];
const CATEGORIES = ["Child", "Teenager", "Adult", "Elderly"];

const toOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }));

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: NewPatientRequest) => Promise<unknown>;
  isSubmitting: boolean;
}

export function AddPatientModal({ isOpen, onClose, onSubmit, isSubmitting }: AddPatientModalProps) {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [genotype, setGenotype] = useState("AA");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("70");
  const [symptoms, setSymptoms] = useState("");
  const [existingConditions, setExistingConditions] = useState("None");
  const [severityLevel, setSeverityLevel] = useState("Mild");
  const [weatherCondition, setWeatherCondition] = useState("Dry");
  const [smokingStatus, setSmokingStatus] = useState(false);
  const [alcoholConsumption, setAlcoholConsumption] = useState(false);
  const [exerciseHabits, setExerciseHabits] = useState("Weekly");
  const [dietType, setDietType] = useState("Mixed");
  const [waterSource, setWaterSource] = useState("Tap");
  const [patientCategory, setPatientCategory] = useState("Adult");
  const [error, setError] = useState("");

  function reset() {
    setFullName("");
    setAge("");
    setGender("Male");
    setBloodGroup("O+");
    setGenotype("AA");
    setHeightCm("170");
    setWeightKg("70");
    setSymptoms("");
    setExistingConditions("None");
    setSeverityLevel("Mild");
    setWeatherCondition("Dry");
    setSmokingStatus(false);
    setAlcoholConsumption(false);
    setExerciseHabits("Weekly");
    setDietType("Mixed");
    setWaterSource("Tap");
    setPatientCategory("Adult");
    setError("");
  }

  async function handleSubmit() {
    const ageNum = Number(age);
    if (!fullName.trim() || !age || Number.isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setError("Enter a patient name and a valid age (0–120).");
      return;
    }
    if (!symptoms.trim()) {
      setError("Describe the presenting symptoms.");
      return;
    }
    setError("");

    await onSubmit({
      full_name: fullName.trim(),
      age: ageNum,
      gender,
      blood_group: bloodGroup,
      genotype,
      height_cm: Number(heightCm) || 170,
      weight_kg: Number(weightKg) || 70,
      symptoms: symptoms.trim(),
      existing_conditions: existingConditions.trim() || "None",
      severity_level: severityLevel,
      weather_condition: weatherCondition,
      smoking_status: smokingStatus,
      alcohol_consumption: alcoholConsumption,
      exercise_habits: exerciseHabits,
      diet_type: dietType,
      water_source: waterSource,
      patient_category: patientCategory,
    });

    reset();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Submit patient for AI triage"
      size="lg"
    >
      <div className="space-y-5">
        <p className="rounded-xl bg-primary-50 px-4 py-3 text-xs text-primary-800 dark:bg-primary-950 dark:text-primary-300">
          Sent to the ML pipeline for diagnosis, risk, drug recommendation, and routing —
          results stream in automatically once ready.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Amaka Chukwu" required />
          <Input label="Age" type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} placeholder="Years" required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select label="Gender" value={gender} onChange={setGender} options={toOptions(GENDERS)} />
          <Select label="Blood group" value={bloodGroup} onChange={setBloodGroup} options={toOptions(BLOOD_GROUPS)} />
          <Select label="Genotype" value={genotype} onChange={setGenotype} options={toOptions(GENOTYPES)} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Height (cm)" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          <Input label="Weight (kg)" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          <Select label="Patient category" value={patientCategory} onChange={setPatientCategory} options={toOptions(CATEGORIES)} />
        </div>

        <Textarea label="Symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="e.g. Fever, cough, fatigue" rows={2} required />
        <Textarea label="Existing conditions" value={existingConditions} onChange={(e) => setExistingConditions(e.target.value)} placeholder="e.g. None, Diabetes, Hypertension" rows={2} />

        <div className="grid grid-cols-3 gap-4">
          <Select label="Severity" value={severityLevel} onChange={setSeverityLevel} options={toOptions(SEVERITIES)} />
          <Select label="Weather" value={weatherCondition} onChange={setWeatherCondition} options={toOptions(WEATHER)} />
          <Select label="Exercise habits" value={exerciseHabits} onChange={setExerciseHabits} options={toOptions(EXERCISE)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Diet type" value={dietType} onChange={setDietType} options={toOptions(DIET)} />
          <Select label="Water source" value={waterSource} onChange={setWaterSource} options={toOptions(WATER)} />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" checked={smokingStatus} onChange={(e) => setSmokingStatus(e.target.checked)} className="h-4 w-4 rounded" />
            Smoker
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" checked={alcoholConsumption} onChange={(e) => setAlcoholConsumption(e.target.checked)} className="h-4 w-4 rounded" />
            Drinks alcohol
          </label>
        </div>

        {error && <p className="text-sm text-error-600 dark:text-error-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit for triage"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
