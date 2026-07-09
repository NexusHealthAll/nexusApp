import { Info } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Header } from "../DashboardChrome";

export function AlreadyAppliedScreen({
  onBack,
  onGoToApplications,
}: {
  onBack: () => void;
  onGoToApplications: () => void;
}) {
  return (
    <>
      <Header onBack={onBack} />
      <main className="flex flex-col items-center px-5 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-700 text-white">
          <Info className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-xl font-bold">Already Applied</h1>
        <p className="mt-3 max-w-xs text-sm text-neutral-500">
          You have already submitted interest for this shift. Check your applications list for
          status updates.
        </p>
        <Button
          type="button"
          onClick={onGoToApplications}
          className="mt-8 w-full max-w-xs bg-brand-700"
        >
          Go to My Applications
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-sm font-semibold text-neutral-500 hover:text-neutral-700"
        >
          Back to Search
        </button>
      </main>
    </>
  );
}
