'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Scale,
  Megaphone,
  Laptop,
  CreditCard,
  Package,
  Receipt,
  RotateCcw,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

const ICONS = { FileText, Scale, Megaphone, Laptop, CreditCard, Package, Receipt, RotateCcw };

const CategoryDetails = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) {
        setError('Category ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/operating-expenses/categories/${id}`);
        const data = await response.json();

        if (response.ok && data.category) {
          const cat = data.category;
          setCategory({
            ...cat,
            icon: ICONS[cat.iconKey] || FileText,
          });
        } else {
          throw new Error(data.error || 'Failed to fetch category');
        }
      } catch (err) {
        console.error('Error fetching category:', err);
        setError(err.message || 'Failed to load category');
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'ক্যাটাগরি লোড করতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `${category?.name || 'এই ক্যাটাগরি'} মুছে ফেলবেন?`,
      text: 'এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/operating-expenses/categories/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          await Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
          router.push('/office-management/operating-expenses');
        } else {
          throw new Error(data.error || 'Failed to delete category');
        }
      } catch (err) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: err?.message || 'ক্যাটাগরি মুছে ফেলতে ব্যর্থ।',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">ক্যাটাগরি লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !category) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ক্যাটাগরি পাওয়া যায়নি
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'ক্যাটাগরি পাওয়া যায়নি বা মুছে ফেলা হয়েছে।'}
              </p>
              <button
                onClick={() => router.push('/office-management/operating-expenses')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ক্যাটাগরি তালিকায় ফিরে যান
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = category.icon;

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ফিরে যান</span>
            </button>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${category.bgColor || 'bg-blue-50 dark:bg-blue-900/20'} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-8 h-8 ${category.iconColor || 'text-blue-600 dark:text-blue-400'}`} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{category.name}</h1>
                  {category.banglaName && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{category.banglaName}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Link
                  href={`/office-management/operating-expenses/${id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  সম্পাদনা
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  মুছে ফেলুন
                </button>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">ক্যাটাগরি তথ্য</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">ইংরেজি নাম</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</p>
              </div>

              {category.banglaName && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">বাংলা নাম</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{category.banglaName}</p>
                </div>
              )}

              {category.description && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">বর্ণনা</label>
                  <p className="text-gray-900 dark:text-white">{category.description}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">মোট খরচ</label>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(category.totalAmount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">আইটেম সংখ্যা</label>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category.itemCount || 0}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">তৈরি হয়েছে</label>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(category.createdAt).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">সর্বশেষ আপডেট</label>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(category.updatedAt).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CategoryDetails;
