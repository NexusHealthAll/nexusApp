import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

export interface PlatformFeeRates {
  serviceFeeRate: number;
  taxRate: number;
}

/**
 * Fallback rates used until the backend exposes a hospital-facing platform
 * fee endpoint — today `platform_fee_percent`/`platform_fee_cap_kobo` only
 * exist behind the admin-only `/api/v1/admin/settings` route.
 */
export const DEFAULT_PLATFORM_FEE_RATES: PlatformFeeRates = {
  serviceFeeRate: 0.12,
  taxRate: 0.053,
};

export async function getPlatformFeeRates(): Promise<PlatformFeeRates> {
  try {
    const res = await apiClient.get<{
      service_fee_rate?: number;
      tax_rate?: number;
    }>("/api/v1/settings/platform-fee");
    return {
      serviceFeeRate:
        typeof res.data?.service_fee_rate === "number"
          ? res.data.service_fee_rate
          : DEFAULT_PLATFORM_FEE_RATES.serviceFeeRate,
      taxRate:
        typeof res.data?.tax_rate === "number"
          ? res.data.tax_rate
          : DEFAULT_PLATFORM_FEE_RATES.taxRate,
    };
  } catch {
    return DEFAULT_PLATFORM_FEE_RATES;
  }
}

/** Fetches the current platform fee rates, falling back to the defaults above on any error. */
export function usePlatformFeeRates(): PlatformFeeRates {
  const [rates, setRates] = useState<PlatformFeeRates>(DEFAULT_PLATFORM_FEE_RATES);

  useEffect(() => {
    let cancelled = false;
    getPlatformFeeRates().then((r) => {
      if (!cancelled) setRates(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return rates;
}
