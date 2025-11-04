import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTransactions } from "../../hooks/useTransactions";
import { useSelectedUser } from "../../Context/SelectedUserContext";

const COLORS = [
  "#fbe304",
  "#f39c12",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#e74c3c",
  "#1abc9c",
];

const MONTHS = [
  { label: "August 2025", value: "2025-08" },
  { label: "September 2025", value: "2025-09" },
  { label: "October 2025", value: "2025-10" },
];

const UserPieChart = () => {
  const [selectedMonth, setSelectedMonth] = useState("2025-10");
  const { transactions, topUser, loading, error } = useTransactions();
  const { selectedUser } = useSelectedUser();

  // ✅ Fallback pe topUser
  const activeUser = selectedUser || topUser;

  // ✅ Obținem ID-ul corect, indiferent de tipul obiectului
  const activeUserId =
    (activeUser as any)?.id ?? (activeUser as any)?.client_id ?? null;

  // 🔹 Filtrăm tranzacțiile doar pentru userul activ și luna selectată
  const filteredTransactions = useMemo(() => {
    if (!transactions.length || !activeUserId) return [];

    return transactions.filter(
      (t) =>
        t.client_id === activeUserId &&
        t.transaction_date.startsWith(selectedMonth)
    );
  }, [transactions, activeUserId, selectedMonth]);

  // 🔹 Grupăm cheltuielile pe categorii pentru pie chart
  const pieData = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
    });

    return Object.entries(totals).map(([category, value]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value,
    }));
  }, [filteredTransactions]);

  // 🧠 Stări intermediare
  if (loading)
    return (
      <div className="text-center text-gray-500 py-10">
        Loading transactions...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load data 😕
      </div>
    );

  if (!pieData.length)
    return (
      <div className="bg-white rounded-3xl shadow-lg py-6 px-4 border border-[#dfc9bc] text-center">
        <h3 className="text-[#3b3c44] text-md font-bold mb-2">
          Monthly Expenses Breakdown
        </h3>
        <p className="text-gray-500 mb-4">
          {activeUserId
            ? `No transactions found for ${selectedMonth}.`
            : "Select a user to view expenses."}
        </p>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-[#dfc9bc] text-[#3b3c44] px-3 py-2 rounded-lg"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    );

  // 🎨 Chart
  return (
    <div className="bg-white rounded-3xl shadow-lg py-6 px-4 border border-[#dfc9bc]">
      <div className="flex flex-col items-center justify-center mb-4">
        <h3 className="text-[#3b3c44] text-xl font-bold">
          Monthly Expenses Breakdown
        </h3>
      </div>

      <div className="flex items-center justify-center mb-4.5">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-[#dfc9bc] text-[#3b3c44] px-3 py-1 rounded-lg text-sm focus:ring-2 focus:ring-[#fbe304] transition-all"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            paddingAngle={5}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: number, name: string) => [`${value} RON`, name]}
            contentStyle={{
              backgroundColor: "rgba(35, 35, 35, 0.9)",
              color: "#fff",
              borderRadius: "12px",
              border: "2px solid #fbe304",
              boxShadow: "0 0 15px rgba(251, 227, 4, 0.4)",
              padding: "10px 14px",
            }}
            itemStyle={{
              color: "#fff",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
            labelStyle={{
              color: "#fbe304",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserPieChart;
