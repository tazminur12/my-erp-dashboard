'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../component/DashboardLayout';
import { ArrowLeft, Save, RotateCcw, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const EditRefund = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    ticketNumber: '',
    pnr: '',
    passengerName: '',
    customerName: '',
    refundAmount: '',
    serviceCharge: '',
    refundMethod: 'cash',
    reason: '',
    status: 'Pending'
  });

  useEffect(() => {
    const fetchRefund = async () => {
      try {
        const response = await fetch(`/api/air-ticketing/refund/${id}`);
        const result = await response.json();

        if (response.ok) {
          setFormData({
            ticketNumber: result.data.ticketNumber || '',
            pnr: result.data.pnr || '',
            passengerName: result.data.passengerName || '',
            customerName: result.data.customerName || '',
            refundAmount: result.data.refundAmount || '',
            serviceCharge: result.data.serviceCharge || '',
            refundMethod: result.data.refundMethod || 'cash',
            reason: result.data.reason || '',
            status: result.data.status || 'Pending'
          });
        } else {
          throw new Error(result.error || 'Failed to fetch refund data');
        }
      } catch (error) {
        console.error('Error fetching refund:', error);
        Swal.fire({
          icon: 'error',
          title: 'ত্রুটি!',
          text: 'রিফান্ড তথ্য লোড করতে সমস্যা হয়েছে',
        });
        router.push('/air-ticketing/refund');
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchRefund();
    }
  }, [id, router]);

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
      const response = await fetch(`/api/air-ticketing/refund/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: 'রিফান্ড তথ্য আপডেট করা হয়েছে',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          router.push('/air-ticketing/refund');
        });
      } else {
        throw new Error(data.error || 'Failed to update refund');
      }
    } catch (error) {
      console.error('Error updating refund:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: error.message || 'আপডেট করতে সমস্যা হয়েছে',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-6 h-6 text-indigo-600" />
                রিফান্ড সম্পাদনা
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                এয়ার টিকেট রিফান্ড তথ্য পরিবর্তন করুন
              </p>
            </div>
            <Link
              href="/air-ticketing/refund"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ফিরে যান
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ticket Info Section */}
              <div className="md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">টিকেট তথ্য</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      টিকেট নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ticketNumber"
                      required
                      value={formData.ticketNumber}
                      onChange={handleInputChange}
                      placeholder="টিকেট নম্বর লিখুন"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      PNR
                    </label>
                    <input
                      type="text"
                      name="pnr"
                      value={formData.pnr}
                      onChange={handleInputChange}
                      placeholder="PNR নম্বর"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Passenger Info Section */}
              <div className="md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">যাত্রী ও কাস্টমার</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      যাত্রীর নাম
                    </label>
                    <input
                      type="text"
                      name="passengerName"
                      value={formData.passengerName}
                      onChange={handleInputChange}
                      placeholder="যাত্রীর নাম লিখুন"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      কাস্টমার / এজেন্ট নাম
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="কাস্টমার বা এজেন্টের নাম"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Refund Info Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">রিফান্ড বিস্তারিত</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      রিফান্ড পরিমাণ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="refundAmount"
                      required
                      min="0"
                      step="0.01"
                      value={formData.refundAmount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      সার্ভিস চার্জ (যদি থাকে)
                    </label>
                    <input
                      type="number"
                      name="serviceCharge"
                      min="0"
                      step="0.01"
                      value={formData.serviceCharge}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      রিফান্ড মেথড
                    </label>
                    <select
                      name="refundMethod"
                      value={formData.refundMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="cash">নগদ (Cash)</option>
                      <option value="bank">ব্যাংক (Bank)</option>
                      <option value="adjustment">সমন্বয় (Adjustment)</option>
                      <option value="cheque">চেক (Cheque)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      স্ট্যাটাস
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Pending">অপেক্ষমান (Pending)</option>
                      <option value="Processed">সম্পন্ন (Processed)</option>
                      <option value="Rejected">বাতিল (Rejected)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      রিফান্ডের কারণ / নোট
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="রিফান্ডের কারণ লিখুন..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <Link
                href="/air-ticketing/refund"
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                বাতিল
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    আপডেট করুন
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

export default EditRefund;
