'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../component/DashboardLayout';
import { ArrowLeft, Save, RefreshCw, Loader2, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';

const EditReissue = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [vendors, setVendors] = useState([]);
  
  const [formData, setFormData] = useState({
    ticketNumber: '',
    pnr: '',
    passengerName: '',
    vendorId: '',
    vendorName: '',
    fareDifference: 0,
    taxDifference: 0,
    serviceFee: 0,
    airlinesPenalty: 0,
    totalCharge: 0,
    status: 'Pending',
    remarks: ''
  });

  // Fetch vendors and reissue data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch vendors
        const vendorsRes = await fetch('/api/vendors?limit=100');
        if (vendorsRes.ok) {
          const data = await vendorsRes.json();
          setVendors(data.vendors || []);
        }

        // Fetch reissue data
        if (id) {
          const response = await fetch(`/api/air-ticketing/reissue/${id}`);
          const result = await response.json();

          if (response.ok) {
            setFormData({
              ticketNumber: result.data.ticketNumber || '',
              pnr: result.data.pnr || '',
              passengerName: result.data.passengerName || '',
              vendorId: result.data.vendorId || '',
              vendorName: result.data.vendorName || '',
              fareDifference: result.data.fareDifference || 0,
              taxDifference: result.data.taxDifference || 0,
              serviceFee: result.data.serviceFee || 0,
              airlinesPenalty: result.data.airlinesPenalty || 0,
              totalCharge: result.data.totalCharge || 0,
              status: result.data.status || 'Pending',
              remarks: result.data.remarks || ''
            });
          } else {
            throw new Error(result.error || 'Failed to fetch reissue data');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'ত্রুটি!',
          text: 'ডাটা লোড করতে সমস্যা হয়েছে',
        });
        router.push('/air-ticketing/reissue');
      } finally {
        setFetching(false);
      }
    };

    fetchInitialData();
  }, [id, router]);

  // Calculate total whenever charges change
  useEffect(() => {
    const total = 
      (parseFloat(formData.fareDifference) || 0) + 
      (parseFloat(formData.taxDifference) || 0) + 
      (parseFloat(formData.serviceFee) || 0) + 
      (parseFloat(formData.airlinesPenalty) || 0);
    
    setFormData(prev => ({
      ...prev,
      totalCharge: total
    }));
  }, [formData.fareDifference, formData.taxDifference, formData.serviceFee, formData.airlinesPenalty]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'vendorId') {
      const selectedVendor = vendors.find(v => v._id === value);
      if (selectedVendor) {
        setFormData(prev => ({
          ...prev,
          vendorName: selectedVendor.name
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/air-ticketing/reissue/${id}`, {
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
          text: 'রিইস্যু তথ্য আপডেট করা হয়েছে',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          router.push('/air-ticketing/reissue');
        });
      } else {
        throw new Error(data.error || 'Failed to update reissue');
      }
    } catch (error) {
      console.error('Error updating reissue:', error);
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
                <RefreshCw className="w-6 h-6 text-indigo-600" />
                রিইস্যু সম্পাদনা
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                এয়ার টিকেট রিইস্যু তথ্য পরিবর্তন করুন
              </p>
            </div>
            <Link
              href="/air-ticketing/reissue"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      যাত্রীর নাম
                    </label>
                    <input
                      type="text"
                      name="passengerName"
                      value={formData.passengerName}
                      onChange={handleInputChange}
                      placeholder="যাত্রীর নাম"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ভেন্ডর নির্বাচন করুন
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        name="vendorId"
                        value={formData.vendorId}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">ভেন্ডর নির্বাচন করুন...</option>
                        {vendors.map((vendor) => (
                          <option key={vendor._id} value={vendor._id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reissue Charges Section (Table Layout) */}
              <div className="md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">রিইস্যু চার্জের বিবরণ</h3>
                
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-center">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Difference of fare</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Tax Difference</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Service fee</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Airlines Penalty</th>
                        <th className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/20">Total Reissued charge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="p-2">
                          <div className="relative">
                            <input
                              type="number"
                              name="fareDifference"
                              min="0"
                              step="0.01"
                              value={formData.fareDifference}
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
                              name="taxDifference"
                              min="0"
                              step="0.01"
                              value={formData.taxDifference}
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
                              name="serviceFee"
                              min="0"
                              step="0.01"
                              value={formData.serviceFee}
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
                            {formData.totalCharge.toFixed(2)} BDT
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status & Remarks */}
              <div className="md:col-span-2">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      মন্তব্য (Remarks)
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="কোনো মন্তব্য থাকলে লিখুন..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <Link
                href="/air-ticketing/reissue"
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

export default EditReissue;
