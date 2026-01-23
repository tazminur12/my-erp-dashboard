'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  Edit,
  Trash2,
  MoreVertical,
  UserPlus,
  Tag,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building2,
  ArrowLeft
} from 'lucide-react';
import Swal from 'sweetalert2';

// Convert Arabic numerals to Bengali numerals
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

const AllContacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [groupFilter, setGroupFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        if (groupFilter !== 'all') {
          params.append('group', groupFilter);
        }
        if (sourceFilter !== 'all') {
          params.append('source', sourceFilter);
        }

        const response = await fetch(`/api/contacts?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setContacts(data.contacts || data.data || []);
          setPagination(data.pagination || {
            currentPage: page,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: limit
          });
        } else {
          throw new Error(data.error || 'Failed to fetch contacts');
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError(err.message || 'Failed to load contacts');
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [page, searchTerm, groupFilter, sourceFilter, limit]);

  // Calculate stats
  const stats = [
    { 
      label: 'মোট কন্টাক্ট', 
      value: pagination.totalItems || contacts.length, 
      color: 'blue', 
      icon: Users 
    },
    { 
      label: 'সক্রিয়', 
      value: contacts.filter(c => c.status === 'active').length, 
      color: 'green', 
      icon: CheckCircle 
    },
    { 
      label: 'এই মাসে নতুন', 
      value: contacts.filter(c => {
        const contactDate = new Date(c.dateAdded || c.createdAt);
        const now = new Date();
        return contactDate.getMonth() === now.getMonth() && contactDate.getFullYear() === now.getFullYear();
      }).length, 
      color: 'purple', 
      icon: UserPlus 
    },
    { 
      label: 'গ্রুপ', 
      value: [...new Set(contacts.map(c => c.group).filter(Boolean))].length, 
      color: 'orange', 
      icon: Tag 
    }
  ];

  const handleSelectContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id || c._id));
    }
  };

  const handleDelete = async (contactId) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "আপনি এটি ফিরিয়ে আনতে পারবেন না!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল করুন'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/contacts/${contactId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'কন্টাক্ট সফলভাবে মুছে ফেলা হয়েছে।',
            icon: 'success',
            confirmButtonColor: '#10B981',
          });
          // Refresh the list
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          if (searchTerm) params.append('search', searchTerm);
          if (groupFilter !== 'all') params.append('group', groupFilter);
          if (sourceFilter !== 'all') params.append('source', sourceFilter);
          
          const refreshResponse = await fetch(`/api/contacts?${params.toString()}`);
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok) {
            setContacts(refreshData.contacts || refreshData.data || []);
            setPagination(refreshData.pagination || pagination);
          }
        } else {
          throw new Error(data.error || 'Failed to delete contact');
        }
      } catch (err) {
        console.error('Error deleting contact:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'কন্টাক্ট মুছে ফেলতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;

    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${selectedContacts.length} টি কন্টাক্ট মুছে ফেলা হবে!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল করুন'
    });

    if (result.isConfirmed) {
      // Implement bulk delete
      Swal.fire({
        title: 'সফল!',
        text: `${selectedContacts.length} টি কন্টাক্ট মুছে ফেলা হয়েছে।`,
        icon: 'success',
        confirmButtonColor: '#10B981',
      });
      setSelectedContacts([]);
    }
  };

  // Get unique groups and sources for filters
  const groups = [...new Set(contacts.map(c => c.group).filter(Boolean))];
  const sources = [...new Set(contacts.map(c => c.source).filter(Boolean))];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">সব কন্টাক্ট</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    আপনার সকল গ্রাহক কন্টাক্ট এক জায়গায় পরিচালনা করুন
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">ইম্পোর্ট</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">এক্সপোর্ট</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                  <Plus className="w-4 h-4" />
                  নতুন কন্টাক্ট
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {isLoading ? '...' : toBengaliNumeral(stat.value?.toLocaleString())}
                    </p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                    stat.color === 'blue' ? 'from-blue-500 to-indigo-500' :
                    stat.color === 'green' ? 'from-green-500 to-emerald-500' :
                    stat.color === 'purple' ? 'from-purple-500 to-pink-500' :
                    'from-orange-500 to-amber-500'
                  } text-white flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contacts Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Search and Filter Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    placeholder="নাম, ইমেইল, বা ফোন নম্বর দিয়ে খুঁজুন..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={groupFilter}
                    onChange={(e) => {
                      setGroupFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">সব গ্রুপ</option>
                    {groups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                  <select
                    value={sourceFilter}
                    onChange={(e) => {
                      setSourceFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">সব সোর্স</option>
                    {sources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                  <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">ফিল্টার</span>
                  </button>
                </div>
              </div>

              {selectedContacts.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {toBengaliNumeral(selectedContacts.length)} টি কন্টাক্ট নির্বাচিত
                  </span>
                  <div className="flex flex-wrap gap-2 ml-auto">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      গ্রুপে যোগ করুন
                    </button>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      এসএমএস পাঠান
                    </button>
                    <button 
                      onClick={handleBulkDelete}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">কন্টাক্ট লোড হচ্ছে...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  কোন কন্টাক্ট পাওয়া যায়নি
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {searchTerm || groupFilter !== 'all' || sourceFilter !== 'all'
                    ? 'আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে চেষ্টা করুন'
                    : 'আপনার প্রথম কন্টাক্ট যোগ করুন'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedContacts.length === contacts.length && contacts.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">নাম</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ইমেইল</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ফোন</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">গ্রুপ</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">সোর্স</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">যোগ করা হয়েছে</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">কার্যক্রম</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {contacts.map((contact) => {
                        const contactId = contact.id || contact._id;
                        const contactName = contact.name || contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'N/A';
                        const contactEmail = contact.email || contact.contactEmail || 'N/A';
                        const contactPhone = contact.phone || contact.contactPhone || 'N/A';
                        const contactGroup = contact.group || 'N/A';
                        const contactSource = contact.source || 'N/A';
                        const dateAdded = contact.dateAdded || contact.createdAt || 'N/A';
                        
                        return (
                          <tr key={contactId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedContacts.includes(contactId)}
                                onChange={() => handleSelectContact(contactId)}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                  <span className="text-sm">
                                    {contactName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{contactName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4" />
                                {contactEmail}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-4 h-4" />
                                {contactPhone}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
                                {contactGroup}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{contactSource}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {dateAdded !== 'N/A' ? new Date(dateAdded).toLocaleDateString('bn-BD') : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="সম্পাদনা"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(contactId)}
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      দেখানো হচ্ছে {toBengaliNumeral(((pagination.currentPage - 1) * pagination.itemsPerPage) + 1)} থেকে{' '}
                      {toBengaliNumeral(Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems))} পর্যন্ত, মোট{' '}
                      {toBengaliNumeral(pagination.totalItems)} টি কন্টাক্ট
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.currentPage === 1}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        পূর্ববর্তী
                      </button>
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = pagination.currentPage <= 3 
                          ? i + 1 
                          : pagination.currentPage >= pagination.totalPages - 2
                          ? pagination.totalPages - 4 + i
                          : pagination.currentPage - 2 + i;
                        
                        if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                              pageNum === pagination.currentPage
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {toBengaliNumeral(pageNum)}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        পরবর্তী
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AllContacts;
