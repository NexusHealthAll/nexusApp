import { ComponentType, ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  value: ReactNode;
  label: string;
  sublabel?: string;
  trend?: {
    direction: "up" | "down";
    label: string;
  };
  tone?: "secondary" | "primary";
  className?: string;
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  secondary: "bg-secondary-50 text-secondary-600",
  primary: "bg-primary-50 text-primary-600",
};

export function StatCard({
  icon: Icon,
  value,
  label,
  sublabel,
  trend,
  tone = "secondary",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-100 bg-white p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            toneStyles[tone],
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold",
              trend.direction === "up" ? "text-success-600" : "text-error-600",
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {trend.label}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-neutral-700">{label}</p>
      {sublabel && (
        <p className="mt-0.5 text-xs text-neutral-400">{sublabel}</p>
      )}
    </div>
  );
}
