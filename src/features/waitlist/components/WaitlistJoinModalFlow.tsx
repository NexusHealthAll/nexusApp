import { useState } from "react";
import { ArrowLeft, Building2, CheckCircle2, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
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
        modalStep === "role"
          ? "border-neutral-200 bg-white"
          : "border-white/45 bg-[linear-gradient(180deg,_rgba(236,241,246,0.95)_0%,_rgba(169,196,208,0.82)_54%,_rgba(48,100,144,0.72)_100%)] backdrop-blur-xl",
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
                  "group relative overflow-hidden rounded-2xl border text-left shadow-strong transition-all",
                  isSelected
                    ? "border-3 shadow-2xl drop-shadow-2xl"
                    : "border-neutral-200 hover:border-secondary-300",
                )}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-[22rem] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06345c]/90 via-[#06345c]/40 to-transparent" />
                {isSelected && (
                  <div className="absolute inset-0 bg-[#06345c]/40 transition-opacity" />
                )}
                {isSelected && (
                  <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-onboarding-primaryGreen shadow-lg">
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
            className="h-12 w-full rounded-xl border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue"
            placeholder="Full name"
          />
          <input
            type="email"
            value={state.hospitalForm.email}
            onChange={(event) =>
              updateHospitalForm({ email: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue"
            placeholder="Work email"
          />
          <input
            type="tel"
            value={state.hospitalForm.phoneNumber}
            onChange={(event) =>
              updateHospitalForm({ phoneNumber: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue"
            placeholder="Phone number"
          />
          <input
            type="text"
            value={state.hospitalForm.hospitalName}
            onChange={(event) =>
              updateHospitalForm({ hospitalName: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue"
            placeholder="Hospital name"
          />
          <select
            value={state.hospitalForm.location}
            onChange={(event) =>
              updateHospitalForm({ location: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue"
          >
            <option value="">Select location</option>
            <option value="Abuja">Abuja</option>
            <option value="Lagos">Lagos</option>
            <option value="Kaduna">Kaduna</option>
            <option value="Port Harcourt">Port Harcourt</option>
          </select>
          <select
            value={state.hospitalForm.roleCategory}
            onChange={(event) =>
              updateHospitalForm({ roleCategory: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue"
          >
            <option value="">Select role category</option>
            <option value="Operations Lead">Operations Lead</option>
            <option value="Clinical Director">Clinical Director</option>
            <option value="HR Manager">HR Manager</option>
          </select>

          <Button
            type="submit"
            isLoading={submitState === "loading"}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue text-white"
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
            className="h-12 w-full rounded-xl border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue"
            placeholder="Full name"
          />
          <input
            type="email"
            value={state.healthWorkerForm.email}
            onChange={(event) =>
              updateHealthWorkerForm({ email: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue"
            placeholder="Work email"
          />
          <input
            type="tel"
            value={state.healthWorkerForm.phoneNumber}
            onChange={(event) =>
              updateHealthWorkerForm({ phoneNumber: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue"
            placeholder="Phone number"
          />
          <input
            type="text"
            value={state.healthWorkerForm.professionalTitle}
            onChange={(event) =>
              updateHealthWorkerForm({ professionalTitle: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue"
            placeholder="Professional title / speciality"
          />
          <input
            type="text"
            value={state.healthWorkerForm.licenseNumber}
            onChange={(event) =>
              updateHealthWorkerForm({ licenseNumber: event.target.value })
            }
            className="h-12 w-full rounded-xl border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue"
            placeholder="License number"
          />

          <Button
            type="submit"
            isLoading={submitState === "loading"}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue text-white"
          >
            Join Waitlist
          </Button>
        </form>
      )}
    </Modal>
  );
}
