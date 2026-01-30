'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../component/DashboardLayout';
import {
  Users,
  Building,
  Wallet,
  Calculator,
  Receipt,
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Home,
  PiggyBank,
  User,
  Package,
  Settings,
  UserCircle,
  Plus,
  List,
  DollarSign,
  Activity,
  Loader2,
  ShoppingCart,
  Plane,
  Building2,
  ChevronDown,
} from 'lucide-react';

const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount ?? 0);
  } catch {
    return `৳ ${Number(amount ?? 0).toLocaleString('bn-BD')}`;
  }
};


const businessModules = [
  {
    title: 'হজ্জ ও ওমরাহ ব্যবস্থাপনা',
    description: 'হাজী ব্যবস্থাপনা, প্যাকেজ এবং এজেন্ট ব্যবস্থাপনা',
    icon: Building,
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    iconColor: 'text-white',
    routes: [
      { name: 'হাজী তালিকা (হজ্জ)', path: '/hajj-umrah/hajj/haji-list', icon: List },
      { name: 'উমরাহ হাজী তালিকা', path: '/hajj-umrah/umrah/haji-list', icon: List },
      { name: 'এজেন্ট তালিকা', path: '/hajj-umrah/b2b-agent', icon: Users },
      { name: 'হজ প্যাকেজ', path: '/hajj-umrah/hajj/package-list', icon: Package },
      { name: 'ড্যাশবোর্ড', path: '/hajj-umrah/dashboard', icon: BarChart3 },
    ],
  },
  {
    title: 'এয়ার টিকেটিং',
    description: 'টিকেট বিক্রয়, এজেন্ট এবং বুকিং',
    icon: Plane,
    color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    iconColor: 'text-white',
    routes: [
      { name: 'নতুন টিকেট', path: '/air-ticketing/tickets/add', icon: Plus },
      { name: 'টিকেট তালিকা', path: '/air-ticketing/tickets', icon: List },
      { name: 'যাত্রী তালিকা', path: '/air-ticketing/passengers', icon: Users },
      { name: 'এজেন্ট', path: '/air-ticketing/agents', icon: Users },
      { name: 'ড্যাশবোর্ড', path: '/air-ticketing/old/dashboard', icon: BarChart3 },
    ],
  },
  {
    title: 'অ্যাকাউন্ট ব্যবস্থাপনা',
    description: 'ব্যাংক অ্যাকাউন্ট, বিনিয়োগ এবং সম্পদ',
    icon: Wallet,
    color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    iconColor: 'text-white',
    routes: [
      { name: 'ব্যাংক অ্যাকাউন্ট', path: '/account/bank-accounts', icon: Wallet },
      { name: 'বিনিয়োগ (IATA)', path: '/account/investments/iata-airlines-capping', icon: TrendingUp },
      { name: 'অন্যান্য বিনিয়োগ', path: '/account/investments/others-invest', icon: PiggyBank },
      { name: 'সম্পদ ব্যবস্থাপনা', path: '/account/asset-management', icon: Building },
    ],
  },
  {
    title: 'ঋণ ব্যবস্থাপনা',
    description: 'ঋণ প্রদান, ঋণ গ্রহণ এবং ট্র্যাকিং',
    icon: Calculator,
    color: 'bg-gradient-to-br from-red-500 to-pink-600',
    iconColor: 'text-white',
    routes: [
      { name: 'ড্যাশবোর্ড', path: '/loan/dashboard', icon: BarChart3 },
      { name: 'ঋণ গ্রহণ', path: '/loan/receiving-list', icon: TrendingUp },
      { name: 'ঋণ প্রদান', path: '/loan/giving-list', icon: TrendingDown },
    ],
  },
  {
    title: 'মিরাজ ইন্ডাস্ট্রিজ',
    description: 'গবাদি পশু, দুধ উৎপাদন এবং স্বাস্থ্য রেকর্ড',
    icon: Building,
    color: 'bg-gradient-to-br from-amber-500 to-yellow-600',
    iconColor: 'text-white',
    routes: [
      { name: 'গবাদি পশু ব্যবস্থাপনা', path: '/miraj-industries/cattle-management', icon: Users },
      { name: 'দুধ উৎপাদন', path: '/miraj-industries/milk-production', icon: TrendingUp },
      { name: 'স্বাস্থ্য রেকর্ড', path: '/miraj-industries/health-records', icon: Activity },
      { name: 'আয়-খরচ রিপোর্ট', path: '/miraj-industries/financial-report', icon: BarChart3 },
      { name: 'ড্যাশবোর্ড', path: '/miraj-industries/dashboard', icon: BarChart3 },
    ],
  },
  {
    title: 'অফিস ব্যবস্থাপনা',
    description: 'এইচআর, বেতন এবং কর্মচারী',
    icon: Home,
    color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    iconColor: 'text-white',
    routes: [
      { name: 'কর্মচারী তালিকা', path: '/office-management/hr/employee/list', icon: Users },
      { name: 'বেতন', path: '/office-management/hr/payroll', icon: Receipt },
      { name: 'অপারেটিং ব্যয়', path: '/office-management/operating-expenses', icon: DollarSign },
    ],
  },
  {
    title: 'মুদ্রা বিনিময়',
    description: 'মুদ্রা বিনিময় এবং রিজার্ভ',
    icon: Globe,
    color: 'bg-gradient-to-br from-rose-500 to-red-600',
    iconColor: 'text-white',
    routes: [
      { name: 'নতুন বিনিময়', path: '/money-exchange/new', icon: Plus },
      { name: 'তালিকা', path: '/money-exchange/list', icon: List },
      { name: 'ডিলার তালিকা', path: '/money-exchange/dealer-list', icon: List },
      { name: 'ড্যাশবোর্ড', path: '/money-exchange/dashboard', icon: BarChart3 },
    ],
  },
  {
    title: 'ভেন্ডর',
    description: 'ভেন্ডর এবং বিল ব্যবস্থাপনা',
    icon: ShoppingCart,
    color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    iconColor: 'text-white',
    routes: [
      { name: 'ভেন্ডর ড্যাশবোর্ড', path: '/vendors/dashboard', icon: BarChart3 },
      { name: 'ভেন্ডর তালিকা', path: '/vendors', icon: List },
      { name: 'বিল জেনারেট', path: '/vendors/bill', icon: Receipt },
    ],
  },
  {
    title: 'লেনদেন',
    description: 'ট্রানজেকশন এবং today লেনদেন',
    icon: Receipt,
    color: 'bg-gradient-to-br from-violet-500 to-purple-600',
    iconColor: 'text-white',
    routes: [
      { name: 'লেনদেন তালিকা', path: '/transactions', icon: List },
      { name: 'নতুন লেনদেন', path: '/transactions/new', icon: Plus },
      { name: 'আজকের লেনদেন', path: '/transactions/today', icon: Activity },
    ],
  },
  {
    title: 'সেটিংস ও প্রোফাইল',
    description: 'ব্যবহারকারী, শাখা এবং প্রোফাইল',
    icon: Settings,
    color: 'bg-gradient-to-br from-gray-500 to-slate-600',
    iconColor: 'text-white',
    routes: [
      { name: 'ব্যবহারকারী ব্যবস্থাপনা', path: '/settings/users', icon: Users },
      { name: 'শাখা ব্যবস্থাপনা', path: '/settings/branch', icon: Building },
      { name: 'প্রোফাইল', path: '/profile', icon: UserCircle },
    ],
  },
];

export default function ProfessionalDashboard() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opExpenseDue, setOpExpenseDue] = useState([]);
  const [opExpenseLoading, setOpExpenseLoading] = useState(false);
  const [opExpenseError, setOpExpenseError] = useState(null);
  
  // Branch selector state for super admin
  const [selectedBranchId, setSelectedBranchId] = useState('all');
  const [branchInfo, setBranchInfo] = useState(null);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  
  const nowDate = new Date();
  const isYearlyWindow = nowDate.getMonth() === 0;
  
  const sessionLoading = status === 'loading';
  const isSuperAdmin = session?.user?.role === 'super_admin';

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Single API call to unified dashboard endpoint with branch filter
      const branchParam = isSuperAdmin && selectedBranchId ? `?branchId=${selectedBranchId}` : '';
      const response = await fetch(`/api/dashboard${branchParam}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }

      // Store branch info for selector
      if (data.branchInfo) {
        setBranchInfo(data.branchInfo);
      }

      setDashboardData({
        overview: data.overview || {},
        grandTotals: {
          totalRevenue: data.grandTotals?.totalRevenue || 0,
          totalDue: Math.max(0, data.grandTotals?.totalDue || 0),
          totalAssets: data.grandTotals?.totalAssets || 0,
          totalAdvanceAmni: 0,
        },
        totalExpensesFromTransactions: data.grandTotals?.totalExpenses || 0,
        netProfitFromTransactions: data.grandTotals?.netProfit || 0,
        financial: data.financial || {},
        services: {
          exchanges: data.moneyExchange || {},
          packages: { total: 0, agentPackages: 0 },
          tickets: { total: 0, totalAmount: 0 },
        },
        hu: data.hu || {},
        cashAccount: data.cashAccount,
      });
    } catch (err) {
      setError(err);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin, selectedBranchId]);

  useEffect(() => {
    // Wait for session to be loaded before fetching dashboard data
    if (!sessionLoading) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, sessionLoading]);

  useEffect(() => {
    const fetchOperatingExpenses = async () => {
      try {
        setOpExpenseLoading(true);
        setOpExpenseError(null);
        const [catRes, txRes] = await Promise.all([
          fetch('/api/operating-expenses/categories'),
          fetch('/api/transactions?dateRange=month&limit=1000')
        ]);
        const catData = await catRes.json();
        const txData = await txRes.json();
        if (!catRes.ok) {
          throw new Error(catData.error || 'Failed to fetch operating expenses');
        }
        if (!txRes.ok) {
          throw new Error(txData.error || 'Failed to fetch transactions');
        }

        const categories = catData.categories || [];
        const txItems = txData.data || [];
        const paidByCategory = txItems.reduce((acc, tx) => {
          if (!tx.operatingExpenseCategoryId) return acc;
          const key = String(tx.operatingExpenseCategoryId);
          const amount = Number(tx.amount || 0);
          acc[key] = (acc[key] || 0) + amount;
          return acc;
        }, {});

        const dueItems = categories
          .filter((c) => (c.frequency === 'monthly' || (c.frequency === 'yearly' && isYearlyWindow)) && Number(c.monthlyAmount || 0) > 0)
          .map((c) => {
            const id = String(c.id || c._id);
            const expected = Number(c.monthlyAmount || 0);
            const paid = Number(paidByCategory[id] || 0);
            const dueAmount = Math.max(0, expected - paid);
            return {
              id,
              name: c.banglaName || c.name || 'Operating Expense',
              frequency: c.frequency,
              amount: expected,
              dueAmount,
            };
          })
          .filter((c) => c.dueAmount > 0);
        setOpExpenseDue(dueItems);
      } catch (err) {
        setOpExpenseError(err.message || 'Failed to load operating expenses');
      } finally {
        setOpExpenseLoading(false);
      }
    };

    fetchOperatingExpenses();
  }, [isYearlyWindow]);

  const grandTotals = dashboardData?.grandTotals ?? {};
  const financial = dashboardData?.financial ?? {};
  const services = dashboardData?.services ?? {};
  const overview = useMemo(
    () => ({
      totalUsers: dashboardData?.overview?.totalUsers ?? 0,
      totalCustomers: dashboardData?.overview?.totalCustomers ?? 0,
      totalAgents: dashboardData?.overview?.totalAgents ?? 0,
      totalVendors: dashboardData?.overview?.totalVendors ?? 0,
      totalBranches: dashboardData?.overview?.totalBranches ?? 0,
    }),
    [dashboardData?.overview]
  );
  const huOverview = dashboardData?.hu?.overview ?? {};
  const huProfitLoss = dashboardData?.hu?.profitLoss ?? {};
  const totalExpensesFromTransactions = dashboardData?.totalExpensesFromTransactions ?? 0;
  const netProfitFromTransactions = dashboardData?.netProfitFromTransactions ?? 0;
  const netProfitDisplay = Math.max(0, netProfitFromTransactions);

  const currentBalanceDisplay = useMemo(() => {
    const total = dashboardData?.financial?.bankAccounts?.totalBalance ?? dashboardData?.financial?.accounts?.totalBalance ?? 0;
    return `BDT ${Number(total).toLocaleString('bn-BD')}`;
  }, [dashboardData?.financial?.bankAccounts?.totalBalance, dashboardData?.financial?.accounts?.totalBalance]);

  // Show loading while session is being fetched
  if (sessionLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">ড্যাশবোর্ড ডাটা লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">ড্যাশবোর্ড ডাটা লোড করতে সমস্যা হয়েছে</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Branch Selector for Super Admin */}
        {isSuperAdmin && branchInfo?.availableBranches?.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  শাখা ফিল্টার:
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <span className="font-medium">
                    {selectedBranchId === 'all' 
                      ? 'সব শাখা' 
                      : branchInfo.availableBranches.find(b => b.id === selectedBranchId)?.branchName || 'শাখা নির্বাচন করুন'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showBranchDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showBranchDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {branchInfo.availableBranches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => {
                          setSelectedBranchId(branch.id);
                          setShowBranchDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          selectedBranchId === branch.id 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {branch.branchName || branch.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Grand Totals Summary */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  এক নজরে ব্যবসায়িক হালনাগাদ
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট আয়</p>
                    <p className="text-xl sm:text-2xl font-semibold text-green-600">
                      {formatCurrency(grandTotals.totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট ব্যয়</p>
                    <p className="text-xl sm:text-2xl font-semibold text-red-600">
                      {formatCurrency(totalExpensesFromTransactions)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট বকেয়া</p>
                    <p className="text-xl sm:text-2xl font-semibold text-orange-600">
                      {formatCurrency(grandTotals.totalDue)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট সম্পদ</p>
                    <p className="text-xl sm:text-2xl font-semibold text-blue-600">
                      {formatCurrency(grandTotals.totalAssets)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">নিট লাভ</p>
                    <p className="text-xl sm:text-2xl font-semibold text-green-600">
                      {formatCurrency(netProfitDisplay)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-auto lg:min-w-[260px]">
                <div className="bg-blue-600/95 dark:bg-blue-700/95 rounded-2xl p-5 shadow-xl">
                  <p className="text-sm font-medium text-blue-100">বর্তমান ব্যালেন্স (Cash)</p>
                  <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
                    {formatCurrency(dashboardData?.cashAccount?.currentBalance)}
                  </p>
                  <p className="mt-2 text-xs text-blue-100/80">
                    মূল ক্যাশ অ্যাকাউন্টের বর্তমান ব্যালেন্স
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {opExpenseDue.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-cyan-900/10 rounded-2xl shadow-sm border border-purple-200 dark:border-purple-800 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">অপারেটিং ব্যয় বাকি তালিকা</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    এই মাসে যেসব অপারেটিং ব্যয় বাকি আছে, সেগুলোর সারাংশ নিচে
                  </p>
                </div>
                <Link
                  href="/office-management/operating-expenses"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  অপারেটিং ব্যয় দেখুন
                </Link>
              </div>

              {opExpenseLoading ? (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  লোড হচ্ছে...
                </div>
              ) : opExpenseError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{opExpenseError}</p>
              ) : opExpenseDue.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">কোন বাকি অপারেটিং ব্যয় নেই।</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {opExpenseDue.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.frequency === 'yearly' ? 'বাৎসরিক' : 'মাসিক'}
                        </span>
                        <span className="font-semibold text-red-700 dark:text-red-300">
                          {formatCurrency(item.dueAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hajj & Umrah Summary */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              হজ্জ ও উমরাহ সারাংশ
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">মোট হাজি</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{huOverview.totalHaji ?? 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">মোট উমরাহ</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{huOverview.totalUmrah ?? 0}</p>
                </div>
                <User className="w-8 h-8 text-purple-500" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">মোট আয়</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(huProfitLoss?.combined?.totalRevenue)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">লাভ/ক্ষতি</p>
                  <p
                    className={`text-lg font-bold ${
                      huProfitLoss?.combined?.isProfit ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(huProfitLoss?.combined?.profitLoss)}
                  </p>
                </div>
                {huProfitLoss?.combined?.isProfit ? (
                  <TrendingUp className="w-8 h-8 text-green-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'মোট ব্যবহারকারী', value: overview.totalUsers, icon: Users, color: 'blue' },
              { label: 'মোট গ্রাহক (হাজী/উমরাহ)', value: overview.totalCustomers, icon: User, color: 'green' },
              { label: 'মোট এজেন্ট', value: overview.totalAgents, icon: Building, color: 'purple' },
              { label: 'মোট ভেন্ডর', value: overview.totalVendors, icon: ShoppingCart, color: 'orange' },
              { label: 'মোট শাখা', value: overview.totalBranches, icon: Home, color: 'indigo' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{item.value ?? 0}</p>
                    </div>
                    <div
                      className={`p-2 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/20`}
                      style={{
                        backgroundColor: `var(--tw-gradient-from)`,
                      }}
                    >
                      <Icon className={`h-5 w-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">আয়</h3>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">মোট আয়</span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(grandTotals.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ক্রেডিট</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(financial.transactions?.totalCredit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">বিনিময় বিক্রয়</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(services.exchanges?.sellAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ব্যয়</h3>
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">মোট ব্যয়</span>
                  <span className="text-lg font-semibold text-red-600">
                    {formatCurrency(totalExpensesFromTransactions)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ডেবিট</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(financial.transactions?.totalDebit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">বিনিময় ক্রয়</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(services.exchanges?.buyAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">নিট লাভ</h3>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">নিট লাভ</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(netProfitDisplay)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ট্রানজেকশন নেট</span>
                  <span
                    className={`text-sm font-medium ${
                      (financial.transactions?.netAmount ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(financial.transactions?.netAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">বিনিময় নেট</span>
                  <span
                    className={`text-sm font-medium ${
                      (services.exchanges?.netAmount ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(services.exchanges?.netAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Modules */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              ব্যবসায়িক মডিউল
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {businessModules.length} টি মডিউল
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {businessModules.map((module, index) => {
              const firstPath = module.routes[0]?.path ?? '#';
              return (
                <Link
                  key={index}
                  href={firstPath}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className={`${module.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-3">
                      <module.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                    <p className="text-white/90 text-sm">{module.description}</p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {module.routes.slice(0, 3).map((route, ri) => (
                        <div
                          key={ri}
                          className="flex items-center text-sm text-gray-600 dark:text-gray-300"
                        >
                          <route.icon className="h-4 w-4 mr-2 shrink-0" />
                          <span className="truncate">{route.name}</span>
                        </div>
                      ))}
                      {module.routes.length > 3 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                          +{module.routes.length - 3} আরও
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">দ্রুত কাজ</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/hajj-umrah/hajj/haji-list"
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Users className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">হাজী তালিকা</span>
              </Link>
              <Link
                href="/air-ticketing/tickets/add"
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Plane className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">নতুন টিকেট</span>
              </Link>
              <Link
                href="/transactions/new"
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Receipt className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">নতুন লেনদেন</span>
              </Link>
              <Link
                href="/money-exchange/new"
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Globe className="h-6 w-6 text-rose-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">মুদ্রা বিনিময়</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
