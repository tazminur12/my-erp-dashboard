'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../component/DashboardLayout';
import Swal from 'sweetalert2';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const EditRefund = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    customerType: 'haji',
    customerId: '',
    customerName: '',
    amount: '',
    refundDate: '',

    reason: '',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    const fetchRefund = async () => {
      try {
        const response = await fetch(`/api/hajj-umrah/refunds/${id}`);
        if (!response.ok) throw new Error('Failed to fetch refund');
        
        const data = await response.json();
        const refund = data.refund;
        
        setFormData({
          customerType: refund.customerType || 'haji',
          customerId: refund.customerId || '',
          customerName: refund.customerName || '',
          amount: refund.amount || '',
          refundDate: refund.refundDate ? new Date(refund.refundDate).toISOString().split('T')[0] : '',

          reason: refund.reason || '',
          status: refund.status || 'pending',
          notes: refund.notes || ''
        });
      } catch (error) {
        console.error('Fetch error:', error);
        Swal.fire({
          icon: 'error',
          title: 'ত্রুটি',
          text: 'রিফান্ড তথ্য লোড করতে ব্যর্থ হয়েছে',
        });
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchRefund();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/hajj-umrah/refunds/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update refund');
      }

      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'রিফান্ড তথ্য আপডেট করা হয়েছে',
      }).then(() => {
        router.push('/hajj-umrah/refund-management');
      });
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ',
        text: 'আপডেট করতে ব্যর্থ হয়েছে',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/hajj-umrah/refund-management"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">রিফান্ড সম্পাদনা</h1>
            <p className="text-gray-600 dark:text-gray-400">রিফান্ড রিকোয়েস্ট আপডেট করুন</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                গ্রাহক তথ্য (অপরিবর্তনযোগ্য)
              </label>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">{formData.customerName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formData.customerId} ({formData.customerType})</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                রিফান্ড পরিমাণ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                রিফান্ড তারিখ
              </label>
              <input
                type="date"
                name="refundDate"
                value={formData.refundDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>



            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                স্ট্যাটাস
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">অপেক্ষমান (Pending)</option>
                <option value="approved">অনুমোদিত (Approved)</option>
                <option value="completed">সম্পন্ন (Completed)</option>
                <option value="rejected">বাতিল (Rejected)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                কারণ
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                নোট
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  আপডেট হচ্ছে...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  আপডেট করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditRefund;
