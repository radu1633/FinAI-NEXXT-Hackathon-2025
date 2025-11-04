import axios from "axios";

const API_URL = "http://localhost:8090";

/**
 * Obține toate tranzacțiile din backend
 */
export const getAllTransactions = async () => {
  try {
    const response = await axios.get(`${API_URL}/transactions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

/**
 * Returnează userul (client_id) cu cele mai multe tranzacții
 */
export const getTopUserByTransactions = (transactions: any[]) => {
  const countMap: Record<number, number> = {};

  transactions.forEach((t) => {
    countMap[t.client_id] = (countMap[t.client_id] || 0) + 1;
  });

  const topUser = Object.entries(countMap).sort((a, b) => b[1] - a[1])[0];
  return topUser ? { client_id: Number(topUser[0]), count: topUser[1] } : null;
};

/**
 * Grupa cheltuielile pe categorii pentru PieChart
 */
export const getCategoryBreakdown = (transactions: any[]) => {
  const grouped: Record<string, number> = {};

  transactions.forEach((t) => {
    grouped[t.category] = (grouped[t.category] || 0) + Number(t.amount);
  });

  return Object.entries(grouped).map(([category, total]) => ({
    name: category,
    value: total,
  }));
};

/**
 * Grupa cheltuielile pe luni pentru BarChart
 */
export const getMonthlyBreakdown = (transactions: any[]) => {
  const grouped: Record<string, number> = {};

  transactions.forEach((t) => {
    const month = new Date(t.transaction_date).toLocaleString("en-US", {
      month: "short",
    });
    grouped[month] = (grouped[month] || 0) + Number(t.amount);
  });

  return Object.entries(grouped).map(([month, total]) => ({
    month,
    total,
  }));
};
