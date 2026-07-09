import { CheckCircle2, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { useWaitlistFlow } from "./waitlistFlowContext";

export function WaitlistSuccessStep() {
  const navigate = useNavigate();
  const { resetFlow } = useWaitlistFlow();

  const handleStartAgain = () => {
    resetFlow();
    navigate("/waitlist/landing");
  };

  return (
    <section className="bg-[#f4f6fa] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-200 bg-white p-8 text-center shadow-strong sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h1 className="mt-6 text-4xl font-semibold text-neutral-950">
          You are on the Waitlist
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
          Thanks for joining NexusCare. Our team will review your submission and
          contact you with next steps.
        </p>

        {/* {submittedEmail && (
          <p className="mt-5 rounded-2xl border border-secondary-100 bg-secondary-50 px-4 py-3 text-sm text-secondary-700">
            Confirmation will be sent to {submittedEmail}
          </p>
        )} */}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={handleStartAgain}
            className="rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue px-6 text-white"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Start again
          </Button>

          {/* <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <Home className="h-4 w-4" /> Go home
          </Link> */}
        </div>
      </div>
    </section>
  );
}
