import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTransactions } from "../../hooks/useTransactions";
import { useSelectedUser } from "../../Context/SelectedUserContext";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const COLORS = [
  "#fbe304",
  "#f8eb4c",
  "#f39c12",
  "#e1b12c",
  "#f4d03f",
  "#ffd23f",
  "#eeca1a",
  "#fbc531",
  "#f5cd79",
  "#f6e58d",
  "#ffda79",
  "#eab543",
];

const UserToolTipChart = () => {
  const { transactions, topUser, loading, error } = useTransactions();
  const { selectedUser } = useSelectedUser();

  // 🟡 folosim userul selectat din context sau fallback pe topUser
  const activeUser = selectedUser || topUser;

  // 🧩 extragem ID-ul real indiferent de structură
  const activeUserId =
    (activeUser as any)?.id ?? (activeUser as any)?.client_id ?? null;

  // 🔹 filtrăm tranzacțiile pentru userul activ
  const userTransactions = useMemo(() => {
    if (!transactions.length || !activeUserId) return [];
    return transactions.filter((t) => t.client_id === activeUserId);
  }, [transactions, activeUserId]);

  // 🔹 totaluri lunare
  const data = useMemo(() => {
    const monthlyTotals = Array(12).fill(0);

    userTransactions.forEach((t) => {
      const date = new Date(t.transaction_date);
      const month = date.getMonth(); // 0-based (0 = Jan)
      monthlyTotals[month] += Number(t.amount);
    });

    return monthlyTotals.map((total, index) => ({
      month: MONTH_NAMES[index],
      total,
    }));
  }, [userTransactions]);

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

  if (!data.some((d) => d.total > 0))
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-[#dfc9bc] text-center">
        <h3 className="text-[#3b3c44] text-xl font-bold mb-3">
          Yearly Spending Overview
        </h3>
        <p className="text-gray-500 mb-2">
          {activeUserId
            ? "No transactions found for this user."
            : "Select a user to view spending data."}
        </p>
      </div>
    );

  // 🎨 Afișare chart
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 border border-[#dfc9bc]">
      <h3 className="text-[#3b3c44] text-xl font-bold mb-2 pb-14 text-center">
        Yearly Spending Overview
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#3b3c44", fontWeight: 600 }}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#3b3c44", fontWeight: 600 }}
            axisLine={false}
            tickFormatter={(value) => `${value} RON`}
          />
          <Tooltip
            cursor={{ fill: "rgba(251, 227, 4, 0.15)" }}
            contentStyle={{
              backgroundColor: "rgba(35, 35, 35, 0.75)",
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
            formatter={(value: number) => [`${value} RON`, "Expenses"]}
          />

          <Bar dataKey="total" radius={[10, 10, 0, 0]} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserToolTipChart;
