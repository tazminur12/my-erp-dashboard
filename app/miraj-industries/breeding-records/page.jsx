'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Baby, 
  Heart,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Edit,
  Trash2,
  Bell,
  User,
  FileText,
  Activity,
  Scale,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

const BreedingRecords = () => {
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showAddBreedingModal, setShowAddBreedingModal] = useState(false);
  const [showAddCalvingModal, setShowAddCalvingModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditBreedingModal, setShowEditBreedingModal] = useState(false);
  const [showEditCalvingModal, setShowEditCalvingModal] = useState(false);
  const [editingBreeding, setEditingBreeding] = useState(null);
  const [editingCalving, setEditingCalving] = useState(null);
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [calvingRecords, setCalvingRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newBreeding, setNewBreeding] = useState({
    cowId: '',
    breedingDate: new Date().toISOString().split('T')[0],
    method: 'natural',
    success: 'pending',
    notes: '',
    expectedCalvingDate: ''
  });

  const [newCalving, setNewCalving] = useState({
    cowId: '',
    calvingDate: new Date().toISOString().split('T')[0],
    calfGender: '',
    calfWeight: '',
    calfHealth: 'healthy',
    calvingType: 'normal',
    complications: '',
    notes: '',
    calfId: ''
  });

  const breedingMethodOptions = [
    { value: 'natural', label: 'প্রাকৃতিক প্রজনন' },
    { value: 'artificial', label: 'কৃত্রিম প্রজনন' },
    { value: 'et', label: 'ভ্রূণ স্থানান্তর' }
  ];

  const successStatusOptions = [
    { value: 'pending', label: 'অপেক্ষমান', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' },
    { value: 'successful', label: 'সফল', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' },
    { value: 'failed', label: 'ব্যর্থ', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' },
    { value: 'confirmed_pregnant', label: 'গর্ভবতী নিশ্চিত', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20' }
  ];

  const calfHealthOptions = [
    { value: 'healthy', label: 'সুস্থ', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' },
    { value: 'weak', label: 'দুর্বল', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' },
    { value: 'sick', label: 'অসুস্থ', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' },
    { value: 'deceased', label: 'মৃত', color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800' }
  ];

  const calvingTypeOptions = [
    'স্বাভাবিক',
    'অস্ত্রোপচার',
    'জটিলতা',
    'জরুরী'
  ];

  const [stats, setStats] = useState({
    totalBreedings: 0,
    successfulBreedings: 0,
    totalCalvings: 0,
    upcomingCalvings: 0,
    healthyCalves: 0,
    pregnancyRate: 0
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

  // Fetch breeding records
  useEffect(() => {
    const fetchBreedingRecords = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (filterDate) {
          params.append('from', filterDate);
          params.append('to', filterDate);
        }

        const response = await fetch(`/api/miraj-industries/breeding-records?${params.toString()}`);
        const data = await response.json();
        if (response.ok) {
          setBreedingRecords(data.records || []);
        }
      } catch (error) {
        console.error('Error fetching breeding records:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBreedingRecords();
  }, [searchTerm, filterDate]);

  // Fetch calving records
  useEffect(() => {
    const fetchCalvingRecords = async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (filterDate) {
          params.append('from', filterDate);
          params.append('to', filterDate);
        }

        const response = await fetch(`/api/miraj-industries/calving-records?${params.toString()}`);
        const data = await response.json();
        if (response.ok) {
          setCalvingRecords(data.records || []);
        }
      } catch (error) {
        console.error('Error fetching calving records:', error);
      }
    };
    fetchCalvingRecords();
  }, [searchTerm, filterDate]);

  useEffect(() => {
    filterRecords();
    calculateStats();
  }, [breedingRecords, calvingRecords, searchTerm, filterType, filterDate]);

  const filterRecords = () => {
    let allRecords = [];
    
    // Filter by type
    if (filterType === 'all' || filterType === 'breeding') {
      allRecords = [...allRecords, ...(breedingRecords || []).map(record => ({ ...record, type: 'breeding' }))];
    }
    
    if (filterType === 'all' || filterType === 'calving') {
      allRecords = [...allRecords, ...(calvingRecords || []).map(record => ({ ...record, type: 'calving' }))];
    }

    // Sort by date (newest first)
    allRecords.sort((a, b) => {
      const dateA = new Date(a.breedingDate || a.calvingDate);
      const dateB = new Date(b.breedingDate || b.calvingDate);
      return dateB - dateA;
    });

    setFilteredRecords(allRecords);
  };

  const calculateStats = () => {
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const successfulBreedings = (breedingRecords || []).filter(record => 
      record.success === 'successful' || record.success === 'confirmed_pregnant'
    ).length;

    const upcomingCalvings = (breedingRecords || []).filter(record => 
      record.expectedCalvingDate && 
      new Date(record.expectedCalvingDate) <= nextMonth &&
      record.success === 'confirmed_pregnant'
    ).length;

    const healthyCalves = (calvingRecords || []).filter(record => 
      record.calfHealth === 'healthy'
    ).length;

    const pregnancyRate = (breedingRecords || []).length > 0 
      ? (successfulBreedings / breedingRecords.length) * 100 
      : 0;

    setStats({
      totalBreedings: (breedingRecords || []).length,
      successfulBreedings,
      totalCalvings: (calvingRecords || []).length,
      upcomingCalvings,
      healthyCalves,
      pregnancyRate
    });
  };

  const handleAddBreeding = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/miraj-industries/breeding-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cowId: newBreeding.cowId,
          breedingDate: newBreeding.breedingDate,
          method: newBreeding.method,
          success: newBreeding.success,
          notes: newBreeding.notes || '',
          expectedCalvingDate: newBreeding.expectedCalvingDate || ''
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'প্রজনন রেকর্ড যোগ করা হয়েছে',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowAddBreedingModal(false);
        resetBreedingForm();
        // Refresh records
        const refreshResponse = await fetch('/api/miraj-industries/breeding-records');
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setBreedingRecords(refreshData.records || []);
        }
      } else {
        throw new Error(data.error || 'Failed to create breeding record');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'প্রজনন রেকর্ড যোগ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBreeding = async () => {
    if (!editingBreeding) return;
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/miraj-industries/breeding-records/${editingBreeding.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breedingDate: editingBreeding.breedingDate,
          method: editingBreeding.method,
          success: editingBreeding.success,
          notes: editingBreeding.notes || '',
          expectedCalvingDate: editingBreeding.expectedCalvingDate || ''
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'প্রজনন রেকর্ড আপডেট করা হয়েছে',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowEditBreedingModal(false);
        setEditingBreeding(null);
        // Refresh records
        const refreshResponse = await fetch('/api/miraj-industries/breeding-records');
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setBreedingRecords(refreshData.records || []);
        }
      } else {
        throw new Error(data.error || 'Failed to update breeding record');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'প্রজনন রেকর্ড আপডেট করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBreeding = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই প্রজনন রেকর্ড মুছে ফেলা হবে',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/miraj-industries/breeding-records/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (response.ok) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'প্রজনন রেকর্ড সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          // Refresh records
          const refreshResponse = await fetch('/api/miraj-industries/breeding-records');
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok) {
            setBreedingRecords(refreshData.records || []);
          }
        } else {
          throw new Error(data.error || 'Failed to delete breeding record');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'প্রজনন রেকর্ড মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const handleAddCalving = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/miraj-industries/calving-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cowId: newCalving.cowId,
          calvingDate: newCalving.calvingDate,
          calfGender: newCalving.calfGender,
          calfWeight: Number(newCalving.calfWeight) || 0,
          calfHealth: newCalving.calfHealth,
          calvingType: newCalving.calvingType,
          complications: newCalving.complications || '',
          notes: newCalving.notes || '',
          calfId: newCalving.calfId || ''
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'বাচ্চা প্রসব রেকর্ড যোগ করা হয়েছে',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowAddCalvingModal(false);
        resetCalvingForm();
        // Refresh records
        const refreshResponse = await fetch('/api/miraj-industries/calving-records');
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setCalvingRecords(refreshData.records || []);
        }
      } else {
        throw new Error(data.error || 'Failed to create calving record');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'বাচ্চা প্রসব রেকর্ড যোগ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCalving = async () => {
    if (!editingCalving) return;
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/miraj-industries/calving-records/${editingCalving.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calvingDate: editingCalving.calvingDate,
          calfGender: editingCalving.calfGender,
          calfWeight: Number(editingCalving.calfWeight) || 0,
          calfHealth: editingCalving.calfHealth,
          calvingType: editingCalving.calvingType,
          complications: editingCalving.complications || '',
          notes: editingCalving.notes || '',
          calfId: editingCalving.calfId || ''
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'বাচ্চা প্রসব রেকর্ড আপডেট করা হয়েছে',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowEditCalvingModal(false);
        setEditingCalving(null);
        // Refresh records
        const refreshResponse = await fetch('/api/miraj-industries/calving-records');
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setCalvingRecords(refreshData.records || []);
        }
      } else {
        throw new Error(data.error || 'Failed to update calving record');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'বাচ্চা প্রসব রেকর্ড আপডেট করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCalving = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই বাচ্চা প্রসব রেকর্ড মুছে ফেলা হবে',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/miraj-industries/calving-records/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (response.ok) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'বাচ্চা প্রসব রেকর্ড সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          // Refresh records
          const refreshResponse = await fetch('/api/miraj-industries/calving-records');
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok) {
            setCalvingRecords(refreshData.records || []);
          }
        } else {
          throw new Error(data.error || 'Failed to delete calving record');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'বাচ্চা প্রসব রেকর্ড মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const resetBreedingForm = () => {
    setNewBreeding({
      cowId: '',
      breedingDate: new Date().toISOString().split('T')[0],
      method: 'natural',
      success: 'pending',
      notes: '',
      expectedCalvingDate: ''
    });
  };

  const resetCalvingForm = () => {
    setNewCalving({
      cowId: '',
      calvingDate: new Date().toISOString().split('T')[0],
      calfGender: '',
      calfWeight: '',
      calfHealth: 'healthy',
      calvingType: 'normal',
      complications: '',
      notes: '',
      calfId: ''
    });
  };

  const getRecordIcon = (type) => {
    switch (type) {
      case 'breeding':
        return <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />;
      case 'calving':
        return <Baby className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getSuccessStatusClass = (status) => {
    const statusObj = successStatusOptions.find(opt => opt.value === status);
    return statusObj ? statusObj.color : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
  };

  const getCalfHealthClass = (health) => {
    const healthObj = calfHealthOptions.find(opt => opt.value === health);
    return healthObj ? healthObj.color : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
  };

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">প্রজনন ও বাচ্চা প্রসব রেকর্ড</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">গরুর প্রজনন ও বাচ্চা প্রসবের তথ্য ব্যবস্থাপনা</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddBreedingModal(true)}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 flex items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              প্রজনন রেকর্ড
            </button>
            <button 
              onClick={() => setShowAddCalvingModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Baby className="w-5 h-5" />
              বাচ্চা প্রসব
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট প্রজনন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBreedings}</p>
              </div>
              <div className="bg-pink-100 dark:bg-pink-900/20 p-3 rounded-full">
                <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-pink-600 dark:text-pink-400">
              <Activity className="w-4 h-4 mr-1" />
              <span>{stats.pregnancyRate.toFixed(1)}% সফলতা</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">সফল প্রজনন</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.successfulBreedings}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>গর্ভধারণ নিশ্চিত</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বাচ্চা প্রসব</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCalvings}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                <Baby className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400">
              <Baby className="w-4 h-4 mr-1" />
              <span>{stats.healthyCalves} সুস্থ বাচ্চা</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আসন্ন প্রসব</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.upcomingCalvings}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-full">
                <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span>এই মাসে</span>
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
                  placeholder="গরুর নাম, ষাঁড়ের নাম বা বাচ্চার ID দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">সব রেকর্ড</option>
                <option value="breeding">প্রজনন রেকর্ড</option>
                <option value="calving">বাচ্চা প্রসব রেকর্ড</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2">
                <Download className="w-5 h-5" />
                রিপোর্ট
              </button>
            </div>
          </div>
        </div>

        {/* Records List */}
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
                    ধরন
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    বিবরণ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    অবস্থা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ক্রিয়া
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      কোন রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                ) : filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(record.breedingDate || record.calvingDate).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{record.cowName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRecordIcon(record.type)}
                        <span className="text-sm text-gray-900 dark:text-white">
                          {record.type === 'breeding' ? 'প্রজনন' : 'বাচ্চা প্রসব'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {record.type === 'breeding' && (
                          <>
                            {record.bullName && <div>ষাঁড়: {record.bullName}</div>}
                            <div className="text-gray-500 dark:text-gray-400">
                              পদ্ধতি: {breedingMethodOptions.find(opt => opt.value === record.method)?.label}
                            </div>
                            {record.expectedCalvingDate && (
                              <div className="text-blue-600 dark:text-blue-400">
                                প্রত্যাশিত প্রসব: {new Date(record.expectedCalvingDate).toLocaleDateString('bn-BD')}
                              </div>
                            )}
                          </>
                        )}
                        {record.type === 'calving' && (
                          <>
                            <div>বাচ্চা: {record.calfGender === 'male' ? 'ষাঁড়' : 'মহিষা'}</div>
                            <div className="text-gray-500 dark:text-gray-400">
                              ওজন: {record.calfWeight} কেজি | ধরন: {record.calvingType}
                            </div>
                            {record.calfId && (
                              <div className="text-purple-600 dark:text-purple-400">ID: {record.calfId}</div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.type === 'breeding' && record.success && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSuccessStatusClass(record.success)}`}>
                          {successStatusOptions.find(opt => opt.value === record.success)?.label}
                        </span>
                      )}
                      {record.type === 'calving' && record.calfHealth && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCalfHealthClass(record.calfHealth)}`}>
                          {calfHealthOptions.find(opt => opt.value === record.calfHealth)?.label}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (record.type === 'breeding') {
                              setEditingBreeding(record);
                              setShowEditBreedingModal(true);
                            } else {
                              setEditingCalving(record);
                              setShowEditCalvingModal(true);
                            }
                          }}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (record.type === 'breeding') {
                              handleDeleteBreeding(record.id);
                            } else {
                              handleDeleteCalving(record.id);
                            }
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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

        {/* Add Breeding Modal */}
        {showAddBreedingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">প্রজনন রেকর্ড যোগ করুন</h2>
                <button 
                  onClick={() => setShowAddBreedingModal(false)} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddBreeding(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গরু নির্বাচন করুন</label>
                  <select
                    required
                    value={newBreeding.cowId}
                    onChange={(e) => setNewBreeding({...newBreeding, cowId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">গরু নির্বাচন করুন</option>
                    {cattleList.filter(c => c.gender === 'female').map(cattle => (
                      <option key={cattle.id || cattle._id} value={cattle.id || cattle._id}>{cattle.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রজননের তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newBreeding.breedingDate}
                    onChange={(e) => setNewBreeding({...newBreeding, breedingDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রজননের পদ্ধতি</label>
                  <select
                    required
                    value={newBreeding.method}
                    onChange={(e) => setNewBreeding({...newBreeding, method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {breedingMethodOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">সফলতা</label>
                  <select
                    value={newBreeding.success}
                    onChange={(e) => setNewBreeding({...newBreeding, success: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {successStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রত্যাশিত প্রসব তারিখ</label>
                  <input
                    type="date"
                    value={newBreeding.expectedCalvingDate}
                    onChange={(e) => setNewBreeding({...newBreeding, expectedCalvingDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={newBreeding.notes}
                    onChange={(e) => setNewBreeding({...newBreeding, notes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddBreedingModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Calving Modal */}
        {showAddCalvingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">বাচ্চা প্রসব রেকর্ড</h2>
                <button 
                  onClick={() => setShowAddCalvingModal(false)} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddCalving(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গরু নির্বাচন করুন</label>
                  <select
                    required
                    value={newCalving.cowId}
                    onChange={(e) => setNewCalving({...newCalving, cowId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">গরু নির্বাচন করুন</option>
                    {cattleList.filter(c => c.gender === 'female').map(cattle => (
                      <option key={cattle.id || cattle._id} value={cattle.id || cattle._id}>{cattle.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রসবের তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newCalving.calvingDate}
                    onChange={(e) => setNewCalving({...newCalving, calvingDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বাচ্চার লিঙ্গ</label>
                    <select
                      required
                      value={newCalving.calfGender}
                      onChange={(e) => setNewCalving({...newCalving, calfGender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">লিঙ্গ নির্বাচন করুন</option>
                      <option value="male">ষাঁড়</option>
                      <option value="female">গাভী</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বাচ্চার ওজন (কেজি)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCalving.calfWeight}
                      onChange={(e) => setNewCalving({...newCalving, calfWeight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ওজন"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বাচ্চার স্বাস্থ্য</label>
                    <select
                      value={newCalving.calfHealth}
                      onChange={(e) => setNewCalving({...newCalving, calfHealth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {calfHealthOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রসবের ধরন</label>
                    <select
                      required
                      value={newCalving.calvingType}
                      onChange={(e) => setNewCalving({...newCalving, calvingType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">ধরন নির্বাচন করুন</option>
                      {calvingTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বাচ্চার ID</label>
                  <input
                    type="text"
                    value={newCalving.calfId}
                    onChange={(e) => setNewCalving({...newCalving, calfId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="বাচ্চার ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">জটিলতা (যদি থাকে)</label>
                  <textarea
                    value={newCalving.complications}
                    onChange={(e) => setNewCalving({...newCalving, complications: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="জটিলতা বা সমস্যার বিবরণ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={newCalving.notes}
                    onChange={(e) => setNewCalving({...newCalving, notes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCalvingModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Breeding Modal */}
        {showEditBreedingModal && editingBreeding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">প্রজনন রেকর্ড সম্পাদনা করুন</h2>
                <button 
                  onClick={() => { setShowEditBreedingModal(false); setEditingBreeding(null); }} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateBreeding(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গরু</label>
                  <input
                    type="text"
                    value={editingBreeding.cowName || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রজননের তারিখ</label>
                  <input
                    type="date"
                    required
                    value={editingBreeding.breedingDate || ''}
                    onChange={(e) => setEditingBreeding({...editingBreeding, breedingDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রজননের পদ্ধতি</label>
                  <select
                    required
                    value={editingBreeding.method || 'natural'}
                    onChange={(e) => setEditingBreeding({...editingBreeding, method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {breedingMethodOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">সফলতা</label>
                  <select
                    value={editingBreeding.success || 'pending'}
                    onChange={(e) => setEditingBreeding({...editingBreeding, success: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {successStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রত্যাশিত প্রসব তারিখ</label>
                  <input
                    type="date"
                    value={editingBreeding.expectedCalvingDate || ''}
                    onChange={(e) => setEditingBreeding({...editingBreeding, expectedCalvingDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={editingBreeding.notes || ''}
                    onChange={(e) => setEditingBreeding({...editingBreeding, notes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowEditBreedingModal(false); setEditingBreeding(null); }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Calving Modal */}
        {showEditCalvingModal && editingCalving && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">বাচ্চা প্রসব রেকর্ড সম্পাদনা করুন</h2>
                <button 
                  onClick={() => { setShowEditCalvingModal(false); setEditingCalving(null); }} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateCalving(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গরু</label>
                  <input
                    type="text"
                    value={editingCalving.cowName || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রসবের তারিখ</label>
                  <input
                    type="date"
                    required
                    value={editingCalving.calvingDate || ''}
                    onChange={(e) => setEditingCalving({...editingCalving, calvingDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বাচ্চার লিঙ্গ</label>
                    <select
                      required
                      value={editingCalving.calfGender || ''}
                      onChange={(e) => setEditingCalving({...editingCalving, calfGender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">লিঙ্গ নির্বাচন করুন</option>
                      <option value="male">ষাঁড়</option>
                      <option value="female">গাভী</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বাচ্চার ওজন (কেজি)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingCalving.calfWeight || ''}
                      onChange={(e) => setEditingCalving({...editingCalving, calfWeight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ওজন"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বাচ্চার স্বাস্থ্য</label>
                    <select
                      value={editingCalving.calfHealth || 'healthy'}
                      onChange={(e) => setEditingCalving({...editingCalving, calfHealth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {calfHealthOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রসবের ধরন</label>
                    <select
                      required
                      value={editingCalving.calvingType || ''}
                      onChange={(e) => setEditingCalving({...editingCalving, calvingType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">ধরন নির্বাচন করুন</option>
                      {calvingTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বাচ্চার ID</label>
                  <input
                    type="text"
                    value={editingCalving.calfId || ''}
                    onChange={(e) => setEditingCalving({...editingCalving, calfId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="বাচ্চার ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">জটিলতা (যদি থাকে)</label>
                  <textarea
                    value={editingCalving.complications || ''}
                    onChange={(e) => setEditingCalving({...editingCalving, complications: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="জটিলতা বা সমস্যার বিবরণ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={editingCalving.notes || ''}
                    onChange={(e) => setEditingCalving({...editingCalving, notes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowEditCalvingModal(false); setEditingCalving(null); }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Record Modal */}
        {showViewModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">রেকর্ড বিস্তারিত</h2>
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
                    <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.cowName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">তারিখ:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedRecord.breedingDate || selectedRecord.calvingDate).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
                
                {selectedRecord.type === 'breeding' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ষাঁড়:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.bullName || 'N/A'} {selectedRecord.bullId ? `(${selectedRecord.bullId})` : ''}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">পদ্ধতি:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {breedingMethodOptions.find(opt => opt.value === selectedRecord.method)?.label}
                        </p>
                      </div>
                    </div>
                    {selectedRecord.expectedCalvingDate && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">প্রত্যাশিত প্রসব তারিখ:</p>
                        <p className="font-medium text-blue-600 dark:text-blue-400">
                          {new Date(selectedRecord.expectedCalvingDate).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                {selectedRecord.type === 'calving' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">বাচ্চার লিঙ্গ:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.calfGender === 'male' ? 'ষাঁড়' : 'মহিষা'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ওজন:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.calfWeight} কেজি</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">প্রসবের ধরন:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.calvingType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">বাচ্চার ID:</p>
                        <p className="font-medium text-purple-600 dark:text-purple-400">{selectedRecord.calfId || 'N/A'}</p>
                      </div>
                    </div>
                    {selectedRecord.complications && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">জটিলতা:</p>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedRecord.complications}</p>
                      </div>
                    )}
                  </>
                )}
                
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

export default BreedingRecords;
