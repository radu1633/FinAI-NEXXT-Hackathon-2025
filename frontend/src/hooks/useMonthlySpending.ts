import { useMemo } from "react";
import { useTransactions } from "./useTransactions";

export function useMonthlySpending() {
  const { transactions, topUser, loading } = useTransactions();

  const monthlyChange = useMemo(() => {
    if (!transactions.length || !topUser) return { change: 0, total: 0 };

    const userTx = transactions.filter(
      (t) => t.client_id === topUser.client_id
    );

    // grupăm tranzacțiile pe lună (ex: "2025-09", "2025-10")
    const totals: Record<string, number> = {};
    userTx.forEach((t) => {
      const monthKey = t.transaction_date.slice(0, 7); // "YYYY-MM"
      totals[monthKey] = (totals[monthKey] || 0) + Number(t.amount);
    });

    const sortedMonths = Object.keys(totals).sort(); // ordonăm crescător
    if (sortedMonths.length < 2)
      return { change: 0, total: totals[sortedMonths[0]] || 0 };

    const lastMonth = sortedMonths[sortedMonths.length - 1];
    const prevMonth = sortedMonths[sortedMonths.length - 2];

    const totalCurrent = totals[lastMonth];
    const totalPrevious = totals[prevMonth];
    const diff = totalCurrent - totalPrevious;

    const change = totalPrevious > 0 ? (diff / totalPrevious) * 100 : 0;

    return { change, total: totalCurrent };
  }, [transactions, topUser]);

  return { ...monthlyChange, loading };
}
