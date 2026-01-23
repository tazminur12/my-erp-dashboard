'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Loader2,
  Search,
  X,
  Save
} from 'lucide-react';
import Swal from 'sweetalert2';

const VendorBankAccounts = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [vendor, setVendor] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'Savings',
    branchName: '',
    accountHolder: '',
    accountTitle: '',
    initialBalance: '',
    currency: 'BDT',
    contactNumber: '',
    isPrimary: false,
    notes: ''
  });

  // Fetch vendor
  useEffect(() => {
    if (id) {
      fetchVendor();
      fetchBankAccounts();
    }
  }, [id]);

  const fetchVendor = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/vendors/${id}`);
      const result = await response.json();

      if (response.ok) {
        setVendor(result.vendor || result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch vendor');
      }
    } catch (error) {
      console.error('Error fetching vendor:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ভেন্ডর লোড করতে ব্যর্থ হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    setAccountsLoading(true);
    try {
      const response = await fetch(`/api/vendors/${id}/bank-accounts`);
      const result = await response.json();

      if (response.ok) {
        setBankAccounts(result.bankAccounts || result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch bank accounts');
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      setBankAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  };

  const filteredAccounts = bankAccounts.filter(account =>
    account.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNumber?.includes(searchTerm) ||
    account.accountHolder?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdd = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      accountType: 'Savings',
      branchName: '',
      accountHolder: '',
      accountTitle: '',
      initialBalance: '',
      currency: 'BDT',
      contactNumber: '',
      isPrimary: false,
      notes: ''
    });
    setShowAddForm(true);
    setShowEditForm(false);
    setEditingAccount(null);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      bankName: account.bankName || '',
      accountNumber: account.accountNumber || '',
      accountType: account.accountType || 'Savings',
      branchName: account.branchName || '',
      accountHolder: account.accountHolder || '',
      accountTitle: account.accountTitle || account.accountHolder || '',
      initialBalance: account.initialBalance || '',
      currency: account.currency || 'BDT',
      contactNumber: account.contactNumber || '',
      isPrimary: account.isPrimary || false,
      notes: account.notes || ''
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingAccount(null);
    setFormData({
      bankName: '',
      accountNumber: '',
      accountType: 'Savings',
      branchName: '',
      accountHolder: '',
      accountTitle: '',
      initialBalance: '',
      currency: 'BDT',
      contactNumber: '',
      isPrimary: false,
      notes: ''
    });
  };

  const handleDelete = async (account) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `ব্যাংক একাউন্ট "${account.bankName} - ${account.accountNumber}" মুছে ফেলা হবে।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        const accountId = account._id || account.id;
        const response = await fetch(`/api/vendors/${id}/bank-accounts/${accountId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'ব্যাংক একাউন্ট মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#7c3aed',
          });
          fetchBankAccounts();
        } else {
          throw new Error(result.error || 'Failed to delete bank account');
        }
      } catch (error) {
        console.error('Error deleting bank account:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'ব্যাংক একাউন্ট মুছে ফেলতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bankName || !formData.accountNumber || !formData.accountHolder) {
      Swal.fire({
        icon: 'error',
        title: 'যাচাইকরণ ত্রুটি',
        text: 'ব্যাংকের নাম, একাউন্ট নম্বর এবং একাউন্ট হোল্ডার আবশ্যক',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = showAddForm 
        ? `/api/vendors/${id}/bank-accounts`
        : `/api/vendors/${id}/bank-accounts/${editingAccount._id || editingAccount.id}`;
      
      const method = showAddForm ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          initialBalance: parseFloat(formData.initialBalance) || 0
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: showAddForm ? 'ব্যাংক একাউন্ট তৈরি করা হয়েছে!' : 'ব্যাংক একাউন্ট আপডেট করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#7c3aed',
        });
        handleCancel();
        fetchBankAccounts();
      } else {
        throw new Error(result.error || 'Failed to save bank account');
      }
    } catch (error) {
      console.error('Error saving bank account:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ব্যাংক একাউন্ট সংরক্ষণ করতে ব্যর্থ হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount, currency = 'BDT') => {
    return `${currency} ${Number(amount || 0).toLocaleString('bn-BD')}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/vendors/${id}`}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ভেন্ডর বিবরণে ফিরে যান</span>
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    ব্যাংক একাউন্ট
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {vendor?.tradeName} - ব্যাংক একাউন্ট ব্যবস্থাপনা
                  </p>
                </div>
              </div>
              {!showAddForm && !showEditForm && (
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  ব্যাংক একাউন্ট যোগ করুন
                </button>
              )}
            </div>
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || showEditForm) && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {showAddForm ? 'ব্যাংক একাউন্ট যোগ করুন' : 'ব্যাংক একাউন্ট সম্পাদনা করুন'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ব্যাংকের নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      একাউন্ট নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      একাউন্ট টাইপ
                    </label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                      <option value="Fixed Deposit">Fixed Deposit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ব্রাঞ্চের নাম
                    </label>
                    <input
                      type="text"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      একাউন্ট হোল্ডার <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountHolder"
                      value={formData.accountHolder}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      একাউন্ট টাইটেল
                    </label>
                    <input
                      type="text"
                      name="accountTitle"
                      value={formData.accountTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      প্রাথমিক ব্যালেন্স
                    </label>
                    <input
                      type="number"
                      name="initialBalance"
                      value={formData.initialBalance}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      মুদ্রা
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="BDT">BDT</option>
                      <option value="USD">USD</option>
                      <option value="SAR">SAR</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      যোগাযোগের নম্বর
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      নোট
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isPrimary"
                        checked={formData.isPrimary}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        প্রাথমিক একাউন্ট হিসেবে সেট করুন
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {showAddForm ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট হচ্ছে...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {showAddForm ? 'সংরক্ষণ করুন' : 'আপডেট করুন'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search Bar */}
          {!showAddForm && !showEditForm && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ব্যাংকের নাম, একাউন্ট নম্বর, বা একাউন্ট হোল্ডার দিয়ে অনুসন্ধান করুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Bank Accounts List */}
          {!showAddForm && !showEditForm && (
            <>
              {accountsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    কোনো ব্যাংক একাউন্ট পাওয়া যায়নি
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm ? 'ভিন্ন অনুসন্ধান শব্দ ব্যবহার করুন' : 'আপনার প্রথম ব্যাংক একাউন্ট যোগ করুন'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAdd}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      ব্যাংক একাউন্ট যোগ করুন
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAccounts.map((account) => (
                    <div
                      key={account._id || account.id}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {account.bankName}
                            </h3>
                            {account.isPrimary && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            A/C: {account.accountNumber}
                          </p>
                          {account.branchName && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Branch: {account.branchName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(account)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="সম্পাদনা"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(account)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Account Holder</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.accountHolder}
                          </span>
                        </div>
                        {account.accountTitle && account.accountTitle !== account.accountHolder && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Account Title</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {account.accountTitle}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.accountType}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(account.currentBalance || account.initialBalance, account.currency)}
                          </span>
                        </div>
                        {account.contactNumber && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Contact</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {account.contactNumber}
                            </span>
                          </div>
                        )}
                        {account.notes && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-500">{account.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorBankAccounts;
