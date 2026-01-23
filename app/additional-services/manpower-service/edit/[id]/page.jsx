'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Briefcase, Search, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../../../component/DashboardLayout';
import Swal from 'sweetalert2';

const EditManpowerService = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    serviceType: 'recruitment',
    phone: '',
    email: '',
    address: '',
    appliedDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    vendorId: '',
    vendorName: '',
    vendorBill: '',
    othersBill: '',
    serviceCharge: '',
    totalBill: '',
    paidAmount: '',
    status: 'active',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Client search states
  const [clientQuery, setClientQuery] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Vendor search states
  const [vendorQuery, setVendorQuery] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorsData, setVendorsData] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      setVendorsLoading(true);
      try {
        const response = await fetch('/api/vendors');
        const data = await response.json();
        if (response.ok) {
          setVendorsData(data.vendors || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setVendorsLoading(false);
      }
    };
    fetchVendors();
  }, []);

  // Fetch existing service data
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/manpower-service/${id}`);
        const data = await response.json();

        if (response.ok) {
          const service = data.service || data.data;
          setFormData({
            clientId: service.clientId || '',
            clientName: service.clientName || service.companyName || '',
            serviceType: service.serviceType || 'recruitment',
            phone: service.phone || '',
            email: service.email || '',
            address: service.address || '',
            appliedDate: service.appliedDate || service.date || new Date().toISOString().split('T')[0],
            expectedDeliveryDate: service.expectedDeliveryDate || '',
            vendorId: service.vendorId || '',
            vendorName: service.vendorName || '',
            vendorBill: service.vendorBill || '',
            othersBill: service.othersBill || '',
            serviceCharge: service.serviceCharge || '',
            totalBill: service.totalBill || service.totalAmount || '',
            paidAmount: service.paidAmount || '',
            status: service.status || 'active',
            notes: service.notes || '',
          });
          setClientQuery(service.clientName || service.companyName || '');
          setVendorQuery(service.vendorName || '');
        } else {
          throw new Error(data.error || 'Failed to fetch manpower service');
        }
      } catch (err) {
        console.error('Error fetching manpower service:', err);
        setError(err.message || 'Failed to load manpower service');
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'ম্যানপাওয়ার সার্ভিস লোড করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        }).then(() => {
          router.push('/additional-services/manpower-service');
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [id, router]);

  // Debounced client search - Additional Services customers
  useEffect(() => {
    const q = clientQuery.trim();
    if (!q || q.length < 2) {
      setClientResults([]);
      return;
    }

    let active = true;
    setClientLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/other-customers?q=${encodeURIComponent(q)}&page=1&limit=20&status=active`);
        const data = await response.json();
        
        let list = [];
        if (response.ok) {
          list = data.customers || data.data || [];
        }

        // Additional filtering if backend doesn't filter properly
        const normalizedQ = q.toLowerCase();
        const filtered = list.filter((c) => {
          const id = String(c.id || c.customerId || c._id || '').toLowerCase();
          const name = String(c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '').toLowerCase();
          const phone = String(c.phone || c.mobile || '');
          const email = String(c.email || '').toLowerCase();
          return (
            id.includes(normalizedQ) ||
            name.includes(normalizedQ) ||
            phone.includes(q) ||
            email.includes(normalizedQ)
          );
        });

        if (active) setClientResults(filtered.slice(0, 10));
      } catch (err) {
        if (active) setClientResults([]);
      } finally {
        if (active) setClientLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [clientQuery]);

  // Filter vendors based on search query
  const filteredVendors = useMemo(() => {
    if (!vendorQuery.trim()) return vendorsData;
    const q = vendorQuery.toLowerCase();
    return vendorsData.filter((v) => {
      const tradeName = String(v.tradeName || '').toLowerCase();
      const ownerName = String(v.ownerName || '').toLowerCase();
      const contactNo = String(v.contactNo || '');
      return (
        tradeName.includes(q) ||
        ownerName.includes(q) ||
        contactNo.includes(vendorQuery)
      );
    });
  }, [vendorQuery, vendorsData]);

  // Calculate total bill
  useEffect(() => {
    const vendorBill = parseFloat(formData.vendorBill) || 0;
    const othersBill = parseFloat(formData.othersBill) || 0;
    const serviceCharge = parseFloat(formData.serviceCharge) || 0;
    const total = vendorBill + othersBill + serviceCharge;
    setFormData(prev => ({
      ...prev,
      totalBill: total.toFixed(2)
    }));
  }, [formData.vendorBill, formData.othersBill, formData.serviceCharge]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectClient = (client) => {
    const clientName = client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || '';
    setFormData(prev => ({
      ...prev,
      clientId: client.id || client.customerId || client._id,
      clientName: clientName,
      phone: client.phone || client.mobile || '',
      email: client.email || '',
      address: client.address || '',
    }));
    setClientQuery(clientName);
    setShowClientDropdown(false);
    setErrors(prev => ({ ...prev, clientName: '' }));
  };

  const handleSelectVendor = (vendor) => {
    setFormData(prev => ({
      ...prev,
      vendorId: vendor._id || vendor.vendorId,
      vendorName: vendor.tradeName || vendor.ownerName || '',
    }));
    setVendorQuery(vendor.tradeName || vendor.ownerName || '');
    setShowVendorDropdown(false);
    setErrors(prev => ({ ...prev, vendorId: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'নাম প্রয়োজন';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'নম্বর প্রয়োজন';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'ইমেইল ফরম্যাট সঠিক নয়';
    }
    if (!formData.appliedDate) {
      newErrors.appliedDate = 'আবেদনের তারিখ প্রয়োজন';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        vendorBill: formData.vendorBill ? Number(formData.vendorBill) : 0,
        othersBill: formData.othersBill ? Number(formData.othersBill) : 0,
        serviceCharge: formData.serviceCharge ? Number(formData.serviceCharge) : 0,
        totalBill: formData.totalBill ? Number(formData.totalBill) : 0,
        paidAmount: formData.paidAmount ? Number(formData.paidAmount) : 0,
        date: formData.appliedDate,
      };

      const response = await fetch(`/api/manpower-service/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'ম্যানপাওয়ার সার্ভিস সফলভাবে আপডেট করা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        router.push(`/additional-services/manpower-service/${id}`);
      } else {
        throw new Error(data.error || 'Failed to update manpower service');
      }
    } catch (error) {
      console.error('Error updating manpower service:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ম্যানপাওয়ার সার্ভিস আপডেট করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
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
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">ম্যানপাওয়ার সার্ভিস লোড করা হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => router.push('/additional-services/manpower-service')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              ফিরে যান
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push(`/additional-services/manpower-service/${id}`)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              ম্যানপাওয়ার সার্ভিসে ফিরে যান
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/20 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ম্যানপাওয়ার সার্ভিস সম্পাদনা করুন</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">নিচে ম্যানপাওয়ার সার্ভিসের তথ্য আপডেট করুন</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name - Searchable */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    নাম <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={clientQuery}
                      onChange={(e) => {
                        setClientQuery(e.target.value);
                        setShowClientDropdown(true);
                        if (!e.target.value) {
                          setFormData(prev => ({
                            ...prev,
                            clientId: '',
                            clientName: '',
                            phone: '',
                            email: '',
                            address: '',
                          }));
                        }
                      }}
                      onFocus={() => {
                        if (clientResults.length > 0 || clientQuery.length >= 2) {
                          setShowClientDropdown(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowClientDropdown(false), 200);
                      }}
                      placeholder="নাম, ID, ফোন, বা ইমেইল দিয়ে ক্লায়েন্ট খুঁজুন..."
                      className={`w-full pl-10 pr-3 py-2 border ${
                        errors.clientName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    {showClientDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                        {clientLoading ? (
                          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">খুঁজছি...</div>
                        ) : clientResults.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">কোন ক্লায়েন্ট পাওয়া যায়নি</div>
                        ) : (
                          clientResults.map((c) => {
                            const clientName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'N/A';
                            return (
                              <button
                                key={String(c.id || c.customerId || c._id)}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelectClient(c)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{clientName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {c.id || c.customerId || c._id}</div>
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">{c.phone || c.mobile}</div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                  {formData.clientName && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      নির্বাচিত: {formData.clientName}
                    </div>
                  )}
                  {errors.clientName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.clientName}</p>}
                </div>

                {/* Address - Auto filled */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ঠিকানা</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ঠিকানা (ক্লায়েন্ট থেকে স্বয়ংক্রিয়ভাবে পূরণ)"
                  />
                </div>

                {/* Number - Auto filled */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="+8801XXXXXXXXX"
                    required
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ইমেইল</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="client@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
                </div>

                {/* Applied Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    আবেদনের তারিখ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="appliedDate"
                    value={formData.appliedDate}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${
                      errors.appliedDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {errors.appliedDate && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.appliedDate}</p>}
                </div>

                {/* Expected Delivery Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">প্রত্যাশিত ডেলিভারি তারিখ</label>
                  <input
                    type="date"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    সার্ভিসের ধরন <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="recruitment">Recruitment</option>
                    <option value="placement">Placement</option>
                    <option value="training">Training</option>
                    <option value="consultation">Consultation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Select Vendor */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ভেন্ডর নির্বাচন করুন</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={vendorQuery}
                      onChange={(e) => {
                        setVendorQuery(e.target.value);
                        setShowVendorDropdown(true);
                        if (!e.target.value) {
                          setFormData(prev => ({
                            ...prev,
                            vendorId: '',
                            vendorName: '',
                          }));
                        }
                      }}
                      onFocus={() => setShowVendorDropdown(true)}
                      onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
                      placeholder="নাম বা যোগাযোগ দিয়ে ভেন্ডর খুঁজুন..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {vendorsLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      </div>
                    )}
                    {showVendorDropdown && !vendorsLoading && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredVendors.length > 0 ? (
                          filteredVendors.map((vendor) => (
                            <button
                              key={vendor._id || vendor.vendorId}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSelectVendor(vendor)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">{vendor.tradeName || vendor.ownerName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{vendor.contactNo}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">কোন ভেন্ডর পাওয়া যায়নি</div>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.vendorName && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      নির্বাচিত: {formData.vendorName}
                    </div>
                  )}
                </div>

                {/* Vendor Bill */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ভেন্ডর বিল (BDT)</label>
                  <input
                    type="number"
                    name="vendorBill"
                    value={formData.vendorBill}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Other's Bill */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">অন্যান্য বিল (BDT)</label>
                  <input
                    type="number"
                    name="othersBill"
                    value={formData.othersBill}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Service Charge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">সার্ভিস চার্জ (BDT)</label>
                  <input
                    type="number"
                    name="serviceCharge"
                    value={formData.serviceCharge}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Total Bill */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">মোট বিল (BDT)</label>
                  <input
                    type="number"
                    name="totalBill"
                    value={formData.totalBill}
                    readOnly
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-600 dark:text-gray-400 focus:outline-none cursor-not-allowed"
                    placeholder="0.00"
                  />
                </div>

                {/* Paid Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">পরিশোধিত পরিমাণ (BDT)</label>
                  <input
                    type="number"
                    name="paidAmount"
                    value={formData.paidAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">স্ট্যাটাস</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">সক্রিয়</option>
                    <option value="in_process">প্রক্রিয়াধীন</option>
                    <option value="completed">সম্পন্ন</option>
                    <option value="cancelled">বাতিল</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">নোট</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ম্যানপাওয়ার সার্ভিস সম্পর্কে অতিরিক্ত নোট"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.push(`/additional-services/manpower-service/${id}`)}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      আপডেট করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      ম্যানপাওয়ার সার্ভিস আপডেট করুন
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditManpowerService;
