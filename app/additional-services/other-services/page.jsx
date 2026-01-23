'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye, Package, Phone, Mail, Calendar, Loader2 } from 'lucide-react';
import DashboardLayout from '../../component/DashboardLayout';
import Swal from 'sweetalert2';

const OtherService = () => {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch other services
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
          params.append('search', search);
        }
        
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }
        
        if (serviceTypeFilter !== 'all') {
          params.append('serviceType', serviceTypeFilter);
        }

        const response = await fetch(`/api/other-services?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setServices(data.services || data.data || []);
          setPagination(data.pagination || {
            currentPage: page,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: limit
          });
        } else {
          throw new Error(data.error || 'Failed to fetch other services');
        }
      } catch (err) {
        console.error('Error fetching other services:', err);
        setError(err.message || 'Failed to load other services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [page, search, statusFilter, serviceTypeFilter, limit]);

  // Delete mutation
  const handleDelete = async (service) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `এই সার্ভিস কে মুছে ফেলতে চান?`,
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
        const response = await fetch(`/api/other-services/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'অন্যান্য সার্ভিস সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          // Refresh the list
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          if (search) params.append('search', search);
          if (statusFilter !== 'all') params.append('status', statusFilter);
          if (serviceTypeFilter !== 'all') params.append('serviceType', serviceTypeFilter);
          
          const refreshResponse = await fetch(`/api/other-services?${params.toString()}`);
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok) {
            setServices(refreshData.services || refreshData.data || []);
            setPagination(refreshData.pagination || pagination);
          }
        } else {
          throw new Error(data.error || 'Failed to delete other service');
        }
      } catch (err) {
        console.error('Error deleting other service:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'অন্যান্য সার্ভিস মুছতে সমস্যা হয়েছে',
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
    router.push(`/additional-services/other-services/${id}`);
  };

  const handleEdit = (service) => {
    const id = service._id || service.id;
    router.push(`/additional-services/other-services/edit/${id}`);
  };

  // Get unique service types from services
  const serviceTypes = Array.from(new Set(services.map(s => s.serviceType).filter(Boolean)));

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">অন্যান্য সেবা</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">বিবিধ সেবা ব্যবস্থাপনা করুন</p>
              </div>
              <button
                onClick={() => router.push('/additional-services/other-services/add')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                অন্যান্য সেবা যোগ করুন
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">মোট সেবা</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.totalItems || 0}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                  <Package className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">প্রসেসিং</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {services.filter(s => s.status === 'processing' || s.status === 'in_process').length}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">পেন্ডিং</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {services.filter(s => s.status === 'pending').length}
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
                  <p className="text-gray-600 dark:text-gray-400 text-sm">সম্পন্ন</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {services.filter(s => s.status === 'completed').length}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="সেবা খুঁজুন (নাম, ID, ফোন, ইত্যাদি)..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">সব স্ট্যাটাস</option>
                  <option value="pending">পেন্ডিং</option>
                  <option value="in_process">প্রক্রিয়াধীন</option>
                  <option value="processing">প্রসেসিং</option>
                  <option value="completed">সম্পন্ন</option>
                  <option value="cancelled">বাতিল</option>
                  <option value="on_hold">হোল্ডে আছে</option>
                </select>
              </div>
              <div>
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => {
                    setServiceTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">সব সেবার ধরন</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type} className="font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400">অন্যান্য সেবা লোড করতে সমস্যা হয়েছে</p>
              </div>
            ) : services.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">কোন অন্যান্য সেবা পাওয়া যায়নি</p>
                <button
                  onClick={() => router.push('/additional-services/other-services/add')}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  আপনার প্রথম সেবা যোগ করুন
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">সার্ভিস ID</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ক্লায়েন্টের নাম</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">সেবার ধরন</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">বর্ণনা</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">যোগাযোগ</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">স্ট্যাটাস</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">তারিখ</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">কার্যক্রম</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {services.map((service) => (
                        <tr key={service._id || service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400" style={{ fontFamily: "'Google Sans', monospace" }}>
                              {service.serviceId || service.id || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">{service.clientName || service.name || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                              {service.serviceType || 'General'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-900 dark:text-white text-sm">
                              {service.description ? (service.description.length > 50 ? service.description.substring(0, 50) + '...' : service.description) : 'N/A'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {service.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                                  <Phone className="w-4 h-4" />
                                  {service.phone}
                                </div>
                              )}
                              {service.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                                  <Mail className="w-4 h-4" />
                                  {service.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-english ${
                                service.status === 'completed'
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                  : service.status === 'processing' || service.status === 'in_process'
                                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                                  : service.status === 'pending'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                                  : service.status === 'on_hold'
                                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300'
                                  : service.status === 'cancelled'
                                  ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                              }`}
                              style={{ fontFamily: "'Google Sans', sans-serif" }}
                            >
                              {service.status || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                              <Calendar className="w-4 h-4" />
                              {service.date ? new Date(service.date).toLocaleDateString('bn-BD') : 'N/A'}
                            </div>
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
                                title="সম্পাদনা করুন"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(service)}
                                disabled={isDeleting}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      দেখানো হচ্ছে {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} থেকে{' '}
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} পর্যন্ত, মোট{' '}
                      {pagination.totalItems} টি সেবা
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        পূর্ববর্তী
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors font-english ${
                            pageNum === pagination.currentPage
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          style={{ fontFamily: "'Google Sans', sans-serif" }}
                        >
                          {pageNum}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={pagination.currentPage === pagination.totalPages}
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

export default OtherService;
