'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../component/DashboardLayout';
import { Building2, Save, RotateCcw, X, Upload, Image as ImageIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../../../config/cloudinary';
import Swal from 'sweetalert2';

const initialFormState = {
  ownerName: '',
  contactNo: '',
  tradeLocation: '',
  logo: '',
  tradeName: '',
  nid: ''
};

const EditDilar = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  
  const [form, setForm] = useState(initialFormState);
  const [touched, setTouched] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDilar = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/money-exchange/dilars/${id}`);
        const data = await response.json();

        if (response.ok) {
          const dilar = data.dilar || data.data;
          setForm({
            ownerName: dilar.ownerName || '',
            contactNo: dilar.contactNo || '',
            tradeLocation: dilar.tradeLocation || '',
            logo: dilar.logo || '',
            tradeName: dilar.tradeName || '',
            nid: dilar.nid || ''
          });
          if (dilar.logo) {
            setLogoPreview(dilar.logo);
          }
        } else {
          throw new Error(data.error || 'Failed to fetch dilar');
        }
      } catch (err) {
        console.error('Error fetching dilar:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'ডিলার লোড করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        router.push('/money-exchange/dealer-list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDilar();
  }, [id, router]);

  const errors = useMemo(() => {
    const newErrors = {};
    if (!form.ownerName.trim()) newErrors.ownerName = 'নাম আবশ্যক';
    if (!form.tradeLocation.trim()) newErrors.tradeLocation = 'ঠিকানা আবশ্যক';

    if (!form.contactNo.trim()) {
      newErrors.contactNo = 'মোবাইল নাম্বার আবশ্যক';
    } else {
      const phone = form.contactNo.trim();
      const phoneRegex = /^\+?[0-9\-()\s]{6,20}$/;
      if (!phoneRegex.test(phone)) newErrors.contactNo = 'সঠিক মোবাইল নাম্বার দিন';
    }

    return newErrors;
  }, [form]);

  const hasError = (field) => touched[field] && errors[field];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleReset = () => {
    // Reload original data
    const fetchDilar = async () => {
      try {
        const response = await fetch(`/api/money-exchange/dilars/${id}`);
        const data = await response.json();
        if (response.ok) {
          const dilar = data.dilar || data.data;
          setForm({
            ownerName: dilar.ownerName || '',
            contactNo: dilar.contactNo || '',
            tradeLocation: dilar.tradeLocation || '',
            logo: dilar.logo || '',
            tradeName: dilar.tradeName || '',
            nid: dilar.nid || ''
          });
          setLogoPreview(dilar.logo || null);
          setTouched({});
        }
      } catch (err) {
        console.error('Error fetching dilar:', err);
      }
    };
    fetchDilar();
  };

  const uploadToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setLogoUploading(true);
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'dilars');
      
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
      const imageUrl = result.secure_url;
      
      // Update form data with image URL
      setForm(prev => ({ ...prev, logo: imageUrl }));
      
      Swal.fire({
        title: 'সফল!',
        text: 'ছবি সফলভাবে আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#7c3aed',
        timer: 1500
      });
      
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setForm(prev => ({ ...prev, logo: '' }));
  };

  const handleCancel = () => {
    router.push(`/money-exchange/dealer/${id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      ownerName: true,
      contactNo: true,
      tradeLocation: true
    });

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/money-exchange/dilars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'ডিলার সফলভাবে আপডেট করা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#7c3aed',
        });
        router.push(`/money-exchange/dealer/${id}`);
      } else {
        throw new Error(data.error || 'Failed to update dilar');
      }
    } catch (error) {
      console.error('Failed to update dilar:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ডিলার আপডেট করতে ব্যর্থ হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="পিছনে যান"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">ডিলার সম্পাদনা করুন</h1>
              <p className="text-gray-600 dark:text-gray-400">ডিলার প্রোফাইল আপডেট করুন</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Logo Upload Section */}
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              ছবি
            </label>
            <div className="flex items-center gap-4">
              {logoPreview || form.logo ? (
                <div className="relative">
                  <img
                    src={logoPreview || form.logo}
                    alt="Logo preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Upload className="w-4 h-4" />
                  {logoUploading ? 'আপলোড হচ্ছে...' : logoPreview || form.logo ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  সুপারিশ: বর্গাকার ছবি, সর্বোচ্চ ৫MB (PNG, JPG)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasError('ownerName') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="নাম লিখুন"
                autoComplete="name"
              />
              {hasError('ownerName') && (
                <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                মোবাইল নাম্বার <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactNo"
                value={form.contactNo}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasError('contactNo') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="উদাহরণ: +8801XXXXXXXXX"
                autoComplete="tel"
              />
              {hasError('contactNo') && (
                <p className="mt-1 text-sm text-red-600">{errors.contactNo}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ঠিকানা <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tradeLocation"
                value={form.tradeLocation}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasError('tradeLocation') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="ঠিকানা লিখুন"
                autoComplete="address-line1"
              />
              {hasError('tradeLocation') && (
                <p className="mt-1 text-sm text-red-600">{errors.tradeLocation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ব্যবসার নাম
              </label>
              <input
                type="text"
                name="tradeName"
                value={form.tradeName}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-700"
                placeholder="ব্যবসার নাম (ঐচ্ছিক)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                জাতীয় পরিচয়পত্র
              </label>
              <input
                type="text"
                name="nid"
                value={form.nid}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-700"
                placeholder="জাতীয় পরিচয়পত্র (ঐচ্ছিক)"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" /> বাতিল
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4" /> রিসেট
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" /> {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'ডিলার আপডেট করুন'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditDilar;
