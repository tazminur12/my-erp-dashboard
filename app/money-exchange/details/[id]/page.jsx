'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  ArrowLeft, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Calendar,
  User,
  Phone,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Printer,
  Download,
  Loader2,
  Building2
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

const formatBDT = (value) => {
  const formatted = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'BDT', 
    minimumFractionDigits: 2 
  }).format(Number.isFinite(value) ? value : 0);
  return toBengaliNumeral(formatted);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('bn-BD', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const Details = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [exchange, setExchange] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExchange = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/money-exchange/${id}`);
        const data = await response.json();

        if (response.ok) {
          setExchange(data.exchange || data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch exchange');
        }
      } catch (err) {
        console.error('Error fetching exchange:', err);
        setError(err.message || 'Failed to load exchange');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchange();
  }, [id]);

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
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'সম্পন্ন';
      case 'pending':
        return 'মুলতবি';
      case 'cancelled':
        return 'বাতিল';
      default:
        return 'অজানা';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!exchange) return;

    const content = `
মুদ্রা বিনিময় লেনদেনের বিবরণ
================================

লেনদেন আইডি: ${exchange.id || exchange._id}
তারিখ: ${formatDate(exchange.date)}
ধরণ: ${exchange.type === 'Buy' ? 'ক্রয় (Buy)' : 'বিক্রয় (Sell)'}
স্ট্যাটাস: ${getStatusText(exchange.isActive !== false ? 'completed' : 'cancelled')}

গ্রাহকের তথ্য:
----------------
পূর্ণ নাম: ${exchange.fullName || '-'}
মোবাইল নম্বর: ${exchange.mobileNumber || '-'}
জাতীয় পরিচয়পত্র: ${exchange.nid || 'N/A'}
গ্রাহকের ধরণ: ${exchange.customerType === 'dilar' ? 'ডিলার' : 'সাধারণ গ্রাহক'}

মুদ্রা তথ্য:
-------------
কারেন্সি কোড: ${exchange.currencyCode || '-'}
কারেন্সির নাম: ${exchange.currencyName || '-'}
এক্সচেঞ্জ রেট: ${exchange.exchangeRate || '0.0000'}
পরিমাণ: ${exchange.quantity || '0.00'} ${exchange.currencyCode || ''}

মোট পরিমাণ:
------------
মোট (BDT): ${formatBDT(exchange.amount_bdt || 0)}

সময়:
------
তৈরি হয়েছে: ${formatDateTime(exchange.createdAt)}
আপডেট হয়েছে: ${formatDateTime(exchange.updatedAt)}
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `exchange_${exchange.id || exchange._id}_${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !exchange) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-6">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-4 text-lg font-semibold">লেনদেন লোড করতে ব্যর্থ হয়েছে</p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'লেনদেন পাওয়া যায়নি'}</p>
                <button
                  onClick={() => router.push('/money-exchange/list')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  তালিকায় ফিরে যান
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const status = exchange.isActive !== false ? 'completed' : 'cancelled';
  const isBuy = exchange.type === 'Buy';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <header className="mb-8 print:hidden">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ফিরে যান</span>
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">লেনদেনের বিবরণ</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">মুদ্রা বিনিময় লেনদেনের সম্পূর্ণ তথ্য</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">ডাউনলোড</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">প্রিন্ট</span>
                </button>
                <button
                  onClick={() => router.push(`/money-exchange/edit/${exchange.id || exchange._id}`)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">সম্পাদনা করুন</span>
                  <span className="sm:hidden">সম্পাদনা</span>
                </button>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="xl:col-span-2 space-y-6">
              {/* Transaction Header Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      isBuy 
                        ? 'bg-green-100 dark:bg-green-900/20' 
                        : 'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {isBuy ? (
                        <ArrowDownCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUpCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isBuy ? 'ক্রয় (Buy)' : 'বিক্রয় (Sell)'}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">লেনদেন আইডি: {exchange.id || exchange._id}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                    <span className="ml-2">{getStatusText(status)}</span>
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">মোট পরিমাণ</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatBDT(exchange.amount_bdt || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  গ্রাহকের তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exchange.customerType === 'dilar' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        গ্রাহকের ধরণ
                      </label>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-base font-medium text-purple-700 dark:text-purple-400">ডিলার</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      পূর্ণ নাম
                    </label>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {exchange.fullName || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      মোবাইল নম্বর
                    </label>
                    <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {exchange.mobileNumber || '-'}
                    </p>
                  </div>
                  {exchange.nid && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        জাতীয় পরিচয়পত্র
                      </label>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {exchange.nid}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  লেনদেনের বিবরণ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      তারিখ
                    </label>
                    <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(exchange.date)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      ধরণ
                    </label>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {exchange.type === 'Buy' ? 'ক্রয় (Buy)' : 'বিক্রয় (Sell)'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      কারেন্সি কোড
                    </label>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {exchange.currencyCode || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      কারেন্সির নাম
                    </label>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {exchange.currencyName || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      এক্সচেঞ্জ রেট
                    </label>
                    <p className="text-base font-medium text-gray-900 dark:text-white tabular-nums">
                      1 {exchange.currencyCode} = {toBengaliNumeral((exchange.exchangeRate || 0).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }))} BDT
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      পরিমাণ ({exchange.currencyCode})
                    </label>
                    <p className="text-base font-medium text-gray-900 dark:text-white tabular-nums">
                      {toBengaliNumeral((exchange.quantity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                    </p>
                  </div>
                  <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      মোট পরিমাণ (BDT)
                    </label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {formatBDT(exchange.amount_bdt || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Type-specific Information */}
              {isBuy ? (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
                  <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">ক্রয় (Buy) - BDT প্রদান করে বিদেশি মুদ্রা গ্রহণ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">প্রদান করা হয়েছে (BDT)</label>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatBDT(exchange.amount_bdt || 0)}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">প্রাপ্ত হয়েছে ({exchange.currencyCode})</label>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{toBengaliNumeral((exchange.quantity || 0).toFixed(4))}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3">বিক্রয় (Sell) - বিদেশি মুদ্রা প্রদান করে BDT গ্রহণ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">বিক্রয় করা হয়েছে ({exchange.currencyCode})</label>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{toBengaliNumeral((exchange.quantity || 0).toFixed(2))}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">প্রাপ্ত হয়েছে (BDT)</label>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatBDT(exchange.amount_bdt || 0)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  সময়ের তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      তৈরি হয়েছে
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {formatDateTime(exchange.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      আপডেট হয়েছে
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {formatDateTime(exchange.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Summary */}
            <aside className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">লেনদেনের সারাংশ</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">লেনদেন আইডি</span>
                    <span className="font-medium text-gray-900 dark:text-white text-xs font-mono">{exchange.id || exchange._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">তারিখ</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(exchange.date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">ধরণ</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      isBuy 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {exchange.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">স্ট্যাটাস</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      <span className="ml-1">{getStatusText(status)}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">কারেন্সি</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {exchange.currencyCode} • {exchange.currencyName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">এক্সচেঞ্জ রেট</span>
                    <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                      {toBengaliNumeral((exchange.exchangeRate || 0).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">পরিমাণ ({exchange.currencyCode})</span>
                    <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                      {toBengaliNumeral((exchange.quantity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">মোট (BDT)</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums">
                      {formatBDT(exchange.amount_bdt || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Details;
