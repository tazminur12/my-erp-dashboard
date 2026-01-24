'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../component/DashboardLayout';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
  Clock,
  Camera,
  X,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../../../config/cloudinary';

const EditEmployee = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const positionOptions = [
    'খামার ম্যানেজার',
    'গরু যত্নকারী',
    'দুধ সংগ্রহকারী',
    'খাদ্য ব্যবস্থাপক',
    'সিকিউরিটি গার্ড',
    'ড্রাইভার',
    'ক্লিনার',
    'অন্যান্য'
  ];

  const statusOptions = [
    { value: 'active', label: 'সক্রিয়' },
    { value: 'inactive', label: 'নিষ্ক্রিয়' },
    { value: 'on_leave', label: 'ছুটিতে' },
    { value: 'terminated', label: 'চাকরি ছাড়া' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    address: '',
    joinDate: '',
    salary: '',
    workHours: '',
    status: 'active',
    notes: '',
    image: ''
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/miraj-industries/farm-employees/${id}`);
        const data = await response.json();

        if (response.ok && data.employee) {
          const emp = data.employee;
          setFormData({
            name: emp.name || '',
            position: emp.position || '',
            phone: emp.phone || '',
            email: emp.email || '',
            address: emp.address || '',
            joinDate: emp.joinDate || '',
            salary: emp.salary || '',
            workHours: emp.workHours || '',
            status: emp.status || 'active',
            notes: emp.notes || '',
            image: emp.image || ''
          });
          if (emp.image) {
            setImagePreview(emp.image);
          }
        } else {
          throw new Error(data.error || 'Failed to fetch employee');
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'কর্মচারী তথ্য লোড করতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        }).then(() => {
          router.push('/miraj-industries/employee-management');
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [id, router]);

  const uploadImageToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setUploadingImage(true);
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('অনুগ্রহ করে একটি বৈধ ছবি ফাইল নির্বাচন করুন');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('ফাইল সাইজ ৫MB এর কম হতে হবে');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'farm-employees');
      
      // Upload to Cloudinary
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `আপলোড ব্যর্থ: ${response.status}`);
      }
      
      const result = await response.json();
      const imageUrl = result.secure_url;
      
      // Update form data with image URL
      setFormData(prev => ({ ...prev, image: imageUrl }));
      
      Swal.fire({
        title: 'সফল!',
        text: 'ছবি সফলভাবে আপলোড হয়েছে!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ছবি আপলোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImageToCloudinary(file);
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'নাম আবশ্যক';
    if (!formData.position.trim()) newErrors.position = 'পদ আবশ্যক';
    if (!formData.phone.trim()) newErrors.phone = 'ফোন নম্বর আবশ্যক';
    if (!formData.joinDate) newErrors.joinDate = 'যোগদান তারিখ আবশ্যক';
    if (!formData.salary || Number(formData.salary) <= 0) newErrors.salary = 'বেতন আবশ্যক এবং ০ এর বেশি হতে হবে';
    if (!formData.workHours || Number(formData.workHours) <= 0) newErrors.workHours = 'কাজের সময় আবশ্যক এবং ০ এর বেশি হতে হবে';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!id) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কর্মচারী ID পাওয়া যায়নি',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'যাচাইকরণ ত্রুটি',
        text: 'অনুগ্রহ করে সব আবশ্যক ক্ষেত্র সঠিকভাবে পূরণ করুন।',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare payload with proper data types
      const payload = {
        name: String(formData.name).trim(),
        position: String(formData.position).trim(),
        phone: String(formData.phone).trim(),
        email: formData.email ? String(formData.email).trim() : '',
        address: formData.address ? String(formData.address).trim() : '',
        joinDate: String(formData.joinDate),
        salary: Number(formData.salary) || 0,
        workHours: formData.workHours ? Number(formData.workHours) : 0,
        status: formData.status || 'active',
        notes: formData.notes ? String(formData.notes).trim() : '',
        image: formData.image ? String(formData.image).trim() : ''
      };

      const response = await fetch(`/api/miraj-industries/farm-employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: 'কর্মচারী সফলভাবে আপডেট করা হয়েছে।',
          confirmButtonColor: '#10B981',
          timer: 2000
        });
        router.push(`/miraj-industries/employee/${id}`);
      } else {
        throw new Error(data.error || data.message || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Update employee error:', error);
      
      // Extract detailed error message
      let errorMessage = 'কর্মচারী আপডেট করতে সমস্যা হয়েছে';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        html: `<div style="text-align: left;">
          <p><strong>${errorMessage}</strong></p>
        </div>`,
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        width: '500px'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.push(`/miraj-industries/employee/${id}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleGoBack} 
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              ফিরে যান
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">কর্মচারী সম্পাদনা করুন</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">কর্মচারীর তথ্য আপডেট করুন</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ছবি</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {imagePreview || formData.image ? (
                    <div className="relative">
                      <label className="cursor-pointer">
                        <img
                          src={imagePreview || formData.image}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700 hover:opacity-80 transition-opacity"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: '' }));
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        title="ছবি সরান"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-blue-500 transition-colors">
                        {uploadingImage ? (
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {imagePreview || formData.image 
                      ? 'ছবি পরিবর্তন করতে ছবিতে ক্লিক করুন (সর্বোচ্চ ৫MB)' 
                      : 'ছবি আপলোড করুন (সর্বোচ্চ ৫MB)'}
                  </p>
                  {!imagePreview && !formData.image && (
                    <label className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <Camera className="w-4 h-4" />
                      ছবি নির্বাচন করুন
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  )}
                  {imagePreview || formData.image ? (
                    <label className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-blue-600 dark:text-blue-400">
                      <Camera className="w-4 h-4" />
                      ছবি পরিবর্তন করুন
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="কর্মচারীর নাম"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  পদ <span className="text-red-500">*</span>
                </label>
                <select
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.position ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                >
                  <option value="">পদ নির্বাচন করুন</option>
                  {positionOptions.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
                {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ফোন নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="ফোন নম্বর"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ইমেইল</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ইমেইল ঠিকানা"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ঠিকানা</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ঠিকানা"
                />
              </div>

              {/* Join Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  যোগদান তারিখ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="joinDate"
                  required
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.joinDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                {errors.joinDate && <p className="text-red-500 text-xs mt-1">{errors.joinDate}</p>}
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  বেতন (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="salary"
                  required
                  min="0"
                  step="0.01"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.salary ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="মাসিক বেতন"
                />
                {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary}</p>}
              </div>

              {/* Work Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  কাজের সময় (ঘণ্টা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="workHours"
                  required
                  min="0"
                  step="0.5"
                  value={formData.workHours}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.workHours ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="প্রতিদিনের কাজের সময়"
                />
                {errors.workHours && <p className="text-red-500 text-xs mt-1">{errors.workHours}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">অবস্থা</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="অতিরিক্ত তথ্য"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleGoBack}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploadingImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditEmployee;
