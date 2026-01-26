'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  UserCheck,
  AlertCircle,
  Loader2,
  Building2,
  Wallet,
  CheckCircle,
  Clock,
  FileCheck
} from 'lucide-react';

const HajjUmrahDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/hajj-umrah/dashboard');
        const data = await response.json();
        if (response.ok) {
          setDashboardData(data);
        } else {
          setError(new Error(data.message || 'Failed to fetch dashboard data'));
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '৳ ০';
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '০';
    return new Intl.NumberFormat('bn-BD').format(num);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">ড্যাশবোর্ড ডেটা লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <AlertCircle className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">ডেটা লোড করতে সমস্যা</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error.message || 'ড্যাশবোর্ড ডেটা লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { hajjStats, umrahStats, agentStats } = dashboardData || {};

  return (
    <DashboardLayout>
      <div className="space-y-8 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              হজ্জ ও উমরাহ ড্যাশবোর্ড
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              সামগ্রিক ব্যবস্থাপনা ও পরিসংখ্যান
            </p>
          </div>
        </div>

        {/* ==================== HAJJ SUMMARY SECTION ==================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Package className="w-6 h-6 mr-2 text-blue-600" />
              হজ্জ সারাংশ
            </h2>
            <Link href="/hajj-umrah/hajj/haji-list" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              বিস্তারিত দেখুন &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Hajis */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-medium">মোট হাজি</span>
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatNumber(hajjStats?.totalHajis || 0)}
              </p>
            </div>

            {/* Hajj Completed */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-600 dark:text-green-400 font-medium">হজ্ব সম্পন্ন</span>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatNumber(hajjStats?.completedHajis || 0)}
              </p>
            </div>

            {/* Pre-Registered */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">প্রাক নিবন্ধিত</span>
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {formatNumber(hajjStats?.preRegistered || 0)}
              </p>
            </div>

            {/* Registered */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-600 dark:text-purple-400 font-medium">নিবন্ধিত</span>
                <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {formatNumber(hajjStats?.registered || 0)}
              </p>
            </div>
          </div>

          {/* Hajj Financials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট প্যাকেজ রেট</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(hajjStats?.totalPackageAmount || 0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট জমা</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(hajjStats?.totalPaidAmount || 0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট বকেয়া</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(hajjStats?.totalDueAmount || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* ==================== UMRAH SUMMARY SECTION ==================== */}
        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <UserCheck className="w-6 h-6 mr-2 text-purple-600" />
              উমরাহ সারাংশ
            </h2>
            <Link href="/hajj-umrah/umrah/haji-list" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              বিস্তারিত দেখুন &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Umrahs */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-medium">মোট উমরাহ</span>
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatNumber(umrahStats?.totalUmrahs || 0)}
              </p>
            </div>

            {/* Umrah Completed */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-600 dark:text-green-400 font-medium">উমরাহ সম্পন্ন</span>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatNumber(umrahStats?.completedUmrahs || 0)}
              </p>
            </div>

            {/* Ready For Umrah */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-600 dark:text-purple-400 font-medium">রেডি ফর উমরাহ</span>
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {formatNumber(umrahStats?.readyForUmrah || 0)}
              </p>
            </div>
          </div>

          {/* Umrah Financials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট প্যাকেজ রেট</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(umrahStats?.totalPackageAmount || 0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট জমা</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(umrahStats?.totalPaidAmount || 0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট বকেয়া</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(umrahStats?.totalDueAmount || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* ==================== AGENT SUMMARY SECTION ==================== */}
        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-green-600" />
              এজেন্ট সারাংশ
            </h2>
            <Link href="/hajj-umrah/b2b-agent" className="text-sm text-green-600 hover:text-green-700 font-medium">
              বিস্তারিত দেখুন &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Agents */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-medium">মোট এজেন্ট</span>
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatNumber(agentStats?.totalAgents || 0)}
              </p>
            </div>

            {/* Agent Financials */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium">মোট পরিশোধ</span>
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(agentStats?.totalPaid || 0)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium">মোট বিল</span>
                <FileCheck className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(agentStats?.totalBill || 0)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium">মোট বকেয়া</span>
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(agentStats?.totalDue || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HajjUmrahDashboard;
