'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2, 
  Briefcase, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  DollarSign,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Globe
} from 'lucide-react';
import DashboardLayout from '../../../component/DashboardLayout';
import Swal from 'sweetalert2';

const ManpowerServiceDetails = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/manpower-service/${id}`);
        const data = await response.json();

        if (response.ok) {
          setService(data.service || data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch manpower service');
        }
      } catch (err) {
        console.error('Error fetching manpower service:', err);
        setError(err.message || 'Failed to load manpower service');
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleEdit = () => {
    router.push(`/additional-services/manpower-service/edit/${id}`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই ম্যানপাওয়ার সার্ভিসটি মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল করুন'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/manpower-service/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'ম্যানপাওয়ার সার্ভিস সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          router.push('/additional-services/manpower-service');
        } else {
          throw new Error(data.error || 'Failed to delete manpower service');
        }
      } catch (err) {
        console.error('Error deleting manpower service:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'ম্যানপাওয়ার সার্ভিস মুছে ফেলতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { 
        label: 'সক্রিয়', 
        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        icon: Clock 
      },
      in_process: { 
        label: 'প্রক্রিয়াধীন', 
        color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        icon: Loader2 
      },
      completed: { 
        label: 'সম্পন্ন', 
        color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
        icon: CheckCircle 
      },
      cancelled: { 
        label: 'বাতিল', 
        color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
        icon: XCircle 
      },
      pending: { 
        label: 'অপেক্ষমাণ', 
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
        icon: Clock 
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    const StatusIcon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        <StatusIcon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getServiceTypeLabel = (type) => {
    const types = {
      recruitment: 'নিয়োগ',
      placement: 'প্লেসমেন্ট',
      training: 'প্রশিক্ষণ',
      consultation: 'পরামর্শ',
      other: 'অন্যান্য'
    };
    return types[type] || type || 'নিয়োগ';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !service) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">সেবা খুঁজে পাওয়া যায়নি</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">আপনি যে ম্যানপাওয়ার সার্ভিস খুঁজছেন তা বিদ্যমান নেই।</p>
            <button
              onClick={() => router.push('/additional-services/manpower-service')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              তালিকায় ফিরে যান
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/additional-services/manpower-service')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>তালিকায় ফিরে যান</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                সম্পাদনা
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client/Company Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Building2 className="w-6 h-6" />
                    ক্লায়েন্ট/কোম্পানির তথ্য
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">ক্লায়েন্ট/কোম্পানির নাম</label>
                      <p className="text-gray-900 dark:text-white font-medium text-lg">{service.clientName || service.companyName || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">স্ট্যাটাস</label>
                      {getStatusBadge(service.status)}
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        ফোন
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">{service.phone || '-'}</p>
                    </div>
                    
                    {service.email && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          ইমেইল
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium">{service.email}</p>
                      </div>
                    )}
                    
                    {service.address && (
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          ঠিকানা
                        </label>
                        <p className="text-gray-900 dark:text-white">{service.address}</p>
                      </div>
                    )}

                    {service.country && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          দেশ
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium">{service.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-6 h-6" />
                    সার্ভিসের তথ্য
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">সার্ভিসের ধরন</label>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Briefcase className="w-3.5 h-3.5" />
                        {getServiceTypeLabel(service.serviceType)}
                      </span>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">পদবি/কাজের শিরোনাম</label>
                      <p className="text-gray-900 dark:text-white font-medium text-lg">{service.position || service.jobTitle || '-'}</p>
                    </div>
                    
                    {service.requiredCount && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          প্রয়োজনীয় সংখ্যা
                        </label>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">{service.requiredCount}</p>
                      </div>
                    )}

                    {service.serviceId && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">সার্ভিস আইডি</label>
                        <p className="text-gray-700 dark:text-gray-300 font-mono text-sm">{service.serviceId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    গুরুত্বপূর্ণ তারিখ
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.appliedDate && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">আবেদনের তারিখ</label>
                        <p className="text-gray-900 dark:text-white font-semibold">{formatDate(service.appliedDate)}</p>
                      </div>
                    )}
                    
                    {service.expectedDeliveryDate && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <label className="text-sm text-blue-600 dark:text-blue-400 mb-1 block">প্রত্যাশিত ডেলিভারি</label>
                        <p className="text-blue-900 dark:text-blue-300 font-semibold">{formatDate(service.expectedDeliveryDate)}</p>
                      </div>
                    )}

                    {service.completionDate && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <label className="text-sm text-green-600 dark:text-green-400 mb-1 block">সমাপ্তির তারিখ</label>
                        <p className="text-green-900 dark:text-green-300 font-semibold">{formatDate(service.completionDate)}</p>
                      </div>
                    )}

                    {service.startDate && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <label className="text-sm text-blue-600 dark:text-blue-400 mb-1 block">শুরুর তারিখ</label>
                        <p className="text-blue-900 dark:text-blue-300 font-semibold">{formatDate(service.startDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {service.notes && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <FileText className="w-6 h-6" />
                      নোট
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{service.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Financial & Meta */}
            <div className="space-y-6">
              {/* Financial Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    আর্থিক বিবরণ
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    {service.vendorBill !== undefined && (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">ভেন্ডর বিল</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(service.vendorBill)}</span>
                      </div>
                    )}
                    
                    {service.othersBill !== undefined && (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">অন্যান্য বিল</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(service.othersBill)}</span>
                      </div>
                    )}
                    
                    {service.serviceCharge !== undefined && (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">সার্ভিস চার্জ</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(service.serviceCharge)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 bg-emerald-50 dark:bg-emerald-900/20 -mx-6 px-6 py-4 rounded-b-lg">
                      <span className="font-semibold text-emerald-900 dark:text-emerald-300">মোট বিল</span>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(service.totalBill || service.totalAmount)}</span>
                    </div>
                    
                    {service.paidAmount !== undefined && (
                      <>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">জমা</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(service.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                          <span className="text-gray-600 dark:text-gray-400">বকেয়া</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(service.dueAmount || ((service.totalBill || service.totalAmount || 0) - (service.paidAmount || 0)))}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              {service.vendorName && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      ভেন্ডরের তথ্য
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">ভেন্ডরের নাম</label>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">{service.vendorName}</p>
                      </div>
                      
                      {service.vendorId && (
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">ভেন্ডর আইডি</label>
                          <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">{service.vendorId}</p>
                        </div>
                      )}

                      {service.vendorBill !== undefined && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">ভেন্ডর বিল</label>
                          <p className="text-purple-900 dark:text-purple-300 font-semibold text-lg">{formatCurrency(service.vendorBill)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Meta Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-600 dark:bg-gray-700 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    সিস্টেম তথ্য
                  </h2>
                </div>
                
                <div className="p-6 space-y-3 text-sm">
                  {service.serviceId && (
                    <div>
                      <label className="text-gray-500 dark:text-gray-400 mb-1 block">সার্ভিস আইডি</label>
                      <p className="text-gray-700 dark:text-gray-300 font-mono text-xs break-all">{service.serviceId}</p>
                    </div>
                  )}
                  
                  {service._id && (
                    <div>
                      <label className="text-gray-500 dark:text-gray-400 mb-1 block">Service ID</label>
                      <p className="text-gray-700 dark:text-gray-300 font-mono text-xs break-all">{service._id}</p>
                    </div>
                  )}
                  
                  {service.createdAt && (
                    <div>
                      <label className="text-gray-500 dark:text-gray-400 mb-1 block">তৈরি করা হয়েছে</label>
                      <p className="text-gray-700 dark:text-gray-300">{new Date(service.createdAt).toLocaleString('bn-BD')}</p>
                    </div>
                  )}
                  
                  {service.updatedAt && (
                    <div>
                      <label className="text-gray-500 dark:text-gray-400 mb-1 block">শেষ আপডেট</label>
                      <p className="text-gray-700 dark:text-gray-300">{new Date(service.updatedAt).toLocaleString('bn-BD')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManpowerServiceDetails;
