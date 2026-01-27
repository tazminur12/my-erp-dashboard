'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import { Search, Building2, User, X, Loader2, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

const CURRENCIES = [
  { code: 'USD', nameBn: 'মার্কিন ডলার' },
  { code: 'SAR', nameBn: 'সৌদি রিয়াল' },
  { code: 'EUR', nameBn: 'ইউরো' },
  { code: 'GBP', nameBn: 'ব্রিটিশ পাউন্ড' },
  { code: 'AED', nameBn: 'সংযুক্ত আরব আমিরাত দিরহাম' },
  { code: 'QAR', nameBn: 'কাতারি রিয়াল' },
  { code: 'KWD', nameBn: 'কুয়েতি দিনার' },
  { code: 'OMR', nameBn: 'ওমানি রিয়াল' },
  { code: 'JPY', nameBn: 'জাপানি ইয়েন' },
  { code: 'AUD', nameBn: 'অস্ট্রেলিয়ান ডলার' },
  { code: 'CAD', nameBn: 'কানাডিয়ান ডলার' },
  { code: 'CHF', nameBn: 'সুইস ফ্রাঙ্ক' },
  { code: 'CNY', nameBn: 'চীনা ইউয়ান' },
  { code: 'INR', nameBn: 'ভারতীয় রুপি' },
  { code: 'PKR', nameBn: 'পাকিস্তানি রুপি' },
  { code: 'SGD', nameBn: 'সিঙ্গাপুর ডলার' },
  { code: 'THB', nameBn: 'থাই বাত' },
  { code: 'MYR', nameBn: 'মালয়েশিয়ান রিঙ্গিত' },
  { code: 'BDT', nameBn: 'বাংলাদেশি টাকা' },
];

const TYPES = [
  { value: 'Buy', labelBn: 'ক্রয় (Buy)' },
  { value: 'Sell', labelBn: 'বিক্রয় (Sell)' },
];

const formatBDT = (value) =>
  new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0
  );

const CUSTOMER_TYPES = [
  { value: 'normal', labelBn: 'সাধারণ গ্রাহক (Normal Customer)' },
  { value: 'dilar', labelBn: 'ডিলার (Dealer)' },
];

const toBengaliNumeral = (num) => {
  if (num === null || num === undefined || num === '...') return num;
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const numStr = String(num);
  if (numStr.includes(',')) {
    return numStr.split(',').map(part => {
      return part.split('').map(char => {
        if (char >= '0' && char <= '9') {
          return bengaliDigits[parseInt(char)];
        }
        return char;
      }).join('');
    }).join(',');
  }
  return numStr.split('').map(char => {
    if (char >= '0' && char <= '9') {
      return bengaliDigits[parseInt(char)];
    }
    return char;
  }).join('');
};

const initialForm = {
  customerType: 'normal',
  selectedDilarId: '',
  date: new Date().toISOString().split('T')[0],
  fullName: '',
  mobileNumber: '',
  nid: '',
  type: 'Buy',
  currencyCode: 'USD',
  currencyName: 'মার্কিন ডলার',
  exchangeRate: '',
  quantity: '',
  bdtAmount: '',
  foreignAmount: '',
};

const validate = (v) => {
  const e = {};
  if (!v.date) e.date = 'তারিখ নির্বাচন করুন';
  if (!v.fullName || v.fullName.trim() === '') e.fullName = 'পূর্ণ নাম প্রয়োজন';
  if (!v.mobileNumber || v.mobileNumber.trim() === '') e.mobileNumber = 'মোবাইল নম্বর প্রয়োজন';
  if (!v.type || !TYPES.find((t) => t.value === v.type)) e.type = 'ধরণ নির্বাচন করুন';
  if (!v.currencyCode) e.currencyCode = 'কারেন্সি কোড নির্বাচন করুন';
  if (!v.currencyName) e.currencyName = 'কারেন্সির নাম নির্বাচন করুন';
  const r = Number(v.exchangeRate);
  if (!Number.isFinite(r) || r <= 0) e.exchangeRate = 'সঠিক এক্সচেঞ্জ রেট দিন (> 0)';
  const q = Number(v.quantity);
  if (!Number.isFinite(q) || q <= 0) e.quantity = 'সঠিক পরিমাণ দিন (> 0)';
  return e;
};

const Pill = ({ color = 'gray', children }) => {
  const map = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[color]}`}>{children}</span>;
};

const NewExchange = () => {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [dilarSearchTerm, setDilarSearchTerm] = useState('');
  const [showDilarDropdown, setShowDilarDropdown] = useState(false);
  const [dilars, setDilars] = useState([]);
  const [isLoadingDilars, setIsLoadingDilars] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dilars when search term changes
  useEffect(() => {
    const fetchDilars = async () => {
      if (!dilarSearchTerm.trim() || form.customerType !== 'dilar') {
        setDilars([]);
        return;
      }

      setIsLoadingDilars(true);
      try {
        const response = await fetch(`/api/money-exchange/dilars?search=${encodeURIComponent(dilarSearchTerm)}&limit=10`);
        const data = await response.json();
        if (response.ok) {
          setDilars(data.dilars || data.data || []);
        }
      } catch (err) {
        console.error('Error fetching dilars:', err);
      } finally {
        setIsLoadingDilars(false);
      }
    };

    const timeoutId = setTimeout(fetchDilars, 300);
    return () => clearTimeout(timeoutId);
  }, [dilarSearchTerm, form.customerType]);

  useEffect(() => {
    const c = CURRENCIES.find((x) => x.code === form.currencyCode);
    if (c && c.nameBn !== form.currencyName) {
      setForm((f) => ({ ...f, currencyName: c.nameBn }));
    }
  }, [form.currencyCode]);

  useEffect(() => {
    setForm((f) => ({ ...f, quantity: '', exchangeRate: '', bdtAmount: '', foreignAmount: '' }));
    setErrors((e) => ({ ...e, quantity: undefined, exchangeRate: undefined }));
  }, [form.type]);

  useEffect(() => {
    if (form.customerType === 'normal') {
      setForm((f) => ({ 
        ...f, 
        selectedDilarId: '',
        fullName: '',
        mobileNumber: '',
        nid: ''
      }));
    } else {
      setForm((f) => ({ 
        ...f, 
        fullName: '',
        mobileNumber: '',
        nid: ''
      }));
    }
    setDilarSearchTerm('');
    setShowDilarDropdown(false);
  }, [form.customerType]);

  const handleDilarSelect = (dilar) => {
    const dilarId = dilar._id || dilar.id || dilar.contactNo;
    setForm((f) => ({
      ...f,
      selectedDilarId: dilarId,
      dilarId: dilarId,
      fullName: dilar.ownerName || '',
      mobileNumber: dilar.contactNo || '',
      nid: dilar.nid || '',
    }));
    setDilarSearchTerm(dilar.ownerName || '');
    setShowDilarDropdown(false);
  };

  const filteredDilars = useMemo(() => {
    if (!dilarSearchTerm.trim()) return dilars;
    const searchLower = dilarSearchTerm.toLowerCase();
    return dilars.filter(d => 
      (d.ownerName || '').toLowerCase().includes(searchLower) ||
      (d.contactNo || '').includes(dilarSearchTerm) ||
      (d.tradeLocation || '').toLowerCase().includes(searchLower)
    );
  }, [dilars, dilarSearchTerm]);

  const isBuy = form.type === 'Buy';

  const amount = useMemo(() => {
    // If we have an explicit BDT amount (from manual edit or sync), use it
    if (form.bdtAmount && !Number.isNaN(Number(form.bdtAmount))) {
      return Number(form.bdtAmount);
    }

    const r = Number(form.exchangeRate);
    const q = Number(form.quantity);
    if (!Number.isFinite(r) || !Number.isFinite(q) || r <= 0 || q <= 0) return 0;
    
    if (isBuy) {
      return q; // For Buy: quantity IS the BDT amount
    } else {
      return q * r; // For Sell: quantity is Foreign amount
    }
  }, [form.exchangeRate, form.quantity, form.bdtAmount, isBuy]);

  const foreignCurrencyAmount = useMemo(() => {
    // If we have an explicit Foreign amount (from manual edit or sync), use it
    if (form.foreignAmount && !Number.isNaN(Number(form.foreignAmount))) {
      return Number(form.foreignAmount);
    }

    const r = Number(form.exchangeRate);
    const q = Number(form.quantity);
    if (!Number.isFinite(r) || !Number.isFinite(q) || r <= 0 || q <= 0) return 0;
    
    if (isBuy) {
      return q / r; // For Buy: quantity (BDT) / rate
    } else {
      return q; // For Sell: quantity IS the foreign amount
    }
  }, [form.exchangeRate, form.quantity, form.foreignAmount, isBuy]);

  const handleChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleQuantityChange = (val) => {
    const q = Number(val);
    const r = Number(form.exchangeRate);
    const fa = Number(form.foreignAmount);
    const bdt = Number(form.bdtAmount);
    let updates = { quantity: val };
    
    if (isBuy) {
      if (r > 0) {
        // Buy mode: Quantity (BDT) & Rate exists -> Update Foreign
        updates.foreignAmount = q > 0 ? (q / r).toFixed(4) : '';
      } else if (fa > 0 && q > 0) {
        // Buy mode: Quantity (BDT) & Foreign exists -> Update Rate
        updates.exchangeRate = (q / fa).toFixed(4);
      }
    } else {
      if (r > 0) {
        // Sell mode: Quantity (Foreign) & Rate exists -> Update BDT
        updates.bdtAmount = q > 0 ? (q * r).toFixed(2) : '';
      } else if (bdt > 0 && q > 0) {
        // Sell mode: Quantity (Foreign) & BDT exists -> Update Rate
        updates.exchangeRate = (bdt / q).toFixed(4);
      }
    }
    
    setForm(prev => ({ ...prev, ...updates }));
    if (errors.quantity) setErrors(e => ({ ...e, quantity: undefined }));
  };

  const handleExchangeRateChange = (val) => {
    const r = Number(val);
    const q = Number(form.quantity);
    const fa = Number(form.foreignAmount);
    const bdt = Number(form.bdtAmount);
    let updates = { exchangeRate: val };
    
    if (isBuy) {
      if (q > 0) {
        // Buy mode: Rate & Quantity (BDT) exists -> Update Foreign
        updates.foreignAmount = r > 0 ? (q / r).toFixed(4) : '';
      } else if (fa > 0 && r > 0) {
        // Buy mode: Rate & Foreign exists -> Update Quantity (BDT)
        updates.quantity = (fa * r).toFixed(2);
      }
    } else {
      if (q > 0) {
        // Sell mode: Rate & Quantity (Foreign) exists -> Update BDT
        updates.bdtAmount = r > 0 ? (q * r).toFixed(2) : '';
      } else if (bdt > 0 && r > 0) {
        // Sell mode: Rate & BDT exists -> Update Quantity (Foreign)
        updates.quantity = (bdt / r).toFixed(4);
      }
    }
    
    setForm(prev => ({ ...prev, ...updates }));
    if (errors.exchangeRate) setErrors(e => ({ ...e, exchangeRate: undefined }));
  };

  const handleBdtAmountChange = (val) => {
    if (isBuy) return; 

    const bdt = Number(val);
    const q = Number(form.quantity);
    const r = Number(form.exchangeRate);
    let updates = { bdtAmount: val };
    
    if (!isBuy) {
      if (q > 0) {
        // Sell mode: BDT & Quantity (Foreign) exists -> Update Rate
        updates.exchangeRate = bdt > 0 ? (bdt / q).toFixed(4) : '';
      } else if (r > 0) {
        // Sell mode: BDT & Rate exists -> Update Quantity (Foreign)
        updates.quantity = bdt > 0 ? (bdt / r).toFixed(4) : '';
      }
    }
    
    setForm(prev => ({ ...prev, ...updates }));
  };

  const handleForeignAmountChange = (val) => {
    if (!isBuy) return;

    const fa = Number(val);
    const q = Number(form.quantity); // BDT Amount
    const r = Number(form.exchangeRate);
    let updates = { foreignAmount: val };

    if (isBuy) {
      if (q > 0) {
        // Buy mode: Foreign & Quantity (BDT) exists -> Update Rate
        updates.exchangeRate = fa > 0 ? (q / fa).toFixed(4) : '';
      } else if (r > 0) {
        // Buy mode: Foreign & Rate exists -> Update Quantity (BDT)
        updates.quantity = fa > 0 ? (fa * r).toFixed(2) : '';
      }
    }

    setForm(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDilarDropdown && !event.target.closest('.dilar-dropdown-container')) {
        setShowDilarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDilarDropdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).filter((k) => v[k]).length) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        quantity: isBuy ? foreignCurrencyAmount : Number(form.quantity),
        amount_bdt: form.bdtAmount ? Number(form.bdtAmount) : amount,
        customerType: form.customerType || 'normal',
        selectedDilarId: form.selectedDilarId || '',
        dilarId: form.customerType === 'dilar' ? (form.selectedDilarId || form.dilarId) : undefined,
      };
      
      const response = await fetch('/api/money-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'লেনদেন সফলভাবে তৈরি করা হয়েছে',
          icon: 'success',
          confirmButtonColor: '#10B981',
        });
        setForm({ ...initialForm });
        router.push('/money-exchange/list');
      } else {
        throw new Error(data.error || 'Failed to create exchange');
      }
    } catch (error) {
      console.error('Failed to create exchange:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'লেনদেন তৈরি করতে ব্যর্থ হয়েছে',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <header className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ফিরে যান</span>
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">নতুন মুদ্রা লেনদেন</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">প্রফেশনাল ফর্ম দিয়ে দ্রুত লেনদেন এন্ট্রি করুন</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm(initialForm)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  রিসেট
                </button>
                <button
                  type="submit"
                  form="exchange-form"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-70 transition-colors shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      সংরক্ষণ হচ্ছে...
                    </span>
                  ) : (
                    'সংরক্ষণ করুন'
                  )}
                </button>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <form id="exchange-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Customer Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Customer Type (গ্রাহকের ধরণ) <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {CUSTOMER_TYPES.map((ct) => (
                        <button
                          key={ct.value}
                          type="button"
                          onClick={() => handleChange('customerType', ct.value)}
                          disabled={isSubmitting}
                          className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                            form.customerType === ct.value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                          } disabled:opacity-50`}
                        >
                          {ct.labelBn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Type (ধরণ) <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => handleChange('type', t.value)}
                          disabled={isSubmitting}
                          className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                            form.type === t.value
                              ? t.value === 'Buy'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                          } disabled:opacity-50`}
                        >
                          {t.labelBn}
                        </button>
                      ))}
                    </div>
                    {errors.type && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.type}</p>}
                  </div>

                  {/* Common Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Date (তারিখ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={form.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {errors.date && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.date}</p>}
                    </div>

                    {/* Dilar Selection or Normal Name Input */}
                    {form.customerType === 'dilar' ? (
                      <div className="relative dilar-dropdown-container">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Dilar (ডিলার) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-10 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="ডিলার খুঁজুন... (নাম, মোবাইল)"
                            value={dilarSearchTerm}
                            onChange={(e) => {
                              setDilarSearchTerm(e.target.value);
                              setShowDilarDropdown(true);
                            }}
                            onFocus={() => setShowDilarDropdown(true)}
                            disabled={isSubmitting}
                          />
                          {form.selectedDilarId && (
                            <button
                              type="button"
                              onClick={() => {
                                setForm((f) => ({ ...f, selectedDilarId: '', fullName: '', mobileNumber: '', nid: '' }));
                                setDilarSearchTerm('');
                              }}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                          )}
                        </div>
                        {showDilarDropdown && filteredDilars.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {isLoadingDilars ? (
                              <div className="p-4 text-center text-gray-500">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                              </div>
                            ) : (
                              filteredDilars.map((dilar) => (
                                <button
                                  key={dilar._id || dilar.id || dilar.contactNo}
                                  type="button"
                                  onClick={() => handleDilarSelect(dilar)}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center gap-3"
                                >
                                  {dilar.logo ? (
                                    <img src={dilar.logo} alt={dilar.ownerName} className="w-8 h-8 rounded object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                      <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 dark:text-white truncate">{dilar.ownerName || 'N/A'}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{dilar.contactNo || ''}</div>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                        {showDilarDropdown && dilarSearchTerm && filteredDilars.length === 0 && !isLoadingDilars && (
                          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
                            কোনো ডিলার পাওয়া যায়নি
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Full Name (পূর্ণ নাম) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="পূর্ণ নাম লিখুন"
                          value={form.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          disabled={isSubmitting}
                        />
                        {errors.fullName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.fullName}</p>}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Mobile Number (মোবাইল নম্বর) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="01XXXXXXXXX"
                        value={form.mobileNumber}
                        onChange={(e) => handleChange('mobileNumber', e.target.value)}
                        disabled={isSubmitting || form.customerType === 'dilar'}
                      />
                      {errors.mobileNumber && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.mobileNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        NID (জাতীয় পরিচয়পত্র)
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="জাতীয় পরিচয়পত্র নম্বর"
                        value={form.nid}
                        onChange={(e) => handleChange('nid', e.target.value)}
                        disabled={isSubmitting || form.customerType === 'dilar'}
                      />
                      {errors.nid && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.nid}</p>}
                    </div>
                  </div>

                  {/* Currency Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Currency Name (কারেন্সির নাম) <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={form.currencyName}
                        onChange={(e) => {
                          const name = e.target.value;
                          const cur = CURRENCIES.find((c) => c.nameBn === name) || CURRENCIES[0];
                          handleChange('currencyName', cur.nameBn);
                          handleChange('currencyCode', cur.code);
                        }}
                        disabled={isSubmitting}
                      >
                        {CURRENCIES.filter((c) => c.code !== 'BDT').map((c) => (
                          <option key={c.code} value={c.nameBn}>
                            {c.nameBn}
                          </option>
                        ))}
                      </select>
                      {errors.currencyName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.currencyName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Currency Code (কারেন্সি কোড) <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={form.currencyCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          const cur = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
                          handleChange('currencyCode', cur.code);
                          handleChange('currencyName', cur.nameBn);
                        }}
                        disabled={isSubmitting}
                      >
                        {CURRENCIES.filter((c) => c.code !== 'BDT').map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>
                      {errors.currencyCode && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.currencyCode}</p>}
                    </div>
                  </div>

                  {/* Type-specific Fields */}
                  {isBuy ? (
                    <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">ক্রয় (Buy) - BDT প্রদান করে বিদেশি মুদ্রা গ্রহণ</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 h-10 flex flex-col justify-end">
                            <div>Amount to Pay (প্রদান করতে হবে) <span className="text-red-500">*</span></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">BDT</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0.00"
                            value={form.quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            disabled={isSubmitting}
                          />
                          {errors.quantity && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.quantity}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 h-10 flex flex-col justify-end">
                            <div>Exchange Rate (এক্সচেঞ্জ রেট) <span className="text-red-500">*</span></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">1 {form.currencyCode} = ? BDT</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.0001"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0.0000"
                            value={form.exchangeRate}
                            onChange={(e) => handleExchangeRateChange(e.target.value)}
                            disabled={isSubmitting}
                          />
                          {errors.exchangeRate && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.exchangeRate}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 h-10 flex flex-col justify-end">
                            <div>Foreign Currency to Receive (প্রাপ্ত হবে)</div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">{form.currencyCode}</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.0001"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0.0000"
                            value={form.foreignAmount}
                            onChange={(e) => handleForeignAmountChange(e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3">বিক্রয় (Sell) - বিদেশি মুদ্রা প্রদান করে BDT গ্রহণ</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 h-10 flex flex-col justify-end">
                            <div>Foreign Currency to Sell (বিক্রয় করতে হবে) <span className="text-red-500">*</span></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">{form.currencyCode}</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0.00"
                            value={form.quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            disabled={isSubmitting}
                          />
                          {errors.quantity && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.quantity}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 h-10 flex flex-col justify-end">
                            <div>Exchange Rate (এক্সচেঞ্জ রেট) <span className="text-red-500">*</span></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">1 {form.currencyCode} = ? BDT</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.0001"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0.0000"
                            value={form.exchangeRate}
                            onChange={(e) => handleExchangeRateChange(e.target.value)}
                            disabled={isSubmitting}
                          />
                          {errors.exchangeRate && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.exchangeRate}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 h-10 flex flex-col justify-end">
                            <div>Amount to Receive (প্রাপ্ত হবে)</div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">BDT</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0.00"
                            value={form.bdtAmount}
                            onChange={(e) => handleBdtAmountChange(e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setForm(initialForm)}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      disabled={isSubmitting}
                    >
                      পরিষ্কার করুন
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-70 transition-colors shadow-sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          সংরক্ষণ হচ্ছে...
                        </span>
                      ) : (
                        'লেনদেন সংরক্ষণ করুন'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <aside className="space-y-4">
              <div className={`bg-white dark:bg-gray-800 rounded-xl border p-6 shadow-sm ${isBuy ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">লেনদেনের সারাংশ</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">ধরণ</span>
                    <span>
                      <Pill color={isBuy ? 'green' : 'red'}>{form.type}</Pill>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">তারিখ</span>
                    <span className="font-medium text-gray-900 dark:text-white">{form.date || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">পূর্ণ নাম</span>
                    <span className="font-medium text-gray-900 dark:text-white">{form.fullName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">মোবাইল নম্বর</span>
                    <span className="font-medium text-gray-900 dark:text-white">{form.mobileNumber || '-'}</span>
                  </div>
                  {form.nid && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">জাতীয় পরিচয়পত্র</span>
                      <span className="font-medium text-gray-900 dark:text-white">{form.nid}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">কারেন্সি</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {form.currencyCode} • {form.currencyName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">এক্সচেঞ্জ রেট</span>
                    <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                      1 {form.currencyCode} = {form.exchangeRate || '0.0000'} BDT
                    </span>
                  </div>
                  {isBuy ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">প্রদান করতে হবে (BDT)</span>
                        <span className="font-medium text-gray-900 dark:text-white tabular-nums">{formatBDT(Number(form.quantity) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">প্রাপ্ত হবে ({form.currencyCode})</span>
                        <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                          {foreignCurrencyAmount.toFixed(4)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">বিক্রয় করতে হবে ({form.currencyCode})</span>
                        <span className="font-medium text-gray-900 dark:text-white tabular-nums">{form.quantity || '0.00'}</span>
                      </div>
                      <div className="border-t pt-3 mt-2 flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">প্রাপ্ত হবে (BDT)</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{formatBDT(amount)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewExchange;
