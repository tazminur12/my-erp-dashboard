'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../component/DashboardLayout';
import { 
  Scale, 
  ArrowLeft, 
  Save, 
  Loader2,
  Calendar,
  DollarSign,
  FileText,
  Package
} from 'lucide-react';
import Swal from 'sweetalert2';

const EditSARRecord = () => {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());

  const [formData, setFormData] = useState({
    packageName: '',
    transactionName: '',
    year: currentYear.toString(),
    sarRate: '',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/hajj-umrah/sar-management/${params.id}`);
        const result = await response.json();

        if (response.ok && result.data) {
          setFormData({
            packageName: result.data.packageName || '',
            transactionName: result.data.transactionName || '',
            year: result.data.year || currentYear.toString(),
            sarRate: result.data.sarRate?.toString() || '',
            description: result.data.description || '',
            status: result.data.status || 'Active'
          });
        } else {
          throw new Error(result.error || 'Record not found');
        }
      } catch (error) {
        console.error('Error fetching record:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'রেকর্ড লোড করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444'
        }).then(() => {
          router.push('/hajj-umrah/sar-management');
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchRecord();
    }
  }, [params.id, router, currentYear]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.packageName || !formData.year || !formData.sarRate) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'প্যাকেজের নাম, সাল এবং SAR রেট আবশ্যক',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/hajj-umrah/sar-management/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          sarRate: parseFloat(formData.sarRate)
        })
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'SAR রেকর্ড সফলভাবে আপডেট হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981'
        }).then(() => {
          router.push(`/hajj-umrah/sar-management/${params.id}`);
        });
      } else {
        throw new Error(result.error || 'Failed to update record');
      }
    } catch (error) {
      console.error('Error updating SAR record:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'রেকর্ড আপডেট করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">ডাটা লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/hajj-umrah/sar-management/${params.id}`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ফিরে যান
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Scale className="w-8 h-8 text-emerald-600" />
            SAR রেকর্ড সম্পাদনা
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {formData.packageName || 'রেকর্ড'} সম্পাদনা করুন
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-3xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Package Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  প্যাকেজের নাম <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                name="packageName"
                value={formData.packageName}
                onChange={handleChange}
                placeholder="যেমন: হজ্জ প্যাকেজ ২০২৬"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Transaction Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  লেনদেনের নাম
                </span>
              </label>
              <input
                type="text"
                name="transactionName"
                value={formData.transactionName}
                onChange={handleChange}
                placeholder="(ঐচ্ছিক) আলাদা লেনদেনের নাম"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                খালি রাখলে প্যাকেজের নাম ব্যবহার হবে
              </p>
            </div>

            {/* Year & SAR Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    সাল <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    সৌদি রিয়াল রেট (BDT) <span className="text-red-500">*</span>
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">৳</span>
                  <input
                    type="number"
                    name="sarRate"
                    value={formData.sarRate}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  ১ SAR = কত BDT
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                স্ট্যাটাস
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Active">সক্রিয়</option>
                <option value="Inactive">নিষ্ক্রিয়</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                বিবরণ (ঐচ্ছিক)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="অতিরিক্ত তথ্য বা নোট..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Preview Card */}
            {formData.packageName && formData.sarRate && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">প্রিভিউ</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{formData.packageName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">সাল: {formData.year}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{parseFloat(formData.sarRate || 0).toLocaleString('bn-BD')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">প্রতি SAR</p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/hajj-umrah/sar-management/${params.id}`}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                বাতিল
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    আপডেট করুন
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditSARRecord;
