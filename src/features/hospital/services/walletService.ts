import apiClient from "@/lib/apiClient";

export interface WalletSummary {
  balanceKobo: number;
  heldKobo: number;
  totalKobo: number;
  safehavenAccountNumber: string | null;
  safehavenBankCode: string | null;
}

interface WalletSummaryResponse {
  balance_kobo: number;
  held_kobo: number;
  total_kobo: number;
  safehaven_account_number: string | null;
  safehaven_bank_code: string | null;
}

/**
 * Hospital wallet balance/funding status. Backed by `GET /api/v1/wallet`
 * (real endpoint — see nexus-backend `src/handlers/wallet.rs` `get_wallet`).
 * The wallet row itself always exists for an approved hospital (it's
 * auto-created as a side effect of registration approval, not a hospital
 * action), so this endpoint never 404s — `balance_kobo` simply defaults to
 * 0 until the hospital funds it. `POST /api/v1/shifts` returns 402 Payment
 * Required when the balance can't cover a shift's cost, which is the real
 * thing worth gating on client-side.
 */
export class WalletService {
  static async getWalletSummary(): Promise<WalletSummary> {
    const res = await apiClient.get<WalletSummaryResponse>("/api/v1/wallet");
    const wallet = res.data;

    return {
      balanceKobo: wallet.balance_kobo,
      heldKobo: wallet.held_kobo,
      totalKobo: wallet.total_kobo,
      safehavenAccountNumber: wallet.safehaven_account_number,
      safehavenBankCode: wallet.safehaven_bank_code,
    };
  }
}
