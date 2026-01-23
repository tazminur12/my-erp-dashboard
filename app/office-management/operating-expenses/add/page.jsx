'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  ArrowLeft,
  Save,
  FileText,
  Scale,
  Megaphone,
  Laptop,
  CreditCard,
  Package,
  Receipt,
  RotateCcw,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

const ICONS = { FileText, Scale, Megaphone, Laptop, CreditCard, Package, Receipt, RotateCcw };
const ICON_OPTIONS = Object.keys(ICONS);

const AddCategory = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    banglaName: '',
    description: '',
    iconKey: 'FileText',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/operating-expenses/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          banglaName: form.banglaName.trim(),
          description: form.description.trim(),
          iconKey: form.iconKey,
          color: '',
          bgColor: '',
          iconColor: '',
          totalAmount: 0,
          itemCount: 0,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: 'সফল!',
          text: 'ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        router.push('/office-management/operating-expenses');
      } else {
        throw new Error(data.error || data.message || 'Failed to save. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to save. Please try again.');
      Swal.fire({
        title: 'ত্রুটি!',
        text: err?.message || 'ক্যাটাগরি তৈরি করতে ব্যর্থ হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconPreview = ICONS[form.iconKey] || FileText;

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            <button
              onClick={() => router.push('/office-management/operating-expenses')}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <IconPreview className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-200" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">নতুন ক্যাটাগরি যোগ করুন</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">পরিচালন খরচের নতুন ক্যাটাগরি তৈরি করুন</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="English name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bangla Name</label>
                  <input
                    name="banglaName"
                    value={form.banglaName}
                    onChange={onChange}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="বাংলা নাম"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={3}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  placeholder="Short description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((k) => {
                    const Icon = ICONS[k] || FileText;
                    const selected = form.iconKey === k;
                    return (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setForm((p) => ({ ...p, iconKey: k }))}
                        aria-pressed={selected}
                        className={`flex items-center justify-center h-12 rounded-lg border transition-all ${
                          selected
                            ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/40 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        title={k}
                      >
                        <Icon className={`w-5 h-5 ${selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{error}</div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>সংরক্ষণ করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/office-management/operating-expenses')}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddCategory;
