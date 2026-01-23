'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../../component/DashboardLayout';
import Swal from 'sweetalert2';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building,
  DollarSign,
  FileText,
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../../../config/cloudinary';

const AddEmployee = () => {
  const router = useRouter();
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState(null);

  // Validate Cloudinary configuration on component mount
  useEffect(() => {
    if (!validateCloudinaryConfig()) {
      console.error('Cloudinary configuration is invalid. File uploads may not work properly.');
    }
  }, []);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setBranchesLoading(true);
        const response = await fetch('/api/branches');
        const data = await response.json();
        
        if (response.ok) {
          setBranches(data.branches || []);
        } else {
          throw new Error(data.error || 'Failed to fetch branches');
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranchesError(error);
        // Use mock data on error
        setBranches([
          { id: '1', name: 'Dhaka Branch', branchName: 'Dhaka Branch' },
          { id: '2', name: 'Chittagong Branch', branchName: 'Chittagong Branch' },
          { id: '3', name: 'Sylhet Branch', branchName: 'Sylhet Branch' },
          { id: '4', name: 'Rajshahi Branch', branchName: 'Rajshahi Branch' }
        ]);
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Cloudinary Upload Function for Images
  const uploadToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }
      
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'employees');
      
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    emergencyPhone: '',
    employeeId: '',
    position: '',
    department: '',
    manager: '',
    joinDate: '',
    employmentType: '',
    workLocation: '',
    branch: '',
    basicSalary: '',
    allowances: '',
    benefits: '',
    bankAccount: '',
    bankName: '',
    profilePicture: null,
    profilePictureUrl: '',
    nidCopy: null,
    nidCopyUrl: '',
    otherDocuments: []
  });

  const [errors, setErrors] = useState({});
  const [uploadStates, setUploadStates] = useState({
    profilePicture: { uploading: false, success: false, error: null },
    nidCopy: { uploading: false, success: false, error: null }
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const departments = [
    'Human Resources',
    'Information Technology',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
    'Customer Service',
    'Legal',
    'Administration'
  ];

  const employmentTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Intern',
    'Consultant'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (!file) return;

    if (name === 'profilePicture') {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      
      setUploadStates(prev => ({
        ...prev,
        [name]: { uploading: true, success: false, error: null }
      }));

      try {
        const uploadResult = await uploadToCloudinary(file);

        setFormData(prev => ({
          ...prev,
          profilePicture: uploadResult.secure_url,
          profilePictureUrl: uploadResult.secure_url
        }));

        setUploadStates(prev => ({
          ...prev,
          [name]: { uploading: false, success: true, error: null }
        }));

      } catch (error) {
        console.error(`Upload error for ${name}:`, error);
        
        let errorMessage = 'আপলোড ব্যর্থ';
        if (error.message.includes('configuration')) {
          errorMessage = 'আপলোড পরিষেবা কনফিগার করা নেই। অনুগ্রহ করে প্রশাসকের সাথে যোগাযোগ করুন।';
        } else if (error.message.includes('size')) {
          errorMessage = 'ফাইল খুব বড়। অনুগ্রহ করে একটি ছোট ফাইল নির্বাচন করুন।';
        } else if (error.message.includes('valid image')) {
          errorMessage = 'অনুগ্রহ করে একটি বৈধ ছবি ফাইল নির্বাচন করুন।';
        }
        
        setUploadStates(prev => ({
          ...prev,
          [name]: { uploading: false, success: false, error: errorMessage }
        }));
      }
      return;
    }

    if (name === 'nidCopy') {
      setUploadStates(prev => ({
        ...prev,
        [name]: { uploading: true, success: false, error: null }
      }));

      try {
        const uploadResult = await uploadToCloudinary(file);

        setFormData(prev => ({
          ...prev,
          nidCopy: uploadResult.secure_url,
          nidCopyUrl: uploadResult.secure_url
        }));

        setUploadStates(prev => ({
          ...prev,
          [name]: { uploading: false, success: true, error: null }
        }));

      } catch (error) {
        console.error(`Upload error for ${name}:`, error);
        
        let errorMessage = 'আপলোড ব্যর্থ';
        if (error.message.includes('configuration')) {
          errorMessage = 'আপলোড পরিষেবা কনফিগার করা নেই। অনুগ্রহ করে প্রশাসকের সাথে যোগাযোগ করুন।';
        } else if (error.message.includes('size')) {
          errorMessage = 'ফাইল খুব বড়। অনুগ্রহ করে একটি ছোট ফাইল নির্বাচন করুন।';
        } else if (error.message.includes('valid image')) {
          errorMessage = 'অনুগ্রহ করে একটি বৈধ ছবি ফাইল নির্বাচন করুন।';
        }
        
        setUploadStates(prev => ({
          ...prev,
          [name]: { uploading: false, success: false, error: errorMessage }
        }));
      }
      return;
    }
  };

    const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'প্রথম নাম প্রয়োজন';
    if (!formData.lastName.trim()) newErrors.lastName = 'শেষ নাম প্রয়োজন';
    if (!formData.email.trim()) newErrors.email = 'ইমেইল প্রয়োজন';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'ইমেইল সঠিক নয়';
    if (!formData.phone.trim()) newErrors.phone = 'ফোন নম্বর প্রয়োজন';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'কর্মচারী আইডি প্রয়োজন';
    if (!formData.position.trim()) newErrors.position = 'পদবী প্রয়োজন';
    if (!formData.department) newErrors.department = 'বিভাগ প্রয়োজন';
    if (!formData.branch) newErrors.branch = 'শাখা প্রয়োজন';
    if (!formData.joinDate) newErrors.joinDate = 'যোগদানের তারিখ প্রয়োজন';
    if (!formData.basicSalary) newErrors.basicSalary = 'মূল বেতন প্রয়োজন';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'যাচাইকরণ ত্রুটি',
        text: 'অনুগ্রহ করে সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন।',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create employee');
      }

      const data = await response.json();
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'কর্মচারী যোগ করা হয়েছে!',
        text: 'কর্মচারী সফলভাবে তৈরি করা হয়েছে।',
        confirmButtonColor: '#3b82f6',
      }).then(() => {
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          dateOfBirth: '',
          gender: '',
          emergencyContact: '',
          emergencyPhone: '',
          employeeId: '',
          position: '',
          department: '',
          manager: '',
          joinDate: '',
          employmentType: '',
          workLocation: '',
          branch: '',
          basicSalary: '',
          allowances: '',
          benefits: '',
          bankAccount: '',
          bankName: '',
          profilePicture: null,
          profilePictureUrl: '',
          nidCopy: null,
          nidCopyUrl: '',
          otherDocuments: []
        });
        
        setUploadStates({
          profilePicture: { uploading: false, success: false, error: null },
          nidCopy: { uploading: false, success: false, error: null }
        });
        
        setImagePreview(null);
        
        // Navigate to employee list
        router.push('/office-management/hr/employee/list');
      });
      
    } catch (error) {
      console.error('Error adding employee:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: error.message || 'কর্মচারী তৈরি করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">নতুন কর্মচারী যোগ করুন</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">নিচে কর্মচারীর বিস্তারিত তথ্য দিন</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                ব্যক্তিগত তথ্য
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    নাম (প্রথম অংশ) *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="প্রথম নাম লিখুন"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    নাম (শেষ অংশ) *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="শেষ নাম লিখুন"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ইমেইল ঠিকানা *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="ইমেইল ঠিকানা লিখুন"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ফোন নম্বর *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="ফোন নম্বর লিখুন"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ঠিকানা
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="সম্পূর্ণ ঠিকানা লিখুন"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">লিঙ্গ নির্বাচন করুন</option>
                    <option value="male">পুরুষ</option>
                    <option value="female">মহিলা</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    জরুরি যোগাযোগ
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="জরুরি যোগাযোগের নাম"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    জরুরি ফোন
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="জরুরি যোগাযোগের ফোন"
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                চাকরির তথ্য
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    কর্মচারী আইডি *
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.employeeId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="কর্মচারী আইডি লিখুন"
                  />
                  {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    পদবী *
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.position ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="পদবী লিখুন"
                  />
                  {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    বিভাগ *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.department ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">বিভাগ নির্বাচন করুন</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ম্যানেজার
                  </label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ম্যানেজারের নাম লিখুন"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    যোগদানের তারিখ *
                  </label>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.joinDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.joinDate && <p className="text-red-500 text-sm mt-1">{errors.joinDate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    চাকরির ধরন
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">চাকরির ধরন নির্বাচন করুন</option>
                    {employmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    শাখা *
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.branch ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } ${branchesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={branchesLoading}
                  >
                    <option value="" className="text-gray-500">
                      {branchesLoading ? 'শাখা লোড হচ্ছে...' : 'শাখা নির্বাচন করুন'}
                    </option>
                    {branches && branches.length > 0 ? (
                      branches.map(branch => (
                        <option 
                          key={branch.id || branch._id} 
                          value={branch.id || branch._id}
                          className="text-gray-900 dark:text-white"
                        >
                          {branch.name || branch.branchName || branch.title}
                        </option>
                      ))
                    ) : (
                      !branchesLoading && (
                        <option value="" disabled className="text-gray-500">
                          কোন শাখা পাওয়া যায়নি
                        </option>
                      )
                    )}
                  </select>
                  {errors.branch && <p className="text-red-500 text-sm mt-1">{errors.branch}</p>}
                  {branchesError && (
                    <p className="text-red-500 text-sm mt-1">
                      শাখা লোড করতে ত্রুটি: {branchesError.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    কাজের স্থান
                  </label>
                  <input
                    type="text"
                    name="workLocation"
                    value={formData.workLocation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="কাজের স্থান লিখুন"
                  />
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                বেতন তথ্য
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    মূল বেতন *
                  </label>
                  <input
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.basicSalary ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="মূল বেতন লিখুন"
                  />
                  {errors.basicSalary && <p className="text-red-500 text-sm mt-1">{errors.basicSalary}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ভাতা
                  </label>
                  <input
                    type="number"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ভাতা লিখুন"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    সুবিধা
                  </label>
                  <input
                    type="text"
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="সুবিধা লিখুন"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ব্যাংক একাউন্ট নম্বর
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ব্যাংক একাউন্ট নম্বর লিখুন"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ব্যাংকের নাম
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ব্যাংকের নাম লিখুন"
                  />
                </div>
              </div>
            </div>

            {/* Documents Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                কাগজপত্র
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    প্রোফাইল ছবি
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    uploadStates.profilePicture.uploading 
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                      : uploadStates.profilePicture.success 
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                      : uploadStates.profilePicture.error 
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <input
                      type="file"
                      name="profilePicture"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp,image/gif,image/bmp,image/tiff"
                      className="hidden"
                      id="profilePicture"
                      disabled={uploadStates.profilePicture.uploading}
                    />
                    <label htmlFor="profilePicture" className={`cursor-pointer ${uploadStates.profilePicture.uploading ? 'cursor-not-allowed' : ''}`}>
                      {uploadStates.profilePicture.uploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-blue-600 dark:text-blue-400">আপলোড হচ্ছে...</p>
                        </>
                      ) : uploadStates.profilePicture.success ? (
                        <>
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-green-600 dark:text-green-400">আপলোড সফল!</p>
                          {(formData.profilePictureUrl || imagePreview) && (
                            <img 
                              src={formData.profilePictureUrl || imagePreview} 
                              alt="Profile preview" 
                              className="w-16 h-16 rounded-full mx-auto mt-2 object-cover"
                            />
                          )}
                        </>
                      ) : uploadStates.profilePicture.error ? (
                        <>
                          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-red-600 dark:text-red-400">আপলোড ব্যর্থ</p>
                          <p className="text-xs text-red-500 dark:text-red-400 mt-1">{uploadStates.profilePicture.error}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">প্রোফাইল ছবি আপলোড করতে ক্লিক করুন</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">সমর্থিত: JPG, PNG, HEIC, WebP, GIF, BMP, TIFF</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    জাতীয় পরিচয়পত্রের কপি
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    uploadStates.nidCopy.uploading 
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                      : uploadStates.nidCopy.success 
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                      : uploadStates.nidCopy.error 
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <input
                      type="file"
                      name="nidCopy"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="nidCopy"
                      disabled={uploadStates.nidCopy.uploading}
                    />
                    <label htmlFor="nidCopy" className={`cursor-pointer ${uploadStates.nidCopy.uploading ? 'cursor-not-allowed' : ''}`}>
                      {uploadStates.nidCopy.uploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-blue-600 dark:text-blue-400">আপলোড হচ্ছে...</p>
                        </>
                      ) : uploadStates.nidCopy.success ? (
                        <>
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-green-600 dark:text-green-400">আপলোড সফল!</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">জাতীয় পরিচয়পত্রের কপি আপলোড করা হয়েছে</p>
                        </>
                      ) : uploadStates.nidCopy.error ? (
                        <>
                          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-red-600 dark:text-red-400">আপলোড ব্যর্থ</p>
                          <p className="text-xs text-red-500 dark:text-red-400 mt-1">{uploadStates.nidCopy.error}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">জাতীয় পরিচয়পত্রের কপি আপলোড করতে ক্লিক করুন</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleGoBack}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    যোগ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    কর্মচারী যোগ করুন
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

export default AddEmployee;
