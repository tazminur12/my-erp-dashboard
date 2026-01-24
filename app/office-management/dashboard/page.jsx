'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Briefcase,
  Plus,
  List,
  CalendarDays,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

const quickActions = [
  { label: 'কর্মচারী তালিকা', href: '/office-management/hr/employee/list', icon: List },
  { label: 'নতুন কর্মচারী', href: '/office-management/hr/employee/add', icon: Plus },
  { label: 'অপারেটিং খরচ', href: '/office-management/operating-expenses', icon: Receipt },
  { label: 'খরচ যোগ করুন', href: '/office-management/operating-expenses/add', icon: Plus },
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

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/office-management/dashboard');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || 'ড্যাশবোর্ড ডেটা লোড করা যায়নি');
        }
        setDashboardData(data);
      } catch (err) {
        console.error('Office management dashboard fetch error:', err);
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
        title: 'মোট কর্মচারী',
        value: toBengaliNumeral(summary.totalEmployees ?? 0),
        subtitle: `একটিভ ${toBengaliNumeral(summary.activeEmployees ?? 0)}`,
        icon: Users,
        accent: 'text-sky-600',
        bg: 'bg-sky-100 dark:bg-sky-900/20',
      },
      {
        title: 'এই মাসের বেতন',
        value: formatCurrency(summary.monthlyPayroll ?? 0),
        subtitle: 'পে-রোল খরচ',
        icon: Briefcase,
        accent: 'text-indigo-600',
        bg: 'bg-indigo-100 dark:bg-indigo-900/20',
      },
      {
        title: 'অপারেটিং খরচ',
        value: formatCurrency(summary.operatingExpenseTotal ?? 0),
        subtitle: 'মোট খরচ',
        icon: Receipt,
        accent: 'text-rose-600',
        bg: 'bg-rose-100 dark:bg-rose-900/20',
      },
    ];
  }, [dashboardData]);

  const alerts = useMemo(() => dashboardData?.alerts || [], [dashboardData]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-r from-slate-600 to-sky-600 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  অফিস ম্যানেজমেন্ট ড্যাশবোর্ড
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  HR ও অপারেটিং ব্যয়ের সারাংশ
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

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <BarChart3 className="w-5 h-5 text-sky-600" />
              </div>
              <div className="space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-sky-600" />
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">অ্যালার্টস</h2>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.title}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{alert.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{alert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
