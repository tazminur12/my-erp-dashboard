'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Building2, 
  Plus, 
  FileText, 
  Search,
  Download,
  Eye,
  Edit,
  MoreVertical,
  MapPin,
  Phone,
  User,
  Receipt,
  Wallet,
  TrendingDown,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

// CardWidget Component
const CardWidget = ({ 
  title, 
  value, 
  icon: Icon, 
  trend = '', 
  trendValue = '', 
  trendType = 'neutral',
  iconColor = 'blue',
  valueColor = ''
}) => {
  const iconColorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    gray: 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  const valueColorClass = valueColor || 'text-gray-900 dark:text-white';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${valueColorClass}`}>{value}</p>
          {trend && trendValue && (
            <p className={`text-xs mt-2 ${
              trendType === 'up' ? 'text-green-600 dark:text-green-400' :
              trendType === 'down' ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {trend} {trendValue}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColorClasses[iconColor] || iconColorClasses.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const VendorDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('billAmount'); // Default to ranking by bill amount
  const [dashboardData, setDashboardData] = useState(null);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchAllVendors();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/vendors/dashboard');
      const result = await response.json();

      if (response.ok) {
        // Ensure we're using the correct data structure
        const dashboardData = result.data || result;
        setDashboardData(dashboardData);
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching vendor dashboard:', error);
      Swal.fire({
        icon: 'error',
        title: 'লোড ব্যর্থ',
        text: `ভেন্ডর পরিসংখ্যান/ডেটা লোড করতে পারেনি। ${error.message}`,
        confirmButtonColor: '#7c3aed'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      const result = await response.json();

      if (response.ok) {
        setAllVendors(result.data || result.vendors || []);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  // Extract data from dashboard response
  const statistics = dashboardData?.statistics || {};
  const bills = dashboardData?.bills || {};
  
  // Debug logging to see actual data structure
  console.log('Dashboard Data:', dashboardData);
  console.log('Statistics:', statistics);
  console.log('Bills:', bills);
  
  // Get vendors from recent activity and merge with full vendor data to get logos
  const vendors = useMemo(() => {
    const recentActivity = dashboardData?.recentActivity || {};
    const recentVendors = recentActivity?.vendors || [];
    
    // Create a map of vendor IDs to full vendor data (for logo lookup)
    const vendorMap = new Map();
    allVendors.forEach(v => {
      const id = v._id || v.vendorId;
      if (id) vendorMap.set(String(id), v);
    });
    
    return recentVendors.map(v => {
      const vendorId = String(v._id || v.vendorId);
      const fullVendor = vendorMap.get(vendorId);
      
      return {
        _id: v._id || v.vendorId,
        vendorId: v.vendorId || v._id,
        tradeName: v.tradeName || '',
        tradeLocation: v.tradeLocation || '',
        ownerName: v.ownerName || '',
        contactNo: v.contactNo || '',
        logo: v.logo || fullVendor?.logo || v.photo || v.photoUrl || v.image || v.avatar || v.profilePicture || fullVendor?.photo || fullVendor?.photoUrl || fullVendor?.image || fullVendor?.avatar || fullVendor?.profilePicture || null,
        status: v.status || 'active',
        billCount: v.billCount || 0,
        totalBillAmount: v.totalBillAmount || 0,
        paidAmount: v.paidAmount || 0,
        dueAmount: v.dueAmount || 0,
      };
    });
  }, [dashboardData, allVendors]);

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let filtered = vendors.filter(vendor => {
      const matchesSearch = vendor.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vendor.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vendor.tradeLocation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort vendors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tradeName':
          return a.tradeName.localeCompare(b.tradeName);
        case 'billAmount':
          // Sort by total bill amount (descending - highest first)
          return (b.totalBillAmount || 0) - (a.totalBillAmount || 0);
        case 'billCount':
          // Sort by bill count (descending - highest first)
          return (b.billCount || 0) - (a.billCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, statusFilter, sortBy, vendors]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-cyan-50/50 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">ভেন্ডর ও পার্টনার ড্যাশবোর্ড</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">ভেন্ডর ও পার্টনার সম্পর্ক পরিচালনা এবং পর্যবেক্ষণ করুন</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 px-4 py-2.5 transition-all hover:shadow-md">
              <Download className="w-4 h-4" /> এক্সপোর্ট
            </button>
            <Link
              href="/vendors/add"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2.5 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" /> ভেন্ডর যোগ করুন
            </Link>
          </div>
        </div>

        {/* Stats Cards - Single Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <CardWidget 
            title="মোট ভেন্ডর" 
            value={loading ? '...' : Number(statistics.totalVendors || 0).toLocaleString('bn-BD')} 
            icon={Building2} 
            trend="" 
            trendValue="" 
            trendType="neutral" 
            iconColor="blue"
          />
          <CardWidget 
            title="মোট ভেন্ডর বিল" 
            value={loading ? '...' : Number(bills.totalBills || 0).toLocaleString('bn-BD')} 
            icon={Receipt} 
            trend="" 
            trendValue="" 
            trendType="neutral" 
            iconColor="gray"
          />
          <CardWidget 
            title="মোট বিল পরিমাণ" 
            value={loading ? '...' : `৳${Number(bills.totalAmount || 0).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}`} 
            icon={FileText} 
            trend="" 
            trendValue="" 
            trendType="neutral" 
            iconColor="orange"
          />
          <CardWidget 
            title="মোট পরিশোধিত" 
            value={loading ? '...' : `৳${Number(bills.totalPaid || 0).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}`} 
            icon={Wallet} 
            trend="" 
            trendValue="" 
            trendType="up" 
            iconColor="green"
            valueColor="text-green-600 dark:text-green-400"
          />
          <CardWidget 
            title="মোট বাকি" 
            value={loading ? '...' : `৳${Number(bills.totalDue || 0).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}`} 
            icon={TrendingDown} 
            trend="" 
            trendValue="" 
            trendType="down" 
            iconColor="red"
            valueColor="text-red-600 dark:text-red-400"
          />
        </div>

        {/* Vendor List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendor List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden shadow-lg">
              <div className="p-6 border-b-2 border-purple-100 dark:border-purple-900 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    ভেন্ডর ওভারভিউ
                  </h2>
                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 rounded-lg border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="ভেন্ডর খুঁজুন..."
                      />
                    </div>
                    {/* Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value="all">সব স্ট্যাটাস</option>
                      <option value="active">সক্রিয়</option>
                      <option value="inactive">নিষ্ক্রিয়</option>
                    </select>
                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-lg border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value="billAmount">বিল পরিমাণ অনুযায়ী র‍্যাঙ্কিং</option>
                      <option value="billCount">বিল সংখ্যা অনুযায়ী র‍্যাঙ্কিং</option>
                      <option value="tradeName">নাম অনুযায়ী সাজান</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-purple-100 dark:divide-purple-900/50">
                {loading ? (
                  <div className="p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <div className="text-purple-600 dark:text-purple-400 font-medium">ভেন্ডর লোড হচ্ছে...</div>
                  </div>
                ) : filteredVendors.length === 0 ? (
                  <div className="p-6 text-center text-purple-600 dark:text-purple-400 font-medium">কোনো ভেন্ডর পাওয়া যায়নি</div>
                ) : filteredVendors.map((vendor, index) => (
                  <div key={vendor._id || vendor.vendorId} className="p-6 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all border-l-4 border-transparent hover:border-purple-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Ranking Badge */}
                        {(sortBy === 'billAmount' || sortBy === 'billCount') && (
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                            index === 0 
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white ring-2 ring-yellow-300 dark:ring-yellow-600' 
                              : index === 1
                              ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white ring-2 ring-gray-200 dark:ring-gray-600'
                              : index === 2
                              ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white ring-2 ring-amber-400 dark:ring-amber-600'
                              : 'bg-gradient-to-br from-purple-400 to-blue-500 text-white ring-2 ring-purple-200 dark:ring-purple-800'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                        {vendor.logo ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-purple-200 dark:ring-purple-800 shadow-md">
                            <img 
                              src={vendor.logo} 
                              alt={vendor.tradeName} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-purple-200 dark:ring-purple-800">
                            <Building2 className="w-7 h-7 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link 
                              href={`/vendors/${vendor._id || vendor.vendorId}`}
                              className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                              {vendor.tradeName}
                            </Link>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              vendor.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {vendor.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                              <User className="w-4 h-4" />
                              {vendor.ownerName}
                            </span>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <MapPin className="w-4 h-4" />
                              {vendor.tradeLocation}
                            </span>
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <Phone className="w-4 h-4" />
                              {vendor.contactNo}
                            </span>
                          </div>
                          {/* Bill Statistics */}
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                              <Receipt className="w-3.5 h-3.5" />
                              বিল: {vendor.billCount || 0}টি
                            </span>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                              <Wallet className="w-3.5 h-3.5" />
                              মোট: ৳{Number(vendor.totalBillAmount || 0).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
                            </span>
                            {(vendor.dueAmount || 0) > 0 && (
                              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                                <TrendingDown className="w-3.5 h-3.5" />
                                বাকি: ৳{Number(vendor.dueAmount || 0).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/vendors/${vendor._id || vendor.vendorId}`}
                          className="p-2 rounded-lg border-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all hover:shadow-md"
                        >
                          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </Link>
                        <Link
                          href={`/vendors/${vendor._id || vendor.vendorId}/edit`}
                          className="p-2 rounded-lg border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all hover:shadow-md"
                        >
                          <Edit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </Link>
                        <button className="p-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:shadow-md">
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                দ্রুত কাজ
              </h3>
              <div className="space-y-3">
                <Link
                  href="/vendors/add"
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-green-300 dark:border-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">নতুন ভেন্ডর যোগ করুন</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">একটি নতুন ভেন্ডর নিবন্ধন করুন</div>
                  </div>
                </Link>
                <Link
                  href="/vendors"
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-blue-300 dark:border-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition-all hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">সব ভেন্ডর দেখুন</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">ভেন্ডর তালিকা ব্রাউজ করুন</div>
                  </div>
                </Link>
                <button className="flex items-center gap-3 p-3 rounded-lg border-2 border-amber-300 dark:border-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition-all hover:shadow-md w-full">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">রিপোর্ট তৈরি করুন</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">ভেন্ডর ডেটা এক্সপোর্ট করুন</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
