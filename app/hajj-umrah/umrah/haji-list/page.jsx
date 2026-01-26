'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import Swal from 'sweetalert2';
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Download,
  Phone,
  Mail,
  User,
  CheckCircle,
  Clock,
  Upload,
  Package,
  Wallet,
  Users,
  TrendingDown,
  Loader2,
  X
} from 'lucide-react';

const UmrahHajiList = () => {
  const router = useRouter();
  const [umrahs, setUmrahs] = useState([]);
  const [filteredUmrahs, setFilteredUmrahs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUmrah, setSelectedUmrah] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deletingUmrahId, setDeletingUmrahId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    package: 'all',
  });

  const fetchUmrahs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hajj-umrah/umrahs?limit=20000&page=1');
      
      if (!response.ok) {
        throw new Error('Failed to fetch umrahs');
      }
      
      const data = await response.json();
      // Transform database fields to frontend format
      const transformedUmrahs = (data.umrahs || []).map(umrah => ({
        _id: umrah.id,
        id: umrah.id,
        customerId: umrah.customer_id,
        manualSerialNumber: umrah.manual_serial_number,
        pidNo: umrah.pid_no,
        ngSerialNo: umrah.ng_serial_no,
        trackingNo: umrah.tracking_no,
        name: umrah.name,
        banglaName: umrah.bangla_name,
        firstName: umrah.first_name,
        lastName: umrah.last_name,
        fatherName: umrah.father_name,
        motherName: umrah.mother_name,
        spouseName: umrah.spouse_name,
        occupation: umrah.occupation,
        dateOfBirth: umrah.date_of_birth,
        gender: umrah.gender,
        maritalStatus: umrah.marital_status,
        nationality: umrah.nationality,
        passportNumber: umrah.passport_number,
        passportType: umrah.passport_type,
        issueDate: umrah.issue_date,
        expiryDate: umrah.expiry_date,
        nidNumber: umrah.nid_number,
        mobile: umrah.mobile,
        whatsappNo: umrah.whatsapp_no,
        email: umrah.email,
        address: umrah.address,
        division: umrah.division,
        district: umrah.district,
        upazila: umrah.upazila,
        area: umrah.area,
        postCode: umrah.post_code,
        emergencyContact: umrah.emergency_contact,
        emergencyPhone: umrah.emergency_phone,
        packageId: umrah.package_id,
        agentId: umrah.agent_id,
        departureDate: umrah.departure_date,
        returnDate: umrah.return_date,
        totalAmount: umrah.total_amount,
        paidAmount: umrah.paid_amount,
        paymentMethod: umrah.payment_method,
        paymentStatus: umrah.payment_status,
        serviceType: umrah.service_type,
        serviceStatus: umrah.service_status,
        status: umrah.service_status, // For compatibility
        isActive: umrah.is_active,
        previousHajj: umrah.previous_hajj,
        previousUmrah: umrah.previous_umrah,
        specialRequirements: umrah.special_requirements,
        notes: umrah.notes,
        referenceBy: umrah.reference_by,
        referenceCustomerId: umrah.reference_customer_id,
        photo: umrah.photo || umrah.photo_url,
        photoUrl: umrah.photo || umrah.photo_url,
        passportCopy: umrah.passport_copy || umrah.passport_copy_url,
        passportCopyUrl: umrah.passport_copy || umrah.passport_copy_url,
        nidCopy: umrah.nid_copy || umrah.nid_copy_url,
        nidCopyUrl: umrah.nid_copy || umrah.nid_copy_url,
        createdAt: umrah.created_at,
        updatedAt: umrah.updated_at
      }));
      
      setUmrahs(transformedUmrahs);
    } catch (error) {
      console.error('Error fetching umrahs:', error);
      const errorMessage = error.message || 'উমরাহ ডেটা লোড করতে ব্যর্থ হয়েছে';
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'উমরাহ লোড করতে ত্রুটি',
        text: errorMessage,
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch umrahs from API
  useEffect(() => {
    fetchUmrahs();
  }, [fetchUmrahs]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = umrahs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(umrah =>
        (umrah.name && umrah.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (umrah.passportNumber && umrah.passportNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (umrah.mobile && umrah.mobile.includes(searchTerm)) ||
        (umrah.email && umrah.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (umrah.customerId && umrah.customerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (umrah.nidNumber && umrah.nidNumber.includes(searchTerm)) ||
        (umrah.manualSerialNumber && umrah.manualSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(umrah => {
        const statusValue = umrah.serviceStatus || umrah.status;
        return statusValue === filters.status;
      });
    }

    // Package filter
    if (filters.package !== 'all') {
      filtered = filtered.filter(umrah =>
        umrah.packageName && umrah.packageName.toLowerCase().includes(filters.package.toLowerCase())
      );
    }

    setFilteredUmrahs(filtered);
    const filteredIds = new Set(filtered.map(u => u._id || u.id));
    setSelectedIds(prev => prev.filter(id => filteredIds.has(id)));
  }, [umrahs, searchTerm, filters]);

  const handleViewDetails = (umrah) => {
    const umrahId = umrah._id || umrah.id || umrah.customerId;
    if (!umrahId) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: 'উমরাহর ID পাওয়া যায়নি।',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }
    router.push(`/hajj-umrah/umrah/haji/${umrahId}`);
  };

  const handleEdit = (umrah) => {
    const umrahId = umrah._id || umrah.id || umrah.customerId;
    if (!umrahId) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: 'উমরাহর ID পাওয়া যায়নি।',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }
    router.push(`/hajj-umrah/umrah/haji/${umrahId}/edit`);
  };

  const handleDelete = async (umrah) => {
    const umrahId = umrah._id || umrah.id;
    if (!umrahId) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: 'উমরাহর ID পাওয়া যায়নি।',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const umrahName = umrah.name || 'এই উমরাহ';
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `আপনি ${umrahName} কে মুছে ফেলতে যাচ্ছেন। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setDeletingUmrahId(umrahId);
    
    try {
      const response = await fetch(`/api/hajj-umrah/umrahs/${umrahId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete umrah');
      }

      // Refresh the list
      await fetchUmrahs();
      
      Swal.fire({
        icon: 'success',
        title: 'মুছে ফেলা হয়েছে!',
        text: `${umrahName} সফলভাবে মুছে ফেলা হয়েছে।`,
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: true,
      });
    } catch (error) {
      console.error('Error deleting umrah:', error);
      Swal.fire({
        icon: 'error',
        title: 'মুছে ফেলতে ব্যর্থ',
        text: error.message || 'উমরাহ মুছতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setDeletingUmrahId(null);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectableUmrahs.length === 0) return;
    const allIds = selectableUmrahs.map(u => u._id || u.id);
    const currentlyAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    setSelectedIds(currentlyAllSelected ? [] : allIds);
  };

  const handleToggleSelect = (umrah) => {
    const umrahId = umrah._id || umrah.id;
    if (!umrahId) return;
    setSelectedIds(prev =>
      prev.includes(umrahId) ? prev.filter(id => id !== umrahId) : [...prev, umrahId]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) {
      Swal.fire({
        icon: 'warning',
        title: 'নির্বাচন করুন',
        text: 'কমপক্ষে একটি উমরাহ নির্বাচন করুন।',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${selectedIds.length} টি উমরাহ মুছে ফেলতে যাচ্ছেন। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setBulkDeleting(true);
    
    try {
      const deletePromises = selectedIds.map(id =>
        fetch(`/api/hajj-umrah/umrahs/${id}`, { method: 'DELETE' })
          .then(async res => {
            const data = await res.json();
            return { success: res.ok, data };
          })
          .catch(err => ({ success: false, error: err.message }))
      );
      
      const results = await Promise.all(deletePromises);
      const failed = results.filter(r => !r.success);
      
      if (failed.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'আংশিক সফল',
          text: `${selectedIds.length - failed.length} টি উমরাহ মুছে ফেলা হয়েছে, ${failed.length} টি মুছতে ব্যর্থ হয়েছে।`,
          confirmButtonColor: '#3b82f6',
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: `${selectedIds.length} টি উমরাহ সফলভাবে মুছে ফেলা হয়েছে।`,
          confirmButtonColor: '#3b82f6',
          timer: 2000,
          showConfirmButton: true,
        });
      }
      
      // Refresh the list
      await fetchUmrahs();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: 'উমরাহ মুছতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const getStatusBadge = (status, serviceStatus) => {
    const displayStatus = serviceStatus || status;
    if (!displayStatus) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          N/A
        </span>
      );
    }

    const normalized = String(displayStatus).toLowerCase();
    let badgeClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';

    if (normalized.includes('পাসপোর্ট রেডি নয়') || normalized.includes('passport not ready')) {
      badgeClasses = 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    } else if (normalized.includes('পাসপোর্ট রেডি') || normalized.includes('passport ready')) {
      badgeClasses = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
    } else if (normalized.includes('প্যাকেজ যুক্ত') || normalized.includes('package added')) {
      badgeClasses = 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    } else if (normalized.includes('রেডি ফর উমরাহ') || normalized.includes('ready for umrah')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (normalized.includes('উমরাহ সম্পন্ন') || normalized.includes('umrah completed')) {
      badgeClasses = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    } else if (normalized.includes('রিফান্ডেড') || normalized.includes('refunded')) {
      badgeClasses = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    } else if (normalized.includes('আর্কাইভ') || normalized.includes('archive')) {
      badgeClasses = 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    } else if (normalized === 'pending' || normalized.includes('pending')) {
      badgeClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    } else if (normalized === 'active' || normalized.includes('active')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses}`}>
        {displayStatus}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const paymentClasses = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      pending: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    const paymentLabels = {
      paid: 'পরিশোধিত',
      partial: 'আংশিক',
      pending: 'বিচারাধীন'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentClasses[paymentStatus] || paymentClasses.pending}`}>
        {paymentLabels[paymentStatus] || paymentStatus}
      </span>
    );
  };

  const selectableUmrahs = useMemo(
    () => filteredUmrahs.filter(u => u._id || u.id),
    [filteredUmrahs]
  );
  const allSelected = selectableUmrahs.length > 0 && selectableUmrahs.every(u => selectedIds.includes(u._id || u.id));
  const partiallySelected = selectableUmrahs.some(u => selectedIds.includes(u._id || u.id)) && !allSelected;

  // Calculate stats
  const totalUmrahs = umrahs.length;
  const completedUmrahs = umrahs.filter(u => {
    const status = u.serviceStatus || u.status || '';
    return status.includes('উমরাহ সম্পন্ন') || status.includes('umrah completed');
  }).length;
  const readyForUmrah = umrahs.filter(u => {
    const status = u.serviceStatus || u.status || '';
    return status.includes('রেডি ফর উমরাহ') || status.includes('ready for umrah');
  }).length;
  const totalPackageAmount = umrahs.reduce((sum, u) => sum + (Number(u.totalAmount) || 0), 0);
  const totalPaidAmount = umrahs.reduce((sum, u) => sum + (Number(u.paidAmount) || 0), 0);
  const totalDueAmount = Math.max(0, totalPackageAmount - totalPaidAmount);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">উমরাহ ডেটা লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">ডেটা লোড করতে ত্রুটি</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => fetchUmrahs()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">উমরাহ তালিকা</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">নিবন্ধিত সব উমরাহ পরিচালনা করুন</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0 || bulkDeleting}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors duration-200 ${
                selectedIds.length === 0 || bulkDeleting
                  ? 'text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                  : 'text-red-600 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              {bulkDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{bulkDeleting ? 'মুছে ফেলা হচ্ছে...' : 'নির্বাচিত মুছুন'}</span>
            </button>
            <Link
              href="/hajj-umrah/umrah/haji/add"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন উমরাহ যোগ করুন</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট উমরাহ</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Number(totalUmrahs).toLocaleString('bn-BD')}</p>
              </div>
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">উমরাহ সম্পন্ন</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {Number(completedUmrahs).toLocaleString('bn-BD')}
                </p>
              </div>
              <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">রেডি ফর উমরাহ</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Number(readyForUmrah).toLocaleString('bn-BD')}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট প্যাকেজ রেট</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ৳{Number(totalPackageAmount).toLocaleString('bn-BD')}
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট জমা</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ৳{Number(totalPaidAmount).toLocaleString('bn-BD')}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট বকেয়া</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ৳{Number(totalDueAmount).toLocaleString('bn-BD')}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="নাম, পাসপোর্ট, মোবাইল, ইমেইল, উমরাহ আইডি, NID, বা ম্যানুয়াল সিরিয়াল দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="পাসপোর্ট রেডি নয়">পাসপোর্ট রেডি নয়</option>
                <option value="পাসপোর্ট রেডি">পাসপোর্ট রেডি</option>
                <option value="প্যাকেজ যুক্ত">প্যাকেজ যুক্ত</option>
                <option value="রেডি ফর উমরাহ">রেডি ফর উমরাহ</option>
                <option value="উমরাহ সম্পন্ন">উমরাহ সম্পন্ন</option>
                <option value="রিফান্ডেড">রিফান্ডেড</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={handleToggleSelectAll}
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = partiallySelected;
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    উমরাহ আইডি
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ম্যানুয়াল সিরিয়াল
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    নাম
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    এলাকা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    যোগাযোগ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    প্যাকেজ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    পেমেন্ট
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUmrahs.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'কোনো উমরাহ পাওয়া যায়নি' : 'কোনো উমরাহ নেই'}
                    </td>
                  </tr>
                ) : (
                  filteredUmrahs.map((umrah) => {
                    const umrahId = umrah._id || umrah.id;
                    const photoUrl = umrah.photo || umrah.photoUrl || umrah.image;
                    return (
                      <tr
                        key={umrahId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedIds.includes(umrahId)}
                            onChange={() => handleToggleSelect(umrah)}
                            disabled={!umrahId}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleViewDetails(umrah)}>
                          <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {umrah.customerId || umrahId || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleViewDetails(umrah)}>
                          <span className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                            {umrah.manualSerialNumber || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleViewDetails(umrah)}>
                          <div className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={umrah.name || 'Umrah'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center ${photoUrl ? 'hidden' : 'flex'}`}>
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {umrah.banglaName ? (
                                  <>
                                    <div>{umrah.banglaName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{umrah.name}</div>
                                  </>
                                ) : (
                                  umrah.name || 'N/A'
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {umrah.passportNumber || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleViewDetails(umrah)}>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {umrah.area || 'N/A'}, {umrah.upazila || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleViewDetails(umrah)}>
                          <div className="text-sm group">
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              <Phone className="w-3 h-3" />
                              <span>{umrah.mobile || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{umrah.email || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {umrah.packageName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(umrah.status, umrah.serviceStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {getPaymentBadge(umrah.paymentStatus || 'pending')}
                            <div className="text-gray-500 dark:text-gray-400 mt-1">
                              ৳{Number(umrah.paidAmount || 0).toLocaleString('bn-BD')} / ৳{Number(umrah.totalAmount || 0).toLocaleString('bn-BD')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(umrah)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                              title="বিবরণ দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(umrah)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                              title="সম্পাদনা করুন"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(umrah)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                deletingUmrahId === umrahId
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20'
                              }`}
                              title={deletingUmrahId === umrahId ? 'মুছে ফেলা হচ্ছে...' : 'মুছুন'}
                              disabled={deletingUmrahId === umrahId}
                            >
                              {deletingUmrahId === umrahId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UmrahHajiList;
