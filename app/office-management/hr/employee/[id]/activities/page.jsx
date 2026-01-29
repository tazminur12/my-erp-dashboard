'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '../../../../../../app/component/DashboardLayout';
import { 
  ArrowLeft, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  Loader2,
  FileText,
  Plane,
  Package,
  DollarSign,
  Filter
} from 'lucide-react';

const EmployeeActivities = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = params;
  
  // Get initial tab from query param or default to 'tickets'
  const initialTab = searchParams.get('type') || 'tickets';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [employee, setEmployee] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Update active tab when query param changes
  useEffect(() => {
    const type = searchParams.get('type');
    if (type && ['tickets', 'hajj', 'umrah', 'services', 'air-passengers'].includes(type)) {
      setActiveTab(type);
    }
  }, [searchParams]);

  // Fetch employee details
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`/api/employees/${id}`);
        const result = await response.json();
        
        if (response.ok && result.employee) {
          setEmployee(result.employee);
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
      }
    };
    
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        let url = '';
        const queryParams = new URLSearchParams({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        });

        // Add employee filter based on tab
        // Note: Different APIs might expect different parameter names for employee filtering
        
        switch (activeTab) {
          case 'tickets':
            // Assuming tickets API supports createdBy or agentId
            // We might need to update the tickets API to support filtering by employee
            // For now, we'll try to use a generic filter if available or specific ones
            url = `/api/air-tickets?${queryParams}&createdBy=${id}`; 
            // Also try employer_id if the API supports it
            // url = `/api/air-tickets?${queryParams}&agentId=${id}`;
            break;
            
          case 'hajj':
            url = `/api/hajj-umrah/hajis?${queryParams}&employer_id=${id}`;
            break;
            
          case 'umrah':
            url = `/api/hajj-umrah/umrahs?${queryParams}&employer_id=${id}`;
            break;
            
          case 'services':
            url = `/api/other-customers?${queryParams}&createdBy=${id}`; // Or appropriate endpoint
            break;
            
          case 'air-passengers':
            url = `/api/air-customers?${queryParams}&createdBy=${id}`;
            break;
            
          default:
            url = `/api/air-tickets?${queryParams}&createdBy=${id}`;
        }
        
        console.log(`Fetching ${activeTab} data from: ${url}`);
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (response.ok) {
          // Normalize data structure based on response
          let listData = [];
          let total = 0;
          let totalPages = 0;
          
          if (activeTab === 'tickets') {
            listData = result.tickets || result.data || [];
            total = result.pagination?.total || result.total || 0;
            totalPages = result.pagination?.pages || result.totalPages || 0;
          } else if (activeTab === 'hajj') {
            listData = result.hajis || [];
            total = result.total || 0;
            totalPages = result.totalPages || 0;
          } else if (activeTab === 'umrah') {
            listData = result.umrahs || [];
            total = result.total || 0;
            totalPages = result.totalPages || 0;
          } else if (activeTab === 'services') {
            listData = result.customers || result.data || [];
            total = result.pagination?.total || 0;
            totalPages = result.pagination?.totalPages || 0;
          } else if (activeTab === 'air-passengers') {
            listData = result.customers || [];
            total = result.pagination?.total || 0;
            totalPages = result.pagination?.totalPages || 0;
          }
          
          setData(listData);
          setPagination(prev => ({
            ...prev,
            total,
            totalPages
          }));
        } else {
          console.error(`Failed to fetch ${activeTab} data:`, result);
          setData([]);
          setError(result.error || 'তথ্য লোড করতে সমস্যা হয়েছে');
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
        setError('সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [id, activeTab, pagination.page, searchTerm]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchTerm('');
    // Update URL without refreshing
    router.replace(`/office-management/hr/employee/${id}/activities?type=${tab}`, { shallow: true });
  };

  const handleGoBack = () => {
    router.push(`/office-management/hr/employee/${id}`);
  };

  const fullName = employee ? (employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim()) : 'Employee';

  const tabs = [
    { id: 'tickets', label: 'টিকেট', icon: Plane },
    { id: 'hajj', label: 'হজ্ব', icon: () => <span className="text-lg">🕋</span> },
    { id: 'umrah', label: 'উমরাহ', icon: () => <span className="text-lg">🕋</span> },
    { id: 'services', label: 'অতিরিক্ত সেবা', icon: Package },
    { id: 'air-passengers', label: 'এয়ার প্যাসেঞ্জার', icon: User }
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">লোড হচ্ছে...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl text-center border border-red-100 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'tickets' && <Plane className="w-8 h-8 text-gray-400" />}
            {(activeTab === 'hajj' || activeTab === 'umrah') && <span className="text-3xl grayscale opacity-50">🕋</span>}
            {activeTab === 'services' && <Package className="w-8 h-8 text-gray-400" />}
            {activeTab === 'air-passengers' && <User className="w-8 h-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">কোন তথ্য পাওয়া যায়নি</h3>
          <p className="text-gray-600 dark:text-gray-400">
            এই কর্মচারীর জন্য কোন {tabs.find(t => t.id === activeTab)?.label} রেকর্ড পাওয়া যায়নি।
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                {activeTab === 'tickets' && (
                  <>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">টিকেট তথ্য</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">কাস্টমার</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">রুট & তারিখ</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">এয়ারলাইন</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">স্ট্যাটাস</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">মূল্য</th>
                  </>
                )}
                {(activeTab === 'hajj' || activeTab === 'umrah') && (
                  <>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">আইডি & নাম</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">যোগাযোগ</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">পাসপোর্ট</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">প্যাকেজ</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">স্ট্যাটাস</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">মোট টাকা</th>
                  </>
                )}
                {activeTab === 'services' && (
                  <>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">কাস্টমার</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">যোগাযোগ</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">ঠিকানা</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">স্ট্যাটাস</th>
                  </>
                )}
                {activeTab === 'air-passengers' && (
                  <>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">কাস্টমার</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">যোগাযোগ</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">ঠিকানা</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">পাসপোর্ট</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">স্ট্যাটাস</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((item, index) => (
                <tr key={item.id || item._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {activeTab === 'tickets' && (
                    <>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{item.ticketId}</div>
                        <div className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('bn-BD')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{item.customerName}</div>
                        <div className="text-xs text-gray-500">{item.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{item.origin} - {item.destination}</div>
                        <div className="text-xs text-gray-500">{item.flightDate ? new Date(item.flightDate).toLocaleDateString('bn-BD') : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{item.airline}</div>
                        <div className="text-xs text-gray-500">{item.flightType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'confirmed' || item.status === 'issued'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                        ৳{Number(item.customerDeal || 0).toLocaleString()}
                      </td>
                    </>
                  )}

                  {(activeTab === 'hajj' || activeTab === 'umrah') && (
                    <>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.customer_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{item.mobile}</div>
                        <div className="text-xs text-gray-500">{item.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white font-mono">{item.passport_number || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{item.package_id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {item.service_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                        ৳{Number(item.total_amount || 0).toLocaleString()}
                      </td>
                    </>
                  )}

                  {(activeTab === 'services' || activeTab === 'air-passengers') && (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                            {item.customerImage || item.photo ? (
                              <img src={item.customerImage || item.photo} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.customerId || item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{item.mobile || item.phone}</div>
                        <div className="text-xs text-gray-500">{item.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs">{item.address || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{item.district || item.city}</div>
                      </td>
                      {activeTab === 'air-passengers' && (
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white font-mono">{item.passportNumber || 'N/A'}</div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (item.isActive || item.status === 'active')
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {(item.isActive || item.status === 'active') ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              মোট {pagination.total} টি এর মধ্যে {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} দেখানো হচ্ছে
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                পূর্ববর্তী
              </button>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                পরবর্তী
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              ফিরে যান
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  কর্মচারী কার্যক্রম
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {fullName} এর সকল কার্যক্রমের তালিকা
                </p>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-1 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeActivities;