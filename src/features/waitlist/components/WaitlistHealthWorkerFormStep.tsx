import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import {
  WaitlistSubmissionError,
  submitWaitlistLeadToFirebase,
} from "../services/waitlistFirebaseService";
import {
  type HealthWorkerFormErrors,
  validateHealthWorkerForm,
} from "../services/waitlistValidation";
import { useWaitlistFlow } from "./waitlistFlowContext";

type SubmitState = "idle" | "loading" | "error";

export function WaitlistHealthWorkerFormStep() {
  const navigate = useNavigate();
  const { state, updateHealthWorkerForm } = useWaitlistFlow();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");
  const [fieldErrors, setFieldErrors] = useState<HealthWorkerFormErrors>({});

  const validationErrors = useMemo(
    () => validateHealthWorkerForm(state.healthWorkerForm),
    [state.healthWorkerForm],
  );

  const canSubmit = useMemo(() => {
    return (
      state.role === "health-worker" &&
      Object.keys(validationErrors).length === 0
    );
  }, [state.role, validationErrors]);

  if (state.role !== "health-worker") {
    return (
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Select your profile first
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            Please choose Hospital or Health Worker before continuing.
          </p>
          <Link
            to="/waitlist/join"
            className="mt-6 inline-flex text-sm font-semibold text-onboarding-primaryBlue"
          >
            Go to role selection
          </Link>
        </div>
      </section>
    );
  }

  const handleChange = (
    field: keyof typeof state.healthWorkerForm,
    value: string,
  ) => {
    const nextForm = {
      ...state.healthWorkerForm,
      [field]: value,
    };

    updateHealthWorkerForm({ [field]: value });

    if (submitState !== "idle") {
      setSubmitState("idle");
      setFeedback("");
    }

    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors(validateHealthWorkerForm(nextForm));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextFieldErrors = validateHealthWorkerForm(state.healthWorkerForm);
    const firstValidationMessage = Object.values(nextFieldErrors).find(Boolean);

    if (firstValidationMessage) {
      setFieldErrors(nextFieldErrors);
      setSubmitState("error");
      setFeedback(firstValidationMessage);
      return;
    }

    setFieldErrors({});

    const email = state.healthWorkerForm.email.trim().toLowerCase();

    setSubmitState("loading");
    setFeedback("");

    try {
      await submitWaitlistLeadToFirebase({
        role: "health-worker",
        source: "waitlist-health-worker-form",
        fullName: state.healthWorkerForm.fullName.trim(),
        email,
        phoneNumber: state.healthWorkerForm.phoneNumber.trim(),
        professionalTitle: state.healthWorkerForm.professionalTitle.trim(),
        licenseNumber: state.healthWorkerForm.licenseNumber.trim(),
      });

      navigate("/success");
    } catch (error) {
      if (
        error instanceof WaitlistSubmissionError &&
        error.code === "duplicate"
      ) {
        setSubmitState("error");
        setFeedback("email is on waitlist");
        return;
      }

      setSubmitState("error");
      setFeedback("We could not submit your form. Please try again.");
    }
  };

  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="absolute inset-0">
        <img
          src="/waitlist/hospital-form.jpg"
          alt="Clinician background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(7,40,70,0.52),_rgba(4,34,64,0.82))]" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl text-center text-white">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white/95 backdrop-blur">
            Redefining Clinical Efficiency
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Secure Your Place in the
            <span className="block text-onboarding-primaryBlue">Future</span>
            of Care.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
            Empowering healthcare facilities with AI-driven documentation and a
            high-fidelity marketplace for elite clinical talent.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-white/45 bg-[linear-gradient(180deg,_rgba(236,241,246,0.94)_0%,_rgba(169,196,208,0.78)_54%,_rgba(48,100,144,0.68)_100%)] p-6 shadow-strong backdrop-blur-xl sm:p-8">
          <div>
            <h1 className="text-4xl font-semibold text-onboarding-primaryBlue">
              Registration
            </h1>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              Join the priority access list for the next phase.
            </p>
          </div>

          <form
            className="mt-6 flex flex-col gap-6"
            onSubmit={handleSubmit}
            noValidate
          >
            <label className="space-y-2 text-sm text-neutral-700">
              FULL NAME
              <input
                type="text"
                value={state.healthWorkerForm.fullName}
                onChange={(event) =>
                  handleChange("fullName", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.fullName)}
                className={`h-12 w-full rounded-xl border bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-neutral-800 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue ${
                  fieldErrors.fullName ? "border-error-500" : "border-white/55"
                }`}
                placeholder="Dr. Jane Doe"
              />
              {fieldErrors.fullName ? (
                <p className="text-xs text-error-700">{fieldErrors.fullName}</p>
              ) : null}
            </label>

            <label className="space-y-2 text-sm text-neutral-700">
              EMAIL
              <input
                type="email"
                value={state.healthWorkerForm.email}
                onChange={(event) => handleChange("email", event.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
                className={`h-12 w-full rounded-xl border bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-neutral-800 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue ${
                  fieldErrors.email ? "border-error-500" : "border-white/55"
                }`}
                placeholder="jane@hospital-network.org"
              />
              {fieldErrors.email ? (
                <p className="text-xs text-error-700">{fieldErrors.email}</p>
              ) : null}
            </label>

            <label className="space-y-2 text-sm text-neutral-700">
              PHONE NUMBER
              <input
                type="tel"
                value={state.healthWorkerForm.phoneNumber}
                onChange={(event) =>
                  handleChange("phoneNumber", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.phoneNumber)}
                className={`h-12 w-full rounded-xl border bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-neutral-800 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue ${
                  fieldErrors.phoneNumber
                    ? "border-error-500"
                    : "border-white/55"
                }`}
                placeholder="+234 8000 0000"
              />
              {fieldErrors.phoneNumber ? (
                <p className="text-xs text-error-700">
                  {fieldErrors.phoneNumber}
                </p>
              ) : null}
            </label>

            <label className="space-y-2 text-sm text-neutral-700">
              PROFESSIONAL TITLE / SPECIALITY
              <input
                type="text"
                value={state.healthWorkerForm.professionalTitle}
                onChange={(event) =>
                  handleChange("professionalTitle", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.professionalTitle)}
                className={`h-12 w-full rounded-xl border bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-neutral-800 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue ${
                  fieldErrors.professionalTitle
                    ? "border-error-500"
                    : "border-white/55"
                }`}
                placeholder="Emergency Physician"
              />
              {fieldErrors.professionalTitle ? (
                <p className="text-xs text-error-700">
                  {fieldErrors.professionalTitle}
                </p>
              ) : null}
            </label>

            <label className="block space-y-2 text-sm text-neutral-700">
              LICENSE NUMBER (MDC/NGR)
              <input
                type="text"
                value={state.healthWorkerForm.licenseNumber}
                onChange={(event) =>
                  handleChange("licenseNumber", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.licenseNumber)}
                className={`h-12 w-full rounded-xl border bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(238,245,251,0.88))] px-4 text-neutral-800 outline-none backdrop-blur transition focus:border-onboarding-primaryBlue ${
                  fieldErrors.licenseNumber
                    ? "border-error-500"
                    : "border-white/55"
                }`}
                placeholder="MDC-12345-6789"
              />
              {fieldErrors.licenseNumber ? (
                <p className="text-xs text-error-700">
                  {fieldErrors.licenseNumber}
                </p>
              ) : null}
            </label>

            <p
              aria-live="polite"
              className={
                submitState === "error"
                  ? "text-sm text-error-700"
                  : "text-sm text-neutral-700"
              }
            >
              {feedback ||
                "Priority access is reserved for verified healthcare professionals."}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/waitlist/join"
                className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 transition-colors hover:text-onboarding-primaryBlue"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>

              <Button
                type="submit"
                isLoading={submitState === "loading"}
                disabled={!canSubmit}
                className="rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue px-7 text-white shadow-medium"
              >
                Join Waitlist
              </Button>
            </div>
          </form>

          <div className="mt-7 border-t border-white/40 pt-5 text-center">
            <p className="text-sm text-neutral-800">
              "NexusCare has transformed how we manage floor staffing during
              peak surges."
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-secondary-700">
              Chief Medical Officer, Metro General
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
