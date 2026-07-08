import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Dropdown, DropdownItem } from "@/shared/components/ui/Dropdown";
import { cn } from "@/shared/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

/**
 * Animated form value-picker, replacing the native `<select>` +
 * manual-chevron pattern previously duplicated across shift forms.
 */
export function Select({
  options,
  value,
  onChange,
  label,
  placeholder = "Select...",
  error,
  hint,
  required,
  disabled,
  className,
  containerClassName,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectId = useId();

  const selected = options.find((option) => option.value === value);

  const moveHighlight = (delta: number) => {
    setHighlightedIndex((current) => {
      const enabledIndexes = options
        .map((option, index) => ({ option, index }))
        .filter(({ option }) => !option.disabled)
        .map(({ index }) => index);
      if (enabledIndexes.length === 0) return current;

      const currentPos = enabledIndexes.indexOf(current);
      const nextPos =
        currentPos === -1
          ? 0
          : (currentPos + delta + enabledIndexes.length) % enabledIndexes.length;
      return enabledIndexes[nextPos];
    });
  };

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500"
        >
          {label} {required && <span className="text-error-500">*</span>}
        </label>
      )}

      <Dropdown
        className="block w-full"
        panelClassName="max-h-64 overflow-y-auto w-full"
        disabled={disabled}
        open={isOpen}
        onOpenChange={setIsOpen}
        triggerProps={{
          id: selectId,
          "aria-haspopup": "listbox",
          "aria-expanded": isOpen,
          onKeyDown: (event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setIsOpen(true);
              moveHighlight(1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setIsOpen(true);
              moveHighlight(-1);
            } else if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              if (isOpen && highlightedIndex >= 0) {
                const option = options[highlightedIndex];
                if (option && !option.disabled) {
                  onChange(option.value);
                  setIsOpen(false);
                }
              } else {
                setIsOpen(true);
              }
            }
          },
        }}
        trigger={
          <span
            className={cn(
              "flex w-full items-center justify-between rounded-lg border bg-neutral-50 px-4 py-2.5 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2",
              error
                ? "border-error-300 focus-visible:ring-error-500"
                : "border-neutral-200 focus-visible:ring-secondary-500",
              className,
            )}
          >
            <span
              className={cn(
                "truncate",
                selected ? "text-neutral-900" : "text-neutral-400",
              )}
            >
              {selected ? selected.label : placeholder}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform duration-150",
                isOpen && "rotate-180",
              )}
            />
          </span>
        }
      >
        <div role="listbox">
          {options.map((option, index) => (
            <DropdownItem
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              active={index === highlightedIndex || option.value === value}
              disabled={option.disabled}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </DropdownItem>
          ))}
        </div>
      </Dropdown>

      {error ? (
        <p className="mt-1.5 text-xs text-error-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}
