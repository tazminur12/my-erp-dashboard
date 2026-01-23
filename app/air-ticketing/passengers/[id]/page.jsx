'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  User,
  FileText,
  Users,
  Loader2,
  MessageCircle,
  Download,
  Share2,
  XCircle,
  AlertCircle,
  Briefcase,
  Globe,
  CreditCard,
  Plane,
  Upload,
  ExternalLink
} from 'lucide-react';

const PassengerDetails = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [passenger, setPassenger] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch passenger data from API
  const fetchPassenger = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/air-customers/${id}`);
      const result = await response.json();

      if (response.ok) {
        setPassenger(result.passenger);
      } else {
        throw new Error(result.error || 'Failed to fetch passenger');
      }
    } catch (err) {
      console.error('Error fetching passenger:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPassenger();
  }, [fetchPassenger]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = (phone) => {
    if (!phone) return;
    const num = phone.replace(/\D/g, '');
    const url = `https://wa.me/88${num}`;
    window.open(url, '_blank');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    const statusLabels = {
      active: 'সক্রিয়',
      inactive: 'নিষ্ক্রিয়'
    };
    return (
      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusClasses[status] || statusClasses.active}`}>
        {statusLabels[status] || 'সক্রিয়'}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'সারসংক্ষেপ', icon: User },
    { id: 'personal', label: 'ব্যক্তিগত তথ্য', icon: FileText },
    { id: 'passport', label: 'পাসপোর্ট তথ্য', icon: FileText },
    { id: 'documents', label: 'নথিপত্র', icon: Upload },
    { id: 'financial', label: 'আর্থিক', icon: CreditCard },
    { id: 'additional', label: 'অতিরিক্ত তথ্য', icon: Users }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-3 sm:p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">যাত্রী তথ্য লোড করতে ত্রুটি</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message || 'যাত্রী তথ্য লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'}
          </p>
          <button
            onClick={() => fetchPassenger()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!passenger) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">যাত্রী পাওয়া যায়নি</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">অনুরোধ করা যাত্রী তথ্য পাওয়া যায়নি।</p>
          <button
            onClick={() => router.push('/air-ticketing/passengers')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            যাত্রী তালিকায় ফিরে যান
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Personal Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-4 sm:block">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0">
              {passenger.customerImage ? (
                <img 
                  src={passenger.customerImage} 
                  alt={passenger.name || 'যাত্রী'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center ${passenger.customerImage ? 'hidden' : 'flex'}`}>
                <User className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 sm:hidden">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {passenger.name || 'N/A'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{passenger.customerType || 'যাত্রী'}</p>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="hidden sm:block">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {passenger.name || 'N/A'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{passenger.customerType || 'যাত্রী'}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{passenger.mobile || passenger.phone || 'N/A'}</span>
              </div>
              {passenger.whatsappNo && (
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <button
                    onClick={() => handleWhatsAppClick(passenger.whatsappNo)}
                    className="text-sm sm:text-base text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline truncate"
                    title="হোয়াটসঅ্যাপ খুলুন"
                  >
                    {passenger.whatsappNo}
                  </button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{passenger.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{passenger.address || passenger.district || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
            {getStatusBadge(passenger.isActive !== false ? 'active' : 'inactive')}
            {passenger.customerType && (
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                {passenger.customerType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">যাত্রী আইডি</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{passenger.customerId || passenger._id || passenger.id || 'N/A'}</p>
            </div>
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">গ্রাহকের ধরন</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">{passenger.customerType || 'N/A'}</p>
            </div>
            <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পাসপোর্ট নম্বর</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">{passenger.passportNumber || 'N/A'}</p>
            </div>
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">তৈরি হয়েছে</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                {passenger.createdAt ? new Date(passenger.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
              </p>
            </div>
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>আর্থিক সারসংক্ষেপ</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট পরিমাণ</p>
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-blue-900 dark:text-blue-300">
              ৳{((passenger.totalAmount || passenger.calculatedTotalAmount || 0).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
            {passenger.calculatedTotalAmount !== undefined && passenger.totalAmount !== passenger.calculatedTotalAmount && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                হিসাবকৃত: ৳{(passenger.calculatedTotalAmount.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
            )}
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পরিশোধিত পরিমাণ</p>
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-green-900 dark:text-green-300">
              ৳{((passenger.paidAmount || passenger.calculatedPaidAmount || 0).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
            {passenger.calculatedPaidAmount !== undefined && passenger.paidAmount !== passenger.calculatedPaidAmount && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                হিসাবকৃত: ৳{(passenger.calculatedPaidAmount.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
            )}
          </div>
          <div className={`bg-gradient-to-br rounded-lg p-4 border ${
            (passenger.totalDue || passenger.calculatedTotalDue || 0) > 0
              ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800'
              : 'from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট বকেয়া</p>
              <CreditCard className={`w-4 h-4 sm:w-5 sm:h-5 ${
                (passenger.totalDue || passenger.calculatedTotalDue || 0) > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
            <p className={`text-lg sm:text-2xl font-bold ${
              (passenger.totalDue || passenger.calculatedTotalDue || 0) > 0
                ? 'text-red-900 dark:text-red-300'
                : 'text-gray-900 dark:text-gray-300'
            }`}>
              ৳{((passenger.totalDue || passenger.calculatedTotalDue || 0).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
            {passenger.calculatedTotalDue !== undefined && passenger.totalDue !== passenger.calculatedTotalDue && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                হিসাবকৃত: ৳{(passenger.calculatedTotalDue.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">ব্যক্তিগত তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পূর্ণ নাম</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{passenger.name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">প্রথম নাম</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{passenger.firstName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">শেষ নাম</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{passenger.lastName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">জন্ম তারিখ</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {passenger.dateOfBirth ? formatDate(passenger.dateOfBirth) : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">লিঙ্গ</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {passenger.gender === 'male' ? 'পুরুষ' : passenger.gender === 'female' ? 'মহিলা' : passenger.gender === 'other' ? 'অন্যান্য' : passenger.gender || 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">জাতীয়তা</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{passenger.nationality || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পেশা</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{passenger.occupation || 'N/A'}</p>
          </div>
        </div>
        
        {/* Family Information */}
        {(passenger.fatherName || passenger.motherName || passenger.spouseName || passenger.maritalStatus) && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">পারিবারিক তথ্য</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {passenger.fatherName && (
                <div>
                  <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পিতার নাম</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{passenger.fatherName}</p>
                </div>
              )}
              {passenger.motherName && (
                <div>
                  <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মায়ের নাম</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{passenger.motherName}</p>
                </div>
              )}
              {passenger.spouseName && (
                <div>
                  <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">স্বামী/স্ত্রীর নাম</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{passenger.spouseName}</p>
                </div>
              )}
              {passenger.maritalStatus && (
                <div>
                  <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">বৈবাহিক অবস্থা</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                    {passenger.maritalStatus === 'married' ? 'বিবাহিত' : passenger.maritalStatus === 'single' ? 'অবিবাহিত' : passenger.maritalStatus === 'divorced' ? 'তালাকপ্রাপ্ত' : passenger.maritalStatus === 'widowed' ? 'বিধবা/বিধুর' : passenger.maritalStatus}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">যোগাযোগের তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোবাইল</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{passenger.mobile || passenger.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">হোয়াটসঅ্যাপ</label>
            <div className="flex items-center gap-2">
              {passenger.whatsappNo ? (
                <>
                  <button
                    onClick={() => handleWhatsAppClick(passenger.whatsappNo)}
                    className="text-sm sm:text-base text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline break-all flex items-center gap-2"
                    title="হোয়াটসঅ্যাপ খুলুন"
                  >
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{passenger.whatsappNo}</span>
                  </button>
                </>
              ) : (
                <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">N/A</p>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">ইমেইল</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{passenger.email || 'N/A'}</p>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">ঠিকানা</label>
          <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{passenger.address || 'N/A'}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">বিভাগ</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{passenger.division || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">জেলা</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{passenger.district || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">উপজেলা</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{passenger.upazila || 'N/A'}</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পোস্ট কোড</label>
          <p className="text-sm sm:text-base text-gray-900 dark:text-white">{passenger.postCode || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  const renderPassportInfo = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Passport Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">পাসপোর্ট তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পাসপোর্ট নম্বর</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{passenger.passportNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পাসপোর্টের ধরন</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{passenger.passportType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">ইস্যু তারিখ</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {passenger.issueDate ? formatDate(passenger.issueDate) : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মেয়াদ শেষের তারিখ</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {passenger.expiryDate ? formatDate(passenger.expiryDate) : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">জাতীয় পরিচয়পত্র নম্বর</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{passenger.nidNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পাসপোর্টের প্রথম নাম</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{passenger.passportFirstName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পাসপোর্টের শেষ নাম</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{passenger.passportLastName || 'N/A'}</p>
          </div>
          {passenger.previousPassport && (
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পূর্ববর্তী পাসপোর্ট নম্বর</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{passenger.previousPassport}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFinancialInfo = () => {
    const totalAmount = passenger.totalAmount || passenger.calculatedTotalAmount || 0;
    const paidAmount = passenger.paidAmount || passenger.calculatedPaidAmount || 0;
    const totalDue = passenger.totalDue || passenger.calculatedTotalDue || 0;
    const paymentPercentage = totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0;

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">মোট পরিমাণ</p>
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-blue-900 dark:text-blue-300 mb-2">
              ৳{totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
            {passenger.calculatedTotalAmount !== undefined && passenger.totalAmount !== passenger.calculatedTotalAmount && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                সংরক্ষিত: ৳{(passenger.totalAmount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              সব টিকিট থেকে মোট
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 sm:p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">পরিশোধিত পরিমাণ</p>
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-green-900 dark:text-green-300 mb-2">
              ৳{paidAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
            {passenger.calculatedPaidAmount !== undefined && passenger.paidAmount !== passenger.calculatedPaidAmount && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                সংরক্ষিত: ৳{(passenger.paidAmount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
            )}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>পেমেন্ট অগ্রগতি</span>
                <span>{paymentPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br rounded-lg p-4 sm:p-6 border ${
            totalDue > 0
              ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800'
              : 'from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">মোট বকেয়া</p>
              <CreditCard className={`w-5 h-5 sm:w-6 sm:h-6 ${
                totalDue > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
            <p className={`text-xl sm:text-3xl font-bold mb-2 ${
              totalDue > 0
                ? 'text-red-900 dark:text-red-300'
                : 'text-gray-900 dark:text-gray-300'
            }`}>
              ৳{totalDue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
            {passenger.calculatedTotalDue !== undefined && passenger.totalDue !== passenger.calculatedTotalDue && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                সংরক্ষিত: ৳{(passenger.totalDue || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
            )}
            {totalDue > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                বকেয়া পরিমাণ
              </p>
            )}
            {totalDue === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                সম্পূর্ণ পরিশোধিত
              </p>
            )}
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">আর্থিক বিবরণ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট পরিমাণ</label>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mt-1">
                ৳{totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
              {passenger.calculatedTotalAmount !== undefined && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  হিসাবকৃত: ৳{passenger.calculatedTotalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পরিশোধিত পরিমাণ</label>
              <p className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400 mt-1">
                ৳{paidAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
              {passenger.calculatedPaidAmount !== undefined && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  হিসাবকৃত: ৳{passenger.calculatedPaidAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট বকেয়া</label>
              <p className={`text-base sm:text-lg font-semibold mt-1 ${
                totalDue > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                ৳{totalDue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
              {passenger.calculatedTotalDue !== undefined && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  হিসাবকৃত: ৳{passenger.calculatedTotalDue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পেমেন্ট শতাংশ</label>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {paymentPercentage}%
              </p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">অবশিষ্ট পরিমাণ</label>
              <p className={`text-base sm:text-lg font-semibold mt-1 ${
                totalDue > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                ৳{totalDue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
            </div>
          </div>
        </div>

        {/* Note about calculated values */}
        {(passenger.calculatedTotalAmount !== undefined || passenger.calculatedPaidAmount !== undefined || passenger.calculatedTotalDue !== undefined) && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                  আর্থিক তথ্য সম্পর্কে
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  হিসাবকৃত মানগুলো এই গ্রাহকের সব সক্রিয় টিকিট থেকে গণনা করা হয়েছে। 
                  সংরক্ষিত মানগুলো ম্যানুয়ালি আপডেট করা হলে ভিন্ন হতে পারে। API স্বয়ংক্রিয়ভাবে 
                  টিকিট লেনদেন থেকে মোট পরিমাণ গণনা করে।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDocuments = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Documents Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>আপলোড করা নথিপত্র</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Photo */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">প্রোফাইল ছবি</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
              {passenger.customerImage ? (
                <div className="flex flex-col items-center space-y-3">
                  <img 
                    src={passenger.customerImage} 
                    alt="প্রোফাইল ছবি"
                    className="max-h-48 max-w-full rounded-lg object-contain"
                  />
                  <a
                    href={passenger.customerImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>পূর্ণ আকারে দেখুন</span>
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 text-gray-400">
                  <User className="w-12 h-12 mb-2" />
                  <span className="text-sm">কোন ছবি আপলোড করা হয়নি</span>
                </div>
              )}
            </div>
          </div>

          {/* Passport Copy */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">পাসপোর্ট কপি</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
              {passenger.passportCopy ? (
                <div className="flex flex-col items-center space-y-3">
                  {passenger.passportCopy.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img 
                      src={passenger.passportCopy} 
                      alt="পাসপোর্ট কপি"
                      className="max-h-48 max-w-full rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <FileText className="w-8 h-8 text-red-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        PDF Document
                      </span>
                    </div>
                  )}
                  <a
                    href={passenger.passportCopy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Document</span>
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 text-gray-400">
                  <FileText className="w-12 h-12 mb-2" />
                  <span className="text-sm">কোন পাসপোর্ট কপি আপলোড করা হয়নি</span>
                </div>
              )}
            </div>
          </div>

          {/* NID Copy */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">জাতীয় পরিচয়পত্র কপি</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
              {passenger.nidCopy ? (
                <div className="flex flex-col items-center space-y-3">
                  {passenger.nidCopy.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img 
                      src={passenger.nidCopy} 
                      alt="জাতীয় পরিচয়পত্র কপি"
                      className="max-h-48 max-w-full rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <FileText className="w-8 h-8 text-red-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        PDF Document
                      </span>
                    </div>
                  )}
                  <a
                    href={passenger.nidCopy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Document</span>
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 text-gray-400">
                  <FileText className="w-12 h-12 mb-2" />
                  <span className="text-sm">কোন জাতীয় পরিচয়পত্র কপি আপলোড করা হয়নি</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdditionalInfo = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Additional Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">অতিরিক্ত তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {passenger.referenceBy && (
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">রেফারেন্স</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{passenger.referenceBy}</p>
            </div>
          )}
          {passenger.referenceCustomerId && (
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">রেফারেন্স গ্রাহক আইডি</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{passenger.referenceCustomerId}</p>
            </div>
          )}
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">গ্রাহকের ধরন</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{passenger.customerType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">অবস্থা</label>
            <div className="mt-1">{getStatusBadge(passenger.isActive !== false ? 'active' : 'inactive')}</div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">তৈরি হয়েছে</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {passenger.createdAt ? new Date(passenger.createdAt).toLocaleString('bn-BD') : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">আপডেট হয়েছে</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {passenger.updatedAt ? new Date(passenger.updatedAt).toLocaleString('bn-BD') : 'N/A'}
            </p>
          </div>
        </div>
        {passenger.notes && (
          <div className="mt-4">
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">নোট</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{passenger.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'personal':
        return renderPersonalInfo();
      case 'passport':
        return renderPassportInfo();
      case 'documents':
        return renderDocuments();
      case 'financial':
        return renderFinancialInfo();
      case 'additional':
        return renderAdditionalInfo();
      default:
        return renderOverview();
    }
  };

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => router.push('/air-ticketing/passengers')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                যাত্রী বিবরণ - {passenger.name || 'N/A'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">
                যাত্রীর সম্পূর্ণ তথ্য
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button 
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">এক্সপোর্ট</span>
            </button>
            <button 
              onClick={() => router.push(`/air-ticketing/passengers/edit/${id}`)}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">সম্পাদনা</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-w-fit ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px] sm:min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PassengerDetails;
