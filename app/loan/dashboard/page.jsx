'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import {
  LayoutDashboard,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2
} from 'lucide-react';

// Convert Arabic numerals to Bengali numerals
const toBengaliNumeral = (num) => {
  if (num === null || num === undefined || num === '...') return num;
  
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const numStr = String(num);
  
  if (numStr.includes(',')) {
    return numStr.split(',').map(part => {
      return part.split('').map(char => {
        if (char >= '0' && char <= '9') {
          return bengaliDigits[parseInt(char)];
        }
        return char;
      }).join('');
    }).join(',');
  }
  
  return numStr.split('').map(char => {
    if (char >= '0' && char <= '9') {
      return bengaliDigits[parseInt(char)];
    }
    return char;
  }).join('');
};

const formatCurrency = (amount) => {
  const numericValue = Number(amount) || 0;
  const formatted = `৳${numericValue.toLocaleString('en-US')}`;
  return formatted.replace(/([৳\s])([\d,]+)/g, (match, symbol, numbers) => {
    return symbol + toBengaliNumeral(numbers);
  });
};

const StatCard = ({ label, value, icon: Icon, color = 'indigo', sub, trend, isLoading }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    slate: 'bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
          {isLoading ? (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="mt-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate" title={String(value)}>
                {value}
              </h3>
              {sub && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{sub}</p>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color] || colors.indigo} transition-transform group-hover:scale-110 duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
          <span>{Math.abs(trend)}%</span>
          <span className="text-gray-400 font-normal ml-1">গত মাসের চেয়ে</span>
        </div>
      )}
    </div>
  );
};

const LoanDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('monthly');

  const getDateRange = (range) => {
    const now = new Date();
    const from = new Date(now);
    const to = new Date(now);

    if (range === 'day') {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
    } else if (range === 'monthly') {
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      to.setMonth(to.getMonth() + 1);
      to.setDate(0);
      to.setHours(23, 59, 59, 999);
    } else if (range === 'yearly') {
      from.setMonth(0);
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      to.setMonth(11);
      to.setDate(31);
      to.setHours(23, 59, 59, 999);
    }
    return { from: from.toISOString(), to: to.toISOString() };
  };

  const fetchDashboardData = async () => {
    try {
      const { from, to } = getDateRange(timeRange);
      const url = `/api/loans/dashboard?fromDate=${from}&toDate=${to}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to fetch dashboard data');
      }

      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'ড্যাশবোর্ড ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const totals = data?.totals || { totalLoans: 0, active: 0, pending: 0, closed: 0, rejected: 0 };
  
  const givingFinancial = data?.giving?.financial || {
    totalAmount: 0,
    paidAmount: 0,
    totalDue: 0,
    disbursed: 0,
    repaid: 0,
    netCashFlow: 0
  };
  
  const receivingFinancial = data?.receiving?.financial || {
    totalAmount: 0,
    paidAmount: 0,
    totalDue: 0,
    taken: 0,
    repaid: 0,
    netCashFlow: 0
  };

  const transactions = data?.transactions || { 
    totalTransactions: 0, 
    totalDebit: 0, 
    totalCredit: 0, 
    netCashflow: 0, 
    byDirection: [] 
  };

  const translateDirection = (direction) => {
    if (!direction) return 'অজানা';
    if (direction.toLowerCase() === 'giving') return 'ঋণ প্রদান';
    if (direction.toLowerCase() === 'receiving') return 'ঋণ গ্রহণ';
    return direction;
  };

  const givingBalance = (givingFinancial.totalAmount || 0) - (givingFinancial.paidAmount || 0);
  const receivingBalance = (receivingFinancial.totalAmount || 0) - (receivingFinancial.paidAmount || 0);
  const totalBalance = givingBalance - receivingBalance;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">লোন ড্যাশবোর্ড</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">ভলিউম ও প্রফিট/লস সারসংক্ষেপ</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm cursor-pointer"
                >
                  <option value="day">আজকের</option>
                  <option value="monthly">এই মাসের</option>
                  <option value="yearly">এই বছরের</option>
                </select>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">রিফ্রেশ</span>
                </button>
              </div>
            </div>


          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            <StatCard
              label="মোট লোন"
              value={isLoading ? '...' : toBengaliNumeral(totals.totalLoans?.toLocaleString())}
              icon={Calculator}
              sub={`সক্রিয়: ${toBengaliNumeral(totals.active || 0)}`}
              color="indigo"
              isLoading={isLoading}
            />
            <StatCard
              label="মোট ঋণ গ্রহণ"
              value={isLoading ? '...' : formatCurrency(receivingFinancial.taken || 0)}
              icon={ArrowDownRight}
              color="green"
              isLoading={isLoading}
            />
            <StatCard
              label="মোট ঋণ প্রদান"
              value={isLoading ? '...' : formatCurrency(givingFinancial.disbursed || 0)}
              icon={ArrowUpRight}
              color="blue"
              isLoading={isLoading}
            />
            <StatCard
              label="গ্রহীত ঋণ পরিশোধ"
              value={isLoading ? '...' : formatCurrency(receivingFinancial.repaid || 0)}
              icon={CheckCircle}
              color="purple"
              isLoading={isLoading}
            />
            <StatCard
              label="প্রদত্ত ঋণ আদায়"
              value={isLoading ? '...' : formatCurrency(givingFinancial.repaid || 0)}
              icon={CheckCircle}
              color="amber"
              isLoading={isLoading}
            />
          </div>

          {/* Balance Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">প্রদত্ত ঋণ ব্যালেন্স</p>
                  {isLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className={`text-2xl font-bold truncate ${givingBalance >= 0 ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500'}`} title={formatCurrency(Math.abs(givingBalance))}>
                        {formatCurrency(Math.abs(givingBalance))}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {givingBalance >= 0 ? 'বকেয়া' : 'অতিরিক্ত পরিশোধ'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 transition-transform group-hover:scale-110 duration-200">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">গ্রহীত ঋণ ব্যালেন্স</p>
                  {isLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className={`text-2xl font-bold truncate ${receivingBalance >= 0 ? 'text-red-600 dark:text-red-500' : 'text-emerald-600 dark:text-emerald-500'}`} title={formatCurrency(Math.abs(receivingBalance))}>
                        {formatCurrency(Math.abs(receivingBalance))}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {receivingBalance >= 0 ? 'বকেয়া' : 'অতিরিক্ত পরিশোধ'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 transition-transform group-hover:scale-110 duration-200">
                  <ArrowDownRight className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">নেট ব্যালেন্স</p>
                  {isLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className={`text-2xl font-bold truncate ${totalBalance >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`} title={formatCurrency(Math.abs(totalBalance))}>
                        {totalBalance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalBalance))}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {totalBalance >= 0 ? 'নিট পাওনা' : 'নিট দেনা'}
                      </p>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${totalBalance >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'} transition-transform group-hover:scale-110 duration-200`}>
                  <Calculator className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">লেনদেন সারসংক্ষেপ</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">সম্পন্ন লোন লেনদেন</p>
                </div>
              </div>
            </div>

            {/* Transaction Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">মোট ট্রানজেকশন</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : toBengaliNumeral(transactions.totalTransactions?.toLocaleString())}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-xs text-red-700 dark:text-red-400 mb-1">টোটাল ডেবিট</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {isLoading ? '...' : formatCurrency(transactions.totalDebit || 0)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-xs text-green-700 dark:text-green-400 mb-1">টোটাল ক্রেডিট</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {isLoading ? '...' : formatCurrency(transactions.totalCredit || 0)}
                </p>
              </div>
              <div className={`rounded-lg p-4 ${transactions.netCashflow >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <p className={`text-xs mb-1 ${transactions.netCashflow >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  নেট ক্যাশফ্লো
                </p>
                <p className={`text-xl font-bold ${transactions.netCashflow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isLoading ? '...' : `${transactions.netCashflow >= 0 ? '+' : '-'}${formatCurrency(Math.abs(transactions.netCashflow || 0))}`}
                </p>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="pb-3 pr-4 font-semibold text-gray-700 dark:text-gray-300">ডিরেকশন</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-700 dark:text-gray-300">কাউন্ট</th>
                    <th className="pb-3 pr-4 text-right font-semibold text-gray-700 dark:text-gray-300">ডেবিট</th>
                    <th className="pb-3 pr-4 text-right font-semibold text-gray-700 dark:text-gray-300">ক্রেডিট</th>
                    <th className="pb-3 pr-4 text-right font-semibold text-gray-700 dark:text-gray-300">নেট</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                      </td>
                    </tr>
                  ) : (transactions.byDirection || []).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500 dark:text-gray-400">
                        কোন ট্রানজেকশন নেই
                      </td>
                    </tr>
                  ) : (
                    transactions.byDirection.map((row, index) => (
                      <tr key={row.loanDirection || index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-4 pr-4 font-medium text-gray-900 dark:text-white">
                          {translateDirection(row.loanDirection)}
                        </td>
                        <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">
                          {toBengaliNumeral(row.count?.toLocaleString())}
                        </td>
                        <td className="py-4 pr-4 text-right font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(row.totalDebit || 0)}
                        </td>
                        <td className="py-4 pr-4 text-right font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(row.totalCredit || 0)}
                        </td>
                        <td className={`py-4 pr-4 text-right font-bold ${row.netCashflow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {row.netCashflow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(row.netCashflow || 0))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LoanDashboard;
