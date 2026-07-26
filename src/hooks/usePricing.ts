import { useEffect, useState, useCallback } from "react";
import { listPricingRules, computePrice, type PricingRule } from "@/services/pricingService";

export function usePricing() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRules(await listPricingRules());
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load pricing"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    rules,
    loading,
    error,
    refresh: load,
    priceFor: (time: string, date: Date) => computePrice(rules, time, date),
  };
}