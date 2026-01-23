'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../component/DashboardLayout';
import { Building2, Search, Plus, Phone, User, MapPin, Upload, Loader2, Trash2, Eye, Edit } from 'lucide-react';
import Swal from 'sweetalert2';

const VendorList = () => {
  const router = useRouter();
  
  // Local state
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 10;
  const [showExcelUploader, setShowExcelUploader] = useState(false);

  // Format currency helper
  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;

  // Fetch vendors
  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vendors');
      const result = await response.json();

      if (response.ok) {
        const vendorsData = result.data || result.vendors || [];
        setVendors(vendorsData);
      } else {
        throw new Error(result.error || 'Failed to fetch vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to load vendors. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return Array.isArray(vendors) ? vendors : [];
    return Array.isArray(vendors) ? vendors.filter((v) =>
      [v.tradeName, v.tradeLocation, v.ownerName, v.contactNo, v.nid, v.passport]
        .filter(Boolean)
        .some((x) => x.toLowerCase().includes(q))
    ) : [];
  }, [query, vendors]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleExcelDataProcessed = (processedData) => {
    // Validate that we have data to process
    if (!Array.isArray(processedData) || processedData.length === 0) {
      Swal.fire({
        title: 'Error!',
        text: 'No data found in Excel file.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    // Close the Excel uploader modal
    setShowExcelUploader(false);

    // Bulk upload vendors
    handleBulkUpload(processedData);
  };

  const handleBulkUpload = async (vendorsData) => {
    try {
      const response = await fetch('/api/vendors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorsData),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: result.message || 'Vendors uploaded successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#7c3aed',
        });
        fetchVendors();
      } else {
        throw new Error(result.error || 'Failed to upload vendors');
      }
    } catch (error) {
      console.error('Error bulk uploading vendors:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to upload vendors. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDeleteVendor = async (vendor) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Vendor "${vendor.tradeName || vendor.vendorId}" will be removed permanently.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      const idToDelete = vendor._id || vendor.id || vendor.vendorId;
      const response = await fetch(`/api/vendors/${idToDelete}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Vendor deleted successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#7c3aed',
        });
        fetchVendors();
      } else {
        throw new Error(result.error || 'Failed to delete vendor');
      }
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to delete vendor. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsDeleting(false);
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">ভেন্ডর ও পার্টনার তালিকা</h1>
              <p className="text-gray-600 dark:text-gray-400">সব ভেন্ডর ও পার্টনারের তালিকা</p>
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
                onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                className="w-full sm:w-72 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="ভেন্ডর খুঁজুন..."
              />
            </div>
            <button
              onClick={() => {
                Swal.fire({
                  title: 'Coming Soon!',
                  text: 'Excel upload feature will be available soon.',
                  icon: 'info',
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#7c3aed',
                });
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3.5 py-2.5"
            >
              <Upload className="w-4 h-4" /> Excel আপলোড
            </button>
            <Link
              href="/vendors/add"
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2.5"
            >
              <Plus className="w-4 h-4" /> নতুন ভেন্ডর
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">আইডি</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ব্যবসায়ীক নাম</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">মালিকের নাম</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">মোবাইল নং</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ভেন্ডর বিল</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">পরিশোধ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">বকেয়া</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        লোড হচ্ছে...
                      </div>
                    </td>
                  </tr>
                ) : paged.length > 0 ? paged.map((v) => {
                  // Calculate financial totals with proper fallbacks
                  const paidAmount = Math.max(0, Number(
                    v.totalPaid ?? 
                    v.paidAmount ?? 
                    v.totalPaidAmount ?? 
                    0
                  ));
                  const dueAmount = Math.max(0, Number(
                    v.totalDue ?? 
                    v.dueAmount ?? 
                    v.outstandingAmount ?? 
                    v.totalDueAmount ?? 
                    0
                  ));
                  const totalBill = Math.max(0, paidAmount + dueAmount);
            
                  return (
                    <tr key={v._id || v.vendorId} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{v.vendorId || v._id || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {v.logo && (
                            <img src={v.logo} alt={v.tradeName} className="w-10 h-10 rounded" />
                          )}
                          {!v.logo && (
                            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                              <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <Link href={`/vendors/${v._id || v.vendorId}`} className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline block truncate">{v.tradeName || 'N/A'}</Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" /> {v.ownerName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" /> {v.contactNo || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {totalBill > 0 ? formatCurrency(totalBill) : '৳0'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                        {paidAmount > 0 ? formatCurrency(paidAmount) : '৳0'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                        {dueAmount > 0 ? formatCurrency(dueAmount) : '৳0'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/vendors/${v._id || v.vendorId}/edit`}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/vendors/${v._id || v.vendorId}`}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </Link>
                          <button
                            onClick={() => handleDeleteVendor(v)}
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
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">কোন ভেন্ডর পাওয়া যায়নি</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              দেখানো হচ্ছে <span className="font-medium">{paged.length}</span> এর <span className="font-medium">{filtered.length}</span> ভেন্ডর
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                আগে
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-200">পৃষ্ঠা {currentPage} এর {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
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

export default VendorList;
