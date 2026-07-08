/**
 * Formats a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatNaira(
  amount: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
  } = {}
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    compact = false,
  } = options;

  if (compact && amount >= 1000000) {
    // Format large amounts in millions
    const millions = amount / 1000000;
    return `₦${millions.toFixed(1)}M`;
  } else if (compact && amount >= 1000) {
    // Format thousands
    const thousands = amount / 1000;
    return `₦${thousands.toFixed(1)}K`;
  }

  // Standard formatting with Nigerian locale
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits,
    maximumFractionDigits,
  });

  // Replace NGN with ₦ symbol for cleaner display
  return formatter.format(amount).replace('NGN', '₦');
}

/**
 * Formats currency for display in cards and components
 */
export function formatDisplayCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(0)}K`;
  }
  return `₦${amount.toLocaleString()}`;
}

/**
 * Same compact formatting as `formatDisplayCurrency`, for amounts that are
 * denominated in kobo (the backend's currency unit) rather than naira.
 */
export function formatKobo(kobo: number): string {
  return formatDisplayCurrency(kobo / 100);
}