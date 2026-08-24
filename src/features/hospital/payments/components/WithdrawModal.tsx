import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { ApiError } from "@/lib/apiError";
import { formatKobo, formatNaira } from "@/shared/utils/currency";
import {
  WalletService,
  type Bank,
  type WalletSummary,
  type WithdrawalResult,
} from "@/features/hospital/services/walletService";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletSummary | null;
  /** Called after a successful withdrawal so the caller can refetch. */
  onWithdrawn: () => void;
}

type Stage = "form" | "success";

export function WithdrawModal({ isOpen, onClose, wallet, onWithdrawn }: WithdrawModalProps) {
  const [stage, setStage] = useState<Stage>("form");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<WithdrawalResult | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setBanksLoading(true);
    WalletService.getBanks()
      .then((list) => {
        if (!cancelled) setBanks(list);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the bank list. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setBanksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!(bankCode && accountNumber.length === 10)) {
      setResolvedName("");
      return;
    }
    let cancelled = false;
    setIsResolving(true);
    setResolvedName("");
    WalletService.resolveAccount(accountNumber, bankCode)
      .then((res) => {
        if (!cancelled) setResolvedName(res.accountName);
      })
      .catch(() => {
        if (!cancelled) setResolvedName("");
      })
      .finally(() => {
        if (!cancelled) setIsResolving(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bankCode, accountNumber]);

  const resetAndClose = () => {
    setStage("form");
    setBankCode("");
    setAccountNumber("");
    setResolvedName("");
    setAmount("");
    setNarration("");
    setError("");
    setResult(null);
    onClose();
  };

  const maxWithdrawableKobo = wallet?.balanceKobo ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const naira = Number(amount);
    if (!naira || naira <= 0) {
      setError("Enter an amount to withdraw.");
      return;
    }
    if (!bankCode) {
      setError("Select a bank.");
      return;
    }
    if (accountNumber.length !== 10) {
      setError("Enter a valid 10-digit account number.");
      return;
    }
    if (!resolvedName) {
      setError("Account name couldn't be resolved. Check the details and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await WalletService.withdraw({
        amountKobo: Math.round(naira * 100),
        accountNumber,
        bankCode,
        narration: narration.trim() || undefined,
      });
      setResult(res);
      setStage("success");
      onWithdrawn();
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

  const bankOptions = banks.map((b) => ({ value: b.code, label: b.name }));

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Withdraw to Bank" size="sm">
      {stage === "form" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Available to withdraw</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {formatKobo(maxWithdrawableKobo)}
            </p>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
              A SafeHaven transfer fee applies on top of the amount you enter.
            </p>
          </div>

          <Input
            label="Amount to withdraw (₦)"
            type="number"
            inputMode="decimal"
            min={100}
            step={100}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (error) setError("");
            }}
            placeholder="0"
            hint="Minimum ₦100"
            autoFocus
          />

          <Select
            label="Bank"
            options={bankOptions}
            value={bankCode}
            onChange={(v) => {
              setBankCode(v);
              if (error) setError("");
            }}
            placeholder={banksLoading ? "Loading banks..." : "Select bank"}
            disabled={banksLoading}
            searchable
            searchPlaceholder="Search bank name..."
          />

          <Input
            label="Account number"
            inputMode="numeric"
            maxLength={10}
            value={accountNumber}
            onChange={(e) => {
              setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
              if (error) setError("");
            }}
            placeholder="0123456789"
          />

          {(isResolving || resolvedName) && (
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
                resolvedName
                  ? "border border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                  : "bg-neutral-50 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              }`}
            >
              {isResolving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resolving account name...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold">{resolvedName}</span>
                </>
              )}
            </div>
          )}

          <Input
            label="Narration (optional)"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="e.g. Monthly withdrawal"
          />

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting || isResolving || !resolvedName}
            isLoading={isSubmitting}
            className="w-full"
          >
            Withdraw
          </Button>
        </form>
      )}

      {stage === "success" && result && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {formatNaira(result.amountKobo / 100)} withdrawal{" "}
              {result.status === "success" ? "completed" : result.status}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{result.message}</p>
          </div>

          <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">To</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                {result.accountName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Fee</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                {formatKobo(result.feeKobo)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Reference</span>
              <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
                {result.reference}
              </span>
            </div>
          </div>

          <Button onClick={resetAndClose} className="w-full">
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
