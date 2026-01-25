'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../../component/DashboardLayout';
import {
  Users, ArrowLeft, Pencil, UserCheck, Calendar, DollarSign,
  TrendingUp, TrendingDown, MapPin, Phone, Mail, CreditCard, FileText,
  Building, Globe, Award, Target, BarChart3, PieChart, Package,
  ChevronDown, ChevronUp, Eye, Edit, Trash2, Plus, Wallet, Receipt,
  PiggyBank, Calculator, FileSpreadsheet, AlertTriangle, Banknote, RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';

// Safely convert mixed string/number values (handles commas, currency symbols)
const toNumeric = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    if (!cleaned) return null;
    const numericValue = Number(cleaned);
    return Number.isNaN(numericValue) ? null : numericValue;
  }
  return null;
};

const resolveNumber = (...values) => {
  for (const value of values) {
    const numericValue = toNumeric(value);
    if (numericValue !== null) {
      return numericValue;
    }
  }
  return 0;
};

const pickNumberFromObject = (source, keys, fallback = 0) => {
  if (!source) return fallback;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const numericValue = toNumeric(source[key]);
      if (numericValue !== null) {
        return numericValue;
      }
    }
  }
  return fallback;
};

const formatCurrency = (amount = 0) => {
  const numericValue = Number(amount) || 0;
  return `৳${numericValue.toLocaleString()}`;
};

const formatCount = (value = 0) => {
  const numericValue = Number(value) || 0;
  return numericValue.toLocaleString();
};

const formatPercentage = (value = 0) => `${(Number(value) || 0).toFixed(1)}%`;

const formatProfitLoss = (profit = 0) => {
  const numericValue = Number(profit) || 0;
  const sign = numericValue >= 0 ? '+' : '-';
  const absoluteValue = Math.abs(numericValue);
  return `${sign}${formatCurrency(absoluteValue)}`;
};

const calculateProfitLoss = (pkg = {}) => {
  const totals = pkg.totals || {};
  const profitLossFromApi = pkg.profitLoss || {};

  const costingPrice =
    resolveNumber(
      profitLossFromApi.totalCostingPrice,
      profitLossFromApi.costingPrice,
      totals.costingPrice,
      totals.grandTotal,
      pkg.costingPrice
    ) || 0;

  const packagePrice =
    resolveNumber(
      profitLossFromApi.packagePrice,
      pkg.totalPrice,
      totals.packagePrice,
      totals.subtotal,
      totals.grandTotal
    ) || 0;

  const profitValue =
    resolveNumber(
      profitLossFromApi.profitOrLoss,
      profitLossFromApi.profitLoss
    ) || (packagePrice - costingPrice);

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

const AgentDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  // State for yearly packages section
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedYears, setExpandedYears] = useState(new Set([new Date().getFullYear()]));
  
  // State for summary view filter
  const [activeSummaryView, setActiveSummaryView] = useState('hajj'); // 'all', 'hajj', 'umrah'
  
  // State for data
  const [agent, setAgent] = useState(null);
  const [packages, setPackages] = useState([]);
  const [hajiData, setHajiData] = useState([]);
  const [umrahData, setUmrahData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch agent details
  useEffect(() => {
    if (id) {
      fetchAgent();
      fetchPackages();
      fetchHajis();
      fetchUmrahs();
    }
  }, [id]);

  // Refetch data when page becomes visible (user returns from transaction page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id) {
        // Page became visible, refetch agent data to get latest updates
        console.log('🔄 Page became visible, refetching agent data...');
        fetchAgent();
      }
    };

    const handleFocus = () => {
      if (id) {
        // Window focused, refetch agent data
        console.log('🔄 Window focused, refetching agent data...');
        fetchAgent();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAgent = async () => {
    try {
      setIsLoading(true);
      // Add cache: 'no-store' to ensure fresh data on every fetch
      const response = await fetch(`/api/agents/${id}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setAgent(data.agent || data);
      } else {
        throw new Error(data.error || 'Failed to fetch agent');
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      setPackagesLoading(true);
      const response = await fetch(`/api/packages?agentId=${id}&limit=1000`);
      const data = await response.json();
      
      if (response.ok) {
        setPackages(data.data || data.packages || []);
      } else {
        throw new Error(data.error || 'Failed to fetch packages');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setPackagesLoading(false);
    }
  };

  const fetchHajis = async () => {
    try {
      const response = await fetch('/api/hajj-umrah/hajis?limit=1000');
      const data = await response.json();
      setHajiData(data.data || data.hajis || []);
    } catch (error) {
      console.error('Error fetching hajis:', error);
    }
  };

  const fetchUmrahs = async () => {
    try {
      const response = await fetch('/api/hajj-umrah/umrahs?limit=1000');
      const data = await response.json();
      setUmrahData(data.data || data.umrahs || []);
    } catch (error) {
      console.error('Error fetching umrahs:', error);
    }
  };

  // Debug: Log agent data to check balance values
  useEffect(() => {
    if (agent) {
      console.log('Agent Details - Balance Data:', {
        id: agent._id || agent.agentId,
        name: agent.tradeName,
        hajDue: agent.hajDue,
        umrahDue: agent.umrahDue,
        totalDue: agent.totalDue,
        fullAgentObject: agent
      });
    }
  }, [agent]);

  // Calculate customer counts from assigned packages
  const calculateCustomerCounts = () => {
    if (!packages.length) return { totalCustomers: 0, hajCustomers: 0, umrahCustomers: 0 };
    
    let totalCustomers = 0;
    let hajCustomers = 0;
    let umrahCustomers = 0;
    
    packages.forEach(pkg => {
      if (pkg.assignedCustomers && Array.isArray(pkg.assignedCustomers)) {
        totalCustomers += pkg.assignedCustomers.length;
        
        // Check if this is a Hajj or Umrah package
        const isHajj = pkg.packageType === 'Hajj' || pkg.packageType === 'হজ্জ' || 
                      pkg.customPackageType === 'Custom Hajj' || pkg.customPackageType === 'Hajj';
        const isUmrah = pkg.packageType === 'Umrah' || pkg.packageType === 'উমরাহ' || 
                       pkg.customPackageType === 'Custom Umrah' || pkg.customPackageType === 'Umrah';
        
        if (isHajj) {
          hajCustomers += pkg.assignedCustomers.length;
        } else if (isUmrah) {
          umrahCustomers += pkg.assignedCustomers.length;
        }
      }
    });
    
    return { totalCustomers, hajCustomers, umrahCustomers };
  };
  
  const customerCounts = calculateCustomerCounts();

  const packageSummary = packages.reduce(
    (acc, pkg) => {
      const assignedCount = Array.isArray(pkg.assignedCustomers) ? pkg.assignedCustomers.length : 0;
      // Bill should use totalPrice (original package selling price), NOT costingPrice
      const billed = resolveNumber(
        pkg.financialSummary?.totalBilled,
        pkg.financialSummary?.billTotal,
        pkg.financialSummary?.subtotal,
        pkg.paymentSummary?.totalBilled,
        pkg.paymentSummary?.billTotal,
        pkg.totalPrice,
        pkg.totalPriceBdt,
        pkg.totals?.grandTotal,
        pkg.totals?.subtotal,
        pkg.profitLoss?.packagePrice,
        pkg.profitLoss?.totalOriginalPrice
      );
      const paid = resolveNumber(
        pkg.financialSummary?.totalPaid,
        pkg.financialSummary?.paidAmount,
        pkg.paymentSummary?.totalPaid,
        pkg.paymentSummary?.paid,
        pkg.payments?.totalPaid,
        pkg.payments?.paid,
        pkg.totalPaid,
        pkg.depositReceived,
        pkg.receivedAmount
      );
      const due = Math.max(billed - paid, 0);

      const profit = calculateProfitLoss(pkg);
      const profitValue = profit.profitValue || 0;
      const costingPrice = profit.costingPrice || 0;

      const isHajj =
        pkg.packageType === 'Hajj' ||
        pkg.packageType === 'হজ্জ' ||
        pkg.customPackageType === 'Custom Hajj' ||
        pkg.customPackageType === 'Hajj';
      const group = isHajj ? 'hajj' : 'umrah';

      acc[group].customers += assignedCount;
      acc[group].billed += billed;
      acc[group].paid += paid;
      acc[group].due += due;
      acc[group].costingPrice += costingPrice;
      acc[group].profit += profitValue;

      acc.overall.customers += assignedCount;
      acc.overall.billed += billed;
      acc.overall.paid += paid;
      acc.overall.due += due;
      acc.overall.costingPrice += costingPrice;
      acc.overall.profit += profitValue;

      return acc;
    },
    {
      overall: {
        customers: customerCounts.totalCustomers,
        billed: 0,
        paid: 0,
        due: 0,
        costingPrice: 0,
        profit: 0,
      },
      hajj: {
        customers: customerCounts.hajCustomers,
        billed: 0,
        paid: 0,
        due: 0,
        costingPrice: 0,
        profit: 0,
      },
      umrah: {
        customers: customerCounts.umrahCustomers,
        billed: 0,
        paid: 0,
        due: 0,
        costingPrice: 0,
        profit: 0,
      },
    }
  );

  // Calculate financial summary - prioritize packageSummary (calculated from actual packages)
  // and use agent stored values only as additional reference
  
  // Get billed and paid values first
  const overallBilled = packageSummary.overall.billed || pickNumberFromObject(
    agent, ['totalBilled', 'totalBill', 'totalBillAmount', 'totalRevenue', 'totalInvoice'], 0
  );
  const overallPaid = packageSummary.overall.paid || pickNumberFromObject(
    agent, ['totalPaid', 'totalDeposit', 'totalReceived', 'totalCollection'], 0
  );
  const hajjBilled = packageSummary.hajj.billed || pickNumberFromObject(
    agent, ['hajBill', 'hajjBill', 'totalHajjBill', 'hajTotalBill'], 0
  );
  const hajjPaid = packageSummary.hajj.paid || pickNumberFromObject(
    agent, ['hajPaid', 'hajjPaid', 'hajjDeposit', 'hajDeposit', 'totalHajjPaid'], 0
  );
  const umrahBilled = packageSummary.umrah.billed || pickNumberFromObject(
    agent, ['umrahBill', 'totalUmrahBill'], 0
  );
  const umrahPaid = packageSummary.umrah.paid || pickNumberFromObject(
    agent, ['umrahPaid', 'umrahDeposit', 'totalUmrahPaid'], 0
  );

  const financialSummary = {
    overall: {
      customers: packageSummary.overall.customers || pickNumberFromObject(
        agent,
        ['totalHaji', 'totalHaj', 'totalCustomers', 'totalCustomer', 'customersCount', 'totalHajiCount'],
        0
      ),
      billed: overallBilled,
      paid: overallPaid,
      // Due = billed - paid (only positive)
      due: Math.max(0, overallBilled - overallPaid),
      // Advance = paid - billed (only when paid > billed, otherwise 0)
      advance: overallPaid > overallBilled ? (overallPaid - overallBilled) : 0,
      profit: packageSummary.overall.profit || pickNumberFromObject(
        agent,
        ['totalProfit'],
        0
      ),
    },
    hajj: {
      customers: packageSummary.hajj.customers || pickNumberFromObject(
        agent,
        ['hajCustomers', 'hajjCustomers', 'totalHajjCustomers', 'totalHajCustomers'],
        0
      ),
      billed: hajjBilled,
      paid: hajjPaid,
      // Due = billed - paid (only positive)
      due: Math.max(0, hajjBilled - hajjPaid),
      // Advance = paid - billed (only when paid > billed, otherwise 0)
      advance: hajjPaid > hajjBilled ? (hajjPaid - hajjBilled) : 0,
      profit: packageSummary.hajj.profit || pickNumberFromObject(
        agent,
        ['hajProfit'],
        0
      ),
    },
    umrah: {
      customers: packageSummary.umrah.customers || pickNumberFromObject(
        agent,
        ['umrahCustomers', 'totalUmrahCustomers', 'totalUmrahHaji'],
        0
      ),
      billed: umrahBilled,
      paid: umrahPaid,
      // Due = billed - paid (only positive)
      due: Math.max(0, umrahBilled - umrahPaid),
      // Advance = paid - billed (only when paid > billed, otherwise 0)
      advance: umrahPaid > umrahBilled ? (umrahPaid - umrahBilled) : 0,
      profit: packageSummary.umrah.profit || pickNumberFromObject(
        agent,
        ['umrahProfit'],
        0
      ),
    },
  };

  const summaryRows = [
    {
      id: 'overall',
      title: 'সামগ্রিক সারাংশ',
      items: [
        { label: 'মোট হাজি', value: formatCount(financialSummary.overall.customers), icon: Users },
        { label: 'মোট বিল', value: formatCurrency(financialSummary.overall.billed), icon: DollarSign },
        { label: 'মোট পরিশোধ', value: formatCurrency(financialSummary.overall.paid), icon: Wallet },
        { label: 'মোট বকেয়া', value: formatCurrency(financialSummary.overall.due), icon: Receipt },
        { 
          label: 'লাভ/ক্ষতি', 
          value: formatProfitLoss(financialSummary.overall.profit), 
          icon: financialSummary.overall.profit >= 0 ? TrendingUp : TrendingDown,
          isProfit: financialSummary.overall.profit >= 0
        },
        { label: 'মোট এডভান্স', value: formatCurrency(financialSummary.overall.advance), icon: Banknote },
      ],
    },
    {
      id: 'hajj',
      title: 'হজ্জ সারাংশ',
      items: [
        { label: 'মোট হাজি (হজ্জ)', value: formatCount(financialSummary.hajj.customers), icon: Building },
        { label: 'হজ্জ বিল', value: formatCurrency(financialSummary.hajj.billed), icon: FileText },
        { label: 'হজ্জ পরিশোধ', value: formatCurrency(financialSummary.hajj.paid), icon: PiggyBank },
        { label: 'হজ্জ বকেয়া', value: formatCurrency(financialSummary.hajj.due), icon: Calculator },
        { 
          label: 'লাভ/ক্ষতি', 
          value: formatProfitLoss(financialSummary.hajj.profit), 
          icon: financialSummary.hajj.profit >= 0 ? TrendingUp : TrendingDown,
          isProfit: financialSummary.hajj.profit >= 0
        },
        { label: 'হজ্জ এডভান্স', value: formatCurrency(financialSummary.hajj.advance), icon: Banknote },
      ],
    },
    {
      id: 'umrah',
      title: 'উমরাহ সারাংশ',
      items: [
        { label: 'মোট হাজি (উমরাহ)', value: formatCount(financialSummary.umrah.customers), icon: Globe },
        { label: 'উমরাহ বিল', value: formatCurrency(financialSummary.umrah.billed), icon: FileSpreadsheet },
        { label: 'উমরাহ পরিশোধ', value: formatCurrency(financialSummary.umrah.paid), icon: CreditCard },
        { label: 'উমরাহ বকেয়া', value: formatCurrency(financialSummary.umrah.due), icon: AlertTriangle },
        { 
          label: 'লাভ/ক্ষতি', 
          value: formatProfitLoss(financialSummary.umrah.profit), 
          icon: financialSummary.umrah.profit >= 0 ? TrendingUp : TrendingDown,
          isProfit: financialSummary.umrah.profit >= 0
        },
        { label: 'উমরাহ এডভান্স', value: formatCurrency(financialSummary.umrah.advance), icon: Banknote },
      ],
    },
  ];

  // Handle package deletion
  const handleDeletePackage = async (packageId, packageName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the package "${packageName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/packages/${packageId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Package has been deleted.',
            icon: 'success',
            confirmButtonColor: '#10B981',
          });
          fetchPackages();
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete package');
        }
      } catch (error) {
        console.error('Error deleting package:', error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to delete package',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  // Use real packages data
  const displayPackages = packages;

  // Helper functions
  const groupPackagesByYear = (packages) => {
    return packages.reduce((acc, pkg) => {
      const year = pkg.packageYear || new Date().getFullYear();
      if (!acc[year]) {
        acc[year] = { hajj: [], umrah: [] };
      }
      
      const isHajj = pkg.packageType === 'Hajj' || pkg.packageType === 'হজ্জ' || 
                     pkg.customPackageType === 'Custom Hajj' || pkg.customPackageType === 'Hajj';
      const isUmrah = pkg.packageType === 'Umrah' || pkg.packageType === 'উমরাহ' || 
                      pkg.customPackageType === 'Custom Umrah' || pkg.customPackageType === 'Umrah';
      
      if (isHajj) {
        acc[year].hajj.push(pkg);
      } else if (isUmrah) {
        acc[year].umrah.push(pkg);
      } else {
        acc[year].umrah.push(pkg);
      }
      
      return acc;
    }, {});
  };

  const toggleYearExpansion = (year) => {
    const newExpandedYears = new Set(expandedYears);
    if (newExpandedYears.has(year)) {
      newExpandedYears.delete(year);
    } else {
      newExpandedYears.add(year);
    }
    setExpandedYears(newExpandedYears);
  };

  const getAvailableYears = () => {
    const years = Object.keys(groupPackagesByYear(displayPackages))
      .map(year => parseInt(year))
      .sort((a, b) => b - a);
    return years;
  };

  const packagesByYear = groupPackagesByYear(displayPackages);
  const availableYears = getAvailableYears();
  const totalPackagesCount = displayPackages.length;
  const activePackagesCount = displayPackages.filter(pkg => pkg?.isActive).length;

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">বি২বি হজ্জ এজেন্ট বিবরণ</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">এজেন্টের সম্পূর্ণ তথ্য ও পরিসংখ্যান</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchAgent();
              Swal.fire({
                icon: 'success',
                title: 'রিফ্রেশ হয়েছে',
                text: 'এজেন্ট ডেটা রিফ্রেশ হয়েছে',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            title="ডেটা রিফ্রেশ করুন"
          >
            <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ
          </button>
          <button
            type="button"
            onClick={() => router.push(`/hajj-umrah/b2b-agent/agent/${id}/create-package`)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm"
          >
            <Package className="w-3.5 h-3.5" /> প্যাকেজ তৈরি
          </button>
          <button
            type="button"
            onClick={() => router.push(`/hajj-umrah/b2b-agent/agent/${id}/edit`)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-sm"
          >
            <Pencil className="w-3.5 h-3.5" /> সম্পাদনা
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> পিছনে
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">এজেন্ট তথ্য লোড হচ্ছে...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2 text-sm">এজেন্ট তথ্য লোড করতে ব্যর্থ</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{error || 'একটি ত্রুটি ঘটেছে'}</p>
          </div>
        </div>
      ) : !agent ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">কোনো এজেন্ট পাওয়া যায়নি</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Statistics Grid */}
          <div className="space-y-3">
            {/* Filter Buttons */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setActiveSummaryView('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeSummaryView === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                সব সারাংশ
              </button>
              <button
                onClick={() => setActiveSummaryView('hajj')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeSummaryView === 'hajj'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                হজ্জ সারাংশ
              </button>
              <button
                onClick={() => setActiveSummaryView('umrah')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeSummaryView === 'umrah'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                উমরাহ সারাংশ
              </button>
            </div>

            {/* Filtered Summary Rows */}
            {summaryRows
              .filter((row) => {
                if (activeSummaryView === 'all') return true;
                if (activeSummaryView === 'hajj') return row.id === 'hajj';
                if (activeSummaryView === 'umrah') return row.id === 'umrah';
                return true;
              })
              .map((row) => (
                <div key={row.id} className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{row.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    {row.items.map((item, index) => {
                      let bgColor = '';
                      let textColor = '';
                      
                      if (item.label === 'লাভ/ক্ষতি') {
                        bgColor = item.isProfit 
                          ? 'bg-blue-50 dark:bg-blue-900/20' 
                          : 'bg-red-50 dark:bg-red-900/20';
                        textColor = item.isProfit 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-red-700 dark:text-red-300';
                      } else if (item.label.includes('পরিশোধ')) {
                        bgColor = 'bg-green-50 dark:bg-green-900/20';
                        textColor = 'text-green-700 dark:text-green-300';
                      } else if (item.label.includes('বকেয়া')) {
                        bgColor = 'bg-red-50 dark:bg-red-900/20';
                        textColor = 'text-red-700 dark:text-red-300';
                      } else if (item.label.includes('এডভান্স')) {
                        bgColor = 'bg-orange-50 dark:bg-orange-900/20';
                        textColor = 'text-orange-700 dark:text-orange-300';
                      } else if (item.label.includes('বিল')) {
                        bgColor = 'bg-blue-50 dark:bg-blue-900/20';
                        textColor = 'text-blue-700 dark:text-blue-300';
                      } else {
                        bgColor = 'bg-purple-50 dark:bg-purple-900/20';
                        textColor = 'text-purple-700 dark:text-purple-300';
                      }
                      
                      const borderColor = textColor.includes('green') 
                        ? 'border-green-200 dark:border-green-800'
                        : textColor.includes('red')
                        ? 'border-red-200 dark:border-red-800'
                        : textColor.includes('blue')
                        ? 'border-blue-200 dark:border-blue-800'
                        : textColor.includes('orange')
                        ? 'border-orange-200 dark:border-orange-800'
                        : 'border-purple-200 dark:border-purple-800';
                      
                      const IconComponent = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={`${bgColor} rounded-lg p-3 border ${borderColor}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-xs ${textColor} opacity-80`}>{item.label}</p>
                              <p className={`text-lg font-semibold ${textColor}`}>{item.value}</p>
                            </div>
                            {IconComponent ? <IconComponent className={`w-6 h-6 ${textColor} opacity-70`} /> : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Building className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">মৌলিক তথ্য</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ট্রেড নাম</label>
                  <p className="text-5 font-bold text-gray-900 dark:text-white">{agent.tradeName || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ট্রেড লোকেশন</label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {agent.tradeLocation || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">মালিকের নাম</label>
                  <p className="text-sm text-gray-900 dark:text-white">{agent.ownerName || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">যোগাযোগ নম্বর</label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {agent.contactNo || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">স্ট্যাটাস</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    agent.isActive !== false && (agent.status === 'active' || agent.status === 'Active')
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {agent.isActive !== false && (agent.status === 'active' || agent.status === 'Active') ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">ব্যক্তিগত তথ্য</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">জন্ম তারিখ</label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {agent.dob ? new Date(agent.dob).toLocaleDateString('bn-BD') : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">এনআইডি নম্বর</label>
                  <p className="text-sm text-gray-900 dark:text-white">{agent.nid || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">পাসপোর্ট নম্বর</label>
                  <p className="text-sm text-gray-900 dark:text-white">{agent.passport || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ইমেইল</label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {agent.email || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">লাইসেন্স নম্বর</label>
                  <p className="text-sm text-gray-900 dark:text-white">{agent.licenseNumber || '-'}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">আর্থিক তথ্য</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">মোট রাজস্ব</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ৳{Number(agent?.totalRevenue ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">কমিশন হার</label>
                  <p className="text-sm text-gray-900 dark:text-white">{Number(agent?.commissionRate ?? 0)}%</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">বকেয়া পেমেন্ট</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    ৳{Number(agent?.pendingPayments ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ব্যাংক অ্যাকাউন্ট</label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center">
                    <CreditCard className="w-3 h-3 mr-1" />
                    {agent.bankAccount || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">পেমেন্ট পদ্ধতি</label>
                  <p className="text-sm text-gray-900 dark:text-white">{agent.paymentMethod || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">অতিরিক্ত তথ্য</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">তৈরির তারিখ</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {agent.created_at ? new Date(agent.created_at).toLocaleDateString('bn-BD') : '-'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">সর্বশেষ আপডেট</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {agent.updated_at ? new Date(agent.updated_at).toLocaleDateString('bn-BD') : '-'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">সর্বশেষ কার্যকলাপ</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {agent.lastActivity ? new Date(agent.lastActivity).toLocaleDateString('bn-BD') : '-'}
                </p>
              </div>
              {agent.agentId && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">এজেন্ট আইডি</label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{agent.agentId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Yearly Packages Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">বার্ষিক প্যাকেজ</h3>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button
                  onClick={() => router.push(`/hajj-umrah/b2b-agent/agent/${id}/create-package`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm"
                >
                  <Plus className="w-4 h-4" /> প্যাকেজ যোগ
                </button>
              </div>
            </div>

            {packagesLoading && packages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">প্যাকেজ লোড হচ্ছে...</p>
                </div>
              </div>
            ) : availableYears.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">কোনো প্যাকেজ পাওয়া যায়নি</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">শুরু করতে আপনার প্রথম প্যাকেজ তৈরি করুন</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableYears.map(year => {
                  const yearPackages = packagesByYear[year];
                  const isExpanded = expandedYears.has(year);
                  const totalPackages = yearPackages.hajj.length + yearPackages.umrah.length;

                  return (
                    <div key={year} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => toggleYearExpansion(year)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{year}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {totalPackages} প্যাকেজ • {yearPackages.hajj.length} হজ্জ • {yearPackages.umrah.length} উমরাহ
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            year === selectedYear 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                          }`}>
                            {year === selectedYear ? 'বর্তমান' : 'দেখুন'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 space-y-4">
                          {/* Hajj Packages */}
                          {yearPackages.hajj.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-3">
                                <Building className="w-4 h-4 text-green-600" />
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white">হজ্জ প্যাকেজ ({yearPackages.hajj.length})</h5>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {yearPackages.hajj.map((pkg) => {
                                  const profit = calculateProfitLoss(pkg);
                                  return (
                                    <div key={pkg._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-shadow">
                                      <div className="flex items-start justify-between mb-2">
                                        <h6 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                          {pkg.packageName}
                                        </h6>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          pkg.isActive 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        }`}>
                                          {pkg.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                        </span>
                                      </div>
                                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                        <p>মোট মূল্য: {formatCurrency(profit.packagePrice)}</p>
                                        <p>খরচ: {formatCurrency(profit.costingPrice)}</p>
                                        <p className={`font-semibold ${
                                          profit.isProfit
                                            ? 'text-green-600 dark:text-green-400'
                                            : profit.isLoss
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                          {profit.isProfit ? 'লাভ' : profit.isLoss ? 'ক্ষতি' : 'সমতা'}: {profit.isProfit ? '+' : ''}{formatCurrency(profit.profitValue)} ({formatPercentage(profit.percentage)})
                                        </p>
                                        <p>স্ট্যাটাস: {pkg.status || 'খসড়া'}</p>
                                      </div>
                                      <div className="flex items-center justify-end space-x-1 mt-3">
                                        <button
                                          onClick={() => router.push(`/hajj-umrah/package-list/${pkg._id}`)}
                                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                          title="বিস্তারিত দেখুন"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => router.push(`/hajj-umrah/package-list/${pkg._id}/edit`)}
                                          className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                          title="সম্পাদনা করুন"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeletePackage(pkg._id, pkg.packageName)}
                                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                          title="মুছে ফেলুন"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Umrah Packages */}
                          {yearPackages.umrah.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-3">
                                <Globe className="w-4 h-4 text-blue-600" />
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white">উমরাহ প্যাকেজ ({yearPackages.umrah.length})</h5>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {yearPackages.umrah.map((pkg) => {
                                  const profit = calculateProfitLoss(pkg);
                                  return (
                                    <div key={pkg._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-shadow">
                                      <div className="flex items-start justify-between mb-2">
                                        <h6 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                          {pkg.packageName}
                                        </h6>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          pkg.isActive 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        }`}>
                                          {pkg.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                        </span>
                                      </div>
                                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                        <p>মোট মূল্য: {formatCurrency(profit.packagePrice)}</p>
                                        <p>খরচ: {formatCurrency(profit.costingPrice)}</p>
                                        <p className={`font-semibold ${
                                          profit.isProfit
                                            ? 'text-green-600 dark:text-green-400'
                                            : profit.isLoss
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                          {profit.isProfit ? 'লাভ' : profit.isLoss ? 'ক্ষতি' : 'সমতা'}: {profit.isProfit ? '+' : ''}{formatCurrency(profit.profitValue)} ({formatPercentage(profit.percentage)})
                                        </p>
                                        <p>স্ট্যাটাস: {pkg.status || 'খসড়া'}</p>
                                      </div>
                                      <div className="flex items-center justify-end space-x-1 mt-3">
                                        <button
                                          onClick={() => router.push(`/hajj-umrah/package-list/${pkg._id}`)}
                                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                          title="বিস্তারিত দেখুন"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => router.push(`/hajj-umrah/package-list/${pkg._id}/edit`)}
                                          className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                          title="সম্পাদনা করুন"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeletePackage(pkg._id, pkg.packageName)}
                                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                          title="মুছে ফেলুন"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* No packages message for this year */}
                          {totalPackages === 0 && (
                            <div className="text-center py-6">
                              <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 dark:text-gray-300">{year} সালের জন্য কোনো প্যাকেজ নেই</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default AgentDetails;
