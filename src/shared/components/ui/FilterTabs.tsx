import { cn } from "@/shared/utils/cn";

export interface FilterTabOption<T extends string = string> {
  label: string;
  value: T;
}

interface FilterTabsProps<T extends string = string> {
  options: FilterTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterTabs<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: FilterTabsProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-neutral-100 bg-white p-1",
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
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
