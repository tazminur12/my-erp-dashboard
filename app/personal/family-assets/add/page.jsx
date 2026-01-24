'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import { ArrowLeft, Save, Building, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const AddFamilyAsset = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    providerCompanyId: '',
    providerCompanyName: '',
    totalPaidAmount: '',
    paymentType: 'one-time',
    paymentDate: '',
    purchaseDate: '',
    status: 'active',
    notes: '',
    numberOfInstallments: '',
    installmentAmount: '',
    installmentStartDate: '',
    installmentEndDate: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formData.paymentType === 'installment' && formData.installmentStartDate && formData.numberOfInstallments) {
      const startDate = new Date(formData.installmentStartDate);
      const months = parseInt(formData.numberOfInstallments) || 0;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months - 1);
      setFormData(prev => ({
        ...prev,
        installmentEndDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.paymentType, formData.installmentStartDate, formData.numberOfInstallments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'সম্পদের নাম আবশ্যক';
    if (!formData.type) newErrors.type = 'সম্পদের ধরণ নির্বাচন করুন';
    if (!formData.totalPaidAmount || parseFloat(formData.totalPaidAmount) <= 0) {
      newErrors.totalPaidAmount = 'মোট পরিশোধিত মূল্য আবশ্যক এবং ০ এর চেয়ে বেশি হতে হবে';
    }
    if (formData.paymentType === 'one-time') {
      if (!formData.paymentDate) newErrors.paymentDate = 'পরিশোধের তারিখ আবশ্যক';
    } else if (formData.paymentType === 'installment') {
      if (!formData.numberOfInstallments || parseInt(formData.numberOfInstallments) <= 0) {
        newErrors.numberOfInstallments = 'কিস্তির সংখ্যা আবশ্যক';
      }
      if (!formData.installmentAmount || parseFloat(formData.installmentAmount) <= 0) {
        newErrors.installmentAmount = 'প্রতি কিস্তির পরিমাণ আবশ্যক';
      }
      if (!formData.installmentStartDate) newErrors.installmentStartDate = 'কিস্তি শুরু তারিখ আবশ্যক';
    }
    if (!formData.purchaseDate) newErrors.purchaseDate = 'সম্পদ ক্রয়ের তারিখ আবশ্যক';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({ title: 'ত্রুটি!', text: 'অনুগ্রহ করে সব আবশ্যক ক্ষেত্র পূরণ করুন', icon: 'error', confirmButtonText: 'ঠিক আছে', confirmButtonColor: '#EF4444' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        providerCompanyId: formData.providerCompanyId || null,
        providerCompanyName: (formData.providerCompanyName || '').trim(),
        totalPaidAmount: parseFloat(formData.totalPaidAmount),
        paymentType: formData.paymentType,
        purchaseDate: formData.purchaseDate,
        status: formData.status,
        notes: formData.notes.trim(),
        ...(formData.paymentType === 'one-time' && { paymentDate: formData.paymentDate }),
        ...(formData.paymentType === 'installment' && {
          numberOfInstallments: parseInt(formData.numberOfInstallments),
          installmentAmount: parseFloat(formData.installmentAmount),
          installmentStartDate: formData.installmentStartDate,
          installmentEndDate: formData.installmentEndDate
        })
      };
      
      const response = await fetch('/api/family-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'সম্পদ যোগ করতে সমস্যা হয়েছে');
      }
      
      Swal.fire({ title: 'সফল!', text: 'পারিবারিক সম্পদ সফলভাবে যোগ করা হয়েছে', icon: 'success', confirmButtonText: 'ঠিক আছে', confirmButtonColor: '#10B981' });
      router.push('/personal/family-assets');
    } catch (error) {
      const msg = error?.message || 'সম্পদ যোগ করতে সমস্যা হয়েছে';
      Swal.fire({ title: 'ত্রুটি!', text: msg, icon: 'error', confirmButtonText: 'ঠিক আছে', confirmButtonColor: '#EF4444' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/personal/family-assets"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">নতুন সম্পদ যোগ করুন</h1>
              <p className="text-gray-600 dark:text-gray-400">পারিবারিক সম্পদের তথ্য পূরণ করুন</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সম্পদের নাম <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="যেমন: গাড়ি, ফ্রিজ, টিভি"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সম্পদের ধরণ <span className="text-red-500">*</span></label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">ধরণ নির্বাচন করুন</option>
              <option value="Office Equipment">অফিস সরঞ্জাম</option>
              <option value="Vehicle">যানবাহন</option>
              <option value="Furniture">আসবাবপত্র</option>
              <option value="IT Equipment">আইটি সরঞ্জাম</option>
              <option value="Other">অন্যান্য</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রোভাইডার / সরবরাহকারী (ঐচ্ছিক)</label>
            <input
              type="text"
              name="providerCompanyName"
              value={formData.providerCompanyName}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="দোকান বা কোম্পানির নাম"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মোট পরিশোধিত মূল্য (BDT) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
              <input
                type="number"
                name="totalPaidAmount"
                value={formData.totalPaidAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors.totalPaidAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="85000"
              />
            </div>
            {errors.totalPaidAmount && <p className="mt-1 text-sm text-red-600">{errors.totalPaidAmount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">পরিশোধের ধরন <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentType: 'one-time', numberOfInstallments: '', installmentAmount: '', installmentStartDate: '', installmentEndDate: '' }))}
                className={`px-4 py-3 rounded-lg font-medium transition-all border-2 ${formData.paymentType === 'one-time' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                এককালীন পরিশোধ
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentType: 'installment', paymentDate: '' }))}
                className={`px-4 py-3 rounded-lg font-medium transition-all border-2 ${formData.paymentType === 'installment' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                কিস্তি
              </button>
            </div>
          </div>

          {formData.paymentType === 'one-time' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">পরিশোধের তারিখ <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors.paymentDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.paymentDate && <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>}
            </div>
          )}

          {formData.paymentType === 'installment' && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">কিস্তির তথ্য</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মোট কিস্তির সংখ্যা <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="numberOfInstallments"
                    value={formData.numberOfInstallments}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.numberOfInstallments ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="12"
                  />
                  {errors.numberOfInstallments && <p className="mt-1 text-sm text-red-600">{errors.numberOfInstallments}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রতি কিস্তির পরিমাণ (BDT) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                    <input
                      type="number"
                      name="installmentAmount"
                      value={formData.installmentAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.installmentAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="7083.33"
                    />
                  </div>
                  {errors.installmentAmount && <p className="mt-1 text-sm text-red-600">{errors.installmentAmount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">কিস্তি শুরু তারিখ <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="installmentStartDate"
                    value={formData.installmentStartDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.installmentStartDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {errors.installmentStartDate && <p className="mt-1 text-sm text-red-600">{errors.installmentStartDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">কিস্তি শেষ তারিখ</label>
                  <input
                    type="date"
                    name="installmentEndDate"
                    value={formData.installmentEndDate}
                    readOnly
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">স্বয়ংক্রিয়ভাবে গণনা করা হবে</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সম্পদ ক্রয়ের তারিখ <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.purchaseDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.purchaseDate && <p className="mt-1 text-sm text-red-600">{errors.purchaseDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সম্পদের স্ট্যাটাস <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                className={`px-4 py-3 rounded-lg font-medium transition-all border-2 ${formData.status === 'active' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                সক্রিয়
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                className={`px-4 py-3 rounded-lg font-medium transition-all border-2 ${formData.status === 'inactive' ? 'bg-gray-600 text-white border-gray-600 shadow-md' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                নিষ্ক্রিয়
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">নোট / মন্তব্য</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="সম্পদ সম্পর্কে অতিরিক্ত তথ্য (ঐচ্ছিক)"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/personal/family-assets"
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              বাতিল
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  সংরক্ষণ করা হচ্ছে...
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

export default AddFamilyAsset;
