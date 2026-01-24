'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  TrendingUp,
  Calendar as CalendarIcon,
  Briefcase,
  CreditCard,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

const EmployeeManagement = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);
        params.append('limit', '1000');

        const response = await fetch(`/api/miraj-industries/farm-employees?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setEmployees(data.employees || []);
        } else {
          throw new Error(data.error || 'Failed to fetch employees');
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'কর্মচারী লোড করতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [searchTerm, filterStatus]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/miraj-industries/farm-employees/stats');
        const data = await response.json();

        if (response.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const [newAttendance, setNewAttendance] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present',
    notes: ''
  });

  const positionOptions = [
    'খামার ম্যানেজার',
    'গরু যত্নকারী',
    'দুধ সংগ্রহকারী',
    'খাদ্য ব্যবস্থাপক',
    'সিকিউরিটি গার্ড',
    'ড্রাইভার',
    'ক্লিনার',
    'অন্যান্য'
  ];

  const statusOptions = [
    { value: 'active', label: 'সক্রিয়', color: 'text-green-600 bg-green-100' },
    { value: 'inactive', label: 'নিষ্ক্রিয়', color: 'text-gray-600 bg-gray-100' },
    { value: 'on_leave', label: 'ছুটিতে', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'terminated', label: 'চাকরি ছাড়া', color: 'text-red-600 bg-red-100' }
  ];

  const attendanceStatusOptions = [
    { value: 'present', label: 'উপস্থিত', color: 'text-green-600 bg-green-100' },
    { value: 'absent', label: 'অনুপস্থিত', color: 'text-red-600 bg-red-100' },
    { value: 'late', label: 'দেরিতে', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'half_day', label: 'আধা দিন', color: 'text-blue-600 bg-blue-100' },
    { value: 'leave', label: 'ছুটি', color: 'text-purple-600 bg-purple-100' }
  ];

  // Filter employees client-side if needed (backend already filters)
  const filteredEmployees = useMemo(() => {
    return employees || [];
  }, [employees]);

  // Calculate total monthly salary from employees array
  const totalMonthlySalary = useMemo(() => {
    return (filteredEmployees || []).reduce((sum, emp) => {
      const salary = Number(emp.salary) || 0;
      return sum + salary;
    }, 0);
  }, [filteredEmployees]);

  const handleAddAttendance = async () => {
    try {
      // TODO: Implement attendance API
      Swal.fire({
        title: 'সতর্কতা!',
        text: 'উপস্থিতি রেকর্ড API এখনও তৈরি করা হয়নি',
        icon: 'warning',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#3b82f6',
      });
      setShowAttendanceModal(false);
      resetAttendanceForm();
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'উপস্থিতি রেকর্ড যোগ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDeleteEmployee = async (id) => {
    const employee = employees.find(emp => (emp.id || emp._id) === id);
    const employeeName = employee?.name || 'এই কর্মচারী';
    
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${employeeName} কে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/miraj-industries/farm-employees/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: `${employeeName} সফলভাবে মুছে ফেলা হয়েছে।`,
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            timer: 2000
          });
          // Refresh employees list
          const refreshResponse = await fetch('/api/miraj-industries/farm-employees?limit=1000');
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok) {
            setEmployees(refreshData.employees || []);
          }
        } else {
          throw new Error(data.error || 'Failed to delete employee');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'কর্মচারী মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    }
  };

  const resetAttendanceForm = () => {
    setNewAttendance({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      status: 'present',
      notes: ''
    });
  };

  const getStatusClass = (status) => {
    const statusObj = statusOptions.find(opt => opt.value === status);
    return statusObj ? statusObj.color : 'text-gray-600 bg-gray-100';
  };

  const getAttendanceStatusClass = (status) => {
    const statusObj = attendanceStatusOptions.find(opt => opt.value === status);
    return statusObj ? statusObj.color : 'text-gray-600 bg-gray-100';
  };

  // Calculate service duration in months
  const calculateServiceMonths = (joinDate) => {
    if (!joinDate) return 0;
    const join = new Date(joinDate);
    const now = new Date();
    const months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
    return Math.max(0, months);
  };

  // Calculate total salary received
  const calculateTotalSalaryReceived = (joinDate, monthlySalary) => {
    const months = calculateServiceMonths(joinDate);
    return months * (Number(monthlySalary) || 0);
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">লোড হচ্ছে...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">কর্মচারী ব্যবস্থাপনা</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">খামারের কর্মচারীদের তথ্য ও উপস্থিতি ব্যবস্থাপনা</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push('/miraj-industries/employee/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              কর্মচারী যোগ করুন
            </button>
            <button 
              onClick={() => setShowAttendanceModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Clock className="w-5 h-5" />
              উপস্থিতি রেকর্ড
            </button>
            <button 
              onClick={generateReport}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              রিপোর্ট
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট কর্মচারী</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEmployees || 0}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
              <User className="w-4 h-4 mr-1" />
              <span>{stats.activeEmployees || 0} সক্রিয়</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মাসিক বেতন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{totalMonthlySalary.toLocaleString('bn-BD')}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <CreditCard className="w-4 h-4 mr-1" />
              <span>সব কর্মচারীর</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আজ উপস্থিত</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.presentToday || 0}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>{stats.absentToday || 0} অনুপস্থিত</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মাসিক উপস্থিতি</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.monthlyAttendance || 0}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400">
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
                  placeholder="নাম, পদ বা ফোন নম্বর দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">সব অবস্থা</option>
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
                <option value="on_leave">ছুটিতে</option>
                <option value="terminated">চাকরি ছাড়া</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    কর্মচারীর নাম
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    পদবী
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    মোবাইল নং
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    যোগদানের তারিখ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    চাকরীরত(মাস)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    মাসিক বেতন
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    মোট গৃহীত বেতন
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    প্রদত্ত পরিমাণ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    বকেয়া পরিমাণ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    অবস্থা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    একশন
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      কোন কর্মচারী পাওয়া যায়নি
                    </td>
                  </tr>
                ) : filteredEmployees.map((employee) => {
                  const serviceMonths = calculateServiceMonths(employee.joinDate);
                  const totalSalaryReceived = calculateTotalSalaryReceived(employee.joinDate, employee.salary);
                  const employeeId = employee.id || employee._id;
                  
                  return (
                    <tr key={employeeId} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {employee.image ? (
                              <img
                                src={employee.image}
                                alt={employee.name}
                                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.name || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{employee.position || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{employee.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('bn-BD') : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{serviceMonths} মাস</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            ৳{Number(employee.salary || 0).toLocaleString('bn-BD')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            ৳{totalSalaryReceived.toLocaleString('bn-BD')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            ৳{Number(employee.paidAmount || 0).toLocaleString('bn-BD')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <DollarSign className={`w-4 h-4 ${Number(employee.totalDue || 0) > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                          <span className={`text-sm font-semibold ${Number(employee.totalDue || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            ৳{Number(employee.totalDue || 0).toLocaleString('bn-BD')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(employee.status)}`}>
                          {statusOptions.find(opt => opt.value === employee.status)?.label || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/miraj-industries/employee/${employeeId}`)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/miraj-industries/employee/${employeeId}/edit`);
                            }}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(employeeId);
                            }}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Attendance Modal */}
        {showAttendanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">উপস্থিতি রেকর্ড</h2>
                <button 
                  onClick={() => setShowAttendanceModal(false)} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddAttendance(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">কর্মচারী নির্বাচন করুন</label>
                  <select
                    required
                    value={newAttendance.employeeId}
                    onChange={(e) => setNewAttendance({...newAttendance, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">কর্মচারী নির্বাচন করুন</option>
                    {employees.filter(emp => emp.status === 'active').map(employee => {
                      const empId = employee.id || employee._id;
                      return (
                        <option key={empId} value={empId}>{employee.name} ({employee.position})</option>
                      );
                    })}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newAttendance.date}
                    onChange={(e) => setNewAttendance({...newAttendance, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">অবস্থা</label>
                  <select
                    required
                    value={newAttendance.status}
                    onChange={(e) => setNewAttendance({...newAttendance, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {attendanceStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                {newAttendance.status === 'present' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">আসার সময়</label>
                      <input
                        type="time"
                        value={newAttendance.checkIn}
                        onChange={(e) => setNewAttendance({...newAttendance, checkIn: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">যাওয়ার সময়</label>
                      <input
                        type="time"
                        value={newAttendance.checkOut}
                        onChange={(e) => setNewAttendance({...newAttendance, checkOut: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={newAttendance.notes}
                    onChange={(e) => setNewAttendance({...newAttendance, notes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAttendanceModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeManagement;
