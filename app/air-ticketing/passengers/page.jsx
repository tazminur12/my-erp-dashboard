'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import { Plus, Eye, Edit, Trash2, Loader2, Search, Users, Phone, Mail, CreditCard, CheckCircle, Download } from 'lucide-react';
import Swal from 'sweetalert2';

const PassengerList = () => {
  const router = useRouter();
  
  // State for pagination and filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(50);
  const [period, setPeriod] = useState(''); // 'today', 'month', 'year', or ''
  const [localFilters, setLocalFilters] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ totalAmount: 0, paidAmount: 0, totalDue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch air customers
  const fetchAirCustomers = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        isActive: 'true',
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`/api/air-customers?${params.toString()}`);
      const result = await response.json();

      if (response.ok) {
        setCustomers(result.customers || []);
        setPagination(result.pagination || {});
      } else {
        throw new Error(result.error || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error fetching air customers:', err);
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAirCustomers();
  }, [page, search, period]);

  const totalPassengers = pagination?.total || customers.length;
  
  // Derive unique customer types for filter options
  const [customerTypes, setCustomerTypes] = useState([]);
  useEffect(() => {
    const types = Array.from(new Set(customers.map(c => c.customerType).filter(Boolean)));
    setCustomerTypes(types.map(t => ({ value: t, label: t })));
  }, [customers]);
  
  // Apply local filters (status, type)
  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (localFilters.status) {
      if (localFilters.status === 'active') list = list.filter(c => c.isActive !== false);
      if (localFilters.status === 'inactive') list = list.filter(c => c.isActive === false);
    }
    if (localFilters.type) {
      list = list.filter(c => (c.customerType || '').toLowerCase() === localFilters.type.toLowerCase());
    }
    return list;
  }, [customers, localFilters]);
  
  // Stats
  const activeCount = useMemo(() => filteredCustomers.filter(c => c.isActive !== false).length, [filteredCustomers]);
  const dueCount = useMemo(() => filteredCustomers.filter(c => (c.totalDue || c.calculatedTotalDue || 0) > 0).length, [filteredCustomers]);
  
  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredCustomers.map(c => c.customerId || c._id || c.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleView = (item) => {
    const customerId = item.customerId || item._id || item.id;
    router.push(`/air-ticketing/passengers/${customerId}`);
  };

  const handleDelete = async (item) => {
    const res = await Swal.fire({
      title: 'যাত্রী মুছে ফেলবেন?',
      text: `${item.name} তালিকা থেকে সরানো হবে।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'মুছে ফেলুন',
      confirmButtonColor: '#ef4444'
    });
    
    if (res.isConfirmed) {
      setIsDeleting(true);
      try {
        const customerId = item.customerId || item._id || item.id;
        const response = await fetch(`/api/air-customers/${customerId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'যাত্রী সফলভাবে মুছে ফেলা হয়েছে।',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#10b981',
          });
          fetchAirCustomers();
        } else {
          throw new Error(result.error || 'Failed to delete customer');
        }
      } catch (err) {
        console.error('Error deleting customer:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'যাত্রী মুছে ফেলতে ব্যর্থ হয়েছে।',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  const handleEdit = (item) => {
    const customerId = item.customerId || item._id || item.id;
    router.push(`/air-ticketing/passengers/edit/${customerId}`);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const res = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `আপনি ${selectedIds.length} জন যাত্রী মুছে ফেলতে যাচ্ছেন। এটি পূর্বাবস্থায় ফেরানো যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, নির্বাচিত মুছে ফেলুন',
      confirmButtonColor: '#ef4444'
    });

    if (res.isConfirmed) {
      setIsDeleting(true);
      try {
        // Sequentially delete to avoid overwhelming the server
        let successCount = 0;
        let failCount = 0;
        
        for (const id of selectedIds) {
          try {
            const response = await fetch(`/api/air-customers/${id}`, {
              method: 'DELETE',
            });
            
            if (response.ok) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (err) {
            console.error(`Failed to delete customer ${id}`, err);
            failCount++;
          }
        }
        
        setSelectedIds([]);
        
        if (failCount === 0) {
          Swal.fire({
            title: 'সফল!',
            text: `${successCount} জন যাত্রী সফলভাবে মুছে ফেলা হয়েছে।`,
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#10b981',
          });
        } else {
          Swal.fire({
            title: 'আংশিক সফল',
            text: `${successCount} জন যাত্রী মুছে ফেলা হয়েছে, ${failCount} জন ব্যর্থ হয়েছে।`,
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#f59e0b',
          });
        }
        
        fetchAirCustomers();
      } catch (err) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'মুছে ফেলার সময় একটি ত্রুটি ঘটেছে।',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isError) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-16">
            <p className="text-red-600 dark:text-red-400">যাত্রী লোড করতে ত্রুটি: {error?.message || 'অজানা ত্রুটি'}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">যাত্রী তালিকা</h1>
              <p className="text-gray-600 dark:text-gray-400">এয়ার যাত্রীদের পরিচালনা এবং অনুসন্ধান করুন {totalPassengers ? `(মোট ${totalPassengers})` : ''}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <Download className="w-4 h-4 mr-2" />
              এক্সপোর্ট
            </button>
            <Link
              href="/air-ticketing/passengers/add"
              className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              নতুন যাত্রী
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট যাত্রী</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPassengers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট পরিমাণ</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{stats.totalAmount?.toLocaleString() || 0}</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট বকেয়া আছে</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">৳{stats.totalDue?.toLocaleString() || 0}</p>
              </div>
              <CreditCard className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">পরিশোধিত পরিমাণ</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">৳{stats.paidAmount?.toLocaleString() || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="অনুসন্ধান করুন..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="flex-1 lg:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">সব সময়</option>
                <option value="today">Daily</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>

              <select
                value={localFilters.status || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value || undefined })}
                className="flex-1 lg:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">অবস্থা (সব)</option>
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
              </select>

              <select
                value={localFilters.type || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value || undefined })}
                className="flex-1 lg:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">গ্রাহকের ধরন (সব)</option>
                {customerTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Items Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  {selectedIds.length} টি আইটেম নির্বাচিত
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  সব পৃষ্ঠায় মোট {totalPassengers} টি আইটেম নির্বাচন করবেন?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                নির্বাচিত মুছে ফেলুন
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">যাত্রী</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">যোগাযোগ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ধরন</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">অবস্থা</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">পেমেন্ট</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        যাত্রী লোড হচ্ছে...
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.length > 0 ? filteredCustomers.map((item) => {
                  const id = item.customerId || item._id || item.id;
                  const photo = item.customerImage;
                  const total = item.totalAmount || item.calculatedTotalAmount || 0;
                  const paid = item.paidAmount || item.calculatedPaidAmount || 0;
                  const due = item.totalDue || item.calculatedTotalDue || 0;
                  
                  return (
                    <tr key={id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(id)}
                          onChange={() => handleSelectOne(id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            {photo ? (
                              <img src={photo} alt={item.name || 'যাত্রী'} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{item.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.passportNumber || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                            <Phone className="w-4 h-4" />
                            <span>{item.mobile || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{item.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          {item.customerType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.isActive !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {item.isActive !== false ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                            <CreditCard className="w-4 h-4" />
                            <span>৳{paid.toLocaleString()} / ৳{total.toLocaleString()}</span>
                          </div>
                          <div className={`text-xs ${due > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            বকেয়া: ৳{due.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(item);
                            }}
                            className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300"
                            title="দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="p-2 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-300"
                            title="সম্পাদনা"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item);
                            }}
                            disabled={isDeleting}
                            className="p-2 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="মুছে ফেলুন"
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
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      কোন যাত্রী পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                দেখানো হচ্ছে <span className="font-medium">{filteredCustomers.length}</span> এর <span className="font-medium">{pagination.total || filteredCustomers.length}</span> যাত্রী
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  আগে
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-200">পৃষ্ঠা {page} এর {pagination.totalPages || 1}</span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages || 1, p + 1))}
                  disabled={page >= (pagination.totalPages || 1)}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  পরে
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PassengerList;
