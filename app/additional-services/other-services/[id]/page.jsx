'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2, 
  Package, 
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
  CreditCard
} from 'lucide-react';
import DashboardLayout from '../../../component/DashboardLayout';
import Swal from 'sweetalert2';

const OtherServiceDetails = () => {
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
        const response = await fetch(`/api/other-services/${id}`);
        const data = await response.json();

        if (response.ok) {
          setService(data.service || data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch other service');
        }
      } catch (err) {
        console.error('Error fetching other service:', err);
        setError(err.message || 'Failed to load other service');
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleEdit = () => {
    router.push(`/additional-services/other-services/edit/${id}`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই অন্যান্য সার্ভিসটি মুছে ফেলতে চান?',
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
        const response = await fetch(`/api/other-services/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'অন্যান্য সার্ভিস সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          router.push('/additional-services/other-services');
        } else {
          throw new Error(data.error || 'Failed to delete other service');
        }
      } catch (err) {
        console.error('Error deleting other service:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'অন্যান্য সার্ভিস মুছে ফেলতে সমস্যা হয়েছে',
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
      pending: { 
        label: 'পেন্ডিং', 
        color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        icon: Clock 
      },
      in_process: { 
        label: 'প্রক্রিয়াধীন', 
        color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        icon: Loader2 
      },
      processing: { 
        label: 'প্রসেসিং', 
        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
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
      on_hold: { 
        label: 'হোল্ডে আছে', 
        color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        icon: Clock 
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        <StatusIcon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      general: 'General Service',
      consultation: 'Consultation',
      documentation: 'Documentation',
      translation: 'Translation',
      attestation: 'Attestation',
      medical: 'Medical Test',
      training: 'Training',
      other: 'Other'
    };
    return labels[type] || type || 'General Service';
  };

  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">অন্যান্য সার্ভিস খুঁজে পাওয়া যায়নি</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">দুঃখিত, এই সার্ভিসটি খুঁজে পাওয়া যায়নি।</p>
            <button
              onClick={() => router.push('/additional-services/other-services')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              সার্ভিস তালিকায় ফিরে যান
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
                onClick={() => router.push('/additional-services/other-services')}
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
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-6 h-6" />
                    মৌলিক তথ্য
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        ক্লায়েন্ট ID
                      </label>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-mono font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" style={{ fontFamily: "'Google Sans', monospace" }}>
                        {service.clientId || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">ক্লায়েন্টের নাম</label>
                      <p className="text-gray-900 dark:text-white font-medium text-lg">{service.clientName || service.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">সার্ভিসের ধরন</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {getServiceTypeLabel(service.serviceType)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">স্ট্যাটাস</label>
                      {getStatusBadge(service.status)}
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        ফোন নম্বর
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{service.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        ইমেইল
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{service.email || 'N/A'}</p>
                    </div>
                    {service.address && (
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          ঠিকানা
                        </label>
                        <p className="text-gray-900 dark:text-white">{service.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    সার্ভিসের বিস্তারিত
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  {service.description && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">বর্ণনা</label>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{service.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        তারিখ
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">{formatDate(service.serviceDate || service.date)}</p>
                    </div>
                    {(service.deliveryDate || service.expectedDeliveryDate) && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          প্রত্যাশিত ডেলিভারি
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formatDate(service.deliveryDate || service.expectedDeliveryDate)}
                        </p>
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
                      অতিরিক্ত নোট
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
                    {(service.vendorCost !== undefined || service.vendorBill !== undefined) && (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">ভেন্ডর বিল</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(service.vendorCost || service.vendorBill || 0)}</span>
                      </div>
                    )}
                    
                    {(service.otherCost !== undefined || service.othersBill !== undefined) && (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">অন্যান্য বিল</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(service.otherCost || service.othersBill || 0)}</span>
                      </div>
                    )}
                    
                    {(service.serviceFee !== undefined || service.serviceCharge !== undefined) && (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">সার্ভিস চার্জ</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(service.serviceFee || service.serviceCharge || 0)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 bg-emerald-50 dark:bg-emerald-900/20 -mx-6 px-6 py-4 rounded-b-lg">
                      <span className="font-semibold text-emerald-900 dark:text-emerald-300">মোট বিল</span>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(service.totalAmount || service.totalBill || 0)}</span>
                    </div>
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
                          <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>Vendor ID</label>
                          <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">{service.vendorId}</p>
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

export default OtherServiceDetails;
