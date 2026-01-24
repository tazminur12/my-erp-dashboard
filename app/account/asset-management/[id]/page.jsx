'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { ArrowLeft, Building, DollarSign, Calendar, Package, Edit, Trash2, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const AssetDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/assets/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setAsset(data.asset || data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch asset');
        }
      } catch (error) {
        console.error('Error fetching asset:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'সম্পদের তথ্য লোড করতে ব্যর্থ হয়েছে',
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
      fetchAsset();
    }
  }, [id, router]);

  const handleDelete = async () => {
    if (!id) return;
    
    const result = await Swal.fire({
      title: 'সম্পদ মুছে ফেলবেন?',
      text: 'এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: 'মুছে ফেলা হয়েছে',
          text: 'সম্পদ সফলভাবে মুছে ফেলা হয়েছে',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false
        });
        router.push('/account/asset-management');
      } else {
        throw new Error(data.error || 'Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      Swal.fire({
        title: 'ব্যর্থ',
        text: error.message || 'সম্পদ মুছে ফেলতে ব্যর্থ',
        icon: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('bn-BD');
  };

  const assetTypeLabels = {
    'Office Equipment': 'অফিস সরঞ্জাম',
    'Vehicle': 'যানবাহন',
    'Furniture': 'আসবাবপত্র',
    'IT Equipment': 'আইটি সরঞ্জাম',
    'Other': 'অন্যান্য'
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

  if (!asset) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <p className="text-gray-500 dark:text-gray-400">সম্পদের তথ্য পাওয়া যায়নি</p>
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
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">সম্পদের বিস্তারিত</h1>
              <p className="text-gray-600 dark:text-gray-400">ID: {id}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/account/asset-management/${id}/edit`)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> সম্পাদনা
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
            <div className="w-14 h-14 rounded-xl flex items-center justify-center ring-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-blue-100 dark:ring-blue-800">
              <Building className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{asset.name}</h2>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ধরণ</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {assetTypeLabels[asset.type] || asset.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">মোট মূল্য</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {formatCurrency(asset.totalPaidAmount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ক্রয়ের তারিখ</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {formatDate(asset.purchaseDate)}
                    </p>
                  </div>
                </div>
                {asset.providerCompanyName && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <Building className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">প্রোভাইডার</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {asset.providerCompanyName}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">পরিশোধের ধরন</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {asset.paymentType === 'one-time' ? 'এককালীন' : 'কিস্তি'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">স্ট্যাটাস</p>
                    <p className={`text-sm font-semibold ${
                      asset.status === 'active' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {asset.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </p>
                  </div>
                </div>
              </div>

              {asset.paymentType === 'installment' && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">কিস্তির তথ্য</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">কিস্তির সংখ্যা</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{asset.numberOfInstallments}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">প্রতি কিস্তির পরিমাণ</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(asset.installmentAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">শুরু তারিখ</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {formatDate(asset.installmentStartDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">শেষ তারিখ</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {formatDate(asset.installmentEndDate)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {asset.notes && (
                <div className="mt-4 p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">নোট</p>
                  <p className="text-sm text-gray-800 dark:text-white">{asset.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssetDetails;
