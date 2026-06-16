import type {
  HealthWorkerFormDraft,
  HospitalFormDraft,
} from "../components/waitlistFlowContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9()\-\s]{7,20}$/;
const LICENSE_REGEX = /^[a-z0-9-]{4,}$/i;

export type HospitalFormErrors = Partial<
  Record<keyof HospitalFormDraft, string>
>;
export type HealthWorkerFormErrors = Partial<
  Record<keyof HealthWorkerFormDraft, string>
>;

export function validateHospitalForm(
  form: HospitalFormDraft,
): HospitalFormErrors {
  const errors: HospitalFormErrors = {};

  if (form.fullName.trim().length < 2) {
    errors.fullName = "Enter a valid full name.";
  }

  const email = form.email.trim().toLowerCase();
  if (!email) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid work email address.";
  }

  const phoneNumber = form.phoneNumber.trim();
  if (!phoneNumber) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!PHONE_REGEX.test(phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if (form.hospitalName.trim().length < 2) {
    errors.hospitalName = "Hospital name is required.";
  }

  if (!form.location.trim()) {
    errors.location = "Select your location.";
  }

  if (!form.roleCategory.trim()) {
    errors.roleCategory = "Select your role category.";
  }

  return errors;
}

export function validateHealthWorkerForm(
  form: HealthWorkerFormDraft,
): HealthWorkerFormErrors {
  const errors: HealthWorkerFormErrors = {};

  if (form.fullName.trim().length < 2) {
    errors.fullName = "Enter a valid full name.";
  }

  const email = form.email.trim().toLowerCase();
  if (!email) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid work email address.";
  }

  const phoneNumber = form.phoneNumber.trim();
  if (!phoneNumber) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!PHONE_REGEX.test(phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if (form.professionalTitle.trim().length < 2) {
    errors.professionalTitle = "Professional title is required.";
  }

  const licenseNumber = form.licenseNumber.trim();
  if (!licenseNumber) {
    errors.licenseNumber = "License number is required.";
  }

  return errors;
}
