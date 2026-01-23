'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2, 
  FileCheck, 
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

const PassportServiceDetails = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // Loading and data states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [service, setService] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/passport-services/${id}`);
        const data = await response.json();

        if (response.ok) {
          setService(data.service || data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch passport service');
        }
      } catch (err) {
        console.error('Error fetching passport service:', err);
        setError(err.message || 'Failed to load passport service');
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleEdit = () => {
    router.push(`/additional-services/passport-service/edit/${id}`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই পাসপোর্ট সার্ভিসটি মুছে ফেলতে চান?',
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
        const response = await fetch(`/api/passport-services/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'পাসপোর্ট সার্ভিস সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          router.push('/additional-services/passport-service');
        } else {
          throw new Error(data.error || 'Failed to delete passport service');
        }
      } catch (err) {
        console.error('Error deleting passport service:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'পাসপোর্ট সার্ভিস মুছতে সমস্যা হয়েছে',
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
        label: 'বিচারাধীন', 
        color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        icon: Clock 
      },
      in_process: { 
        label: 'প্রক্রিয়াধীন', 
        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: Loader2 
      },
      completed: { 
        label: 'সম্পন্ন', 
        color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: CheckCircle 
      },
      cancelled: { 
        label: 'বাতিল', 
        color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: XCircle 
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
    const types = {
      new_passport: 'নতুন পাসপোর্ট',
      renewal: 'পাসপোর্ট নবায়ন',
      replacement: 'পাসপোর্ট প্রতিস্থাপন',
      visa_stamping: 'ভিসা স্ট্যাম্পিং',
      correction: 'সংশোধন',
      other: 'অন্যান্য'
    };
    return types[type] || type || 'স্ট্যান্ডার্ড';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !service) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">সার্ভিস খুঁজে পাওয়া যায়নি</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">আপনি যে পাসপোর্ট সার্ভিস খুঁজছেন তা বিদ্যমান নেই।</p>
            {id && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Service ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{id}</code>
              </p>
            )}
            <button
              onClick={() => router.push('/additional-services/passport-service')}
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
                onClick={() => router.push('/additional-services/passport-service')}
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
              {/* Client Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-6 h-6" />
                    ক্লায়েন্টের তথ্য
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">ক্লায়েন্টের নাম</label>
                      <p className="text-gray-900 dark:text-white font-medium text-lg">{service.clientName || '-'}</p>
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
                  </div>
                </div>
              </div>

              {/* Passport Service Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-6 h-6" />
                    পাসপোর্ট সার্ভিসের তথ্য
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">সার্ভিসের ধরন</label>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                        <FileCheck className="w-3.5 h-3.5" />
                        {getServiceTypeLabel(service.serviceType)}
                      </span>
                    </div>

                    {service.passportNumber && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          পাসপোর্ট নম্বর
                        </label>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg font-mono">{service.passportNumber}</p>
                      </div>
                    )}
                    
                    {service.serviceId && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">সার্ভিস আইডি</label>
                        <p className="text-gray-700 dark:text-gray-300 font-mono text-sm">{service.serviceId}</p>
                      </div>
                    )}

                    {service.applicantName && service.applicantName !== service.clientName && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">আবেদনকারীর নাম</label>
                        <p className="text-gray-900 dark:text-white font-medium">{service.applicantName}</p>
                      </div>
                    )}

                    {service.deliveryType && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">ডেলিভারি ধরন</label>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {service.deliveryType === 'normal' ? 'সাধারণ' : 
                           service.deliveryType === 'express' ? 'দ্রুত' : 
                           service.deliveryType === 'urgent' ? 'জরুরি' : 
                           service.deliveryType === 'regular' ? 'সাধারণ' :
                           service.deliveryType === 'super_express' ? 'সুপার এক্সপ্রেস' :
                           service.deliveryType}
                        </span>
                      </div>
                    )}

                    {service.applicationNumber && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">আবেদন নম্বর</label>
                        <p className="text-gray-900 dark:text-white font-medium">{service.applicationNumber}</p>
                      </div>
                    )}

                    {service.validity && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">মেয়াদ</label>
                        <p className="text-gray-900 dark:text-white font-medium">{service.validity} বছর</p>
                      </div>
                    )}

                    {service.pages && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">পৃষ্ঠা</label>
                        <p className="text-gray-900 dark:text-white font-medium">{service.pages} পৃষ্ঠা</p>
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
                    {service.date && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">আবেদনের তারিখ</label>
                        <p className="text-gray-900 dark:text-white font-semibold">{formatDate(service.date)}</p>
                      </div>
                    )}
                    
                    {service.appliedDate && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">প্রদানের তারিখ</label>
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

                    {service.dateOfBirth && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">জন্ম তারিখ</label>
                        <p className="text-gray-900 dark:text-white font-semibold">{formatDate(service.dateOfBirth)}</p>
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
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">মোট বিল</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(service.totalAmount || service.totalBill)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">জমা</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(service.paidAmount)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 bg-red-50 dark:bg-red-900/20 -mx-6 px-6 py-4 rounded-b-lg">
                      <span className="font-semibold text-red-900 dark:text-red-300">বকেয়া</span>
                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(service.dueAmount)}</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  {(service.passportFees || service.bankCharges || service.vendorFees || service.formFillupCharge) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">বিল বিস্তারিত</h3>
                      <div className="space-y-2 text-sm">
                        {service.passportFees > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">পাসপোর্ট ফি</span>
                            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(service.passportFees)}</span>
                          </div>
                        )}
                        {service.bankCharges > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">ব্যাংক চার্জ</span>
                            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(service.bankCharges)}</span>
                          </div>
                        )}
                        {service.vendorFees > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">ভেন্ডরের ফি</span>
                            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(service.vendorFees)}</span>
                          </div>
                        )}
                        {service.formFillupCharge > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">ফরম ফিলআপ চার্জ</span>
                            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(service.formFillupCharge)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vendor Information */}
              {service.officeContactPersonName && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      অফিস যোগাযোগ ব্যক্তি
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">নাম</label>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">{service.officeContactPersonName}</p>
                      </div>
                      
                      {service.officeContactPersonId && (
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">আইডি</label>
                          <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">{service.officeContactPersonId}</p>
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
                  {service._id && (
                    <div>
                      <label className="text-gray-500 dark:text-gray-400 mb-1 block">সার্ভিস আইডি</label>
                      <p className="text-gray-700 dark:text-gray-300 font-mono text-xs break-all">{service._id}</p>
                    </div>
                  )}
                  
                  {service.serviceId && (
                    <div>
                      <label className="text-gray-500 dark:text-gray-400 mb-1 block">সার্ভিস নম্বর</label>
                      <p className="text-gray-700 dark:text-gray-300 font-mono text-sm">{service.serviceId}</p>
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

export default PassportServiceDetails;
