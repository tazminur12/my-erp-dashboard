'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import { ArrowLeft, Save, User, Camera, Loader2, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import { uploadToCloudinary } from '../../../../config/cloudinary';

const relationshipOptions = [
  { value: 'brother', label: 'ভাই' },
  { value: 'sister', label: 'বোন' },
  { value: 'aunt', label: 'ফুফি' },
  { value: 'son', label: 'ছেলে' },
  { value: 'daughter', label: 'মেয়ে' }
];

const AddPersonalExpense = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    relationship: '',
    mobile: '',
    photo: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: 'ছবি ফাইল নির্বাচন করুন' }));
      return;
    }
    try {
      setImageUploading(true);
      const uploadedUrl = await uploadToCloudinary(file, 'personal-expense');
      setFormData(prev => ({ ...prev, photo: uploadedUrl }));
      setImagePreview(uploadedUrl);
      if (errors.photo) setErrors(prev => ({ ...prev, photo: '' }));
    } catch (err) {
      setErrors(prev => ({ ...prev, photo: err.message || 'ছবি আপলোড ব্যর্থ' }));
    } finally {
      setImageUploading(false);
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'নাম আবশ্যক';
    if (!formData.relationship) nextErrors.relationship = 'সম্পর্ক নির্বাচন করুন';
    if (!formData.mobile.trim()) nextErrors.mobile = 'মোবাইল নাম্বার আবশ্যক';
    if (!formData.photo) nextErrors.photo = 'ছবি আপলোড করুন';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      Swal.fire({ title: 'ত্রুটি!', text: 'অনুগ্রহ করে সব আবশ্যক তথ্য দিন', icon: 'error', confirmButtonColor: '#ef4444' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        fatherName: formData.fatherName.trim(),
        motherName: formData.motherName.trim(),
        relationship: formData.relationship,
        mobile: formData.mobile.trim(),
        photo: formData.photo
      };
      const response = await fetch('/api/personal-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'সংরক্ষণ করতে সমস্যা হয়েছে');
      }
      Swal.fire({ title: 'সফল!', text: 'প্রোফাইল যোগ করা হয়েছে', icon: 'success', confirmButtonColor: '#10b981' });
      router.push('/personal/expense');
    } catch (err) {
      Swal.fire({ title: 'ত্রুটি!', text: err.message || 'সংরক্ষণ করতে সমস্যা হয়েছে', icon: 'error', confirmButtonColor: '#ef4444' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3">
          <Link
            href="/personal/expense"
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">নতুন Personal Expense প্রোফাইল</h1>
            <p className="text-gray-600 dark:text-gray-400">প্রয়োজনীয় তথ্য পূরণ করুন</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ছবি <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-7 h-7 text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  ছবি আপলোড করুন
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recommended: Square image, max 5MB (PNG, JPG)
                </p>
                {imageUploading && (
                  <p className="text-sm text-gray-500">ছবি আপলোড হচ্ছে...</p>
                )}
                {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">নাম <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="নাম লিখুন"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">পিতার নাম</label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="পিতার নাম লিখুন"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মাতার নাম</label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="মাতার নাম লিখুন"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">আব্দুর রশিদের সাথে সম্পর্ক <span className="text-red-500">*</span></label>
            <select
              name="relationship"
              value={formData.relationship}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors.relationship ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">সম্পর্ক নির্বাচন করুন</option>
              {relationshipOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.relationship && <p className="mt-1 text-sm text-red-600">{errors.relationship}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মোবাইল নাম্বার <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors.mobile ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="মোবাইল নাম্বার লিখুন"
            />
            {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/personal/expense"
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              বাতিল
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || imageUploading}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  সংরক্ষণ করা হচ্ছে...
                </>
              ) : imageUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ছবি আপলোড হচ্ছে...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  সংরক্ষণ করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddPersonalExpense;
