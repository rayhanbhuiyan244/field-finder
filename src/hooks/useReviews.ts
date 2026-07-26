import { useCallback, useEffect, useState } from "react";
import {
  listReviews,
  createReview,
  averageRating,
  type Review,
} from "@/services/reviewService";

export function useReviews() {
  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listReviews());
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load reviews"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    average: averageRating(data),
    refresh: load,
    submitReview: async (input: Parameters<typeof createReview>[0]) => {
      await createReview(input);
      await load();
    },
  };
}