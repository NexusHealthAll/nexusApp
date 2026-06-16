import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Zap, Shield } from "lucide-react";
import { HospitalOnboardingLayout } from "./HospitalOnboardingLayout";

const selectCls =
  "w-full rounded-xl bg-[#F0F6FB] border border-gray-200 px-4 py-3 text-sm text-neutral-700 outline-none " +
  "focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 focus:bg-white " +
  "hover:border-gray-300 hover:shadow-sm " +
  "transition-all duration-200";

const inputCls =
  "w-full rounded-xl bg-[#F0F6FB] border border-gray-200 px-4 py-3 text-sm text-neutral-800 outline-none " +
  "focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 focus:bg-white " +
  "hover:border-gray-300 hover:shadow-sm " +
  "transition-all duration-200 placeholder:text-neutral-300";

const BANKS = [
  "Access Bank","Citibank Nigeria","Ecobank Nigeria","Fidelity Bank",
  "First Bank of Nigeria","First City Monument Bank (FCMB)","Globus Bank",
  "Guaranty Trust Bank (GTBank)","Heritage Bank","Keystone Bank","Parallex Bank",
  "Polaris Bank","Providus Bank","Stanbic IBTC Bank","Standard Chartered Bank",
  "Sterling Bank","SunTrust Bank","Union Bank of Nigeria",
  "United Bank for Africa (UBA)","Unity Bank","Wema Bank","Zenith Bank",
];

export function FinancialSetupStep() {
  const navigate = useNavigate();

  const [bankName, setBankName]           = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isResolving, setIsResolving]     = useState(false);
  const [accountName, setAccountName]     = useState("");

  function triggerResolve(acct: string, bank: string) {
    if (acct.length === 10 && bank) {
      setIsResolving(true);
      setAccountName("");
      setTimeout(() => {
        setIsResolving(false);
        setAccountName("St. Jude Medical Center Ltd");
      }, 1800);
    } else {
      setAccountName("");
    }
  }

  function handleAccountNumberChange(value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(cleaned);
    triggerResolve(cleaned, bankName);
  }

  function handleBankChange(value: string) {
    setBankName(value);
    triggerResolve(accountNumber, value);
  }

  return (
    <HospitalOnboardingLayout activeStep={2}>
      {/* ── Page header ── */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900">Financial &amp; Payout Setup</h1>
        <p className="mt-2.5 text-sm text-neutral-500 max-w-lg leading-relaxed">
          Connect a secure settlement account for automated disbursements. Your data is encrypted
          and handled with banking-grade security protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-7 max-w-5xl mx-auto">

        {/* LEFT: Settlement Account form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-semibold text-neutral-800">Settlement Account</h2>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              <Lock className="h-3 w-3" />
              Secure Link
            </span>
          </div>

          {/* Bank Name */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-neutral-500 mb-2">Bank Name</label>
            <select value={bankName} onChange={(e) => handleBankChange(e.target.value)} className={selectCls}>
              <option value="">Select financial institution</option>
              {BANKS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>

          {/* Account Number */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-neutral-500 mb-2">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => handleAccountNumberChange(e.target.value)}
              placeholder="0000000000"
              maxLength={10}
              className={`${inputCls} tracking-widest font-mono`}
            />
          </div>

          {/* Account Name — auto-resolved */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-neutral-500">Account Name</label>
              {isResolving && (
                <span className="flex items-center gap-1 text-[11px] text-teal-600 animate-pulse">
                  <Zap className="h-3 w-3" />
                  Auto-resolving...
                </span>
              )}
            </div>
            <div className="rounded-xl bg-[#F0F6FB] border border-gray-200 px-4 py-3 min-h-[48px] flex items-center transition-all duration-200">
              {accountName ? (
                <span className="text-sm text-neutral-800 font-medium">{accountName}</span>
              ) : (
                <span className="text-sm text-neutral-400 italic">
                  {isResolving ? "Resolving account details..." : "Waiting for account verification..."}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Security panel */}
        <div className="space-y-6">

          {/* Banking-Grade Security card */}
          <div className="bg-[#EBF4FF] rounded-2xl p-7 border border-transparent hover:border-blue-200/60 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800">Banking-Grade Security</h3>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed mb-6">
              Your financial data is protected by industry-leading security infrastructure to ensure
              safe, reliable payouts directly to your facility.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="h-3.5 w-3.5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-800 mb-0.5">T+1 Payout Cycle</p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Cleared funds are automatically disbursed to this account the next business day.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-800 mb-0.5">AES-256 Encryption</p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Account details are encrypted at rest and in transit, exceeding standard
                    regulatory compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Paystack badge */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:border-teal-200/60 hover:shadow-md transition-all duration-200">
            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Powered &amp; Secured By
              </p>
              <p className="text-sm font-bold text-teal-600">Paystack Integrated</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="max-w-5xl mx-auto mt-10 flex items-center justify-between">
        <button
          onClick={() => navigate("/hospital/onboarding/location")}
          className="px-7 py-3 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400/50"
        >
          Back
        </button>
        <button
          onClick={() => navigate("/hospital/onboarding/verification-status")}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-semibold shadow hover:opacity-90 hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
        >
          Complete →
        </button>
      </div>
    </HospitalOnboardingLayout>
  );
}
