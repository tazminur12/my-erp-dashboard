'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { ArrowLeft, TrendingUp, Calendar, FileText, User, Pencil, Trash2, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const IncomeDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [income, setIncome] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/miraj-industries/farm-incomes/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setIncome(data.income || data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch income');
        }
      } catch (error) {
        console.error('Error fetching income:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'আয়ের তথ্য লোড করতে ব্যর্থ হয়েছে',
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
      fetchIncome();
    }
  }, [id, router]);

  const handleDelete = async () => {
    if (!id) return;
    
    const result = await Swal.fire({
      title: 'আয় মুছে ফেলবেন?',
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
      const response = await fetch(`/api/miraj-industries/farm-incomes/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: 'মুছে ফেলা হয়েছে',
          text: 'আয় সফলভাবে মুছে ফেলা হয়েছে',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false
        });
        router.back();
      } else {
        throw new Error(data.error || 'Failed to delete income');
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      Swal.fire({
        title: 'ব্যর্থ',
        text: error.message || 'আয় মুছে ফেলতে ব্যর্থ',
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

  if (!income) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <p className="text-gray-500 dark:text-gray-400">আয়ের তথ্য পাওয়া যায়নি</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">আয়ের বিস্তারিত</h1>
              <p className="text-gray-600 dark:text-gray-400">ID: {id}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/miraj-industries/income/${id}/edit`)}
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
            <div className="w-14 h-14 rounded-xl flex items-center justify-center ring-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 ring-green-100 dark:ring-green-800">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{income.customer || 'আয়'}</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{income.id}</span>
              </div>
              {income.description && (
                <p className="mt-1 text-gray-600 dark:text-gray-400">{income.description}</p>
              )}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">উৎস</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{income.source || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">তারিখ</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {income.date ? new Date(income.date).toLocaleDateString('bn-BD') : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">পেমেন্ট ধরন</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {income.paymentMethod === 'cash' ? 'ক্যাশ' : 
                       income.paymentMethod === 'bank' ? 'ব্যাংক' :
                       income.paymentMethod === 'mobile' ? 'মোবাইল ব্যাংকিং' : 'অন্যান্য'}
                    </p>
                  </div>
                </div>
              </div>

              {income.notes && (
                <div className="mt-4 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">নোট</p>
                  <p className="text-sm text-gray-800 dark:text-white">{income.notes}</p>
                </div>
              )}

              <div className="mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">পরিমাণ</p>
                <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                  ৳{Number(income.amount || 0).toLocaleString('bn-BD')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IncomeDetails;
