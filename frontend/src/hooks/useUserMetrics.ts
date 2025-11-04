import { useMemo } from "react";
import { useClients } from "./useClients";
import { useTransactions } from "./useTransactions";
import { useSelectedUser } from "../Context/SelectedUserContext";

export function useUserMetrics() {
  const { clients, topClient, loading: clientsLoading } = useClients();
  const { transactions, loading: txLoading } = useTransactions();
  const { selectedUser } = useSelectedUser();

  // 🟡 folosim utilizatorul selectat sau fallback pe topClient
  const activeUser = selectedUser || topClient;

  const metrics = useMemo(() => {
    if (!activeUser || !transactions.length) {
      return {
        creditScore: 0,
        riskProfile: "Unknown",
        totalBalance: 0,
        monthlyChange: 0,
        riskRating: "Unknown",
      };
    }

    // 🔹 Filtrăm tranzacțiile doar pentru userul activ
    const userTx = transactions.filter((t) => t.client_id === activeUser.id);

    const totalsByMonth: Record<string, number> = {};
    userTx.forEach((tx) => {
      const monthKey = tx.transaction_date.slice(0, 7); // "YYYY-MM"
      totalsByMonth[monthKey] =
        (totalsByMonth[monthKey] || 0) + Number(tx.amount);
    });

    const months = Object.keys(totalsByMonth).sort();
    const lastMonth = months.at(-1);
    const prevMonth = months.at(-2);

    const totalCurrent = lastMonth ? totalsByMonth[lastMonth] : 0;
    const totalPrevious = prevMonth ? totalsByMonth[prevMonth] : 0;

    const monthlyChange =
      totalPrevious > 0
        ? ((totalCurrent - totalPrevious) / totalPrevious) * 100
        : 0;

    return {
      creditScore: activeUser.credit_score ?? 0,
      riskProfile: activeUser.risk_rating ?? "Unknown",
      totalBalance: totalCurrent,
      monthlyChange,
    };
  }, [activeUser, transactions]); // 👈 se actualizează automat când schimbi userul

  return {
    topClient,
    metrics,
    loading: clientsLoading || txLoading,
  };
}
