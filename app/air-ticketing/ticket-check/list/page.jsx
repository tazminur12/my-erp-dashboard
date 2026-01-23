'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Plane,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  Loader2,
  DollarSign,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

// Modal Component
const Modal = ({ isOpen, onClose, title, size = 'md', children }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const TicketCheckList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'completed', 'pending', 'cancelled'
  const [page, setPage] = useState(1);
  const limit = 20;

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingAirlines, setIsLoadingAirlines] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTicketCheck, setLoadingTicketCheck] = useState(false);

  // Data states
  const [ticketChecks, setTicketChecks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [employeesData, setEmployeesData] = useState(null);
  const [airlinesData, setAirlinesData] = useState(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTicketCheckId, setSelectedTicketCheckId] = useState(null);
  const [selectedTicketCheck, setSelectedTicketCheck] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Fetch ticket checks
  useEffect(() => {
    const fetchTicketChecks = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (searchTerm) {
          params.append('q', searchTerm);
        }
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }

        const response = await fetch(`/api/ticket-checks?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setTicketChecks(data.ticketChecks || data.data || []);
          setPagination(data.pagination || { page: 1, pages: 1, total: 0, limit: 20 });
        } else {
          throw new Error(data.error || 'Failed to fetch ticket checks');
        }
      } catch (error) {
        console.error('Error fetching ticket checks:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'টিকেট চেক লোড করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        setTicketChecks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicketChecks();
  }, [page, searchTerm, statusFilter]);

  // Fetch employees for reservation officers
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const response = await fetch('/api/employees?status=active&limit=1000');
        const data = await response.json();
        if (response.ok) {
          setEmployeesData(data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch airlines for dropdown
  useEffect(() => {
    const fetchAirlines = async () => {
      setIsLoadingAirlines(true);
      try {
        const response = await fetch('/api/airlines?limit=100');
        const data = await response.json();
        if (response.ok) {
          setAirlinesData(data);
        }
      } catch (error) {
        console.error('Error fetching airlines:', error);
      } finally {
        setIsLoadingAirlines(false);
      }
    };
    fetchAirlines();
  }, []);

  // Reservation officers list
  const reservationOfficers = useMemo(() => {
    if (!employeesData?.employees) return [];
    return employeesData.employees.map(emp => ({
      id: emp._id || emp.id || emp.employeeId,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.fullName || emp.name || emp.employeeId || 'Unknown'
    }));
  }, [employeesData]);

  // Airlines list
  const airlinesList = useMemo(() => {
    if (!airlinesData?.airlines || airlinesData.airlines.length === 0) {
      return [];
    }
    return airlinesData.airlines
      .filter(airline => {
        const isActive = airline.status === 'Active' || airline.status === 'active' || airline.isActive === true;
        return isActive;
      })
      .map(airline => {
        const name = airline.name || airline.airlineName || airline.airline_name || airline.companyName || airline.tradeName;
        return name;
      })
      .filter(Boolean)
      .sort();
  }, [airlinesData]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalChecks = pagination.total || ticketChecks.length;
    // Note: Status tracking will be added later when backend supports it
    return [
      { label: 'মোট চেক', value: totalChecks, color: 'blue', icon: FileCheck },
      { label: 'সম্পন্ন', value: '0', color: 'green', icon: CheckCircle },
      { label: 'অপেক্ষমাণ', value: '0', color: 'yellow', icon: Clock },
      { label: 'এই মাসে', value: totalChecks, color: 'purple', icon: Calendar }
    ];
  }, [ticketChecks, pagination.total]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই টিকেট চেক মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/ticket-checks/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'টিকেট চেক সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          // Refetch ticket checks
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          if (searchTerm) params.append('q', searchTerm);
          if (statusFilter !== 'all') params.append('status', statusFilter);
          const refetchResponse = await fetch(`/api/ticket-checks?${params.toString()}`);
          const refetchData = await refetchResponse.json();
          if (refetchResponse.ok) {
            setTicketChecks(refetchData.ticketChecks || refetchData.data || []);
            setPagination(refetchData.pagination || pagination);
          }
        } else {
          throw new Error(data.error || 'Failed to delete ticket check');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'টিকেট চেক মুছে ফেলতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };
  
  const handleEdit = async (ticket) => {
    const ticketId = ticket._id || ticket.id;
    setSelectedTicketCheckId(ticketId);
    setShowEditModal(true);
    setLoadingTicketCheck(true);
    
    try {
      const response = await fetch(`/api/ticket-checks/${ticketId}`);
      const data = await response.json();
      
      if (response.ok && data.ticketCheck) {
        setSelectedTicketCheck(data.ticketCheck);
        setEditFormData({
          passengerName: data.ticketCheck.passengerName || '',
          travellingCountry: data.ticketCheck.travellingCountry || '',
          passportNo: data.ticketCheck.passportNo || '',
          contactNo: data.ticketCheck.contactNo || '',
          isWhatsAppSame: data.ticketCheck.isWhatsAppSame !== false,
          whatsAppNo: data.ticketCheck.whatsAppNo || '',
          airlineName: data.ticketCheck.airlineName || '',
          origin: data.ticketCheck.origin || '',
          destination: data.ticketCheck.destination || '',
          airlinesPnr: data.ticketCheck.airlinesPnr || '',
          issuingAgentName: data.ticketCheck.issuingAgentName || '',
          issuingAgentContact: data.ticketCheck.issuingAgentContact || '',
          agentEmail: data.ticketCheck.agentEmail || '',
          reservationOfficerId: data.ticketCheck.reservationOfficerId || '',
          serviceCharge: data.ticketCheck.serviceCharge || ''
        });
      } else {
        throw new Error(data.error || 'Failed to fetch ticket check');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'টিকেট চেক তথ্য লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      setShowEditModal(false);
      setSelectedTicketCheckId(null);
    } finally {
      setLoadingTicketCheck(false);
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get reservation officer name
      const selectedOfficer = reservationOfficers.find(officer => officer.id === editFormData.reservationOfficerId);
      const reservationOfficerName = selectedOfficer ? selectedOfficer.name : '';
      
      // Calculate profit (service charge is completely profit)
      const serviceCharge = parseFloat(editFormData.serviceCharge) || 0;
      const profit = serviceCharge;
      
      const response = await fetch(`/api/ticket-checks/${selectedTicketCheckId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          reservationOfficerName,
          profit,
          serviceCharge
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'টিকেট চেক সফলভাবে আপডেট হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        setShowEditModal(false);
        setSelectedTicketCheckId(null);
        setEditFormData({});
        // Refetch ticket checks
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (searchTerm) params.append('q', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        const refetchResponse = await fetch(`/api/ticket-checks?${params.toString()}`);
        const refetchData = await refetchResponse.json();
        if (refetchResponse.ok) {
          setTicketChecks(refetchData.ticketChecks || refetchData.data || []);
          setPagination(refetchData.pagination || pagination);
        }
      } else {
        throw new Error(data.error || 'Failed to update ticket check');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'টিকেট চেক আপডেট করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append('q', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const response = await fetch(`/api/ticket-checks?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setTicketChecks(data.ticketChecks || data.data || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">টিকেট চেক</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  সকল টিকেট চেক রিকোয়েস্ট ব্যবস্থাপনা এবং ট্র্যাক করুন
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/air-ticketing/ticket-check')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন চেক যোগ করুন
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="যাত্রীর নাম, পাসপোর্ট নম্বর, বুকিং রেফ দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              disabled={isLoading}
            >
              <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4" />
              আরও ফিল্টার
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              এক্সপোর্ট
            </button>
          </div>
        </div>

        {/* Ticket Checks List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">টিকেট চেক লোড হচ্ছে...</span>
            </div>
          ) : ticketChecks.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">কোন টিকেট চেক পাওয়া যায়নি</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'আপনার অনুসন্ধানের সাথে কোন ফলাফল মিলেনি।' : 'নতুন টিকেট চেক তৈরি করে শুরু করুন।'}
              </p>
              <button
                onClick={() => router.push('/air-ticketing/ticket-check')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                নতুন চেক যোগ করুন
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">তারিখ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">যাত্রী</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ভ্রমণের বিবরণ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">এয়ারলাইন ও রুট</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">যোগাযোগ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">অফিসার</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">কার্যক্রম</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {ticketChecks.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(ticket.formDate)}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {ticket.passengerName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {ticket.passportNo}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {ticket.travellingCountry}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                              <Plane className="w-3 h-3" />
                              {ticket.airlineName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {ticket.origin} - {ticket.destination}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {ticket.airlinesPnr}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <Phone className="w-3 h-3" />
                              <span className="text-xs">{ticket.contactNo}</span>
                            </div>
                            {ticket.agentEmail && (
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Mail className="w-3 h-3" />
                                <span className="text-xs truncate max-w-[150px]">{ticket.agentEmail}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {ticket.reservationOfficerName || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => router.push(`/air-ticketing/ticket-check/${ticket._id}`)}
                              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(ticket)}
                              className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(ticket._id)}
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Delete"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    দেখানো হচ্ছে <span className="font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{((pagination.page - 1) * pagination.limit) + 1}</span> থেকে <span className="font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{Math.min(pagination.page * pagination.limit, pagination.total)}</span>, মোট <span className="font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{pagination.total}</span> টি
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      পূর্ববর্তী
                    </button>
                    {[...Array(Math.min(5, pagination.totalPages || pagination.pages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded text-sm font-english ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          style={{ fontFamily: "'Google Sans', sans-serif" }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button 
                      onClick={() => setPage(p => Math.min(pagination.totalPages || pagination.pages, p + 1))}
                      disabled={pagination.page === (pagination.totalPages || pagination.pages)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      পরবর্তী
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Edit Ticket Check Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTicketCheckId(null);
          setSelectedTicketCheck(null);
          setEditFormData({});
        }}
        title="টিকেট চেক সম্পাদনা করুন"
        size="xl"
      >
        {loadingTicketCheck ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">টিকেট চেক তথ্য লোড হচ্ছে...</p>
          </div>
        ) : (
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {/* Passenger Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                যাত্রী তথ্য
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    যাত্রীর নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.passengerName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, passengerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    পাসপোর্ট নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={editFormData.passportNo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, passportNo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    যোগাযোগ নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={editFormData.contactNo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, contactNo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    WhatsApp নম্বর
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={editFormData.whatsAppNo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsAppNo: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    ভ্রমণের দেশ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.travellingCountry || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, travellingCountry: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Flight Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Plane className="w-5 h-5 mr-2 text-green-600" />
                ফ্লাইট তথ্য
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    এয়ারলাইন <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="airlines-list"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.airlineName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, airlineName: e.target.value })}
                    required
                  />
                  <datalist id="airlines-list">
                    {airlinesList.map((airline, idx) => (
                      <option key={idx} value={airline} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    এয়ারলাইন্স PNR <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={editFormData.airlinesPnr || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, airlinesPnr: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    উৎপত্তি <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={editFormData.origin || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, origin: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    গন্তব্য <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={editFormData.destination || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, destination: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Agent Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-600" />
                এজেন্ট তথ্য
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    ইস্যুকারী এজেন্টের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.issuingAgentName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, issuingAgentName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    এজেন্ট যোগাযোগ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={editFormData.issuingAgentContact || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, issuingAgentContact: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    এজেন্ট ইমেইল
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={editFormData.agentEmail || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, agentEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Reservation Officer */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                রিজার্ভেশন অফিসার
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  রিজার্ভেশন অফিসার <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={editFormData.reservationOfficerId || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, reservationOfficerId: e.target.value })}
                  disabled={isLoadingEmployees}
                  required
                >
                  <option value="" disabled>
                    {isLoadingEmployees ? 'লোড হচ্ছে...' : 'অফিসার নির্বাচন করুন'}
                  </option>
                  {reservationOfficers.length > 0 ? (
                    reservationOfficers.map(officer => (
                      <option key={officer.id} value={officer.id}>{officer.name}</option>
                    ))
                  ) : !isLoadingEmployees ? (
                    <option value="" disabled>কোন কর্মচারী পাওয়া যায়নি</option>
                  ) : null}
                </select>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                আর্থিক তথ্য
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  সার্ভিস চার্জ (BDT) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>৳</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={editFormData.serviceCharge || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, serviceCharge: e.target.value })}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">সার্ভিস চার্জ = সম্পূর্ণ লাভ (Profit)</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTicketCheckId(null);
                  setSelectedTicketCheck(null);
                  setEditFormData({});
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    সংরক্ষণ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    সংরক্ষণ করুন
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default TicketCheckList;
