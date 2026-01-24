'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Briefcase,
  FileText,
  Package,
  Plus,
  Eye,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Calendar,
  Activity
} from 'lucide-react';

const AdditionalServicesDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPassportServices: 0,
    totalManpowerServices: 0,
    totalVisaServices: 0,
    totalOtherServices: 0,
    pendingServices: 0,
    completedServices: 0,
    totalRevenue: 0,
    totalDue: 0
  });
  const [recentServices, setRecentServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [
        customersRes,
        passportRes,
        manpowerRes,
        visaRes,
        otherServicesRes
      ] = await Promise.all([
        fetch('/api/other-customers?limit=1000'),
        fetch('/api/passport-services?limit=1000'),
        fetch('/api/manpower-service?limit=1000'),
        fetch('/api/visa-processing?limit=1000'),
        fetch('/api/other-services?limit=1000')
      ]);

      const customersData = await customersRes.json();
      const passportData = await passportRes.json();
      const manpowerData = await manpowerRes.json();
      const visaData = await visaRes.json();
      const otherServicesData = await otherServicesRes.json();

      const customers = customersData.customers || customersData.data || [];
      const passportServices = passportData.services || passportData.data || [];
      const manpowerServices = manpowerData.services || manpowerData.data || [];
      const visaServices = visaData.services || visaData.data || [];
      const otherServices = otherServicesData.services || otherServicesData.data || [];

      // Calculate statistics
      const allServices = [
        ...passportServices,
        ...manpowerServices,
        ...visaServices,
        ...otherServices
      ];

      const pendingServices = allServices.filter(s => 
        s.status === 'pending' || s.status === 'processing' || s.status === 'active'
      ).length;

      const completedServices = allServices.filter(s => 
        s.status === 'completed' || s.status === 'delivered'
      ).length;

      const totalRevenue = allServices.reduce((sum, s) => 
        sum + (Number(s.paidAmount) || Number(s.totalAmount) || Number(s.totalBill) || 0), 0
      );

      const totalDue = allServices.reduce((sum, s) => 
        sum + (Number(s.dueAmount) || ((Number(s.totalAmount) || Number(s.totalBill) || 0) - (Number(s.paidAmount) || 0))), 0
      );

      // Recent services (last 10)
      const recent = allServices
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || a.appliedDate || a.serviceDate || 0);
          const dateB = new Date(b.createdAt || b.date || b.appliedDate || b.serviceDate || 0);
          return dateB - dateA;
        })
        .slice(0, 10)
        .map(service => ({
          id: service.id || service._id,
          type: getServiceType(service),
          name: service.clientName || service.applicantName || service.companyName || 'N/A',
          status: service.status || 'pending',
          date: service.createdAt || service.date || service.appliedDate || service.serviceDate || '',
          amount: Number(service.totalAmount) || Number(service.totalBill) || 0,
          icon: getServiceIcon(service)
        }));

      setStats({
        totalCustomers: customers.length,
        totalPassportServices: passportServices.length,
        totalManpowerServices: manpowerServices.length,
        totalVisaServices: visaServices.length,
        totalOtherServices: otherServices.length,
        pendingServices,
        completedServices,
        totalRevenue,
        totalDue
      });

      setRecentServices(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceType = (service) => {
    if (service.applicationId || service.applicationNumber) {
      if (service.passportNumber) return 'Visa Processing';
      if (service.applicationNumber) return 'Passport Service';
    }
    if (service.position || service.jobTitle) return 'Manpower Service';
    if (service.serviceType) return 'Other Service';
    return 'Unknown';
  };

  const getServiceIcon = (service) => {
    if (service.applicationId || service.applicationNumber) {
      if (service.passportNumber) return FileText;
      if (service.applicationNumber) return FileCheck;
    }
    if (service.position || service.jobTitle) return Briefcase;
    return Package;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'সম্প্রতি';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'কিছুক্ষণ আগে';
    if (diffInHours < 24) return `${diffInHours} ঘন্টা আগে`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'গতকাল';
    if (diffInDays < 7) return `${diffInDays} দিন আগে`;
    return date.toLocaleDateString('bn-BD');
  };

  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'cancelled':
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'সম্পন্ন';
      case 'pending':
        return 'অপেক্ষমান';
      case 'processing':
      case 'active':
        return 'চলমান';
      case 'cancelled':
        return 'বাতিল';
      case 'rejected':
        return 'প্রত্যাখ্যাত';
      default:
        return status;
    }
  };

  const quickActions = [
    {
      title: 'নতুন গ্রাহক যোগ করুন',
      icon: Users,
      color: 'bg-blue-500 dark:bg-blue-600',
      action: () => router.push('/additional-services/customer-list/add')
    },
    {
      title: 'পাসপোর্ট সার্ভিস',
      icon: FileCheck,
      color: 'bg-green-500 dark:bg-green-600',
      action: () => router.push('/additional-services/passport-service/add')
    },
    {
      title: 'ম্যানপাওয়ার সার্ভিস',
      icon: Briefcase,
      color: 'bg-purple-500 dark:bg-purple-600',
      action: () => router.push('/additional-services/manpower-service/add')
    },
    {
      title: 'ভিসা প্রসেসিং',
      icon: FileText,
      color: 'bg-indigo-500 dark:bg-indigo-600',
      action: () => router.push('/additional-services/visa-processing/add')
    },
    {
      title: 'অন্যান্য সার্ভিস',
      icon: Package,
      color: 'bg-orange-500 dark:bg-orange-600',
      action: () => router.push('/additional-services/other-services/add')
    }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">অতিরিক্ত সার্ভিস ড্যাশবোর্ড</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">সব সার্ভিসের সারসংক্ষেপ এবং পরিচালনা</p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            রিফ্রেশ
          </button>
        </div>

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট গ্রাহক</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4 mr-1" />
              <span>সক্রিয় গ্রাহক</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট সার্ভিস</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalPassportServices + stats.totalManpowerServices + stats.totalVisaServices + stats.totalOtherServices}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400">
              <Activity className="w-4 h-4 mr-1" />
              <span>সব সার্ভিস</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট আয়</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>মোট প্রাপ্ত</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বাকি</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(stats.totalDue)}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>বাকি পরিশোধ</span>
            </div>
          </div>
        </div>

        {/* Service Type Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">পাসপোর্ট সার্ভিস</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalPassportServices}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <FileCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <button
              onClick={() => router.push('/additional-services/passport-service')}
              className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              দেখুন →
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ম্যানপাওয়ার সার্ভিস</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalManpowerServices}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <button
              onClick={() => router.push('/additional-services/manpower-service')}
              className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              দেখুন →
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ভিসা প্রসেসিং</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalVisaServices}</p>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900/20 p-3 rounded-full">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <button
              onClick={() => router.push('/additional-services/visa-processing')}
              className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              দেখুন →
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অন্যান্য সার্ভিস</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalOtherServices}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <button
              onClick={() => router.push('/additional-services/other-services')}
              className="mt-4 text-sm text-orange-600 dark:text-orange-400 hover:underline"
            >
              দেখুন →
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সার্ভিস স্ট্যাটাস</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">অপেক্ষমান</span>
                </div>
                <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingServices}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">সম্পন্ন</span>
                </div>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">{stats.completedServices}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">দ্রুত কার্যক্রম</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex flex-col items-center gap-2`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium text-center">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Services */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সাম্প্রতিক সার্ভিস</h3>
          {recentServices.length > 0 ? (
            <div className="space-y-3">
              {recentServices.map((service) => {
                const ServiceIcon = service.icon;
                return (
                  <div key={service.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                      <ServiceIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">{service.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{service.type}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(service.date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(service.amount)}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                        {getStatusLabel(service.status)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>কোন সাম্প্রতিক সার্ভিস নেই</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdditionalServicesDashboard;
