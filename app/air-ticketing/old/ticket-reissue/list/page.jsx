'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../../component/DashboardLayout';
import { 
  RotateCcw, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Plane,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  MoreVertical,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

const OldTicketReissueList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Data states
  const [reissues, setReissues] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });

  // Fetch old ticket reissues
  useEffect(() => {
    const fetchReissues = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (searchTerm) {
          params.append('q', searchTerm);
        }

        const response = await fetch(`/api/old-ticket-reissue?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setReissues(data.reissues || data.data || []);
          setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, limit: 20 });
        } else {
          throw new Error(data.error || 'Failed to fetch old ticket reissues');
        }
      } catch (error) {
        console.error('Error fetching old ticket reissues:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'পুরাতন টিকেট রিইস্যু লোড করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        setReissues([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReissues();
  }, [page, searchTerm]);

  // Calculate stats
  const completedReissues = reissues;
  const totalRevenue = useMemo(() => 
    completedReissues.reduce((sum, r) => sum + (r.totalContractAmount || 0), 0),
    [completedReissues]
  );
  const totalProfit = useMemo(() => 
    completedReissues.reduce((sum, r) => sum + (r.profit || 0), 0),
    [completedReissues]
  );

  const stats = useMemo(() => [
    { label: 'মোট রিইস্যু', value: pagination.total || reissues.length, color: 'blue', icon: RotateCcw },
    { label: 'সম্পন্ন', value: completedReissues.length, color: 'green', icon: CheckCircle },
    { label: 'মোট আয়', value: `৳${(totalRevenue / 1000).toFixed(0)}K`, color: 'purple', icon: DollarSign },
    { label: 'মোট লাভ', value: `৳${(totalProfit / 1000).toFixed(0)}K`, color: 'orange', icon: TrendingUp }
  ], [reissues, completedReissues, totalRevenue, totalProfit, pagination.total]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই টিকেট রিইস্যু মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/old-ticket-reissue/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'টিকেট রিইস্যু সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          
          // Refetch reissues
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          
          if (searchTerm) {
            params.append('q', searchTerm);
          }

          const refreshResponse = await fetch(`/api/old-ticket-reissue?${params.toString()}`);
          const refreshData = await refreshResponse.json();

          if (refreshResponse.ok) {
            setReissues(refreshData.reissues || refreshData.data || []);
            setPagination(refreshData.pagination || { page: 1, totalPages: 1, total: 0, limit: 20 });
          }
        } else {
          throw new Error(data.error || 'Failed to delete reissue');
        }
      } catch (error) {
        console.error('Failed to delete reissue:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error?.message || 'টিকেট রিইস্যু মুছতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleRefetch = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (searchTerm) {
        params.append('q', searchTerm);
      }

      const response = await fetch(`/api/old-ticket-reissue?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setReissues(data.reissues || data.data || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, limit: 20 });
      } else {
        throw new Error(data.error || 'Failed to fetch old ticket reissues');
      }
    } catch (error) {
      console.error('Error fetching old ticket reissues:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'পুরাতন টিকেট রিইস্যু লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount) => `৳${(amount || 0).toLocaleString()}`;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">পুরাতন টিকেট রিইস্যু</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  সকল টিকেট রিইস্যু রিকোয়েস্ট ব্যবস্থাপনা এবং ট্র্যাক করুন
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/air-ticketing/old/ticket-reissue')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন রিইস্যু যোগ করুন
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                placeholder="যাত্রীর নাম, PNR, এয়ারলাইন দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <button 
              onClick={handleRefetch}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4" />
              আরও ফিল্টার
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              এক্সপোর্ট
            </button>
          </div>
        </div>

        {/* Reissues List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">রিইস্যু লোড হচ্ছে...</span>
            </div>
          ) : reissues.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">কোন পুরাতন টিকেট রিইস্যু পাওয়া যায়নি</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'আপনার অনুসন্ধানের সাথে কোন ফলাফল মিলেনি।' : 'নতুন টিকেট রিইস্যু তৈরি করে শুরু করুন।'}
              </p>
              <button
                onClick={() => router.push('/air-ticketing/old/ticket-reissue')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                নতুন রিইস্যু যোগ করুন
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">তারিখ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">যাত্রী</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ফ্লাইট বিবরণ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">তারিখ পরিবর্তন</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ভেন্ডর</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">আর্থিক</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">অফিসার</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">কার্যক্রম</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reissues.map((reissue) => (
                      <tr key={reissue._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(reissue.formDate)}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {reissue.passengerFullName || `${reissue.firstName} ${reissue.lastName}`}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {reissue.contactNo}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                              <Plane className="w-3 h-3" />
                              {reissue.airlineName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {reissue.route || `${reissue.origin} → ${reissue.destination}`}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {reissue.airlinesPnr}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-500 dark:text-gray-400 line-through text-xs">
                              {formatDate(reissue.oldDate)}
                            </div>
                            <div className="text-gray-900 dark:text-white font-medium">
                              {formatDate(reissue.newDate)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-white">{reissue.reissueVendorName || 'N/A'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatCurrency(reissue.vendorAmount)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-white font-semibold">
                              {formatCurrency(reissue.totalContractAmount)}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <ArrowUpRight className="w-3 h-3" />
                              {formatCurrency(reissue.profit)} profit
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {reissue.reservationOfficerName || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => router.push(`/air-ticketing/old/ticket-reissue/${reissue._id}`)}
                              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(reissue._id)}
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    দেখানো হচ্ছে <span className="font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{((pagination.page - 1) * pagination.limit) + 1}</span> থেকে <span className="font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{Math.min(pagination.page * pagination.limit, pagination.total)}</span>, মোট <span className="font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{pagination.total}</span> টি
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      পূর্ববর্তী
                    </button>
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded text-sm font-english ${
                            pagination.page === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          style={{ fontFamily: "'Google Sans', sans-serif" }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button 
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      পরবর্তী
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default OldTicketReissueList;
