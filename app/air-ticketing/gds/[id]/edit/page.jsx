'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../component/DashboardLayout';
import { 
  Server, 
  ArrowLeft, 
  Save, 
  Loader2,
  Globe,
  Database,
  User,
  Phone,
  Mail,
  Percent,
  Key,
  FileText,
  Building2,
  Hash
} from 'lucide-react';
import Swal from 'sweetalert2';

const EditGDS = () => {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    gdsCode: '',
    provider: '',
    pccCode: '',
    queueNumber: '',
    commissionRate: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    accountId: '',
    signInId: '',
    remarks: '',
    status: 'Active'
  });

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/air-ticketing/gds/${params.id}`);
        const result = await response.json();

        if (response.ok && result.data) {
          setFormData({
            name: result.data.name || '',
            gdsCode: result.data.gdsCode || '',
            provider: result.data.provider || '',
            pccCode: result.data.pccCode || '',
            queueNumber: result.data.queueNumber || '',
            commissionRate: result.data.commissionRate?.toString() || '',
            contactPerson: result.data.contactPerson || '',
            contactPhone: result.data.contactPhone || '',
            contactEmail: result.data.contactEmail || '',
            accountId: result.data.accountId || '',
            signInId: result.data.signInId || '',
            remarks: result.data.remarks || '',
            status: result.data.status || 'Active'
          });
        } else {
          throw new Error(result.error || 'Record not found');
        }
      } catch (error) {
        console.error('Error fetching record:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'GDS লোড করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444'
        }).then(() => {
          router.push('/air-ticketing/gds');
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchRecord();
    }
  }, [params.id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gdsCode' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.provider) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'GDS নাম এবং Provider আবশ্যক',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/air-ticketing/gds/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'GDS সফলভাবে আপডেট হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981'
        }).then(() => {
          router.push(`/air-ticketing/gds/${params.id}`);
        });
      } else {
        throw new Error(result.error || 'Failed to update GDS');
      }
    } catch (error) {
      console.error('Error updating GDS:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'GDS আপডেট করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">ডাটা লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/air-ticketing/gds/${params.id}`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ফিরে যান
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Server className="w-8 h-8 text-indigo-600" />
            GDS সম্পাদনা
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {formData.name || 'GDS'} সম্পাদনা করুন
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-4xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                মৌলিক তথ্য
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GDS নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="যেমন: Amadeus Bangladesh"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provider <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Provider নির্বাচন করুন</option>
                    <option value="Amadeus">Amadeus</option>
                    <option value="Sabre">Sabre</option>
                    <option value="Galileo">Galileo</option>
                    <option value="Worldspan">Worldspan</option>
                    <option value="Travelport">Travelport</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GDS Code
                  </label>
                  <input
                    type="text"
                    name="gdsCode"
                    value={formData.gdsCode}
                    onChange={handleChange}
                    placeholder="যেমন: 1A, 1S"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PCC (Pseudo City Code)
                  </label>
                  <input
                    type="text"
                    name="pccCode"
                    value={formData.pccCode}
                    onChange={handleChange}
                    placeholder="যেমন: DAC1234"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Queue Number
                  </label>
                  <input
                    type="text"
                    name="queueNumber"
                    value={formData.queueNumber}
                    onChange={handleChange}
                    placeholder="যেমন: Q50"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      কমিশন রেট (%)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="commissionRate"
                    value={formData.commissionRate}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                অ্যাকাউন্ট তথ্য
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account ID
                  </label>
                  <input
                    type="text"
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleChange}
                    placeholder="Account ID"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sign-in ID
                  </label>
                  <input
                    type="text"
                    name="signInId"
                    value={formData.signInId}
                    onChange={handleChange}
                    placeholder="Sign-in ID"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                যোগাযোগের তথ্য
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Contact Person
                    </span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="যোগাযোগকারীর নাম"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      ফোন নম্বর
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      ইমেইল
                    </span>
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Status & Remarks */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                অন্যান্য
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    স্ট্যাটাস
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Active">সক্রিয়</option>
                    <option value="Inactive">নিষ্ক্রিয়</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    মন্তব্য / নোট
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={4}
                    placeholder="অতিরিক্ত তথ্য বা নোট..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/air-ticketing/gds/${params.id}`}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                বাতিল
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
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

export default EditGDS;
