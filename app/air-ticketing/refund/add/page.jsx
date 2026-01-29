'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import { ArrowLeft, Save, RotateCcw, Loader2, Search } from 'lucide-react';

const AddRefund = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    ticketNumber: '',
    pnr: '',
    passengerName: '',
    customerName: '',
    actualFare: 0,
    usedAmount: 0,
    serviceCharge: 0,
    airlinesPenalty: 0,
    refundAmount: 0,
    reason: '',
    status: 'Pending'
  });

  // Calculate total refund whenever fields change
  useEffect(() => {
    const total = 
      (parseFloat(formData.actualFare) || 0) - 
      (parseFloat(formData.usedAmount) || 0) - 
      (parseFloat(formData.serviceCharge) || 0) - 
      (parseFloat(formData.airlinesPenalty) || 0);
    
    setFormData(prev => ({
      ...prev,
      refundAmount: total > 0 ? total : 0
    }));
  }, [formData.actualFare, formData.usedAmount, formData.serviceCharge, formData.airlinesPenalty]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchTicket = async () => {
    if (!formData.ticketNumber) {
      Swal.fire({
        icon: 'warning',
        title: 'টিকেট নম্বর প্রয়োজন',
        text: 'অনুগ্রহ করে টিকেট নম্বর লিখুন',
      });
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/air-tickets?search=${formData.ticketNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        const ticket = data.tickets && data.tickets.length > 0 ? data.tickets[0] : null;

        if (ticket) {
          setFormData(prev => ({
            ...prev,
            ticketNumber: ticket.ticketId || ticket.ticketNumber,
            pnr: ticket.airlinePnr || ticket.gdsPnr || prev.pnr,
            passengerName: ticket.passengerName || ticket.customerName || prev.passengerName,
            customerName: ticket.customerName || prev.customerName,
            actualFare: ticket.customerPaid || ticket.totalPrice || 0
          }));
          
          Swal.fire({
            icon: 'success',
            title: 'পাওয়া গেছে',
            text: `টিকেট: ${ticket.ticketId}`,
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'পাওয়া যায়নি',
            text: 'এই নম্বরে কোনো টিকেট পাওয়া যায়নি',
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: 'অনুসন্ধান করতে সমস্যা হয়েছে',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/air-ticketing/refund', {
        method: 'POST',
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
          text: 'রিফান্ড রিকোয়েস্ট সফলভাবে তৈরি হয়েছে',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          router.push('/air-ticketing/refund');
        });
      } else {
        throw new Error(data.error || 'Failed to create refund');
      }
    } catch (error) {
      console.error('Error creating refund:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: error.message || 'রিফান্ড তৈরি করতে সমস্যা হয়েছে',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-6 h-6 text-indigo-600" />
                নতুন রিফান্ড যোগ করুন
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                এয়ার টিকেট রিফান্ড রিকোয়েস্ট ফর্ম
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
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      টিকেট নম্বর <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="ticketNumber"
                        required
                        value={formData.ticketNumber}
                        onChange={handleInputChange}
                        placeholder="টিকেট নম্বর লিখুন"
                        className="w-full pl-4 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleSearchTicket}
                        disabled={searching}
                        className="absolute right-1 top-1 p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        title="অনুসন্ধান করুন"
                      >
                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">টিকেট নম্বর লিখে সার্চ বাটনে ক্লিক করুন</p>
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

              {/* Refund Calculation Section (Table Layout) */}
              <div className="md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">রিফান্ড ক্যালকুলেশন</h3>
                
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-center">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Actual Fare</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Used Amount</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Service Fees</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Airlines Penalty</th>
                        <th className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/20">Total Refundable Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="p-2">
                          <div className="relative">
                            <input
                              type="number"
                              name="actualFare"
                              min="0"
                              step="0.01"
                              value={formData.actualFare}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">BDT</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="relative">
                            <input
                              type="number"
                              name="usedAmount"
                              min="0"
                              step="0.01"
                              value={formData.usedAmount}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">BDT</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="relative">
                            <input
                              type="number"
                              name="serviceCharge"
                              min="0"
                              step="0.01"
                              value={formData.serviceCharge}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">BDT</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="relative">
                            <input
                              type="number"
                              name="airlinesPenalty"
                              min="0"
                              step="0.01"
                              value={formData.airlinesPenalty}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">BDT</span>
                          </div>
                        </td>
                        <td className="p-2 bg-indigo-50 dark:bg-indigo-900/20">
                          <div className="font-bold text-lg text-indigo-700 dark:text-indigo-300 text-center">
                            {formData.refundAmount.toFixed(2)} BDT
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Refund Info Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">রিফান্ড বিস্তারিত</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                    সেভ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    সেভ করুন
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

export default AddRefund;
