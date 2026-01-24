'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Milk,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  Scale,
  DollarSign,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

const MilkProduction = () => {
  const [milkRecords, setMilkRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newRecord, setNewRecord] = useState({
    cattleId: '',
    date: new Date().toISOString().split('T')[0],
    morningQuantity: '',
    afternoonQuantity: '',
    eveningQuantity: '',
    quality: 'good',
    notes: ''
  });

  const qualityOptions = [
    { value: 'excellent', label: 'উৎকৃষ্ট', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' },
    { value: 'good', label: 'ভাল', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20' },
    { value: 'average', label: 'মধ্যম', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' },
    { value: 'poor', label: 'খারাপ', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' }
  ];

  const [stats, setStats] = useState({
    todayProduction: 0,
    weeklyProduction: 0,
    monthlyProduction: 0,
    averagePerCow: 0,
    totalCows: 0,
    activeCows: 0
  });

  // Fetch cattle
  useEffect(() => {
    const fetchCattle = async () => {
      try {
        const response = await fetch('/api/miraj-industries/cattle');
        const data = await response.json();
        if (response.ok) {
          setCattleList(data.cattle || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching cattle:', error);
      }
    };
    fetchCattle();
  }, []);

  // Fetch milk records
  useEffect(() => {
    const fetchMilkRecords = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (filterDate) params.append('date', filterDate);

        const response = await fetch(`/api/miraj-industries/milk-production?${params.toString()}`);
        const data = await response.json();
        if (response.ok) {
          setMilkRecords(data.records || data.data || []);
        } else {
          throw new Error(data.error || 'Failed to fetch milk records');
        }
      } catch (error) {
        console.error('Error fetching milk records:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'দুধ উৎপাদন রেকর্ড লোড করতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchMilkRecords();
  }, [searchTerm, filterDate]);

  useEffect(() => {
    filterRecords();
    calculateStats();
  }, [milkRecords, searchTerm, filterDate, cattleList]);

  const filterRecords = () => {
    let filtered = milkRecords.filter(record => 
      (record.cattleName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.cattleId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterDate) {
      filtered = filtered.filter(record => record.date === filterDate);
    }

    setFilteredRecords(filtered);
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const todayProduction = milkRecords
      .filter(record => record.date === today)
      .reduce((sum, record) => sum + parseFloat(record.totalQuantity || 0), 0);

    const weeklyProduction = milkRecords
      .filter(record => record.date >= weekAgo)
      .reduce((sum, record) => sum + parseFloat(record.totalQuantity || 0), 0);

    const monthlyProduction = milkRecords
      .filter(record => record.date >= monthAgo)
      .reduce((sum, record) => sum + parseFloat(record.totalQuantity || 0), 0);

    const activeCows = new Set(milkRecords.filter(record => record.date === today).map(record => record.cattleId)).size;
    const averagePerCow = activeCows > 0 ? todayProduction / activeCows : 0;

    setStats({
      todayProduction,
      weeklyProduction,
      monthlyProduction,
      averagePerCow,
      totalCows: cattleList.length,
      activeCows
    });
  };

  const handleAddRecord = async () => {
    if (!newRecord.cattleId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'গরু নির্বাচন করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    if (!newRecord.date) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'তারিখ নির্বাচন করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        cattleId: newRecord.cattleId,
        date: newRecord.date,
        morningQuantity: Number(newRecord.morningQuantity || 0),
        afternoonQuantity: Number(newRecord.afternoonQuantity || 0),
        eveningQuantity: Number(newRecord.eveningQuantity || 0),
        quality: newRecord.quality,
        notes: newRecord.notes || ''
      };

      const response = await fetch('/api/miraj-industries/milk-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'দুধ উৎপাদন রেকর্ড যোগ করা হয়েছে',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowAddModal(false);
        resetForm();
        // Refresh records
        const refreshResponse = await fetch('/api/miraj-industries/milk-production');
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setMilkRecords(refreshData.records || refreshData.data || []);
        }
      } else {
        throw new Error(data.error || 'Failed to create milk record');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'দুধ উৎপাদন রেকর্ড যোগ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই রেকর্ডটি মুছে ফেলা হবে',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/miraj-industries/milk-production/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'রেকর্ড সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          // Refresh records
          const refreshResponse = await fetch('/api/miraj-industries/milk-production');
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok) {
            setMilkRecords(refreshData.records || refreshData.data || []);
          }
        } else {
          throw new Error(data.error || 'Failed to delete record');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'রেকর্ড মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const resetForm = () => {
    setNewRecord({
      cattleId: '',
      date: new Date().toISOString().split('T')[0],
      morningQuantity: '',
      afternoonQuantity: '',
      eveningQuantity: '',
      quality: 'good',
      notes: ''
    });
  };

  const getQualityClass = (quality) => {
    const qualityObj = qualityOptions.find(opt => opt.value === quality);
    return qualityObj ? qualityObj.color : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
  };

  const generateReport = () => {
    Swal.fire({
      title: 'রিপোর্ট',
      text: 'রিপোর্ট তৈরি করা হচ্ছে...',
      icon: 'info',
      confirmButtonText: 'ঠিক আছে',
      confirmButtonColor: '#3b82f6',
    });
  };

  // Auto-calculate total when quantities change
  useEffect(() => {
    const morning = Number(newRecord.morningQuantity || 0);
    const afternoon = Number(newRecord.afternoonQuantity || 0);
    const evening = Number(newRecord.eveningQuantity || 0);
    const total = morning + afternoon + evening;
    // Note: We don't update totalQuantity in state as it's calculated on backend
  }, [newRecord.morningQuantity, newRecord.afternoonQuantity, newRecord.eveningQuantity]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">দুধ উৎপাদন রেকর্ড</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">দৈনিক দুধ উৎপাদনের তথ্য ও বিশ্লেষণ</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            নতুন রেকর্ড যোগ করুন
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আজকের উৎপাদন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayProduction.toFixed(1)} লিটার</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Milk className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{stats.activeCows} গরু সক্রিয়</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">সাপ্তাহিক উৎপাদন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.weeklyProduction.toFixed(1)} লিটার</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span>গত ৭ দিন</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মাসিক উৎপাদন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.monthlyProduction.toFixed(1)} লিটার</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span>গত ৩০ দিন</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">গড় উৎপাদন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averagePerCow.toFixed(1)} লিটার</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                <Scale className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-400">
              <span>প্রতি গরু (আজ)</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="গরুর নাম বা ID দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button 
                onClick={generateReport}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                রিপোর্ট
              </button>
            </div>
          </div>
        </div>

        {/* Milk Production Records */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    তারিখ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    গরু
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    সকাল
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    দুপুর
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    সন্ধ্যা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    মোট
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    মান
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ক্রিয়া
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      কোন রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                ) : filteredRecords.map((record) => (
                  <tr key={record.id || record._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {record.date ? new Date(record.date).toLocaleDateString('bn-BD') : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{record.cattleName || 'N/A'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{record.cattleId || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Milk className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{record.morningQuantity || 0} লি</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Milk className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{record.afternoonQuantity || 0} লি</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Milk className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{record.eveningQuantity || 0} লি</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Scale className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{record.totalQuantity || 0} লি</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQualityClass(record.quality)}`}>
                        {qualityOptions.find(opt => opt.value === record.quality)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="বিস্তারিত দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id || record._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Record Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">দুধ উৎপাদন রেকর্ড যোগ করুন</h2>
                <button 
                  onClick={() => { setShowAddModal(false); resetForm(); }} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddRecord(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গরু নির্বাচন করুন <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={newRecord.cattleId}
                      onChange={(e) => setNewRecord({...newRecord, cattleId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">গরু নির্বাচন করুন</option>
                      {cattleList.filter(c => c.gender === 'female').map(cattle => {
                        const cattleId = cattle.id || cattle._id;
                        return (
                          <option key={cattleId} value={cattleId}>
                            {cattle.name} {cattle.tagNumber ? `(${cattle.tagNumber})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">তারিখ <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">সকালের দুধ (লিটার)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newRecord.morningQuantity}
                      onChange={(e) => setNewRecord({...newRecord, morningQuantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="সকালের দুধের পরিমাণ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">দুপুরের দুধ (লিটার)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newRecord.afternoonQuantity}
                      onChange={(e) => setNewRecord({...newRecord, afternoonQuantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="দুপুরের দুধের পরিমাণ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">সন্ধ্যার দুধ (লিটার)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newRecord.eveningQuantity}
                      onChange={(e) => setNewRecord({...newRecord, eveningQuantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="সন্ধ্যার দুধের পরিমাণ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">দুধের মান</label>
                    <select
                      value={newRecord.quality}
                      onChange={(e) => setNewRecord({...newRecord, quality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {qualityOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য বা নোট"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        সংরক্ষণ হচ্ছে...
                      </>
                    ) : (
                      'সংরক্ষণ করুন'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Record Modal */}
        {showViewModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">দুধ উৎপাদন বিস্তারিত</h2>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">গরু:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.cattleName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">তারিখ:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedRecord.date ? new Date(selectedRecord.date).toLocaleDateString('bn-BD') : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">সকাল</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedRecord.morningQuantity || 0} লি</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">দুপুর</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{selectedRecord.afternoonQuantity || 0} লি</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">সন্ধ্যা</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{selectedRecord.eveningQuantity || 0} লি</p>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">মোট উৎপাদন</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRecord.totalQuantity || 0} লিটার</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">দুধের মান:</p>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getQualityClass(selectedRecord.quality)}`}>
                    {qualityOptions.find(opt => opt.value === selectedRecord.quality)?.label}
                  </span>
                </div>
                
                {selectedRecord.notes && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">নোট:</p>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MilkProduction;
