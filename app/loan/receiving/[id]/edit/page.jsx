'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  User,
  FileText,
  Save,
  X,
  Loader2,
  AlertCircle,
  TrendingUp,
  Camera,
  Upload,
  MapPin,
  Phone,
  FileCheck,
  CreditCard,
  Building2,
  Calendar
} from 'lucide-react';
import DashboardLayout from '../../../../component/DashboardLayout';
import Swal from 'sweetalert2';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../../../config/cloudinary';
import { useSession } from '../../../../hooks/useSession';

const EditLoanReceiving = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id || params?.id;
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    // Personal Profile Information
    firstName: '',
    lastName: '',
    fullName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nidNumber: '',
    nidFrontImage: '',
    nidBackImage: '',
    profilePhoto: '',
    
    // Address Information
    presentAddress: '',
    permanentAddress: '',
    district: '',
    upazila: '',
    postCode: '',
    
    // Business Information
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessRegistration: '',
    businessExperience: '',
    
    // Contact Information
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Additional Information
    commencementDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    commitmentDate: '',
    notes: '',
    status: 'pending',
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState({
    profilePhoto: null,
    nidFrontImage: null,
    nidBackImage: null
  });
  const [imageUploading, setImageUploading] = useState({
    profilePhoto: false,
    nidFrontImage: false,
    nidBackImage: false
  });

  // Fetch loan data
  useEffect(() => {
    const fetchLoan = async () => {
      const currentId = params?.id;
      if (!currentId) {
        console.error('No ID found in params:', params);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/loans/receiving/${currentId}`);
        const data = await response.json();

        if (response.ok) {
          const loan = data.loan || data.data;
          
          // Populate form with existing data
          setFormData({
            firstName: loan.firstName || '',
            lastName: loan.lastName || '',
            fullName: loan.fullName || '',
            fatherName: loan.fatherName || '',
            motherName: loan.motherName || '',
            dateOfBirth: loan.dateOfBirth || '',
            gender: loan.gender || '',
            maritalStatus: loan.maritalStatus || '',
            nidNumber: loan.nidNumber || '',
            nidFrontImage: loan.nidFrontImage || '',
            nidBackImage: loan.nidBackImage || '',
            profilePhoto: loan.profilePhoto || '',
            presentAddress: loan.presentAddress || '',
            permanentAddress: loan.permanentAddress || '',
            district: loan.district || '',
            upazila: loan.upazila || '',
            postCode: loan.postCode || '',
            businessName: loan.businessName || '',
            businessType: loan.businessType || '',
            businessAddress: loan.businessAddress || '',
            businessRegistration: loan.businessRegistration || '',
            businessExperience: loan.businessExperience || '',
            contactPerson: loan.contactPerson || '',
            contactPhone: loan.contactPhone || '',
            contactEmail: loan.contactEmail || '',
            emergencyContact: loan.emergencyContact || '',
            emergencyPhone: loan.emergencyPhone || '',
            commencementDate: loan.commencementDate || new Date().toISOString().split('T')[0],
            completionDate: loan.completionDate || '',
            commitmentDate: loan.commitmentDate || '',
            notes: loan.notes || '',
            status: loan.status || 'pending',
          });

          // Set image previews if images exist
          if (loan.profilePhoto) {
            setImagePreview(prev => ({ ...prev, profilePhoto: loan.profilePhoto }));
          }
          if (loan.nidFrontImage) {
            setImagePreview(prev => ({ ...prev, nidFrontImage: loan.nidFrontImage }));
          }
          if (loan.nidBackImage) {
            setImagePreview(prev => ({ ...prev, nidBackImage: loan.nidBackImage }));
          }
        } else {
          throw new Error(data.error || 'Failed to fetch loan');
        }
      } catch (err) {
        console.error('Error fetching loan:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'ঋণের তথ্য লোড করতে ব্যর্থ হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        router.push('/loan/receiving-list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoan();
  }, [params, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const nextState = { ...prev, [name]: value };
      // Auto-generate fullName from firstName + lastName
      if (name === 'firstName' || name === 'lastName') {
        const nextFirst = name === 'firstName' ? value : nextState.firstName;
        const nextLast = name === 'lastName' ? value : nextState.lastName;
        nextState.fullName = `${(nextFirst || '').trim()} ${(nextLast || '').trim()}`.trim();
      }
      return nextState;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const uploadToCloudinary = async (file, imageType) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setImageUploading(prev => ({ ...prev, [imageType]: true }));
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => ({
          ...prev,
          [imageType]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'loans');
      
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
      
      setFormData(prev => ({ ...prev, [imageType]: imageUrl }));
      
      Swal.fire({
        title: 'সফল!',
        text: 'ছবি সফলভাবে আপলোড করা হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        timer: 1500,
        showConfirmButton: false
      });
      
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setImageUploading(prev => ({ ...prev, [imageType]: false }));
    }
  };

  const handleImageUpload = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      uploadToCloudinary(file, imageType);
    }
  };

  const removeImage = (imageType) => {
    setImagePreview(prev => ({
      ...prev,
      [imageType]: null
    }));
    setFormData(prev => ({
      ...prev,
      [imageType]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'নামের প্রথম অংশ আবশ্যক';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'নামের শেষ অংশ আবশ্যক';
    }

    if (formData.nidNumber && !/^\d{10}$|^\d{13}$|^\d{17}$/.test(formData.nidNumber.replace(/\s/g, ''))) {
      newErrors.nidNumber = 'সঠিক জাতীয় পরিচয়পত্র নম্বর লিখুন';
    }

    if (formData.contactPhone && !/^01[3-9]\d{8}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'সঠিক মোবাইল নম্বর লিখুন';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'সঠিক ইমেইল ঠিকানা লিখুন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে সব আবশ্যক ক্ষেত্র সঠিকভাবে পূরণ করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    const loanData = {
      ...formData,
    };

    try {
      setIsSubmitting(true);
      const currentId = params?.id;
      if (!currentId) {
        throw new Error('Loan ID is missing');
      }
      const response = await fetch(`/api/loans/receiving/${currentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });

      const result = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: 'সফল!',
          text: result?.message || 'ঋণের তথ্য সফলভাবে আপডেট করা হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        router.push(`/loan/receiving/${currentId}`);
      } else {
        throw new Error(result.error || result.message || 'Failed to update loan');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ঋণের তথ্য আপডেট করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!params?.id) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">ঋণ ID পাওয়া যায়নি</p>
            <button
              onClick={() => router.push('/loan/receiving-list')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              ঋণ তালিকায় ফিরে যান
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">ঋণের তথ্য লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ফিরে যান</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ঋণ আবেদন সম্পাদনা করুন</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">ঋণ আবেদনের তথ্য আপডেট করুন</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-8">
                {/* Personal Profile Information */}
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ব্যক্তিগত তথ্য ও প্রোফাইল</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Photo Upload */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        প্রোফাইল ছবি
                      </label>
                      <div className="flex items-center gap-6">
                        <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700/50">
                          {imagePreview.profilePhoto ? (
                            <img 
                              src={imagePreview.profilePhoto} 
                              alt="Profile Preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Camera className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'profilePhoto')}
                            className="hidden"
                            id="profilePhoto"
                            disabled={imageUploading.profilePhoto}
                          />
                          <label
                            htmlFor="profilePhoto"
                            className={`inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
                              imageUploading.profilePhoto ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {imageUploading.profilePhoto ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                আপলোড হচ্ছে...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                {formData.profilePhoto ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}
                              </>
                            )}
                          </label>
                          {imagePreview.profilePhoto && (
                            <button
                              type="button"
                              onClick={() => removeImage('profilePhoto')}
                              className="ml-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              সরান
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        নামের প্রথম অংশ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="নামের প্রথম অংশ লিখুন"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.firstName
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        নামের শেষ অংশ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="নামের শেষ অংশ লিখুন"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.lastName
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        পূর্ণ নাম
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        readOnly
                        placeholder="পূর্ণ নাম (স্বয়ংক্রিয়)"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        পিতার নাম
                      </label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        placeholder="পিতার নাম লিখুন"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        মাতার নাম
                      </label>
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleInputChange}
                        placeholder="মাতার নাম লিখুন"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        জন্ম তারিখ
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        লিঙ্গ
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">লিঙ্গ নির্বাচন করুন</option>
                        <option value="Male">পুরুষ</option>
                        <option value="Female">মহিলা</option>
                        <option value="Other">অন্যান্য</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        বৈবাহিক অবস্থা
                      </label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">অবস্থা নির্বাচন করুন</option>
                        <option value="Single">অবিবাহিত</option>
                        <option value="Married">বিবাহিত</option>
                        <option value="Divorced">তালাকপ্রাপ্ত</option>
                        <option value="Widowed">বিধবা/বিধুর</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        জাতীয় পরিচয়পত্র নম্বর
                      </label>
                      <input
                        type="text"
                        name="nidNumber"
                        value={formData.nidNumber}
                        onChange={handleInputChange}
                        placeholder="জাতীয় পরিচয়পত্র নম্বর লিখুন"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.nidNumber
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                      {errors.nidNumber && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.nidNumber}
                        </p>
                      )}
                    </div>

                    {/* NID Images Upload */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        জাতীয় পরিচয়পত্রের ছবি
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* NID Front */}
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                            সামনের দিক
                          </label>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center bg-gray-50 dark:bg-gray-900/50">
                            {imagePreview.nidFrontImage ? (
                              <div className="relative">
                                <img 
                                  src={imagePreview.nidFrontImage} 
                                  alt="NID Front Preview" 
                                  className="w-full h-40 object-contain rounded-lg mb-3"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage('nidFrontImage')}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div>
                                {imageUploading.nidFrontImage ? (
                                  <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-spin" />
                                ) : (
                                  <FileCheck className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, 'nidFrontImage')}
                                  className="hidden"
                                  id="nidFrontImage"
                                  disabled={imageUploading.nidFrontImage}
                                />
                                <label
                                  htmlFor="nidFrontImage"
                                  className={`inline-block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer ${
                                    imageUploading.nidFrontImage ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  {imageUploading.nidFrontImage ? 'আপলোড হচ্ছে...' : formData.nidFrontImage ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}
                                </label>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* NID Back */}
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                            পিছনের দিক
                          </label>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center bg-gray-50 dark:bg-gray-900/50">
                            {imagePreview.nidBackImage ? (
                              <div className="relative">
                                <img 
                                  src={imagePreview.nidBackImage} 
                                  alt="NID Back Preview" 
                                  className="w-full h-40 object-contain rounded-lg mb-3"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage('nidBackImage')}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div>
                                {imageUploading.nidBackImage ? (
                                  <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-spin" />
                                ) : (
                                  <FileCheck className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, 'nidBackImage')}
                                  className="hidden"
                                  id="nidBackImage"
                                  disabled={imageUploading.nidBackImage}
                                />
                                <label
                                  htmlFor="nidBackImage"
                                  className={`inline-block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer ${
                                    imageUploading.nidBackImage ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  {imageUploading.nidBackImage ? 'আপলোড হচ্ছে...' : formData.nidBackImage ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ব্যবসায়িক তথ্য</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ব্যবসার নাম
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="ব্যবসার নাম লিখুন"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ব্যবসার ধরন
                      </label>
                      <input
                        type="text"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        placeholder="ব্যবসার ধরন লিখুন"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ব্যবসার ঠিকানা
                      </label>
                      <textarea
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        placeholder="ব্যবসার ঠিকানার বিস্তারিত লিখুন"
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ব্যবসার নিবন্ধন নম্বর
                      </label>
                      <input
                        type="text"
                        name="businessRegistration"
                        value={formData.businessRegistration}
                        onChange={handleInputChange}
                        placeholder="ব্যবসার নিবন্ধন নম্বর লিখুন"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ব্যবসার অভিজ্ঞতা (বছর)
                      </label>
                      <input
                        type="text"
                        name="businessExperience"
                        value={formData.businessExperience}
                        onChange={handleInputChange}
                        placeholder="ব্যবসার অভিজ্ঞতা লিখুন"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ঠিকানা তথ্য</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        বর্তমান ঠিকানা
                      </label>
                      <textarea
                        name="presentAddress"
                        value={formData.presentAddress}
                        onChange={handleInputChange}
                        placeholder="বর্তমান ঠিকানার বিস্তারিত লিখুন"
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        স্থায়ী ঠিকানা
                      </label>
                      <textarea
                        name="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={handleInputChange}
                        placeholder="স্থায়ী ঠিকানার বিস্তারিত লিখুন"
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        জেলা
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">জেলা নির্বাচন করুন</option>
                        <option value="ঢাকা">ঢাকা</option>
                        <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                        <option value="সিলেট">সিলেট</option>
                        <option value="রাজশাহী">রাজশাহী</option>
                        <option value="খুলনা">খুলনা</option>
                        <option value="বরিশাল">বরিশাল</option>
                        <option value="রংপুর">রংপুর</option>
                        <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        উপজেলা
                      </label>
                      <input
                        type="text"
                        name="upazila"
                        value={formData.upazila}
                        onChange={handleInputChange}
                        placeholder="উপজেলা লিখুন"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        পোস্ট কোড
                      </label>
                      <input
                        type="text"
                        name="postCode"
                        value={formData.postCode}
                        onChange={handleInputChange}
                        placeholder="পোস্ট কোড লিখুন"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-indigo-100 dark:bg-indigo-900/20 p-2 rounded-lg">
                      <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">যোগাযোগের তথ্য</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        যোগাযোগের ব্যক্তির নাম
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        placeholder="যোগাযোগের ব্যক্তির নাম লিখুন"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        মোবাইল নম্বর
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        placeholder="01XXXXXXXXX"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                          errors.contactPhone
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                      {errors.contactPhone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.contactPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ইমেইল ঠিকানা
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                          errors.contactEmail
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                      {errors.contactEmail && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.contactEmail}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        জরুরি যোগাযোগের নাম
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        placeholder="জরুরি যোগাযোগের নাম লিখুন"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        জরুরি মোবাইল নম্বর
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">অতিরিক্ত তথ্য</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        লোন শুরুর তারিখ
                      </label>
                      <input
                        type="date"
                        name="commencementDate"
                        value={formData.commencementDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        লোন শেষ তারিখ
                      </label>
                      <input
                        type="date"
                        name="completionDate"
                        value={formData.completionDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        কমিট্মেন্ট তারিখ
                      </label>
                      <input
                        type="date"
                        name="commitmentDate"
                        value={formData.commitmentDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        নোট
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="অতিরিক্ত নোট বা তথ্য লিখুন..."
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        অবস্থা
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="pending">বিচারাধীন</option>
                        <option value="active">সক্রিয়</option>
                        <option value="completed">সম্পন্ন</option>
                        <option value="cancelled">বাতিল</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
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
                  
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="sm:w-auto bg-gray-500 dark:bg-gray-600 text-white py-4 px-8 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-semibold text-lg"
                  >
                    <X className="w-5 h-5" />
                    বাতিল
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditLoanReceiving;
