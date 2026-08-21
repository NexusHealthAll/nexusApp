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
export interface WalletLedgerEntry {
  id: string;
  kind: string;
  delta_balance_kobo: number;
  delta_held_kobo: number;
  shift_id: string | null;
  provider_reference: string | null;
  notes: string | null;
  created_at: string;
}

interface LedgerPageResponse {
  entries: WalletLedgerEntry[];
  page: number;
  page_size: number;
}

export interface DepositResponse {
  depositId: string;
  amountKobo: number;
  virtualAccountNumber: string;
  virtualBankCode: string | null;
  virtualAccountName: string | null;
  expiresAt: string;
  status: string;
}

interface DepositResponseBody {
  deposit_id: string;
  amount_kobo: number;
  virtual_account_number: string;
  virtual_bank_code: string | null;
  virtual_account_name: string | null;
  expires_at: string;
  status: string;
}

interface SubAccountStatusResponse {
  message: string;
}

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

  /**
   * Wallet audit trail, backed by the real `GET /api/v1/wallet/ledger`
   * (see nexus-backend `src/handlers/wallet.rs` `get_ledger`).
   */
  static async getLedger(page = 1, pageSize = 100): Promise<WalletLedgerEntry[]> {
    const res = await apiClient.get<LedgerPageResponse>("/api/v1/wallet/ledger", {
      params: { page, page_size: pageSize },
    });
    return res.data.entries;
  }

  /**
   * Step 1 of SafeHaven sub-account provisioning. Needs no input — the
   * backend pulls the hospital admin's already-verified BVN from the
   * identity-verification record and has SafeHaven text an OTP to the
   * hospital's registered phone. 403s with a "BVN must be verified first"
   * message if identity verification hasn't been completed yet.
   */
  static async initiateSubAccount(): Promise<string> {
    const res = await apiClient.post<SubAccountStatusResponse>(
      "/api/v1/wallet/sub-account/initiate",
    );
    return res.data.message;
  }

  /** Step 2: completes provisioning with the OTP from step 1. */
  static async provisionSubAccount(otp: string): Promise<string> {
    const res = await apiClient.post<SubAccountStatusResponse>(
      "/api/v1/wallet/sub-account/provision",
      { otp },
    );
    return res.data.message;
  }

  /**
   * Mints a one-time SafeHaven virtual account for the hospital to transfer
   * funds into. The wallet is credited asynchronously once SafeHaven's
   * webhook confirms receipt — this call only returns the account to pay
   * into, not an immediate balance update.
   */
  static async requestDeposit(amountKobo: number): Promise<DepositResponse> {
    const res = await apiClient.post<DepositResponseBody>("/api/v1/wallet/deposits", {
      amount_kobo: amountKobo,
    });
    const d = res.data;
    return {
      depositId: d.deposit_id,
      amountKobo: d.amount_kobo,
      virtualAccountNumber: d.virtual_account_number,
      virtualBankCode: d.virtual_bank_code,
      virtualAccountName: d.virtual_account_name,
      expiresAt: d.expires_at,
      status: d.status,
    };
  }
}
