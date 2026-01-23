'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  ArrowLeft, 
  Edit,
  Building2,
  User,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  XCircle,
  CheckCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';

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

const formatBDT = (value) =>
  new Intl.NumberFormat('bn-BD-u-nu-latn', { style: 'currency', currency: 'BDT', minimumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0
  );

const DilarDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [dilar, setDilar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transaction history state
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionFilters, setTransactionFilters] = useState({
    type: '',
    currencyCode: '',
    dateFrom: '',
    dateTo: ''
  });
  const [exchanges, setExchanges] = useState([]);
  const [exchangePagination, setExchangePagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [exchangesLoading, setExchangesLoading] = useState(false);

  useEffect(() => {
    const fetchDilar = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/money-exchange/dilars/${id}`);
        const data = await response.json();

        if (response.ok) {
          setDilar(data.dilar || data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch dilar');
        }
      } catch (err) {
        console.error('Error fetching dilar:', err);
        setError(err.message || 'Failed to load dilar');
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'ডিলার লোড করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDilar();
  }, [id]);

  useEffect(() => {
    const fetchExchanges = async () => {
      if (!id) return;

      setExchangesLoading(true);
      try {
        const params = new URLSearchParams({
          dilarId: id,
          page: transactionPage.toString(),
          limit: '10',
        });

        if (transactionFilters.type) {
          params.append('type', transactionFilters.type);
        }
        if (transactionFilters.currencyCode) {
          params.append('currencyCode', transactionFilters.currencyCode);
        }
        if (transactionFilters.dateFrom) {
          params.append('dateFrom', transactionFilters.dateFrom);
        }
        if (transactionFilters.dateTo) {
          params.append('dateTo', transactionFilters.dateTo);
        }

        const response = await fetch(`/api/money-exchange?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setExchanges(data.exchanges || data.data || []);
          setExchangePagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
        }
      } catch (err) {
        console.error('Error fetching exchanges:', err);
      } finally {
        setExchangesLoading(false);
      }
    };

    fetchExchanges();
  }, [id, transactionPage, transactionFilters]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">ডিলার তথ্য লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dilar) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error || 'ডিলার লোড করতে ব্যর্থ হয়েছে'}</p>
              <button
                onClick={() => router.push('/money-exchange/dealer-list')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                তালিকায় ফিরে যান
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isActive = dilar.status !== 'inactive' && dilar.isActive !== false;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/money-exchange/dealer-list')}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="পিছনে যান"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">ডিলার বিবরণ</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">ডিলারের সম্পূর্ণ তথ্য</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/money-exchange/dealer/${id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            সম্পাদনা করুন
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex items-start gap-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {dilar.logo ? (
                    <img
                      src={dilar.logo}
                      alt={dilar.ownerName || 'Dealer'}
                      className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                      <Building2 className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {dilar.ownerName || 'নাম নেই'}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              সক্রিয়
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              নিষ্ক্রিয়
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    {dilar.contactNo && (
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        <span className="font-medium">{dilar.contactNo}</span>
                      </div>
                    )}

                    {dilar.tradeLocation && (
                      <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>{dilar.tradeLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">অতিরিক্ত তথ্য</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dilar.nid && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      জাতীয় পরিচয়পত্র (NID)
                    </label>
                    <p className="text-gray-900 dark:text-white">{dilar.nid}</p>
                  </div>
                )}

                {dilar.tradeName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      ব্যবসার নাম
                    </label>
                    <p className="text-gray-900 dark:text-white">{dilar.tradeName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">লেনদেনের ইতিহাস</h3>
                <button
                  onClick={() => router.push('/money-exchange/new')}
                  className="text-sm px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  নতুন লেনদেন
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <select
                  value={transactionFilters.type}
                  onChange={(e) => {
                    setTransactionFilters(f => ({ ...f, type: e.target.value }));
                    setTransactionPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">সব ধরণ</option>
                  <option value="Buy">ক্রয় (Buy)</option>
                  <option value="Sell">বিক্রয় (Sell)</option>
                </select>
                <input
                  type="text"
                  placeholder="কারেন্সি কোড"
                  value={transactionFilters.currencyCode}
                  onChange={(e) => {
                    setTransactionFilters(f => ({ ...f, currencyCode: e.target.value }));
                    setTransactionPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="date"
                  placeholder="শুরুর তারিখ"
                  value={transactionFilters.dateFrom}
                  onChange={(e) => {
                    setTransactionFilters(f => ({ ...f, dateFrom: e.target.value }));
                    setTransactionPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="date"
                  placeholder="শেষ তারিখ"
                  value={transactionFilters.dateTo}
                  onChange={(e) => {
                    setTransactionFilters(f => ({ ...f, dateTo: e.target.value }));
                    setTransactionPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* Transactions Table */}
              {exchangesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : exchanges.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">তারিখ</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ধরণ</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">কারেন্সি</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">রেট</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">পরিমাণ</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">BDT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {exchanges.map((exchange) => {
                          const isBuy = exchange.type === 'Buy';
                          return (
                            <tr key={exchange.id || exchange._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {formatDate(exchange.date)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  isBuy 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                  {isBuy ? (
                                    <ArrowDownCircle className="w-3 h-3 mr-1" />
                                  ) : (
                                    <ArrowUpCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {isBuy ? 'ক্রয়' : 'বিক্রয়'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {exchange.currencyCode} {exchange.currencyName ? `(${exchange.currencyName})` : ''}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {exchange.exchangeRate ? exchange.exchangeRate.toFixed(4) : '0.0000'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {exchange.quantity ? exchange.quantity.toFixed(4) : '0.0000'} {exchange.currencyCode}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                                {formatBDT(exchange.amount_bdt || 0)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {exchangePagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        দেখানো হচ্ছে {exchanges.length} এর {exchangePagination.total} লেনদেন
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTransactionPage(p => Math.max(1, p - 1))}
                          disabled={transactionPage === 1}
                          className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          পৃষ্ঠা {transactionPage} এর {exchangePagination.pages}
                        </span>
                        <button
                          onClick={() => setTransactionPage(p => Math.min(exchangePagination.pages, p + 1))}
                          disabled={transactionPage === exchangePagination.pages}
                          className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>কোনো লেনদেন পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">স্ট্যাটাস</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">অবস্থা</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সময়কাল</h3>
              <div className="space-y-3">
                {dilar.createdAt && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">তৈরি হয়েছে</span>
                    </div>
                    <p className="text-gray-900 dark:text-white text-sm pl-6">
                      {formatDateTime(dilar.createdAt)}
                    </p>
                  </div>
                )}

                {dilar.updatedAt && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">আপডেট হয়েছে</span>
                    </div>
                    <p className="text-gray-900 dark:text-white text-sm pl-6">
                      {formatDateTime(dilar.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">দ্রুত কাজ</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/money-exchange/dealer/${id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  সম্পাদনা করুন
                </button>
                <button
                  onClick={() => router.push('/money-exchange/dealer-list')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  তালিকায় ফিরে যান
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DilarDetails;
