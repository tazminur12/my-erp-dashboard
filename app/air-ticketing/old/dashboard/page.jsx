'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  LayoutDashboard,
  FileCheck,
  RotateCcw,
  DollarSign,
  TrendingUp,
  Users,
  Plane,
  Plus,
  ArrowRight,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Calendar
} from 'lucide-react';

export default function OldTicketingDashboard() {
  const router = useRouter();
  
  // Loading states
  const [isLoadingTicketChecks, setIsLoadingTicketChecks] = useState(true);
  const [isLoadingReissues, setIsLoadingReissues] = useState(true);
  
  // Data states
  const [ticketChecksData, setTicketChecksData] = useState(null);
  const [reissuesData, setReissuesData] = useState(null);

  // Fetch ticket checks statistics
  useEffect(() => {
    const fetchTicketChecks = async () => {
      setIsLoadingTicketChecks(true);
      try {
        const response = await fetch('/api/ticket-checks?limit=1000');
        const data = await response.json();
        if (response.ok) {
          setTicketChecksData(data);
        }
      } catch (error) {
        console.error('Error fetching ticket checks:', error);
      } finally {
        setIsLoadingTicketChecks(false);
      }
    };
    fetchTicketChecks();
  }, []);

  // Fetch old ticket reissues statistics
  useEffect(() => {
    const fetchReissues = async () => {
      setIsLoadingReissues(true);
      try {
        const response = await fetch('/api/old-ticket-reissue?limit=1000');
        const data = await response.json();
        if (response.ok) {
          setReissuesData(data);
        }
      } catch (error) {
        console.error('Error fetching reissues:', error);
      } finally {
        setIsLoadingReissues(false);
      }
    };
    fetchReissues();
  }, []);

  // Calculate statistics
  const ticketChecks = ticketChecksData?.ticketChecks || ticketChecksData?.data || [];
  const reissues = reissuesData?.reissues || reissuesData?.data || [];

  const ticketCheckStats = useMemo(() => {
    const total = ticketChecks.length;
    const completed = ticketChecks.filter(tc => tc.status === 'completed' || tc.status === 'Completed').length;
    const pending = ticketChecks.filter(tc => tc.status === 'pending' || tc.status === 'Pending').length;
    const totalRevenue = ticketChecks.reduce((sum, tc) => sum + (parseFloat(tc.serviceCharge) || 0), 0);
    const totalProfit = ticketChecks.reduce((sum, tc) => sum + (parseFloat(tc.profit) || 0), 0);

    return {
      total,
      completed,
      pending,
      totalRevenue,
      totalProfit
    };
  }, [ticketChecks]);

  const reissueStats = useMemo(() => {
    const total = reissues.length;
    const completed = reissues.filter(r => r.status === 'completed' || r.status === 'Completed').length;
    const pending = reissues.filter(r => r.status === 'pending' || r.status === 'Pending').length;
    const totalRevenue = reissues.reduce((sum, r) => sum + (parseFloat(r.totalContractAmount) || 0), 0);
    const totalProfit = reissues.reduce((sum, r) => sum + (parseFloat(r.profit) || 0), 0);

    return {
      total,
      completed,
      pending,
      totalRevenue,
      totalProfit
    };
  }, [reissues]);

  const overallStats = useMemo(() => {
    return {
      totalTicketChecks: ticketCheckStats.total,
      totalReissues: reissueStats.total,
      totalRevenue: ticketCheckStats.totalRevenue + reissueStats.totalRevenue,
      totalProfit: ticketCheckStats.totalProfit + reissueStats.totalProfit
    };
  }, [ticketCheckStats, reissueStats]);

  const formatCurrency = (amount) => `৳${(amount || 0).toLocaleString('bn-BD')}`;

  const isLoading = isLoadingTicketChecks || isLoadingReissues;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">পুরাতন টিকেটিং সার্ভিস ড্যাশবোর্ড</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  পুরাতন টিকেটিং সার্ভিসের সার্বিক পরিসংখ্যান ও তথ্য
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">ডেটা লোড হচ্ছে...</span>
          </div>
        ) : (
          <>
            {/* Overall Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">মোট টিকেট চেক</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      {overallStats.totalTicketChecks}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">মোট রিইস্যু</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      {overallStats.totalReissues}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">মোট আয়</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      {formatCurrency(overallStats.totalRevenue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">মোট লাভ</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      {formatCurrency(overallStats.totalProfit)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Checks Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">টিকেট চেক</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">টিকেট চেকের পরিসংখ্যান</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/air-ticketing/ticket-check/list')}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  সব দেখুন
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">মোট</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {ticketCheckStats.total}
                      </p>
                    </div>
                    <FileCheck className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">সম্পন্ন</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {ticketCheckStats.completed}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">বাকি</p>
                      <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {ticketCheckStats.pending}
                      </p>
                    </div>
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">মোট আয়</p>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {formatCurrency(ticketCheckStats.totalRevenue)}
                      </p>
                    </div>
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Old Ticket Reissues Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">পুরাতন টিকেট রিইস্যু</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">পুরাতন টিকেট রিইস্যুর পরিসংখ্যান</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/air-ticketing/old/ticket-reissue/list')}
                  className="flex items-center gap-2 px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                >
                  সব দেখুন
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">মোট</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {reissueStats.total}
                      </p>
                    </div>
                    <RotateCcw className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">সম্পন্ন</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {reissueStats.completed}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">বাকি</p>
                      <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {reissueStats.pending}
                      </p>
                    </div>
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">মোট আয়</p>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {formatCurrency(reissueStats.totalRevenue)}
                      </p>
                    </div>
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-2">নতুন টিকেট চেক</h3>
                    <p className="text-blue-100 text-sm mb-4">নতুন টিকেট চেক রিকোয়েস্ট তৈরি করুন</p>
                    <button
                      onClick={() => router.push('/air-ticketing/tickets/check')}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      নতুন টিকেট চেক
                    </button>
                  </div>
                  <FileCheck className="w-16 h-16 text-blue-200 opacity-50" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-2">নতুন রিইস্যু</h3>
                    <p className="text-purple-100 text-sm mb-4">পুরাতন টিকেট রিইস্যু রিকোয়েস্ট তৈরি করুন</p>
                    <button
                      onClick={() => router.push('/air-ticketing/old/ticket-reissue')}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      নতুন রিইস্যু
                    </button>
                  </div>
                  <RotateCcw className="w-16 h-16 text-purple-200 opacity-50" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
