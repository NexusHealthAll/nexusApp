import { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { Button } from "@/shared/components/ui/Button";
import { useHospitalSetup } from "../hooks/useHospitalSetup";

const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? "pk_test_placeholder";

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return digits;
}

export function AddPaymentMethod() {
  const { paymentSet, setPaymentDone, reset } = useHospitalSetup();

  const [form, setForm] = useState({
    cardholderName: "Dr. Adeyemi Michael",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [showCvv, setShowCvv] = useState(false);

  const config = {
    reference: `hosp_${Date.now()}`,
    email: "billing@hospital.org",
    amount: 0,
    publicKey: PAYSTACK_PUBLIC_KEY,
    label: "Hospital Billing Setup",
    channels: ["card"] as (
      | "card"
      | "bank"
      | "ussd"
      | "qr"
      | "mobile_money"
      | "bank_transfer"
    )[],
  };

  usePaystackPayment(config);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentSet) {
      setPaymentDone();
    }

    // initializePayment({
    //   onSuccess: () => setPaymentDone(),
    //   onClose: () => {},
    // });
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-10">
      {/* Back */}
      <div className="w-full max-w-md mb-4">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to location
        </button>
      </div>

      {/* Title */}
      <h1 className="mb-1 text-3xl font-bold text-neutral-900">
        Add Payment Method
      </h1>
      <p className="mb-8 text-sm text-neutral-500">
        You'll be billed for shifts
      </p>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cardholder Name */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              Cardholder Name
            </label>
            <input
              type="text"
              value={form.cardholderName}
              onChange={(e) =>
                setForm((p) => ({ ...p, cardholderName: e.target.value }))
              }
              className="w-full rounded-lg bg-onboarding-inputBackground px-4 py-3 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
              placeholder="Full name on card"
              required
            />
          </div>

          {/* Card Number */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              Card Number
            </label>
            <div className="flex items-center gap-3 rounded-lg bg-onboarding-inputBackground px-4 py-3">
              <CreditCard className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              <input
                type="text"
                value={form.cardNumber}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    cardNumber: formatCardNumber(e.target.value),
                  }))
                }
                className="flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                maxLength={19}
              />
              {/* Card brand indicators */}
              <div className="flex gap-1">
                <span className="h-5 w-8 rounded bg-neutral-400 opacity-60" />
                <span className="h-5 w-8 rounded bg-secondary-400 opacity-60" />
              </div>
            </div>
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                Expiry Date
              </label>
              <input
                type="text"
                value={form.expiry}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    expiry: formatExpiry(e.target.value),
                  }))
                }
                className="w-full rounded-lg bg-onboarding-inputBackground px-4 py-3 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
                placeholder="MM / YY"
                inputMode="numeric"
                maxLength={7}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                CVV
              </label>
              <div className="flex items-center gap-2 rounded-lg bg-onboarding-inputBackground px-4 py-3">
                <input
                  type={showCvv ? "text" : "password"}
                  value={form.cvv}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                  className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
                  placeholder="123"
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={() => setShowCvv((v) => !v)}
                  className="flex-shrink-0 text-neutral-400 hover:text-neutral-600"
                >
                  {showCvv ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="mt-2 w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest"
          >
            Save &amp; Continue
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
          <Lock className="h-3.5 w-3.5" />
          Secure payment powered by Paystack
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <ShieldCheck className="h-6 w-6 text-neutral-300" />
          <ShieldCheck className="h-6 w-6 text-neutral-300" />
          <ShieldCheck className="h-6 w-6 text-neutral-300" />
        </div>
      </div>
    </div>
  );
}
