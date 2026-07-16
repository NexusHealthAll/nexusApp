import { cn } from "@/shared/utils/cn";

export interface UnderlineTabOption<T extends string = string> {
  label: string;
  value: T;
  /** Optional count chip shown after the label. */
  count?: number;
}

interface UnderlineTabsProps<T extends string = string> {
  options: UnderlineTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Horizontal tab row with an active underline, as used across the hospital
 * redesign (shift statuses, transaction filters, notification filters...).
 */
export function UnderlineTabs<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: UnderlineTabsProps<T>) {
  return (
    <div
      className={cn(
        "flex items-center gap-6 overflow-x-auto border-b border-neutral-200",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "-mb-px flex flex-shrink-0 items-center gap-1.5 border-b-2 pb-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-secondary-600 font-semibold text-secondary-700"
                : "border-transparent text-neutral-500 hover:text-neutral-800",
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                  isActive
                    ? "bg-secondary-50 text-secondary-700"
                    : "bg-neutral-100 text-neutral-500",
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
