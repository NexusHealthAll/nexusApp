export interface ProfileEditableFields {
  firstName: string;
  lastName: string;
  role: string;
  licenseNumber: string;
  specialty: string;
}

const slug = (label: string) =>
  label.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

/** Backend-accepted role categories. Detailed roles below are saved as one of these. */
export type RoleCategory =
  | "doctor"
  | "nurse"
  | "lab_technician"
  | "pharmacist"
  | "radiographer"
  | "physiotherapist"
  | "other";

const ROLE_GROUPS: Record<RoleCategory, string[]> = {
  doctor: [
    "Doctor", "General Practitioner", "Medical Officer", "House Officer", "Resident Doctor",
    "Registrar", "Senior Registrar", "Consultant Physician", "Consultant Surgeon",
    "Surgeon", "Anaesthetist", "Obstetrician & Gynaecologist", "Paediatrician",
    "Cardiologist", "Neurologist", "Neurosurgeon", "Orthopaedic Surgeon", "Radiologist",
    "Pathologist", "Psychiatrist", "Dermatologist", "Ophthalmologist", "ENT Surgeon",
    "Urologist", "Nephrologist", "Gastroenterologist", "Endocrinologist", "Oncologist",
    "Haematologist", "Pulmonologist", "Rheumatologist", "Infectious Disease Physician",
    "Emergency Physician", "Intensivist", "Geriatrician", "Family Physician",
    "Public Health Physician", "Plastic Surgeon", "Cardiothoracic Surgeon",
    "Paediatric Surgeon", "Dentist", "Dental Surgeon", "Oral & Maxillofacial Surgeon",
    "Orthodontist", "Periodontist", "Locum Doctor",
  ],
  nurse: [
    "Nurse", "Registered Nurse", "Staff Nurse", "Senior Nurse", "Nurse Practitioner",
    "Clinical Nurse Specialist", "Charge Nurse", "Nurse Manager", "Matron",
    "Midwife", "Community Midwife", "Registered Midwife", "Nurse Anaesthetist",
    "Theatre Nurse (Perioperative)", "ICU Nurse", "Emergency Nurse", "Paediatric Nurse",
    "Neonatal Nurse", "Oncology Nurse", "Dialysis Nurse", "Psychiatric Nurse",
    "Community Health Nurse", "Public Health Nurse", "Occupational Health Nurse",
    "Geriatric Nurse", "Ophthalmic Nurse", "Orthopaedic Nurse", "Cardiac Nurse",
    "Nursing Assistant", "Auxiliary Nurse", "Healthcare Assistant", "Enrolled Nurse",
    "Dental Nurse", "Infection Control Nurse", "Wound Care Nurse", "Triage Nurse",
    "Home Care Nurse",
  ],
  lab_technician: [
    "Lab Technician", "Medical Laboratory Scientist", "Medical Laboratory Technician",
    "Histopathology Technician", "Phlebotomist", "Microbiologist", "Biomedical Scientist",
    "Blood Bank Technician", "Cytotechnologist", "Clinical Chemist", "Laboratory Assistant",
  ],
  pharmacist: [
    "Pharmacist", "Clinical Pharmacist", "Hospital Pharmacist", "Community Pharmacist",
    "Pharmacy Technician", "Pharmacy Assistant", "Dispensing Technician",
  ],
  radiographer: [
    "Radiographer", "Sonographer", "CT Technologist", "MRI Technologist",
    "Mammographer", "Nuclear Medicine Technologist", "Radiation Therapist",
    "Radiology Technician", "Interventional Radiographer",
  ],
  physiotherapist: [
    "Physiotherapist", "Occupational Therapist", "Speech & Language Therapist",
    "Respiratory Therapist", "Audiologist", "Prosthetist & Orthotist",
    "Rehabilitation Therapist", "Chiropractor", "Optometrist", "Podiatrist",
  ],
  other: [
    "Paramedic", "Emergency Medical Technician", "Ambulance Driver", "Dietitian",
    "Nutritionist", "Clinical Psychologist", "Counsellor", "Social Worker",
    "Medical Social Worker", "Health Records Officer", "Medical Records Technician",
    "Community Health Extension Worker", "Community Health Officer",
    "Environmental Health Officer", "Health Educator", "Patient Care Technician",
    "Operating Theatre Technician", "Anaesthetic Technician", "Sterile Services Technician",
    "Biomedical Engineer", "Medical Equipment Technician", "Ward Orderly",
    "Hospital Porter", "Medical Receptionist", "Ward Clerk", "Other",
  ],
};

const CATEGORY_VALUES = new Set<string>(Object.keys(ROLE_GROUPS));

const ROLE_CATEGORY_BY_VALUE = new Map<string, RoleCategory>();

function alphabetical<T extends { label: string }>(list: T[]): T[] {
  const other = list.filter((o) => o.label === "Other");
  return [...list.filter((o) => o.label !== "Other")].sort((a, b) => a.label.localeCompare(b.label)).concat(other);
}

export const ROLE_OPTIONS = alphabetical(
  (Object.entries(ROLE_GROUPS) as [RoleCategory, string[]][]).flatMap(([category, labels]) =>
    labels.map((label) => {
      const value = slug(label);
      ROLE_CATEGORY_BY_VALUE.set(value, category);
      return { value, label };
    }),
  ),
);

/** Maps a (possibly detailed) role value to the category the backend accepts. */
export function roleToApiRole(value: string): RoleCategory {
  if (CATEGORY_VALUES.has(value)) return value as RoleCategory;
  return ROLE_CATEGORY_BY_VALUE.get(value) ?? "other";
}

export const SPECIALTY_OPTIONS = alphabetical(
  [
    "Emergency Medicine", "Pediatrics", "ICU Specialist", "General Nursing", "Pharmacy",
    "Lab Technician", "Surgery", "Radiology", "Anesthesiology", "Cardiology", "Obstetrics",
    "Psychiatry", "General Practice", "Internal Medicine", "Family Medicine", "Gynaecology",
    "Neonatology", "Neurology", "Neurosurgery", "Orthopaedics", "Trauma Surgery",
    "Cardiothoracic Surgery", "Plastic & Reconstructive Surgery", "Paediatric Surgery",
    "General Surgery", "Urology", "Nephrology", "Dialysis", "Gastroenterology",
    "Endocrinology", "Diabetology", "Oncology", "Haematology", "Pulmonology",
    "Rheumatology", "Infectious Diseases", "Critical Care", "Geriatrics", "Palliative Care",
    "Dermatology", "Ophthalmology", "ENT (Otolaryngology)", "Dentistry",
    "Oral & Maxillofacial Surgery", "Pathology", "Histopathology", "Microbiology",
    "Chemical Pathology", "Blood Bank / Transfusion", "Clinical Pharmacy",
    "Community Pharmacy", "Interventional Radiology", "Ultrasound / Sonography",
    "CT / MRI Imaging", "Nuclear Medicine", "Radiotherapy", "Physiotherapy",
    "Occupational Therapy", "Speech Therapy", "Audiology", "Respiratory Therapy",
    "Rehabilitation", "Sports Medicine", "Midwifery", "Antenatal / Postnatal Care",
    "Labour & Delivery", "Theatre / Perioperative", "Recovery / PACU", "Triage",
    "Community Health", "Public Health", "Occupational Health", "Mental Health",
    "Child & Adolescent Psychiatry", "Addiction Medicine", "Nutrition & Dietetics",
    "Infection Prevention & Control", "Wound Care", "Home Care", "Telemedicine",
    "Ambulance / Pre-hospital Care", "Sexual & Reproductive Health", "Fertility / IVF",
    "Vascular Surgery", "Medical Records", "Other",
  ].map((label) => ({ value: slug(label), label })),
);

/** Certificates hospitals can require on a shift (mirrors the Create Shift form). */
export const DEFAULT_CERTIFICATES = ["BLS", "ACLS", "PALS", "RN License", "NRP", "CPR"];

/** Mirrors the "Minimum Experience" thresholds hospitals choose when creating a shift. */
export const EXPERIENCE_OPTIONS = [
  { value: "none", label: "Under 1 year" },
  { value: "1+ years", label: "1+ years" },
  { value: "3+ years", label: "3+ years" },
  { value: "5+ years", label: "5+ years" },
  { value: "10+ years", label: "10+ years" },
];

/** Details the backend has no field for yet — kept on this device only. */
export interface ProfileLocalExtras {
  experience: string;
  languages: string;
}
