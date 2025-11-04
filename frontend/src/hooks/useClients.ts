import { useEffect, useMemo, useState } from "react";
import { getAllClients, Client } from "../service/clientsService";
import { useTransactions } from "./useTransactions";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { transactions, loading: txLoading } = useTransactions();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getAllClients();
        setClients(data);
      } catch (err) {
        setError("Failed to fetch clients");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const rankedClients = useMemo(() => {
    if (!clients.length || !transactions.length) return [];

    const txCount: Record<number, number> = {};
    transactions.forEach((t) => {
      txCount[t.client_id] = (txCount[t.client_id] || 0) + 1;
    });

    return [...clients].sort(
      (a, b) => (txCount[b.id] || 0) - (txCount[a.id] || 0)
    );
  }, [clients, transactions]);

  return {
    clients,
    topClient: rankedClients[0] || null,
    topThree: rankedClients.slice(0, 3),
    loading: loading || txLoading,
    error,
  };
}
