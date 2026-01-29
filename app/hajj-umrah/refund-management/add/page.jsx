'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import Swal from 'sweetalert2';
import { ArrowLeft, Save, Loader2, Search, X } from 'lucide-react';

const AddRefund = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    customerType: 'haji',
    customerId: '',
    customerName: '',
    amount: '',
    refundDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'pending',
    notes: ''
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch customers (search or recent)
  const fetchCustomers = async (searchTerm = '') => {
    setSearching(true);
    try {
      let endpoint = '';
      const queryParam = searchTerm ? `?search=${searchTerm}` : '?limit=10'; // limit 10 for recent

      if (formData.customerType === 'haji') {
        endpoint = `/api/hajj-umrah/hajis${queryParam}`;
      } else if (formData.customerType === 'umrah') {
        endpoint = `/api/hajj-umrah/umrahs${queryParam}`;
      } else if (formData.customerType === 'agent') {
        endpoint = `/api/agents${queryParam}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      let results = [];

      if (formData.customerType === 'haji') {
        results = data.hajis || [];
      } else if (formData.customerType === 'umrah') {
        results = data.umrahs || [];
      } else if (formData.customerType === 'agent') {
        results = data.agents || [];
      }

      setSearchResults(results);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showDropdown || formData.customerId) {
         // If dropdown is open or user is typing, fetch suggestions
         // But we want to avoid fetching if user just selected an item (handled in select)
         // So we only fetch if we are "searching" mode. 
         // Actually, let's just fetch when customerId changes and it's not a selection
         // Ideally we separate "inputValue" from "selectedId", but here we use customerId as input too?
         // The current UI uses customerId as the input value.
         fetchCustomers(formData.customerId);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.customerId, formData.customerType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear customer name if type or id changes
    if (name === 'customerType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        customerId: '', // Clear ID on type change
        customerName: '' 
      }));
      setSearchResults([]);
    } else if (name === 'customerId') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        customerName: '' // Reset name until verified/selected
      }));
      setShowDropdown(true);
    }
  };

  const handleSelectCustomer = (customer) => {
    const id = customer.customer_id || customer.agentId || customer.id; // Adjust based on API response structure
    const name = customer.name || customer.tradeName || 'Unknown';
    
    setFormData(prev => ({
      ...prev,
      customerId: id,
      customerName: name
    }));
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    if (!formData.customerId) {
      fetchCustomers(''); // Fetch recent if empty
    } else {
        // If there is a value, fetch search results for it
        fetchCustomers(formData.customerId);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName) {
      Swal.fire({
        icon: 'warning',
        title: 'যাচাইকরণ',
        text: 'অনুগ্রহ করে প্রথমে গ্রাহক অনুসন্ধান করুন এবং নিশ্চিত করুন',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/hajj-umrah/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create refund');
      }

      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'রিফান্ড রিকোয়েস্ট সফলভাবে তৈরি হয়েছে',
      }).then(() => {
        router.push('/hajj-umrah/refund-management');
      });
    } catch (error) {
      console.error('Create error:', error);
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ',
        text: 'রিফান্ড রিকোয়েস্ট তৈরি করতে ব্যর্থ হয়েছে',
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">নতুন রিফান্ড রিকোয়েস্ট</h1>
            <p className="text-gray-600 dark:text-gray-400">একটি নতুন রিফান্ড এন্ট্রি তৈরি করুন</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Search Section */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                গ্রাহক ধরণ ও আইডি <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  className="w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="haji">হাজী</option>
                  <option value="umrah">উমরাহ</option>
                  <option value="agent">এজেন্ট</option>
                </select>
                <div className="relative flex-1">
                  <input
                    type="text"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    autoComplete="off"
                    placeholder="আইডি বা নাম দিয়ে খুঁজুন"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  
                  {/* Dropdown */}
                  {showDropdown && (
                    <div 
                      ref={dropdownRef}
                      className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
                    >
                      {searching ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                          খুঁজছে...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <ul className="py-1">
                          {searchResults.map((customer, index) => {
                            const id = customer.customer_id || customer.agentId || customer.id;
                            const name = customer.name || customer.tradeName || 'Unknown';
                            const subText = customer.mobile || customer.contactNo || '';
                            
                            return (
                              <li
                                key={index}
                                onClick={() => handleSelectCustomer(customer)}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b last:border-b-0 border-gray-100 dark:border-gray-600"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">{name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                                  <span>{id}</span>
                                  <span>{subText}</span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          কোনো ফলাফল পাওয়া যায়নি
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {formData.customerName && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                  নির্বাচিত গ্রাহক: {formData.customerName}
                </div>
              )}
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
                  সংরক্ষণ হচ্ছে...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  সংরক্ষণ করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddRefund;
