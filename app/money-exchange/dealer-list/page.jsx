'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import { Building2, Search, Plus, Phone, Loader2, Trash2, Eye, Edit } from 'lucide-react';
import Swal from 'sweetalert2';

const DilarList = () => {
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [dilars, setDilars] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  const pageSize = 10;

  useEffect(() => {
    const fetchDilars = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
        });
        
        if (query.trim()) {
          params.append('search', query.trim());
        }

        const response = await fetch(`/api/money-exchange/dilars?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setDilars(data.dilars || data.data || []);
          setPagination(data.pagination || { page: 1, limit: pageSize, total: 0, pages: 0 });
        } else {
          throw new Error(data.error || 'Failed to fetch dilars');
        }
      } catch (err) {
        console.error('Error fetching dilars:', err);
        setError(err.message || 'Failed to load dilars');
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'ডিলার লোড করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDilars();
  }, [query, page]);

  const filtered = Array.isArray(dilars) ? dilars : [];
  const totalPages = pagination.pages || 1;
  const currentPage = pagination.page || 1;
  const paged = filtered;

  const handleDeleteDilar = async (dilar) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `ডিলার "${dilar.ownerName || dilar.dilarId}" মুছে ফেলা হবে।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (!result.isConfirmed) return;

    try {
      const idToDelete = dilar._id || dilar.id || dilar.dilarId;
      setDeletingId(idToDelete);
      
      const response = await fetch(`/api/money-exchange/dilars/${idToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'ডিলার মুছে ফেলা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        
        // Refresh the list
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
        });
        if (query.trim()) {
          params.append('search', query.trim());
        }
        const refreshResponse = await fetch(`/api/money-exchange/dilars?${params.toString()}`);
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setDilars(refreshData.dilars || refreshData.data || []);
          setPagination(refreshData.pagination || pagination);
        }
      } else {
        throw new Error(data.error || 'Failed to delete dilar');
      }
    } catch (error) {
      console.error('Failed to delete dilar:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ডিলার মুছে ফেলতে ব্যর্থ হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">ডিলার তালিকা</h1>
              <p className="text-gray-600 dark:text-gray-400">সব ডিলারের তালিকা</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => { 
                  setPage(1); 
                  setQuery(e.target.value); 
                }}
                className="w-full sm:w-72 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="ডিলার খুঁজুন... (নাম, মোবাইল, ঠিকানা)"
              />
            </div>
            <Link
              href="/money-exchange/dealer/add"
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2.5"
            >
              <Plus className="w-4 h-4" /> নতুন ডিলার
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ছবি</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">নাম</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">মোবাইল</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">নম্বর</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        লোড হচ্ছে...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-red-500 dark:text-red-400">
                      {error}
                    </td>
                  </tr>
                ) : paged.length > 0 ? paged.map((d, index) => {
                  const serialNumber = (currentPage - 1) * pageSize + index + 1;
                  const dilarId = d._id || d.id || d.dilarId || d.contactNo;
                  const isDeleting = deletingId === dilarId;
                  
                  return (
                    <tr key={dilarId} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {d.logo && (
                            <img src={d.logo} alt={d.ownerName || 'Dilar'} className="w-10 h-10 rounded object-cover" />
                          )}
                          {!d.logo && (
                            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                              <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {d.ownerName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" /> {d.contactNo || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {serialNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/money-exchange/dealer/${dilarId}/edit`)}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/money-exchange/dealer/${dilarId}`)}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                          <button
                            onClick={() => handleDeleteDilar(d)}
                            disabled={isDeleting}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
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
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">কোন ডিলার পাওয়া যায়নি</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              দেখানো হচ্ছে <span className="font-medium">{paged.length}</span> এর <span className="font-medium">{pagination.total || 0}</span> ডিলার
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                আগে
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-200">পৃষ্ঠা {currentPage} এর {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                পরে
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DilarList;
