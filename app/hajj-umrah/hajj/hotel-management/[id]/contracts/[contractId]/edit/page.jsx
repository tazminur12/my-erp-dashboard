'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../../../../component/DashboardLayout';
import { ArrowLeft, Save, X, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const ContractEdit = () => {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.id;
  const contractId = params.contractId;
  
  const [contract, setContract] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    contractType: 'হজ্ব',
    nusukAgencyId: '',
    requestNumber: '',
    hotelName: '',
    contractNumber: '',
    contractStart: '',
    contractEnd: '',
    hajjiCount: '',
    nusukPayment: '',
    cashPayment: '',
    otherBills: ''
  });

  useEffect(() => {
    if (hotelId && contractId) {
      fetchContractData();
      fetchHotelData();
      fetchLicenses();
    }
  }, [hotelId, contractId]);

  const fetchContractData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/hotel-contracts/${contractId}`);
      const data = await response.json();
      
      if (response.ok) {
        const contractData = data.contract || data.data;
        setContract(contractData);
        setFormData({
          contractType: contractData.contractType || 'হজ্ব',
          nusukAgencyId: contractData.nusukAgencyId || '',
          requestNumber: contractData.requestNumber || '',
          hotelName: contractData.hotelName || '',
          contractNumber: contractData.contractNumber || '',
          contractStart: contractData.contractStart ? new Date(contractData.contractStart).toISOString().split('T')[0] : '',
          contractEnd: contractData.contractEnd ? new Date(contractData.contractEnd).toISOString().split('T')[0] : '',
          hajjiCount: contractData.hajjiCount || '',
          nusukPayment: contractData.nusukPayment || '',
          cashPayment: contractData.cashPayment || '',
          otherBills: contractData.otherBills || ''
        });
      } else {
        throw new Error(data.error || 'Failed to fetch contract');
      }
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError(err.message || 'Failed to load contract');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHotelData = async () => {
    try {
      const response = await fetch(`/api/hotels/${hotelId}`);
      const data = await response.json();
      
      if (response.ok) {
        const hotelData = data.hotel || data.data;
        setHotel(hotelData);
        if (!formData.hotelName && hotelData.hotelName) {
          setFormData(prev => ({
            ...prev,
            hotelName: hotelData.hotelName
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching hotel:', err);
    }
  };

  const fetchLicenses = async () => {
    try {
      const response = await fetch('/api/licenses');
      const data = await response.json();
      
      if (response.ok) {
        setLicenses(data.licenses || data.data || []);
      }
    } catch (err) {
      console.error('Error fetching licenses:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const payload = {
        contractType: formData.contractType,
        nusukAgencyId: formData.nusukAgencyId,
        requestNumber: formData.requestNumber,
        hotelName: formData.hotelName,
        contractNumber: formData.contractNumber,
        contractStart: formData.contractStart,
        contractEnd: formData.contractEnd,
        hajjiCount: formData.hajjiCount,
        nusukPayment: formData.nusukPayment || 0,
        cashPayment: formData.cashPayment || 0,
        otherBills: formData.otherBills || 0
      };

      const response = await fetch(`/api/hotel-contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update contract');
      }

      Swal.fire({
        title: 'সফল!',
        text: 'হোটেল চুক্তি সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      }).then(() => {
        router.push(`/hajj-umrah/hajj/hotel-management/${hotelId}`);
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'হোটেল চুক্তি আপডেট করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/hajj/hotel-management/${hotelId}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">চুক্তি ডেটা লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contract) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">চুক্তি পাওয়া যায়নি</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">আপনি যে চুক্তি সম্পাদনা করতে চান তা বিদ্যমান নেই।</p>
            <button
              onClick={() => router.push(`/hajj-umrah/hajj/hotel-management/${hotelId}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              হোটেল বিবরণে ফিরে যান
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalBill = parseFloat(formData.nusukPayment || 0) + 
                    parseFloat(formData.cashPayment || 0) + 
                    parseFloat(formData.otherBills || 0);
  const perPersonBill = formData.hajjiCount && parseFloat(formData.hajjiCount) > 0
    ? (totalBill / parseFloat(formData.hajjiCount))
    : 0;

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  হোটেল চুক্তি সম্পাদনা করুন
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {hotel?.hotelName || 'হোটেল'} - {contract.contractNumber || 'চুক্তি'}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  হোটেল চুক্তি (হজ্ব / উমরাহ / অন্যান্য) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="হজ্ব">হজ্ব</option>
                  <option value="উমরাহ">উমরাহ</option>
                  <option value="অন্যান্য">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  নুসুক এজেন্সি <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.nusukAgencyId}
                  onChange={(e) => setFormData({ ...formData, nusukAgencyId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">নুসুক এজেন্সি নির্বাচন করুন</option>
                  {licenses.map((license) => (
                    <option key={license._id || license.id} value={license._id || license.id}>
                      {license.licenseNumber} - {license.licenseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  রিকোয়েস্ট নাম্বার <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.requestNumber}
                  onChange={(e) => setFormData({ ...formData, requestNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="রিকোয়েস্ট নাম্বার লিখুন"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  হোটেল নেম (নুসুক অনুযায়ী) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.hotelName}
                  onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="হোটেল নেম লিখুন"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  চুক্তি নাম্বার <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="চুক্তি নাম্বার লিখুন"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    চুক্তি শুরু <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.contractStart}
                    onChange={(e) => setFormData({ ...formData, contractStart: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    চুক্তি শেষ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.contractEnd}
                    onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  বেড সংখ্যা <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.hajjiCount}
                  onChange={(e) => setFormData({ ...formData, hajjiCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="বেড সংখ্যা লিখুন"
                  min="1"
                  step="1"
                  required
                />
              </div>

              {/* Payment Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">পেমেন্ট তথ্য</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      নুসুক পেমেন্ট
                    </label>
                    <input
                      type="number"
                      value={formData.nusukPayment}
                      onChange={(e) => setFormData({ ...formData, nusukPayment: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="নুসুক পেমেন্ট লিখুন"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ক্যাশ পেমেন্ট
                    </label>
                    <input
                      type="number"
                      value={formData.cashPayment}
                      onChange={(e) => setFormData({ ...formData, cashPayment: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="ক্যাশ পেমেন্ট লিখুন"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      অন্যান্য বিল
                    </label>
                    <input
                      type="number"
                      value={formData.otherBills}
                      onChange={(e) => setFormData({ ...formData, otherBills: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="অন্যান্য বিল লিখুন"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Values */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">গণনা</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">মোট বিল (নুসুক অনুযায়ী):</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {totalBill.toLocaleString('bn-BD')} ৳
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">বেডপ্রতি:</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {perPersonBill.toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>বাতিল</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContractEdit;
