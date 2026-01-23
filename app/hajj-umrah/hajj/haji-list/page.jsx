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

const HajiList = () => {
  const router = useRouter();
  const [hajis, setHajis] = useState([]);
  const [filteredHajis, setFilteredHajis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHaji, setSelectedHaji] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deletingHajiId, setDeletingHajiId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    package: 'all',
  });

  const fetchHajis = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hajj-umrah/hajis?limit=20000&page=1');
      
      if (!response.ok) {
        throw new Error('Failed to fetch hajis');
      }
      
      const data = await response.json();
      // Transform database fields to frontend format
      const transformedHajis = (data.hajis || []).map(haji => ({
        _id: haji.id,
        id: haji.id,
        customerId: haji.customer_id,
        manualSerialNumber: haji.manual_serial_number,
        pidNo: haji.pid_no,
        ngSerialNo: haji.ng_serial_no,
        trackingNo: haji.tracking_no,
        name: haji.name,
        firstName: haji.first_name,
        lastName: haji.last_name,
        fatherName: haji.father_name,
        motherName: haji.mother_name,
        spouseName: haji.spouse_name,
        occupation: haji.occupation,
        dateOfBirth: haji.date_of_birth,
        gender: haji.gender,
        maritalStatus: haji.marital_status,
        nationality: haji.nationality,
        passportNumber: haji.passport_number,
        passportType: haji.passport_type,
        issueDate: haji.issue_date,
        expiryDate: haji.expiry_date,
        nidNumber: haji.nid_number,
        mobile: haji.mobile,
        whatsappNo: haji.whatsapp_no,
        email: haji.email,
        address: haji.address,
        division: haji.division,
        district: haji.district,
        upazila: haji.upazila,
        area: haji.area,
        postCode: haji.post_code,
        emergencyContact: haji.emergency_contact,
        emergencyPhone: haji.emergency_phone,
        packageId: haji.package_id,
        agentId: haji.agent_id,
        licenseId: haji.license_id,
        departureDate: haji.departure_date,
        returnDate: haji.return_date,
        totalAmount: haji.total_amount,
        paidAmount: haji.paid_amount,
        paymentMethod: haji.payment_method,
        paymentStatus: haji.payment_status,
        serviceType: haji.service_type,
        serviceStatus: haji.service_status,
        status: haji.service_status, // For compatibility
        isActive: haji.is_active,
        previousHajj: haji.previous_hajj,
        previousUmrah: haji.previous_umrah,
        specialRequirements: haji.special_requirements,
        notes: haji.notes,
        referenceBy: haji.reference_by,
        referenceCustomerId: haji.reference_customer_id,
        photo: haji.photo || haji.photo_url,
        photoUrl: haji.photo || haji.photo_url,
        passportCopy: haji.passport_copy || haji.passport_copy_url,
        passportCopyUrl: haji.passport_copy || haji.passport_copy_url,
        nidCopy: haji.nid_copy || haji.nid_copy_url,
        nidCopyUrl: haji.nid_copy || haji.nid_copy_url,
        createdAt: haji.created_at,
        updatedAt: haji.updated_at
      }));
      
      setHajis(transformedHajis);
    } catch (error) {
      console.error('Error fetching hajis:', error);
      const errorMessage = error.message || 'হাজি ডেটা লোড করতে ব্যর্থ হয়েছে';
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'হাজি লোড করতে ত্রুটি',
        text: errorMessage,
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch hajis from API
  useEffect(() => {
    fetchHajis();
  }, [fetchHajis]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = hajis;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(haji =>
        (haji.name && haji.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji.passportNumber && haji.passportNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji.mobile && haji.mobile.includes(searchTerm)) ||
        (haji.email && haji.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji.customerId && haji.customerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji.nidNumber && haji.nidNumber.includes(searchTerm)) ||
        (haji.manualSerialNumber && haji.manualSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(haji => {
        const statusValue = haji.serviceStatus || haji.status;
        return statusValue === filters.status;
      });
    }

    // Package filter
    if (filters.package !== 'all') {
      filtered = filtered.filter(haji =>
        haji.packageName && haji.packageName.toLowerCase().includes(filters.package.toLowerCase())
      );
    }

    setFilteredHajis(filtered);
    const filteredIds = new Set(filtered.map(h => h._id || h.id));
    setSelectedIds(prev => prev.filter(id => filteredIds.has(id)));
  }, [hajis, searchTerm, filters]);

  const handleViewDetails = (haji) => {
    const hajiId = haji._id || haji.id || haji.customerId;
    if (!hajiId) {
      alert('হাজির ID পাওয়া যায়নি।');
      return;
    }
    router.push(`/hajj-umrah/hajj/haji/${hajiId}`);
  };

  const handleEdit = (haji) => {
    const hajiId = haji._id || haji.id || haji.customerId;
    if (!hajiId) {
      alert('হাজির ID পাওয়া যায়নি।');
      return;
    }
    router.push(`/hajj-umrah/hajj/haji/${hajiId}/edit`);
  };

  const handleDelete = async (haji) => {
    const hajiId = haji._id || haji.id;
    if (!hajiId) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: 'হাজির ID পাওয়া যায়নি।',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const hajiName = haji.name || 'এই হাজি';
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `আপনি ${hajiName} কে মুছে ফেলতে যাচ্ছেন। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না!`,
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

    setDeletingHajiId(hajiId);
    
    try {
      const response = await fetch(`/api/hajj-umrah/hajis/${hajiId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete haji');
      }

      // Refresh the list
      await fetchHajis();
      
      Swal.fire({
        icon: 'success',
        title: 'মুছে ফেলা হয়েছে!',
        text: `${hajiName} সফলভাবে মুছে ফেলা হয়েছে।`,
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: true,
      });
    } catch (error) {
      console.error('Error deleting haji:', error);
      Swal.fire({
        icon: 'error',
        title: 'মুছে ফেলতে ব্যর্থ',
        text: error.message || 'হাজি মুছতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setDeletingHajiId(null);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectableHajis.length === 0) return;
    const allIds = selectableHajis.map(h => h._id || h.id);
    const currentlyAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    setSelectedIds(currentlyAllSelected ? [] : allIds);
  };

  const handleToggleSelect = (haji) => {
    const hajiId = haji._id || haji.id;
    if (!hajiId) return;
    setSelectedIds(prev =>
      prev.includes(hajiId) ? prev.filter(id => id !== hajiId) : [...prev, hajiId]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) {
      Swal.fire({
        icon: 'warning',
        title: 'নির্বাচন করুন',
        text: 'কমপক্ষে একটি হাজি নির্বাচন করুন।',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${selectedIds.length} টি হাজি মুছে ফেলতে যাচ্ছেন। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না!`,
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
        fetch(`/api/hajj-umrah/hajis/${id}`, { method: 'DELETE' })
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
          text: `${selectedIds.length - failed.length} টি হাজি মুছে ফেলা হয়েছে, ${failed.length} টি মুছতে ব্যর্থ হয়েছে।`,
          confirmButtonColor: '#3b82f6',
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: `${selectedIds.length} টি হাজি সফলভাবে মুছে ফেলা হয়েছে।`,
          confirmButtonColor: '#3b82f6',
          timer: 2000,
          showConfirmButton: true,
        });
      }
      
      // Refresh the list
      await fetchHajis();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: 'হাজি মুছতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
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
    } else if (normalized.includes('রেডি ফর হজ্ব') || normalized.includes('ready for hajj')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (normalized.includes('হজ্ব সম্পন্ন') || normalized.includes('hajj completed')) {
      badgeClasses = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    } else if (normalized.includes('রিফান্ডেড') || normalized.includes('refunded')) {
      badgeClasses = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    } else if (normalized.includes('আর্কাইভ') || normalized.includes('archive')) {
      badgeClasses = 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    } else if (normalized === 'pending' || normalized.includes('pending')) {
      badgeClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    } else if (normalized === 'active' || normalized.includes('active')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (normalized.includes('নিবন্ধিত') || normalized.includes('registered')) {
      badgeClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
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

  const selectableHajis = useMemo(
    () => filteredHajis.filter(h => h._id || h.id),
    [filteredHajis]
  );
  const allSelected = selectableHajis.length > 0 && selectableHajis.every(h => selectedIds.includes(h._id || h.id));
  const partiallySelected = selectableHajis.some(h => selectedIds.includes(h._id || h.id)) && !allSelected;

  // Calculate stats
  const totalHajis = hajis.length;
  const completedHajis = hajis.filter(h => {
    const status = h.serviceStatus || h.status || '';
    return status.includes('হজ্ব সম্পন্ন') || status.includes('hajj completed');
  }).length;
  const preRegistered = hajis.filter(h => {
    const status = h.serviceStatus || h.status || '';
    return status.includes('প্রাক-নিবন্ধিত');
  }).length;
  const registered = hajis.filter(h => {
    const status = h.serviceStatus || h.status || '';
    return status.includes('নিবন্ধিত') || status === 'registered';
  }).length;
  const totalPackageAmount = hajis.reduce((sum, h) => sum + (Number(h.totalAmount) || 0), 0);
  const totalPaidAmount = hajis.reduce((sum, h) => sum + (Number(h.paidAmount) || 0), 0);
  const totalDueAmount = Math.max(0, totalPackageAmount - totalPaidAmount);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">হাজি ডেটা লোড হচ্ছে...</p>
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
              onClick={() => fetchHajis()}
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">হাজি তালিকা</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">নিবন্ধিত সব হাজি পরিচালনা করুন</p>
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
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>এক্সপোর্ট</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200">
              <Upload className="w-4 h-4" />
              <span>এক্সেল আপলোড</span>
            </button>
            <Link
              href="/hajj-umrah/hajj/haji/add"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন হাজি যোগ করুন</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট হাজি</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Number(totalHajis).toLocaleString('bn-BD')}</p>
              </div>
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট হজ্ব পালনকারী</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {Number(completedHajis).toLocaleString('bn-BD')}
                </p>
              </div>
              <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট প্রাক নিবন্ধিত</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {Number(preRegistered).toLocaleString('bn-BD')}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট নিবন্ধিত</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Number(registered).toLocaleString('bn-BD')}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
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
                placeholder="নাম, পাসপোর্ট, মোবাইল, ইমেইল, হাজি আইডি, NID, বা ম্যানুয়াল সিরিয়াল দিয়ে খুঁজুন..."
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
                <option value="আনপেইড">আনপেইড</option>
                <option value="প্রাক-নিবন্ধিত">প্রাক-নিবন্ধিত</option>
                <option value="নিবন্ধিত">নিবন্ধিত</option>
                <option value="হজ্ব সম্পন্ন">হজ্ব সম্পন্ন</option>
                <option value="আর্কাইভ">আর্কাইভ</option>
                <option value="রিফান্ডেড">রিফান্ডেড</option>
              </select>
              <select
                value={filters.package}
                onChange={(e) => setFilters(prev => ({ ...prev, package: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="all">সব প্যাকেজ</option>
                <option value="haj">হজ্জ</option>
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
                    হাজী আইডি
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ম্যানুয়াল সিরিয়াল
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    নাম
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
                {filteredHajis.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'কোনো হাজি পাওয়া যায়নি' : 'কোনো হাজি নেই'}
                    </td>
                  </tr>
                ) : (
                  filteredHajis.map((haji) => {
                    const hajiId = haji._id || haji.id;
                    const photoUrl = haji.photo || haji.photoUrl || haji.image;
                    return (
                      <tr
                        key={hajiId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedIds.includes(hajiId)}
                            onChange={() => handleToggleSelect(haji)}
                            disabled={!hajiId}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {haji.customerId || hajiId || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {haji.manualSerialNumber || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={haji.name || 'Haji'}
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
                              <div className="font-medium text-gray-900 dark:text-white">
                                {haji.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {haji.passportNumber || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                              <Phone className="w-3 h-3" />
                              <span>{haji.mobile || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{haji.email || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {haji.packageName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(haji.status, haji.serviceStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {getPaymentBadge(haji.paymentStatus || 'pending')}
                            <div className="text-gray-500 dark:text-gray-400 mt-1">
                              ৳{Number(haji.paidAmount || 0).toLocaleString('bn-BD')} / ৳{Number(haji.totalAmount || 0).toLocaleString('bn-BD')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(haji)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                              title="বিবরণ দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(haji)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                              title="সম্পাদনা করুন"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(haji)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                deletingHajiId === hajiId
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20'
                              }`}
                              title={deletingHajiId === hajiId ? 'মুছে ফেলা হচ্ছে...' : 'মুছুন'}
                              disabled={deletingHajiId === hajiId}
                            >
                              {deletingHajiId === hajiId ? (
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

        {/* Haji Details Modal */}
        {showModal && selectedHaji && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">হাজি বিবরণ</h2>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">ব্যক্তিগত তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">নাম</label>
                      <p className="text-gray-900 dark:text-white">{selectedHaji.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">হাজি আইডি</label>
                      <p className="text-gray-900 dark:text-white">{selectedHaji.customerId || selectedHaji._id || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">মোবাইল</label>
                      <p className="text-gray-900 dark:text-white">{selectedHaji.mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">ইমেইল</label>
                      <p className="text-gray-900 dark:text-white">{selectedHaji.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">আর্থিক তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">মোট পরিমাণ</label>
                      <p className="text-gray-900 dark:text-white">৳{Number(selectedHaji.totalAmount || 0).toLocaleString('bn-BD')}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">পরিশোধিত পরিমাণ</label>
                      <p className="text-gray-900 dark:text-white">৳{Number(selectedHaji.paidAmount || 0).toLocaleString('bn-BD')}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">বাকি পরিমাণ</label>
                      <p className="text-gray-900 dark:text-white">
                        ৳{Number(Math.max(0, (selectedHaji.totalAmount || 0) - (selectedHaji.paidAmount || 0))).toLocaleString('bn-BD')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HajiList;
