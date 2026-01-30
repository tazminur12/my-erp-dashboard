'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import {
  LayoutDashboard,
  Ticket,
  Users,
  UserCheck,
  Plane,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  Route,
  Building2,
  BadgeCheck,
} from 'lucide-react';

const quickActions = [
  { label: 'নতুন টিকিট', href: '/air-ticketing/tickets/add', icon: Ticket },
  { label: 'টিকিট তালিকা', href: '/air-ticketing/tickets', icon: BadgeCheck },
  { label: 'প্যাসেঞ্জার', href: '/air-ticketing/passengers', icon: Users },
  { label: 'এজেন্ট', href: '/air-ticketing/agents', icon: UserCheck },
  { label: 'এয়ারলাইন', href: '/settings/inventory/airline', icon: Building2 },
  { label: 'টিকিট চেক', href: '/air-ticketing/ticket-check', icon: Plane },
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

const formatTimeAgo = (value) => {
  if (!value) return 'কিছুক্ষণ আগে';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'কিছুক্ষণ আগে';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'এইমাত্র';
  if (diffMinutes < 60) return `${toBengaliNumeral(diffMinutes)} মিনিট আগে`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${toBengaliNumeral(diffHours)} ঘন্টা আগে`;
  const diffDays = Math.floor(diffHours / 24);
  return `${toBengaliNumeral(diffDays)} দিন আগে`;
};

const formatStatusLabel = (status) => {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('issue') || normalized === 'issued') return 'ইস্যু হয়েছে';
  if (normalized === 'completed') return 'সম্পন্ন';
  if (normalized === 'cancelled' || normalized === 'canceled') return 'বাতিল';
  return 'পেন্ডিং';
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/air-ticketing/dashboard');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'ড্যাশবোর্ড ডেটা লোড করা যায়নি');
      }
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Air ticketing dashboard fetch error:', err);
      setError(err.message || 'ড্যাশবোর্ড ডেটা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const summaryCards = useMemo(() => {
    const summary = dashboardData?.summary || {};
    return [
      {
        title: 'আজকের টিকিট',
        value: toBengaliNumeral(summary.ticketsToday ?? 0),
        icon: Ticket,
        accent: 'text-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900/20',
      },
      {
        title: 'প্যাসেঞ্জার',
        value: toBengaliNumeral(summary.totalPassengers ?? 0),
        icon: Users,
        accent: 'text-emerald-600',
        bg: 'bg-emerald-100 dark:bg-emerald-900/20',
      },
      {
        title: 'এক্টিভ এজেন্ট',
        value: toBengaliNumeral(summary.activeAgents ?? 0),
        icon: UserCheck,
        accent: 'text-orange-600',
        bg: 'bg-orange-100 dark:bg-orange-900/20',
      },
      {
        title: 'মাসিক রেভিনিউ',
        value: formatCurrency(summary.monthlyRevenue ?? 0),
        icon: BarChart3,
        accent: 'text-purple-600',
        bg: 'bg-purple-100 dark:bg-purple-900/20',
      },
    ];
  }, [dashboardData]);

  const recentTickets = useMemo(
    () => dashboardData?.recentTickets || [],
    [dashboardData]
  );

  const topRoutes = useMemo(() => dashboardData?.topRoutes || [], [dashboardData]);

  const alerts = useMemo(() => {
    const counts = dashboardData?.counts || {};
    const items = [];
    if ((counts.ticketChecks || 0) > 0) {
      items.push({
        title: 'টিকিট চেক বাকি',
        description: `${toBengaliNumeral(counts.ticketChecks)}টি টিকিট চেক রিকোয়েস্ট আছে।`,
        type: 'warning',
      });
    }
    if ((counts.oldReissues || 0) > 0) {
      items.push({
        title: 'রিইস্যু টিকিট',
        description: `${toBengaliNumeral(counts.oldReissues)}টি রিইস্যু টিকিট প্রসেসিং দরকার।`,
        type: 'info',
      });
    }
    if (items.length === 0) {
      items.push({
        title: 'সব ঠিক আছে',
        description: 'আজকের জন্য কোনো জরুরি টাস্ক নেই।',
        type: 'info',
      });
    }
    return items;
  }, [dashboardData]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-r from-sky-600 to-indigo-600 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  এয়ার টিকিটিং ড্যাশবোর্ড
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  দৈনিক অপারেশন ও বিক্রয় সারাংশ
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                সর্বশেষ আপডেট: {lastUpdated ? formatTimeAgo(lastUpdated) : 'লোড হচ্ছে'}
              </div>
              <button
                onClick={fetchDashboard}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-60"
              >
                রিফ্রেশ
              </button>
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
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.bg}`}>
                      <Icon className={`w-6 h-6 ${card.accent}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    {loading ? 'আপডেট হচ্ছে...' : 'রিয়েল টাইম ডেটা'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">কুইক অ্যাকশন</h2>
                <Plane className="w-5 h-5 text-sky-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="group flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-sky-600 group-hover:text-sky-500" />
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">সাম্প্রতিক টিকিট</h2>
                <Link href="/air-ticketing/tickets" className="text-sm text-sky-600 hover:text-sky-700">
                  সব দেখুন
                </Link>
              </div>
              <div className="space-y-4">
                {loading && recentTickets.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">লোড হচ্ছে...</div>
                ) : recentTickets.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">কোনো টিকিট পাওয়া যায়নি</div>
                ) : recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {ticket.passenger} · {ticket.route}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ticket.id} · {ticket.airline}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        formatStatusLabel(ticket.status) === 'ইস্যু হয়েছে'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}>
                        {formatStatusLabel(ticket.status)}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(ticket.amount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(ticket.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">টপ রুট</h2>
                <Route className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="space-y-3">
                {topRoutes.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">কোনো ডেটা পাওয়া যায়নি</div>
                ) : topRoutes.map((item) => (
                  <div key={item.route} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.route}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {toBengaliNumeral(item.volume)} টিকিট
                      </p>
                    </div>
                    {item.change ? (
                      <span className={`text-xs font-semibold ${
                        item.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.change}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">অ্যালার্টস ও টাস্ক</h2>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.title}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      alert.type === 'warning'
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300'
                    }`}>
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
