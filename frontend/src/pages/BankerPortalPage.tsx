import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Users, Receipt, BarChart3, ArrowUpDown, TrendingUp, Home } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  portfolio: string;
  risk: 'Low' | 'Moderate' | 'High';
  lastActivity: string;
}

interface Transaction {
  id: string;
  customer: string;
  amount: string;
  date: string;
  type: 'Deposit' | 'Withdrawal';
}

const topCustomers: Customer[] = [
  { id: 1, name: 'John Doe', portfolio: '$482,350', risk: 'Moderate', lastActivity: '2 hours ago' },
  { id: 2, name: 'Sarah Johnson', portfolio: '$395,200', risk: 'Low', lastActivity: '5 hours ago' },
  { id: 3, name: 'Michael Chen', portfolio: '$287,450', risk: 'High', lastActivity: '1 day ago' },
  { id: 4, name: 'Emily Rodriguez', portfolio: '$256,800', risk: 'Moderate', lastActivity: '3 hours ago' },
  { id: 5, name: 'David Kim', portfolio: '$234,670', risk: 'Low', lastActivity: '6 hours ago' },
  { id: 6, name: 'Lisa Anderson', portfolio: '$198,320', risk: 'High', lastActivity: '4 hours ago' },
  { id: 7, name: 'Robert Taylor', portfolio: '$187,950', risk: 'Moderate', lastActivity: '8 hours ago' },
  { id: 8, name: 'Jennifer Lee', portfolio: '$165,430', risk: 'Low', lastActivity: '2 days ago' },
  { id: 9, name: 'James Wilson', portfolio: '$142,890', risk: 'High', lastActivity: '1 day ago' },
  { id: 10, name: 'Maria Garcia', portfolio: '$128,760', risk: 'Moderate', lastActivity: '12 hours ago' },
];

const recentTransactions: Transaction[] = [
  { id: 'TX-1001', customer: 'John Doe', amount: '$12,500', date: '2025-11-01', type: 'Deposit' },
  { id: 'TX-1002', customer: 'Sarah Johnson', amount: '$8,200', date: '2025-11-01', type: 'Withdrawal' },
  { id: 'TX-1003', customer: 'Michael Chen', amount: '$25,000', date: '2025-10-31', type: 'Deposit' },
  { id: 'TX-1004', customer: 'Emily Rodriguez', amount: '$5,400', date: '2025-10-31', type: 'Withdrawal' },
  { id: 'TX-1005', customer: 'David Kim', amount: '$15,800', date: '2025-10-31', type: 'Deposit' },
  { id: 'TX-1006', customer: 'Lisa Anderson', amount: '$9,300', date: '2025-10-30', type: 'Deposit' },
  { id: 'TX-1007', customer: 'Robert Taylor', amount: '$6,750', date: '2025-10-30', type: 'Withdrawal' },
  { id: 'TX-1008', customer: 'Jennifer Lee', amount: '$11,200', date: '2025-10-30', type: 'Deposit' },
];

export default function BankerPortalPage() {
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-600 bg-green-100';
      case 'Moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'High':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex h-screen bg-[#3b3c44]">
      {/* Sidebar */}
      <div className="w-64 bg-[#2a2b31] flex flex-col border-r-2 border-[#fbe304]">
        <div className="p-6 border-b border-[#6c6e74]">
          <h1 className="text-[#fbe304]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <span className='text-white'>Fin</span>AI
          </h1>
          <p className="text-[#dfc9bc]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            Banker Portal
          </p>
        </div>

        <nav className="flex-1 p-4">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-[#fbe304] bg-[#6c6e74]/30 rounded-lg mb-2"
            style={{ fontWeight: 600 }}
          >
            <BarChart3 size={20} />
            Overview
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-[#dfc9bc] hover:text-[#fbe304] hover:bg-[#6c6e74]/30 rounded-lg transition-all mb-2"
            style={{ fontWeight: 600 }}
          >
            <Users size={20} />
            Customers
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-[#dfc9bc] hover:text-[#fbe304] hover:bg-[#6c6e74]/30 rounded-lg transition-all mb-2"
            style={{ fontWeight: 600 }}
          >
            <Receipt size={20} />
            Transactions
          </button>
        </nav>

        <div className="p-4 border-t border-[#6c6e74]">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#dfc9bc] hover:text-[#fbe304] rounded-lg transition-all"
            style={{ fontWeight: 600 }}
          >
            <Home size={20} />
            Exit Portal
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-[#2a2b31] px-8 py-6 border-b-2 border-[#fbe304]">
          <h2 className="text-white mb-2" style={{ fontSize: '2rem', fontWeight: 700 }}>
            Banker Dashboard
          </h2>
          <p className="text-[#dfc9bc]" style={{ fontSize: '1rem' }}>
            Monitor top customers and recent transactions
          </p>
        </div>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#fbe304] to-[#f8eb4c] rounded-2xl p-6 shadow-xl"
            >
              <div className="text-[#3b3c44]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                Total Customers
              </div>
              <div className="text-[#3b3c44] mt-2" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                10,247
              </div>
              <div className="text-[#928915] mt-1" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                +124 this month
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-[#928915] to-[#6c6e74] rounded-2xl p-6 shadow-xl text-white"
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Total Portfolio Value</div>
              <div className="mt-2" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                $2.4B
              </div>
              <div className="text-[#f8eb4c] mt-1 flex items-center gap-1" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                <TrendingUp size={16} />
                +8.5% growth
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-[#6c6e74] to-[#3b3c44] rounded-2xl p-6 shadow-xl text-white"
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active Transactions</div>
              <div className="mt-2" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                1,842
              </div>
              <div className="text-[#fbe304] mt-1" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                Last 24 hours
              </div>
            </motion.div>
          </div>

          {/* Top 10 Customers Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#2a2b31] rounded-2xl p-6 mb-8 shadow-xl border border-[#6c6e74]"
          >
            <h3 className="text-[#fbe304] mb-6" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              Top 10 Customers
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#6c6e74]">
                    <th className="text-left py-4 px-4 text-[#fbe304]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      <button onClick={() => handleSort('name')} className="flex items-center gap-2">
                        Name <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="text-left py-4 px-4 text-[#fbe304]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      <button onClick={() => handleSort('portfolio')} className="flex items-center gap-2">
                        Portfolio Value <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="text-left py-4 px-4 text-[#fbe304]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      <button onClick={() => handleSort('risk')} className="flex items-center gap-2">
                        Risk Level <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="text-left py-4 px-4 text-[#fbe304]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                      className={`border-b border-[#6c6e74]/30 hover:bg-[#6c6e74]/20 transition-colors ${
                        index < 3 ? 'bg-[#fbe304]/5' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {index < 3 && (
                            <div className="w-6 h-6 rounded-full bg-[#fbe304] flex items-center justify-center" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                              {index + 1}
                            </div>
                          )}
                          <span className="text-white" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                            {customer.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#fbe304]" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        {customer.portfolio}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full ${getRiskColor(customer.risk)}`} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {customer.risk}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#dfc9bc]" style={{ fontSize: '0.9rem' }}>
                        {customer.lastActivity}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Transactions Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-[#2a2b31] rounded-2xl p-6 shadow-xl border border-[#6c6e74]"
          >
            <h3 className="text-[#fbe304] mb-6" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              Recent Transactions
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#6c6e74]">
                    <th className="text-left py-4 px-4 text-[#fbe304]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Transaction ID
                    </th>
                    <th className="text-left py-4 px-4 text-[#fbe304]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Customer
                    </th>
                    <th className="text-left py-4 px-4 text-[#fbe304]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Amount
                    </th>
                    <th className="text-left py-4 px-4 text-[#fbe304]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Date
                    </th>
                    <th className="text-left py-4 px-4 text-[#fbe304]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
                      className="border-b border-[#6c6e74]/30 hover:bg-[#6c6e74]/20 transition-colors"
                    >
                      <td className="py-4 px-4 text-[#dfc9bc]" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        {transaction.id}
                      </td>
                      <td className="py-4 px-4 text-white" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                        {transaction.customer}
                      </td>
                      <td className="py-4 px-4 text-[#fbe304]" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                        {transaction.amount}
                      </td>
                      <td className="py-4 px-4 text-[#dfc9bc]" style={{ fontSize: '0.9rem' }}>
                        {transaction.date}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full ${
                            transaction.type === 'Deposit'
                              ? 'text-green-600 bg-green-100'
                              : 'text-orange-600 bg-orange-100'
                          }`}
                          style={{ fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          {transaction.type}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
