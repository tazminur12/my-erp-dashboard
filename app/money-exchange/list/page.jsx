'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  History,
  Search,
  Download,
  Trash2,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Plus,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import Swal from 'sweetalert2';

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

const List = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [dashboardSummary, setDashboardSummary] = useState({
    totalRealizedProfitLoss: 0,
    totalUnrealizedProfitLoss: 0,
    totalPurchaseCost: 0,
    totalSaleRevenue: 0,
    totalCurrentReserveValue: 0,
    totalCurrencies: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const filters = useMemo(() => {
    const f = {
      page,
      limit: pageSize,
    };
    if (filterType !== 'all') {
      f.type = filterType === 'receive' ? 'Buy' : 'Sell';
    }
    if (filterCurrency !== 'all') {
      f.currencyCode = filterCurrency;
    }
    if (fromDate) {
      f.dateFrom = fromDate;
    }
    if (toDate) {
      f.dateTo = toDate;
    }
    if (searchTerm) {
      f.search = searchTerm;
    }
    return f;
  }, [page, pageSize, filterType, filterCurrency, fromDate, toDate, searchTerm]);

  const dashboardFilters = useMemo(() => {
    const f = {};
    if (filterCurrency !== 'all') {
      f.currencyCode = filterCurrency;
    }
    if (fromDate) {
      f.fromDate = fromDate;
    }
    if (toDate) {
      f.toDate = toDate;
    }
    return f;
  }, [filterCurrency, fromDate, toDate]);

  useEffect(() => {
    const fetchExchanges = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value);
          }
        });

        const response = await fetch(`/api/money-exchange?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setTransactions(data.exchanges || data.data || []);
          setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
        }
      } catch (err) {
        console.error('Error fetching exchanges:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchanges();
  }, [filters]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const params = new URLSearchParams();
        Object.entries(dashboardFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value);
          }
        });

        const response = await fetch(`/api/money-exchange/dashboard?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setDashboardSummary(data.summary || dashboardSummary);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      }
    };

    fetchDashboard();
  }, [dashboardFilters]);

  const formatCurrency = (amount, currency) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
    return toBengaliNumeral(formatted);
  };

  const formatNumber = (value, minimumFractionDigits = 2, maximumFractionDigits = 2) => {
    const numericValue = Number.isFinite(value) ? value : Number(value);
    if (!Number.isFinite(numericValue)) {
      return minimumFractionDigits > 0 ? toBengaliNumeral(`0.${'0'.repeat(minimumFractionDigits)}`) : '০';
    }
    const formatted = numericValue.toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
    });
    return toBengaliNumeral(formatted);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'Buy' ? 
      <ArrowDownCircle className="w-5 h-5 text-green-600 dark:text-green-400" /> : 
      <ArrowUpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
  };

  const transformedTransactions = useMemo(() => {
    return transactions.map((t) => ({
      id: t.id || t._id,
      type: t.type === 'Buy' ? 'receive' : 'give',
      fromCurrency: t.currencyCode,
      toCurrency: 'BDT',
      amount: t.quantity,
      rate: t.exchangeRate,
      total: t.amount_bdt,
      date: t.date,
      time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
      status: t.isActive !== false ? 'completed' : 'cancelled',
      customer: t.fullName,
      reference: t.id || t._id,
      phone: t.mobileNumber,
    }));
  }, [transactions]);

  const totalReceive = transformedTransactions
    .filter(t => t.type === 'receive' && t.status === 'completed')
    .reduce((sum, t) => sum + t.total, 0);

  const totalGive = transformedTransactions
    .filter(t => t.type === 'give' && t.status === 'completed')
    .reduce((sum, t) => sum + t.total, 0);

  const handleSelectTransaction = (id) => {
    setSelectedTransactions(prev => 
      prev.includes(id) 
        ? prev.filter(transactionId => transactionId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === transformedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transformedTransactions.map(t => t.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTransactions.length === 0) return;
    
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `আপনি ${selectedTransactions.length}টি লেনদেন মুছে ফেলতে যাচ্ছেন।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        await Promise.all(selectedTransactions.map(id => 
          fetch(`/api/money-exchange/${id}`, { method: 'DELETE' })
        ));
        setSelectedTransactions([]);
        // Refresh
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value);
          }
        });
        const response = await fetch(`/api/money-exchange?${params.toString()}`);
        const data = await response.json();
        if (response.ok) {
          setTransactions(data.exchanges || data.data || []);
          setPagination(data.pagination || pagination);
        }
        Swal.fire({
          title: 'সফল!',
          text: `${selectedTransactions.length}টি লেনদেন মুছে ফেলা হয়েছে`,
          icon: 'success',
          confirmButtonColor: '#10B981',
        });
      } catch (error) {
        console.error('Failed to delete transactions:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'লেনদেন মুছে ফেলতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteSingle = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/money-exchange/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'লেনদেন মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonColor: '#10B981',
          });
          // Refresh
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
              params.append(key, value);
            }
          });
          const refreshResponse = await fetch(`/api/money-exchange?${params.toString()}`);
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok) {
            setTransactions(refreshData.exchanges || refreshData.data || []);
            setPagination(refreshData.pagination || pagination);
          }
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'লেনদেন মুছে ফেলতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const handleExport = () => {
    const headers = ['Date', 'Txn ID', 'Type', 'Currency From', 'Currency To', 'Rate', 'Quantity', 'Amount (BDT)'];
    const rows = transformedTransactions.map((t) => [
      t.date,
      t.reference,
      t.type === 'receive' ? 'Buy' : 'Sell',
      t.fromCurrency,
      t.toCurrency,
      t.rate,
      t.amount,
      t.total,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `exchange_list_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalPages = pagination.pages || 1;
  const currentPage = pagination.page || 1;
  const paged = transformedTransactions;

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCurrency('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ফিরে যান</span>
            </button>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
                <History className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                লেনদেন তালিকা
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                মুদ্রা বিনিময়ের সমস্ত লেনদেন দেখুন এবং পরিচালনা করুন
              </p>
              <button
                onClick={() => router.push('/money-exchange/new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>নতুন লেনদেন</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">মোট গ্রহণ</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 truncate">
                    {formatCurrency(totalReceive, 'BDT')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">মোট প্রদান</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 truncate">
                    {formatCurrency(totalGive, 'BDT')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">লাভ/ক্ষতি (রিয়েলাইজড)</p>
                  <p
                    className={`text-2xl font-bold mt-1 truncate ${
                      dashboardSummary.totalRealizedProfitLoss >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatCurrency(dashboardSummary.totalRealizedProfitLoss, 'BDT')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">মোট লেনদেন</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">
                    {toBengaliNumeral(pagination.total || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">খুঁজুন</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="গ্রাহক / ভাউচার / ফোন"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ধরণ</label>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">সব</option>
                  <option value="receive">ক্রয় (Buy)</option>
                  <option value="give">বিক্রয় (Sell)</option>
                </select>
              </div>
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">কারেন্সি</label>
                <select
                  value={filterCurrency}
                  onChange={(e) => {
                    setFilterCurrency(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">সব</option>
                  {['USD','EUR','GBP','SAR','AED','QAR','KWD','OMR','JPY','AUD','CAD','CHF','CNY','INR','PKR','SGD','THB','MYR'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">শুরু</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">শেষ</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                <button 
                  onClick={resetFilters} 
                  className="w-full px-3 sm:px-4 py-2 text-sm border rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  রিসেট
                </button>
              </div>

              <div className="sm:col-span-2 lg:col-span-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">সারি</label>
                  <select
                    className="px-2 py-1.5 text-xs sm:text-sm border rounded-md dark:bg-gray-700 dark:text-white"
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  >
                    {[5,10,20,50].map((n) => <option key={n} value={n}>{toBengaliNumeral(n)}</option>)}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedTransactions.length > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      disabled={isDeleting}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">মুছে ফেলুন ({selectedTransactions.length})</span>
                      <span className="sm:hidden">মুছে ফেলুন</span>
                    </button>
                  )}
                  <button
                    onClick={handleExport}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">CSV এক্সপোর্ট</span>
                    <span className="sm:hidden">এক্সপোর্ট</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">লোড হচ্ছে...</p>
                </div>
              ) : paged.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  কোন লেনদেন পাওয়া যায়নি
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paged.map((transaction) => (
                    <div key={transaction.id} className="p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(transaction.id)}
                            onChange={() => handleSelectTransaction(transaction.id)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 mt-1"
                          />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getTypeIcon(transaction.type === 'receive' ? 'Buy' : 'Sell')}
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {transaction.type === 'receive' ? 'ক্রয় (Buy)' : 'বিক্রয় (Sell)'}
                            </span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">
                            {transaction.status === 'completed' ? 'সম্পন্ন' : 
                             transaction.status === 'pending' ? 'মুলতবি' : 'বাতিল'}
                          </span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">গ্রাহক</p>
                          <p className="font-medium text-gray-900 dark:text-white truncate">{transaction.customer}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">মুদ্রা</p>
                          <p className="font-medium text-gray-900 dark:text-white">{transaction.fromCurrency} → {transaction.toCurrency}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">পরিমাণ</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatNumber(transaction.amount)} {transaction.fromCurrency}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">হার</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatNumber(transaction.rate, 4, 4)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">মোট</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(transaction.total, 'BDT')}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">তারিখ</p>
                          <p className="text-sm text-gray-900 dark:text-white">{transaction.date} {transaction.time}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button 
                          onClick={() => router.push(`/money-exchange/details/${transaction.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="বিবরণ দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => router.push(`/money-exchange/edit/${transaction.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="সম্পাদনা করুন"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSingle(transaction.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 xl:px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.length === transformedTransactions.length && transformedTransactions.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      ধরন
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      গ্রাহক
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      মুদ্রা
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      পরিমাণ
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      হার
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      মোট
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      স্ট্যাটাস
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      তারিখ
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      কাজ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">লোড হচ্ছে...</p>
                      </td>
                    </tr>
                  ) : paged.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        কোন লেনদেন পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    paged.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 xl:px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(transaction.id)}
                            onChange={() => handleSelectTransaction(transaction.id)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(transaction.type === 'receive' ? 'Buy' : 'Sell')}
                            <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                              {transaction.type === 'receive' ? 'ক্রয় (Buy)' : 'বিক্রয় (Sell)'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {transaction.customer}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                              {transaction.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            {transaction.fromCurrency} → {transaction.toCurrency}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            {formatNumber(transaction.amount)} {transaction.fromCurrency}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            {formatNumber(transaction.rate, 4, 4)}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            {formatCurrency(transaction.total, 'BDT')}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 whitespace-nowrap">
                              {transaction.status === 'completed' ? 'সম্পন্ন' : 
                               transaction.status === 'pending' ? 'মুলতবি' : 'বাতিল'}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            {transaction.date}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {transaction.time}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => router.push(`/money-exchange/details/${transaction.id}`)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title="বিবরণ দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => router.push(`/money-exchange/edit/${transaction.id}`)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title="সম্পাদনা করুন"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSingle(transaction.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
                  দেখানো হচ্ছে <span className="font-medium">{toBengaliNumeral(pagination.total === 0 ? 0 : (currentPage - 1) * pageSize + 1)}</span> থেকে{' '}
                  <span className="font-medium">{toBengaliNumeral(Math.min(currentPage * pageSize, pagination.total))}</span> এর{' '}
                  <span className="font-medium">{toBengaliNumeral(pagination.total)}</span> ফলাফল
                </div>
                <div className="inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm border rounded-l-md ${
                      currentPage === 1 || isLoading 
                        ? 'text-gray-400 bg-white dark:bg-gray-800 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="hidden sm:inline">পূর্ববর্তী</span>
                    <span className="sm:hidden">‹</span>
                  </button>
                  <span className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border-t border-b bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    {toBengaliNumeral(currentPage)} / {toBengaliNumeral(totalPages)}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm border rounded-r-md ${
                      currentPage === totalPages || isLoading 
                        ? 'text-gray-400 bg-white dark:bg-gray-800 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="hidden sm:inline">পরবর্তী</span>
                    <span className="sm:hidden">›</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default List;
