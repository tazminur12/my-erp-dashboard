'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../component/DashboardLayout';
import {
  ArrowLeft,
  Users,
  Search,
  Package,
  User,
  X,
  CheckCircle,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

const PackageCustomers = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [pkg, setPkg] = useState(null);
  const [assignedCustomers, setAssignedCustomers] = useState([]);
  const [availableHajis, setAvailableHajis] = useState([]);
  const [availableUmrahs, setAvailableUmrahs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'haji', 'umrah'
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch package and customers
  useEffect(() => {
    if (id) {
      fetchPackageData();
      fetchAssignedCustomers();
      fetchAvailableCustomers();
    }
  }, [id]);

  const fetchPackageData = async () => {
    try {
      const response = await fetch(`/api/packages/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setPkg(data.package || data.data);
      }
    } catch (error) {
      console.error('Error fetching package:', error);
    }
  };

  const fetchAssignedCustomers = async () => {
    try {
      // Fetch assigned hajis
      const hajisResponse = await fetch(`/api/hajj-umrah/hajis?packageId=${id}&limit=10000`);
      const hajisData = await hajisResponse.json();
      const hajis = (hajisData.data || hajisData.hajis || []).map(h => ({ ...h, type: 'haji' }));

      // Fetch assigned umrahs
      const umrahsResponse = await fetch(`/api/hajj-umrah/umrahs?packageId=${id}&limit=10000`);
      const umrahsData = await umrahsResponse.json();
      const umrahs = (umrahsData.data || umrahsData.umrahs || []).map(u => ({ ...u, type: 'umrah' }));

      setAssignedCustomers([...hajis, ...umrahs]);
    } catch (error) {
      console.error('Error fetching assigned customers:', error);
    }
  };

  const fetchAvailableCustomers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all hajis (without package filter)
      const hajisResponse = await fetch(`/api/hajj-umrah/hajis?limit=10000`);
      const hajisData = await hajisResponse.json();
      const allHajis = hajisData.data || hajisData.hajis || [];

      // Fetch all umrahs (without package filter)
      const umrahsResponse = await fetch(`/api/hajj-umrah/umrahs?limit=10000`);
      const umrahsData = await umrahsResponse.json();
      const allUmrahs = umrahsData.data || umrahsData.umrahs || [];

      setAvailableHajis(allHajis);
      setAvailableUmrahs(allUmrahs);
    } catch (error) {
      console.error('Error fetching available customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignCustomer = async (customerId, customerType) => {
    try {
      setIsAssigning(true);
      
      const endpoint = customerType === 'haji' 
        ? `/api/hajj-umrah/hajis/${customerId}`
        : `/api/hajj-umrah/umrahs/${customerId}`;

      // First get the customer data
      const getResponse = await fetch(endpoint);
      const getData = await getResponse.json();
      
      if (!getResponse.ok) {
        throw new Error(getData.error || 'Failed to fetch customer');
      }

      const customer = getData.haji || getData.umrah || getData.data;
      
      // Update customer with packageId
      const updateResponse = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...customer,
          packageId: id,
          package_id: id,
        }),
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Failed to assign customer');
      }

      Swal.fire({
        title: 'সফল!',
        text: 'কাস্টমার সফলভাবে assign করা হয়েছে',
        icon: 'success',
        confirmButtonColor: '#10B981',
        timer: 2000,
      });

      // Refresh lists
      fetchAssignedCustomers();
      fetchAvailableCustomers();
    } catch (error) {
      console.error('Error assigning customer:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'কাস্টমার assign করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveCustomer = async (customerId, customerType) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই কাস্টমারকে প্যাকেজ থেকে সরাতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, সরান',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      setIsAssigning(true);
      
      const endpoint = customerType === 'haji' 
        ? `/api/hajj-umrah/hajis/${customerId}`
        : `/api/hajj-umrah/umrahs/${customerId}`;

      // First get the customer data
      const getResponse = await fetch(endpoint);
      const getData = await getResponse.json();
      
      if (!getResponse.ok) {
        throw new Error(getData.error || 'Failed to fetch customer');
      }

      const customer = getData.haji || getData.umrah || getData.data;
      
      // Remove packageId
      const updateResponse = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...customer,
          packageId: null,
          package_id: null,
        }),
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Failed to remove customer');
      }

      Swal.fire({
        title: 'সফল!',
        text: 'কাস্টমার সফলভাবে সরানো হয়েছে',
        icon: 'success',
        confirmButtonColor: '#10B981',
        timer: 2000,
      });

      // Refresh lists
      fetchAssignedCustomers();
      fetchAvailableCustomers();
    } catch (error) {
      console.error('Error removing customer:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'কাস্টমার সরাতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter available customers (not already assigned)
  const filteredAvailableCustomers = useMemo(() => {
    const assignedIds = new Set(assignedCustomers.map(c => c._id || c.id));
    
    let available = [];
    if (selectedType === 'all' || selectedType === 'haji') {
      available.push(...availableHajis.filter(h => !assignedIds.has(h._id || h.id)).map(h => ({ ...h, type: 'haji' })));
    }
    if (selectedType === 'all' || selectedType === 'umrah') {
      available.push(...availableUmrahs.filter(u => !assignedIds.has(u._id || u.id)).map(u => ({ ...u, type: 'umrah' })));
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      available = available.filter(c => 
        (c.name || '').toLowerCase().includes(term) ||
        (c.customer_id || '').toLowerCase().includes(term) ||
        (c.mobile || '').toLowerCase().includes(term) ||
        (c.passport_number || '').toLowerCase().includes(term)
      );
    }

    return available;
  }, [availableHajis, availableUmrahs, assignedCustomers, searchTerm, selectedType]);

  // Filter assigned customers
  const filteredAssignedCustomers = useMemo(() => {
    let filtered = assignedCustomers;

    if (selectedType !== 'all') {
      filtered = filtered.filter(c => c.type === selectedType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        (c.name || '').toLowerCase().includes(term) ||
        (c.customer_id || '').toLowerCase().includes(term) ||
        (c.mobile || '').toLowerCase().includes(term) ||
        (c.passport_number || '').toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [assignedCustomers, searchTerm, selectedType]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">লোড করা হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/hajj-umrah/package-list/${id}`)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                প্যাকেজে কাস্টমার Assign করুন
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {pkg?.packageName || 'Package'} - কাস্টমার ব্যবস্থাপনা
              </p>
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
                  placeholder="নাম, কাস্টমার আইডি, মোবাইল বা পাসপোর্ট নম্বর দিয়ে সার্চ করুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">সব</option>
                <option value="haji">হাজি</option>
                <option value="umrah">উমরাহ</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Customers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  উপলব্ধ কাস্টমার ({filteredAvailableCustomers.length})
                </h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {filteredAvailableCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">কোন উপলব্ধ কাস্টমার নেই</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredAvailableCustomers.map((customer) => (
                    <div
                      key={customer._id || customer.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {customer.name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {customer.customer_id || customer._id?.slice(-6)} • {customer.mobile || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignCustomer(customer._id || customer.id, customer.type)}
                        disabled={isAssigning}
                        className="ml-4 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Assign</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Assigned Customers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Assign করা কাস্টমার ({filteredAssignedCustomers.length})
                </h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {filteredAssignedCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">কোন কাস্টমার assign করা হয়নি</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredAssignedCustomers.map((customer) => (
                    <div
                      key={customer._id || customer.id}
                      className="flex items-center justify-between p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {customer.name || 'N/A'}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                customer.type === 'haji' 
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              }`}>
                                {customer.type === 'haji' ? 'হাজি' : 'উমরাহ'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {customer.customer_id || customer._id?.slice(-6)} • {customer.mobile || 'N/A'}
                            </p>
                            {customer.totalAmount && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                মোট: {formatCurrency(customer.totalAmount)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCustomer(customer._id || customer.id, customer.type)}
                        disabled={isAssigning}
                        className="ml-4 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PackageCustomers;
