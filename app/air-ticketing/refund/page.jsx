'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  RotateCcw,
  Loader2,
  Filter,
  RefreshCw,
  User,
  Ticket,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import Swal from 'sweetalert2';

const RefundList = () => {
  const router = useRouter();
  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [pagination, setPagination] = useState({});

  const fetchRefunds = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);

      const response = await fetch(`/api/air-ticketing/refund?${params.toString()}`);
      const result = await response.json();

      if (response.ok) {
        setRefunds(result.data || []);
        setPagination(result.pagination || {});
      } else {
        throw new Error(result.error || 'Failed to fetch records');
      }
    } catch (error) {
      console.error('Error fetching Refund records:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ডাটা লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchRefunds();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter]);

  const handleDelete = async (record) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `টিকেট নং "${record.ticketNumber}" এর রিফান্ড মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/air-ticketing/refund/${record._id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'রিফান্ড সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981'
          });
          fetchRefunds();
        } else {
          throw new Error(data.error || 'Delete failed');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'রিফান্ড মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444'
        });
      }
    }
  };

  // Stats calculation
  const stats = useMemo(() => ({
    total: refunds.length,
    pending: refunds.filter(r => r.status === 'Pending').length,
    processed: refunds.filter(r => r.status === 'Processed').length,
    totalAmount: refunds.reduce((sum, r) => sum + (r.refundAmount || 0), 0)
  }), [refunds]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Processed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">সম্পন্ন</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">বাতিল</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">অপেক্ষমান</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <RotateCcw className="w-8 h-8 text-indigo-600" />
                Air Ticket Refund
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                এয়ার টিকেট রিফান্ড ম্যানেজমেন্ট সিস্টেম
              </p>
            </div>
            <Link
              href="/air-ticketing/refund/add"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              নতুন রিফান্ড
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট রিফান্ড</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <RotateCcw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অপেক্ষমান</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">সম্পন্ন</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.processed}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট টাকার পরিমাণ</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">৳{stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="টিকেট নং, PNR, যাত্রীর নাম..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="All">সব স্ট্যাটাস</option>
                  <option value="Pending">অপেক্ষমান</option>
                  <option value="Processed">সম্পন্ন</option>
                  <option value="Rejected">বাতিল</option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchRefunds}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="রিফ্রেশ"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Refund List Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">ডাটা লোড হচ্ছে...</p>
            </div>
          ) : refunds.length === 0 ? (
            <div className="p-12 text-center">
              <RotateCcw className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">কোনো রিফান্ড রেকর্ড পাওয়া যায়নি</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                নতুন রিফান্ড রিকোয়েস্ট তৈরি করতে উপরের বোতামে ক্লিক করুন
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">তারিখ</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">টিকেট তথ্য</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">যাত্রী ও কাস্টমার</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">পরিমাণ</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">স্ট্যাটাস</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {refunds.map((refund) => (
                    <tr key={refund._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {new Date(refund.refundDate).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <Ticket className="w-3 h-3 text-indigo-500" />
                            {refund.ticketNumber}
                          </span>
                          {refund.pnr && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              PNR: {refund.pnr}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="w-3 h-3 text-gray-400" />
                            {refund.passengerName}
                          </span>
                          {refund.customerName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Client: {refund.customerName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white">
                            ৳{refund.refundAmount.toLocaleString()}
                          </span>
                          {refund.serviceCharge > 0 && (
                            <span className="text-xs text-red-500 mt-0.5">
                              Charge: -৳{refund.serviceCharge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(refund.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/air-ticketing/refund/${refund._id}/edit`}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(refund)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        {!isLoading && refunds.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            মোট {pagination.total || refunds.length} টি রেকর্ড দেখানো হচ্ছে
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RefundList;
