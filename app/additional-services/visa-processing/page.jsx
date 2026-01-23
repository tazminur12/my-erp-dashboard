'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye, FileText, Phone, Mail, Calendar, Loader2, Globe } from 'lucide-react';
import DashboardLayout from '../../component/DashboardLayout';
import Swal from 'sweetalert2';

const VisaProcessing = () => {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 20
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch visa processing services
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
        
        if (countryFilter !== 'all') {
          params.append('country', countryFilter);
        }

        const response = await fetch(`/api/visa-processing?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setServices(data.services || data.data || []);
          setPagination(data.pagination || {
            page: 1,
            pages: 1,
            total: 0,
            limit: 20
          });
        } else {
          throw new Error(data.error || 'Failed to fetch visa processing services');
        }
      } catch (err) {
        console.error('Error fetching visa processing services:', err);
        setError(err.message || 'Failed to load visa processing services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [page, search, statusFilter, countryFilter, limit]);

  const handleDelete = async (service) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `এই ভিসা প্রসেসিং সার্ভিস কে মুছে ফেলতে চান?`,
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
        const response = await fetch(`/api/visa-processing/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'ভিসা প্রসেসিং সার্ভিস সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          // Refresh the list
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          if (search) params.append('q', search);
          if (statusFilter !== 'all') params.append('status', statusFilter);
          if (countryFilter !== 'all') params.append('country', countryFilter);
          
          const refreshResponse = await fetch(`/api/visa-processing?${params.toString()}`);
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok) {
            setServices(refreshData.services || refreshData.data || []);
            setPagination(refreshData.pagination || pagination);
          }
        } else {
          throw new Error(data.error || 'Failed to delete visa processing service');
        }
      } catch (err) {
        console.error('Error deleting visa processing service:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'ভিসা প্রসেসিং সার্ভিস মুছে ফেলতে সমস্যা হয়েছে',
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
    router.push(`/additional-services/visa-processing/${id}`);
  };

  const handleEdit = (service) => {
    const id = service._id || service.id;
    router.push(`/additional-services/visa-processing/edit/${id}`);
  };

  // Get unique countries from services
  const countries = Array.from(new Set(services.map(s => s.country).filter(Boolean)));

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ভিসা প্রসেসিং</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">ভিসা প্রসেসিং সেবা এবং আবেদন ব্যবস্থাপনা করুন</p>
              </div>
              <button
                onClick={() => router.push('/additional-services/visa-processing/add')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                ভিসা প্রসেসিং যোগ করুন
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">মোট আবেদন</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total || 0}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                  <p className="text-gray-600 dark:text-gray-400 text-sm">প্রক্রিয়াধীন</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {services.filter(s => s.status === 'in_process' || s.status === 'processing').length}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">অনুমোদিত</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {services.filter(s => s.status === 'approved' || s.status === 'completed').length}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                  placeholder="ভিসা আবেদন খুঁজুন..."
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
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="in_process">In Process</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => {
                    setCountryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">সব দেশ</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400">ভিসা প্রসেসিং সেবা লোড করতে সমস্যা হয়েছে</p>
              </div>
            ) : services.length === 0 ? (
              <div className="p-8 text-center">
                <Globe className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">কোন ভিসা প্রসেসিং সেবা পাওয়া যায়নি</p>
                <button
                  onClick={() => router.push('/additional-services/visa-processing/add')}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  আপনার প্রথম ভিসা প্রসেসিং সেবা যোগ করুন
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">আবেদনকারীর নাম</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">দেশ</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ভিসার ধরন</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">যোগাযোগ</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">স্ট্যাটাস</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">বিলের পরিমাণ</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">পরিশোধিত</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">বকেয়া</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">কার্যক্রম</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {services.map((service) => (
                        <tr key={service._id || service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{service.applicantName || service.clientName || service.name || 'N/A'}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                                ID: {service.applicationId || service.id || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-gray-900 dark:text-white font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                                {service.country || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                              {service.visaType || service.serviceType || 'Tourist'}
                            </span>
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
                                service.status === 'approved' || service.status === 'completed'
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                  : service.status === 'processing' || service.status === 'in_process'
                                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                                  : service.status === 'pending'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                              }`}
                              style={{ fontFamily: "'Google Sans', sans-serif" }}
                            >
                              {service.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-900 dark:text-white font-medium">
                              ৳{service.totalAmount ? service.totalAmount.toLocaleString('bn-BD') : '০'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-green-600 dark:text-green-400 font-medium">
                              ৳{service.paidAmount ? service.paidAmount.toLocaleString('bn-BD') : '০'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-red-600 dark:text-red-400 font-medium">
                              ৳{service.dueAmount ? service.dueAmount.toLocaleString('bn-BD') : '০'}
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
                {pagination.pages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      দেখানো হচ্ছে {((pagination.page - 1) * pagination.limit) + 1} থেকে{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} পর্যন্ত, মোট{' '}
                      {pagination.total} টি আবেদন
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        পূর্ববর্তী
                      </button>
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors font-english ${
                            pageNum === pagination.page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          style={{ fontFamily: "'Google Sans', sans-serif" }}
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

export default VisaProcessing;
