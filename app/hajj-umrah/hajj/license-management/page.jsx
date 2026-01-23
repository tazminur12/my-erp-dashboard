'use client';

import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../../../component/DashboardLayout';
import { Plus, Search, Edit, Trash2, Shield, Upload, X, Image as ImageIcon, Users, CheckCircle, Clock, Archive, RefreshCw, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../../config/cloudinary';

const LicenseManagement = () => {
  const [licenses, setLicenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Transfer modal states
  const [transferFormData, setTransferFormData] = useState({
    requestNumber: '',
    fromLicenseId: '',
    toLicenseId: '',
    status: 'প্রাক-নিবন্ধিত'
  });
  const [selectedHajjis, setSelectedHajjis] = useState([]);
  const [transferring, setTransferring] = useState(false);
  const [allHajjis, setAllHajjis] = useState([]);
  const [hajjiLoading, setHajjiLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    logo: '',
    licenseNumber: '',
    licenseName: '',
    ownerName: '',
    mobileNumber: '',
    email: '',
    address: ''
  });

  // Fetch licenses
  useEffect(() => {
    fetchLicenses();
  }, []);

  // Fetch hajjis for transfer
  useEffect(() => {
    if (transferFormData.fromLicenseId && isTransferModalOpen) {
      fetchHajjisForTransfer();
    }
  }, [transferFormData.fromLicenseId, transferFormData.status, isTransferModalOpen]);

  const fetchLicenses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/licenses');
      const data = await response.json();
      
      if (response.ok) {
        setLicenses(data.licenses || data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch licenses');
      }
    } catch (err) {
      console.error('Error fetching licenses:', err);
      setError(err.message || 'Failed to load licenses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHajjisForTransfer = async () => {
    try {
      setHajjiLoading(true);
      const response = await fetch(`/api/hajj-umrah/hajis?limit=20000&page=1`);
      const data = await response.json();
      
      if (response.ok) {
        const hajjis = data.data || data.hajis || [];
        // Filter by licenseId on client side since API doesn't support licenseId filter
        setAllHajjis(hajjis);
      }
    } catch (err) {
      console.error('Error fetching hajjis:', err);
    } finally {
      setHajjiLoading(false);
    }
  };

  // Filter hajjis based on selected license and status
  const filteredHajjisForTransfer = useMemo(() => {
    if (!transferFormData.fromLicenseId) return [];
    
    return allHajjis.filter(hajji => {
      const licenseId = hajji.license_id || hajji.licenseId || hajji.license?._id || hajji.license?.id;
      const matchesLicense = String(licenseId) === String(transferFormData.fromLicenseId);
      const matchesStatus = (hajji.service_status || hajji.serviceStatus) === transferFormData.status;
      return matchesLicense && matchesStatus;
    });
  }, [allHajjis, transferFormData.fromLicenseId, transferFormData.status]);

  const resetForm = () => {
    setFormData({
      logo: '',
      licenseNumber: '',
      licenseName: '',
      ownerName: '',
      mobileNumber: '',
      email: '',
      address: ''
    });
    setLogoPreview(null);
    setEditingLicense(null);
  };

  // Cloudinary Upload Function
  const uploadToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setLogoUploading(true);
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('অনুগ্রহ করে একটি বৈধ ছবি ফাইল নির্বাচন করুন');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('ফাইল সাইজ ৫MB এর কম হতে হবে');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'license-logos');
      
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `আপলোড ব্যর্থ হয়েছে: ${response.status}`);
      }
      
      const result = await response.json();
      const imageUrl = result.secure_url;
      
      setFormData(prev => ({ ...prev, logo: imageUrl }));
      
      Swal.fire({
        title: 'সফল!',
        text: 'লোগো সফলভাবে আপলোড হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'লোগো আপলোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoRemove = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
    setLogoPreview(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (license) => {
    setEditingLicense(license);
    setFormData({
      logo: license.logo || '',
      licenseNumber: license.licenseNumber || '',
      licenseName: license.licenseName || '',
      ownerName: license.ownerName || '',
      mobileNumber: license.mobileNumber || '',
      email: license.email || '',
      address: license.address || ''
    });
    setLogoPreview(license.logo || null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.licenseNumber.trim() || !formData.licenseName.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে লাইসেন্স নম্বর এবং লাইসেন্স নাম পূরণ করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        logo: formData.logo || '',
        licenseNumber: formData.licenseNumber.trim(),
        licenseName: formData.licenseName.trim(),
        ownerName: formData.ownerName.trim() || '',
        mobileNumber: formData.mobileNumber.trim() || '',
        email: formData.email.trim() || '',
        address: formData.address.trim() || ''
      };

      let response;
      if (editingLicense) {
        const licenseId = editingLicense._id || editingLicense.id;
        response = await fetch(`/api/licenses/${licenseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/licenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to save license');
      }

      Swal.fire({
        title: 'সফল!',
        text: editingLicense ? 'লাইসেন্স সফলভাবে আপডেট হয়েছে।' : 'লাইসেন্স সফলভাবে তৈরি হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });

      handleCloseModal();
      fetchLicenses();
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'লাইসেন্স সংরক্ষণ করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (license) => {
    const licenseId = license._id || license.id;
    const licenseName = license.licenseName || 'এই লাইসেন্স';

    Swal.fire({
      title: 'নিশ্চিত করুন',
      text: `${licenseName} কে কি মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/licenses/${licenseId}`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (response.ok) {
            Swal.fire({
              title: 'সফল!',
              text: 'লাইসেন্স সফলভাবে মুছে ফেলা হয়েছে।',
              icon: 'success',
              confirmButtonText: 'ঠিক আছে',
              confirmButtonColor: '#10B981',
            });
            fetchLicenses();
          } else {
            throw new Error(data.error || 'Failed to delete license');
          }
        } catch (error) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: error.message || 'লাইসেন্স মুছতে সমস্যা হয়েছে।',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
        }
      }
    });
  };

  const filteredLicenses = useMemo(() => {
    if (!searchTerm) return licenses;
    
    const search = searchTerm.toLowerCase();
    return licenses.filter(license =>
      (license.licenseNumber && license.licenseNumber.toLowerCase().includes(search)) ||
      (license.licenseName && license.licenseName.toLowerCase().includes(search))
    );
  }, [licenses, searchTerm]);

  const handleTransfer = async () => {
    if (!transferFormData.requestNumber.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে রিকোএস্ট নং পূরণ করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    if (!transferFormData.fromLicenseId || !transferFormData.toLicenseId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে উৎস এবং গন্তব্য লাইসেন্স নির্বাচন করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    if (selectedHajjis.length === 0) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে অন্তত একটি হাজ্বী নির্বাচন করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    if (transferFormData.fromLicenseId === transferFormData.toLicenseId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'উৎস এবং গন্তব্য লাইসেন্স একই হতে পারবে না।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'নিশ্চিত করুন',
      text: `${selectedHajjis.length} টি হাজ্বী অন্য লাইসেন্সে স্থানান্তর করতে চান?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, ট্রান্সফার করুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
    });

    if (!result.isConfirmed) return;

    setTransferring(true);
    try {
      const transferPromises = selectedHajjis.map(hajjiId => {
        return fetch(`/api/hajj-umrah/hajis/${hajjiId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            license_id: transferFormData.toLicenseId,
            licenseId: transferFormData.toLicenseId
          }),
        });
      });

      await Promise.all(transferPromises);

      Swal.fire({
        title: 'সফল!',
        text: `${selectedHajjis.length} টি হাজ্বী সফলভাবে স্থানান্তর করা হয়েছে।`,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });

      setIsTransferModalOpen(false);
      setTransferFormData({
        requestNumber: '',
        fromLicenseId: '',
        toLicenseId: '',
        status: 'প্রাক-নিবন্ধিত'
      });
      setSelectedHajjis([]);
      fetchLicenses();
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'হাজ্বী স্থানান্তর করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setTransferring(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">লাইসেন্স ডেটা লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">ডেটা লোড করতে ত্রুটি</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || 'লাইসেন্স ডেটা লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">লাইসেন্স ব্যবস্থাপনা</h1>
            <p className="text-gray-600 dark:text-gray-400">সকল লাইসেন্স ব্যবস্থাপনা করুন</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => {
                setTransferFormData({
                  requestNumber: '',
                  fromLicenseId: '',
                  toLicenseId: '',
                  status: 'প্রাক-নিবন্ধিত'
                });
                setSelectedHajjis([]);
                setIsTransferModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Users className="w-4 h-4" />
              <span>হাজ্বী হস্তান্তর</span>
            </button>
            <button
              onClick={handleOpenModal}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>লাইসেন্স তৈরি করুন</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট লাইসেন্স</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{licenses.length.toLocaleString('bn-BD')}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট হজ্ব সম্পন্নকারী</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {licenses.reduce((sum, l) => sum + (Number(l.totalHajjPerformers) || Number(l.hajjPerformersCount) || 0), 0).toLocaleString('bn-BD')}
                </p>
              </div>
              <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট প্রাক-নিবন্ধিত</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {licenses.reduce((sum, l) => sum + (Number(l.preRegistered) || Number(l.preRegisteredCount) || 0), 0).toLocaleString('bn-BD')}
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
                  {licenses.reduce((sum, l) => sum + (Number(l.registered) || Number(l.registeredCount) || 0), 0).toLocaleString('bn-BD')}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট আর্কাইভ</p>
                <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                  {licenses.reduce((sum, l) => sum + (Number(l.archive) || Number(l.archiveCount) || 0), 0).toLocaleString('bn-BD')}
                </p>
              </div>
              <Archive className="w-8 h-8 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট রিফান্ডেড</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {licenses.reduce((sum, l) => sum + (Number(l.refunded) || Number(l.refundedCount) || 0), 0).toLocaleString('bn-BD')}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট রিসিভড</p>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {licenses.reduce((sum, l) => sum + (Number(l.received) || Number(l.receivedCount) || 0), 0).toLocaleString('bn-BD')}
                </p>
              </div>
              <ArrowDownCircle className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট ট্রান্সফার্ড</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {licenses.reduce((sum, l) => sum + (Number(l.transferred) || Number(l.transferredCount) || 0), 0).toLocaleString('bn-BD')}
                </p>
              </div>
              <ArrowUpCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="লাইসেন্স নম্বর বা নাম দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* License List Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">লোগো</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">লাইসেন্স নম্বর</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">লাইসেন্স নাম</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">হজ্ব সম্পন্নকারী</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">প্রাক-নিবন্ধিত</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">নিবন্ধিত</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">আর্কাইভ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">রিফান্ডেড</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">রিসিভড</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ট্রান্সফার্ড</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLicenses.map((license) => {
                  const licenseNumber = license.licenseNumber || '1461';
                  const licenseUrl = `https://hajj.gov.bd/agencies/${licenseNumber}`;
                  return (
                    <tr key={license._id || license.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {license.logo ? (
                          <img 
                            src={license.logo} 
                            alt={license.licenseName || 'Logo'} 
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                        >
                          {licenseNumber}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {license.licenseName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {(license.totalHajjPerformers || license.hajjPerformersCount || 0).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {(license.preRegistered || license.preRegisteredCount || 0).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {(license.registered || license.registeredCount || 0).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {(license.archive || license.archiveCount || 0).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {(license.refunded || license.refundedCount || 0).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {(license.received || license.receivedCount || 0).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {(license.transferred || license.transferredCount || 0).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(license)}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(license)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                            title="মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingLicense ? 'লাইসেন্স সম্পাদনা করুন' : 'লাইসেন্স তৈরি করুন'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      লোগো
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      {logoUploading ? (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Cloudinary তে আপলোড হচ্ছে...</span>
                        </div>
                      ) : logoPreview || formData.logo ? (
                        <div className="flex flex-col items-center space-y-3">
                          <img 
                            src={logoPreview || formData.logo} 
                            alt="Logo Preview" 
                            className="max-h-32 max-w-full rounded-lg object-contain"
                          />
                          <button
                            type="button"
                            onClick={handleLogoRemove}
                            className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>লোগো সরান</span>
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="logo-upload" className="block text-center cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ক্লিক করে আপলোড করুন বা ড্র্যাগ করুন
                          </span>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                uploadToCloudinary(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      লাইসেন্স নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="লাইসেন্স নম্বর লিখুন"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      লাইসেন্স নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.licenseName}
                      onChange={(e) => setFormData({ ...formData, licenseName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="লাইসেন্স নাম লিখুন"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      মালিকের নাম
                    </label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="মালিকের নাম লিখুন"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      মোবাইল নাম্বার
                    </label>
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="মোবাইল নাম্বার লিখুন"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ইমেইল
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="ইমেইল লিখুন"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ঠিকানা
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="ঠিকানা লিখুন"
                      rows="3"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || logoUploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {isTransferModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">হাজ্বী হস্তান্তর</h2>
                  <button
                    onClick={() => {
                      setIsTransferModalOpen(false);
                      setTransferFormData({
                        requestNumber: '',
                        fromLicenseId: '',
                        toLicenseId: '',
                        status: 'প্রাক-নিবন্ধিত'
                      });
                      setSelectedHajjis([]);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      রিকোএস্ট নং <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={transferFormData.requestNumber}
                      onChange={(e) => setTransferFormData({ ...transferFormData, requestNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="রিকোএস্ট নং লিখুন"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        কোন লাইসেন্স থেকে <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={transferFormData.fromLicenseId}
                        onChange={(e) => {
                          setTransferFormData({ ...transferFormData, fromLicenseId: e.target.value });
                          setSelectedHajjis([]);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">লাইসেন্স নির্বাচন করুন</option>
                        {licenses.map((license) => (
                          <option key={license._id || license.id} value={license._id || license.id}>
                            {license.licenseNumber} - {license.licenseName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        কোন লাইসেন্স এ <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={transferFormData.toLicenseId}
                        onChange={(e) => setTransferFormData({ ...transferFormData, toLicenseId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">লাইসেন্স নির্বাচন করুন</option>
                        {licenses.map((license) => (
                          <option key={license._id || license.id} value={license._id || license.id}>
                            {license.licenseNumber} - {license.licenseName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      প্রাকনিবন্ধিত/নিবন্ধিত <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={transferFormData.status}
                      onChange={(e) => {
                        setTransferFormData({ ...transferFormData, status: e.target.value });
                        setSelectedHajjis([]);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="প্রাক-নিবন্ধিত">প্রাক-নিবন্ধিত</option>
                      <option value="নিবন্ধিত">নিবন্ধিত</option>
                    </select>
                  </div>

                  {/* Hajji List */}
                  {transferFormData.fromLicenseId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        হাজ্বী নির্বাচন করুন ({filteredHajjisForTransfer.length} টি পাওয়া গেছে)
                      </label>
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-96 overflow-y-auto">
                        {hajjiLoading ? (
                          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                            লোড হচ্ছে...
                          </div>
                        ) : filteredHajjisForTransfer.length === 0 ? (
                          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                            কোন হাজ্বী পাওয়া যায়নি
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredHajjisForTransfer.map((hajji) => {
                              const hajjiId = hajji._id || hajji.id || hajji.customerId;
                              const isSelected = selectedHajjis.includes(hajjiId);
                              return (
                                <div
                                  key={hajjiId}
                                  className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                  }`}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedHajjis(selectedHajjis.filter(id => id !== hajjiId));
                                    } else {
                                      setSelectedHajjis([...selectedHajjis, hajjiId]);
                                    }
                                  }}
                                >
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {hajji.name || `${hajji.firstName || ''} ${hajji.lastName || ''}`.trim() || 'N/A'}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {hajji.mobile || hajji.phone || 'N/A'} | {hajji.passportNumber || 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTransferModalOpen(false);
                        setTransferFormData({
                          requestNumber: '',
                          fromLicenseId: '',
                          toLicenseId: '',
                          status: 'প্রাক-নিবন্ধিত'
                        });
                        setSelectedHajjis([]);
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={handleTransfer}
                      disabled={transferring}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>{transferring ? 'ট্রান্সফার হচ্ছে...' : 'ট্রান্সফার করুন'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LicenseManagement;
