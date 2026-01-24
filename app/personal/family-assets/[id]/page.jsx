'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/app/component/DashboardLayout';
import {
  ArrowLeft,
  Edit,
  Building,
  DollarSign,
  Calendar,
  Package,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Truck,
  Monitor,
  Home,
  Settings
} from 'lucide-react';

const FamilyAssetDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) {
        setError(new Error('Asset ID is required'));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/family-assets/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setAsset(data.asset || data.data);
        } else {
          setError(new Error(data.message || data.error || 'Asset not found'));
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAssetTypeIcon = (type) => {
    switch (type) {
      case 'Office Equipment':
        return <Settings className="w-5 h-5" />;
      case 'Vehicle':
        return <Truck className="w-5 h-5" />;
      case 'Furniture':
        return <Home className="w-5 h-5" />;
      case 'IT Equipment':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getAssetTypeLabel = (type) => {
    const labels = {
      'Office Equipment': 'অফিস সরঞ্জাম',
      'Vehicle': 'যানবাহন',
      'Furniture': 'আসবাবপত্র',
      'IT Equipment': 'আইটি সরঞ্জাম',
      'Other': 'অন্যান্য'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">পারিবারিক সম্পদ লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !asset) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">
                {error?.message || 'সম্পদ পাওয়া যায়নি'}
              </p>
              <Link
                href="/personal/family-assets"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <Link
              href="/personal/family-assets"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{asset.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">পারিবারিক সম্পদের সম্পূর্ণ বিবরণ</p>
            </div>
          </div>

          <Link
            href={`/personal/family-assets/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5"
          >
            <Edit className="w-4 h-4" />
            সম্পাদনা করুন
          </Link>
        </div>

        {/* Status Badge */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {asset.status === 'active' ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">স্ট্যাটাস</p>
                <p className={`text-lg font-semibold ${
                  asset.status === 'active'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {asset.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getAssetTypeIcon(asset.type)}
              <span className="text-sm text-gray-600 dark:text-gray-400">{getAssetTypeLabel(asset.type)}</span>
            </div>
          </div>
        </div>

        {/* Main Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              মৌলিক তথ্য
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">সম্পদের নাম</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">{asset.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">সম্পদের ধরণ</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">{getAssetTypeLabel(asset.type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ক্রয়ের তারিখ</p>
                <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(asset.purchaseDate)}
                </p>
              </div>
              {asset.providerCompanyName && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">প্রোভাইডার / সরবরাহকারী</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{asset.providerCompanyName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              আর্থিক তথ্য
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">মোট পরিশোধিত মূল্য</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(asset.totalPaidAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">পরিশোধের ধরন</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  asset.paymentType === 'one-time'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>
                  {asset.paymentType === 'one-time' ? 'এককালীন পরিশোধ' : 'কিস্তি'}
                </span>
              </div>
              {asset.paymentType === 'one-time' && asset.paymentDate && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">পরিশোধের তারিখ</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(asset.paymentDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Installment Information (if applicable) */}
        {asset.paymentType === 'installment' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              কিস্তির তথ্য
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {asset.numberOfInstallments && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">মোট কিস্তির সংখ্যা</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{asset.numberOfInstallments}</p>
                </div>
              )}
              {asset.installmentAmount && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">প্রতি কিস্তির পরিমাণ</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(asset.installmentAmount)}
                  </p>
                </div>
              )}
              {asset.installmentStartDate && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">কিস্তি শুরু তারিখ</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(asset.installmentStartDate)}
                  </p>
                </div>
              )}
              {asset.installmentEndDate && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">কিস্তি শেষ তারিখ</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(asset.installmentEndDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {asset.notes && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              নোট / মন্তব্য
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{asset.notes}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">অতিরিক্ত তথ্য</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {asset.createdAt && (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">তৈরি করা হয়েছে</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(asset.createdAt).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
            {asset.updatedAt && (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">সর্বশেষ আপডেট</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(asset.updatedAt).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FamilyAssetDetails;
