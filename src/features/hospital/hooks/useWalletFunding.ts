import { useEffect, useState } from "react";
import { WalletService, type WalletSummary } from "@/features/hospital/services/walletService";

interface WalletFundingState {
  isLoading: boolean;
  isFunded: boolean;
  wallet: WalletSummary | null;
  error: string | null;
  refresh: () => void;
}

/**
 * Whether the hospital's wallet has funds to cover shift creation. Used to
 * gate the "New Shift" entry points — see `CreateShiftButton`.
 */
export function useWalletFunding(): WalletFundingState {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    WalletService.getWalletSummary()
      .then((summary) => {
        if (!cancelled) setWallet(summary);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load wallet balance.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return {
    isLoading,
    isFunded: (wallet?.balanceKobo ?? 0) > 0,
    wallet,
    error,
    refresh: () => setRefreshKey((key) => key + 1),
  };
}
