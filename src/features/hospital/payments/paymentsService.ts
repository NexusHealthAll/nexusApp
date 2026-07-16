import {
  WalletService,
  type WalletSummary,
} from "@/features/hospital/services/walletService";

export type PaymentStatus = "pending" | "completed" | "refunded";

export interface PaymentTransaction {
  id: string;
  worker: string;
  shift: string;
  invoice: string;
  dateLabel: string;
  amountKobo: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface PaymentsOverview {
  wallet: WalletSummary | null;
  pendingKobo: number;
  completedThisMonthKobo: number;
  refundsThisMonthKobo: number;
  transactions: PaymentTransaction[];
}

function statusForKind(kind: string): PaymentStatus {
  const k = kind.toLowerCase();
  if (k.includes("refund")) return "refunded";
  if (k.includes("hold") || k.includes("escrow")) return "pending";
  return "completed";
}

function labelForKind(kind: string): string {
  return kind
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Payments page data. Wallet balances and the transaction list come from
 * the real wallet endpoints (`GET /wallet`, `GET /wallet/ledger`); ledger
 * entries are mapped into the design's invoice-style rows (the ledger has
 * no worker names — the shift/kind labels stand in until the backend
 * exposes richer billing data). An empty ledger renders as an empty state.
 */
export const PaymentsService = {
  async getOverview(): Promise<PaymentsOverview> {
    const [wallet, entries] = await Promise.all([
      WalletService.getWalletSummary().catch(() => null),
      WalletService.getLedger().catch(() => []),
    ]);

    const now = new Date();
    const isThisMonth = (iso: string) => {
      const d = new Date(iso);
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    };

    const transactions: PaymentTransaction[] = entries.map((e) => ({
      id: e.id,
      worker: labelForKind(e.kind),
      shift: e.notes ?? (e.shift_id ? `Shift ${e.shift_id.slice(0, 8)}` : "—"),
      invoice: e.provider_reference ?? `LED-${e.id.slice(0, 6).toUpperCase()}`,
      dateLabel: new Date(e.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      amountKobo: Math.abs(e.delta_balance_kobo || e.delta_held_kobo),
      status: statusForKind(e.kind),
      createdAt: e.created_at,
    }));

    const completedThisMonthKobo = transactions
      .filter((t) => t.status === "completed" && isThisMonth(t.createdAt))
      .reduce((sum, t) => sum + t.amountKobo, 0);
    const refundsThisMonthKobo = transactions
      .filter((t) => t.status === "refunded" && isThisMonth(t.createdAt))
      .reduce((sum, t) => sum + t.amountKobo, 0);
    const pendingKobo =
      wallet?.heldKobo ??
      transactions
        .filter((t) => t.status === "pending")
        .reduce((sum, t) => sum + t.amountKobo, 0);

    return {
      wallet,
      pendingKobo,
      completedThisMonthKobo,
      refundsThisMonthKobo,
      transactions,
    };
  },
};
