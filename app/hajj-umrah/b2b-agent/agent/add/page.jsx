'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../component/DashboardLayout';
import Swal from 'sweetalert2';
import { Users, Save, RotateCcw, X, ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { uploadToCloudinary, validateCloudinaryConfig } from '../../../../../config/cloudinary';

const initialFormState = {
  tradeName: '',
  tradeLocation: '',
  ownerName: '', 
  contactNo: '',
  dob: '',
  nid: '',
  passport: '',
  profilePicture: ''
};

const AddAgent = () => {
  const router = useRouter();
  const [form, setForm] = useState(initialFormState);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);

  const errors = useMemo(() => {
    const e = {};
    if (!form.tradeName.trim()) e.tradeName = 'Trade Name is required';
    if (!form.tradeLocation.trim()) e.tradeLocation = 'Trade Location is required';
    if (!form.ownerName.trim()) e.ownerName = "Owner's Name is required";
    if (!form.contactNo.trim()) e.contactNo = 'Contact No is required';
    else {
      const phoneRegex = /^\+?[0-9\-()\s]{6,20}$/;
      if (!phoneRegex.test(form.contactNo.trim())) e.contactNo = 'Enter a valid phone number';
    }
    if (form.nid.trim()) {
      const nidRegex = /^[0-9]{8,20}$/;
      if (!nidRegex.test(form.nid.trim())) e.nid = 'NID should be 8-20 digits';
    }
    if (form.passport.trim()) {
      const passportRegex = /^[A-Za-z0-9]{6,12}$/;
      if (!passportRegex.test(form.passport.trim())) e.passport = 'Passport should be 6-12 chars';
    }
    return e;
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
    setForm(initialFormState);
    setTouched({});
    setProfilePreview(null);
  };

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate Cloudinary configuration
      if (!validateCloudinaryConfig()) {
        Swal.fire({
          icon: 'error',
          title: 'কনফিগারেশন ত্রুটি',
          text: 'Cloudinary configuration is incomplete. Please check your .env.local file.',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'ফাইল টাইপ ত্রুটি',
          text: 'অনুগ্রহ করে একটি বৈধ ছবি ফাইল নির্বাচন করুন',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'ফাইল সাইজ বড়',
          text: 'ফাইল সাইজ 5MB এর কম হতে হবে',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      // Create preview first
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Set uploading state
      setProfileUploading(true);

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file, 'agent-profiles');

      // Update form data with Cloudinary URL
      setForm(prev => ({
        ...prev,
        profilePicture: imageUrl
      }));

      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'প্রোফাইল ছবি সফলভাবে আপলোড হয়েছে।',
        confirmButtonColor: '#3b82f6',
        timer: 2000,
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'আপলোড ব্যর্থ',
        text: error.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        confirmButtonColor: '#3b82f6',
      });
      
      // Clear preview on error
      setProfilePreview(null);
    } finally {
      setProfileUploading(false);
    }
  }, []);

  const removeProfilePicture = useCallback(() => {
    setProfilePreview(null);
    setForm(prev => ({
      ...prev,
      profilePicture: ''
    }));
  }, []);

  const handleCancel = () => {
    router.push('/hajj-umrah/b2b-agent');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      tradeName: true,
      tradeLocation: true,
      ownerName: true,
      contactNo: true,
      dob: true,
      nid: true,
      passport: true
    });

    if (Object.keys(errors).length) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors before submitting.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong while saving the agent');
      }

      Swal.fire({
        icon: 'success',
        title: 'Agent Created!',
        text: 'Agent has been created successfully.',
        confirmButtonColor: '#3b82f6',
      }).then(() => {
        setForm(initialFormState);
        setTouched({});
        setProfilePreview(null);
        router.push('/hajj-umrah/b2b-agent');
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Something went wrong while saving the agent',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3">
          <Link
            href="/hajj-umrah/b2b-agent"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Add Haj & Umrah Agent
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new agent profile
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          {/* Profile Picture Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Picture
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              {profileUploading ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">আপলোড হচ্ছে...</span>
                </div>
              ) : profilePreview || form.profilePicture ? (
                <div className="flex flex-col items-center space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profilePreview || form.profilePicture}
                    alt="Profile"
                    className="max-h-48 max-w-full rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Remove Profile Picture</span>
                  </button>
                </div>
              ) : (
                <label htmlFor="profile-picture" className="block text-center cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload profile picture or drag and drop
                  </span>
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Trade Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trade Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tradeName"
                value={form.tradeName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 transition-colors ${
                  hasError('tradeName')
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter trade name"
              />
              {hasError('tradeName') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tradeName}</p>
              )}
            </div>

            {/* Trade Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trade Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tradeLocation"
                value={form.tradeLocation}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 transition-colors ${
                  hasError('tradeLocation')
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter trade location"
              />
              {hasError('tradeLocation') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tradeLocation}</p>
              )}
            </div>

            {/* Owner's Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Owner's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 transition-colors ${
                  hasError('ownerName')
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter owner's name"
              />
              {hasError('ownerName') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ownerName}</p>
              )}
            </div>

            {/* Contact No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact No <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactNo"
                value={form.contactNo}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 transition-colors ${
                  hasError('contactNo')
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="e.g. +8801XXXXXXXXX"
              />
              {hasError('contactNo') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactNo}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* NID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                NID
              </label>
              <input
                type="text"
                name="nid"
                value={form.nid}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 transition-colors ${
                  hasError('nid')
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter NID number"
                inputMode="numeric"
              />
              {hasError('nid') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nid}</p>
              )}
            </div>

            {/* Passport */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Passport
              </label>
              <input
                type="text"
                name="passport"
                value={form.passport}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 transition-colors ${
                  hasError('passport')
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter passport number"
              />
              {hasError('passport') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.passport}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />{' '}
              {loading ? 'Saving...' : 'Save Agent'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddAgent;
