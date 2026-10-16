const toOptions = (labels: string[]) => {
  const sorted = labels.filter((l) => l !== "Other").sort((a, b) => a.localeCompare(b));
  return [...sorted, "Other"].map((v) => ({ value: v, label: v }));
};

export const SHIFT_ROLE_OPTIONS = toOptions([
  "Registered Nurse", "Physician", "Pharmacist", "Midwife", "Lab Technician",
  "General Practitioner", "Medical Officer", "House Officer", "Resident Doctor",
  "Registrar", "Consultant Physician", "Consultant Surgeon", "Surgeon", "Anaesthetist",
  "Obstetrician & Gynaecologist", "Paediatrician", "Cardiologist", "Neurologist",
  "Radiologist", "Pathologist", "Psychiatrist", "Emergency Physician", "Intensivist",
  "Dentist", "Staff Nurse", "Senior Nurse", "Nurse Practitioner", "Charge Nurse",
  "ICU Nurse", "Emergency Nurse", "Theatre Nurse", "Paediatric Nurse", "Neonatal Nurse",
  "Psychiatric Nurse", "Dialysis Nurse", "Oncology Nurse", "Community Health Nurse",
  "Nurse Anaesthetist", "Nursing Assistant", "Healthcare Assistant", "Dental Nurse",
  "Clinical Pharmacist", "Pharmacy Technician", "Medical Laboratory Scientist",
  "Phlebotomist", "Biomedical Scientist", "Radiographer", "Sonographer", "CT Technologist",
  "MRI Technologist", "Physiotherapist", "Occupational Therapist",
  "Speech & Language Therapist", "Respiratory Therapist", "Audiologist", "Optometrist",
  "Dietitian", "Clinical Psychologist", "Social Worker", "Paramedic",
  "Emergency Medical Technician", "Ambulance Driver", "Operating Theatre Technician",
  "Anaesthetic Technician", "Sterile Services Technician", "Patient Care Technician",
  "Biomedical Engineer", "Medical Records Officer", "Community Health Extension Worker",
  "Ward Orderly", "Ward Clerk", "Medical Receptionist",
]);

export const SHIFT_DEPARTMENT_OPTIONS = toOptions([
  "Emergency", "ICU", "Pharmacy", "Laboratory", "Maternity", "Med-Surg", "Radiology",
  "Accident & Emergency (A&E)", "Outpatient (OPD)", "Inpatient Wards", "Intensive Care (ICU)",
  "High Dependency Unit (HDU)", "Coronary Care Unit (CCU)", "Neonatal ICU (NICU)",
  "Paediatric ICU (PICU)", "Operating Theatre", "Recovery / PACU", "Anaesthesia",
  "General Surgery", "Orthopaedics", "Neurosurgery", "Cardiothoracic Surgery",
  "Plastic Surgery", "Urology", "Obstetrics & Gynaecology", "Labour Ward",
  "Antenatal Clinic", "Postnatal Ward", "Paediatrics", "Neonatology", "Internal Medicine",
  "Cardiology", "Neurology", "Nephrology / Dialysis", "Gastroenterology", "Endocrinology",
  "Pulmonology", "Oncology", "Haematology", "Infectious Diseases", "Geriatrics",
  "Palliative Care", "Psychiatry", "Dermatology", "Ophthalmology", "ENT",
  "Dental", "Physiotherapy", "Occupational Therapy", "Rehabilitation",
  "Radiotherapy", "Nuclear Medicine", "Ultrasound / Sonography", "CT / MRI",
  "Pathology", "Histopathology", "Microbiology", "Chemical Pathology", "Blood Bank",
  "Clinical Pharmacy", "Dispensary", "Central Sterile Services (CSSD)", "Nutrition & Dietetics",
  "Family Medicine / GP Clinic", "Immunisation / Vaccination", "Community Health",
  "Occupational Health", "Infection Prevention & Control", "Medical Records",
  "Ambulance / Pre-hospital", "Telemedicine", "Home Care", "Administration",
]);
