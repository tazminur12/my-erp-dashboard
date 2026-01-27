'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import { ArrowLeft, Save, Receipt, Loader2, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

const typeOptions = [
  { value: 'Regular', label: 'নিয়মিত' },
  { value: 'Irregular', label: 'অনিয়মিত' }
];

const frequencyOptions = [
  { value: 'Monthly', label: 'মাসিক' },
  { value: 'Yearly', label: 'বৎসারিক' }
];

const AddPersonalExpense = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    expenseType: 'Regular',
    frequency: 'Monthly',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.category.trim()) nextErrors.category = 'খাত লিখুন';
    if (!formData.amount) nextErrors.amount = 'টাকার পরিমাণ আবশ্যক';
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
        category: formData.category,
        expenseType: formData.expenseType,
        frequency: formData.frequency,
        amount: parseFloat(formData.amount),
        date: formData.date,
        note: formData.note?.trim()
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
      Swal.fire({ title: 'সফল!', text: 'খরচ যোগ করা হয়েছে', icon: 'success', confirmButtonColor: '#10b981' });
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
            <Receipt className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">নতুন খরচ যোগ করুন</h1>
            <p className="text-gray-600 dark:text-gray-400">খরচের বিবরণ পূরণ করুন</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                খরচের খাত <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="খরচের খাত লিখুন"
              />
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                টাকার পরিমাণ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="0.00"
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                খরচের ধরন
              </label>
              <div className="flex gap-4">
                {typeOptions.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="expenseType"
                      value={opt.value}
                      checked={formData.expenseType === opt.value}
                      onChange={handleInputChange}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ফ্রিকোয়েন্সি
              </label>
              <div className="flex gap-4">
                {frequencyOptions.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value={opt.value}
                      checked={formData.frequency === opt.value}
                      onChange={handleInputChange}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                তারিখ
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              নোট / বিবরণ
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="খরচের বিস্তারিত বিবরণ..."
            ></textarea>
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
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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

export default AddPersonalExpense;
