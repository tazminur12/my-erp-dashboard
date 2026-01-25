'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import { Plus, Banknote, Building2, CreditCard, TrendingUp, AlertCircle, Edit, Trash2, History, Filter, Search, Eye, Copy } from 'lucide-react';
import Swal from 'sweetalert2';

// Small Stat Component
const SmallStat = ({ label, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, size = 'md', children }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModalFooter = ({ children }) => {
  return (
    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );
};

// Transaction History Component
const TransactionHistory = ({ accountId }) => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (accountId) {
      fetchTransactions();
    }
  }, [accountId, page, filters]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Note: You'll need to create this API endpoint
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.type && { type: filters.type }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });
      
      const response = await fetch(`/api/bank-accounts/${accountId}/transactions?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data.transactions || []);
        setPagination(data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setFilters({type: '', startDate: '', endDate: ''})}
            className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(transaction.date || transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.transactionType === 'credit' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {transaction.transactionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {transaction.description || transaction.notes || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.paymentDetails?.amount?.toLocaleString() || transaction.amount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.paymentDetails?.reference || transaction.transactionId || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing page <span className="font-medium">{pagination.currentPage || page}</span> of{' '}
                <span className="font-medium">{pagination.totalPages || 1}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BankAccounts = () => {
  const router = useRouter();
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    accountType: '',
    accountCategory: '',
    currency: '',
    search: ''
  });
  
  const [banks, setBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [balanceData, setBalanceData] = useState({
    amount: '',
    note: '',
    type: 'deposit',
    createdBy: 'SYSTEM',
    branchId: 'BRANCH001'
  });

  // Fetch bank accounts
  useEffect(() => {
    fetchBankAccounts();
  }, [filters]);

  const fetchBankAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.accountCategory) queryParams.append('accountCategory', filters.accountCategory);
      
      const url = `/api/bank-accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        let accounts = data.bankAccounts || data.data || [];
        
        // Apply client-side filters
        if (filters.search) {
          accounts = accounts.filter(account => 
            account.bankName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            account.accountNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
            account.accountTitle?.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        if (filters.accountType) {
          accounts = accounts.filter(account => account.accountType === filters.accountType);
        }
        if (filters.currency) {
          accounts = accounts.filter(account => account.currency === filters.currency);
        }
        
        setBanks(accounts);
        
        // Calculate stats
        const totalAccounts = accounts.length;
        const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
        const totalInitialBalance = accounts.reduce((sum, acc) => sum + (acc.initialBalance || 0), 0);
        const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
        
        setStats({
          totalAccounts,
          totalBalance,
          totalInitialBalance,
          activeAccounts
        });
      } else {
        throw new Error(data.error || 'Failed to fetch bank accounts');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bank accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBank = () => {
    router.push('/account/bank-accounts/add');
  };

  const handleEditBank = (bank) => {
    router.push(`/account/bank-accounts/${bank._id}/edit`);
  };

  const handleBalanceAdjustment = (bank) => {
    setSelectedBank(bank);
    setBalanceData({
      amount: '',
      note: '',
      type: 'deposit',
      createdBy: 'SYSTEM',
      branchId: 'BRANCH001'
    });
    setIsBalanceModalOpen(true);
  };

  const handleCopyBankInfo = async (bank) => {
    if (!bank) return;

    const info = [
      `Bank Name: ${bank.bankName || ''}`,
      `Account Name: ${bank.accountTitle || ''}`,
      `Account Number: ${bank.accountNumber || ''}`,
      `Routing Number: ${bank.routingNumber || ''}`,
      `Branch: ${bank.branchName || ''}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(info);
      const isDark = document.documentElement.classList.contains('dark');
      Swal.fire({
        title: 'Copied!',
        text: 'Bank account details copied to clipboard.',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB',
        customClass: {
          title: 'text-green-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      const isDark = document.documentElement.classList.contains('dark');
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কপি করা যায়নি। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
    }
  };

  const handleViewTransactions = (bank) => {
    setSelectedBank(bank);
    setIsTransactionHistoryOpen(true);
  };

  const handleViewProfile = (bank) => {
    router.push(`/account/bank-accounts/${bank._id}`);
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedBank?._id) return;
      
      // Note: You'll need to create this API endpoint
      const response = await fetch(`/api/bank-accounts/${selectedBank._id}/adjust-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(balanceData.amount),
          type: balanceData.type,
          note: balanceData.note,
          createdBy: balanceData.createdBy,
          branchId: balanceData.branchId,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'Balance adjusted successfully!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        setIsBalanceModalOpen(false);
        setBalanceData({ amount: '', note: '', type: 'deposit', createdBy: 'SYSTEM', branchId: 'BRANCH001' });
        fetchBankAccounts();
      } else {
        throw new Error(result.error || 'Failed to adjust balance');
      }
    } catch (err) {
      console.error('Balance adjustment failed:', err);
      Swal.fire({
        title: 'ত্রুটি!',
        text: err.message || 'Balance adjustment failed',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      accountType: '',
      accountCategory: '',
      currency: '',
      search: ''
    });
  };

  const handleDeleteBank = async (bank) => {
    if (!bank?._id) return;
    
    const isDark = document.documentElement.classList.contains('dark');
    
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `আপনি "${bank.bankName}" ব্যাংক অ্যাকাউন্টটি মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'না, বাতিল করুন',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      background: isDark ? '#1F2937' : '#F9FAFB',
      customClass: {
        title: 'text-red-600 font-bold text-xl',
        popup: 'rounded-2xl shadow-2xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium',
        cancelButton: 'px-6 py-2 rounded-lg font-medium'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/bank-accounts/${bank._id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'ব্যাংক অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
            background: isDark ? '#1F2937' : '#F9FAFB',
            customClass: {
              title: 'text-green-600 font-bold text-xl',
              popup: 'rounded-2xl shadow-2xl'
            }
          });
          fetchBankAccounts();
        } else {
          throw new Error(result.error || 'Failed to delete bank account');
        }
      } catch (err) {
        console.error('Delete failed:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'ব্যাংক অ্যাকাউন্ট মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
          background: isDark ? '#1F2937' : '#FEF2F2',
          customClass: {
            title: 'text-red-600 font-bold text-xl',
            popup: 'rounded-2xl shadow-2xl'
          }
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Bank Accounts
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your bank accounts and track balances
              </p>
            </div>
            <button
              onClick={handleAddBank}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Bank Account
            </button>
          </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Search banks..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Type
                </label>
                <select
                  value={filters.accountType}
                  onChange={(e) => handleFilterChange('accountType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="Current">Current</option>
                  <option value="Savings">Savings</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Category
                </label>
                <select
                  value={filters.accountCategory}
                  onChange={(e) => handleFilterChange('accountCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="mobile_banking">Mobile Banking</option>
                  <option value="check">Check</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  value={filters.currency}
                  onChange={(e) => handleFilterChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Currencies</option>
                  <option value="BDT">BDT</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <SmallStat
              label="Total Accounts"
              value={stats.totalAccounts || 0}
              icon={Building2}
              color="blue"
            />
            <SmallStat
              label="Total Balance"
              value={`BDT ${Number(stats.totalBalance || 0).toLocaleString()}`}
              icon={Banknote}
              color="green"
            />
            <SmallStat
              label="Initial Balance"
              value={`BDT ${Number(stats.totalInitialBalance || 0).toLocaleString()}`}
              icon={CreditCard}
              color="purple"
            />
            <SmallStat
              label="Active Accounts"
              value={`${stats.activeAccounts || 0}/${stats.totalAccounts || 0}`}
              icon={TrendingUp}
              color="yellow"
            />
          </div>

        {/* Bank Accounts Table */}
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bank accounts...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-red-600 dark:text-red-400">Error loading bank accounts</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Logo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Bank Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Account Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Account Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Initial Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Current Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created By Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {banks.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No bank accounts found
                        </td>
                      </tr>
                    ) : (
                      banks.map((bank) => (
                        <tr key={bank._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {bank.logo ? (
                              <img 
                                src={bank.logo} 
                                alt="Bank Logo" 
                                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {bank.bankName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {bank.accountTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              bank.accountType === 'Current' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                              bank.accountType === 'Savings' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            }`}>
                              {bank.accountType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              bank.accountCategory === 'bank' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                              bank.accountCategory === 'cash' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              bank.accountCategory === 'mobile_banking' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                              bank.accountCategory === 'check' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                            }`}>
                              {bank.accountCategory?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                            {bank.currency} {bank.initialBalance?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {bank.currency} {bank.currentBalance?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              bank.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {bank.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {bank.userBranchName ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <Building2 className="w-3 h-3 mr-1" />
                                {bank.userBranchName}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleCopyBankInfo(bank)}
                                className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors duration-200"
                                title="Copy Account Info"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleViewProfile(bank)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditBank(bank)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleBalanceAdjustment(bank)}
                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
                                title="Adjust Balance"
                              >
                                <Banknote className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleViewTransactions(bank)}
                                className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors duration-200"
                                title="View Transactions"
                              >
                                <History className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBank(bank)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                                title="Delete"
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
          </div>
        )}

        {/* Balance Adjustment Modal */}
          <Modal
            isOpen={isBalanceModalOpen}
            onClose={() => setIsBalanceModalOpen(false)}
            title="Adjust Account Balance"
            size="md"
          >
            <form onSubmit={handleBalanceSubmit} className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Adjusting balance for {selectedBank?.bankName}
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Current Balance: {selectedBank?.currency} {selectedBank?.currentBalance?.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Type *
                </label>
                <select
                  required
                  value={balanceData.type}
                  onChange={(e) => setBalanceData({...balanceData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={balanceData.amount}
                  onChange={(e) => setBalanceData({...balanceData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Note
                </label>
                <textarea
                  value={balanceData.note}
                  onChange={(e) => setBalanceData({...balanceData, note: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Optional note about this transaction..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created By
                </label>
                <input
                  type="text"
                  value={balanceData.createdBy}
                  onChange={(e) => setBalanceData({...balanceData, createdBy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="User ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch ID
                </label>
                <input
                  type="text"
                  value={balanceData.branchId}
                  onChange={(e) => setBalanceData({...balanceData, branchId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Branch ID"
                />
              </div>

              <ModalFooter>
                <button
                  type="button"
                  onClick={() => setIsBalanceModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  {balanceData.type === 'deposit' ? 'Add Deposit' : 'Process Withdrawal'}
                </button>
              </ModalFooter>
            </form>
          </Modal>

          {/* Transaction History Modal */}
          <Modal
            isOpen={isTransactionHistoryOpen}
            onClose={() => setIsTransactionHistoryOpen(false)}
            title="Transaction History"
            size="xl"
          >
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Transaction history for {selectedBank?.bankName}
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Account: {selectedBank?.accountNumber} | Current Balance: {selectedBank?.currency} {selectedBank?.currentBalance?.toLocaleString()}
                </p>
              </div>

              <TransactionHistory accountId={selectedBank?._id} />
            </div>
          </Modal>
      </div>
    </DashboardLayout>
  );
};

export default BankAccounts;
