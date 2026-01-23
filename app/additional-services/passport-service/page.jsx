'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye, FileCheck, Phone, Mail, Calendar, Loader2, Filter } from 'lucide-react';
import DashboardLayout from '../../component/DashboardLayout';
import Swal from 'sweetalert2';

const PassportService = () => {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');

  // Loading and data states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch passport services
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (search) {
          params.append('q', search);
        }
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }

        const response = await fetch(`/api/passport-services?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setServices(data.services || data.data || []);
          setPagination(data.pagination || { page: 1, pages: 1, total: 0, limit: 20 });
        } else {
          throw new Error(data.error || 'Failed to fetch passport services');
        }
      } catch (err) {
        console.error('Error fetching passport services:', err);
        setError(err.message || 'Failed to load passport services');
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [page, search, statusFilter, limit]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: pagination.total || services.length,
      pending: services.filter(s => s.status === 'pending').length,
      inProcess: services.filter(s => s.status === 'in_process').length,
      completed: services.filter(s => s.status === 'completed').length,
    };
  }, [services, pagination.total]);

  const handleDelete = async (service) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `এই পাসপোর্ট সার্ভিস কে মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল করুন'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      const id = service._id || service.id;
      
      try {
        const response = await fetch(`/api/passport-services/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'পাসপোর্ট সার্ভিস সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          
          // Refetch services
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          
          if (search) {
            params.append('q', search);
          }
          if (statusFilter !== 'all') {
            params.append('status', statusFilter);
          }

          const refreshResponse = await fetch(`/api/passport-services?${params.toString()}`);
          const refreshData = await refreshResponse.json();

          if (refreshResponse.ok) {
            setServices(refreshData.services || refreshData.data || []);
            setPagination(refreshData.pagination || { page: 1, pages: 1, total: 0, limit: 20 });
          }
        } else {
          throw new Error(data.error || 'Failed to delete passport service');
        }
      } catch (err) {
        console.error('Error deleting passport service:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'পাসপোর্ট সার্ভিস মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleView = (service) => {
    const id = service._id || service.id;
    router.push(`/additional-services/passport-service/${id}`);
  };

  const handleEdit = (service) => {
    const id = service._id || service.id;
    router.push(`/additional-services/passport-service/edit/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">পাসপোর্ট সার্ভিস</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">পাসপোর্ট সার্ভিস এবং আবেদন ব্যবস্থাপনা করুন</p>
              </div>
              <button
                onClick={() => router.push('/additional-services/passport-service/add')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                পাসপোর্ট সার্ভিস যোগ করুন
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">মোট সার্ভিস</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">বিচারাধীন</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.pending}
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">প্রক্রিয়াধীন</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.inProcess}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">সম্পন্ন</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.completed}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <FileCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="পাসপোর্ট সার্ভিস খুঁজুন..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">সব স্ট্যাটাস</option>
                  <option value="pending">বিচারাধীন</option>
                  <option value="in_process">প্রক্রিয়াধীন</option>
                  <option value="completed">সম্পন্ন</option>
                  <option value="cancelled">বাতিল</option>
                </select>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400">পাসপোর্ট সার্ভিস লোড করতে সমস্যা হয়েছে: {error}</p>
              </div>
            ) : services.length === 0 ? (
              <div className="p-8 text-center">
                <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">কোন পাসপোর্ট সার্ভিস পাওয়া যায়নি</p>
                <button
                  onClick={() => router.push('/additional-services/passport-service/add')}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500"
                >
                  আপনার প্রথম পাসপোর্ট সার্ভিস যোগ করুন
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ক্লায়েন্টের নাম</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">সার্ভিসের ধরন</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">যোগাযোগ</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">স্ট্যাটাস</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">বিল কত</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">জমা কত</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">বকেয়া কত</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">কর্ম</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {services.map((service) => (
                        <tr key={service._id || service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{service.clientName || service.name || 'N/A'}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {service.serviceId || service.id || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
                              {service.serviceType === 'new_passport' ? 'নতুন পাসপোর্ট' : 
                               service.serviceType === 'renewal' ? 'পাসপোর্ট নবায়ন' :
                               service.serviceType === 'replacement' ? 'পাসপোর্ট প্রতিস্থাপন' :
                               service.serviceType === 'visa_stamping' ? 'ভিসা স্ট্যাম্পিং' :
                               service.serviceType || 'স্ট্যান্ডার্ড'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {service.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Phone className="w-4 h-4" />
                                  {service.phone}
                                </div>
                              )}
                              {service.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Mail className="w-4 h-4" />
                                  {service.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                service.status === 'completed'
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                  : service.status === 'in_process'
                                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                                  : service.status === 'pending'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                              }`}
                            >
                              {service.status === 'pending' ? 'বিচারাধীন' :
                               service.status === 'in_process' ? 'প্রক্রিয়াধীন' :
                               service.status === 'completed' ? 'সম্পন্ন' :
                               service.status === 'cancelled' ? 'বাতিল' :
                               service.status || 'বিচারাধীন'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-900 dark:text-white font-medium">
                              ৳{service.totalAmount ? service.totalAmount.toLocaleString('bn-BD') : '0'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-green-600 dark:text-green-400 font-medium">
                              ৳{service.paidAmount ? service.paidAmount.toLocaleString('bn-BD') : '0'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-red-600 dark:text-red-400 font-medium">
                              ৳{service.dueAmount ? service.dueAmount.toLocaleString('bn-BD') : '0'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(service)}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="বিস্তারিত দেখুন"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(service)}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="সার্ভিস সম্পাদনা করুন"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(service)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="সার্ভিস মুছুন"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      {((pagination.page - 1) * pagination.limit) + 1} থেকে{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} দেখানো হচ্ছে, মোট{' '}
                      {pagination.total} টি সার্ভিস
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        পূর্ববর্তী
                      </button>
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            pageNum === pagination.page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        পরবর্তী
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PassportService;
