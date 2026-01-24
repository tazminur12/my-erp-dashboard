'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Heart, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Stethoscope,
  Pill,
  Syringe,
  Download,
  Eye,
  Edit,
  Trash2,
  Bell,
  MapPin,
  Phone,
  User,
  FileText,
  Activity,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

const HealthRecords = () => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [vetVisits, setVetVisits] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showAddHealthModal, setShowAddHealthModal] = useState(false);
  const [showAddVaccinationModal, setShowAddVaccinationModal] = useState(false);
  const [showAddVetVisitModal, setShowAddVetVisitModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newHealthRecord, setNewHealthRecord] = useState({
    cattleId: '',
    date: new Date().toISOString().split('T')[0],
    condition: '',
    symptoms: '',
    treatment: '',
    medication: '',
    dosage: '',
    duration: '',
    vetName: '',
    notes: '',
    status: 'under_treatment'
  });

  const [newVaccination, setNewVaccination] = useState({
    cattleId: '',
    vaccineName: '',
    date: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    batchNumber: '',
    vetName: '',
    notes: '',
    status: 'completed'
  });

  const [newVetVisit, setNewVetVisit] = useState({
    cattleId: '',
    date: new Date().toISOString().split('T')[0],
    visitType: '',
    vetName: '',
    clinic: '',
    purpose: '',
    diagnosis: '',
    treatment: '',
    followUpDate: '',
    cost: '',
    notes: ''
  });

  const conditionOptions = [
    'সুস্থ',
    'জ্বর',
    'ডায়রিয়া',
    'খাবারে অনীহা',
    'হাঁটাচলায় সমস্যা',
    'শ্বাসকষ্ট',
    'খোঁচা বা আঘাত',
    'প্রজনন সমস্যা',
    'দুধ কম উৎপাদন',
    'অন্যান্য'
  ];

  const vaccineOptions = [
    'FMD (Foot and Mouth Disease)',
    'Anthrax',
    'Black Quarter',
    'HS (Hemorrhagic Septicemia)',
    'PPR (Peste des Petits Ruminants)',
    'Rabies',
    'Brucellosis',
    'Tuberculosis',
    'Mastitis Prevention',
    'অন্যান্য'
  ];

  const visitTypeOptions = [
    'রুটিন চেকআপ',
    'জরুরী চিকিৎসা',
    'টিকা',
    'সার্জারি',
    'প্রজনন পরামর্শ',
    'নিয়মিত পরীক্ষা',
    'অন্যান্য'
  ];

  const statusOptions = [
    { value: 'healthy', label: 'সুস্থ', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' },
    { value: 'under_treatment', label: 'চিকিৎসাধীন', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' },
    { value: 'recovered', label: 'সুস্থ হয়ে উঠেছে', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20' },
    { value: 'chronic', label: 'দীর্ঘমেয়াদী', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' }
  ];

  const [stats, setStats] = useState({
    totalRecords: 0,
    sickCattle: 0,
    upcomingVaccinations: 0,
    monthlyVetCost: 0,
    healthyCattle: 0,
    underTreatment: 0
  });

  // Fetch cattle list
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

  // Fetch all records
  useEffect(() => {
    const fetchAllRecords = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (filterDate) params.append('date', filterDate);

        const [healthRes, vaccRes, vetRes] = await Promise.all([
          fetch(`/api/miraj-industries/health-records?${params.toString()}`),
          fetch(`/api/miraj-industries/vaccination-records?${params.toString()}`),
          fetch(`/api/miraj-industries/vet-visits?${params.toString()}`)
        ]);

        const healthData = await healthRes.json();
        const vaccData = await vaccRes.json();
        const vetData = await vetRes.json();

        if (healthRes.ok) {
          setHealthRecords(healthData.records || healthData.data || []);
        }
        if (vaccRes.ok) {
          setVaccinations(vaccData.records || vaccData.data || []);
        }
        if (vetRes.ok) {
          setVetVisits(vetData.records || vetData.data || []);
        }
      } catch (error) {
        console.error('Error fetching records:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'রেকর্ড লোড করতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRecords();
  }, [searchTerm, filterDate]);

  // Filter and combine records
  useEffect(() => {
    filterRecords();
    calculateStats();
  }, [healthRecords, vaccinations, vetVisits, filterType]);

  const filterRecords = () => {
    let allRecords = [];
    
    if (filterType === 'all' || filterType === 'health') {
      allRecords = [...allRecords, ...healthRecords.map(record => ({ ...record, type: 'health' }))];
    }
    
    if (filterType === 'all' || filterType === 'vaccination') {
      allRecords = [...allRecords, ...vaccinations.map(record => ({ ...record, type: 'vaccination' }))];
    }
    
    if (filterType === 'all' || filterType === 'vet_visit') {
      allRecords = [...allRecords, ...vetVisits.map(record => ({ ...record, type: 'vet_visit' }))];
    }

    // Sort by date (newest first)
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredRecords(allRecords);
  };

  const calculateStats = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingVaccinations = vaccinations.filter(vaccination => 
      vaccination.nextDueDate && new Date(vaccination.nextDueDate) <= nextWeek
    ).length;

    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyVetCost = vetVisits
      .filter(visit => visit.date && visit.date.startsWith(thisMonth))
      .reduce((sum, visit) => sum + (visit.cost || 0), 0);

    const sickCattle = healthRecords.filter(record => 
      record.status === 'under_treatment'
    ).length;

    const healthyCattle = healthRecords.filter(record => 
      record.status === 'recovered' || record.status === 'healthy'
    ).length;

    setStats({
      totalRecords: healthRecords.length + vaccinations.length + vetVisits.length,
      sickCattle,
      upcomingVaccinations,
      monthlyVetCost,
      healthyCattle,
      underTreatment: healthRecords.filter(record => record.status === 'under_treatment').length
    });
  };

  const handleAddHealthRecord = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/miraj-industries/health-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHealthRecord)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'স্বাস্থ্য রেকর্ড যোগ করা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে'
        });
        setShowAddHealthModal(false);
        resetHealthForm();
        // Refresh records
        const healthRes = await fetch('/api/miraj-industries/health-records');
        const healthData = await healthRes.json();
        if (healthRes.ok) {
          setHealthRecords(healthData.records || healthData.data || []);
        }
      } else {
        throw new Error(data.error || 'Failed to create health record');
      }
    } catch (error) {
      console.error('Error creating health record:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'স্বাস্থ্য রেকর্ড যোগ করতে ব্যর্থ হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVaccination = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/miraj-industries/vaccination-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVaccination)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'টিকা রেকর্ড যোগ করা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে'
        });
        setShowAddVaccinationModal(false);
        resetVaccinationForm();
        // Refresh records
        const vaccRes = await fetch('/api/miraj-industries/vaccination-records');
        const vaccData = await vaccRes.json();
        if (vaccRes.ok) {
          setVaccinations(vaccData.records || vaccData.data || []);
        }
      } else {
        throw new Error(data.error || 'Failed to create vaccination record');
      }
    } catch (error) {
      console.error('Error creating vaccination record:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'টিকা রেকর্ড যোগ করতে ব্যর্থ হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVetVisit = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/miraj-industries/vet-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVetVisit)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'চিকিৎসক পরিদর্শন রেকর্ড যোগ করা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে'
        });
        setShowAddVetVisitModal(false);
        resetVetVisitForm();
        // Refresh records
        const vetRes = await fetch('/api/miraj-industries/vet-visits');
        const vetData = await vetRes.json();
        if (vetRes.ok) {
          setVetVisits(vetData.records || vetData.data || []);
        }
      } else {
        throw new Error(data.error || 'Failed to create vet visit record');
      }
    } catch (error) {
      console.error('Error creating vet visit record:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'চিকিৎসক পরিদর্শন রেকর্ড যোগ করতে ব্যর্থ হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetHealthForm = () => {
    setNewHealthRecord({
      cattleId: '',
      date: new Date().toISOString().split('T')[0],
      condition: '',
      symptoms: '',
      treatment: '',
      medication: '',
      dosage: '',
      duration: '',
      vetName: '',
      notes: '',
      status: 'under_treatment'
    });
  };

  const resetVaccinationForm = () => {
    setNewVaccination({
      cattleId: '',
      vaccineName: '',
      date: new Date().toISOString().split('T')[0],
      nextDueDate: '',
      batchNumber: '',
      vetName: '',
      notes: '',
      status: 'completed'
    });
  };

  const resetVetVisitForm = () => {
    setNewVetVisit({
      cattleId: '',
      date: new Date().toISOString().split('T')[0],
      visitType: '',
      vetName: '',
      clinic: '',
      purpose: '',
      diagnosis: '',
      treatment: '',
      followUpDate: '',
      cost: '',
      notes: ''
    });
  };

  const getRecordIcon = (type) => {
    switch (type) {
      case 'health':
        return <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'vaccination':
        return <Syringe className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'vet_visit':
        return <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusClass = (status) => {
    const statusObj = statusOptions.find(opt => opt.value === status);
    return statusObj ? statusObj.color : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">স্বাস্থ্য ও পশুচিকিৎসা রেকর্ড</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">গরুর স্বাস্থ্য, টিকা ও চিকিৎসার রেকর্ড</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddHealthModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 dark:bg-red-700 dark:hover:bg-red-800"
            >
              <Heart className="w-5 h-5" />
              স্বাস্থ্য রেকর্ড
            </button>
            <button 
              onClick={() => setShowAddVaccinationModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <Syringe className="w-5 h-5" />
              টিকা রেকর্ড
            </button>
            <button 
              onClick={() => setShowAddVetVisitModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <Stethoscope className="w-5 h-5" />
              চিকিৎসক পরিদর্শন
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট রেকর্ড</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRecords}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4 mr-1" />
              <span>সব রেকর্ড</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অসুস্থ গরু</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.sickCattle}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600 dark:text-red-400">
              <Heart className="w-4 h-4 mr-1" />
              <span>চিকিৎসা প্রয়োজন</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আসন্ন টিকা</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.upcomingVaccinations}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-full">
                <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span>এই সপ্তাহে</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মাসিক চিকিৎসা খরচ</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{stats.monthlyVetCost.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <Stethoscope className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <span>এই মাসের খরচ</span>
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
                  placeholder="গরুর নাম, অবস্থা বা চিকিৎসকের নাম দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">সব রেকর্ড</option>
                <option value="health">স্বাস্থ্য রেকর্ড</option>
                <option value="vaccination">টিকা রেকর্ড</option>
                <option value="vet_visit">চিকিৎসক পরিদর্শন</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2 dark:bg-gray-700 dark:hover:bg-gray-600">
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
              <thead className="bg-gray-50 dark:bg-gray-700">
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
                    চিকিৎসক
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
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      কোন রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {record.date ? new Date(record.date).toLocaleDateString('bn-BD') : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{record.cattleName || ''}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{record.cattleDisplayId || record.cattleId || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getRecordIcon(record.type)}
                          <span className="text-sm text-gray-900 dark:text-white">
                            {record.type === 'health' ? 'স্বাস্থ্য' : 
                             record.type === 'vaccination' ? 'টিকা' : 'চিকিৎসক পরিদর্শন'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {record.type === 'health' && record.condition}
                          {record.type === 'vaccination' && record.vaccineName}
                          {record.type === 'vet_visit' && record.visitType}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {record.type === 'health' && record.symptoms}
                          {record.type === 'vaccination' && record.notes}
                          {record.type === 'vet_visit' && record.purpose}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{record.vetName || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.status && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(record.status)}`}>
                            {statusOptions.find(opt => opt.value === record.status)?.label || record.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Health Record Modal */}
        {showAddHealthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold dark:text-white">স্বাস্থ্য রেকর্ড যোগ করুন</h2>
                <button onClick={() => setShowAddHealthModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddHealthRecord(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গরু নির্বাচন করুন</label>
                    <select
                      required
                      value={newHealthRecord.cattleId}
                      onChange={(e) => setNewHealthRecord({...newHealthRecord, cattleId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">গরু নির্বাচন করুন</option>
                      {cattleList.map(cattle => (
                        <option key={cattle._id || cattle.id} value={cattle._id || cattle.id}>
                          {cattle.name || ''} {cattle.tagNumber ? `(${cattle.tagNumber})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">তারিখ</label>
                    <input
                      type="date"
                      required
                      value={newHealthRecord.date}
                      onChange={(e) => setNewHealthRecord({...newHealthRecord, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">অবস্থা</label>
                    <select
                      required
                      value={newHealthRecord.condition}
                      onChange={(e) => setNewHealthRecord({...newHealthRecord, condition: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">অবস্থা নির্বাচন করুন</option>
                      {conditionOptions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">অবস্থা</label>
                    <select
                      value={newHealthRecord.status}
                      onChange={(e) => setNewHealthRecord({...newHealthRecord, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">লক্ষণ</label>
                  <textarea
                    required
                    value={newHealthRecord.symptoms}
                    onChange={(e) => setNewHealthRecord({...newHealthRecord, symptoms: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="গরুর লক্ষণসমূহ লিখুন"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">চিকিৎসা</label>
                  <textarea
                    value={newHealthRecord.treatment}
                    onChange={(e) => setNewHealthRecord({...newHealthRecord, treatment: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="প্রদান করা চিকিৎসা"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ওষুধ</label>
                    <input
                      type="text"
                      value={newHealthRecord.medication}
                      onChange={(e) => setNewHealthRecord({...newHealthRecord, medication: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="ওষুধের নাম"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">মাত্রা</label>
                    <input
                      type="text"
                      value={newHealthRecord.dosage}
                      onChange={(e) => setNewHealthRecord({...newHealthRecord, dosage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="ওষুধের মাত্রা"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">সময়কাল</label>
                    <input
                      type="text"
                      value={newHealthRecord.duration}
                      onChange={(e) => setNewHealthRecord({...newHealthRecord, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="কতদিন খাওয়াতে হবে"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">চিকিৎসকের নাম</label>
                  <input
                    type="text"
                    value={newHealthRecord.vetName}
                    onChange={(e) => setNewHealthRecord({...newHealthRecord, vetName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="চিকিৎসকের নাম"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={newHealthRecord.notes}
                    onChange={(e) => setNewHealthRecord({...newHealthRecord, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য বা নির্দেশনা"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddHealthModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Vaccination Modal */}
        {showAddVaccinationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold dark:text-white">টিকা রেকর্ড যোগ করুন</h2>
                <button onClick={() => setShowAddVaccinationModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddVaccination(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গরু নির্বাচন করুন</label>
                  <select
                    required
                    value={newVaccination.cattleId}
                    onChange={(e) => setNewVaccination({...newVaccination, cattleId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">গরু নির্বাচন করুন</option>
                    {cattleList.map(cattle => (
                      <option key={cattle._id || cattle.id} value={cattle._id || cattle.id}>
                        {cattle.name || ''} {cattle.tagNumber ? `(${cattle.tagNumber})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">টিকার নাম</label>
                  <select
                    required
                    value={newVaccination.vaccineName}
                    onChange={(e) => setNewVaccination({...newVaccination, vaccineName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">টিকা নির্বাচন করুন</option>
                    {vaccineOptions.map(vaccine => (
                      <option key={vaccine} value={vaccine}>{vaccine}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">টিকা দেওয়ার তারিখ</label>
                    <input
                      type="date"
                      required
                      value={newVaccination.date}
                      onChange={(e) => setNewVaccination({...newVaccination, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পরবর্তী তারিখ</label>
                    <input
                      type="date"
                      value={newVaccination.nextDueDate}
                      onChange={(e) => setNewVaccination({...newVaccination, nextDueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ব্যাচ নম্বর</label>
                    <input
                      type="text"
                      value={newVaccination.batchNumber}
                      onChange={(e) => setNewVaccination({...newVaccination, batchNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="টিকার ব্যাচ নম্বর"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">চিকিৎসকের নাম</label>
                    <input
                      type="text"
                      value={newVaccination.vetName}
                      onChange={(e) => setNewVaccination({...newVaccination, vetName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="চিকিৎসকের নাম"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={newVaccination.notes}
                    onChange={(e) => setNewVaccination({...newVaccination, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddVaccinationModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Vet Visit Modal */}
        {showAddVetVisitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold dark:text-white">চিকিৎসক পরিদর্শন রেকর্ড</h2>
                <button onClick={() => setShowAddVetVisitModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddVetVisit(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গরু নির্বাচন করুন</label>
                    <select
                      required
                      value={newVetVisit.cattleId}
                      onChange={(e) => setNewVetVisit({...newVetVisit, cattleId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">গরু নির্বাচন করুন</option>
                      {cattleList.map(cattle => (
                        <option key={cattle._id || cattle.id} value={cattle._id || cattle.id}>
                          {cattle.name || ''} {cattle.tagNumber ? `(${cattle.tagNumber})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">তারিখ</label>
                    <input
                      type="date"
                      required
                      value={newVetVisit.date}
                      onChange={(e) => setNewVetVisit({...newVetVisit, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পরিদর্শনের ধরন</label>
                    <select
                      required
                      value={newVetVisit.visitType}
                      onChange={(e) => setNewVetVisit({...newVetVisit, visitType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">ধরন নির্বাচন করুন</option>
                      {visitTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">চিকিৎসকের নাম</label>
                    <input
                      type="text"
                      required
                      value={newVetVisit.vetName}
                      onChange={(e) => setNewVetVisit({...newVetVisit, vetName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="চিকিৎসকের নাম"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ক্লিনিক/হাসপাতাল</label>
                    <input
                      type="text"
                      value={newVetVisit.clinic}
                      onChange={(e) => setNewVetVisit({...newVetVisit, clinic: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="ক্লিনিকের নাম"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">খরচ (৳)</label>
                    <input
                      type="number"
                      value={newVetVisit.cost}
                      onChange={(e) => setNewVetVisit({...newVetVisit, cost: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="খরচ"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">উদ্দেশ্য</label>
                  <input
                    type="text"
                    value={newVetVisit.purpose}
                    onChange={(e) => setNewVetVisit({...newVetVisit, purpose: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="পরিদর্শনের উদ্দেশ্য"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">রোগ নির্ণয়</label>
                  <textarea
                    value={newVetVisit.diagnosis}
                    onChange={(e) => setNewVetVisit({...newVetVisit, diagnosis: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="রোগ নির্ণয়"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">চিকিৎসা</label>
                  <textarea
                    value={newVetVisit.treatment}
                    onChange={(e) => setNewVetVisit({...newVetVisit, treatment: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="প্রদান করা চিকিৎসা"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পুনরায় দেখা</label>
                  <input
                    type="date"
                    value={newVetVisit.followUpDate}
                    onChange={(e) => setNewVetVisit({...newVetVisit, followUpDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={newVetVisit.notes}
                    onChange={(e) => setNewVetVisit({...newVetVisit, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য বা নির্দেশনা"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddVetVisitModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Record Modal */}
        {showViewModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold dark:text-white">রেকর্ড বিস্তারিত</h2>
                <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">গরু:</p>
                    <p className="font-medium dark:text-white">{selectedRecord.cattleName || ''} ({selectedRecord.cattleDisplayId || selectedRecord.cattleId || ''})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">তারিখ:</p>
                    <p className="font-medium dark:text-white">
                      {selectedRecord.date ? new Date(selectedRecord.date).toLocaleDateString('bn-BD') : ''}
                    </p>
                  </div>
                </div>
                
                {selectedRecord.type === 'health' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">অবস্থা:</p>
                      <p className="font-medium dark:text-white">{selectedRecord.condition || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">লক্ষণ:</p>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedRecord.symptoms || ''}</p>
                    </div>
                    {selectedRecord.treatment && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">চিকিৎসা:</p>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedRecord.treatment || ''}</p>
                      </div>
                    )}
                    {selectedRecord.medication && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ওষুধ:</p>
                        <p className="font-medium dark:text-white">{selectedRecord.medication || ''}</p>
                        {selectedRecord.dosage && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">মাত্রা: {selectedRecord.dosage}</p>
                        )}
                        {selectedRecord.duration && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">সময়কাল: {selectedRecord.duration}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
                
                {selectedRecord.type === 'vaccination' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">টিকার নাম:</p>
                      <p className="font-medium dark:text-white">{selectedRecord.vaccineName || ''}</p>
                    </div>
                    {selectedRecord.nextDueDate && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">পরবর্তী তারিখ:</p>
                        <p className="font-medium dark:text-white">
                          {new Date(selectedRecord.nextDueDate).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    )}
                    {selectedRecord.batchNumber && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ব্যাচ নম্বর:</p>
                        <p className="font-medium dark:text-white">{selectedRecord.batchNumber}</p>
                      </div>
                    )}
                  </>
                )}
                
                {selectedRecord.type === 'vet_visit' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">পরিদর্শনের ধরন:</p>
                      <p className="font-medium dark:text-white">{selectedRecord.visitType || ''}</p>
                    </div>
                    {selectedRecord.clinic && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ক্লিনিক:</p>
                        <p className="font-medium dark:text-white">{selectedRecord.clinic}</p>
                      </div>
                    )}
                    {selectedRecord.purpose && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">উদ্দেশ্য:</p>
                        <p className="font-medium dark:text-white">{selectedRecord.purpose}</p>
                      </div>
                    )}
                    {selectedRecord.diagnosis && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">রোগ নির্ণয়:</p>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedRecord.diagnosis}</p>
                      </div>
                    )}
                    {selectedRecord.treatment && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">চিকিৎসা:</p>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedRecord.treatment}</p>
                      </div>
                    )}
                    {selectedRecord.cost > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">খরচ:</p>
                        <p className="font-medium dark:text-white">৳{selectedRecord.cost.toLocaleString()}</p>
                      </div>
                    )}
                    {selectedRecord.followUpDate && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">পুনরায় দেখা:</p>
                        <p className="font-medium dark:text-white">
                          {new Date(selectedRecord.followUpDate).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                {selectedRecord.vetName && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">চিকিৎসক:</p>
                    <p className="font-medium dark:text-white">{selectedRecord.vetName}</p>
                  </div>
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

export default HealthRecords;
