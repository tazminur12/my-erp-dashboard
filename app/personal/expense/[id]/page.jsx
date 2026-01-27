'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import { ArrowLeft, Receipt, Calendar, TrendingUp, Loader2, XCircle, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const PersonalExpenseDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpense = async () => {
      if (!id) {
        setError(new Error('Expense ID is required'));
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch(`/api/personal-expense/${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || data.error || 'খরচ পাওয়া যায়নি');
        }
        setExpense(data.item || data.data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  const handleDelete = async () => {
    const res = await Swal.fire({
      title: 'নিশ্চিত করুন',
      text: 'এই খরচটি মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (!res.isConfirmed) return;

    try {
      const response = await fetch(`/api/personal-expense/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'মুছে ফেলতে ব্যর্থ');
      }
      Swal.fire({
        icon: 'success',
        title: 'মুছে ফেলা হয়েছে',
        timer: 1500,
        showConfirmButton: false
      });
      router.push('/personal/expense');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: err.message || 'মুছে ফেলতে ব্যর্থ',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">খরচ লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !expense) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error?.message || 'খরচ পাওয়া যায়নি'}</p>
              <Link
                href="/personal/expense"
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <Link
              href="/personal/expense"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">খরচের বিস্তারিত</h1>
              <p className="text-gray-600 dark:text-gray-400">{expense.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/personal/expense/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 transition-colors"
            >
              সম্পাদনা করুন
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-red-50 text-red-600 dark:bg-gray-700 dark:hover:bg-red-900/30 dark:text-red-400 px-4 py-2.5 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              মুছে ফেলুন
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">তারিখ</p>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(expense.date)}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">খাত</p>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                {expense.category}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">টাকার পরিমাণ</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(expense.amount)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">ধরন ও ফ্রিকোয়েন্সি</p>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  expense.expenseType === 'Regular' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {expense.expenseType === 'Regular' ? 'নিয়মিত' : 'অনিয়মিত'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {expense.frequency === 'Monthly' ? 'মাসিক' : expense.frequency === 'Yearly' ? 'বৎসারিক' : expense.frequency}
                </span>
              </div>
            </div>
          </div>

          {expense.note && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">বিবরণ / নোট</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                {expense.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PersonalExpenseDetails;
