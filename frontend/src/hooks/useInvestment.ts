// src/hooks/useInvestments.ts
import { useEffect, useState } from "react";
import { fetchInvestments, Investment } from "../service/InvestmentService";

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvestments = async () => {
      try {
        const data = await fetchInvestments();
        setInvestments(data);
      } catch (err: any) {
        setError(err.message || "Failed to load investments");
      } finally {
        setLoading(false);
      }
    };

    loadInvestments();
  }, []);

  return { investments, loading, error };
}
