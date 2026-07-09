import { useId, useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
import {
  WaitlistSubmissionError,
  submitWaitlistEmailToFirebase,
} from "../services/waitlistFirebaseService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface WaitlistEmailFormProps {
  className?: string;
  layout?: "stacked" | "inline";
}

type SubmitState = "idle" | "loading" | "success" | "error";

export function WaitlistEmailForm({
  className,
  layout = "inline",
}: WaitlistEmailFormProps) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const validateEmail = (value: string) => {
    const normalizedValue = value.trim().toLowerCase();

    if (!normalizedValue) {
      return "Email address is required.";
    }

    if (!EMAIL_REGEX.test(normalizedValue)) {
      return "Enter a valid work email address.";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const validationMessage = validateEmail(normalizedEmail);

    if (validationMessage) {
      setSubmitState("error");
      setFeedbackMessage(validationMessage);
      return;
    }

    setSubmitState("loading");
    setFeedbackMessage("");

    try {
      await submitWaitlistEmailToFirebase(
        normalizedEmail,
        layout === "stacked" ? "hero-form" : "cta-form",
      );

      setSubmitState("success");
      setFeedbackMessage(
        "You are on the waitlist. We will reach out with next steps.",
      );
      setEmail("");
    } catch (error) {
      console.error("Failed to join waitlist:", error);

      if (error instanceof WaitlistSubmissionError) {
        if (error.code === "duplicate") {
          setSubmitState("error");
          setFeedbackMessage("This email is already on the waitlist.");
          return;
        }

        if (error.code === "config") {
          setSubmitState("error");
          setFeedbackMessage(
            "Waitlist service is not configured yet. Please contact support.",
          );
          return;
        }
      }

      setSubmitState("error");
      setFeedbackMessage("We could not save your request. Please try again.");
    }
  };

  const handleChange = (value: string) => {
    setEmail(value);

    if (submitState !== "idle") {
      setSubmitState("idle");
      setFeedbackMessage("");
    }
  };

  return (
    <form
      className={cn("space-y-3", className)}
      onSubmit={handleSubmit}
      noValidate
    >
      <label className="sr-only" htmlFor={inputId}>
        Work email
      </label>

      <div
        className={cn(
          "flex gap-3",
          layout === "inline"
            ? "flex-col sm:flex-row sm:items-center"
            : "flex-col",
        )}
      >
        <div className="flex min-h-[3.25rem] flex-1 items-center gap-3 rounded-xl border border-white/50 bg-white/90 px-4 shadow-soft backdrop-blur">
          <Mail aria-hidden="true" className="h-4 w-4 text-secondary-700" />
          <input
            id={inputId}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="Enter your work email"
            aria-invalid={submitState === "error"}
            aria-describedby={`${inputId}-feedback`}
            className="h-full w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
          />
        </div>

        <Button
          type="submit"
          size="md"
          isLoading={submitState === "loading"}
          className={cn(
            "min-h-[3.25rem] rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue px-6 text-sm font-semibold text-white shadow-medium hover:from-secondary-700 hover:to-primary-700",
            layout === "inline" ? "sm:min-w-[11rem]" : "w-full",
          )}
        >
          Join Waitlist
        </Button>
      </div>

      <p
        id={`${inputId}-feedback`}
        aria-live="polite"
        className={cn(
          "text-sm",
          submitState === "success" && "text-success-700",
          submitState === "error" && "text-error-700",
          submitState === "idle" && "text-neutral-500",
        )}
      >
        {feedbackMessage ||
          "Priority access is reserved for verified healthcare teams and clinicians."}
      </p>
    </form>
  );
}
