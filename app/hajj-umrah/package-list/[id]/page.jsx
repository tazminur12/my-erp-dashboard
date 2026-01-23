'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Package,
  Calculator,
  FileText,
  AlertCircle,
  Printer,
  Users,
  User,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus
} from 'lucide-react';
import Swal from 'sweetalert2';

const PackageDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [activeTab, setActiveTab] = useState('overview');
  
  const [pkg, setPkg] = useState(null);
  const [customers, setCustomers] = useState({ haji: [], umrah: [], all: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch package data
  useEffect(() => {
    if (id) {
      fetchPackageData();
      fetchPackageCustomers();
    }
  }, [id]);

  const fetchPackageData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/packages/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setPkg(data.package || data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch package');
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPackageCustomers = async () => {
    try {
      setCustomersLoading(true);
      // Fetch hajis
      const hajisResponse = await fetch(`/api/hajj-umrah/hajis?packageId=${id}&limit=10000`);
      const hajisData = await hajisResponse.json();
      const hajis = hajisData.data || hajisData.hajis || [];

      // Fetch umrahs
      const umrahsResponse = await fetch(`/api/hajj-umrah/umrahs?packageId=${id}&limit=10000`);
      const umrahsData = await umrahsResponse.json();
      const umrahs = umrahsData.data || umrahsData.umrahs || [];

      setCustomers({
        haji: hajis,
        umrah: umrahs,
        all: [...hajis, ...umrahs]
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Calculate total income from customers
  const calculateTotalIncome = () => {
    const allCustomers = customers.all || [];
    let totalIncome = 0;
    let totalPaid = 0;
    let totalDue = 0;

    allCustomers.forEach(customer => {
      const totalAmount = parseFloat(customer.totalAmount) || 0;
      const paidAmount = parseFloat(customer.paidAmount) || 0;
      const dueAmount = totalAmount - paidAmount;

      totalIncome += totalAmount;
      totalPaid += paidAmount;
      totalDue += Math.max(0, dueAmount);
    });

    return {
      totalIncome,
      totalPaid,
      totalDue,
      customerCount: allCustomers.length
    };
  };

  const incomeStats = calculateTotalIncome();

  // Calculate assigned passenger counts by type
  const getAssignedPassengerCounts = () => {
    // First try to use profitLoss data if available
    if (pkg?.profitLoss?.assignedPassengerCounts) {
      return {
        adult: pkg.profitLoss.assignedPassengerCounts.adult || 0,
        child: pkg.profitLoss.assignedPassengerCounts.child || 0,
        infant: pkg.profitLoss.assignedPassengerCounts.infant || 0
      };
    }
    
    // Fallback: count from customers array
    const allCustomers = customers.all || [];
    let adultCount = 0;
    let childCount = 0;
    let infantCount = 0;

    allCustomers.forEach(customer => {
      const passengerType = customer.passengerType || customer.passenger_type || 'adult';
      if (passengerType.toLowerCase() === 'adult') {
        adultCount++;
      } else if (passengerType.toLowerCase() === 'child') {
        childCount++;
      } else if (passengerType.toLowerCase() === 'infant') {
        infantCount++;
      } else {
        // Default to adult if type is not recognized
        adultCount++;
      }
    });

    return { adult: adultCount, child: childCount, infant: infantCount };
  };

  const assignedPassengerCounts = getAssignedPassengerCounts();

  // Profit & Loss summary (uses backend data when available)
  const profitLossData = pkg?.profitLoss || {
    totalCost: 0,
    sellingPrice: 0,
    profitOrLoss: 0,
    profitLossPercentage: 0,
    isProfit: false,
    isLoss: false,
    assignedPassengerCounts: { adult: 0, child: 0, infant: 0 },
    originalPrices: { adult: 0, child: 0, infant: 0 },
    costingPrices: { adult: 0, child: 0, infant: 0 },
    passengerOriginalTotals: { adult: 0, child: 0, infant: 0 },
    passengerCostingTotals: { adult: 0, child: 0, infant: 0 },
    passengerProfit: { adult: 0, child: 0, infant: 0 }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: FileText },
    { id: 'package', label: 'Package Info', icon: Package },
    { id: 'financial', label: 'Financial', icon: CreditCard },
    { id: 'profitLoss', label: 'Profit & Loss', icon: TrendingUp }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Suspended':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Haj':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Umrah':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getHotelDisplayName = (hotelType) => {
    const hotelNames = {
      makkahHotel1: 'মক্কা হোটেল ০১',
      makkahHotel2: 'মক্কা হোটেল ০২',
      makkahHotel3: 'মক্কা হোটেল ০৩',
      madinaHotel1: 'মদিনা হোটেল ০১',
      madinaHotel2: 'মদিনা হোটেল ০২'
    };
    return hotelNames[hotelType] || hotelType;
  };

  const handleEdit = () => {
    const customType = pkg?.customPackageType || '';
    if (customType.toLowerCase().includes('umrah')) {
      router.push(`/umrah/umrah-package-list/${id}/edit`);
    } else if (customType.toLowerCase().includes('haj') || customType.toLowerCase().includes('hajj')) {
      router.push(`/hajj-umrah/haj-package-list/${id}/edit`);
    } else {
      router.push(`/hajj-umrah/package-list/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${pkg.packageName || 'এই'} প্যাকেজ মুছে ফেলতে চান? এই কাজটি অপরিবর্তনীয়।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/packages/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'প্যাকেজ সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonColor: '#10B981',
            timer: 2000,
          });
          router.push('/hajj-umrah/package-list');
        } else {
          throw new Error(data.error || 'Failed to delete package');
        }
      } catch (error) {
        console.error('Error deleting package:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'প্যাকেজ মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">প্যাকেজ লোড করা হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !pkg) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">প্যাকেজ লোড করতে সমস্যা হয়েছে</p>
            <button
              onClick={() => router.push('/hajj-umrah/package-list')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              প্যাকেজ তালিকায় ফিরুন
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
        <style jsx>{`
          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 no-print">
            <button
              onClick={() => router.push('/hajj-umrah/package-list')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">প্যাকেজ তালিকায় ফিরুন</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {pkg.packageName || 'Unnamed Package'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  প্যাকেজ বিস্তারিত তথ্য দেখুন এবং সম্পাদনা করুন
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
                <button
                  onClick={() => router.push(`/hajj-umrah/package-list/${id}/customers`)}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Assign করা কাস্টমার</span>
                </button>
                {/* Add Costing button - only for Haj packages */}
                {(pkg?.customPackageType?.toLowerCase().includes('haj') || pkg?.customPackageType?.toLowerCase().includes('hajj')) && (
                  <button
                    onClick={() => router.push(`/hajj/package-list/${id}/costing`)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Add Costing</span>
                  </button>
                )}
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>সম্পাদনা করুন</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>মুছুন</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${isActive
                          ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">স্ট্যাটাস</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                            {pkg.status || 'N/A'}
                          </span>
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">প্যাকেজ টাইপ</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(pkg.packageType)}`}>
                            {pkg.packageType || 'N/A'}
                          </span>
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">রিয়াল রেট</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                          {formatNumber(pkg.sarToBdtRate)} SAR → BDT
                        </p>
                      </div>
                      <Calculator className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      প্যাকেজ নাম
                    </label>
                    <p className="text-base text-gray-900 dark:text-white font-semibold">
                      {pkg.packageName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      প্যাকেজ আইডি
                    </label>
                    <p className="text-base text-gray-900 dark:text-white font-mono">
                      {pkg._id?.slice(-6) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      সাল
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {pkg.packageYear || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      মাস
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {pkg.packageMonth || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      কাস্টম প্যাকেজ টাইপ
                    </label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(pkg.customPackageType)}`}>
                      {pkg.customPackageType || 'N/A'}
                    </span>
                  </div>
                  {pkg.created_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        তৈরি করা হয়েছে
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">
                        {new Date(pkg.created_at).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Cost Summary */}
                {pkg.totals?.passengerTotals && (
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      যাত্রীর ধরন অনুযায়ী খরচ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Adult (প্রাপ্তবয়স্ক)</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(pkg.totals.passengerTotals.adult)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Child (শিশু)</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(pkg.totals.passengerTotals.child)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Infant (শিশু)</p>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(pkg.totals.passengerTotals.infant)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      প্যাকেজ নাম
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {pkg.packageName || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      প্যাকেজ আইডি
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {pkg._id || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      সাল
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {pkg.packageYear || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      মাস
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {pkg.packageMonth || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      প্যাকেজ টাইপ
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(pkg.packageType)}`}>
                        {pkg.packageType || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      কাস্টম প্যাকেজ টাইপ
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(pkg.customPackageType)}`}>
                        {pkg.customPackageType || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      রিয়াল রেট (SAR → BDT)
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {formatNumber(pkg.sarToBdtRate)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      স্ট্যাটাস
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                        {pkg.status || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {pkg.created_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        তৈরি করা হয়েছে
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {new Date(pkg.created_at).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  )}
                </div>

                {pkg.notes && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      নোট
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-4 rounded-lg whitespace-pre-wrap">
                      {pkg.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Package Info Tab - Similar structure, showing costs */}
            {activeTab === 'package' && pkg.costs && (
              <div className="space-y-6">
                {/* Bangladesh Costs */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">বাংলাদেশ অংশ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pkg.costs.idCard !== undefined && (
                      <div className="flex items-center gap-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">আইডি কার্ড ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.idCard)}</span>
                      </div>
                    )}
                    {pkg.costs.hajjKollan !== undefined && (
                      <div className="flex items-center gap-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">হজ্জ কল্যাণ ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.hajjKollan)}</span>
                      </div>
                    )}
                    {pkg.costs.trainFee !== undefined && (
                      <div className="flex items-center gap-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ট্রেনিং ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.trainFee)}</span>
                      </div>
                    )}
                    {pkg.costs.hajjGuide !== undefined && (
                      <div className="flex items-center gap-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">হজ গাইড ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.hajjGuide)}</span>
                      </div>
                    )}
                    {pkg.costs.visaFee !== undefined && (
                      <div className="flex items-center gap-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ভিসা ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.visaFee)}</span>
                      </div>
                    )}
                    {pkg.costs.otherBdCosts !== undefined && (
                      <div className="flex items-center gap-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">অন্যান্য খরচ</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.otherBdCosts)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Air Fare */}
                {(pkg.costs.airFareDetails || pkg.costs.airFare !== undefined) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">বিমান ভাড়া</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pkg.costs.airFareDetails ? (
                        <>
                          {pkg.costs.airFareDetails.adult?.price !== undefined && (
                            <div className="flex items-center gap-x-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">বিমান ভাড়া (Adult)</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.airFareDetails.adult.price)}</span>
                            </div>
                          )}
                          {pkg.costs.airFareDetails.child?.price !== undefined && (
                            <div className="flex items-center gap-x-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">বিমান ভাড়া (Child)</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.airFareDetails.child.price)}</span>
                            </div>
                          )}
                          {pkg.costs.airFareDetails.infant?.price !== undefined && (
                            <div className="flex items-center gap-x-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">বিমান ভাড়া (Infant)</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.airFareDetails.infant.price)}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        pkg.costs.airFare !== undefined && (
                          <div className="flex items-center gap-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">বিমান ভাড়া</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.airFare)}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Saudi Costs */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সৌদি অংশ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const sarToBdtRate = parseFloat(pkg.sarToBdtRate) || 1;
                      return (
                        <>
                          {pkg.costs.food !== undefined && (
                            <div className="flex items-center gap-x-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">খাবার</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency((parseFloat(pkg.costs.food) || 0) * sarToBdtRate)}</span>
                            </div>
                          )}
                          {pkg.costs.ziyaraFee !== undefined && (
                            <div className="flex items-center gap-x-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">জিয়ারা ফি</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency((parseFloat(pkg.costs.ziyaraFee) || 0) * sarToBdtRate)}</span>
                            </div>
                          )}
                          {pkg.costs.campFee !== undefined && (
                            <div className="flex items-center gap-x-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">ক্যাম্প ফি</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency((parseFloat(pkg.costs.campFee) || 0) * sarToBdtRate)}</span>
                            </div>
                          )}
                          {pkg.costs.insuranceFee !== undefined && (
                            <div className="flex items-center gap-x-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">ইনস্যুরেন্স ফি</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency((parseFloat(pkg.costs.insuranceFee) || 0) * sarToBdtRate)}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Hotel Costs */}
                {pkg.costs.hotelDetails && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">হোটেল ভাড়া</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(pkg.costs.hotelDetails).map((hotelType) => {
                        const hotel = pkg.costs.hotelDetails[hotelType];
                        const sarToBdtRate = pkg.sarToBdtRate || 1;
                        
                        return (
                          <React.Fragment key={hotelType}>
                            {hotel.adult?.price !== undefined && hotel.adult?.nights !== undefined && (
                              <div className="flex items-center gap-x-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {getHotelDisplayName(hotelType)} (Adult) - {hotel.adult.nights} রাত
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency((parseFloat(hotel.adult.price) || 0) * (parseFloat(hotel.adult.nights) || 0) * sarToBdtRate)}
                                </span>
                              </div>
                            )}
                            {hotel.child?.price !== undefined && hotel.child?.nights !== undefined && (
                              <div className="flex items-center gap-x-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {getHotelDisplayName(hotelType)} (Child) - {hotel.child.nights} রাত
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency((parseFloat(hotel.child.price) || 0) * (parseFloat(hotel.child.nights) || 0) * sarToBdtRate)}
                                </span>
                              </div>
                            )}
                            {hotel.infant?.price !== undefined && hotel.infant?.nights !== undefined && (
                              <div className="flex items-center gap-x-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {getHotelDisplayName(hotelType)} (Infant) - {hotel.infant.nights} রাত
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency((parseFloat(hotel.infant.price) || 0) * (parseFloat(hotel.infant.nights) || 0) * sarToBdtRate)}
                                </span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                {/* Total Income Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                    মোট আয় (Total Income)
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">মোট কাস্টমার</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {incomeStats.customerCount}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-2 border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">মোট আয় (Expected)</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(incomeStats.totalIncome)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-2 border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">মোট গ্রহীত</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(incomeStats.totalPaid)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-2 border-red-200 dark:border-red-800">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">বকেয়া</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(incomeStats.totalDue)}
                      </p>
                    </div>
                  </div>

                  {incomeStats.customerCount === 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        এখনও কোন কাস্টমার এই প্যাকেজে assign করা হয়নি। কাস্টমার assign করার পর এখানে আয়ের তথ্য দেখাবে।
                      </p>
                    </div>
                  )}
                </div>

                {/* Cost Breakdown */}
                {pkg.totals && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                      খরচের বিস্তারিত
                    </h2>

                    {/* Passenger Type Totals */}
                    {pkg.totals.passengerTotals && (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                          যাত্রীর ধরন অনুযায়ী খরচ
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                              Adult (প্রাপ্তবয়স্ক)
                              {assignedPassengerCounts.adult > 0 && (
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                  ({assignedPassengerCounts.adult} জন)
                                </span>
                              )}
                            </p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(pkg.totals.passengerTotals.adult)}
                            </p>
                            {assignedPassengerCounts.adult > 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                মোট: {formatCurrency(pkg.totals.passengerTotals.adult * assignedPassengerCounts.adult)}
                              </p>
                            )}
                          </div>
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                              Child (শিশু)
                              {assignedPassengerCounts.child > 0 && (
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                  ({assignedPassengerCounts.child} জন)
                                </span>
                              )}
                            </p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(pkg.totals.passengerTotals.child)}
                            </p>
                            {assignedPassengerCounts.child > 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                মোট: {formatCurrency(pkg.totals.passengerTotals.child * assignedPassengerCounts.child)}
                              </p>
                            )}
                          </div>
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                              Infant (শিশু)
                              {assignedPassengerCounts.infant > 0 && (
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                  ({assignedPassengerCounts.infant} জন)
                                </span>
                              )}
                            </p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {formatCurrency(pkg.totals.passengerTotals.infant)}
                            </p>
                            {assignedPassengerCounts.infant > 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                মোট: {formatCurrency(pkg.totals.passengerTotals.infant * assignedPassengerCounts.infant)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Profit & Loss Tab */}
            {activeTab === 'profitLoss' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Profit & Loss
                  </h2>
                  <button
                    onClick={() => {
                      const customType = pkg?.customPackageType || '';
                      if (customType.toLowerCase().includes('umrah')) {
                        router.push(`/umrah/umrah-package-list/${id}/costing`);
                      } else if (customType.toLowerCase().includes('haj') || customType.toLowerCase().includes('hajj')) {
                        router.push(`/hajj/package-list/${id}/costing`);
                      } else {
                        router.push(`/hajj-umrah/package-list/${id}/costing`);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Costing</span>
                  </button>
                </div>

                <div className={`rounded-2xl border-2 p-6 shadow-sm ${
                  profitLossData.isProfit
                    ? 'border-green-200 dark:border-green-800 bg-green-50/40 dark:bg-green-900/10'
                    : profitLossData.isLoss
                    ? 'border-red-200 dark:border-red-800 bg-red-50/40 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-800/40'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Costing Price</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(profitLossData.totalCost)}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Package Price</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(profitLossData.sellingPrice)}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg p-5 flex items-center justify-between ${
                    profitLossData.isProfit
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : profitLossData.isLoss
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                        {profitLossData.isProfit ? 'লাভ (Profit)' : profitLossData.isLoss ? 'ক্ষতি (Loss)' : 'লাভ/ক্ষতি (Profit/Loss)'}
                      </p>
                      <p className={`text-3xl font-bold ${
                        profitLossData.isProfit
                          ? 'text-green-700 dark:text-green-400'
                          : profitLossData.isLoss
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {profitLossData.isProfit ? '+' : ''}{formatCurrency(profitLossData.profitOrLoss)}
                      </p>
                      {profitLossData.profitLossPercentage !== 0 && (
                        <p className={`mt-1 text-sm font-semibold flex items-center ${
                          profitLossData.isProfit
                            ? 'text-green-700 dark:text-green-400'
                            : profitLossData.isLoss
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {profitLossData.isProfit ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : profitLossData.isLoss ? (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          ) : null}
                          {Math.abs(profitLossData.profitLossPercentage).toFixed(2)}%
                        </p>
                      )}
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      profitLossData.isProfit
                        ? 'bg-green-200 dark:bg-green-800/40'
                        : profitLossData.isLoss
                        ? 'bg-red-200 dark:bg-red-800/40'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {profitLossData.isProfit ? (
                        <TrendingUp className="w-6 h-6 text-green-700 dark:text-green-400" />
                      ) : profitLossData.isLoss ? (
                        <TrendingDown className="w-6 h-6 text-red-700 dark:text-red-400" />
                      ) : (
                        <Calculator className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      )}
                    </div>
                  </div>

                  {/* Per-Passenger-Type Breakdown */}
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      যাত্রীর ধরন অনুযায়ী বিস্তারিত (Per Passenger Type Breakdown)
                    </h3>
                    
                    {/* Adult Breakdown */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                        <h4 className="text-base font-bold text-blue-700 dark:text-blue-400 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Adult (প্রাপ্তবয়স্ক)
                        </h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {profitLossData.assignedPassengerCounts?.adult || 0} জন
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Original Price</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(profitLossData.originalPrices?.adult || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Costing Price</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(profitLossData.costingPrices?.adult || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Original Total</p>
                          <p className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(profitLossData.passengerOriginalTotals?.adult || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Costing Total</p>
                          <p className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(profitLossData.passengerCostingTotals?.adult || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profit/Loss:</span>
                          <span className={`text-base font-bold ${
                            (profitLossData.passengerProfit?.adult || 0) > 0
                              ? 'text-green-600 dark:text-green-400'
                              : (profitLossData.passengerProfit?.adult || 0) < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {(profitLossData.passengerProfit?.adult || 0) > 0 ? '+' : ''}
                            {formatCurrency(profitLossData.passengerProfit?.adult || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Child Breakdown */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                        <h4 className="text-base font-bold text-green-700 dark:text-green-400 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Child (শিশু)
                        </h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {profitLossData.assignedPassengerCounts?.child || 0} জন
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Original Price</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(profitLossData.originalPrices?.child || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Costing Price</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(profitLossData.costingPrices?.child || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Original Total</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(profitLossData.passengerOriginalTotals?.child || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Costing Total</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(profitLossData.passengerCostingTotals?.child || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profit/Loss:</span>
                          <span className={`text-base font-bold ${
                            (profitLossData.passengerProfit?.child || 0) > 0
                              ? 'text-green-600 dark:text-green-400'
                              : (profitLossData.passengerProfit?.child || 0) < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {(profitLossData.passengerProfit?.child || 0) > 0 ? '+' : ''}
                            {formatCurrency(profitLossData.passengerProfit?.child || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Infant Breakdown */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                        <h4 className="text-base font-bold text-orange-700 dark:text-orange-400 flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          Infant (শিশু)
                        </h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {profitLossData.assignedPassengerCounts?.infant || 0} জন
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Original Price</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(profitLossData.originalPrices?.infant || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Costing Price</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(profitLossData.costingPrices?.infant || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Original Total</p>
                          <p className="font-semibold text-orange-600 dark:text-orange-400">
                            {formatCurrency(profitLossData.passengerOriginalTotals?.infant || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Costing Total</p>
                          <p className="font-semibold text-orange-600 dark:text-orange-400">
                            {formatCurrency(profitLossData.passengerCostingTotals?.infant || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profit/Loss:</span>
                          <span className={`text-base font-bold ${
                            (profitLossData.passengerProfit?.infant || 0) > 0
                              ? 'text-green-600 dark:text-green-400'
                              : (profitLossData.passengerProfit?.infant || 0) < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {(profitLossData.passengerProfit?.infant || 0) > 0 ? '+' : ''}
                            {formatCurrency(profitLossData.passengerProfit?.infant || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PackageDetails;
