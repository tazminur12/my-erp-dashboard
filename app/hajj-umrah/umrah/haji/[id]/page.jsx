'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../component/DashboardLayout';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  Edit,
  Download,
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
  Package,
  Users,
  Image as ImageIcon,
  Trash2,
  Copy,
  Receipt,
  ArrowUp,
  ArrowDown,
  Loader2,
  MessageCircle,
  RotateCcw
} from 'lucide-react';

const UmrahHajiDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [activeTab, setActiveTab] = useState('overview');
  const [showPackagePicker, setShowPackagePicker] = useState(false);
  const [packageSearch, setPackageSearch] = useState('');
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [relationSearch, setRelationSearch] = useState('');
  const [selectedRelationType, setSelectedRelationType] = useState('relative');
  const [relationsState, setRelationsState] = useState([]);
  const [isSendingDueSms, setIsSendingDueSms] = useState(false);
  const [dueSmsStatus, setDueSmsStatus] = useState(null);
  const [isGeneratingCardPdf, setIsGeneratingCardPdf] = useState(false);

  const [umrah, setUmrah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packages, setPackages] = useState([]);
  const [umrahList, setUmrahList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState({});
  const [transactionPagination, setTransactionPagination] = useState({});
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionFilters, setTransactionFilters] = useState({
    fromDate: '',
    toDate: '',
    transactionType: ''
  });
  const [refunds, setRefunds] = useState([]);

  // Fetch umrah data
  useEffect(() => {
    if (id && id !== 'undefined' && id !== 'null') {
      fetchUmrahData();
    } else {
      setError({ message: 'Invalid umrah ID' });
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUmrahData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/hajj-umrah/umrahs/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to fetch umrah data';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.umrah) {
        throw new Error('Umrah data not found in response');
      }
      
      const umrahData = data.umrah;
      
      // Transform database fields to frontend format
      const transformedUmrah = {
        _id: umrahData.id,
        id: umrahData.id,
        customerId: umrahData.customer_id,
        manualSerialNumber: umrahData.manual_serial_number,
        pidNo: umrahData.pid_no,
        ngSerialNo: umrahData.ng_serial_no,
        trackingNo: umrahData.tracking_no,
        banglaName: umrahData.bangla_name,
        name: umrahData.name,
        firstName: umrahData.first_name,
        lastName: umrahData.last_name,
        fatherName: umrahData.father_name,
        motherName: umrahData.mother_name,
        spouseName: umrahData.spouse_name,
        occupation: umrahData.occupation,
        dateOfBirth: umrahData.date_of_birth,
        gender: umrahData.gender,
        maritalStatus: umrahData.marital_status,
        nationality: umrahData.nationality,
        passportNumber: umrahData.passport_number,
        passportType: umrahData.passport_type,
        issueDate: umrahData.issue_date,
        expiryDate: umrahData.expiry_date,
        nidNumber: umrahData.nid_number,
        mobile: umrahData.mobile,
        whatsappNo: umrahData.whatsapp_no,
        email: umrahData.email,
        address: umrahData.address,
        division: umrahData.division,
        district: umrahData.district,
        upazila: umrahData.upazila,
        area: umrahData.area,
        postCode: umrahData.post_code,
        emergencyContact: umrahData.emergency_contact,
        emergencyPhone: umrahData.emergency_phone,
        packageId: umrahData.package_id,
        agentId: umrahData.agent_id,
        departureDate: umrahData.departure_date,
        returnDate: umrahData.return_date,
        totalAmount: umrahData.total_amount,
        paidAmount: umrahData.paid_amount,
        paymentMethod: umrahData.payment_method,
        paymentStatus: umrahData.payment_status,
        serviceType: umrahData.service_type,
        serviceStatus: umrahData.service_status,
        status: umrahData.service_status,
        isActive: umrahData.is_active,
        previousHajj: umrahData.previous_hajj,
        previousUmrah: umrahData.previous_umrah,
        specialRequirements: umrahData.special_requirements,
        notes: umrahData.notes,
        referenceBy: umrahData.reference_by,
        referenceCustomerId: umrahData.reference_customer_id,
        sourceType: umrahData.source_type,
        branchId: umrahData.branch_id,
        referenceHaji: umrahData.reference_haji,
        employerId: umrahData.employer_id || umrahData.employerId,
        photo: umrahData.photo || umrahData.photo_url,
        photoUrl: umrahData.photo || umrahData.photo_url,
        passportCopy: umrahData.passport_copy || umrahData.passport_copy_url,
        passportCopyUrl: umrahData.passport_copy || umrahData.passport_copy_url,
        nidCopy: umrahData.nid_copy || umrahData.nid_copy_url,
        nidCopyUrl: umrahData.nid_copy || umrahData.nid_copy_url,
        createdAt: umrahData.created_at,
        updatedAt: umrahData.updated_at
      };
      
      setUmrah(transformedUmrah);
      
      // Load relations if available
      if (umrahData.relations) {
        setRelationsState(Array.isArray(umrahData.relations) ? umrahData.relations : []);
      }
    } catch (error) {
      console.error('Error fetching umrah data:', error);
      setError({
        message: error.message || 'Failed to fetch umrah data',
        details: error.details || 'Please check if the umrahs collection exists in your database'
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
      // const response = await fetch('/api/packages?type=umrah&status=Active&limit=200');
      // const data = await response.json();
      // setPackages(data.packages || []);
      setPackages([]);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  // Fetch umrah list for relations
  useEffect(() => {
    fetchUmrahList();
  }, []);

  const fetchUmrahList = async () => {
    try {
      const response = await fetch('/api/hajj-umrah/umrahs?limit=500&page=1');
      if (response.ok) {
        const data = await response.json();
        const transformed = (data.umrahs || []).map(u => ({
          _id: u.id,
          id: u.id,
          customerId: u.customer_id,
          name: u.name,
          mobile: u.mobile,
          phone: u.mobile
        }));
        setUmrahList(transformed);
      }
    } catch (error) {
      console.error('Error fetching umrah list:', error);
    }
  };

  // Fetch transactions
  useEffect(() => {
    if (id) {
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, transactionPage, transactionFilters]);

  // Fetch refunds
  useEffect(() => {
    if (umrah?.customerId) {
      fetchRefunds();
    }
  }, [umrah?.customerId]);

  const fetchRefunds = async () => {
    try {
      const response = await fetch(`/api/hajj-umrah/refunds?search=${umrah.customerId}`);
      if (response.ok) {
        const data = await response.json();
        setRefunds(data.refunds || []);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const queryParams = new URLSearchParams({
        partyType: 'umrah',
        partyId: id,
        page: transactionPage.toString(),
        limit: '20',
        ...(transactionFilters.fromDate && { fromDate: transactionFilters.fromDate }),
        ...(transactionFilters.toDate && { toDate: transactionFilters.toDate }),
        ...(transactionFilters.transactionType && { transactionType: transactionFilters.transactionType }),
      });

      const response = await fetch(`/api/transactions?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions || data.data || []);
        setTransactionPagination(data.pagination || {
          page: transactionPage,
          limit: 20,
          total: data.totalCount || 0,
          totalPages: Math.ceil((data.totalCount || 0) / 20)
        });

        // Calculate summary from all transactions (not just current page)
        // Note: For accurate summary, we might need a separate API call
        // For now, calculate from current page transactions
        const txs = data.transactions || data.data || [];
        const totalCredit = txs
          .filter(tx => tx.transactionType === 'credit')
          .reduce((sum, tx) => sum + (Number(tx.amount || tx.paymentDetails?.amount || 0)), 0);
        const totalDebit = txs
          .filter(tx => tx.transactionType === 'debit')
          .reduce((sum, tx) => sum + (Number(tx.amount || tx.paymentDetails?.amount || 0)), 0);
        const netAmount = totalCredit - totalDebit;

        setTransactionSummary({
          totalTransactions: txs.length,
          totalCredit,
          totalDebit,
          netAmount
        });
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setTransactionSummary({});
      setTransactionPagination({});
    }
  };

  const getPackageName = (passenger) => {
    if (!passenger) return 'N/A';
    if (passenger.packageName) return passenger.packageName;
    if (passenger.package?.packageName) return passenger.package.packageName;
    if (passenger.packageInfo?.packageName) return passenger.packageInfo.packageName;
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

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('bn-BD');
  };

  const handleCopyToClipboard = async (text, fieldName) => {
    if (!text || text === 'N/A') return;
    
    try {
      await navigator.clipboard.writeText(text);
      Swal.fire({
        icon: 'success',
        title: 'কপি হয়েছে!',
        text: `${fieldName} ক্লিপবোর্ডে কপি হয়েছে।`,
        confirmButtonColor: '#3b82f6',
        timer: 2000,
      });
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'কপি করা যায়নি। আবার চেষ্টা করুন।',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  const handleVerifyTracking = () => {
    if (!umrah?.trackingNo) return;
    const encoded = encodeURIComponent(umrah.trackingNo);
    const url = `https://pilgrim.hajj.gov.bd/web/pilgrim-search?q=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadCardPDF = async () => {
    if (!umrah || isGeneratingCardPdf) return;
    setIsGeneratingCardPdf(true);
    Swal.fire({
      icon: 'info',
      title: 'শীঘ্রই উপলব্ধ',
      text: 'PDF generation feature coming soon',
      confirmButtonColor: '#3b82f6',
    });
    setIsGeneratingCardPdf(false);
  };

  const handleIdCardClick = () => {
    Swal.fire({
      icon: 'info',
      title: 'শীঘ্রই উপলব্ধ',
      text: 'আইডি কার্ড শীঘ্রই উপলব্ধ হবে।',
      confirmButtonColor: '#3b82f6',
    });
  };

  const handleChuktiPattroClick = () => {
    Swal.fire({
      icon: 'info',
      title: 'শীঘ্রই উপলব্ধ',
      text: 'চুক্তি পত্র শীঘ্রই উপলব্ধ হবে।',
      confirmButtonColor: '#3b82f6',
    });
  };

  const sendDueSms = async () => {
    const phone = umrah?.mobile;
    const dueAmount = Math.max(Number(umrah?.totalAmount || 0) - Number(umrah?.paidAmount || 0), 0);

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
    } else if (normalized.includes('প্যাকেজ যুক্ত') || normalized.includes('package added')) {
      badgeClasses = 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    } else if (normalized.includes('রেডি ফর উমরাহ') || normalized.includes('ready for umrah')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (normalized.includes('উমরাহ সম্পন্ন') || normalized.includes('umrah completed')) {
      badgeClasses = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    } else if (normalized.includes('রিফান্ডেড') || normalized.includes('refunded')) {
      badgeClasses = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    } else if (normalized.includes('নিবন্ধিত') || normalized.includes('registered')) {
      badgeClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
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
    { id: 'overview', label: 'সারসংক্ষেপ', icon: User },
    { id: 'personal', label: 'ব্যক্তিগত তথ্য', icon: FileText },
    { id: 'package', label: 'প্যাকেজ তথ্য', icon: Package },
    { id: 'financial', label: 'আর্থিক', icon: CreditCard },
    { id: 'documents', label: 'ডকুমেন্ট', icon: ImageIcon },
    { id: 'relations', label: 'সম্পর্ক', icon: Users },
    { id: 'transactions', label: 'লেনদেনের ইতিহাস', icon: Receipt },
    { id: 'refund', label: 'রিফান্ড', icon: RotateCcw },
    { id: 'reference', label: 'রেফারেন্স তথ্য', icon: FileText }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">উমরাহ ডেটা লোড হচ্ছে...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ডেটা লোড করতে ত্রুটি</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message || 'উমরাহ তথ্য লোড করতে ব্যর্থ।'}
          </p>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => fetchUmrahData()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              আবার চেষ্টা করুন
            </button>
            <button
              onClick={() => router.push('/hajj-umrah/umrah/haji-list')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              উমরাহ তালিকায় ফিরুন
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!umrah) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">উমরাহ পাওয়া যায়নি</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">অনুরোধকৃত উমরাহ তথ্য পাওয়া যায়নি।</p>
          <button
            onClick={() => router.push('/umrah/haji-list')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            উমরাহ তালিকায় ফিরুন
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
              {umrah.photo ? (
                <img
                  src={umrah.photo}
                  alt={umrah.name || 'Umrah'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center ${umrah.photo ? 'hidden' : 'flex'}`}>
                <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {umrah.name || 'N/A'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{getPackageName(umrah) || 'Umrah'}</p>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{umrah.mobile || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{umrah.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{umrah.address || umrah.district || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
            {getStatusBadge(umrah.status, umrah.serviceStatus)}
            {getPaymentBadge(umrah.paymentStatus || 'pending')}
          </div>
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">উমরাহ আইডি</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{umrah.customerId || umrah._id || 'N/A'}</p>
            </div>
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ম্যানুয়াল সিরিয়াল নম্বর</p>
              <button
                onClick={() => handleCopyToClipboard(umrah.manualSerialNumber, 'Manual Serial Number')}
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                title="কপি করতে ক্লিক করুন"
              >
                {umrah.manualSerialNumber || 'N/A'}
              </button>
            </div>
            <button
              onClick={() => handleCopyToClipboard(umrah.manualSerialNumber, 'Manual Serial Number')}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">PID No</p>
              <button
                onClick={() => handleCopyToClipboard(umrah.pidNo, 'PID No')}
                className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                title="কপি করতে ক্লিক করুন"
              >
                {umrah.pidNo || 'N/A'}
              </button>
            </div>
            <Copy className="w-6 h-6 text-indigo-600 dark:text-indigo-400 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-300" onClick={() => handleCopyToClipboard(umrah.pidNo, 'PID No')} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">NG Serial No</p>
              <button
                onClick={() => handleCopyToClipboard(umrah.ngSerialNo, 'NG Serial No')}
                className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                title="কপি করতে ক্লিক করুন"
              >
                {umrah.ngSerialNo || 'N/A'}
              </button>
            </div>
            <Copy className="w-6 h-6 text-teal-600 dark:text-teal-400 cursor-pointer hover:text-teal-700 dark:hover:text-teal-300" onClick={() => handleCopyToClipboard(umrah.ngSerialNo, 'NG Serial No')} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Tracking No</p>
              <button
                onClick={() => handleCopyToClipboard(umrah.trackingNo, 'Tracking No')}
                className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left truncate w-full"
                title="কপি করতে ক্লিক করুন"
              >
                {umrah.trackingNo || 'N/A'}
              </button>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              <Copy className="w-6 h-6 text-cyan-600 dark:text-cyan-400 cursor-pointer hover:text-cyan-700 dark:hover:text-cyan-300" onClick={() => handleCopyToClipboard(umrah.trackingNo, 'Tracking No')} />
              <button
                type="button"
                onClick={handleVerifyTracking}
                disabled={!umrah.trackingNo}
                className={`px-3 py-1.5 text-xs rounded-md ${
                  umrah.trackingNo
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-sm hover:from-cyan-600 hover:to-emerald-600'
                    : 'border border-gray-300 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:text-gray-500'
                }`}
                title={umrah.trackingNo ? 'পিলগ্রিম পোর্টালে ট্র্যাকিং যাচাই করুন' : 'কোন ট্র্যাকিং নম্বর নেই'}
              >
                যাচাই করুন
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">প্যাকেজ</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{getPackageName(umrah)}</p>
            </div>
            <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট পরিমাণ</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">৳{formatNumber(umrah.totalAmount)}</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">তৈরি হয়েছে</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDate(umrah.createdAt)}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">আর্থিক সারাংশ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">মোট পরিমাণ</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{formatNumber(umrah.totalAmount)}</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">পরিশোধিত পরিমাণ</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">৳{formatNumber(umrah.paidAmount)}</p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">বকেয়া পরিমাণ</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              ৳{formatNumber(Math.max((Number(umrah.totalAmount || 0) - Number(umrah.paidAmount || 0)), 0))}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            SMS যাবে নম্বর: <span className="font-medium text-gray-900 dark:text-white">{umrah.mobile || 'N/A'}</span>
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
              disabled={isSendingDueSms || !umrah.mobile}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isSendingDueSms || !umrah.mobile
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
            <p className="text-base text-gray-900 dark:text-white font-medium">{umrah.name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">বাংলা নাম</label>
            <p className="text-base text-gray-900 dark:text-white font-medium">{umrah.banglaName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">উমরাহ আইডি</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.customerId || umrah._id || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">জন্ম তারিখ</label>
            <p className="text-base text-gray-900 dark:text-white">{formatDate(umrah.dateOfBirth)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">লিঙ্গ</label>
            <p className="text-base text-gray-900 dark:text-white capitalize">{umrah.gender === 'male' ? 'পুরুষ' : umrah.gender === 'female' ? 'মহিলা' : umrah.gender || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">উমরাহ হাজ্বীর স্ট্যাটাস</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.serviceStatus || umrah.status || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">বৈবাহিক অবস্থা</label>
            <p className="text-base text-gray-900 dark:text-white capitalize">{umrah.maritalStatus || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">পিতার নাম</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.fatherName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">মাতার নাম</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.motherName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">পেশা</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.occupation || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">যোগাযোগের তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">মোবাইল</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.mobile || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.whatsappNo || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">ইমেইল</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">ঠিকানা</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.address || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">বিভাগ</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.division || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">জেলা</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.district || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">উপজেলা</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.upazila || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">এলাকা</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.area || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">পোস্ট কোড</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.postCode || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">জরুরি যোগাযোগ</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.emergencyContact || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">জরুরি ফোন</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.emergencyPhone || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">পাসপোর্ট তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">পাসপোর্ট নম্বর</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.passportNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">পাসপোর্ট টাইপ</label>
            <p className="text-base text-gray-900 dark:text-white capitalize">{umrah.passportType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">ইস্যু তারিখ</label>
            <p className="text-base text-gray-900 dark:text-white">{formatDate(umrah.issueDate)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">মেয়াদ শেষ তারিখ</label>
            <p className="text-base text-gray-900 dark:text-white">{formatDate(umrah.expiryDate)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">এনআইডি নম্বর</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.nidNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">PID No</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyToClipboard(umrah.pidNo, 'PID No')}
                className="text-base text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left flex-1"
                title="কপি করতে ক্লিক করুন"
              >
                {umrah.pidNo || 'N/A'}
              </button>
              <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0" onClick={() => handleCopyToClipboard(umrah.pidNo, 'PID No')} />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">NG Serial No</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyToClipboard(umrah.ngSerialNo, 'NG Serial No')}
                className="text-base text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left flex-1"
                title="কপি করতে ক্লিক করুন"
              >
                {umrah.ngSerialNo || 'N/A'}
              </button>
              <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0" onClick={() => handleCopyToClipboard(umrah.ngSerialNo, 'NG Serial No')} />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Tracking No</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyToClipboard(umrah.trackingNo, 'Tracking No')}
                className="text-base text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left flex-1"
                title="কপি করতে ক্লিক করুন"
              >
                {umrah.trackingNo || 'N/A'}
              </button>
              <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0" onClick={() => handleCopyToClipboard(umrah.trackingNo, 'Tracking No')} />
            </div>
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
            <p className="text-base text-gray-900 dark:text-white font-medium">{getPackageName(umrah)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">প্যাকেজ আইডি</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.packageId || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">প্রস্থান তারিখ</label>
            <p className="text-base text-gray-900 dark:text-white">{formatDate(umrah.departureDate)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">ফেরত তারিখ</label>
            <p className="text-base text-gray-900 dark:text-white">{formatDate(umrah.returnDate)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">পূর্ববর্তী হজ্ব</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.previousHajj ? 'হ্যাঁ' : 'না'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">পূর্ববর্তী উমরাহ</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.previousUmrah ? 'হ্যাঁ' : 'না'}</p>
          </div>
        </div>
        {umrah.specialRequirements && (
          <div className="mt-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">বিশেষ প্রয়োজনীয়তা</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.specialRequirements}</p>
          </div>
        )}
        {umrah.notes && (
          <div className="mt-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">নোট</label>
            <p className="text-base text-gray-900 dark:text-white">{umrah.notes}</p>
          </div>
        )}
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
            <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{formatNumber(umrah.totalAmount)}</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">পরিশোধিত পরিমাণ</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">৳{formatNumber(umrah.paidAmount)}</p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">বকেয়া পরিমাণ</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              ৳{formatNumber(Math.max((Number(umrah.totalAmount || 0) - Number(umrah.paidAmount || 0)), 0))}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">পেমেন্ট পদ্ধতি</label>
            <p className="text-base text-gray-900 dark:text-white capitalize">{umrah.paymentMethod || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">পেমেন্ট স্ট্যাটাস</label>
            <div className="mt-1">
              {getPaymentBadge(umrah.paymentStatus || 'pending')}
            </div>
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
          {umrah.photo && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ছবি</label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <img
                  src={umrah.photo}
                  alt={`${umrah.name || 'Umrah'} Photo`}
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(umrah.photo, '_blank')}
                />
              </div>
              <a 
                href={umrah.photo} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-block"
              >
                পূর্ণ আকারে দেখুন
              </a>
            </div>
          )}
          {umrah.passportCopy && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">পাসপোর্ট কপি</label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {umrah.passportCopy.match(/\.pdf(\?|$)/i) ? (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-red-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-2">PDF ডকুমেন্ট</p>
                  </div>
                ) : (
                  <img
                    src={umrah.passportCopy}
                    alt={`${umrah.name || 'Umrah'} Passport`}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(umrah.passportCopy, '_blank')}
                  />
                )}
              </div>
              <a 
                href={umrah.passportCopy} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-block"
              >
                {umrah.passportCopy.match(/\.pdf(\?|$)/i) ? 'PDF দেখুন' : 'পূর্ণ আকারে দেখুন'}
              </a>
            </div>
          )}
          {umrah.nidCopy && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">NID কপি</label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {umrah.nidCopy.match(/\.pdf(\?|$)/i) ? (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-red-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-2">PDF ডকুমেন্ট</p>
                  </div>
                ) : (
                  <img
                    src={umrah.nidCopy}
                    alt={`${umrah.name || 'Umrah'} NID`}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(umrah.nidCopy, '_blank')}
                  />
                )}
              </div>
              <a 
                href={umrah.nidCopy} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-block"
              >
                {umrah.nidCopy.match(/\.pdf(\?|$)/i) ? 'PDF দেখুন' : 'পূর্ণ আকারে দেখুন'}
              </a>
            </div>
          )}
        </div>
        {!umrah.photo && !umrah.passportCopy && !umrah.nidCopy && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">এখনও কোনো ছবি বা ডকুমেন্ট আপলোড করা হয়নি</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRelations = () => {
    const relationTypeOptions = [
      { value: 'mother', label: 'মা' },
      { value: 'father', label: 'বাবা' },
      { value: 'wife', label: 'স্ত্রী' },
      { value: 'husband', label: 'স্বামী' },
      { value: 'brother', label: 'ভাই' },
      { value: 'sister', label: 'বোন' },
      { value: 'son', label: 'ছেলে' },
      { value: 'daughter', label: 'মেয়ে' },
      { value: 'relative', label: 'আত্মীয়' },
      { value: 'other', label: 'অন্যান্য' }
    ];

    const handleRelationSelect = async (selected) => {
      if (!selected) return;
      // TODO: Implement relation adding API
      const newRelation = {
        relatedUmrahId: selected.id || selected._id || selected.customerId,
        name: selected.name,
        mobile: selected.mobile || selected.phone,
        relationType: selectedRelationType || 'relative'
      };
      setRelationsState((prev) => [...prev, newRelation]);
      setShowRelationPicker(false);
      setSelectedRelationType('relative');
      Swal.fire({
        icon: 'success',
        title: 'সম্পর্ক যুক্ত হয়েছে!',
        text: `${selected.name} এর সাথে সম্পর্ক যুক্ত করা হয়েছে।`,
        confirmButtonColor: '#3b82f6',
        timer: 2000,
      });
    };

    const handleDeleteRelation = async (index) => {
      const relation = relationsState[index];
      const result = await Swal.fire({
        title: 'নিশ্চিত করুন',
        text: `আপনি কি ${relation.name || 'এই সম্পর্ক'} মুছে ফেলতে চান?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
        cancelButtonText: 'বাতিল',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
      });

      if (result.isConfirmed) {
        // TODO: Implement relation delete API
        setRelationsState(relationsState.filter((_, i) => i !== index));
        Swal.fire({
          icon: 'success',
          title: 'মুছে ফেলা হয়েছে!',
          text: 'সম্পর্ক সফলভাবে মুছে ফেলা হয়েছে।',
          confirmButtonColor: '#3b82f6',
          timer: 2000,
        });
      }
    };

    const filteredUmrahList = umrahList.filter((item) => {
      const query = relationSearch.trim().toLowerCase();
      if (!query) return true;
      const name = (item.name || '').toLowerCase();
      const mobile = (item.mobile || item.phone || '').toLowerCase();
      const customerId = String(item.customerId || item._id || '').toLowerCase();
      return name.includes(query) || mobile.includes(query) || customerId.includes(query);
    });

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">সম্পর্ক</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">এই প্রোফাইলের সাথে লিঙ্ক করা উমরাহ নির্ধারণ বা দেখুন।</p>
            </div>
            <button
              onClick={() => setShowRelationPicker(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              সম্পর্কযুক্ত উমরাহ নির্ধারণ করুন
            </button>
          </div>
          {relationsState.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {relationsState.map((relation, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{relation.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {relation.relatedUmrahId || relation._id || 'N/A'}</p>
                    {relation.relationType && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {relationTypeOptions.find(opt => opt.value === relation.relationType)?.label || relation.relationType}
                        {relation.mobile && ` • ${relation.mobile}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteRelation(idx)}
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

        {showRelationPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">সম্পর্ক নির্ধারণ করুন</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">লিঙ্ক করার জন্য উমরাহ যাত্রী খুঁজুন এবং নির্বাচন করুন।</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowRelationPicker(false);
                      setRelationSearch('');
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <input
                  type="text"
                  value={relationSearch}
                  onChange={(e) => setRelationSearch(e.target.value)}
                  placeholder="নাম, মোবাইল বা আইডি দিয়ে খুঁজুন"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সম্পর্কের ধরন</label>
                  <select
                    value={selectedRelationType}
                    onChange={(e) => setSelectedRelationType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {relationTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUmrahList.length === 0 ? (
                    <div className="p-4 text-sm text-gray-600 dark:text-gray-400 text-center">কোন উমরাহ যাত্রী পাওয়া যায়নি।</div>
                  ) : (
                    filteredUmrahList
                      .filter((item) => {
                        const itemId = String(item.id || item._id || item.customerId || '');
                        const currentId = String(id || '');
                        return itemId !== currentId;
                      })
                      .map((item) => {
                        const itemId = item.id || item._id || item.customerId;
                        const alreadyLinked = relationsState.some(
                          (r) => String(r.relatedUmrahId || r._id || r.id || '') === String(itemId || '')
                        );
                        return (
                          <div key={itemId} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div className="min-w-0 flex-1">
                              <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {item.name}
                                {alreadyLinked && (
                                  <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-normal">(যুক্ত করা হয়েছে)</span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                আইডি: {itemId || 'N/A'} • {item.mobile || item.phone || 'ফোন নেই'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRelationSelect(item)}
                              disabled={alreadyLinked}
                              className={`px-4 py-2 rounded-lg text-sm ${
                                alreadyLinked
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {alreadyLinked ? 'যুক্ত করা হয়েছে' : 'নির্বাচন করুন'}
                            </button>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTransactionHistory = () => {
    const formatAmount = (amount) => {
      return `৳${Number(amount || 0).toLocaleString('bn-BD')}`;
    };

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        {Object.keys(transactionSummary).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট লেনদেন</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {transactionSummary.totalTransactions || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট ক্রেডিট</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatAmount(transactionSummary.totalCredit)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট ডেবিট</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatAmount(transactionSummary.totalDebit)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">নিট পরিমাণ</p>
              <p className={`text-xl font-bold ${
                (transactionSummary.netAmount || 0) >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatAmount(transactionSummary.netAmount)}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ফিল্টার</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">শুরুর তারিখ</label>
              <input
                type="date"
                value={transactionFilters.fromDate}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, fromDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">শেষ তারিখ</label>
              <input
                type="date"
                value={transactionFilters.toDate}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, toDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">লেনদেনের ধরন</label>
              <select
                value={transactionFilters.transactionType}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, transactionType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">সব ধরন</option>
                <option value="credit">ক্রেডিট</option>
                <option value="debit">ডেবিট</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setTransactionFilters({ fromDate: '', toDate: '', transactionType: '' });
                  setTransactionPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                ফিল্টার সাফ করুন
              </button>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">লেনদেনের ইতিহাস</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">কোন লেনদেন পাওয়া যায়নি</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">তারিখ</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">ধরন</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">পরিমাণ</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">ক্যাটাগরি</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">পেমেন্ট মেথড</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">নোট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id || tx.transactionId} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            tx.transactionType === 'credit'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {tx.transactionType === 'credit' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )}
                            {tx.transactionType === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                          </span>
                        </td>
                        <td className={`py-3 px-2 text-sm font-semibold ${
                          tx.transactionType === 'credit'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {tx.transactionType === 'credit' ? '+' : '-'}{formatAmount(tx.amount || tx.paymentDetails?.amount || 0)}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                          {tx.serviceCategory || 'N/A'}
                          {tx.subCategory && (
                            <span className="text-gray-500 dark:text-gray-500"> • {tx.subCategory}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {tx.paymentMethod || 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={tx.notes || ''}>
                          {tx.notes || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {transactionPagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    পৃষ্ঠা {transactionPagination.page} এর {transactionPagination.totalPages} (মোট {transactionPagination.total})
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTransactionPage(prev => Math.max(1, prev - 1))}
                      disabled={transactionPagination.page <= 1}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      আগের
                    </button>
                    <button
                      onClick={() => setTransactionPage(prev => Math.min(transactionPagination.totalPages, prev + 1))}
                      disabled={transactionPagination.page >= transactionPagination.totalPages}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      পরের
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderRefunds = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">রিফান্ড ইতিহাস</h3>
          <Link
            href="/hajj-umrah/refund-management/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            নতুন রিফান্ড তৈরি করুন
          </Link>
        </div>
        
        {refunds.length === 0 ? (
          <div className="text-center py-8">
            <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">কোন রিফান্ড রেকর্ড পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">আইডি</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">তারিখ</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">পরিমাণ</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">কারণ</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund) => (
                  <tr key={refund.id || refund._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-2 text-sm text-gray-900 dark:text-white font-medium">
                      {refund.refundId || 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(refund.refundDate)}
                    </td>
                    <td className="py-3 px-2 text-sm font-bold text-red-600 dark:text-red-400">
                      ৳{Number(refund.amount || 0).toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {refund.reason || 'N/A'}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${refund.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          refund.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {refund.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderReferenceInfo = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">রেফারেন্স এবং উৎস তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">উৎস ধরন</label>
            <p className="text-base text-gray-900 dark:text-white capitalize">
              {umrah.sourceType === 'agent' ? 'এজেন্ট' : 'অফিস'}
            </p>
          </div>
          
          {umrah.sourceType === 'agent' ? (
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">এজেন্ট</label>
              {umrah.agentId ? (
                <Link href={`/hajj-umrah/b2b-agent/agent/${umrah.agentId}`} className="text-blue-600 hover:underline">
                  এজেন্ট প্রোফাইল দেখুন
                </Link>
              ) : (
                <p className="text-base text-gray-900 dark:text-white">N/A</p>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">ব্রাঞ্চ</label>
                <p className="text-base text-gray-900 dark:text-white">
                  {/* Ideally fetch branch name using ID, for now showing ID or N/A */}
                  {umrah.branchId || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">রেফারেন্স কর্মচারী</label>
                <p className="text-base text-gray-900 dark:text-white">
                  {umrah.employerId || 'N/A'}
                </p>
              </div>
            </>
          )}

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">রেফারেন্স (হাজী)</label>
            <p className="text-base text-gray-900 dark:text-white">
              {umrah.referenceHaji || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

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
      case 'refund':
        return renderRefunds();
      case 'reference':
        return renderReferenceInfo();
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
              href="/hajj-umrah/umrah/haji-list"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                উমরাহ বিবরণ - {umrah.name || 'N/A'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">উমরাহ-এর সম্পূর্ণ তথ্য</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <button
              onClick={() => setShowPackagePicker(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Package className="w-4 h-4" />
              <span>প্যাকেজ যোগ করুন</span>
            </button>
            <button
              onClick={handleDownloadCardPDF}
              disabled={isGeneratingCardPdf}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingCardPdf ? 'তৈরি হচ্ছে...' : 'নামপ্লেট'}</span>
            </button>
            <button
              onClick={handleIdCardClick}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              <CreditCard className="w-4 h-4" />
              <span>আইডি কার্ড</span>
            </button>
            <button
              onClick={handleChuktiPattroClick}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <FileText className="w-4 h-4" />
              <span>চুক্তি পত্র</span>
            </button>
            <Link
              href={`/hajj-umrah/umrah/haji/${id}/edit`}
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

        {/* Package Picker Modal */}
        {showPackagePicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">প্যাকেজ নির্বাচন করুন</h3>
                  <button
                    onClick={() => {
                      setShowPackagePicker(false);
                      setPackageSearch('');
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <input
                  type="text"
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  placeholder="নাম, টাইপ, বছর দিয়ে খুঁজুন..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                  {packages.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-600 dark:text-gray-400">কোন প্যাকেজ পাওয়া যায়নি।</div>
                  ) : (
                    packages
                      .filter((p) => {
                        const q = packageSearch.toLowerCase();
                        if (!q) return true;
                        const name = (p.packageName || p.name || '').toLowerCase();
                        const type = (p.packageType || '').toLowerCase();
                        return name.includes(q) || type.includes(q);
                      })
                      .map((p) => (
                        <div key={p.id || p._id} className="flex items-center justify-between p-4 border-l-2 border-l-purple-500">
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{p.packageName || p.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {p.packageType || 'N/A'} • {p.packageYear || '-'}
                            </p>
                            {p.price && (
                              <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                মূল্য: ৳{formatNumber(p.price)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              // TODO: Implement package assignment
                              Swal.fire({
                                icon: 'info',
                                title: 'শীঘ্রই উপলব্ধ',
                                text: 'প্যাকেজ assignment feature coming soon',
                                confirmButtonColor: '#3b82f6',
                              });
                              setShowPackagePicker(false);
                            }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                          >
                            নির্বাচন করুন
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UmrahHajiDetails;
