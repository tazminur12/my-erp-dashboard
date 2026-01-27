'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../component/DashboardLayout';
import { ArrowLeft, Upload, Building2, X, Loader2 } from 'lucide-react';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../../../config/cloudinary';
import Swal from 'sweetalert2';

const EditBankAccount = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'Current',
    accountCategory: 'bank',
    branchName: '',
    accountHolder: '',
    accountTitle: '',
    routingNumber: '',
    logo: null,
    initialBalance: '',
    currentBalance: '',
    currency: 'BDT',
    contactNumber: '',
    createdBy: '',
    branchId: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch bank account data
  useEffect(() => {
    if (id) {
      fetchBankAccount();
    }
  }, [id]);

  const fetchBankAccount = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bank-accounts/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        const account = data.bankAccount || data.data;
        setFormData({
          bankName: account.bankName || '',
          accountNumber: account.accountNumber || '',
          accountType: account.accountType || 'Current',
          accountCategory: account.accountCategory || 'bank',
          branchName: account.branchName || '',
          accountHolder: account.accountHolder || '',
          accountTitle: account.accountTitle || '',
          routingNumber: account.routingNumber || '',
          logo: account.logo || null,
          initialBalance: account.initialBalance?.toString() || '',
          currentBalance: account.currentBalance?.toString() || '',
          currency: account.currency || 'BDT',
          contactNumber: account.contactNumber || '',
          createdBy: account.createdBy || '',
          branchId: account.branchId || '',
          status: account.status || 'active'
        });
        if (account.logo) {
          setUploadedImageUrl(account.logo);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch bank account');
      }
    } catch (error) {
      console.error('Error fetching bank account:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ব্যাংক অ্যাকাউন্ট লোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      }).then(() => {
        router.push('/account/bank-accounts');
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Cloudinary Upload Function
  const uploadToCloudinary = async (file) => {
    try {
      // Validate Cloudinary configuration first
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setIsUploading(true);
      
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'bank-logos');
      
      // Upload to Cloudinary
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Set uploaded image data - Just the URL
      const imageUrl = result.secure_url;
      
      // Set image states
      setUploadedImageUrl(imageUrl);
      
      // Update form data with image URL
      setFormData(prev => ({ ...prev, logo: imageUrl }));
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: 'লোগো Cloudinary এ আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB',
        customClass: {
          title: 'text-green-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      
    } catch (error) {
      // Show error message
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'লোগো আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: null
    }));
    setUploadedImageUrl(null);
    setErrors(prev => ({
      ...prev,
      logo: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }

    if (!formData.routingNumber.trim()) {
      newErrors.routingNumber = 'Routing number is required';
    }

    if (!formData.accountCategory.trim()) {
      newErrors.accountCategory = 'Account category is required';
    }

    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }

    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = 'Account holder is required';
    }

    if (!formData.accountTitle.trim()) {
      newErrors.accountTitle = 'Account title is required';
    }

    if (!formData.initialBalance || parseFloat(formData.initialBalance) < 0) {
      newErrors.initialBalance = 'Valid initial balance is required';
    }

    if (formData.contactNumber && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }

    // Validate account category
    const validCategories = ['cash', 'bank', 'mobile_banking', 'check', 'others'];
    if (formData.accountCategory && !validCategories.includes(formData.accountCategory)) {
      newErrors.accountCategory = 'Please select a valid account category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType,
        accountCategory: formData.accountCategory,
        branchName: formData.branchName,
        accountHolder: formData.accountHolder,
        accountTitle: formData.accountTitle,
        routingNumber: formData.routingNumber,
        logo: formData.logo || '',
        initialBalance: parseFloat(formData.initialBalance),
        currentBalance: formData.currentBalance 
          ? parseFloat(formData.currentBalance) 
          : parseFloat(formData.initialBalance),
        currency: formData.currency,
        contactNumber: formData.contactNumber,
        createdBy: formData.createdBy,
        branchId: formData.branchId,
        status: formData.status
      };

      const response = await fetch(`/api/bank-accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'ব্যাংক অ্যাকাউন্ট সফলভাবে আপডেট হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          background: isDark ? '#1F2937' : '#F9FAFB',
          customClass: {
            title: 'text-green-600 font-bold text-xl',
            popup: 'rounded-2xl shadow-2xl'
          }
        }).then(() => {
          router.push(`/account/bank-accounts/${id}`);
        });
      } else {
        throw new Error(result.error || 'Failed to update bank account');
      }
    } catch (error) {
      console.error('Error updating bank account:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ব্যাংক অ্যাকাউন্ট আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'আপনার পরিবর্তনগুলি সংরক্ষিত হবে না।',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, বেরিয়ে যান',
      cancelButtonText: 'না, থাকুন',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      background: isDark ? '#1F2937' : '#F9FAFB',
      customClass: {
        title: 'text-yellow-600 font-bold text-xl',
        popup: 'rounded-2xl shadow-2xl'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        router.push(`/account/bank-accounts/${id}`);
      }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bank account...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Edit Bank Account
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Update bank account information
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Logo Upload Section */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Bank Logo
                </h3>
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0 relative">
                    {formData.logo || uploadedImageUrl ? (
                      <div className="relative group">
                        <img
                          src={formData.logo || uploadedImageUrl}
                          alt="Bank Logo Preview"
                          className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Remove logo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        {isUploading ? (
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        ) : (
                          <Building2 className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <div className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isUploading 
                          ? 'cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                          : 'cursor-pointer border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}>
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            {formData.logo || uploadedImageUrl ? 'Change Logo' : 'Upload Logo'}
                          </>
                        )}
                      </div>
                    </label>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, WebP up to 5MB
                    </p>
                    {errors.logo && (
                      <p className="text-red-500 text-xs mt-1">{errors.logo}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bank Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.bankName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., Dutch Bangla Bank Limited"
                    />
                    {errors.bankName && (
                      <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Title *
                    </label>
                    <input
                      type="text"
                      name="accountTitle"
                      value={formData.accountTitle}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.accountTitle ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., Main Business Account"
                    />
                    {errors.accountTitle && (
                      <p className="text-red-500 text-xs mt-1">{errors.accountTitle}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono ${
                        errors.accountNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., 1234567890"
                    />
                    {errors.accountNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Routing Number *
                    </label>
                    <input
                      type="text"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.routingNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., 098765432"
                    />
                    {errors.routingNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.routingNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Type *
                    </label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Current">Current Account</option>
                      <option value="Savings">Savings Account</option>
                      <option value="Business">Business Account</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Category *
                    </label>
                    <select
                      name="accountCategory"
                      value={formData.accountCategory}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.accountCategory ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank</option>
                      <option value="mobile_banking">Mobile Banking</option>
                      <option value="check">Check</option>
                      <option value="others">Others</option>
                    </select>
                    {errors.accountCategory && (
                      <p className="text-red-500 text-xs mt-1">{errors.accountCategory}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Branch Name *
                    </label>
                    <input
                      type="text"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.branchName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., Dhanmondi Branch"
                    />
                    {errors.branchName && (
                      <p className="text-red-500 text-xs mt-1">{errors.branchName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Holder *
                    </label>
                    <input
                      type="text"
                      name="accountHolder"
                      value={formData.accountHolder}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.accountHolder ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., Miraj Industries Ltd."
                    />
                    {errors.accountHolder && (
                      <p className="text-red-500 text-xs mt-1">{errors.accountHolder}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Balance *
                    </label>
                    <input
                      type="number"
                      name="initialBalance"
                      value={formData.initialBalance}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.initialBalance ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.initialBalance && (
                      <p className="text-red-500 text-xs mt-1">{errors.initialBalance}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Balance
                    </label>
                    <input
                      type="number"
                      name="currentBalance"
                      value={formData.currentBalance}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Leave empty to use Initial Balance"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      If left empty, will be set to Initial Balance
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency *
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="BDT">BDT (Bangladeshi Taka)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="SAR">SAR (Saudi Riyal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.contactNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="+8801712345678"
                    />
                    {errors.contactNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Bank Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditBankAccount;
