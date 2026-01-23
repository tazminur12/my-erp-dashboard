'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Search,
  User,
  Phone,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Loader2,
  MapPin,
  Building2
} from 'lucide-react';
import DashboardLayout from '../../component/DashboardLayout';
import Swal from 'sweetalert2';

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

const ReceivingList = () => {
  const router = useRouter();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [limit] = useState(20);
  const [loans, setLoans] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch loans
  useEffect(() => {
    const fetchLoans = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (search) {
          params.append('search', search);
        }
        
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }

        const response = await fetch(`/api/loans/receiving?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setLoans(data.loans || data.data || []);
          setPagination(data.pagination || {
            currentPage: page,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: limit
          });
        } else {
          throw new Error(data.error || 'Failed to fetch loans');
        }
      } catch (err) {
        console.error('Error fetching loans:', err);
        setError(err.message || 'Failed to load loans');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoans();
  }, [page, search, statusFilter, limit]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'overdue':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    const numericValue = Number(amount) || 0;
    const formatted = `৳${numericValue.toLocaleString('en-US')}`;
    return formatted.replace(/([৳\s])([\d,]+)/g, (match, symbol, numbers) => {
      return symbol + toBengaliNumeral(numbers);
    });
  };

  const handleViewLoan = (loan) => {
    const id = loan.loanId || loan._id || loan.id;
    router.push(`/loan/receiving/${id}`);
  };

  const handleNewLoan = () => {
    router.push('/loan/receiving/add');
  };

  const handleDeleteLoan = async (loan) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "আপনি এটি ফিরিয়ে আনতে পারবেন না!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল করুন'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      const id = loan.loanId || loan._id || loan.id;
      try {
        const response = await fetch(`/api/loans/receiving/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'ঋণ সফলভাবে মুছে ফেলা হয়েছে।',
            icon: 'success',
            confirmButtonColor: '#10B981',
          });
          // Refresh the list
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          if (search) params.append('search', search);
          if (statusFilter !== 'all') params.append('status', statusFilter);
          
          const refreshResponse = await fetch(`/api/loans/receiving?${params.toString()}`);
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok) {
            setLoans(refreshData.loans || refreshData.data || []);
            setPagination(refreshData.pagination || pagination);
          }
        } else {
          throw new Error(data.error || 'Failed to delete loan');
        }
      } catch (err) {
        console.error('Error deleting loan:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'ঋণ মুছে ফেলতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ফিরে যান</span>
            </button>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ঋণ গ্রহণ তালিকা</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">আপনার সকল গ্রহণকৃত ঋণের তালিকা</p>
                </div>
              </div>
              
              <button
                onClick={handleNewLoan}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                নতুন ঋণ আবেদন
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">মোট ঋণ</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{toBengaliNumeral(pagination.totalItems || loans.length)}</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">সক্রিয়</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {toBengaliNumeral(loans.filter(l => l.status === 'active').length)}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">সম্পন্ন</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {toBengaliNumeral(loans.filter(l => l.status === 'completed').length)}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">বিচারাধীন</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {toBengaliNumeral(loans.filter(l => l.status === 'pending').length)}
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ঋণ খুঁজুন (নাম, ID, ফোন, ব্যবসার নাম, ইত্যাদি)..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">সব স্ট্যাটাস</option>
                  <option value="active">সক্রিয়</option>
                  <option value="completed">সম্পন্ন</option>
                  <option value="pending">বিচারাধীন</option>
                  <option value="overdue">মেয়াদ উত্তীর্ণ</option>
                  <option value="rejected">প্রত্যাখ্যাত</option>
                </select>
              </div>

              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {toBengaliNumeral(pagination.totalItems || loans.length)} টি ঋণ পাওয়া গেছে
                </span>
              </div>
            </div>
          </div>

          {/* Loans Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400">ঋণ লোড করতে সমস্যা হয়েছে</p>
              </div>
            ) : loans.length === 0 ? (
              <div className="p-12 text-center">
                <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  কোন ঋণ পাওয়া যায়নি
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {search || statusFilter !== 'all' 
                    ? 'আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে চেষ্টা করুন'
                    : 'আপনার প্রথম ঋণ আবেদন করুন'
                  }
                </p>
                {!search && statusFilter === 'all' && (
                  <button
                    onClick={handleNewLoan}
                    className="mt-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    আপনার প্রথম ঋণ আবেদন করুন
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">নাম ও ঠিকানা</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ঋণের পরিমাণ</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">পরিশোধ</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">বকেয়া</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">কমিট্মেন্ট তারিখ</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">স্ট্যাটাস</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">কার্যক্রম</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {loans.map((loan) => {
                        const totalAmount = Number(loan.totalAmount || loan.amount || 0);
                        const paidAmount = Number(loan.paidAmount || 0);
                        const dueAmount = Number(loan.totalDue || loan.remainingAmount || Math.max(0, totalAmount - paidAmount));
                        
                        return (
                          <tr key={loan.loanId || loan._id || loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {(loan.fullName || loan.firstName || 'N').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => handleViewLoan(loan)}
                                    className="text-left text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline focus:outline-none"
                                  >
                                    {loan.fullName || `${loan.firstName || ''} ${loan.lastName || ''}`.trim() || 'N/A'}
                                  </button>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {loan.presentAddress || loan.permanentAddress || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(totalAmount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(paidAmount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                {formatCurrency(dueAmount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {loan.commitmentDate ? new Date(loan.commitmentDate).toLocaleDateString('bn-BD') : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                                {getStatusIcon(loan.status)}
                                {loan.status === 'active' ? 'সক্রিয়' : 
                                 loan.status === 'completed' ? 'সম্পন্ন' : 
                                 loan.status === 'overdue' ? 'মেয়াদ উত্তীর্ণ' : 
                                 loan.status === 'pending' ? 'বিচারাধীন' : 
                                 loan.status === 'rejected' ? 'প্রত্যাখ্যাত' : 
                                 loan.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleViewLoan(loan)}
                                  className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                  title="বিস্তারিত দেখুন"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLoan(loan)}
                                  disabled={isDeleting}
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      দেখানো হচ্ছে {toBengaliNumeral(((pagination.currentPage - 1) * pagination.itemsPerPage) + 1)} থেকে{' '}
                      {toBengaliNumeral(Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems))} পর্যন্ত, মোট{' '}
                      {toBengaliNumeral(pagination.totalItems)} টি ঋণ
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        পূর্ববর্তী
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            pageNum === pagination.currentPage
                              ? 'bg-purple-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {toBengaliNumeral(pageNum)}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        পরবর্তী
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReceivingList;
