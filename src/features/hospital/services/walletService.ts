import apiClient from "@/lib/apiClient";

export interface WalletSummary {
  balanceKobo: number;
  heldKobo: number;
  totalKobo: number;
  safehavenAccountNumber: string | null;
  safehavenBankCode: string | null;
  safehavenAccountName: string | null;
  bankName: string | null;
  /** Drives the wallet UI: false → "Create Wallet", true → account details + fund/withdraw. */
  hasSubAccount: boolean;
}

interface WalletSummaryResponse {
  balance_kobo: number;
  held_kobo: number;
  total_kobo: number;
  safehaven_account_number: string | null;
  safehaven_bank_code: string | null;
  safehaven_account_name: string | null;
  bank_name: string | null;
  has_sub_account: boolean;
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

/** Funding instructions returned by `POST /wallet/deposits` — the account to transfer into. */
export interface DepositInstructions {
  accountNumber: string;
  bankName: string;
  bankCode: string;
  accountName: string;
  amountKobo: number;
  instructions: string;
}

interface DepositInstructionsResponse {
  account_number: string;
  bank_name: string;
  bank_code: string;
  account_name: string;
  amount_kobo: number;
  instructions: string;
}

export interface DepositHistoryItem {
  depositId: string;
  amountKobo: number;
  virtualAccountNumber: string;
  virtualAccountName: string | null;
  status: string;
  expiresAt: string;
}

interface DepositHistoryItemResponse {
  deposit_id: string;
  amount_kobo: number;
  virtual_account_number: string;
  virtual_account_name: string | null;
  status: string;
  expires_at: string;
}

export interface ReconcileResult {
  transactionsScanned: number;
  depositsCredited: number;
  amountCreditedKobo: number;
  balanceKobo: number;
}

interface ReconcileResponse {
  transactions_scanned: number;
  deposits_credited: number;
  amount_credited_kobo: number;
  balance_kobo: number;
}

export interface Bank {
  code: string;
  name: string;
}

interface BanksResponse {
  data?: { bankCode: string; name: string }[];
}

export interface ResolvedAccount {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}

interface ResolveAccountResponse {
  account_name: string;
  account_number: string;
  bank_code: string;
}

export interface WithdrawalResult {
  withdrawalId: string;
  amountKobo: number;
  feeKobo: number;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  status: string;
  reference: string;
  message: string;
}

interface WithdrawalResultResponse {
  withdrawal_id: string;
  amount_kobo: number;
  fee_kobo: number;
  account_number: string;
  account_name: string;
  bank_code: string;
  status: string;
  reference: string;
  message: string;
}

export interface WithdrawalHistoryItem {
  id: string;
  amountKobo: number;
  status: string;
  providerReference: string | null;
  description: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface WithdrawalHistoryItemResponse {
  id: string;
  amount_kobo: number;
  status: string;
  provider_reference: string | null;
  description: string | null;
  created_at: string;
  completed_at: string | null;
}

interface WithdrawalsPageResponse {
  withdrawals: WithdrawalHistoryItemResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface PayoutHistoryItem {
  id: string;
  shiftId: string | null;
  amountKobo: number;
  status: string;
  providerReference: string | null;
  description: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface PayoutHistoryItemResponse {
  id: string;
  shift_id: string | null;
  amount_kobo: number;
  status: string;
  provider_reference: string | null;
  description: string | null;
  created_at: string;
  completed_at: string | null;
}

interface PayoutsPageResponse {
  payouts: PayoutHistoryItemResponse[];
  total: number;
  page: number;
  page_size: number;
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
      safehavenAccountName: wallet.safehaven_account_name,
      bankName: wallet.bank_name,
      hasSubAccount: wallet.has_sub_account,
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
    const res = await apiClient.post<{ message: string }>(
      "/api/v1/wallet/sub-account/initiate",
    );
    return res.data.message;
  }

  /** Step 2: completes provisioning with the OTP from step 1. */
  static async provisionSubAccount(otp: string): Promise<string> {
    const res = await apiClient.post<{ message: string }>(
      "/api/v1/wallet/sub-account/provision",
      { otp },
    );
    return res.data.message;
  }

  /**
   * Requests the hospital's dedicated SafeHaven account to transfer funds
   * into. `amountKobo` is only an intent/echo — the wallet auto-credits via
   * webhook based on whatever is actually received, not this call.
   */
  static async requestDeposit(amountKobo: number): Promise<DepositInstructions> {
    const res = await apiClient.post<DepositInstructionsResponse>(
      "/api/v1/wallet/deposits",
      { amount_kobo: amountKobo },
    );
    const d = res.data;
    return {
      accountNumber: d.account_number,
      bankName: d.bank_name,
      bankCode: d.bank_code,
      accountName: d.account_name,
      amountKobo: d.amount_kobo,
      instructions: d.instructions,
    };
  }

  /** Deposit history, newest first — powers the "Refresh deposits" list. */
  static async getDepositHistory(limit = 25): Promise<DepositHistoryItem[]> {
    const res = await apiClient.get<DepositHistoryItemResponse[]>(
      "/api/v1/wallet/deposits",
      { params: { limit } },
    );
    return res.data.map((d) => ({
      depositId: d.deposit_id,
      amountKobo: d.amount_kobo,
      virtualAccountNumber: d.virtual_account_number,
      virtualAccountName: d.virtual_account_name,
      status: d.status,
      expiresAt: d.expires_at,
    }));
  }

  /**
   * "Refresh" fallback for deposits that didn't auto-credit via webhook.
   * Idempotent — safe to call repeatedly.
   */
  static async reconcileDeposits(): Promise<ReconcileResult> {
    const res = await apiClient.post<ReconcileResponse>("/api/v1/wallet/reconcile");
    const r = res.data;
    return {
      transactionsScanned: r.transactions_scanned,
      depositsCredited: r.deposits_credited,
      amountCreditedKobo: r.amount_credited_kobo,
      balanceKobo: r.balance_kobo,
    };
  }

  /** SafeHaven bank list for dropdowns — codes here are SafeHaven-specific, not NIP/CBN. */
  static async getBanks(): Promise<Bank[]> {
    const res = await apiClient.get<BanksResponse>("/api/v1/banks");
    return (res.data.data ?? []).map((b) => ({ code: b.bankCode, name: b.name }));
  }

  /** Resolves an account holder name before withdrawing, for on-screen confirmation. */
  static async resolveAccount(
    accountNumber: string,
    bankCode: string,
  ): Promise<ResolvedAccount> {
    const res = await apiClient.post<ResolveAccountResponse>("/api/v1/banks/resolve", {
      account_number: accountNumber,
      bank_code: bankCode,
    });
    const r = res.data;
    return {
      accountName: r.account_name,
      accountNumber: r.account_number,
      bankCode: r.bank_code,
    };
  }

  /**
   * Withdraws spendable balance to the hospital's own bank. The hospital
   * pays a transfer fee on top of `amountKobo` (wallet debited amount+fee);
   * a 4xx failure auto-refunds the wallet server-side.
   */
  static async withdraw(params: {
    amountKobo: number;
    accountNumber: string;
    bankCode: string;
    narration?: string;
  }): Promise<WithdrawalResult> {
    const res = await apiClient.post<WithdrawalResultResponse>("/api/v1/wallet/withdraw", {
      amount_kobo: params.amountKobo,
      account_number: params.accountNumber,
      bank_code: params.bankCode,
      ...(params.narration ? { narration: params.narration } : {}),
    });
    const r = res.data;
    return {
      withdrawalId: r.withdrawal_id,
      amountKobo: r.amount_kobo,
      feeKobo: r.fee_kobo,
      accountNumber: r.account_number,
      accountName: r.account_name,
      bankCode: r.bank_code,
      status: r.status,
      reference: r.reference,
      message: r.message,
    };
  }

  static async getWithdrawals(
    page = 1,
    pageSize = 50,
  ): Promise<{ items: WithdrawalHistoryItem[]; total: number }> {
    const res = await apiClient.get<WithdrawalsPageResponse>(
      "/api/v1/wallet/withdrawals",
      { params: { page, page_size: pageSize } },
    );
    return {
      total: res.data.total,
      items: res.data.withdrawals.map((w) => ({
        id: w.id,
        amountKobo: w.amount_kobo,
        status: w.status,
        providerReference: w.provider_reference,
        description: w.description,
        createdAt: w.created_at,
        completedAt: w.completed_at,
      })),
    };
  }

  /** Refreshes a `pending` withdrawal's status from the provider. */
  static async getWithdrawalStatus(withdrawalId: string): Promise<string> {
    const res = await apiClient.get<{ withdrawal_id: string; status: string }>(
      `/api/v1/wallet/withdrawals/${encodeURIComponent(withdrawalId)}/status`,
    );
    return res.data.status;
  }

  static async getPayouts(
    page = 1,
    pageSize = 50,
  ): Promise<{ items: PayoutHistoryItem[]; total: number }> {
    const res = await apiClient.get<PayoutsPageResponse>("/api/v1/wallet/payouts", {
      params: { page, page_size: pageSize },
    });
    return {
      total: res.data.total,
      items: res.data.payouts.map((p) => ({
        id: p.id,
        shiftId: p.shift_id,
        amountKobo: p.amount_kobo,
        status: p.status,
        providerReference: p.provider_reference,
        description: p.description,
        createdAt: p.created_at,
        completedAt: p.completed_at,
      })),
    };
  }

  /** Refreshes a `pending` payout's status from the provider. */
  static async getPayoutStatus(payoutId: string): Promise<string> {
    const res = await apiClient.get<{ payout_id: string; status: string }>(
      `/api/v1/wallet/payouts/${encodeURIComponent(payoutId)}/status`,
    );
    return res.data.status;
  }
}
