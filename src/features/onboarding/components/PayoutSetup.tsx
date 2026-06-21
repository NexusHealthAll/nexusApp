import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { Bell, Building, CheckCircle, Loader2 } from "lucide-react";

// Nigerian banks for demo
const nigerianBanks = [
  { code: "044", name: "Access Bank" },
  { code: "014", name: "Afribank Nigeria Plc" },
  { code: "023", name: "Citibank Nigeria Limited" },
  { code: "050", name: "Ecobank Nigeria Plc" },
  { code: "011", name: "First Bank of Nigeria Limited" },
  { code: "214", name: "First City Monument Bank Limited" },
  { code: "070", name: "Fidelity Bank Plc" },
  { code: "058", name: "Guaranty Trust Bank Plc" },
  { code: "030", name: "Heritage Banking Company Ltd" },
  { code: "082", name: "Keystone Bank Limited" },
  { code: "076", name: "Polaris Bank Limited" },
  { code: "221", name: "Stanbic IBTC Bank Limited" },
  { code: "068", name: "Standard Chartered Bank Nigeria Limited" },
  { code: "232", name: "Sterling Bank Plc" },
  { code: "033", name: "United Bank For Africa Plc" },
  { code: "032", name: "Union Bank of Nigeria Plc" },
  { code: "035", name: "Wema Bank Plc" },
  { code: "057", name: "Zenith Bank Plc" },
];

interface PayoutData {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export function PayoutSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PayoutData>({
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errors, setErrors] = useState<Partial<PayoutData>>({});

  // Simulate account name lookup when bank and account number are provided
  useEffect(() => {
    if (formData.bankCode && formData.accountNumber.length === 10) {
      verifyAccountDetails();
    } else {
      setFormData((prev) => ({ ...prev, accountName: "" }));
      setIsVerified(false);
    }
  }, [formData.bankCode, formData.accountNumber]);

  const verifyAccountDetails = async () => {
    setIsVerifying(true);
    setIsVerified(false);

    try {
      // Simulate Paystack account verification API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock account name based on account number (for demo)
      const mockNames = [
        "Dr. Adebayo Johnson",
        "Dr. Fatima Abdullahi",
        "Dr. Chinedu Okafor",
        "Dr. Aisha Mohammed",
        "Dr. Olumide Adeyemi",
      ];

      const randomName =
        mockNames[Math.floor(Math.random() * mockNames.length)];

      setFormData((prev) => ({ ...prev, accountName: randomName }));
      setIsVerified(true);
    } catch (error) {
      console.error("Account verification error:", error);
      setFormData((prev) => ({ ...prev, accountName: "Verification failed" }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAccountNumberChange = (value: string) => {
    // Only allow numbers and limit to 10 digits
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, accountNumber: cleaned }));

    if (errors.accountNumber) {
      setErrors((prev) => ({ ...prev, accountNumber: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PayoutData> = {};

    if (!formData.bankCode) {
      newErrors.bankCode = "Please select a bank";
    }

    if (!formData.accountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (formData.accountNumber.length !== 10) {
      newErrors.accountNumber = "Account number must be 10 digits";
    }

    if (!isVerified) {
      newErrors.accountName = "Account verification is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate final setup
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Store payout data
      localStorage.setItem("payoutData", JSON.stringify(formData));

      // Mark onboarding as complete
      localStorage.setItem("onboardingComplete", "true");

      // Create final user profile
      const professionalData = JSON.parse(
        localStorage.getItem("professionalData") || "{}",
      );
      const selectedRole =
        localStorage.getItem("selectedRole") || "health-worker";
      const userData = {
        id: `user_${Date.now()}`,
        fullName: formData.accountName,
        email: localStorage.getItem("pendingEmail") || "",
        role:
          selectedRole === "health-worker" ? "medical-staff" : "hospital_admin",
        professional: professionalData,
        payout: formData,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      };

      // Store complete user data and auth token
      const authToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("userData", JSON.stringify(userData));

      // Clean up temporary data
      localStorage.removeItem("emailVerified");
      localStorage.removeItem("selectedRole");
      localStorage.removeItem("professionalData");
      localStorage.removeItem("payoutData");

      // Navigate based on role
      if (selectedRole === "health-worker") {
        navigate("/medical-staff/dashboard");
      } else {
        navigate("/hospital/dashboard");
      }
    } catch (error) {
      console.error("Onboarding completion error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3FAFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white rounded-t-2xl px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <NexusCareLogo size="md" />
            </div>
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
          </div>

          {/* Step Indicator */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              STEP 03 OF 04
            </p>
            <h1 className="text-2xl font-bold text-onboarding-textPrimary">
              Payout Setup
            </h1>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue h-1 rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white rounded-t-none rounded-b-2xl border-t-0 shadow-md">
          <CardContent className="p-6 space-y-6">
            {/* Description */}
            <p className="text-onboarding-textSecondary leading-relaxed">
              Link your bank account to receive instant payments via Paystack.
            </p>
            <form onSubmit={handleComplete} className="space-y-6">
              {/* Bank Selection */}
              <div className="space-y-3">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Select Bank
                </label>
                <BankDropdown
                  value={formData.bankCode}
                  onChange={(code) =>
                    setFormData((prev) => ({ ...prev, bankCode: code }))
                  }
                  error={!!errors.bankCode}
                />
                {errors.bankCode && (
                  <p className="text-sm text-red-600">{errors.bankCode}</p>
                )}
              </div>

              {/* Account Number */}
              <div className="space-y-3">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Account Number
                </label>
                <div className="flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5">
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                    className={`flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 font-mono ${
                      errors.accountNumber ? "text-red-600" : ""
                    }`}
                    placeholder="0123456789"
                    maxLength={10}
                  />
                  <div className="flex-shrink-0">
                    <svg
                      className="h-4 w-4 text-secondary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                </div>
                {errors.accountNumber && (
                  <p className="text-sm text-red-600">{errors.accountNumber}</p>
                )}
              </div>

              {/* Account Name Verification */}
              <div className="space-y-3">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Account Name
                </label>
                <div
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-all ${
                    isVerified
                      ? "border-green-300 bg-green-50"
                      : "bg-onboarding-inputBackground"
                  }`}
                >
                  {isVerifying ? (
                    <div className="flex items-center space-x-2 text-onboarding-textSecondary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        Verifying account details...
                      </span>
                    </div>
                  ) : formData.accountName ? (
                    <div className="flex items-center space-x-2">
                      {isVerified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span
                        className={`text-sm ${isVerified ? "text-green-800 font-semibold" : "text-neutral-800"}`}
                      >
                        {formData.accountName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-400">
                      Account name will appear here after verification
                    </span>
                  )}
                </div>
                {errors.accountName && (
                  <p className="text-sm text-red-600">{errors.accountName}</p>
                )}
              </div>

              {/* Complete Setup Button */}
              <Button
                type="submit"
                disabled={isLoading || !isVerified}
                isLoading={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? "Completing Setup..." : "Link Account & Continue"}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">
                    Secure & Encrypted
                  </h4>
                  <p className="text-sm text-slate-600">
                    Your banking information is encrypted and processed securely
                    through Paystack. We never store your sensitive financial
                    data.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BankDropdown({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (code: string) => void;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const selected = nigerianBanks.find((b) => b.code === value);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2.5 rounded-lg bg-onboarding-inputBackground px-3 py-2.5 w-full text-left ${
          error ? "ring-1 ring-red-400" : ""
        }`}
      >
        <Building className="h-4 w-4 flex-shrink-0 text-secondary-600" />
        <span
          className={`flex-1 text-sm ${selected ? "text-neutral-800" : "text-neutral-400"}`}
        >
          {selected ? selected.name : "Choose your bank"}
        </span>
        <svg
          className="h-4 w-4 text-neutral-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-100 bg-white shadow-lg">
          {nigerianBanks.map((bank) => (
            <button
              key={bank.code}
              type="button"
              onClick={() => {
                onChange(bank.code);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
            >
              {bank.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
