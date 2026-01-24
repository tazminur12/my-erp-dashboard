'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  Loader2,
  ArrowLeft,
  Plus
} from 'lucide-react';
import Swal from 'sweetalert2';

const FinancialReport = () => {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [incomeForm, setIncomeForm] = useState({
    source: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    customer: '',
    notes: ''
  });
  
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: '',
    vendor: '',
    notes: ''
  });
  
  const [incomeErrors, setIncomeErrors] = useState({});
  const [expenseErrors, setExpenseErrors] = useState({});

  // Fetch incomes and expenses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (dateFrom) params.append('date', dateFrom);

        const [incomesRes, expensesRes] = await Promise.all([
          fetch(`/api/miraj-industries/farm-incomes?${params.toString()}`),
          fetch(`/api/miraj-industries/farm-expenses?${params.toString()}`)
        ]);

        const incomesData = await incomesRes.json();
        const expensesData = await expensesRes.json();

        if (incomesRes.ok) {
          setIncomes(incomesData.incomes || incomesData.data || []);
        }
        if (expensesRes.ok) {
          setExpenses(expensesData.expenses || expensesData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'ডেটা লোড করতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, dateFrom]);

  // Filter by date range
  const filteredIncomes = useMemo(() => {
    if (!dateFrom && !dateTo) return incomes;
    return incomes.filter(income => {
      if (!income.date) return false;
      const incomeDate = new Date(income.date);
      if (dateFrom && incomeDate < new Date(dateFrom)) return false;
      if (dateTo && incomeDate > new Date(dateTo)) return false;
      return true;
    });
  }, [incomes, dateFrom, dateTo]);

  const filteredExpenses = useMemo(() => {
    if (!dateFrom && !dateTo) return expenses;
    return expenses.filter(expense => {
      if (!expense.createdAt) return false;
      const expenseDate = new Date(expense.createdAt);
      if (dateFrom && expenseDate < new Date(dateFrom)) return false;
      if (dateTo && expenseDate > new Date(dateTo)) return false;
      return true;
    });
  }, [expenses, dateFrom, dateTo]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalIncome = filteredIncomes.reduce((sum, income) => sum + (Number(income.amount) || 0), 0);
    const totalExpense = filteredExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    const netProfit = totalIncome - totalExpense;
    return { totalIncome, totalExpense, netProfit };
  }, [filteredIncomes, filteredExpenses]);

  // Monthly breakdown
  const monthlyBreakdown = useMemo(() => {
    const monthly = {};
    
    filteredIncomes.forEach(income => {
      if (!income.date) return;
      const date = new Date(income.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[monthKey]) {
        monthly[monthKey] = { income: 0, expense: 0, month: date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' }) };
      }
      monthly[monthKey].income += Number(income.amount) || 0;
    });

    filteredExpenses.forEach(expense => {
      if (!expense.createdAt) return;
      const date = new Date(expense.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[monthKey]) {
        monthly[monthKey] = { income: 0, expense: 0, month: date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' }) };
      }
      monthly[monthKey].expense += Number(expense.amount) || 0;
    });

    return Object.entries(monthly)
      .map(([key, value]) => ({ ...value, key, profit: value.income - value.expense }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [filteredIncomes, filteredExpenses]);

  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (dateFrom) params.append('date', dateFrom);

      const [incomesRes, expensesRes] = await Promise.all([
        fetch(`/api/miraj-industries/farm-incomes?${params.toString()}`),
        fetch(`/api/miraj-industries/farm-expenses?${params.toString()}`)
      ]);

      const incomesData = await incomesRes.json();
      const expensesData = await expensesRes.json();

      if (incomesRes.ok) {
        setIncomes(incomesData.incomes || incomesData.data || []);
      }
      if (expensesRes.ok) {
        setExpenses(expensesData.expenses || expensesData.data || []);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
  };

  const openIncomeModal = () => {
    setIncomeForm({
      source: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      customer: '',
      notes: ''
    });
    setIncomeErrors({});
    setShowIncomeModal(true);
  };

  const openExpenseModal = () => {
    setExpenseForm({
      category: '',
      description: '',
      amount: '',
      vendor: '',
      notes: ''
    });
    setExpenseErrors({});
    setShowExpenseModal(true);
  };

  const validateIncomeForm = () => {
    const err = {};
    if (!incomeForm.source?.trim()) err.source = 'উৎস আবশ্যক';
    if (!incomeForm.description?.trim()) err.description = 'বিবরণ আবশ্যক';
    setIncomeErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateExpenseForm = () => {
    const err = {};
    if (!expenseForm.category?.trim()) err.category = 'ক্যাটাগরি আবশ্যক';
    if (!expenseForm.description?.trim()) err.description = 'বিবরণ আবশ্যক';
    setExpenseErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleCreateIncome = async (e) => {
    e.preventDefault();
    if (!validateIncomeForm()) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/miraj-industries/farm-incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: incomeForm.source.trim(),
          description: incomeForm.description.trim(),
          amount: Number(incomeForm.amount) || 0,
          date: incomeForm.date || new Date().toISOString().split('T')[0],
          paymentMethod: incomeForm.paymentMethod || 'cash',
          customer: (incomeForm.customer || '').trim(),
          notes: (incomeForm.notes || '').trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'সফল',
          text: 'আয় সফলভাবে যোগ করা হয়েছে',
          timer: 1500,
          showConfirmButton: false
        });
        setShowIncomeModal(false);
        handleRefresh();
      } else {
        throw new Error(data.error || 'Failed to create income');
      }
    } catch (error) {
      console.error('Error creating income:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: error.message || 'আয় যোগ করতে ব্যর্থ'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!validateExpenseForm()) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/miraj-industries/farm-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: expenseForm.category.trim(),
          description: expenseForm.description.trim(),
          amount: Number(expenseForm.amount) || 0,
          vendor: (expenseForm.vendor || '').trim(),
          notes: (expenseForm.notes || '').trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'সফল',
          text: 'খরচ সফলভাবে যোগ করা হয়েছে',
          timer: 1500,
          showConfirmButton: false
        });
        setShowExpenseModal(false);
        handleRefresh();
      } else {
        throw new Error(data.error || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: error.message || 'খরচ যোগ করতে ব্যর্থ'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">আয়-খরচ রিপোর্ট</h1>
              <p className="text-gray-600 dark:text-gray-400">Miraj Industries এর আর্থিক সারসংক্ষেপ</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openIncomeModal}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <Plus className="w-4 h-4" />
              আয় যোগ করুন
            </button>
            <button
              onClick={openExpenseModal}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 dark:bg-red-700 dark:hover:bg-red-800"
            >
              <Plus className="w-4 h-4" />
              খরচ যোগ করুন
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট আয়</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(totals.totalIncome)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {filteredIncomes.length} টি আয় রেকর্ড
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট খরচ</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {formatCurrency(totals.totalExpense)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {filteredExpenses.length} টি খরচ রেকর্ড
            </p>
          </div>

          <div className={`bg-white dark:bg-gray-800 rounded-xl border p-6 ${
            totals.netProfit >= 0 ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">নিট লাভ/ক্ষতি</p>
                <p className={`text-2xl font-bold mt-1 ${
                  totals.netProfit >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(totals.netProfit)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                totals.netProfit >= 0
                  ? 'bg-green-100 dark:bg-green-900/20'
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                <DollarSign className={`w-6 h-6 ${
                  totals.netProfit >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>
            <p className={`text-xs mt-2 ${
              totals.netProfit >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {totals.netProfit >= 0 ? 'লাভ' : 'ক্ষতি'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ফিল্টার</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                শুরু তারিখ
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                শেষ তারিখ
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                অনুসন্ধান
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="খুঁজুন..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                ফিল্টার রিসেট
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        {monthlyBreakdown.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                মাসিক সারসংক্ষেপ
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">মাস</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">মোট আয়</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">মোট খরচ</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">লাভ/ক্ষতি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {monthlyBreakdown.map((month) => (
                    <tr key={month.key} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {month.month}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(month.income)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400 font-medium">
                        {formatCurrency(month.expense)}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-semibold ${
                        month.profit >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(month.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Income and Expense Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                আয়ের তালিকা
              </h2>
            </div>
            {isLoading ? (
              <div className="p-10 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
              </div>
            ) : filteredIncomes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">উৎস</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">বিবরণ</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">পরিমাণ</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">তারিখ</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredIncomes.map((income) => (
                      <tr key={income.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {income.source || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {income.description || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(income.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(income.date)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => router.push(`/miraj-industries/income/${income.id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                <p>কোন আয় রেকর্ড পাওয়া যায়নি</p>
              </div>
            )}
          </div>

          {/* Expense Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                খরচের তালিকা
              </h2>
            </div>
            {isLoading ? (
              <div className="p-10 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
              </div>
            ) : filteredExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ক্যাটাগরি</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">বিবরণ</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">পরিমাণ</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">তারিখ</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {expense.category || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {expense.description || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(expense.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => router.push(`/miraj-industries/expense/${expense.id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                <p>কোন খরচ রেকর্ড পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        </div>

        {/* আয় যোগ করুন Modal */}
        {showIncomeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold dark:text-white">আয় যোগ করুন</h2>
                <button onClick={() => setShowIncomeModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateIncome} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    উৎস <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={incomeForm.source}
                    onChange={(e) => {
                      setIncomeForm({ ...incomeForm, source: e.target.value });
                      if (incomeErrors.source) setIncomeErrors({ ...incomeErrors, source: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                      incomeErrors.source ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="যেমন: দুধ বিক্রয়, গরু বিক্রয়"
                  />
                  {incomeErrors.source && <p className="mt-1 text-sm text-red-600">{incomeErrors.source}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    বিবরণ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={incomeForm.description}
                    onChange={(e) => {
                      setIncomeForm({ ...incomeForm, description: e.target.value });
                      if (incomeErrors.description) setIncomeErrors({ ...incomeErrors, description: '' });
                    }}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                      incomeErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="আয়ের বিবরণ"
                  />
                  {incomeErrors.description && <p className="mt-1 text-sm text-red-600">{incomeErrors.description}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পরিমাণ (৳)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={incomeForm.amount}
                      onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">তারিখ</label>
                    <input
                      type="date"
                      value={incomeForm.date}
                      onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পেমেন্ট ধরন</label>
                    <select
                      value={incomeForm.paymentMethod}
                      onChange={(e) => setIncomeForm({ ...incomeForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="cash">ক্যাশ</option>
                      <option value="bank">ব্যাংক</option>
                      <option value="mobile">মোবাইল ব্যাংকিং</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গ্রাহক / ক্রেতা</label>
                    <input
                      type="text"
                      value={incomeForm.customer}
                      onChange={(e) => setIncomeForm({ ...incomeForm, customer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="ঐচ্ছিক"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={incomeForm.notes}
                    onChange={(e) => setIncomeForm({ ...incomeForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="ঐচ্ছিক"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowIncomeModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 dark:bg-green-700 dark:hover:bg-green-800"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'আয় সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* খরচ যোগ করুন Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold dark:text-white">খরচ যোগ করুন</h2>
                <button onClick={() => setShowExpenseModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ক্যাটাগরি <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={expenseForm.category}
                    onChange={(e) => {
                      setExpenseForm({ ...expenseForm, category: e.target.value });
                      if (expenseErrors.category) setExpenseErrors({ ...expenseErrors, category: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white ${
                      expenseErrors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="যেমন: খাদ্য, ওষুধ, বেতন"
                  />
                  {expenseErrors.category && <p className="mt-1 text-sm text-red-600">{expenseErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    বিবরণ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={expenseForm.description}
                    onChange={(e) => {
                      setExpenseForm({ ...expenseForm, description: e.target.value });
                      if (expenseErrors.description) setExpenseErrors({ ...expenseErrors, description: '' });
                    }}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white ${
                      expenseErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="খরচের বিবরণ"
                  />
                  {expenseErrors.description && <p className="mt-1 text-sm text-red-600">{expenseErrors.description}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পরিমাণ (৳)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ভেন্ডর / সরবরাহকারী</label>
                    <input
                      type="text"
                      value={expenseForm.vendor}
                      onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                      placeholder="ঐচ্ছিক"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={expenseForm.notes}
                    onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder="ঐচ্ছিক"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'খরচ সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FinancialReport;
