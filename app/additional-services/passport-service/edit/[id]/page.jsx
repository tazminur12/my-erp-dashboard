'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, FileCheck, Search, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../../../component/DashboardLayout';
import Swal from 'sweetalert2';

const EditPassportService = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    serviceType: 'new_passport',
    phone: '',
    email: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
    expectedDeliveryDate: '',
    applicationNumber: '',
    dateOfBirth: '',
    validity: '',
    pages: '',
    deliveryType: '',
    officeContactPersonId: '',
    officeContactPersonName: '',
    passportFees: '',
    bankCharges: '',
    vendorFees: '',
    formFillupCharge: '',
    totalBill: '',
    paidAmount: '',
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
        const response = await fetch(`/api/passport-services/${id}`);
        const data = await response.json();

        if (response.ok) {
          const service = data.service || data.data;
          setFormData({
            clientId: service.clientId || '',
            clientName: service.clientName || '',
            serviceType: service.serviceType || 'new_passport',
            phone: service.phone || '',
            email: service.email || '',
            address: service.address || '',
            date: service.date || new Date().toISOString().split('T')[0],
            status: service.status || 'pending',
            notes: service.notes || '',
            expectedDeliveryDate: service.expectedDeliveryDate || '',
            applicationNumber: service.applicationNumber || '',
            dateOfBirth: service.dateOfBirth || '',
            validity: service.validity || '',
            pages: service.pages || '',
            deliveryType: service.deliveryType || '',
            officeContactPersonId: service.officeContactPersonId || '',
            officeContactPersonName: service.officeContactPersonName || '',
            passportFees: service.passportFees || '',
            bankCharges: service.bankCharges || '',
            vendorFees: service.vendorFees || '',
            formFillupCharge: service.formFillupCharge || '',
            totalBill: service.totalBill || service.totalAmount || '',
            paidAmount: service.paidAmount || '',
          });
          setClientQuery(service.clientName || '');
          setVendorQuery(service.officeContactPersonName || '');
        } else {
          throw new Error(data.error || 'Failed to fetch passport service');
        }
      } catch (err) {
        console.error('Error fetching passport service:', err);
        setError(err.message || 'Failed to load passport service');
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'পাসপোর্ট সার্ভিস লোড করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        }).then(() => {
          router.push('/additional-services/passport-service');
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
    const passportFees = parseFloat(formData.passportFees) || 0;
    const bankCharges = parseFloat(formData.bankCharges) || 0;
    const vendorFees = parseFloat(formData.vendorFees) || 0;
    const formFillupCharge = parseFloat(formData.formFillupCharge) || 0;
    const total = passportFees + bankCharges + vendorFees + formFillupCharge;
    setFormData(prev => ({
      ...prev,
      totalBill: total.toFixed(2)
    }));
  }, [formData.passportFees, formData.bankCharges, formData.vendorFees, formData.formFillupCharge]);

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
      officeContactPersonId: vendor._id || vendor.vendorId,
      officeContactPersonName: vendor.tradeName || vendor.ownerName || '',
    }));
    setVendorQuery(vendor.tradeName || vendor.ownerName || '');
    setShowVendorDropdown(false);
    setErrors(prev => ({ ...prev, officeContactPersonId: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'ক্লায়েন্টের নাম প্রয়োজন';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'নম্বর প্রয়োজন';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'ইমেইল ফরম্যাট সঠিক নয়';
    }
    if (!formData.date) {
      newErrors.date = 'তারিখ প্রয়োজন';
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
        passportFees: formData.passportFees ? Number(formData.passportFees) : 0,
        bankCharges: formData.bankCharges ? Number(formData.bankCharges) : 0,
        vendorFees: formData.vendorFees ? Number(formData.vendorFees) : 0,
        formFillupCharge: formData.formFillupCharge ? Number(formData.formFillupCharge) : 0,
        totalBill: formData.totalBill ? Number(formData.totalBill) : 0,
        paidAmount: formData.paidAmount ? Number(formData.paidAmount) : 0,
      };

      const response = await fetch(`/api/passport-services/${id}`, {
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
          text: 'পাসপোর্ট সার্ভিস সফলভাবে আপডেট করা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        router.push(`/additional-services/passport-service/${id}`);
      } else {
        throw new Error(data.error || 'Failed to update passport service');
      }
    } catch (error) {
      console.error('Error updating passport service:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'পাসপোর্ট সার্ভিস আপডেট করতে সমস্যা হয়েছে',
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
            <p className="text-gray-600 dark:text-gray-400">পাসপোর্ট সার্ভিস লোড করা হচ্ছে...</p>
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
              onClick={() => router.push('/additional-services/passport-service')}
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
              onClick={() => router.push(`/additional-services/passport-service/${id}`)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              পাসপোর্ট সার্ভিসে ফিরে যান
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">পাসপোর্ট সার্ভিস সম্পাদনা করুন</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">নিচে পাসপোর্ট সার্ভিসের তথ্য আপডেট করুন</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Name - Searchable */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    ক্লায়েন্টের নাম <span className="text-red-500">*</span>
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

                {/* Number (Phone) */}
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

                {/* Application Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">আবেদন নম্বর</label>
                  <input
                    type="text"
                    name="applicationNumber"
                    value={formData.applicationNumber}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="আবেদন নম্বর লিখুন"
                  />
                </div>

                {/* Date Of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">জন্ম তারিখ</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    তারিখ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${
                      errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {errors.date && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.date}</p>}
                </div>

                {/* Validity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">মেয়াদ</label>
                  <select
                    name="validity"
                    value={formData.validity}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">মেয়াদ নির্বাচন করুন</option>
                    <option value="05">০৫ বছর</option>
                    <option value="10">১০ বছর</option>
                  </select>
                </div>

                {/* Pages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">পৃষ্ঠা</label>
                  <select
                    name="pages"
                    value={formData.pages}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">পৃষ্ঠা নির্বাচন করুন</option>
                    <option value="48">৪৮ পৃষ্ঠা</option>
                    <option value="64">৬৪ পৃষ্ঠা</option>
                  </select>
                </div>

                {/* Delivery Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ডেলিভারির ধরন</label>
                  <select
                    name="deliveryType"
                    value={formData.deliveryType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select delivery type</option>
                    <option value="regular">Regular</option>
                    <option value="express">Express</option>
                    <option value="super_express">Super Express</option>
                  </select>
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
                    <option value="new_passport">New Passport</option>
                    <option value="renewal">Passport Renewal</option>
                    <option value="replacement">Passport Replacement</option>
                    <option value="visa_stamping">Visa Stamping</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Select Office Contact Person */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">অফিস যোগাযোগ ব্যক্তি নির্বাচন করুন</label>
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
                            officeContactPersonId: '',
                            officeContactPersonName: '',
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
                  {formData.officeContactPersonName && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      নির্বাচিত: {formData.officeContactPersonName}
                    </div>
                  )}
                </div>

                {/* Passport Fees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">পাসপোর্ট ফি (BDT)</label>
                  <input
                    type="number"
                    name="passportFees"
                    value={formData.passportFees}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Bank Charges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ব্যাংক চার্জ (BDT)</label>
                  <input
                    type="number"
                    name="bankCharges"
                    value={formData.bankCharges}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Vendor's Fees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ভেন্ডরের ফি (BDT)</label>
                  <input
                    type="number"
                    name="vendorFees"
                    value={formData.vendorFees}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Form Fillup Charge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ফরম ফিলআপ চার্জ (BDT)</label>
                  <input
                    type="number"
                    name="formFillupCharge"
                    value={formData.formFillupCharge}
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
                    <option value="pending">Pending</option>
                    <option value="in_process">In Process</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
                  placeholder="পাসপোর্ট সার্ভিস সম্পর্কে অতিরিক্ত নোট"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.push(`/additional-services/passport-service/${id}`)}
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
                      পাসপোর্ট সার্ভিস আপডেট করুন
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

export default EditPassportService;
