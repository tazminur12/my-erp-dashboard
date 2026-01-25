'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { List, Search, Filter, Eye, Edit, Trash2, Package, Calculator, Download, Building2, Users, Plus } from 'lucide-react';
import Swal from 'sweetalert2';

const AgentPackageList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'hajj', 'umrah'
  const [selectedYear, setSelectedYear] = useState('all');
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all agent packages
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      // Use /api/packages instead of /api/agent-packages since packages are stored in 'packages' collection
      const response = await fetch('/api/packages');
      const data = await response.json();
      
      console.log('API Response:', data);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const allPackages = data.data || data.packages || [];
        // Filter only agent packages (packages with agentId)
        const agentPackages = allPackages.filter(pkg => {
          return pkg.agentId || pkg.agent_id || pkg.agentInfo?.agentId || pkg.agentInfo?._id;
        });
        console.log('Total packages found:', allPackages.length);
        console.log('Agent packages found:', agentPackages.length);
        setPackages(agentPackages);
        
        if (agentPackages.length === 0) {
          console.warn('No agent packages found in database');
        }
      } else {
        console.error('API Error:', data);
        throw new Error(data.error || data.message || 'Failed to fetch packages');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'প্যাকেজ লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (pkg) => {
    router.push(`/hajj-umrah/b2b-agent/agent-packages/${pkg._id}`);
  };

  const handleEdit = (pkg) => {
    router.push(`/hajj-umrah/b2b-agent/agent-packages/${pkg._id}/edit`);
  };

  const handleDelete = async (pkg) => {
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
        // Try /api/packages first since packages are stored in 'packages' collection
        let response = await fetch(`/api/packages/${pkg._id}`, {
          method: 'DELETE',
        });
        let data = await response.json();

        // If /api/packages doesn't work, try /api/agent-packages as fallback
        if (!response.ok) {
          console.log('Package not found in /api/packages, trying /api/agent-packages...');
          response = await fetch(`/api/agent-packages/${pkg._id}`, {
            method: 'DELETE',
          });
          data = await response.json();
        }

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'প্যাকেজ সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonColor: '#10B981',
            timer: 2000,
          });
          // Refresh the package list
          fetchPackages();
        } else {
          console.error('Delete error:', data);
          throw new Error(data.error || data.message || 'Failed to delete package');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Published':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '৳0';
    const numericValue = Number(amount) || 0;
    return `৳${numericValue.toLocaleString('en-BD')}`;
  };

  const calculateProfitLoss = (pkg) => {
    const totals = pkg.totals || {};
    const profitLossFromApi = pkg.profitLoss || {};

    const costingPrice = profitLossFromApi.costingPrice || totals.costingPrice || totals.grandTotal || 0;
    const packagePrice = profitLossFromApi.packagePrice || pkg.totalPrice || totals.packagePrice || totals.subtotal || totals.grandTotal || 0;
    const profitValue = profitLossFromApi.profitOrLoss || profitLossFromApi.profitLoss || (packagePrice - costingPrice);
    const percentage = packagePrice ? (profitValue / packagePrice) * 100 : 0;

    return {
      costingPrice,
      packagePrice,
      profitValue,
      percentage,
      isProfit: profitValue > 0,
      isLoss: profitValue < 0,
    };
  };

  // Filter packages
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const pkgName = pkg.packageName || '';
      const agentName = pkg.agent?.tradeName || pkg.agent?.ownerName || '';
      
      // Search filter
      const matchesSearch = 
        pkgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg._id?.slice(-6) || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = selectedStatus === 'all' || 
        (pkg.isActive && selectedStatus === 'active') ||
        (!pkg.isActive && selectedStatus === 'inactive') ||
        (pkg.status && selectedStatus.toLowerCase() === pkg.status.toLowerCase());
      
      // Type filter
      const isHajj = pkg.packageType === 'Hajj' || pkg.packageType === 'হজ্জ' || 
                     pkg.customPackageType === 'Custom Hajj' || pkg.customPackageType === 'Hajj';
      const isUmrah = pkg.packageType === 'Umrah' || pkg.packageType === 'উমরাহ' || 
                      pkg.customPackageType === 'Custom Umrah' || pkg.customPackageType === 'Umrah';
      
      const matchesType = selectedType === 'all' ||
        (selectedType === 'hajj' && isHajj) ||
        (selectedType === 'umrah' && isUmrah);
      
      // Year filter
      const matchesYear = selectedYear === 'all' || 
        String(pkg.packageYear) === selectedYear;
      
      return matchesSearch && matchesStatus && matchesType && matchesYear;
    });
  }, [packages, searchTerm, selectedStatus, selectedType, selectedYear]);

  // Calculate statistics
  const { totalPackages, activePackages, totalRevenue, totalProfit } = useMemo(() => {
    let total = filteredPackages.length;
    let active = filteredPackages.filter(p => p.isActive).length;
    let revenue = 0;
    let profit = 0;

    filteredPackages.forEach(pkg => {
      const profitLoss = calculateProfitLoss(pkg);
      revenue += profitLoss.packagePrice;
      profit += profitLoss.profitValue;
    });

    return {
      totalPackages: total,
      activePackages: active,
      totalRevenue: revenue,
      totalProfit: profit
    };
  }, [filteredPackages]);

  // Get unique years from packages
  const availableYears = useMemo(() => {
    const years = new Set();
    packages.forEach(pkg => {
      if (pkg.packageYear) {
        years.add(String(pkg.packageYear));
      }
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [packages]);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <List className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                এজেন্ট প্যাকেজ তালিকা
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                সব এজেন্টের প্যাকেজের তথ্য ও ব্যবস্থাপনা
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto">
              <Download className="w-4 h-4" />
              <span className="text-sm sm:text-base">এক্সপোর্ট</span>
            </button>
            <button 
              onClick={() => router.push('/hajj-umrah/b2b-agent/agent-packages/create')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm sm:text-base">নতুন প্যাকেজ</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট প্যাকেজ</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalPackages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">সক্রিয় প্যাকেজ</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{activePackages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট আয়</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                totalProfit >= 0 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                <Calculator className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  totalProfit >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট লাভ/ক্ষতি</p>
                <p className={`text-sm sm:text-base lg:text-lg font-bold ${
                  totalProfit >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(totalProfit)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="প্যাকেজ নাম, এজেন্ট নাম বা আইডি দিয়ে সার্চ করুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">সব ধরন</option>
                <option value="hajj">হজ্জ</option>
                <option value="umrah">উমরাহ</option>
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">সব বছর</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
                <option value="Draft">খসড়া</option>
                <option value="Published">প্রকাশিত</option>
              </select>
              
              <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="text-sm sm:text-base">ফিল্টার</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">প্যাকেজ লোড করা হচ্ছে...</p>
          </div>
        )}

        {/* Packages Table */}
        {!isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      প্যাকেজ
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      এজেন্ট
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ধরন
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      বছর
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      মূল্য
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      লাভ/ক্ষতি
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      স্ট্যাটাস
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      অ্যাকশন
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPackages.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">কোন এজেন্ট প্যাকেজ নেই</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          এখনও কোন এজেন্ট প্যাকেজ পাওয়া যায়নি।
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPackages.map((pkg) => {
                      const profitLoss = calculateProfitLoss(pkg);
                      const isHajj = pkg.packageType === 'Hajj' || pkg.packageType === 'হজ্জ' || 
                                     pkg.customPackageType === 'Custom Hajj' || pkg.customPackageType === 'Hajj';
                      const isUmrah = pkg.packageType === 'Umrah' || pkg.packageType === 'উমরাহ' || 
                                      pkg.customPackageType === 'Custom Umrah' || pkg.customPackageType === 'Umrah';
                      
                      return (
                        <tr key={pkg._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                              </div>
                              <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {pkg.packageName || 'Unnamed Package'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {pkg._id?.slice(-6) || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-xs sm:text-sm text-gray-900 dark:text-white truncate max-w-[150px]">
                                {pkg.agent?.tradeName || pkg.agent?.ownerName || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              isHajj 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : isUmrah
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {isHajj ? 'হজ্জ' : isUmrah ? 'উমরাহ' : pkg.packageType || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                              {pkg.packageYear || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(profitLoss.packagePrice)}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex flex-col">
                              <span className={`text-xs sm:text-sm font-semibold ${
                                profitLoss.isProfit
                                  ? 'text-green-600 dark:text-green-400'
                                  : profitLoss.isLoss
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {profitLoss.isProfit ? '+' : ''}{formatCurrency(profitLoss.profitValue)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({profitLoss.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status || (pkg.isActive ? 'Active' : 'Inactive'))}`}>
                              {pkg.status || (pkg.isActive ? 'Active' : 'Inactive')}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                              <button
                                onClick={() => handleView(pkg)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                title="দেখুন"
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(pkg)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
                                title="সম্পাদনা করুন"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(pkg)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                                title="মুছুন"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AgentPackageList;
