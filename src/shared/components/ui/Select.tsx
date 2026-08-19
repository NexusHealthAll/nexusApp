import { useId, useState, type KeyboardEvent } from "react";
import { ChevronDown, Search } from "lucide-react";
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
  /** Adds a search input at the top of the panel to filter long option lists. */
  searchable?: boolean;
  searchPlaceholder?: string;
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
  searchable = false,
  searchPlaceholder = "Search...",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [search, setSearch] = useState("");
  const selectId = useId();

  const selected = options.find((option) => option.value === value);

  const filteredOptions =
    searchable && search.trim()
      ? options.filter((option) =>
          option.label.toLowerCase().includes(search.trim().toLowerCase()),
        )
      : options;

  const moveHighlight = (delta: number) => {
    setHighlightedIndex((current) => {
      const enabledIndexes = filteredOptions
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

  const handleListKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      moveHighlight(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      moveHighlight(-1);
    } else if (event.key === "Enter" || (event.key === " " && !searchable)) {
      event.preventDefault();
      if (isOpen && highlightedIndex >= 0) {
        const option = filteredOptions[highlightedIndex];
        if (option && !option.disabled) {
          onChange(option.value);
          setIsOpen(false);
        }
      } else {
        setIsOpen(true);
      }
    }
  };

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
        >
          {label} {required && <span className="text-error-500">*</span>}
        </label>
      )}

      <Dropdown
        className="block w-full"
        panelClassName="max-h-64 overflow-y-auto w-full"
        disabled={disabled}
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setSearch("");
            setHighlightedIndex(-1);
          }
        }}
        triggerProps={{
          id: selectId,
          "aria-haspopup": "listbox",
          "aria-expanded": isOpen,
          onKeyDown: handleListKeyDown,
        }}
        trigger={
          <span
            className={cn(
              "flex w-full items-center justify-between rounded-lg border bg-neutral-50 px-4 py-2.5 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-100",
              error
                ? "border-error-300 focus-visible:ring-error-500"
                : "border-neutral-200 focus-visible:ring-secondary-500 dark:border-neutral-700",
              className,
            )}
          >
            <span
              className={cn(
                "truncate",
                selected ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400 dark:text-neutral-400",
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
        {searchable && (
          <div className="sticky top-0 z-10 -mx-1.5 -mt-1.5 mb-1 border-b border-neutral-100 bg-white px-1.5 pb-1.5 pt-1.5 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleListKeyDown}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-neutral-200 bg-neutral-50 py-1.5 pl-8 pr-2.5 text-sm text-neutral-800 outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
        )}
        <div role="listbox">
          {filteredOptions.length === 0 && (
            <p className="px-3 py-2 text-sm text-neutral-400">
              No matches found
            </p>
          )}
          {filteredOptions.map((option, index) => (
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
