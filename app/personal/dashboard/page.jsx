'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import {
  LayoutDashboard,
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Users,
  Home,
  Plus,
  BarChart3,
  CalendarDays,
} from 'lucide-react';

const quickActions = [
  { label: 'নতুন খরচ যোগ', href: '/personal/expense/add', icon: Plus },
  { label: 'খরচ তালিকা', href: '/personal/expense', icon: Wallet },
  { label: 'ফ্যামিলি এসেট', href: '/personal/family-assets', icon: Home },
];

const toBengaliNumeral = (value) => {
  if (value === null || value === undefined) return '';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(value).replace(/\d/g, (digit) => bengaliDigits[Number(digit)]);
};

const formatCurrency = (amount) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
  return toBengaliNumeral(formatted);
};

const formatDateLabel = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return toBengaliNumeral(date.toLocaleDateString('bn-BD'));
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/personal/dashboard');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || 'ড্যাশবোর্ড ডেটা লোড করা যায়নি');
        }
        setDashboardData(data);
      } catch (err) {
        console.error('Personal dashboard fetch error:', err);
        setError(err.message || 'ড্যাশবোর্ড ডেটা লোড করা যায়নি');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const summaryCards = useMemo(() => {
    const summary = dashboardData?.summary || {};
    return [
      {
        title: 'মাসিক খরচ',
        value: formatCurrency(summary.monthlyExpense ?? 0),
        subtitle: 'গত ৩০ দিন',
        icon: TrendingDown,
        accent: 'text-rose-600',
        bg: 'bg-rose-100 dark:bg-rose-900/20',
      },
      {
        title: 'পার্সোনাল প্রোফাইল',
        value: toBengaliNumeral(summary.totalProfiles ?? 0),
        subtitle: 'মোট প্রোফাইল',
        icon: Users,
        accent: 'text-emerald-600',
        bg: 'bg-emerald-100 dark:bg-emerald-900/20',
      },
      {
        title: 'মোট এসেট',
        value: formatCurrency(summary.totalAssets ?? 0),
        subtitle: 'ফ্যামিলি এসেট',
        icon: Home,
        accent: 'text-orange-600',
        bg: 'bg-orange-100 dark:bg-orange-900/20',
      },
    ];
  }, [dashboardData]);

  const recentExpenses = useMemo(
    () => dashboardData?.recentExpenses || [],
    [dashboardData]
  );

  const budgetInsights = useMemo(() => {
    const palette = ['bg-indigo-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500'];
    return (dashboardData?.budgetInsights || []).map((item, index) => ({
      ...item,
      color: palette[index % palette.length],
    }));
  }, [dashboardData]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  পার্সোনাল ড্যাশবোর্ড
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  ব্যক্তিগত আয়-ব্যয়ের সারাংশ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg">
              <CalendarDays className="w-4 h-4" />
              শেষ আপডেট: {loading ? 'লোড হচ্ছে' : 'আজ'}
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 text-sm text-red-600 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {card.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.subtitle}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.bg}`}>
                      <Icon className={`w-6 h-6 ${card.accent}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">কুইক অ্যাকশন</h2>
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-emerald-600" />
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">সাম্প্রতিক খরচ</h2>
                <Link href="/personal/expense" className="text-sm text-emerald-600 hover:text-emerald-700">
                  সব দেখুন
                </Link>
              </div>
              <div className="space-y-4">
                {recentExpenses.map((item) => (
                  <div
                    key={item.id || item.title}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.title || 'ব্যয়'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.category || 'অন্যান্য'} · {formatDateLabel(item.date)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-rose-600">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">বাজেট ইনসাইট</h2>
              <Wallet className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {budgetInsights.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  বাজেট ইনসাইট এখনো পাওয়া যায়নি
                </div>
              ) : budgetInsights.map((item) => (
                <div key={item.label} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {toBengaliNumeral(item.value)}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
