'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../component/DashboardLayout';
import {
  ArrowLeft,
  Edit,
  Download,
  Share,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Plane,
  Hotel,
  FileCheck,
  MessageCircle,
  Package,
  Users,
  Image as ImageIcon,
  Trash2,
  Copy,
  Shield,
  Receipt,
  ArrowUp,
  ArrowDown,
  Loader2
} from 'lucide-react';

const HajiDetails = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id;
  const isUmrah = searchParams.get('type') === 'umrah';

  const [activeTab, setActiveTab] = useState('overview');
  const [showPackagePicker, setShowPackagePicker] = useState(false);
  const [packageSearch, setPackageSearch] = useState('');
  const [selectedPassengerType, setSelectedPassengerType] = useState('adult');
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [relationSearch, setRelationSearch] = useState('');
  const [selectedRelationType, setSelectedRelationType] = useState('relative');
  const [relationsState, setRelationsState] = useState([]);
  const [isSendingDueSms, setIsSendingDueSms] = useState(false);
  const [dueSmsStatus, setDueSmsStatus] = useState(null);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionFilters, setTransactionFilters] = useState({
    fromDate: '',
    toDate: '',
    transactionType: ''
  });
  const [isGeneratingCardPdf, setIsGeneratingCardPdf] = useState(false);

  const [haji, setHaji] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packages, setPackages] = useState([]);
  const [hajiList, setHajiList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState({});
  const [transactionPagination, setTransactionPagination] = useState({});

  // Fetch haji data
  useEffect(() => {
    if (id && id !== 'undefined' && id !== 'null') {
      fetchHajiData();
    } else {
      setError({ message: 'Invalid haji ID' });
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchHajiData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/hajj-umrah/hajis/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to fetch haji data';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.haji) {
        throw new Error('Haji data not found in response');
      }
      
      const hajiData = data.haji;
      
      // Transform database fields to frontend format
      const transformedHaji = {
        _id: hajiData.id,
        id: hajiData.id,
        customerId: hajiData.customer_id,
        manualSerialNumber: hajiData.manual_serial_number,
        pidNo: hajiData.pid_no,
        ngSerialNo: hajiData.ng_serial_no,
        trackingNo: hajiData.tracking_no,
        name: hajiData.name,
        firstName: hajiData.first_name,
        lastName: hajiData.last_name,
        fatherName: hajiData.father_name,
        motherName: hajiData.mother_name,
        spouseName: hajiData.spouse_name,
        occupation: hajiData.occupation,
        dateOfBirth: hajiData.date_of_birth,
        gender: hajiData.gender,
        maritalStatus: hajiData.marital_status,
        nationality: hajiData.nationality,
        passportNumber: hajiData.passport_number,
        passportType: hajiData.passport_type,
        issueDate: hajiData.issue_date,
        expiryDate: hajiData.expiry_date,
        nidNumber: hajiData.nid_number,
        mobile: hajiData.mobile,
        whatsappNo: hajiData.whatsapp_no,
        email: hajiData.email,
        address: hajiData.address,
        division: hajiData.division,
        district: hajiData.district,
        upazila: hajiData.upazila,
        area: hajiData.area,
        postCode: hajiData.post_code,
        emergencyContact: hajiData.emergency_contact,
        emergencyPhone: hajiData.emergency_phone,
        packageId: hajiData.package_id,
        agentId: hajiData.agent_id,
        licenseId: hajiData.license_id,
        departureDate: hajiData.departure_date,
        returnDate: hajiData.return_date,
        totalAmount: hajiData.total_amount,
        paidAmount: hajiData.paid_amount,
        paymentMethod: hajiData.payment_method,
        paymentStatus: hajiData.payment_status,
        serviceType: hajiData.service_type,
        serviceStatus: hajiData.service_status,
        status: hajiData.service_status,
        isActive: hajiData.is_active,
        previousHajj: hajiData.previous_hajj,
        previousUmrah: hajiData.previous_umrah,
        specialRequirements: hajiData.special_requirements,
        notes: hajiData.notes,
        referenceBy: hajiData.reference_by,
        referenceCustomerId: hajiData.reference_customer_id,
        photo: hajiData.photo || hajiData.photo_url,
        photoUrl: hajiData.photo || hajiData.photo_url,
        passportCopy: hajiData.passport_copy || hajiData.passport_copy_url,
        passportCopyUrl: hajiData.passport_copy || hajiData.passport_copy_url,
        nidCopy: hajiData.nid_copy || hajiData.nid_copy_url,
        nidCopyUrl: hajiData.nid_copy || hajiData.nid_copy_url,
        createdAt: hajiData.created_at,
        updatedAt: hajiData.updated_at
      };
      
      setHaji(transformedHaji);
      
      // Load relations if available
      if (hajiData.relations) {
        setRelationsState(Array.isArray(hajiData.relations) ? hajiData.relations : []);
      }
    } catch (error) {
      console.error('Error fetching haji data:', error);
      setError({
        message: error.message || 'Failed to fetch haji data',
        details: error.details || 'Please check if the hajis table exists in your database'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch packages
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/hajj-umrah/packages?status=Active&limit=200');
      // const data = await response.json();
      // setPackages(data.packages || []);
      setPackages([]);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  // Fetch haji list for relations
  useEffect(() => {
    fetchHajiList();
  }, []);

  const fetchHajiList = async () => {
    try {
      const response = await fetch('/api/hajj-umrah/hajis?limit=500&page=1');
      if (response.ok) {
        const data = await response.json();
        const transformed = (data.hajis || []).map(h => ({
          _id: h.id,
          id: h.id,
          customerId: h.customer_id,
          name: h.name,
          mobile: h.mobile,
          phone: h.mobile
        }));
        setHajiList(transformed);
      }
    } catch (error) {
      console.error('Error fetching haji list:', error);
    }
  };

  // Fetch transactions (only for Haji, not Umrah)
  useEffect(() => {
    if (!isUmrah && id) {
      fetchTransactions();
    }
  }, [isUmrah, id, transactionPage, transactionFilters]);

  const fetchTransactions = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch(`/api/hajj-umrah/hajis/${id}/transactions?page=${transactionPage}&limit=20&...`);
      // const data = await response.json();
      // setTransactions(data.transactions || []);
      // setTransactionSummary(data.summary || {});
      // setTransactionPagination(data.pagination || {});
      setTransactions([]);
      setTransactionSummary({});
      setTransactionPagination({});
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const getPackageName = (passenger) => {
    if (!passenger) return 'N/A';
    if (passenger.packageName) return passenger.packageName;
    if (passenger.package?.packageName) return passenger.package.packageName;
    if (passenger.packageInfo?.packageName) return passenger.packageInfo.packageName;
    return 'N/A';
  };

  const getLicenseName = (passenger) => {
    if (!passenger) return 'N/A';
    if (passenger.license?.licenseName && passenger.license?.licenseNumber) {
      return `${passenger.license.licenseNumber} - ${passenger.license.licenseName}`;
    }
    return 'N/A';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const handleCopyToClipboard = async (text, fieldName) => {
    if (!text || text === 'N/A') return;
    
    try {
      await navigator.clipboard.writeText(text);
      alert(`${fieldName} ক্লিপবোর্ডে কপি হয়েছে।`);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      alert('কপি করা যায়নি। আবার চেষ্টা করুন।');
    }
  };

  const handleVerifyTracking = () => {
    if (!haji?.trackingNo) return;
    const encoded = encodeURIComponent(haji.trackingNo);
    const url = `https://pilgrim.hajj.gov.bd/web/pilgrim-search?q=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadCardPDF = async () => {
    if (!haji || isGeneratingCardPdf) return;
    setIsGeneratingCardPdf(true);
    // TODO: Implement PDF generation
    alert('PDF generation feature coming soon');
    setIsGeneratingCardPdf(false);
  };

  const handleIdCardClick = () => {
    alert('আইডি কার্ড শীঘ্রই উপলব্ধ।');
  };

  const handleChuktiPattroClick = () => {
    alert('চুক্তি পত্র শীঘ্রই উপলব্ধ।');
  };

  const sendDueSms = async () => {
    const phone = haji?.mobile;
    const dueAmount = Math.max(Number(haji?.totalAmount || 0) - Number(haji?.paidAmount || 0), 0);

    if (!phone) {
      setDueSmsStatus({ type: 'error', message: 'সঠিক ফোন নম্বর পাওয়া যায়নি।' });
      return;
    }

    setIsSendingDueSms(true);
    setDueSmsStatus(null);

    // TODO: Implement SMS sending
    setTimeout(() => {
      setDueSmsStatus({ type: 'success', message: 'বকেয়ার SMS পাঠানো হয়েছে।' });
      setIsSendingDueSms(false);
    }, 1000);
  };

  const getStatusBadge = (status, serviceStatus) => {
    const displayStatus = serviceStatus || status;
    if (!displayStatus) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          N/A
        </span>
      );
    }

    const normalized = String(displayStatus).toLowerCase();
    let badgeClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';

    if (normalized.includes('পাসপোর্ট রেডি নয়') || normalized.includes('passport not ready')) {
      badgeClasses = 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    } else if (normalized.includes('পাসপোর্ট রেডি') || normalized.includes('passport ready')) {
      badgeClasses = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
    } else if (normalized.includes('হজ্ব সম্পন্ন') || normalized.includes('hajj completed')) {
      badgeClasses = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    } else if (normalized.includes('রিফান্ডেড') || normalized.includes('refunded')) {
      badgeClasses = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    } else if (normalized.includes('নিবন্ধিত') || normalized.includes('registered')) {
      badgeClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    } else if (normalized.includes('আনপেইড') || normalized.includes('unpaid')) {
      badgeClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses}`}>
        {displayStatus}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const paymentClasses = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      pending: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    const paymentLabels = {
      paid: 'পরিশোধিত',
      partial: 'আংশিক',
      pending: 'বিচারাধীন'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentClasses[paymentStatus] || paymentClasses.pending}`}>
        {paymentLabels[paymentStatus] || paymentStatus}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'ওভারভিউ', icon: User },
    { id: 'personal', label: 'ব্যক্তিগত তথ্য', icon: FileText },
    { id: 'package', label: 'প্যাকেজ তথ্য', icon: Package },
    { id: 'financial', label: 'আর্থিক', icon: CreditCard },
    { id: 'documents', label: 'ডকুমেন্ট', icon: ImageIcon },
    { id: 'relations', label: 'সম্পর্ক', icon: Users },
    { id: 'transactions', label: 'লেনদেনের ইতিহাস', icon: Receipt }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">হাজি ডেটা লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    const isTableMissing = error.message?.includes('Table hajis does not exist') || 
                           error.message?.includes('Could not find the table');
    
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ডেটা লোড করতে ত্রুটি</h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message || 'হাজি তথ্য লোড করতে ব্যর্থ।'}
            </p>
            {isTableMissing && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                  Database Table Missing
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  The <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">hajis</code> table does not exist in your Supabase database.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Please run the migration SQL:
                </p>
                <ol className="text-sm text-yellow-700 dark:text-yellow-300 list-decimal list-inside space-y-1 mb-3">
                  <li>Go to your Supabase Dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Copy the content from <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">supabase/migrations/003_create_hajis_table.sql</code></li>
                  <li>Paste and run it in the SQL Editor</li>
                </ol>
              </div>
            )}
            {error.details && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {error.details}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => fetchHajiData()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              আবার চেষ্টা করুন
            </button>
            <button
              onClick={() => router.push('/hajj-umrah/hajj/haji-list')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              হাজি তালিকায় ফিরুন
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!haji) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">হাজি পাওয়া যায়নি</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">অনুরোধকৃত হাজি তথ্য পাওয়া যায়নি।</p>
          <button
            onClick={() => router.push('/hajj-umrah/haji-list')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            হাজি তালিকায় ফিরুন
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Personal Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-4 sm:block">
            <div className="w-24 h-24 rounded-full overflow-hidden shrink-0">
              {haji.photo ? (
                <img
                  src={haji.photo}
                  alt={haji.name || 'Haji'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center ${haji.photo ? 'hidden' : 'flex'}`}>
                <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {haji.name || 'N/A'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{getPackageName(haji) || 'Haj'}</p>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{haji.mobile || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{haji.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{haji.address || haji.district || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
            {getStatusBadge(haji.status, haji.serviceStatus)}
            {getPaymentBadge(haji.paymentStatus || 'pending')}
          </div>
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">হাজি আইডি</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{haji.customerId || haji._id || 'N/A'}</p>
            </div>
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ম্যানুয়াল সিরিয়াল নম্বর</p>
              <button
                onClick={() => handleCopyToClipboard(haji.manualSerialNumber, 'Manual Serial Number')}
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                title="কপি করতে ক্লিক করুন"
              >
                {haji.manualSerialNumber || 'N/A'}
              </button>
            </div>
            <button
              onClick={() => handleCopyToClipboard(haji.manualSerialNumber, 'Manual Serial Number')}
              className="w-6 h-6 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-full cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              title="কপি করুন"
            >
              <Copy className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">প্যাকেজ</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{getPackageName(haji)}</p>
            </div>
            <Plane className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট পরিমাণ</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">৳{Number(haji.totalAmount || 0).toLocaleString('bn-BD')}</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">আর্থিক সারাংশ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">মোট পরিমাণ</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{Number(haji.totalAmount || 0).toLocaleString('bn-BD')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">পরিশোধিত পরিমাণ</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">৳{Number(haji.paidAmount || 0).toLocaleString('bn-BD')}</p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">বকেয়া পরিমাণ</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              ৳{Number(Math.max((Number(haji.totalAmount || 0) - Number(haji.paidAmount || 0)), 0)).toLocaleString('bn-BD')}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            SMS যাবে নম্বর: <span className="font-medium text-gray-900 dark:text-white">{haji.mobile || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            {dueSmsStatus && (
              <span className={`text-sm ${
                dueSmsStatus.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {dueSmsStatus.message}
              </span>
            )}
            <button
              onClick={sendDueSms}
              disabled={isSendingDueSms || !haji.mobile}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isSendingDueSms || !haji.mobile
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isSendingDueSms ? 'পাঠানো হচ্ছে...' : 'বকেয়া SMS পাঠান'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ব্যক্তিগত তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">পূর্ণ নাম</label>
            <p className="text-base text-gray-900 dark:text-white font-medium">{haji.name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">হাজি আইডি</label>
            <p className="text-base text-gray-900 dark:text-white">{haji.customerId || haji._id || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">জন্ম তারিখ</label>
            <p className="text-base text-gray-900 dark:text-white">{formatDate(haji.dateOfBirth)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">লিঙ্গ</label>
            <p className="text-base text-gray-900 dark:text-white capitalize">{haji.gender || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">হাজ্বীর স্ট্যাটাস</label>
            <p className="text-base text-gray-900 dark:text-white">{haji.serviceStatus || haji.status || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">বৈবাহিক অবস্থা</label>
            <p className="text-base text-gray-900 dark:text-white capitalize">{haji.maritalStatus || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">যোগাযোগের তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">মোবাইল</label>
            <p className="text-base text-gray-900 dark:text-white">{haji.mobile || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">ইমেইল</label>
            <p className="text-base text-gray-900 dark:text-white">{haji.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">ঠিকানা</label>
            <p className="text-base text-gray-900 dark:text-white">{haji.address || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">পাসপোর্ট তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">পাসপোর্ট নম্বর</label>
            <p className="text-base text-gray-900 dark:text-white">{haji.passportNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Issue Date</label>
            <p className="text-base text-gray-900 dark:text-white">{formatDate(haji.issueDate)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">মেয়াদ শেষ তারিখ</label>
            <p className="text-base text-gray-900 dark:text-white">{formatDate(haji.expiryDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPackageDetails = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">প্যাকেজ তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">প্যাকেজ নাম</label>
            <p className="text-base text-gray-900 dark:text-white font-medium">{getPackageName(haji)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">প্রস্থান তারিখ</label>
            <p className="text-base text-gray-900 dark:text-white">{haji.departureDate || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">ফেরত তারিখ</label>
            <p className="text-base text-gray-900 dark:text-white">{haji.returnDate || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">আর্থিক সারাংশ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">মোট পরিমাণ</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{Number(haji.totalAmount || 0).toLocaleString('bn-BD')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">পরিশোধিত পরিমাণ</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">৳{Number(haji.paidAmount || 0).toLocaleString('bn-BD')}</p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">বকেয়া পরিমাণ</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              ৳{Number(Math.max((Number(haji.totalAmount || 0) - Number(haji.paidAmount || 0)), 0)).toLocaleString('bn-BD')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">আপলোড করা ছবি ও ডকুমেন্ট</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {haji.photo && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ছবি</label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <img
                  src={haji.photo}
                  alt={`${haji.name || 'Haji'} Photo`}
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(haji.photo, '_blank')}
                />
              </div>
            </div>
          )}
          {haji.passportCopy && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">পাসপোর্ট কপি</label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {haji.passportCopy.match(/\.pdf(\?|$)/i) ? (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-red-500" />
                  </div>
                ) : (
                  <img
                    src={haji.passportCopy}
                    alt={`${haji.name || 'Haji'} Passport`}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(haji.passportCopy, '_blank')}
                  />
                )}
              </div>
            </div>
          )}
          {haji.nidCopy && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">NID কপি</label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {haji.nidCopy.match(/\.pdf(\?|$)/i) ? (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-red-500" />
                  </div>
                ) : (
                  <img
                    src={haji.nidCopy}
                    alt={`${haji.name || 'Haji'} NID`}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(haji.nidCopy, '_blank')}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        {!haji.photo && !haji.passportCopy && !haji.nidCopy && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">এখনও কোনো ছবি বা ডকুমেন্ট আপলোড করা হয়নি</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRelations = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">সম্পর্ক</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">এই প্রোফাইলের সাথে লিঙ্ক করা হাজি নির্ধারণ বা দেখুন।</p>
          </div>
          <button
            onClick={() => setShowRelationPicker(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            সম্পর্কযুক্ত হাজি নির্ধারণ করুন
          </button>
        </div>
        {relationsState.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {relationsState.map((relation, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{relation.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {relation.customerId || relation._id || 'N/A'}</p>
                </div>
                <button
                  onClick={() => {
                    // TODO: Implement delete relation
                    setRelationsState(relationsState.filter((_, i) => i !== idx));
                  }}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-6">
            এখনও কোনো সম্পর্ক যোগ করা হয়নি।
          </div>
        )}
      </div>
    </div>
  );

  const renderTransactionHistory = () => {
    if (isUmrah) {
      return (
        <div className="p-6 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">লেনদেনের ইতিহাস শুধুমাত্র হাজি প্রোফাইলের জন্য উপলব্ধ।</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">লেনদেনের ইতিহাস</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">কোনো লেনদেন পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">তারিখ</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">ধরন</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">পরিমাণ</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">নোট</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">{formatDate(tx.date)}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.transactionType === 'credit'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {tx.transactionType === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                        </span>
                      </td>
                      <td className={`py-3 px-2 text-sm font-semibold ${
                        tx.transactionType === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {tx.transactionType === 'credit' ? '+' : '-'}৳{Number(tx.amount || 0).toLocaleString('bn-BD')}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">{tx.notes || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'personal':
        return renderPersonalInfo();
      case 'package':
        return renderPackageDetails();
      case 'financial':
        return renderFinancial();
      case 'documents':
        return renderDocuments();
      case 'relations':
        return renderRelations();
      case 'transactions':
        return renderTransactionHistory();
      default:
        return renderOverview();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Link
              href="/hajj-umrah/hajj/haji-list"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                হাজি বিবরণ - {haji.name || 'N/A'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">হাজি-এর সম্পূর্ণ তথ্য</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadCardPDF}
              disabled={isGeneratingCardPdf}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingCardPdf ? 'তৈরি হচ্ছে...' : 'নামপ্লেট'}</span>
            </button>
            <Link
              href={`/hajj-umrah/hajj/haji/${id}/edit`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              <span>সম্পাদনা করুন</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HajiDetails;
