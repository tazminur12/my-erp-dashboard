'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { ArrowLeft, Receipt, Calendar, FileText, User, Pencil, Trash2, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const ExpenseDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/miraj-industries/farm-expenses/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setExpense(data.expense || data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch expense');
        }
      } catch (error) {
        console.error('Error fetching expense:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'খরচের তথ্য লোড করতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে'
        }).then(() => {
          router.back();
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchExpense();
    }
  }, [id, router]);

  const handleDelete = async () => {
    if (!id) return;
    
    const result = await Swal.fire({
      title: 'খরচ মুছে ফেলবেন?',
      text: 'এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/miraj-industries/farm-expenses/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: 'মুছে ফেলা হয়েছে',
          text: 'খরচ সফলভাবে মুছে ফেলা হয়েছে',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false
        });
        router.back();
      } else {
        throw new Error(data.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      Swal.fire({
        title: 'ব্যর্থ',
        text: error.message || 'খরচ মুছে ফেলতে ব্যর্থ',
        icon: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!expense) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <p className="text-gray-500 dark:text-gray-400">খরচের তথ্য পাওয়া যায়নি</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6 dark:bg-gray-900 min-h-screen">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">খরচের বিস্তারিত</h1>
              <p className="text-gray-600 dark:text-gray-400">ID: {id}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/miraj-industries/expense/${id}/edit`)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" /> সম্পাদনা
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 disabled:opacity-60 dark:bg-red-700 dark:hover:bg-red-800"
              >
                <Trash2 className="w-4 h-4" /> {isDeleting ? 'মুছে ফেলছেন...' : 'মুছে ফেলুন'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center ring-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ring-red-100 dark:ring-red-800">
              <Receipt className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{expense.vendor || 'খরচ'}</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{expense.id}</span>
              </div>
              {expense.description && (
                <p className="mt-1 text-gray-600 dark:text-gray-400">{expense.description}</p>
              )}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ক্যাটাগরি</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{expense.category || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">মোট পরিমাণ</p>
                    <p className="text-2xl md:text-3xl font-extrabold text-red-600 dark:text-red-400">
                      ৳{Number(expense.amount || 0).toLocaleString('bn-BD')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">তৈরি হয়েছে</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString('bn-BD') : '—'}
                    </p>
                  </div>
                </div>
                {expense.vendor && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ভেন্ডর</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{expense.vendor}</p>
                    </div>
                  </div>
                )}
              </div>

              {expense.notes && (
                <div className="mt-4 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">নোট</p>
                  <p className="text-sm text-gray-800 dark:text-white">{expense.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExpenseDetails;
