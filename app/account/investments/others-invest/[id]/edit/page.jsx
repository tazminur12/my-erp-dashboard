'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../../component/DashboardLayout';
import { 
  ArrowLeft, 
  Briefcase, 
  Save,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../../../../config/cloudinary';
import Swal from 'sweetalert2';

const EditOthersInvest = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [formData, setFormData] = useState({
    investmentName: '',
    investmentType: '',
    investmentAmount: '',
    returnAmount: '',
    investmentDate: '',
    maturityDate: '',
    interestRate: '',
    status: 'active',
    description: '',
    notes: '',
    logo: null
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch investment data
  useEffect(() => {
    if (id) {
      fetchInvestment();
    }
  }, [id]);

  const fetchInvestment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/investments/others-invest/${id}`);
      const result = await response.json();

      if (response.ok) {
        const investment = result.investment || result.data;
        
        // Format dates for input fields (YYYY-MM-DD)
        const formatDateForInput = (date) => {
          if (!date) return '';
          const d = new Date(date);
          if (isNaN(d.getTime())) return '';
          return d.toISOString().split('T')[0];
        };

        setFormData({
          investmentName: investment.investmentName || '',
          investmentType: investment.investmentType || '',
          investmentAmount: investment.investmentAmount?.toString() || '',
          returnAmount: investment.returnAmount?.toString() || '',
          investmentDate: formatDateForInput(investment.investmentDate),
          maturityDate: formatDateForInput(investment.maturityDate),
          interestRate: investment.interestRate?.toString() || '',
          status: investment.status || 'active',
          description: investment.description || '',
          notes: investment.notes || '',
          logo: investment.logo || null
        });

        if (investment.logo) {
          setUploadedImageUrl(investment.logo);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch investment');
      }
    } catch (error) {
      console.error('Error fetching investment:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'বিনিয়োগ লোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      }).then(() => {
        router.push('/account/investments/others-invest');
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
      cloudinaryFormData.append('folder', 'investment-logos');
      
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
      });
      
    } catch (error) {
      // Show error message
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'লোগো আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
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

    if (!formData.investmentName.trim()) {
      newErrors.investmentName = 'বিনিয়োগ নাম আবশ্যক';
    }

    if (!formData.investmentType) {
      newErrors.investmentType = 'বিনিয়োগ টাইপ আবশ্যক';
    }

    if (!formData.investmentAmount || parseFloat(formData.investmentAmount) <= 0) {
      newErrors.investmentAmount = 'বিনিয়োগ পরিমাণ আবশ্যক এবং ০ এর চেয়ে বেশি হতে হবে';
    }

    if (formData.returnAmount && parseFloat(formData.returnAmount) < 0) {
      newErrors.returnAmount = 'রিটার্ন পরিমাণ ০ বা তার বেশি হতে হবে';
    }

    if (!formData.investmentDate) {
      newErrors.investmentDate = 'বিনিয়োগ তারিখ আবশ্যক';
    }

    if (!formData.maturityDate) {
      newErrors.maturityDate = 'পরিপক্কতার তারিখ আবশ্যক';
    }

    if (formData.investmentDate && formData.maturityDate) {
      const investmentDate = new Date(formData.investmentDate);
      const maturityDate = new Date(formData.maturityDate);
      if (maturityDate <= investmentDate) {
        newErrors.maturityDate = 'পরিপক্কতার তারিখ বিনিয়োগ তারিখের পরে হতে হবে';
      }
    }

    if (!formData.interestRate || parseFloat(formData.interestRate) < 0 || parseFloat(formData.interestRate) > 100) {
      newErrors.interestRate = 'সুদের হার ০ থেকে ১০০ এর মধ্যে হতে হবে';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        title: 'ভুল!',
        text: 'অনুগ্রহ করে সব আবশ্যক ক্ষেত্র পূরণ করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/investments/others-invest/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          investmentAmount: parseFloat(formData.investmentAmount),
          returnAmount: formData.returnAmount ? parseFloat(formData.returnAmount) : 0,
          interestRate: parseFloat(formData.interestRate)
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'অন্যান্য বিনিয়োগ সফলভাবে আপডেট হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        }).then(() => {
          router.push(`/account/investments/others-invest/${id}`);
        });
      } else {
        throw new Error(result.error || 'Failed to update investment');
      }
    } catch (error) {
      console.error('Error updating investment:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'বিনিয়োগ আপডেট করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
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
    }).then((result) => {
      if (result.isConfirmed) {
        router.push(`/account/investments/others-invest/${id}`);
      }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">বিনিয়োগ লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-purple-600" />
              বিনিয়োগ সম্পাদনা করুন
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              বিনিয়োগ সম্পাদনা করুন
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo Upload Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                বিনিয়োগ লোগো
              </h3>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 relative">
                  {formData.logo || uploadedImageUrl ? (
                    <div className="relative group">
                      <img
                        src={formData.logo || uploadedImageUrl}
                        alt="Investment Logo Preview"
                        className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-600 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                        title="লোগো সরান"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                      {isUploading ? (
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                      ) : (
                        <Briefcase className="w-10 h-10 text-gray-400" />
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
                    <div className={`inline-flex items-center px-5 py-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isUploading 
                        ? 'cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                        : 'cursor-pointer border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-400 dark:hover:border-purple-500'
                    }`}>
                      {isUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          আপলোড হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2" />
                          {formData.logo || uploadedImageUrl ? 'লোগো পরিবর্তন করুন' : 'লোগো আপলোড করুন'}
                        </>
                      )}
                    </div>
                  </label>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF (সর্বোচ্চ 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Investment Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                বিনিয়োগ নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="investmentName"
                value={formData.investmentName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                  errors.investmentName 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="বিনিয়োগের নাম লিখুন"
                required
              />
              {errors.investmentName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.investmentName}</p>
              )}
            </div>

            {/* Investment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                বিনিয়োগ টাইপ <span className="text-red-500">*</span>
              </label>
              <select
                name="investmentType"
                value={formData.investmentType}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                  errors.investmentType 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              >
                <option value="">টাইপ নির্বাচন করুন</option>
                <option value="Stock">Stock</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Mutual Fund">Mutual Fund</option>
                <option value="Fixed Deposit">Fixed Deposit</option>
                <option value="Bond">Bond</option>
                <option value="Cryptocurrency">Cryptocurrency</option>
                <option value="Other">Other</option>
              </select>
              {errors.investmentType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.investmentType}</p>
              )}
            </div>

            {/* Investment Amount and Return Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  বিনিয়োগ পরিমাণ (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="investmentAmount"
                  value={formData.investmentAmount}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                    errors.investmentAmount 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
                {errors.investmentAmount && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.investmentAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  রিটার্ন পরিমাণ (৳)
                </label>
                <input
                  type="number"
                  name="returnAmount"
                  value={formData.returnAmount}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                    errors.returnAmount 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.returnAmount && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.returnAmount}</p>
                )}
              </div>
            </div>

            {/* Interest Rate and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  সুদের হার (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                    errors.interestRate 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="0.00"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
                {errors.interestRate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.interestRate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  স্ট্যাটাস <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  required
                >
                  <option value="active">সক্রিয়</option>
                  <option value="matured">পরিপক্ক</option>
                  <option value="closed">বন্ধ</option>
                </select>
              </div>
            </div>

            {/* Investment Date and Maturity Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  বিনিয়োগ তারিখ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="investmentDate"
                  value={formData.investmentDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                    errors.investmentDate 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                />
                {errors.investmentDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.investmentDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  পরিপক্কতার তারিখ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="maturityDate"
                  value={formData.maturityDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                    errors.maturityDate 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                />
                {errors.maturityDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maturityDate}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                বিবরণ
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
                placeholder="বিনিয়োগের বিবরণ লিখুন..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                নোট
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
                placeholder="অতিরিক্ত নোট লিখুন..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    আপডেট করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    আপডেট করুন
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditOthersInvest;
