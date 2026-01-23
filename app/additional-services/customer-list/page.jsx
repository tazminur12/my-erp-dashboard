'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye, Users, Phone, Mail, MapPin, Loader2, Copy } from 'lucide-react';
import DashboardLayout from '../../component/DashboardLayout';
import Swal from 'sweetalert2';

const CustomerList = () => {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');

  // Loading and data states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
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

        const response = await fetch(`/api/other-customers?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setCustomers(data.customers || data.data || []);
          setPagination(data.pagination || { page: 1, pages: 1, total: 0, limit: 20 });
        } else {
          throw new Error(data.error || 'Failed to fetch customers');
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(err.message || 'Failed to load customers');
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [page, search, statusFilter, limit]);

  const handleDelete = async (customer) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${customer.name || 'এই কাস্টমার'} কে মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল করুন'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      const id = customer._id || customer.id || customer.customerId;
      
      try {
        const response = await fetch(`/api/other-customers/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'কাস্টমার সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          
          // Refetch customers
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

          const refreshResponse = await fetch(`/api/other-customers?${params.toString()}`);
          const refreshData = await refreshResponse.json();

          if (refreshResponse.ok) {
            setCustomers(refreshData.customers || refreshData.data || []);
            setPagination(refreshData.pagination || { page: 1, pages: 1, total: 0, limit: 20 });
          }
        } else {
          throw new Error(data.error || 'Failed to delete customer');
        }
      } catch (err) {
        console.error('Error deleting customer:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'কাস্টমার মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleView = (customer) => {
    const id = customer._id || customer.id || customer.customerId;
    router.push(`/additional-services/customer/${id}`);
  };

  const handleEdit = (customer) => {
    const id = customer._id || customer.id || customer.customerId;
    router.push(`/additional-services/customer/edit/${id}`);
  };

  const handleCopyId = (customerId) => {
    navigator.clipboard.writeText(customerId).then(() => {
      Swal.fire({
        title: 'কপি সফল!',
        text: 'Customer ID কপি করা হয়েছে',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      });
    }).catch(() => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ID কপি করতে সমস্যা হয়েছে',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      });
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer List</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your customers</p>
              </div>
              <button
                onClick={() => router.push('/additional-services/customer-list/add')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Customer
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by Name, Phone, or Email..."
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
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400">Error loading customers: {error}</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No customers found</p>
                <button
                  onClick={() => router.push('/additional-services/customer-list/add')}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500"
                >
                  Add your first customer
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer ID</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {customers.map((customer) => (
                        <tr key={customer._id || customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {customer.customerId || customer.id || customer._id}
                              </span>
                              <button
                                onClick={() => handleCopyId(customer.customerId || customer.id || customer._id)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title="Copy ID"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">{customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Phone className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{customer.phone}</span>
                                </div>
                              )}
                              {customer.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{customer.email}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {customer.city || customer.country ? (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {[customer.city, customer.country].filter(Boolean).join(', ')}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                customer.status === 'active' || customer.isActive !== false
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                              }`}
                            >
                              {customer.status === 'active' || customer.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(customer)}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(customer)}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Edit Customer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(customer)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete Customer"
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
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} customers
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
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
                        Next
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

export default CustomerList;
