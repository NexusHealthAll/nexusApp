import { PiggyBank, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { PATHS } from "@/routes/paths";
import { Button } from "@/shared/components/ui/Button";

interface WalletFundingBannerProps {
  /** Whether the hospital already has a SafeHaven sub-account (wallet created, just unfunded). */
  hasSubAccount: boolean;
  className?: string;
}

/** Shown on hospital shift pages when the wallet has no funds to create shifts with. */
export function WalletFundingBanner({
  hasSubAccount,
  className,
}: WalletFundingBannerProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border-l-4 border-warning-500 bg-warning-50 px-4 py-3 dark:bg-warning-950",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Wallet className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning-600 dark:text-warning-400" />
        <div>
          <p className="text-sm font-semibold text-warning-800 dark:text-warning-300">
            {hasSubAccount ? "Wallet needs to be funded" : "Your hospital has no wallet"}
          </p>
          <p className="text-xs text-warning-700 dark:text-warning-400">
            {hasSubAccount
              ? "Your hospital wallet has no funds yet. Fund your wallet to enable shift creation."
              : "Set up your hospital's SafeHaven wallet to enable shift creation."}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="flex-shrink-0 whitespace-nowrap border-warning-400 bg-white text-xs font-semibold text-warning-800 hover:bg-warning-100 dark:border-warning-700 dark:bg-transparent dark:text-warning-300 dark:hover:bg-warning-900"
        onClick={() =>
          navigate(PATHS.hospital.payments, { state: { openWalletModal: true } })
        }
      >
        <PiggyBank className="h-3.5 w-3.5" />
        {hasSubAccount ? "Fund Wallet" : "Create Wallet"}
      </Button>
    </div>
  );
}
