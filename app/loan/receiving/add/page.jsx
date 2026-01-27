'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Calendar,
  CreditCard,
  Building2,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../../component/DashboardLayout';
import Swal from 'sweetalert2';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../../config/cloudinary';
import { useSession } from '../../../hooks/useSession';

const NewLoanReceiving = () => {
  const router = useRouter();
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { number: 1, title: 'ব্যক্তিগত তথ্য', icon: User },
    { number: 2, title: 'ব্যবসায়িক তথ্য', icon: Building2 },
    { number: 3, title: 'ঠিকানা তথ্য', icon: MapPin },
    { number: 4, title: 'যোগাযোগের তথ্য', icon: Phone },
    { number: 5, title: 'অতিরিক্ত তথ্য', icon: FileText }
  ];

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

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'নামের প্রথম অংশ আবশ্যক';
      if (!formData.lastName.trim()) newErrors.lastName = 'নামের শেষ অংশ আবশ্যক';
      if (formData.nidNumber && !/^\d{10}$|^\d{13}$|^\d{17}$/.test(formData.nidNumber.replace(/\s/g, ''))) {
        newErrors.nidNumber = 'সঠিক জাতীয় পরিচয়পত্র নম্বর লিখুন';
      }
    }

    if (step === 4) { // Contact Info
      if (formData.contactPhone && !/^01[3-9]\d{8}$/.test(formData.contactPhone)) {
        newErrors.contactPhone = 'সঠিক মোবাইল নম্বর লিখুন';
      }
      if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'সঠিক ইমেইল ঠিকানা লিখুন';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission on intermediate steps (e.g. on Enter key press)
    if (currentStep < steps.length) {
      nextStep();
      return;
    }
    
    if (!validateStep(currentStep)) {
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
      createdBy: user?.email || 'unknown_user',
      branchId: user?.branchId || 'main_branch'
    };

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/loans/receiving', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });

      const result = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: 'সফল!',
          text: result?.message || 'ঋণ আবেদন সফলভাবে জমা দেওয়া হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        router.push('/loan/receiving-list');
      } else {
        throw new Error(result.error || result.message || 'Failed to create loan application');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ঋণ আবেদনে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">নতুন ঋণ গ্রহণ</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">ঋণ গ্রহণের জন্য প্রয়োজনীয় তথ্য পূরণ করুন</p>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10" />
              {steps.map((step) => {
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                const Icon = step.icon;

                return (
                  <div key={step.number} className="flex flex-col items-center bg-gray-50 dark:bg-gray-900 px-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isActive
                          ? 'bg-purple-600 border-purple-600 text-white scale-110'
                          : isCompleted
                          ? 'bg-purple-100 border-purple-600 text-purple-600'
                          : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`mt-2 text-xs sm:text-sm font-medium transition-colors duration-300 ${
                        isActive ? 'text-purple-600' : isCompleted ? 'text-purple-600' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-8">
                {/* Personal Profile Information */}
                {currentStep === 1 && (
                <div className="animate-fadeIn">
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
                                ছবি আপলোড করুন
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
                                  {imageUploading.nidFrontImage ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
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
                                  {imageUploading.nidBackImage ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* Business Information */}
                {currentStep === 2 && (
                <div className="animate-fadeIn">
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
                )}

                {/* Address Information */}
                {currentStep === 3 && (
                <div className="animate-fadeIn">
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
                )}

                {/* Contact Information */}
                {currentStep === 4 && (
                <div className="animate-fadeIn">
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
                )}

                {/* Additional Information */}
                {currentStep === 5 && (
                <div className="animate-fadeIn">
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
                  </div>
                </div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <X className="w-4 h-4" />
                    বাতিল
                  </button>

                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      পেছনে
                    </button>
                  )}
                  
                  {currentStep < steps.length ? (
                    <button
                      key="next-button"
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg"
                    >
                      পরবর্তী
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      key="submit-button"
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          ঋণ গ্রহণ করা হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          ঋণ গ্রহণ করুন
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewLoanReceiving;