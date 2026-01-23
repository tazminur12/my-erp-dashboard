'use client';

import React, { useMemo, useState, useEffect } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import { Calendar, RefreshCw, Loader2, AlertCircle, ArrowLeft, ArrowRight, Eye, Download, X } from 'lucide-react';
import { generateSalmaReceiptPDF } from '../../utils/pdfGenerator';
import Swal from 'sweetalert2';

const ITEMS_PER_PAGE = 20;

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
};

// Helper function to format currency
const formatCurrency = (amount = 0) => {
  const numericValue = Number(amount) || 0;
  return `৳${numericValue.toLocaleString('en-US')}`;
};

const getCustomerName = (t) => {
  const name =
    t?.customerName ||
    t?.customer?.name ||
    t?.partyName ||
    t?.party?.name ||
    t?.customer?.fullName ||
    t?.customer?.customerName ||
    t?.party?.fullName ||
    t?.party?.currencyName ||
    '';

  if (!name || name.trim() === '' || name.toLowerCase() === 'unknown') {
    return 'N/A';
  }

  return name;
};

const buildCategoryHelpers = (apiCategories = [], categoriesWithSubs = []) => {
  const subCategoryIndex = {};
  const apiCategoryIndex = {};

  try {
    (apiCategories || []).forEach((c) => {
      if (!c) return;
      if (typeof c === 'string') {
        apiCategoryIndex[c] = c;
        return;
      }
      const id = c._id || c.id || c.value || c.slug;
      const name = c.name || c.label || c.title || c.categoryName || c.value;
      if (id && name) apiCategoryIndex[id] = name;
      if (name) apiCategoryIndex[name] = name;
    });

    (categoriesWithSubs || []).forEach((cat) => {
      if (!cat) return;
      const catId = cat.id || cat._id;
      const catName = cat.name;
      if (catId && catName) {
        apiCategoryIndex[catId] = catName;
      }

      const subs = cat.subCategories || cat.subcategories || [];
      subs.forEach((sub) => {
        const subId = sub.id || sub._id;
        const subName = sub.name;
        if (subId && subName) {
          subCategoryIndex[subId] = subName;
        }
      });
    });
  } catch (e) {
    // ignore mapping errors
  }

  const getCategory = (tx) => {
    if (!tx) return 'N/A';

    if (tx.category && typeof tx.category === 'object') {
      const name =
        tx.category.name ||
        tx.category.label ||
        tx.category.title ||
        tx.category.categoryName;
      if (name) return name;
    }

    const raw =
      tx.category ||
      tx.categoryId ||
      tx.serviceCategory ||
      tx.paymentDetails?.category ||
      '';

    if (!raw) return 'N/A';

    if (
      typeof raw === 'string' &&
      !raw.match(/^[0-9a-f]{24}$/i) &&
      raw.length < 30
    ) {
      return raw;
    }

    if (subCategoryIndex[raw]) {
      return subCategoryIndex[raw];
    }

    if (apiCategoryIndex[raw]) {
      return apiCategoryIndex[raw];
    }

    return 'N/A';
  };

  return getCategory;
};

const getPaymentMethodLabel = (method) => {
  if (!method) return 'N/A';
  if (method === 'bank' || method === 'bank-transfer') return 'ব্যাংক ট্রান্সফার';
  if (method === 'cheque') return 'চেক';
  if (method === 'mobile-banking') return 'মোবাইল ব্যাংকিং';
  return method;
};

const getAmount = (tx) => tx?.paymentDetails?.amount ?? tx?.amount ?? 0;

const TodayTransactions = () => {
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  
  // Data fetching state
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [cashAccount, setCashAccount] = useState(null);
  const [isCashLoading, setIsCashLoading] = useState(false);
  const [cashError, setCashError] = useState(null);
  const [apiCategories, setApiCategories] = useState([]);
  const [categoriesWithSubs, setCategoriesWithSubs] = useState([]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          dateRange: 'today'
        });

        const response = await fetch(`/api/transactions?${queryParams.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setTransactions(data.transactions || data.data || []);
          setTotalPages(data.totalPages || Math.ceil((data.totalCount || 0) / ITEMS_PER_PAGE));
        } else {
          setError(data.error || 'Failed to fetch transactions');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err.message || 'Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [page]);

  // Fetch cash account balance
  useEffect(() => {
    const fetchCashAccount = async () => {
      try {
        setIsCashLoading(true);
        setCashError(null);
        const response = await fetch('/api/bank-accounts/691349c9dd00549f2b8fccab');
        if (response.ok) {
          const data = await response.json();
          setCashAccount(data.bankAccount || data.data);
        } else {
          setCashError('Failed to fetch cash account');
        }
      } catch (err) {
        console.error('Error fetching cash account:', err);
        setCashError(err.message);
      } finally {
        setIsCashLoading(false);
      }
    };

    fetchCashAccount();
  }, []);

  // Fetch categories (optional - can work without)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Try to fetch categories if API exists
        const response = await fetch('/api/transaction-categories');
        if (response.ok) {
          const data = await response.json();
          setApiCategories(data.categories || data.data || []);
        }
      } catch (err) {
        // Ignore if categories API doesn't exist
      }
    };
    fetchCategories();
  }, []);

  const getCategory = useMemo(
    () => buildCategoryHelpers(apiCategories, categoriesWithSubs),
    [apiCategories, categoriesWithSubs]
  );

  const todayTotals = useMemo(() => {
    let income = 0;
    let expense = 0;

    (transactions || []).forEach((tx) => {
      const amount = Number(getAmount(tx)) || 0;
      if (!amount) return;

      if (tx.transactionType === 'credit') {
        income += amount;
      } else if (tx.transactionType === 'debit') {
        expense += amount;
      }
    });

    return { income, expense };
  }, [transactions]);

  const currentBalanceDisplay = useMemo(() => {
    if (isCashLoading) return '...';
    if (cashError || !cashAccount) return '—';
    return `${cashAccount.currency || 'BDT'} ${Number(
      cashAccount.currentBalance || 0
    ).toLocaleString('bn-BD')}`;
  }, [isCashLoading, cashError, cashAccount]);

  const todayInfo = useMemo(() => {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('bn-BD', options);
    const weekday = now.toLocaleDateString('bn-BD', { weekday: 'long' });
    return { formattedDate, weekday };
  }, []);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const refetch = () => {
    window.location.reload();
  };

  const preparePDFData = (transaction) => {
    const name = getCustomerName(transaction);
    const phone = transaction.customerPhone || transaction.customer?.phone || transaction.party?.phone || '';
    const email = transaction.customerEmail || transaction.customer?.email || transaction.party?.email || '';
    
    let address = '';
    if (transaction.customerAddress && typeof transaction.customerAddress === 'string') {
      address = transaction.customerAddress.trim();
    } else if (transaction.customer?.address) {
      address = transaction.customer.address;
    } else if (transaction.party?.address) {
      address = transaction.party.address;
    }
    
    return {
      transactionId: transaction.transactionId || transaction._id,
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      customerAddress: address || '[Full Address]',
      transactionType: transaction.transactionType,
      category: getCategory(transaction),
      paymentMethod: getPaymentMethodLabel(transaction.paymentMethod),
      amount: getAmount(transaction),
      charge: transaction.charge || transaction.paymentDetails?.charge || 0,
      status: transaction.status || 'N/A',
      date: transaction.date,
      notes: transaction.notes || '',
      paymentDetails: transaction.paymentDetails || {},
      accountManagerName: transaction.accountManager?.name || transaction.accountManager?.fullName || 'N/A',
    };
  };

  const handleDownloadPDFBangla = async (transaction, showHeader = true) => {
    try {
      Swal.fire({
        title: 'PDF তৈরি হচ্ছে...',
        text: `${transaction.transactionId || transaction._id} এর রিসিট তৈরি হচ্ছে`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const pdfData = preparePDFData(transaction);
      const result = await generateSalmaReceiptPDF(pdfData, {
        language: 'bn',
        showHeader: showHeader,
      });

      Swal.close();

      if (result.success) {
        Swal.fire({
          title: 'সফল!',
          text: `PDF সফলভাবে ডাউনলোড হয়েছে`,
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
        });
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Swal.close();
      Swal.fire({
        title: 'ত্রুটি!',
        text: `PDF তৈরি করতে সমস্যা হয়েছে`,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  };

  const handleDownloadPDFEnglish = async (transaction, showHeader = true) => {
    try {
      Swal.fire({
        title: 'Generating PDF...',
        text: `Generating receipt for ${transaction.transactionId || transaction._id}`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const pdfData = preparePDFData(transaction);
      const result = await generateSalmaReceiptPDF(pdfData, {
        language: 'en',
        showHeader: showHeader,
      });

      Swal.close();

      if (result.success) {
        Swal.fire({
          title: 'Success!',
          text: `PDF downloaded successfully`,
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Swal.close();
      Swal.fire({
        title: 'Error!',
        text: `Failed to generate PDF`,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 lg:p-8 transition-colors duration-300 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">আজকের লেনদেন</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  আজকের তারিখে হওয়া সব ট্রানজ্যাকশন
                  <span className="ml-2 inline-flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{todayInfo.formattedDate}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-200">
                      {todayInfo.weekday}
                    </span>
                  </span>
                </p>
              </div>
              <button
                onClick={refetch}
                className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                রিফ্রেশ
              </button>
            </div>

            {/* Current balance + today's income/expense summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* বর্তমান ব্যালেন্স */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs font-medium text-blue-700/80 dark:text-blue-300/80">
                  বর্তমান ব্যালেন্স (Cash Balance)
                </p>
                <p className="mt-1 text-xl font-semibold text-blue-900 dark:text-blue-100">
                  {currentBalanceDisplay}
                </p>
              </div>

              {/* আজকের আয় */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4">
                <p className="text-xs font-medium text-green-700/80 dark:text-green-300/80">
                  আজকের আয় (Credit)
                </p>
                <p className="mt-1 text-xl font-semibold text-green-700 dark:text-green-300">
                  {formatCurrency(todayTotals.income || 0)}
                </p>
              </div>

              {/* আজকের ব্যয় */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-4">
                <p className="text-xs font-medium text-red-700/80 dark:text-red-300/80">
                  আজকের ব্যয় (Debit)
                </p>
                <p className="mt-1 text-xl font-semibold text-red-700 dark:text-red-300">
                  {formatCurrency(todayTotals.expense || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Desktop / Tablet table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">কাস্টমার</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">ধরন</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">ক্যাটাগরি</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">পেমেন্ট মেথড</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">পরিমাণ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">কর্ম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading && (
                    <tr>
                      <td colSpan="7" className="px-4 py-10 text-center">
                        <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>লোড হচ্ছে...</span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {error && !isLoading && (
                    <tr>
                      <td colSpan="7" className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-3 text-red-500">
                          <AlertCircle className="w-6 h-6" />
                          <p className="text-sm">{error}</p>
                          <button
                            onClick={refetch}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            আবার চেষ্টা করুন
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoading && !error && transactions.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                        আজ কোনো ট্রানজ্যাকশন নেই।
                      </td>
                    </tr>
                  )}

                  {!isLoading && !error && transactions.map((tx) => (
                    <tr key={tx._id || tx.transactionId} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {getCustomerName(tx)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          tx.transactionType === 'credit'
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          <ArrowLeft className="w-3 h-3" />
                          {tx.transactionType === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {getCategory(tx)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {getPaymentMethodLabel(tx.paymentMethod)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(getAmount(tx))}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {tx.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewTransaction(tx)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                          title="দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading && (
                <div className="flex items-center justify-center gap-3 py-8 text-gray-600 dark:text-gray-300">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>লোড হচ্ছে...</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="flex flex-col items-center gap-3 py-8 text-red-500">
                  <AlertCircle className="w-6 h-6" />
                  <p className="text-sm px-4 text-center">{error}</p>
                  <button
                    onClick={refetch}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    আবার চেষ্টা করুন
                  </button>
                </div>
              )}

              {!isLoading && !error && transactions.length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  আজ কোনো ট্রানজ্যাকশন নেই।
                </div>
              )}

              {!isLoading && !error && transactions.map((tx) => (
                <div key={tx._id || tx.transactionId} className="px-4 py-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">কাস্টমার</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {getCustomerName(tx)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      tx.transactionType === 'credit'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      <ArrowLeft className="w-3 h-3" />
                      {tx.transactionType === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ক্যাটাগরি</p>
                      <p className="text-gray-900 dark:text-white">{getCategory(tx)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">পরিমাণ</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(getAmount(tx))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">পেমেন্ট মেথড</p>
                      <p className="text-gray-900 dark:text-white">
                        {getPaymentMethodLabel(tx.paymentMethod)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">স্ট্যাটাস</p>
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {tx.status || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleViewTransaction(tx)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      বিস্তারিত দেখুন
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                পেজ {page} / {totalPages || 1}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => canPrev && setPage((p) => p - 1)}
                  disabled={!canPrev}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  আগের
                </button>
                <button
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  পরের
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    লেনদেনের বিবরণ
                  </h3>
                  <button
                    onClick={() => setShowTransactionModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Transaction ID
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono">{selectedTransaction.transactionId || selectedTransaction._id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      স্ট্যাটাস
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {selectedTransaction.status || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      কাস্টমারের নাম
                    </label>
                    <p className="text-gray-900 dark:text-white">{getCustomerName(selectedTransaction)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      ফোন নম্বর
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedTransaction.customerPhone || selectedTransaction.customer?.phone || selectedTransaction.party?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      লেনদেনের ধরন
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedTransaction.transactionType === 'credit'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {selectedTransaction.transactionType === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      ক্যাটাগরি
                    </label>
                    <p className="text-gray-900 dark:text-white">{getCategory(selectedTransaction)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      পেমেন্ট মেথড
                    </label>
                    <p className="text-gray-900 dark:text-white">{getPaymentMethodLabel(selectedTransaction.paymentMethod)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      পরিমাণ
                    </label>
                    <p className={`font-semibold ${
                      selectedTransaction.transactionType === 'credit' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(getAmount(selectedTransaction))}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      তারিখ
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedTransaction.date)}</p>
                  </div>
                </div>
                
                {selectedTransaction.notes && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      নোট
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedTransaction.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="mb-4 p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showHeader}
                      onChange={(e) => setShowHeader(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Header দেখান (Logo, Title, Tagline)
                    </span>
                  </label>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleDownloadPDFBangla(selectedTransaction, showHeader)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    <Download className="w-5 h-5" />
                    বাংলা PDF
                  </button>
                  <button
                    onClick={() => handleDownloadPDFEnglish(selectedTransaction, showHeader)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    <Download className="w-5 h-5" />
                    English PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TodayTransactions;
