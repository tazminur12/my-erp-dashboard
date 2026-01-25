'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  Server, 
  ArrowLeft, 
  Edit, 
  Trash2,
  Loader2,
  Globe,
  Database,
  User,
  Phone,
  Mail,
  Percent,
  Key,
  FileText,
  Clock,
  Building2,
  Hash,
  Ticket,
  DollarSign,
  Copy,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';

// GDS Provider colors
const GDS_PROVIDERS = {
  'Amadeus': { color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-900/20' },
  'Sabre': { color: 'from-red-500 to-red-600', bgLight: 'bg-red-50 dark:bg-red-900/20' },
  'Galileo': { color: 'from-orange-500 to-orange-600', bgLight: 'bg-orange-50 dark:bg-orange-900/20' },
  'Worldspan': { color: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-900/20' },
  'Travelport': { color: 'from-green-500 to-green-600', bgLight: 'bg-green-50 dark:bg-green-900/20' },
  'Other': { color: 'from-gray-500 to-gray-600', bgLight: 'bg-gray-50 dark:bg-gray-900/20' }
};

const GDSDetails = () => {
  const router = useRouter();
  const params = useParams();
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/air-ticketing/gds/${params.id}`);
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
          text: 'GDS লোড করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444'
        }).then(() => {
          router.push('/air-ticketing/gds');
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
      text: `"${record.name}" মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।`,
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
        const response = await fetch(`/api/air-ticketing/gds/${params.id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'GDS সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981'
          }).then(() => {
            router.push('/air-ticketing/gds');
          });
        } else {
          throw new Error(data.error || 'Delete failed');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'GDS মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444'
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getProviderStyle = (provider) => {
    return GDS_PROVIDERS[provider] || GDS_PROVIDERS['Other'];
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
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
            <Server className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">GDS খুঁজে পাওয়া যায়নি</h3>
            <Link
              href="/air-ticketing/gds"
              className="text-indigo-600 hover:text-indigo-700"
            >
              তালিকায় ফিরে যান
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const providerStyle = getProviderStyle(record.provider);

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/air-ticketing/gds"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ফিরে যান
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Server className="w-8 h-8 text-indigo-600" />
                GDS বিস্তারিত
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {record.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/air-ticketing/gds/${params.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
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
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className={`bg-gradient-to-r ${providerStyle.color} rounded-xl shadow-lg p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Server className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{record.name}</h2>
                    <p className="text-white/80">{record.provider}</p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  record.status === 'Active'
                    ? 'bg-white/20 text-white'
                    : 'bg-red-500/50 text-white'
                }`}>
                  {record.status === 'Active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                <div className="text-center">
                  <p className="text-3xl font-bold">{record.stats?.totalTickets || 0}</p>
                  <p className="text-sm text-white/70">মোট টিকেট</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">৳{(record.stats?.totalRevenue || 0).toLocaleString('bn-BD')}</p>
                  <p className="text-sm text-white/70">মোট আয়</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{record.commissionRate || 0}%</p>
                  <p className="text-sm text-white/70">কমিশন</p>
                </div>
              </div>
            </div>

            {/* GDS Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                GDS তথ্য
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {record.gdsCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">GDS Code</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">{record.gdsCode}</span>
                      <button
                        onClick={() => copyToClipboard(record.gdsCode, 'gdsCode')}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {copiedField === 'gdsCode' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {record.pccCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">PCC Code</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">{record.pccCode}</span>
                      <button
                        onClick={() => copyToClipboard(record.pccCode, 'pccCode')}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {copiedField === 'pccCode' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {record.queueNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Queue Number</label>
                    <span className="text-gray-900 dark:text-white">{record.queueNumber}</span>
                  </div>
                )}

                {record.accountId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Account ID</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-900 dark:text-white">{record.accountId}</span>
                      <button
                        onClick={() => copyToClipboard(record.accountId, 'accountId')}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {copiedField === 'accountId' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {record.signInId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sign-in ID</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-900 dark:text-white">{record.signInId}</span>
                      <button
                        onClick={() => copyToClipboard(record.signInId, 'signInId')}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {copiedField === 'signInId' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            {(record.contactPerson || record.contactPhone || record.contactEmail) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  যোগাযোগের তথ্য
                </h3>

                <div className="space-y-4">
                  {record.contactPerson && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{record.contactPerson}</span>
                    </div>
                  )}

                  {record.contactPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${record.contactPhone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {record.contactPhone}
                      </a>
                    </div>
                  )}

                  {record.contactEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${record.contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {record.contactEmail}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Remarks */}
            {record.remarks && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  মন্তব্য / নোট
                </h3>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg whitespace-pre-wrap">
                  {record.remarks}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Meta Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">দ্রুত অ্যাকশন</h3>
              <div className="space-y-3">
                <Link
                  href={`/air-ticketing/tickets/add?gdsId=${params.id}`}
                  className="flex items-center gap-3 w-full p-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg text-indigo-700 dark:text-indigo-300 transition-colors"
                >
                  <Ticket className="w-5 h-5" />
                  <span>এই GDS দিয়ে টিকেট বিক্রি</span>
                </Link>
                <Link
                  href={`/air-ticketing/gds/${params.id}/edit`}
                  className="flex items-center gap-3 w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span>তথ্য সম্পাদনা করুন</span>
                </Link>
              </div>
            </div>

            {/* Meta Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">অতিরিক্ত তথ্য</h3>
              
              <div className="space-y-4">
                {record.branchName && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ব্রাঞ্চ</p>
                      <p className="text-gray-900 dark:text-white">{record.branchName}</p>
                    </div>
                  </div>
                )}

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
                          day: 'numeric'
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
                          day: 'numeric'
                        })}
                      </p>
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

export default GDSDetails;
