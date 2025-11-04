import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { ChatAI } from "../components/reusable/ChatAI";
import UserPieChart from "../components/reusable/UserPieChart";
import UserToolTipChart from "../components/reusable/UserToolTipChart";
import { useUserMetrics } from "../hooks/useUserMetrics";
import { useMonthlySpending } from "../hooks/useMonthlySpending";
import { useClients } from "../hooks/useClients";
import { useSelectedUser } from "../Context/SelectedUserContext";
import { useInvestments } from "../hooks/useInvestment";


export default function DashboardPage() {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { topThree, loading } = useClients();
  const { selectedUser, setSelectedUser } = useSelectedUser();
  const { topClient, metrics, loading: metricsLoading } = useUserMetrics();
  const { change, total } = useMonthlySpending();
  const {
    investments,
    loading: investmentsLoading,
    error: investmentsError,
  } = useInvestments();

  console.log("Investments:", investments);

  useEffect(() => {
    if (!loading && topThree.length > 0 && !selectedUser) {
      setSelectedUser(topThree[0]);
    }
  }, [loading, topThree, selectedUser, setSelectedUser]);

  const riskWidth = (r: string) => {
    const map: Record<string, number> = { low: 20, medium: 60, high: 100 };
    return map[r?.toLowerCase?.()] ?? 0;
  };

  console.log("Client riskProfile:", metrics?.riskProfile);
  console.log("Investment sample:", investments?.[0]?.risk_score);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Floating Ask AI Button */}

      {showChat === false ? (
        <>
          <button
            onClick={() => setShowChat(true)}
            className="fixed bottom-10 right-12 flex flex-col items-center text-center justify-center gap-1 text-sm px-7 py-6 bg-[#fbe304] text-[#3b3c44] rounded-full hover:bg-[#f8eb4c] transition-all shadow-lg z-50"
            style={{ fontWeight: 600 }}
          >
            <MessageSquare size={28} />
            Ask AI
          </button>
        </>
      ) : (
        <></>
      )}

      {/* Navbar */}
      <nav className="bg-[#3b3c44] fixed left-0 right-0 z-40 shadow-lg border-b-2 border-[#fbe304]">
        <div className="max-w-8xl mx-4 sm:mx-8 px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-5">
            <h1
              className="text-[#fbe304]"
              style={{ fontSize: "1.5rem", fontWeight: 700 }}
            >
              <span className="text-white">Fin</span>AI
            </h1>
          </div>

          {/* Desktop Nav Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex gap-2 mr-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-[#fbe304] px-6 py-2 bg-[#fbe304]/10 rounded-3xl hover:bg-[#fbe304]/20 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/")}
                className="text-[#fbe304] px-4 py-2"
              >
                HomePage
              </button>
            </div>

            <div className="flex items-center gap-4">
              {loading ? (
                <p className="text-[#dfc9bc] text-sm">Loading users...</p>
              ) : (
                topThree.map((user) => {
                  const isSelected = selectedUser?.id === user.id;

                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="flex flex-col items-center text-center relative group"
                    >
                      <div
                        className={`w-10 h-10 rounded-full border transition-all duration-300 ${
                          isSelected
                            ? "border-[#fbe304] shadow-[0_0_10px_2px_rgba(251,227,4,0.6)]"
                            : "border-[#6c6e74] group-hover:border-[#fbe304]/60"
                        }`}
                      >
                        <img
                          src={`https://api.dicebear.com/9.x/identicon/svg?seed=${user.name}`}
                          alt={user.name}
                          className="w-full h-full rounded-full"
                        />
                      </div>
                      <span
                        className={`text-xs mt-1 transition-colors ${
                          isSelected
                            ? "text-[#fbe304] font-semibold"
                            : "text-[#dfc9bc] group-hover:text-[#fbe304]/80"
                        }`}
                      >
                        {user.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <button
              onClick={() => navigate("/")}
              className="text-[#dfc9bc] hover:text-[#fbe304] p-2 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Burger Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#fbe304] focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    menuOpen
                      ? "M6 18L18 6M6 6l12 12" // X icon
                      : "M4 6h16M4 12h16M4 18h16" // Burger icon
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="lg:hidden bg-[#3b3c44] border-t border-[#fbe304]/40 px-6 py-4 flex flex-col gap-4 text-[#fbe304] font-semibold">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-left hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/")}
              className="text-left hover:text-white transition-colors"
            >
              HomePage
            </button>
            <hr className="border-[#6c6e74]" />
            <div>
              <div className="text-white text-sm">John Doe</div>
              <div className="text-[#dfc9bc] text-xs">Premium Member</div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-left text-[#dfc9bc] hover:text-[#fbe304] transition-colors flex items-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content + Chat Layout */}
      <div
        className={`transition-all duration-500 ease-in-out flex pt-24 ${
          showChat ? "lg:w-3/4" : "w-full"
        }`}
      >
        {/* Dashboard Content */}
        <div
          className={`px-6 mx-42 transition-all duration-500 ease-in-out ${
            showChat ? "lg:w-4/5 ml-6 mr-12" : "w-full"
          }`}
        >
          {/* --- Aici e tot conținutul dashboardului tău --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#ffd23f] backdrop-blur-sm rounded-3xl text-center  w-full mt-8 p-8 mb-8 shadow-2xl border-2 border-[#ffd23f]"
          >
            {loading || metricsLoading ? (
              <p className="text-[#3b3c44] font-semibold">Loading metrics...</p>
            ) : selectedUser ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* 1️⃣ Credit Score */}
                <div>
                  <div
                    className="text-[#928915]"
                    style={{ fontSize: "0.9rem", fontWeight: 500 }}
                  >
                    Credit Score
                  </div>
                  <div
                    className="text-[#4f5057]"
                    style={{ fontSize: "2.5rem", fontWeight: 800 }}
                  >
                    {metrics?.creditScore ?? "--"}
                  </div>
                  <div
                    className="text-white font-medium"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {metrics?.creditScore
                      ? metrics.creditScore > 750
                        ? "Excellent"
                        : metrics.creditScore > 650
                        ? "Good"
                        : "Needs improvement"
                      : "No data"}
                  </div>
                </div>

                {/* 2️⃣ Risk Profile */}
                <div>
                  <div
                    className="text-[#928915]"
                    style={{ fontSize: "0.9rem", fontWeight: 500 }}
                  >
                    Risk Profile
                  </div>
                  <div
                    className="text-[#4f5057]"
                    style={{ fontSize: "2rem", fontWeight: 700 }}
                  >
                    {metrics?.riskProfile ?? "--"}
                  </div>
                  <div
                    className="text-white font-medium"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {metrics?.riskProfile
                      ? metrics.riskProfile === "low"
                        ? "Stable investments"
                        : metrics.riskProfile === "medium"
                        ? "Balanced growth"
                        : "High risk, high reward"
                      : "No data"}
                  </div>
                </div>

                {/* 3️⃣ Total Balance */}
                <div>
                  <div
                    className="text-[#928915]"
                    style={{ fontSize: "0.9rem", fontWeight: 500 }}
                  >
                    Total Balance
                  </div>
                  <div
                    className="text-[#4f5057]"
                    style={{ fontSize: "2rem", fontWeight: 700 }}
                  >
                    ${metrics?.totalBalance?.toLocaleString?.() ?? "0"}
                  </div>
                  <div
                    className="text-[#009094]"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {metrics?.monthlyChange
                      ? `${metrics.monthlyChange >= 0 ? "+" : "-"}$${Math.abs(
                          (metrics.totalBalance || 0) *
                            (metrics.monthlyChange / 100)
                        ).toFixed(0)} this month`
                      : "No data"}
                  </div>
                </div>

                {/* 4️⃣ Monthly Spending Change */}
                <div>
                  <div
                    className="text-[#928915]"
                    style={{ fontSize: "0.9rem", fontWeight: 500 }}
                  >
                    Monthly Spending Change
                  </div>
                  <div
                    className="text-[#4f5057]"
                    style={{ fontSize: "2rem", fontWeight: 700 }}
                  >
                    {metrics?.monthlyChange?.toFixed?.(1) ?? "--"}%
                  </div>
                  <div
                    className={`font-medium flex items-center justify-center gap-1 ${
                      (metrics?.monthlyChange ?? 0) >= 0
                        ? "text-[#e74c3c]"
                        : "text-[#2ecc71]"
                    }`}
                    style={{ fontSize: "0.85rem" }}
                  >
                    {metrics?.monthlyChange != null ? (
                      metrics.monthlyChange >= 0 ? (
                        <>
                          <ArrowUpRight size={16} />{" "}
                          {Math.abs(metrics.monthlyChange).toFixed(1)}% more
                          spending
                        </>
                      ) : (
                        <>
                          <ArrowDownRight size={16} />{" "}
                          {Math.abs(metrics.monthlyChange).toFixed(1)}% less
                          spending
                        </>
                      )
                    ) : (
                      <>No data</>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[#3b3c44] font-semibold">
                No client selected. Please choose one from the top bar.
              </p>
            )}
          </motion.div>

          {/* User Spending Overview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 mb-12"
          >
            <h2
              className="text-[#3b3c44] mb-8"
              style={{ fontSize: "2rem", fontWeight: 700 }}
            >
              Monthly Expenses Overview
            </h2>

            {/* 🔹 Flex parent row container */}
            <div
              className={`flex ${
                showChat ? "flex-col" : "flex-row"
              } items-start justify-between gap-8 w-full`}
            >
              {/* 🟡 Left column: PieChart */}
              <div
                className={`${
                  showChat ? "w-full" : "w-3/7"
                } transition-all duration-500`}
              >
                <UserPieChart />
              </div>

              {/* 🟣 Right column: Tooltip (Bar) Chart */}
              <div
                className={`${
                  showChat ? "w-full" : "w-4/7"
                } transition-all duration-500`}
              >
                <UserToolTipChart />
              </div>
            </div>
          </motion.div>

          {/* Investment Opportunities Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-[#3b3c44]"
                style={{ fontSize: "2rem", fontWeight: 700 }}
              >
                Investment Opportunities
              </h2>
            </div>

            {investmentsLoading ? (
              <p className="text-[#3b3c44] font-semibold">
                Loading investments...
              </p>
            ) : investmentsError ? (
              <p className="text-red-500 font-semibold">
                Error loading investments: {investmentsError}
              </p>
            ) : selectedUser && metrics?.riskProfile != null ? (
              <>
                {investments.filter(
                  (inv) =>
                    inv.risk_score?.toLowerCase() ===
                    metrics?.riskProfile?.toLowerCase()
                ).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {investments
                      .filter(
                        (inv) =>
                          inv.risk_score?.toLowerCase() ===
                          metrics?.riskProfile?.toLowerCase()
                      )
                      .map((inv, index) => (
                        <motion.div
                          key={inv.id || index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.5 + index * 0.1,
                          }}
                          whileHover={{
                            scale: 1.03,
                            y: -5,
                            boxShadow:
                              "0px 8px 20px rgba(251, 227, 4, 0.2), 0px 4px 10px rgba(0,0,0,0.1)",
                            transition: {
                              type: "spring",
                              stiffness: 160,
                              damping: 14,
                            },
                          }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-[#dfc9bc] hover:border-[#fbe304] cursor-pointer"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div
                                className="text-[#3b3c44]"
                                style={{ fontSize: "1.3rem", fontWeight: 700 }}
                              >
                                {inv.name}
                              </div>
                              <div
                                className="text-[#6c6e74]"
                                style={{ fontSize: "0.85rem" }}
                              >
                                {inv.category || "Investment Option"}
                              </div>
                            </div>

                            {/* 🧠 Compararea riscului */}
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                inv.risk_score?.toLowerCase() === "low"
                                  ? "bg-green-100 text-green-700"
                                  : inv.risk_score?.toLowerCase() === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              Risk {inv.risk_score}
                            </div>
                          </div>

                          {/* Return + Minimum amount */}
                          <div className="mb-4">
                            <div
                              className="text-[#6c6e74]"
                              style={{ fontSize: "1.4rem", fontWeight: 700 }}
                            >
                              {inv.investment}
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="text-[#6c6e74]"
                                style={{ fontSize: "0.8rem", fontWeight: 500 }}
                              >
                                Minimum Investment
                              </span>
                            </div>
                            <div className="w-full bg-[#dfc9bc] rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-[#f4d03f] to-[#f39c12] h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${riskWidth(inv.risk_score)}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="text-[#6c6e74] text-sm mt-2">
                            {inv.description || "No description provided."}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <p className="text-[#3b3c44] font-semibold">
                    No investments match this client's risk profile.
                  </p>
                )}
              </>
            ) : (
              <p className="text-[#3b3c44] font-semibold">
                Select a client to view tailored investment options.
              </p>
            )}
          </motion.div>
        </div>

        {/* Slide-in Chat on Desktop */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="hidden lg:block fixed top-0 right-0 h-[82%] mt-32 mr-16 w-1/3 z-40"
            >
              <ChatAI />
              <button
                onClick={() => setShowChat(false)}
                className="absolute top-4 right-4 text-[#fbe304] hover:text-white transition-colors text-2xl mr-4 mt-1 font-semibold"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen Chat on Mobile */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed lg:hidden top-0 left-0 w-full h-full bg-[#3b3c44] z-50"
          >
            <ChatAI />
            <button
              onClick={() => setShowChat(false)}
              className="absolute top-4 right-4 text-[#fbe304] hover:text-white transition-colors font-semibold"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <footer className="relative z-10 bg-[#3b3c44] text-[#dfc9bc] py-12 px-6 mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3
                className="text-[#fbe304] mb-4"
                style={{ fontWeight: 700, fontSize: "1.2rem" }}
              >
                <span className="text-white">Fin</span>AI
              </h3>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                Your AI-powered banking assistant for intelligent investing.
              </p>
            </div>

            <div>
              <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>
                Product
              </h4>
              <ul className="space-y-2" style={{ fontSize: "0.9rem" }}>
                <li>
                  <a
                    href="/dashboard"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="/chat"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    AI Chat
                  </a>
                </li>
                <li>
                  <a
                    href="/bank/dash/"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Banker Portal
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Analytics
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>
                Company
              </h4>
              <ul className="space-y-2" style={{ fontSize: "0.9rem" }}>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>
                Legal
              </h4>
              <ul className="space-y-2" style={{ fontSize: "0.9rem" }}>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#fbe304] transition-colors"
                  >
                    Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#6c6e74] pt-8 text-center">
            <p style={{ fontSize: "0.9rem" }}>
              © 2025 FinAI. All rights reserved. Built with AI-powered
              technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
