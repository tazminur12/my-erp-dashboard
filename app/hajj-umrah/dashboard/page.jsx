'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  TrendingUp, 
  MapPin,
  UserCheck,
  AlertCircle,
  BarChart3,
  Activity,
  Plus,
  Loader2,
  Building2,
  Wallet,
  Target,
  Award
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

  // Extract data from API response
  // Backend returns: { overview, profitLoss, agentProfitLoss, topAgentsByHaji, topDistricts, financialSummary }
  const overview = dashboardData?.overview || {};
  const profitLoss = dashboardData?.profitLoss || {};
  const agentProfitLoss = dashboardData?.agentProfitLoss || [];
  const topAgentsByHaji = dashboardData?.topAgentsByHaji || [];
  const topDistricts = dashboardData?.topDistricts || [];
  const financialSummary = dashboardData?.financialSummary || {};

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
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
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Link
              href="/hajj-umrah/package-creation"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">নতুন প্যাকেজ</span>
            </Link>
            <Link
              href="/hajj-umrah/agent/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">নতুন এজেন্ট</span>
            </Link>
          </div>
        </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট হাজি</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(overview.totalHaji || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট উমরাহ</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(overview.totalUmrah || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট এজেন্ট</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(overview.totalAgents || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট যাত্রী</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(overview.totalPilgrims || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== HAJJ SECTION ==================== */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">হজ্জ সেকশন</h2>
            <p className="text-blue-100 text-sm">হজ্জ সম্পর্কিত সকল তথ্য</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hajj Profit/Loss */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-blue-500 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              হজ্জ লাভ/ক্ষতি
            </h3>
            {profitLoss.hajj?.isProfit ? (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">লাভ</span>
            ) : (
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium rounded-full">ক্ষতি</span>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">মোট আয়:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(profitLoss.hajj?.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">মোট খরচ:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(profitLoss.hajj?.totalCost || 0)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">নিট লাভ/ক্ষতি:</span>
                <span className={`font-bold text-xl ${profitLoss.hajj?.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profitLoss.hajj?.profitLoss || 0)}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              প্যাকেজ সংখ্যা: {formatNumber(profitLoss.hajj?.packageCount || 0)}
            </div>
          </div>
        </div>

        {/* Hajj Financial Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-blue-500 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-blue-600" />
            হাজি আর্থিক সারাংশ
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">মোট পরিমাণ:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(financialSummary.haji?.totalAmount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">মোট প্রদত্ত:</span>
              <span className="font-semibold text-green-600">{formatCurrency(financialSummary.haji?.totalPaid || 0)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">মোট বকেয়া:</span>
                <span className="font-bold text-xl text-red-600">{formatCurrency(financialSummary.haji?.totalDue || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== UMRAH SECTION ==================== */}
      <div className="bg-purple-600 rounded-xl p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">উমরাহ সেকশন</h2>
            <p className="text-purple-100 text-sm">উমরাহ সম্পর্কিত সকল তথ্য</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Umrah Profit/Loss */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-purple-500 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              উমরাহ লাভ/ক্ষতি
            </h3>
            {profitLoss.umrah?.isProfit ? (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">লাভ</span>
            ) : (
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium rounded-full">ক্ষতি</span>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">মোট আয়:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(profitLoss.umrah?.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">মোট খরচ:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(profitLoss.umrah?.totalCost || 0)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">নিট লাভ/ক্ষতি:</span>
                <span className={`font-bold text-xl ${profitLoss.umrah?.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profitLoss.umrah?.profitLoss || 0)}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              প্যাকেজ সংখ্যা: {formatNumber(profitLoss.umrah?.packageCount || 0)}
            </div>
          </div>
        </div>

        {/* Umrah Financial Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-purple-500 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-purple-600" />
            উমরাহ আর্থিক সারাংশ
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">মোট পরিমাণ:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(financialSummary.umrah?.totalAmount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">মোট প্রদত্ত:</span>
              <span className="font-semibold text-green-600">{formatCurrency(financialSummary.umrah?.totalPaid || 0)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">মোট বকেয়া:</span>
                <span className="font-bold text-xl text-red-600">{formatCurrency(financialSummary.umrah?.totalDue || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== AGENT SECTION ==================== */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">এজেন্ট সেকশন</h2>
            <p className="text-green-100 text-sm">এজেন্ট সম্পর্কিত সকল তথ্য</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Financial Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-green-500 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-green-600" />
            এজেন্ট আর্থিক সারাংশ
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">মোট বকেয়া:</span>
              <span className="font-bold text-xl text-red-600">{formatCurrency(financialSummary.agents?.totalDue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">হজ্জ বকেয়া:</span>
              <span className="font-semibold text-orange-600">{formatCurrency(financialSummary.agents?.hajDue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">উমরাহ বকেয়া:</span>
              <span className="font-semibold text-purple-600">{formatCurrency(financialSummary.agents?.umrahDue || 0)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">মোট এডভান্স:</span>
                <span className={`font-bold text-xl ${
                  (agentProfitLoss.reduce((sum, agent) => sum + (agent.totalAdvance || 0), 0)) >= 0 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}>
                  {formatCurrency(agentProfitLoss.reduce((sum, agent) => sum + (agent.totalAdvance || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Profit/Loss */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-green-500 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              সামগ্রিক লাভ/ক্ষতি
            </h3>
            {profitLoss.combined?.isProfit ? (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">লাভ</span>
            ) : (
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium rounded-full">ক্ষতি</span>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">মোট আয়:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(profitLoss.combined?.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">মোট খরচ:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(profitLoss.combined?.totalCost || 0)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">নিট লাভ/ক্ষতি:</span>
                <span className={`font-bold text-xl ${profitLoss.combined?.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profitLoss.combined?.profitLoss || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Agents by Haji */}
      {topAgentsByHaji.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2 text-green-600" />
            হাজি সংখ্যা অনুযায়ী শীর্ষ এজেন্ট
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topAgentsByHaji.slice(0, 9).map((agent, index) => (
              <div key={agent.agentId || index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{agent.agentName || 'Unknown'}</h3>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">মোট হাজি</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatNumber(agent.hajiCount || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Profit/Loss Table */}
      {agentProfitLoss.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            এজেন্ট অনুযায়ী লাভ/ক্ষতি
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-green-50 dark:bg-green-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    এজেন্ট নাম
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    মোট আয়
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    মোট খরচ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    লাভ/ক্ষতি
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    এডভান্স
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    প্যাকেজ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {agentProfitLoss.slice(0, 10).map((agent, index) => (
                  <tr key={agent.agentId || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-3">
                          <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {agent.agentName || 'Unknown'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(agent.totalRevenue || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(agent.totalCost || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${(agent.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(agent.profitLoss || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${(agent.totalAdvance || 0) >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {formatCurrency(agent.totalAdvance || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatNumber(agent.packageCount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Districts */}
      {topDistricts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-purple-600" />
            জেলা অনুযায়ী শীর্ষ স্থান
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topDistricts.slice(0, 12).map((district, index) => (
              <div key={district.district || index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-purple-600 mr-2" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{district.district || 'Unknown'}</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">হাজি:</span>
                    <span className="text-sm font-semibold text-blue-600">{formatNumber(district.hajiCount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">উমরাহ:</span>
                    <span className="text-sm font-semibold text-purple-600">{formatNumber(district.umrahCount || 0)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">মোট:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{formatNumber(district.totalCount || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-600" />
          দ্রুত অ্যাকশন
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/hajj-umrah/agent"
            className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">এজেন্ট তালিকা</span>
          </Link>
          
          <Link
            href="/hajj-umrah/package-list"
            className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
            <span className="text-purple-700 dark:text-purple-300 font-medium">প্যাকেজ তালিকা</span>
          </Link>
          
          <Link
            href="/hajj-umrah/agent/add"
            className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <Plus className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
            <span className="text-green-700 dark:text-green-300 font-medium">নতুন এজেন্ট</span>
          </Link>
          
          <Link
            href="/hajj-umrah/package-creation"
            className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <Plus className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3" />
            <span className="text-orange-700 dark:text-orange-300 font-medium">নতুন প্যাকেজ</span>
          </Link>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default HajjUmrahDashboard;
