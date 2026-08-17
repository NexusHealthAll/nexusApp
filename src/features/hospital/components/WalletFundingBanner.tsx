import { Wallet } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface WalletFundingBannerProps {
  className?: string;
}

/** Shown on hospital shift pages when the wallet has no funds to create shifts with. */
export function WalletFundingBanner({ className }: WalletFundingBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border-l-4 border-warning-500 bg-warning-50 px-4 py-3 dark:bg-warning-950",
        className,
      )}
    >
      <Wallet className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning-600 dark:text-warning-400" />
      <div>
        <p className="text-sm font-semibold text-warning-800 dark:text-warning-300">
          Wallet needs to be funded
        </p>
        <p className="text-xs text-warning-700 dark:text-warning-400">
          Your hospital wallet has no funds yet. Fund your wallet to enable
          shift creation.
        </p>
      </div>
    </div>
  );
}
