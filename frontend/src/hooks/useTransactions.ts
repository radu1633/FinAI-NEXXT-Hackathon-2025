import { useEffect, useState } from "react";
import {
  getAllTransactions,
  getTopUserByTransactions,
  getCategoryBreakdown,
  getMonthlyBreakdown,
} from "../service/TransactionService";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [topUser, setTopUser] = useState<{
    client_id: number;
    count: number;
  } | null>(null);
  const [categoryData, setCategoryData] = useState<
    { name: string; value: number }[]
  >([]);
  const [monthlyData, setMonthlyData] = useState<
    { month: string; total: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getAllTransactions();
        setTransactions(data);

        // Procesăm datele derivate
        setTopUser(getTopUserByTransactions(data));
        setCategoryData(getCategoryBreakdown(data));
        setMonthlyData(getMonthlyBreakdown(data));
      } catch (err: any) {
        setError("Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return { transactions, topUser, categoryData, monthlyData, loading, error };
};
