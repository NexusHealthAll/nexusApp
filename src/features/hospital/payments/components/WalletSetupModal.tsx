import { useEffect, useState } from "react";
import { Check, Copy, Landmark, RefreshCw, ShieldCheck } from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Badge, type BadgeVariant } from "@/shared/components/ui/Badge";
import { ApiError } from "@/lib/apiError";
import { formatKobo, formatNaira } from "@/shared/utils/currency";
import {
  WalletService,
  type DepositHistoryItem,
  type DepositInstructions,
  type WalletSummary,
} from "@/features/hospital/services/walletService";

type Stage = "intro" | "otp" | "fund" | "deposit-ready";

interface WalletSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletSummary | null;
  /** Called after a successful provision or deposit request so the caller can refetch. */
  onWalletChanged: () => void;
}

const MIN_DEPOSIT_NAIRA = 1_000;

const depositStatusVariant: Record<string, BadgeVariant> = {
  received: "success",
  pending: "warning",
  expired: "neutral",
};

export function WalletSetupModal({
  isOpen,
  onClose,
  wallet,
  onWalletChanged,
}: WalletSetupModalProps) {
  const isProvisioned = Boolean(wallet?.hasSubAccount);

  const [stage, setStage] = useState<Stage>(isProvisioned ? "fund" : "intro");
  const [otp, setOtp] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deposit, setDeposit] = useState<DepositInstructions | null>(null);
  const [copied, setCopied] = useState(false);

  const [history, setHistory] = useState<DepositHistoryItem[] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState("");
  const [walletCopied, setWalletCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !isProvisioned) return;
    let cancelled = false;
    WalletService.getDepositHistory()
      .then((items) => {
        if (!cancelled) setHistory(items);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, isProvisioned, stage]);

  const resetAndClose = () => {
    setStage(isProvisioned ? "fund" : "intro");
    setOtp("");
    setAmount("");
    setError("");
    setDeposit(null);
    setCopied(false);
    setRefreshNotice("");
    onClose();
  };

  const handleSendCode = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await WalletService.initiateSubAccount();
      setStage("otp");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Network error — please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otpOverride?: string) => {
    const code = (otpOverride ?? otp).trim();
    if (code.length !== 6) {
      setError("Enter the 6-digit code sent to your registered phone.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await WalletService.provisionSubAccount(code);
      onWalletChanged();
      setStage("fund");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Network error — please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const naira = Number(amount);
    if (!naira || naira < MIN_DEPOSIT_NAIRA) {
      setError(`Minimum deposit is ${formatNaira(MIN_DEPOSIT_NAIRA)}.`);
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const res = await WalletService.requestDeposit(Math.round(naira * 100));
      setDeposit(res);
      setStage("deposit-ready");
      onWalletChanged();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Network error — please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshDeposits = async () => {
    setIsRefreshing(true);
    setRefreshNotice("");
    try {
      const result = await WalletService.reconcileDeposits();
      setRefreshNotice(
        result.depositsCredited > 0
          ? `Credited ${formatKobo(result.amountCreditedKobo)} from ${result.depositsCredited} missed deposit${result.depositsCredited === 1 ? "" : "s"}.`
          : "No missed deposits found — you're up to date.",
      );
      const items = await WalletService.getDepositHistory();
      setHistory(items);
      onWalletChanged();
    } catch (err) {
      setRefreshNotice(
        err instanceof ApiError
          ? err.message
          : "Couldn't refresh deposits — please try again.",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopy = () => {
    if (!deposit) return;
    navigator.clipboard.writeText(deposit.accountNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyWalletAccount = () => {
    if (!wallet?.safehavenAccountNumber) return;
    navigator.clipboard.writeText(wallet.safehavenAccountNumber).then(() => {
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 2000);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={isProvisioned ? "Fund Wallet" : "Create Wallet"}
      size="sm"
    >
      {stage === "intro" && (
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3 rounded-xl bg-secondary-50 px-4 py-3 dark:bg-secondary-950">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary-600 dark:text-secondary-400" />
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              We'll use the BVN already verified on your hospital account to
              open a dedicated SafeHaven account for your wallet. A one-time
              code will be sent to your registered phone to confirm.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button
            onClick={handleSendCode}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="w-full"
          >
            Send verification code
          </Button>
        </div>
      )}

      {stage === "otp" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyOtp();
          }}
          className="flex flex-col gap-5"
        >
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Enter the 6-digit code sent to your registered phone to finish
            setting up your wallet account.
          </p>

          <Input
            label="Verification code"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(next);
              if (error) setError("");
              if (next.length === 6 && !isSubmitting) {
                handleVerifyOtp(next);
              }
            }}
            placeholder="123456"
            className="text-center tracking-[0.5em]"
            autoFocus
          />

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            isLoading={isSubmitting}
            className="w-full"
          >
            Verify & continue
          </Button>
        </form>
      )}

      {stage === "fund" && (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Wallet Account
              </p>
              <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                SafeHaven
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-xl font-bold tracking-wider text-neutral-900 dark:text-neutral-50">
                {wallet?.safehavenAccountNumber ?? "—"}
              </p>
              <button
                type="button"
                onClick={handleCopyWalletAccount}
                disabled={!wallet?.safehavenAccountNumber}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                {walletCopied ? (
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {walletCopied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              {wallet?.safehavenAccountName ?? "—"}
              {wallet?.bankName ? ` · ${wallet.bankName}` : ""}
            </p>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Request a deposit account below to add funds.
          </p>

          <form onSubmit={handleRequestDeposit} className="flex flex-col gap-5">
            <Input
              label="Amount to deposit (₦)"
              type="number"
              inputMode="decimal"
              min={MIN_DEPOSIT_NAIRA}
              step={100}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError("");
              }}
              placeholder={String(MIN_DEPOSIT_NAIRA)}
              hint={`Minimum ${formatNaira(MIN_DEPOSIT_NAIRA)}`}
              leftIcon={Landmark}
              autoFocus
            />

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !amount}
              isLoading={isSubmitting}
              className="w-full"
            >
              Get deposit account
            </Button>
          </form>

          <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Recent Deposits
              </p>
              <button
                type="button"
                onClick={handleRefreshDeposits}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-xs font-semibold text-secondary-600 hover:text-secondary-700 disabled:opacity-50 dark:text-secondary-400"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {refreshNotice && (
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                {refreshNotice}
              </p>
            )}

            <div className="mt-3 space-y-2">
              {history === null ? (
                <p className="text-xs text-neutral-400">Loading...</p>
              ) : history.length === 0 ? (
                <p className="text-xs text-neutral-400">No deposits yet.</p>
              ) : (
                history.slice(0, 5).map((d) => (
                  <div
                    key={d.depositId}
                    className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-800"
                  >
                    <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                      {formatKobo(d.amountKobo)}
                    </span>
                    <Badge variant={depositStatusVariant[d.status] ?? "neutral"}>
                      {d.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {stage === "deposit-ready" && deposit && (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Transfer <strong>{formatNaira(deposit.amountKobo / 100)}</strong>{" "}
            to the account below. {deposit.instructions}
          </p>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Account Number
            </p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-xl font-bold tracking-wider text-neutral-900 dark:text-neutral-50">
                {deposit.accountNumber}
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              {deposit.accountName} · {deposit.bankName}
            </p>
          </div>

          <Button onClick={resetAndClose} className="w-full">
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
