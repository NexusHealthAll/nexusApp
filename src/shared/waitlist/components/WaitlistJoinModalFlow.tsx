import { useState } from "react";
import { ArrowLeft, Building2, CheckCircle2, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import { Select } from "@/shared/components/ui/Select";
import { appToast } from "@/shared/components/feedback/toast";
import { cn } from "@/shared/utils/cn";
import {
  WaitlistSubmissionError,
  submitWaitlistLeadToFirebase,
} from "../services/waitlistFirebaseService";
import {
  validateHealthWorkerForm,
  validateHospitalForm,
} from "../services/waitlistValidation";
import { useWaitlistFlow, type WaitlistRole } from "./waitlistFlowContext";

const roleCards: Array<{
  role: WaitlistRole;
  title: string;
  description: string;
  image: string;
  badge: string;
  ctaLabel: string;
  icon: typeof Building2;
}> = [
    {
      role: "hospital",
      title: "Hospitals",
      description:
        "Join as a facility admin to secure verified clinicians and streamline staffing coverage.",
      image: "/waitlist/hospitals.jpg",
      badge: "Institutional Excellence",
      ctaLabel: "Join as Hospital",
      icon: Building2,
    },
    {
      role: "health-worker",
      title: "For Health Workers",
      description:
        "Join as a clinician to discover high-priority shifts and get AI-assisted documentation tools.",
      image: "/waitlist/health-workers.jpg",
      badge: "Clinician Empowerment",
      ctaLabel: "Join as Health Worker",
      icon: Stethoscope,
    },
  ];

type SubmitState = "idle" | "loading";

export function WaitlistJoinModalFlow() {
  const navigate = useNavigate();
  const {
    state,
    modalStep,
    setRole,
    setModalStep,
    closeJoinModal,
    updateHospitalForm,
    updateHealthWorkerForm,
  } = useWaitlistFlow();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const isOpen = modalStep !== null;

  const handleRoleSelect = (role: WaitlistRole) => {
    setRole(role);
    setModalStep(role === "hospital" ? "hospital-form" : "health-worker-form");
  };

  const handleHospitalSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const errors = validateHospitalForm(state.hospitalForm);
    const firstError = Object.values(errors).find(Boolean);

    if (firstError) {
      appToast.error(firstError);
      return;
    }

    setSubmitState("loading");

    try {
      await submitWaitlistLeadToFirebase({
        role: "hospital",
        source: "waitlist-hospital-form",
        fullName: state.hospitalForm.fullName.trim(),
        email: state.hospitalForm.email.trim().toLowerCase(),
        phoneNumber: state.hospitalForm.phoneNumber.trim(),
        hospitalName: state.hospitalForm.hospitalName.trim(),
        location: state.hospitalForm.location.trim(),
        roleCategory: state.hospitalForm.roleCategory.trim(),
      });

      closeJoinModal();
      navigate("/success");
    } catch (error) {
      if (error instanceof WaitlistSubmissionError) {
        if (error.code === "duplicate") {
          appToast.error("email is on waitlist");
          return;
        }

        if (error.code === "config") {
          appToast.error(
            "Waitlist service is not configured yet. Please contact support.",
          );
          return;
        }
      }

      appToast.error("We could not submit your form. Please try again.");
    } finally {
      setSubmitState("idle");
    }
  };

  const handleHealthWorkerSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const errors = validateHealthWorkerForm(state.healthWorkerForm);
    const firstError = Object.values(errors).find(Boolean);

    if (firstError) {
      appToast.error(firstError);
      return;
    }

    setSubmitState("loading");

    try {
      await submitWaitlistLeadToFirebase({
        role: "health-worker",
        source: "waitlist-health-worker-form",
        fullName: state.healthWorkerForm.fullName.trim(),
        email: state.healthWorkerForm.email.trim().toLowerCase(),
        phoneNumber: state.healthWorkerForm.phoneNumber.trim(),
        professionalTitle: state.healthWorkerForm.professionalTitle.trim(),
        licenseNumber: state.healthWorkerForm.licenseNumber.trim(),
      });

      closeJoinModal();
      navigate("/success");
    } catch (error) {
      if (error instanceof WaitlistSubmissionError) {
        if (error.code === "duplicate") {
          appToast.error("email is on waitlist");
          return;
        }

        if (error.code === "config") {
          appToast.error(
            "Waitlist service is not configured yet. Please contact support.",
          );
          return;
        }
      }

      appToast.error("We could not submit your form. Please try again.");
    } finally {
      setSubmitState("idle");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeJoinModal}
      title={
        modalStep === "role"
          ? "Select Your Role"
          : modalStep === "hospital-form"
            ? "Hospital Registration"
            : "Health Worker Registration"
      }
      className={cn(
        "max-h-[calc(100dvh-2rem)] overflow-y-auto",
        modalStep === "role" ? "max-w-4xl" : "max-w-2xl",
        "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
      )}
    >
      {modalStep === "role" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {roleCards.map((card) => {
            const Icon = card.icon;
            const isSelected = state.role === card.role;

            return (
              <button
                key={card.role}
                type="button"
                onClick={() => handleRoleSelect(card.role)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border text-left transition-colors",
                  isSelected
                    ? "border-2 border-onboarding-primaryBlue"
                    : "border-neutral-200 hover:border-onboarding-primaryBlue/50 dark:border-neutral-800",
                )}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-[22rem] w-full object-cover"
                />
                <div className="absolute inset-0 bg-[#06345c]/55" />
                {isSelected && (
                  <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-onboarding-primaryGreen">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="absolute bottom-7 left-7 right-7 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    {card.badge}
                  </p>
                  <h3 className="mt-2 text-4xl font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/80">
                    {card.description}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-onboarding-primaryBlue">
                    <Icon className="h-4 w-4" />
                    {card.ctaLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : modalStep === "hospital-form" ? (
        <form className="space-y-4" onSubmit={handleHospitalSubmit} noValidate>
          <button
            type="button"
            onClick={() => setModalStep("role")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 transition-colors hover:text-onboarding-primaryBlue"
          >
            <ArrowLeft className="h-4 w-4" /> Back to roles
          </button>

          <input
            type="text"
            value={state.hospitalForm.fullName}
            onChange={(event) =>
              updateHospitalForm({ fullName: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-onboarding-primaryBlue dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="Full name"
          />
          <input
            type="email"
            value={state.hospitalForm.email}
            onChange={(event) =>
              updateHospitalForm({ email: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-onboarding-primaryBlue dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="Work email"
          />
          <input
            type="tel"
            value={state.hospitalForm.phoneNumber}
            onChange={(event) =>
              updateHospitalForm({ phoneNumber: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-onboarding-primaryBlue dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="Phone number"
          />
          <input
            type="text"
            value={state.hospitalForm.hospitalName}
            onChange={(event) =>
              updateHospitalForm({ hospitalName: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-onboarding-primaryBlue dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="Hospital name"
          />
          <Select
            value={state.hospitalForm.location}
            onChange={(value) => updateHospitalForm({ location: value })}
            placeholder="Select location"
            className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm text-neutral-900 transition focus-visible:ring-onboarding-primaryBlue dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            options={[
              { value: "Abuja", label: "Abuja" },
              { value: "Lagos", label: "Lagos" },
              { value: "Kaduna", label: "Kaduna" },
              { value: "Port Harcourt", label: "Port Harcourt" },
            ]}
          />
          <Select
            value={state.hospitalForm.roleCategory}
            onChange={(value) => updateHospitalForm({ roleCategory: value })}
            placeholder="Select role category"
            className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm text-neutral-900 transition focus-visible:ring-onboarding-primaryBlue dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            options={[
              { value: "Operations Lead", label: "Operations Lead" },
              { value: "Clinical Director", label: "Clinical Director" },
              { value: "HR Manager", label: "HR Manager" },
            ]}
          />

          <Button
            type="submit"
            isLoading={submitState === "loading"}
            className="h-12 w-full rounded-xl bg-onboarding-primaryBlue text-white transition-colors hover:bg-onboarding-primaryBlue/90"
          >
            Join Waitlist
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={handleHealthWorkerSubmit}
          noValidate
        >
          <button
            type="button"
            onClick={() => setModalStep("role")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 transition-colors hover:text-onboarding-primaryBlue"
          >
            <ArrowLeft className="h-4 w-4" /> Back to roles
          </button>

          <input
            type="text"
            value={state.healthWorkerForm.fullName}
            onChange={(event) =>
              updateHealthWorkerForm({ fullName: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-onboarding-primaryBlue dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="Full name"
          />
          <input
            type="email"
            value={state.healthWorkerForm.email}
            onChange={(event) =>
              updateHealthWorkerForm({ email: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-onboarding-primaryBlue dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="Work email"
          />
          <input
            type="tel"
            value={state.healthWorkerForm.phoneNumber}
            onChange={(event) =>
              updateHealthWorkerForm({ phoneNumber: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-onboarding-primaryBlue dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="Phone number"
          />
          <input
            type="text"
            value={state.healthWorkerForm.professionalTitle}
            onChange={(event) =>
              updateHealthWorkerForm({ professionalTitle: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-onboarding-primaryBlue dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="Professional title / speciality"
          />
          <input
            type="text"
            value={state.healthWorkerForm.licenseNumber}
            onChange={(event) =>
              updateHealthWorkerForm({ licenseNumber: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-onboarding-primaryBlue dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="License number"
          />

          <Button
            type="submit"
            isLoading={submitState === "loading"}
            className="h-12 w-full rounded-xl bg-onboarding-primaryBlue text-white transition-colors hover:bg-onboarding-primaryBlue/90"
          >
            Join Waitlist
          </Button>
        </form>
      )}
    </Modal>
  );
}
