import { useState } from "react";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Info,
  Plus,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
import { formatNaira } from "@/shared/utils/currency";
import { URGENCY_BONUS_PCT, type ShiftBonus, type ShiftFormData } from "../types";
import { useShiftDraftStore } from "../hooks/useShiftDraftStore";

interface Props {
  data: ShiftFormData;
  onUpdate: (patch: Partial<ShiftFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Compensation({ data, onUpdate, onNext, onBack }: Props) {
  const [showAddBonus, setShowAddBonus] = useState(false);
  const [newBonus, setNewBonus] = useState({
    name: "",
    description: "",
    amount: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const baseEarnings =
    data.payType === "hourly"
      ? data.hourlyRate * data.duration
      : data.fixedRate;

  const bonusTotal = data.bonuses.reduce((sum, b) => sum + b.amount, 0);
  const urgencyBonusPct = URGENCY_BONUS_PCT[data.urgencyLevel] ?? 0;
  const urgencyBonusAmount = Math.round((baseEarnings * urgencyBonusPct) / 100);
  const discountPct = data.discountPct ?? 0;
  const preDiscountTotal = baseEarnings + bonusTotal + urgencyBonusAmount;
  const discountAmount = Math.round((preDiscountTotal * discountPct) / 100);
  const grandTotal = preDiscountTotal - discountAmount;

  const canProceed =
    data.payType === "hourly" ? data.hourlyRate > 0 : data.fixedRate > 0;

  const handleAddBonus = () => {
    if (!newBonus.name || !newBonus.amount) return;
    const bonus: ShiftBonus = {
      id: crypto.randomUUID(),
      name: newBonus.name,
      description: newBonus.description,
      amount: Number(newBonus.amount),
    };
    onUpdate({ bonuses: [...data.bonuses, bonus] });
    setNewBonus({ name: "", description: "", amount: "" });
    setShowAddBonus(false);
  };

  const removeBonus = (id: string) => {
    onUpdate({ bonuses: data.bonuses.filter((b) => b.id !== id) });
  };

  const { setDraft } = useShiftDraftStore();

  const handleSaveDraft = async () => {
    setSaving(true);

    // Drafts should only be cleared when preview or create shift succeeds.

    // For now, persist the entered fields into the dedicated zustand store.
    setDraft(data);

    await new Promise((resolve) => setTimeout(resolve, 300));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
        <div className="grid grid-cols-[1fr_320px] gap-8 items-start">
          {/* Left: Form */}
          <div className="space-y-8">
            {/* Base Earnings */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-5 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-secondary-600" />
                <h2 className="text-base font-bold text-neutral-900">
                  Base Earnings
                </h2>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Pay Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {(["hourly", "fixed"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onUpdate({ payType: type })}
                      className={cn(
                        "flex items-start justify-between rounded-xl border-2 px-4 py-3 text-left transition-all",
                        data.payType === type
                          ? "border-secondary-600 bg-secondary-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300",
                      )}
                    >
                      <div>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            data.payType === type
                              ? "text-secondary-800"
                              : "text-neutral-700",
                          )}
                        >
                          {type === "hourly" ? "Hourly Rate" : "Fixed Rate"}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {type === "hourly"
                            ? "Best for standard rotations"
                            : "Lump sum per shift"}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2",
                          data.payType === type
                            ? "border-secondary-600"
                            : "border-neutral-300",
                        )}
                      >
                        {data.payType === type && (
                          <div className="h-2 w-2 rounded-full bg-secondary-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {data.payType === "hourly" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Hourly Rate (₦)
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5">
                      <span className="text-sm text-neutral-500">₦</span>
                      <input
                        type="number"
                        min={0}
                        value={data.hourlyRate || ""}
                        onChange={(e) =>
                          onUpdate({ hourlyRate: Number(e.target.value) || 0 })
                        }
                        placeholder="0"
                        className="w-full bg-transparent text-sm text-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Expected Hours
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5">
                      <span className="text-sm text-neutral-700">
                        {data.duration || 0}
                      </span>
                      <span className="text-sm text-neutral-500">
                        Hours (from shift duration)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Fixed Rate (₦)
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5">
                    <span className="text-sm text-neutral-500">₦</span>
                    <input
                      type="number"
                      min={0}
                      value={data.fixedRate}
                      onChange={(e) =>
                        onUpdate({ fixedRate: Number(e.target.value) })
                      }
                      className="w-full bg-transparent text-sm text-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Discount (%){" "}
                  <span className="normal-case font-normal text-neutral-400">
                    — optional
                  </span>
                </label>
                <div className="flex max-w-[160px] items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={data.discountPct ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        onUpdate({ discountPct: undefined });
                        return;
                      }
                      const val = Number(raw);
                      if (Number.isNaN(val)) return;
                      onUpdate({ discountPct: Math.min(100, Math.max(0, val)) });
                    }}
                    placeholder="0"
                    className="w-full bg-transparent text-sm text-neutral-900 focus:outline-none"
                  />
                  <span className="text-sm text-neutral-500">%</span>
                </div>
              </div>
            </div>

            {/* Incentives & Bonuses */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-5 flex items-center gap-2">
                <Shield className="h-5 w-5 text-secondary-600" />
                <h2 className="text-base font-bold text-neutral-900">
                  Incentives & Bonuses
                </h2>
              </div>

              <div className="space-y-3">
                {data.bonuses.map((bonus) => (
                  <div
                    key={bonus.id}
                    className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary-100">
                      <CheckCircle2 className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900">
                        {bonus.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {bonus.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm text-neutral-400">₦</span>
                      <span className="text-sm font-semibold text-neutral-900 w-16 text-right">
                        {bonus.amount.toLocaleString()}
                      </span>
                      {bonus.id !== "stat" && (
                        <button
                          onClick={() => removeBonus(bonus.id)}
                          className="text-neutral-400 hover:text-error-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {showAddBonus ? (
                <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Allowance name"
                      value={newBonus.name}
                      onChange={(e) =>
                        setNewBonus((p) => ({ ...p, name: e.target.value }))
                      }
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    />
                    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                      <span className="text-sm text-neutral-500">₦</span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newBonus.amount}
                        onChange={(e) =>
                          setNewBonus((p) => ({ ...p, amount: e.target.value }))
                        }
                        className="w-full bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  <input
                    placeholder="Description (optional)"
                    value={newBonus.description}
                    onChange={(e) =>
                      setNewBonus((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddBonus}
                      size="sm"
                      className="bg-secondary-600 text-white hover:bg-secondary-700"
                    >
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddBonus(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddBonus(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-500 transition-colors hover:border-secondary-400 hover:text-secondary-600"
                >
                  <Plus className="h-4 w-4" />
                  Add Additional Allowance
                </button>
              )}
            </div>

            {/* Back link */}
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Basic Information
            </button>
          </div>

          {/* Right: Compensation Summary (sticky) */}
          <div className="sticky top-8 self-start rounded-2xl bg-gradient-to-br from-secondary-700 to-secondary-900 p-6 text-white">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-secondary-200">
              Compensation Summary
            </p>

            <div className="space-y-2 mb-4">
              {data.payType === "hourly" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-200">
                    Base ({data.duration || 0} hrs × ₦
                    {data.hourlyRate.toLocaleString()})
                  </span>
                  <span className="font-semibold">
                    {formatNaira(baseEarnings)}
                  </span>
                </div>
              )}
              {data.payType === "fixed" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-200">Fixed Rate</span>
                  <span className="font-semibold">
                    {formatNaira(baseEarnings)}
                  </span>
                </div>
              )}
              {data.bonuses.map((bonus) => (
                <div
                  key={bonus.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-secondary-200">{bonus.name}</span>
                  <span className="font-semibold">
                    {formatNaira(bonus.amount)}
                  </span>
                </div>
              ))}
              {urgencyBonusPct > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-200">
                    Urgency Bonus (+{urgencyBonusPct}%)
                  </span>
                  <span className="font-semibold">
                    {formatNaira(urgencyBonusAmount)}
                  </span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-200">
                    Discount ({discountPct}%)
                  </span>
                  <span className="font-semibold">
                    -{formatNaira(discountAmount)}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-4 border-t border-white/20 pt-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary-300">
                Grand Total
              </p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {formatNaira(grandTotal)}
                </span>
                <Calculator className="h-5 w-5 text-secondary-300" />
              </div>
            </div>

            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-white/10 px-4 py-3">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary-300" />
              <p className="text-xs leading-relaxed text-secondary-200">
                Total earnings are calculated based on clinical hours. Statutory
                deductions may apply at payroll processing.
              </p>
            </div>

            <Button
              onClick={onNext}
              disabled={!canProceed}
              className="mb-3 w-full rounded-xl bg-secondary-600 font-semibold uppercase tracking-wide text-white hover:bg-secondary-500 disabled:opacity-50"
            >
              NEXT STEP →
            </Button>

            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="w-full text-center text-sm font-semibold uppercase tracking-wide text-secondary-200 hover:text-white transition-colors disabled:opacity-60"
            >
              {saved ? "✓ Saved!" : saving ? "Saving..." : "Save as Draft"}
            </button>

            <div className="mt-5 flex items-center gap-3 border-t border-white/20 pt-4">
              <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-neutral-700 overflow-hidden">
                <div className="h-full w-full bg-gradient-to-br from-neutral-600 to-neutral-800" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-secondary-300">
                  Current Progress
                </p>
                <p className="text-sm font-semibold">
                  {data.roleNeeded
                    ? `${data.roleNeeded} – ${data.specialty || "New Shift"}`
                    : "New Shift"}
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
