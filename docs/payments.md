```
# NexusCare Payment Flow — Frontend Integration Guide

How the money features work and which endpoints to call. Covers the **hospital
wallet** (fund, withdraw), and the **shift → worker payout** money side.

---

## Conventions (read first)

- **Backend base URL (prod):** `https://nexus-j2rp.onrender.com`
- **Auth:** every endpoint here needs `Authorization: Bearer <JWT>`.
  - Hospital wallet/withdraw endpoints use the **hospital admin** token (role `hospital_admin` or `super_admin`). The backend reads `hospital_id` **from the token**, never from the URL.
  - Worker (clinician) identity/bank endpoints use the **worker** token (role `health_worker`).
- **Money is always in kobo** (integer). ₦1 = 100 kobo. Display with `₦{(kobo/100).toLocaleString()}`. Never send decimals.
- **Error shape** (all failures):
  ```json
  { "error": { "message": "human readable reason", "status": 422 } }
  ```

- **Bank codes are SafeHaven codes**, *not* the usual NIP/CBN codes. Always fetch them from `GET /api/v1/banks` (e.g. GTBank = `000013`, Opay = `100004`). Do **not** hardcode `058` etc.

---

## Part 1 — Hospital Wallet

The hospital funds a wallet; that wallet pays workers (shift payouts) and can be withdrawn to the hospital's bank.

### 1.1 Get wallet summary — drives the whole wallet screen

`GET /api/v1/wallet`

```json
{
  "balance_kobo": 20000,
  "held_kobo": 10000,
  "total_kobo": 30000,
  "safehaven_account_number": "5010974596",
  "safehaven_bank_code": "090286",
  "safehaven_account_name": "THEBUIDLGRID / TOSIN LATEEF",
  "bank_name": "Safe Haven MFB",
  "has_sub_account": true
}
```

- `balance_kobo` = spendable (available to create shifts / withdraw).
- `held_kobo` = reserved as escrow for active shifts (not spendable).
- `total_kobo` = balance + held.
- **`has_sub_account`** drives the UI:
  - `false` → show a **"Create Wallet"** button (§1.2).
  - `true` → show the account details + balance + deposit/withdraw actions.

### 1.2 Create the wallet (one-time, 2-step OTP)

Only when `has_sub_account === false`. **Prerequisite:** the hospital admin's **BVN must already be verified** (done during hospital onboarding via `POST /api/v1/hospitals/{hospital_id}/identity/initiate|validate` with `type: "BVN"`).

**Step 1 — initiate (sends an OTP to the admin's registered phone):**
`POST /api/v1/wallet/sub-account/initiate` (no body)

```json
{ "message": "Sub-account verification initiated. An OTP has been sent to the registered phone." }
```

**Step 2 — provision with the OTP:**
`POST /api/v1/wallet/sub-account/provision`

```json
{ "otp": "123456" }
```

→ `{ "message": "SafeHaven sub-account provisioned successfully." }`

Then re-fetch `GET /api/v1/wallet` — `has_sub_account` is now `true` and the account fields are populated.

> 409 "Already provisioned" if called twice. 403 if the admin's BVN isn't verified yet.

### 1.3 Fund the wallet (deposit)

`POST /api/v1/wallet/deposits`

```json
{ "amount_kobo": 500000 }
```

Returns the hospital's **dedicated account to transfer into** (SafeHaven sub-account):

```json
{
  "account_number": "5010974596",
  "bank_name": "Safe Haven MFB",
  "bank_code": "090286",
  "account_name": "THEBUIDLGRID / TOSIN LATEEF",
  "amount_kobo": 500000,
  "instructions": "Transfer the amount into the account above to fund your wallet. Your balance updates automatically once the transfer is received."
}
```

**How it works:** the hospital transfers money from *their own bank app* into that account. The wallet **auto-credits** when the transfer lands (SafeHaven webhook). The `amount_kobo` you send is only an intent/echo — crediting is based on whatever is actually received. Display the account details and tell the user to make the transfer.

> There is no card/checkout step — funding is a real bank transfer into the shown account.

### 1.4 Deposit history + "Refresh deposits"

`GET /api/v1/wallet/deposits?limit=25`

```json
[ 
  { "deposit_id": "…", "amount_kobo": 10000, "virtual_account_number": "5010974596",
    "virtual_account_name": "TOSIN LATEEF", "status": "received",
    "expires_at": "2026-08-21T07:04:17Z" }
]
```

`POST /api/v1/wallet/reconcile` — wire this to a **"Refresh"** button. If a transfer didn't auto-credit (rare — e.g. a delayed webhook), this pulls the sub-account's history and credits anything missed. Idempotent.

```json
{ "transactions_scanned": 3, "deposits_credited": 1, "amount_credited_kobo": 10000, "balance_kobo": 20000 }
```

### 1.5 Ledger (audit trail)

`GET /api/v1/wallet/ledger?page=1&page_size=50` — every wallet movement (deposit credits, shift holds/releases, payouts, fees, refunds), newest first.

```json
{ "entries": [ { "kind": "deposit_credit", "delta_balance_kobo": 10000, "delta_held_kobo": 0,
                 "created_at": "…", "notes": "sub-account inflow", "shift_id": null } ],
  "total": 12, "page": 1, "page_size": 50 }
```

---

## Part 2 — Withdrawals

Move spendable wallet funds to the hospital's own bank account.

### 2.1 Bank helpers (use before submitting)

- `GET /api/v1/banks` → SafeHaven bank list. Use `bankCode`. Build the bank dropdown from this.
- `POST /api/v1/banks/resolve` → confirm the account holder name before withdrawing:

  ```json
  { "account_number": "0554196007", "bank_code": "000013" }
  ```

  → `{ "account_name": "LATEEF TOSIN TEMITOPE", "account_number": "0554196007", "bank_code": "000013" }`

Show the resolved name for confirmation (like a normal transfer flow).

### 2.2 Withdraw

`POST /api/v1/wallet/withdraw`

```json
{ "amount_kobo": 500000, "account_number": "0554196007", "bank_code": "000013", "narration": "optional" }
```

Response:

```json
{
  "withdrawal_id": "…",
  "amount_kobo": 500000,
  "fee_kobo": 2500,
  "account_number": "0554196007",
  "account_name": "LATEEF TOSIN TEMITOPE",
  "bank_code": "000013",
  "status": "success",
  "reference": "…",
  "message": "Withdrawal completed."
}
```

**Important for the UI:**

- The hospital **pays a transfer fee** (`fee_kobo`). The wallet is debited `amount_kobo + fee_kobo`.
- **Max withdrawable = `balance_kobo − fee`.** If the user tries to withdraw the full balance you'll get a 422 like *"withdrawing ₦X costs ₦Y including a ₦Z transfer fee, but your available balance is ₦W."* — surface that message and/or cap the input.
- `status`: `"success"` (done) | `"pending"` (processing, poll status) | on failure the call returns 4xx and the balance is **automatically refunded**.

### 2.3 Withdrawal history + status

- `GET /api/v1/wallet/withdrawals?page=1&page_size=50`

  ```json
  { "withdrawals": [ { "id": "…", "amount_kobo": 500000, "status": "success",
                       "provider_reference": "…", "description": "…",
                       "created_at": "…", "completed_at": "…" } ],
    "total": 3, "page": 1, "page_size": 50 }
  ```

- `GET /api/v1/wallet/withdrawals/{withdrawal_id}/status` → `{ "withdrawal_id": "…", "status": "success" }` (refreshes a `pending` one from the provider). Poll this while a withdrawal shows `pending`.

---

## Part 3 — Shifts & Worker Payouts (money side)

### 3.1 Creating a shift **holds escrow** from the wallet

When a hospital creates a shift, its full value (`grand_total_kobo`) is moved `balance_kobo → held_kobo` immediately. If the wallet can't cover it, `POST /api/v1/shifts` returns an insufficient-balance error — surface **"Top up your wallet to post this shift."** So: **the wallet must be funded before posting shifts.** After the shift completes and pays out, the hold is consumed; if a shift is cancelled, the hold is released back to `balance_kobo`.

### 3.2 Payout is automatic — no trigger needed

After the hospital **approves the worker's handover**, a backend scheduler pays the worker automatically:

- **net = gross − 10% platform fee**, paid **from the hospital's wallet** to the **worker's bank**.
- The frontend does **not** call any "pay" endpoint. Just reflect status via the payout list.

### 3.3 Payout history + status (hospital view)

- `GET /api/v1/wallet/payouts?page=1&page_size=50`

  ```json
  { "payouts": [ { "id": "…", "shift_id": "…", "amount_kobo": 9000, "status": "success",
                   "provider_reference": "…", "description": "Net pay for shift …",
                   "created_at": "…", "completed_at": "…" } ],
    "total": 1, "page": 1, "page_size": 50 }
  ```

  `status`: `pending` | `success` | `failed`.
- `GET /api/v1/wallet/payouts/{payout_id}/status` → `{ "payout_id": "…", "status": "success" }` (refreshes a pending one).

### 3.4 A worker must be "payable" to receive money

A worker only gets paid if **(a)** their BVN or NIN is verified **and (b)** a bank account is linked. Build this into worker onboarding (worker's own token):

1. `POST /api/v1/clinicians/{clinician_id}/identity/initiate`

   ```json
   { "type": "NIN", "number": "15847175232" }
   ```

   → OTP sent to the phone registered against the BVN/NIN.
2. `POST /api/v1/clinicians/{clinician_id}/identity/validate`

   ```json
   { "type": "NIN", "otp": "692551" }
   ```

   → `{ "message": "Identity verified successfully.", "full_name": "…" }`
3. `POST /api/v1/clinicians/{clinician_id}/bank-account` (requires step 1–2 done first)

   ```json
   { "account_number": "0554196007", "bank_code": "000013" }
   ```

   → `{ "account_name": "LATEEF TOSIN TEMITOPE", "account_number_masked": "055****007", "bank_code": "000013" }`

> If a worker isn't verified / has no bank account, their payout is recorded as failed — surface a "complete your payout setup" prompt.

---

## Part 4 — The money model (mental model)

```
Hospital bank ──deposit──▶ Wallet (SafeHaven sub-account)  [balance_kobo]
                                   │
                        create shift │ holds grand_total  (balance ▶ held_kobo)
                                   ▼
                          Worker completes shift
                                   │ hospital approves handover
                                   ▼
        Wallet ──net (90%)──▶ Worker's bank        (held_kobo consumed)
              └──fee (10%)──▶ Platform revenue
                                   
        Wallet ──withdraw (− fee)──▶ Hospital's bank   (spendable balance_kobo)
```

- Deposits and payouts and withdrawals all move real money through the hospital's **sub-account**.
- The platform keeps **10%** of each shift as its fee; the worker receives the **90% net**.
- Withdrawals cost a small **SafeHaven transfer fee** borne by the hospital.

---

## Part 5 — Endpoint quick reference

| Method | Path | Token | Purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/wallet` | hospital | Wallet summary (`has_sub_account` drives UI) |
| POST | `/api/v1/wallet/sub-account/initiate` | hospital | Create wallet — send OTP |
| POST | `/api/v1/wallet/sub-account/provision` | hospital | Create wallet — confirm OTP |
| POST | `/api/v1/wallet/deposits` | hospital | Get funding instructions (account to transfer into) |
| GET | `/api/v1/wallet/deposits` | hospital | Deposit history |
| POST | `/api/v1/wallet/reconcile` | hospital | "Refresh" — credit any missed deposit |
| GET | `/api/v1/wallet/ledger` | hospital | Full wallet audit trail |
| POST | `/api/v1/wallet/withdraw` | hospital | Withdraw to bank |
| GET | `/api/v1/wallet/withdrawals` | hospital | Withdrawal history |
| GET | `/api/v1/wallet/withdrawals/{id}/status` | hospital | Refresh a pending withdrawal |
| GET | `/api/v1/wallet/payouts` | hospital | Payout history |
| GET | `/api/v1/wallet/payouts/{id}/status` | hospital | Refresh a pending payout |
| GET | `/api/v1/banks` | any | SafeHaven bank list (codes for dropdown) |
| POST | `/api/v1/banks/resolve` | any | Resolve account holder name |
| POST | `/api/v1/clinicians/{id}/identity/initiate` | worker | Worker BVN/NIN — send OTP |
| POST | `/api/v1/clinicians/{id}/identity/validate` | worker | Worker BVN/NIN — confirm OTP |
| POST | `/api/v1/clinicians/{id}/bank-account` | worker | Link worker payout bank |

---

## Part 6 — Error handling cheatsheet

| Status | Meaning | UI action |
| --- | --- | --- |
| 401 | Missing/invalid token | Re-auth |
| 403 | Wrong role, or "no hospital on account", or BVN not verified | Gate the action / prompt verification |
| 404 | Wallet / payout / withdrawal not found | — |
| 409 | Provider conflict (e.g. already provisioned, provider rejection) | Show `error.message` |
| 422 | Validation (bad amount, insufficient balance incl. fee, unresolved account) | Show `error.message` inline |

All errors follow `{ "error": { "message", "status" } }` — render `error.message` directly; it's written to be user-facing.

---

## Notes for prod

- Amounts everywhere are **kobo**.
- The min withdrawal is ₦100; deposits/shifts have their own minimums surfaced via validation messages.
- Real-time deposit crediting depends on the backend `SAFEHAVEN_CALLBACK_URL` being set; the `/wallet/reconcile` button is the always-works fallback.

```
