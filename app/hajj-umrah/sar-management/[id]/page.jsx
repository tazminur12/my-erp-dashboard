'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  Scale, 
  ArrowLeft, 
  Edit, 
  Trash2,
  Loader2,
  Calendar,
  DollarSign,
  User,
  Clock,
  FileText,
  Package,
  Building2
} from 'lucide-react';
import Swal from 'sweetalert2';

const SARRecordDetails = () => {
  const router = useRouter();
  const params = useParams();
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/hajj-umrah/sar-management/${params.id}`);
        const result = await response.json();

        if (response.ok) {
          setRecord(result.data);
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
  }, [params.id, router]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `"${record.packageName}" মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/hajj-umrah/sar-management/${params.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'রেকর্ড সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981'
          }).then(() => {
            router.push('/hajj-umrah/sar-management');
          });
        } else {
          throw new Error('Delete failed');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'রেকর্ড মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444'
        });
      } finally {
        setIsDeleting(false);
      }
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

  if (!record) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Scale className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">রেকর্ড খুঁজে পাওয়া যায়নি</h3>
            <Link
              href="/hajj-umrah/sar-management"
              className="text-emerald-600 hover:text-emerald-700"
            >
              তালিকায় ফিরে যান
            </Link>
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
            href="/hajj-umrah/sar-management"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ফিরে যান
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Scale className="w-8 h-8 text-emerald-600" />
                SAR রেকর্ড বিস্তারিত
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {record.packageName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/hajj-umrah/sar-management/${params.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                <Edit className="w-4 h-4" />
                সম্পাদনা
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              রেকর্ড তথ্য
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    প্যাকেজের নাম
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {record.packageName}
                  </p>
                </div>

                {record.transactionName && record.transactionName !== record.packageName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      লেনদেনের নাম
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {record.transactionName}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      সাল
                    </span>
                  </label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {record.year}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    স্ট্যাটাস
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    record.status === 'Active'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {record.status === 'Active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>
              </div>

              {record.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      বিবরণ
                    </span>
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {record.description}
                  </p>
                </div>
              )}

              {record.branchName && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      ব্রাঞ্চ
                    </span>
                  </label>
                  <p className="text-gray-700 dark:text-gray-300">
                    {record.branchName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Side Cards */}
          <div className="space-y-6">
            {/* SAR Rate Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-6 h-6" />
                <h3 className="text-lg font-semibold">সৌদি রিয়াল রেট</h3>
              </div>
              <div className="text-center py-4">
                <p className="text-4xl font-bold">
                  ৳{record.sarRate?.toLocaleString('bn-BD')}
                </p>
                <p className="text-emerald-100 mt-2">প্রতি SAR</p>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-400/30">
                <p className="text-sm text-emerald-100">
                  এই রেট {record.year} সালের জন্য প্রযোজ্য
                </p>
              </div>
            </div>

            {/* Meta Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                অতিরিক্ত তথ্য
              </h3>
              
              <div className="space-y-4">
                {record.createdByName && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">তৈরি করেছেন</p>
                      <p className="text-gray-900 dark:text-white">{record.createdByName}</p>
                    </div>
                  </div>
                )}

                {record.createdAt && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">তৈরির তারিখ</p>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(record.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {record.updatedAt && record.updatedAt !== record.createdAt && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">সর্বশেষ আপডেট</p>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(record.updatedAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {record.updatedByName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          by {record.updatedByName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SARRecordDetails;
