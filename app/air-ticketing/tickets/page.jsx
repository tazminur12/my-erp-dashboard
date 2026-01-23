'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Printer, 
  XCircle, 
  Download,
  Calendar,
  MapPin,
  Plane,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

const TicketList = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    airline: 'all',
    flightType: 'all',
    tripType: 'all',
    dateRange: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [airlines, setAirlines] = useState([]);

  // Calculate date range for API
  const getDateRange = () => {
    if (filters.dateRange === 'all') return { dateFrom: null, dateTo: null };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filters.dateRange) {
      case 'today':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { dateFrom: today.toISOString().split('T')[0], dateTo: tomorrow.toISOString().split('T')[0] };
      case 'week':
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return { dateFrom: today.toISOString().split('T')[0], dateTo: weekFromNow.toISOString().split('T')[0] };
      case 'month':
        const monthFromNow = new Date(today);
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        return { dateFrom: today.toISOString().split('T')[0], dateTo: monthFromNow.toISOString().split('T')[0] };
      default:
        return { dateFrom: null, dateTo: null };
    }
  };

  // Fetch airlines for filter dropdown
  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '100',
          status: 'Active'
        });
        const response = await fetch(`/api/airlines?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setAirlines(data.airlines || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching airlines:', error);
      }
    };
    fetchAirlines();
  }, []);

  // Fetch tickets with filters
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const dateRange = getDateRange();
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        if (filters.status !== 'all') {
          params.append('status', filters.status);
        }
        if (filters.airline !== 'all') {
          params.append('airline', filters.airline);
        }
        if (filters.flightType !== 'all') {
          params.append('flightType', filters.flightType);
        }
        if (filters.tripType !== 'all') {
          params.append('tripType', filters.tripType);
        }
        if (dateRange.dateFrom) {
          params.append('dateFrom', dateRange.dateFrom);
        }
        if (dateRange.dateTo) {
          params.append('dateTo', dateRange.dateTo);
        }

        const response = await fetch(`/api/air-tickets?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setTickets(data.tickets || data.data || []);
          setPagination(data.pagination || { total: 0, page: 1, limit: 20, pages: 0 });
        } else {
          throw new Error(data.error || 'Failed to fetch tickets');
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'টিকিট লোড করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [page, limit, searchTerm, filters]);

  // Fetch selected ticket details for modal
  useEffect(() => {
    const fetchTicket = async () => {
      if (!selectedTicketId) {
        setSelectedTicket(null);
        return;
      }

      setLoadingTicket(true);
      try {
        const response = await fetch(`/api/air-tickets/${selectedTicketId}`);
        const data = await response.json();

        if (response.ok) {
          setSelectedTicket(data.ticket || data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch ticket');
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setSelectedTicket(null);
      } finally {
        setLoadingTicket(false);
      }
    };

    fetchTicket();
  }, [selectedTicketId]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'issued':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'partial':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'flown':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'refund':
      case 'refund submitted':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'refund settled':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'refunded':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400';
      case 'void':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'unconfirmed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'in progress':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked':
        return 'বুকড';
      case 'issued':
        return 'ইস্যুড';
      case 'pending':
        return 'অপেক্ষমান';
      case 'partial':
        return 'আংশিক';
      case 'flown':
        return 'ফ্লোন';
      case 'refund':
      case 'refund submitted':
        return 'রিফান্ড সাবমিট';
      case 'refund settled':
        return 'রিফান্ড সেটেল';
      case 'refunded':
        return 'রিফান্ডেড';
      case 'void':
        return 'ভয়েড';
      case 'unconfirmed':
        return 'অননিশ্চিত';
      case 'in progress':
        return 'চলমান';
      default:
        return status || 'N/A';
    }
  };

  // Format date as "06 Jan 2026"
  const formatDateShort = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleViewTicket = (ticket) => {
    const ticketId = ticket.ticketId || ticket._id || ticket.id || ticket.bookingId;
    setSelectedTicketId(ticketId);
    setShowTicketModal(true);
  };

  const handleEditTicket = (ticket) => {
    const ticketId = ticket.ticketId || ticket._id || ticket.id || ticket.bookingId;
    router.push(`/air-ticketing/tickets/${ticketId}/edit`);
  };

  const handlePrintTicket = (ticket) => {
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    };

    const formatTime = (dateString) => {
      if (!dateString) return '17:25';
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const flightDate = ticket.flightDate ? formatDate(ticket.flightDate) : '-';
    const bookingDate = ticket.date ? formatDate(ticket.date) : '-';
    const boardingTime = ticket.flightDate ? formatTime(ticket.flightDate) : '17:25';
    
    const passengerName = (ticket.customerName || 'JOHN DOE').toUpperCase();
    const nameParts = passengerName.split(' ');
    const formattedName = nameParts.length > 1 
      ? `${nameParts[0]} / ${nameParts.slice(1).join(' ')}`
      : passengerName;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Boarding Pass - ${ticket.bookingId || ticket._id}</title>
          <style>
            @media print {
              @page {
                size: A4 landscape;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 20px;
              }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              background: #f5f5f5;
              padding: 40px 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            
            .boarding-pass {
              width: 800px;
              max-width: 100%;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              display: flex;
              position: relative;
            }
            
            .main-section {
              flex: 1;
              padding: 0;
              position: relative;
            }
            
            .stub-section {
              width: 280px;
              padding: 0;
              border-left: 2px dashed #ccc;
              position: relative;
            }
            
            .header-blue {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 20px 30px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: relative;
            }
            
            .header-blue::after {
              content: '';
              position: absolute;
              right: 0;
              top: 0;
              bottom: 0;
              width: 2px;
              background: #ccc;
              border-left: 2px dashed #fff;
            }
            
            .airline-info {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            
            .airplane-icon {
              width: 40px;
              height: 40px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
            }
            
            .airline-name {
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
            }
            
            .boarding-pass-text {
              font-size: 18px;
              font-weight: 600;
              letter-spacing: 1px;
            }
            
            .content-section {
              padding: 30px;
            }
            
            .info-row {
              display: flex;
              margin-bottom: 15px;
              align-items: flex-start;
            }
            
            .info-label {
              font-size: 12px;
              color: #666;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              min-width: 120px;
              margin-right: 10px;
            }
            
            .info-value {
              font-size: 14px;
              color: #000;
              font-weight: 500;
              flex: 1;
            }
            
            .highlight-section {
              display: flex;
              justify-content: space-between;
              margin-top: 25px;
              padding-top: 25px;
              border-top: 1px solid #e5e5e5;
            }
            
            .highlight-item {
              text-align: center;
              flex: 1;
            }
            
            .highlight-label {
              font-size: 11px;
              color: #666;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            
            .highlight-value {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
            }
            
            .footer-note {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px solid #e5e5e5;
              font-size: 10px;
              color: #888;
              text-align: center;
            }
            
            .stub-content {
              padding: 30px 20px;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            
            .stub-header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 15px 20px;
              text-align: center;
              font-size: 14px;
              font-weight: 600;
              letter-spacing: 1px;
              margin: -30px -20px 20px -20px;
            }
            
            .stub-info {
              flex: 1;
            }
            
            .stub-row {
              display: flex;
              margin-bottom: 10px;
              font-size: 11px;
            }
            
            .stub-label {
              font-weight: 600;
              color: #666;
              min-width: 70px;
              margin-right: 8px;
            }
            
            .stub-value {
              color: #000;
              flex: 1;
            }
            
            .stub-highlights {
              display: flex;
              justify-content: space-between;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #e5e5e5;
            }
            
            .stub-highlight {
              text-align: center;
              flex: 1;
            }
            
            .stub-highlight-label {
              font-size: 9px;
              color: #666;
              font-weight: 600;
              margin-bottom: 5px;
            }
            
            .stub-highlight-value {
              font-size: 18px;
              font-weight: bold;
              color: #2563eb;
            }
            
            .barcode {
              margin-top: 20px;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 4px;
              text-align: center;
            }
            
            .barcode-lines {
              font-family: 'Courier New', monospace;
              font-size: 24px;
              letter-spacing: 2px;
              color: #000;
              line-height: 1.2;
            }
            
            .barcode-number {
              margin-top: 8px;
              font-size: 12px;
              color: #666;
              letter-spacing: 3px;
            }
          </style>
        </head>
        <body>
          <div class="boarding-pass">
            <!-- Main Section -->
            <div class="main-section">
              <div class="header-blue">
                <div class="airline-info">
                  <div class="airplane-icon">✈</div>
                  <div class="airline-name">${(ticket.airline || 'AIRLINES').toUpperCase()}</div>
                </div>
              </div>
              
              <div class="content-section">
                <div class="info-row">
                  <span class="info-label">PASSENGER</span>
                  <span class="info-value">: ${passengerName}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">FROM</span>
                  <span class="info-value">: ${(ticket.origin || 'N/A').toUpperCase()}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">TO</span>
                  <span class="info-value">: ${(ticket.destination || 'N/A').toUpperCase()}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">FLIGHT</span>
                  <span class="info-value">: ${ticket.bookingId || ticket.ticketId || ticket._id || 'N/A'}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">DATE</span>
                  <span class="info-value">: ${flightDate}</span>
                </div>
                
                ${ticket.gdsPnr ? `
                <div class="info-row">
                  <span class="info-label">GDS PNR</span>
                  <span class="info-value">: ${ticket.gdsPnr}</span>
                </div>
                ` : ''}
                
                ${ticket.airlinePnr ? `
                <div class="info-row">
                  <span class="info-label">AIRLINE PNR</span>
                  <span class="info-value">: ${ticket.airlinePnr}</span>
                </div>
                ` : ''}
                
                <div class="highlight-section">
                  <div class="highlight-item">
                    <div class="highlight-label">GATE</div>
                    <div class="highlight-value">A6</div>
                  </div>
                  <div class="highlight-item">
                    <div class="highlight-label">BOARDING TIME</div>
                    <div class="highlight-value">${boardingTime}</div>
                  </div>
                  <div class="highlight-item">
                    <div class="highlight-label">SEAT</div>
                    <div class="highlight-value">${ticket.segmentCount || '07'}</div>
                  </div>
                </div>
                
                <div class="footer-note">
                  BOARDING GATE CLOSE 20 MINUTES PRIOR TO DEPARTURE TIME
                </div>
              </div>
            </div>
            
            <!-- Stub Section -->
            <div class="stub-section">
              <div class="stub-header">BOARDING PASS</div>
              
              <div class="stub-content">
                <div class="stub-info">
                  <div class="stub-row">
                    <span class="stub-label">NAME</span>
                    <span class="stub-value">: ${formattedName}</span>
                  </div>
                  
                  <div class="stub-row">
                    <span class="stub-label">FROM</span>
                    <span class="stub-value">: ${(ticket.origin || 'N/A').toUpperCase()}</span>
                  </div>
                  
                  <div class="stub-row">
                    <span class="stub-label">TO</span>
                    <span class="stub-value">: ${(ticket.destination || 'N/A').toUpperCase()}</span>
                  </div>
                  
                  <div class="stub-row">
                    <span class="stub-label">FLIGHT</span>
                    <span class="stub-value">: ${ticket.bookingId || ticket.ticketId || ticket._id || 'N/A'}</span>
                  </div>
                  
                  <div class="stub-row">
                    <span class="stub-label">DATE</span>
                    <span class="stub-value">: ${flightDate}</span>
                  </div>
                  
                  <div class="stub-highlights">
                    <div class="stub-highlight">
                      <div class="stub-highlight-label">GATE</div>
                      <div class="stub-highlight-value">A6</div>
                    </div>
                    <div class="stub-highlight">
                      <div class="stub-highlight-label">TIME</div>
                      <div class="stub-highlight-value">${boardingTime}</div>
                    </div>
                    <div class="stub-highlight">
                      <div class="stub-highlight-label">SEAT</div>
                      <div class="stub-highlight-value">${ticket.segmentCount || '07'}</div>
                    </div>
                  </div>
                </div>
                
                <div class="barcode">
                  <div class="barcode-lines">${'█'.repeat(20)}</div>
                  <div class="barcode-lines">${'█'.repeat(18)}</div>
                  <div class="barcode-lines">${'█'.repeat(22)}</div>
                  <div class="barcode-lines">${'█'.repeat(16)}</div>
                  <div class="barcode-lines">${'█'.repeat(20)}</div>
                  <div class="barcode-number">${(ticket.bookingId || ticket.ticketId || ticket._id || '000000').toString().padStart(10, '0')}</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleCancelTicket = async (ticket) => {
    const ticketId = ticket.ticketId || ticket._id || ticket.id || ticket.bookingId;
    const ticketDisplayId = ticket.ticketId || ticket.bookingId || ticket._id || 'N/A';
    
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `টিকিট ${ticketDisplayId} মুছে ফেলা হবে।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/air-tickets/${ticketId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'টিকিট সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          
          // Refetch tickets
          const dateRange = getDateRange();
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          
          if (searchTerm) params.append('search', searchTerm);
          if (filters.status !== 'all') params.append('status', filters.status);
          if (filters.airline !== 'all') params.append('airline', filters.airline);
          if (filters.flightType !== 'all') params.append('flightType', filters.flightType);
          if (filters.tripType !== 'all') params.append('tripType', filters.tripType);
          if (dateRange.dateFrom) params.append('dateFrom', dateRange.dateFrom);
          if (dateRange.dateTo) params.append('dateTo', dateRange.dateTo);

          const refreshResponse = await fetch(`/api/air-tickets?${params.toString()}`);
          const refreshData = await refreshResponse.json();

          if (refreshResponse.ok) {
            setTickets(refreshData.tickets || refreshData.data || []);
            setPagination(refreshData.pagination || { total: 0, page: 1, limit: 20, pages: 0 });
          }
        } else {
          throw new Error(data.error || 'Failed to delete ticket');
        }
      } catch (error) {
        console.error('Failed to delete ticket:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error?.message || 'টিকিট মুছতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Booking ID', 'Customer Name', 'Phone', 'Travel Date', 'From', 'To', 'Airline', 'Fare', 'Status'],
      ...tickets.map(ticket => [
        ticket.bookingId || ticket.ticketId || ticket._id || '',
        ticket.customerName || '',
        ticket.customerPhone || '',
        ticket.flightDate ? new Date(ticket.flightDate).toLocaleDateString() : '',
        ticket.origin || '',
        ticket.destination || '',
        ticket.airline || '',
        ticket.customerDeal || 0,
        ticket.status || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">টিকিট লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                টিকিট তালিকা
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                সমস্ত ইস্যুকৃত টিকিটের তালিকা ও ব্যবস্থাপনা
              </p>
            </div>
            <button
              onClick={() => router.push('/air-ticketing/tickets/add')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              নতুন টিকিট
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="PNR, গ্রাহকের নাম, বা ফোন নম্বর দিয়ে খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <Filter className="w-5 h-5 mr-2" />
                ফিল্টার
              </button>

              {/* Export */}
              <button
                onClick={exportToExcel}
                className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <Download className="w-5 h-5 mr-2" />
                Excel ডাউনলোড
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      স্ট্যাটাস
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">সব স্ট্যাটাস</option>
                      <option value="booked">বুকড</option>
                      <option value="issued">ইস্যুড</option>
                      <option value="pending">অপেক্ষমান</option>
                      <option value="partial">আংশিক</option>
                      <option value="flown">ফ্লোন</option>
                      <option value="refund">রিফান্ড সাবমিট</option>
                      <option value="refund settled">রিফান্ড সেটেল</option>
                      <option value="refunded">রিফান্ডেড</option>
                      <option value="void">ভয়েড</option>
                      <option value="unconfirmed">অননিশ্চিত</option>
                      <option value="in progress">চলমান</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      এয়ারলাইন
                    </label>
                    <select
                      value={filters.airline}
                      onChange={(e) => handleFilterChange('airline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">সব এয়ারলাইন</option>
                      {airlines.map((airline) => (
                        <option key={airline._id || airline.id || airline.code} value={airline.name || airline.code}>
                          {airline.name || airline.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      রুট ক্যাটাগরি
                    </label>
                    <select
                      value={filters.flightType}
                      onChange={(e) => handleFilterChange('flightType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">সব রুট</option>
                      <option value="domestic">Domestic</option>
                      <option value="international">International</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ট্রিপ টাইপ
                    </label>
                    <select
                      value={filters.tripType}
                      onChange={(e) => handleFilterChange('tripType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">সব ট্রিপ</option>
                      <option value="oneway">One Way</option>
                      <option value="roundtrip">Round Trip</option>
                      <option value="multicity">Multi City</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ভ্রমণের তারিখ
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">সব তারিখ</option>
                      <option value="today">আজ</option>
                      <option value="week">এই সপ্তাহ</option>
                      <option value="month">এই মাস</option>
                    </select>
                  </div>
                </div>

                {/* Summary Row */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">মোট টিকিট: {pagination.total}</span>
                      <span className="mx-2">•</span>
                      <span>পৃষ্ঠা: {pagination.page} / {pagination.pages}</span>
                    </div>
                    <button
                      onClick={() => {
                        setFilters({
                          status: 'all',
                          airline: 'all',
                          flightType: 'all',
                          tripType: 'all',
                          dateRange: 'all',
                        });
                        setSearchTerm('');
                        setPage(1);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tickets Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      টিকিট তথ্য
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      গ্রাহক
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ভ্রমণ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      এয়ারলাইন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ভাড়া
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      স্ট্যাটাস
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      অ্যাকশন
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map((ticket) => (
                    <tr key={ticket._id || ticket.bookingId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {ticket.ticketId || ticket.bookingId || ticket._id}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateShort(ticket.date)}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {ticket.gdsPnr && `GDS: ${ticket.gdsPnr}`}
                            {ticket.airlinePnr && ` | Airline: ${ticket.airlinePnr}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {ticket.customerName || '-'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {ticket.customerPhone || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDateShort(ticket.flightDate)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {ticket.origin || '-'} → {ticket.destination || '-'}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {ticket.tripType || 'oneway'} | {ticket.adultCount || 0} Adult, {ticket.childCount || 0} Child, {ticket.infantCount || 0} Infant
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {ticket.airline || '-'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {ticket.flightType || 'domestic'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ৳{(ticket.customerDeal || 0).toLocaleString()}
                        </div>
                        {ticket.profit && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Profit: ৳{ticket.profit.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewTicket(ticket)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Ticket"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditTicket(ticket)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Edit Ticket"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintTicket(ticket)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            title="Print Ticket"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelTicket(ticket)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Ticket"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {tickets.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  কোন টিকিট পাওয়া যায়নি
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  আপনার অনুসন্ধানের সাথে মিলে এমন কোন টিকিট নেই।
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  দেখানো হচ্ছে {((page - 1) * limit) + 1} থেকে {Math.min(page * limit, pagination.total)} এর মধ্যে {pagination.total} টি
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    পূর্ববর্তী
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                    disabled={page >= pagination.pages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    পরবর্তী
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Detail Modal */}
        {showTicketModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {loadingTicket ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">টিকিট তথ্য লোড হচ্ছে...</p>
                  </div>
                ) : selectedTicket ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        টিকিট বিবরণ - <span style={{ fontFamily: "'Google Sans', sans-serif" }}>{selectedTicket.ticketId || selectedTicket.bookingId || selectedTicket._id}</span>
                      </h2>
                      <button
                        onClick={() => {
                          setShowTicketModal(false);
                          setSelectedTicketId(null);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Ticket Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-purple-600" />
                          টিকিট তথ্য
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Ticket ID (Unique)</label>
                            <p className="text-sm text-gray-900 dark:text-white font-mono font-semibold text-blue-600 dark:text-blue-400" style={{ fontFamily: "'Google Sans', monospace" }}>
                              {selectedTicket.ticketId || '-'}
                            </p>
                            {selectedTicket.ticketId && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-generated unique identifier</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Booking ID</label>
                            <p className="text-sm text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                              {selectedTicket.bookingId || '-'}
                            </p>
                            {selectedTicket.bookingId && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manual booking identifier</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">MongoDB ID</label>
                            <p className="text-sm text-gray-900 dark:text-white font-mono text-xs" style={{ fontFamily: "'Google Sans', monospace" }}>
                              {selectedTicket._id || '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                          <User className="w-5 h-5 mr-2 text-blue-600" />
                          গ্রাহকের তথ্য
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">নাম</label>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.customerName || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ফোন</label>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.customerPhone || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">যাত্রীর সংখ্যা</label>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {selectedTicket.adultCount || 0} Adult, {selectedTicket.childCount || 0} Child, {selectedTicket.infantCount || 0} Infant
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Travel Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                          <Plane className="w-5 h-5 mr-2 text-green-600" />
                          ভ্রমণের তথ্য
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ভ্রমণের তারিখ</label>
                            <p className="text-sm text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                              {formatDateShort(selectedTicket.flightDate)}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">বুকিং তারিখ</label>
                            <p className="text-sm text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                              {formatDateShort(selectedTicket.date)}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">উৎস</label>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.origin || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">গন্তব্য</label>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.destination || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ট্রিপ টাইপ</label>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.tripType || 'oneway'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">রুট ক্যাটাগরি</label>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.flightType || 'domestic'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Airline & Fare */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                          <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                          এয়ারলাইন ও ভাড়া
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">এয়ারলাইন</label>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.airline || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Ticket ID</label>
                            <p className="text-sm text-gray-900 dark:text-white font-semibold text-blue-600 dark:text-blue-400">{selectedTicket.ticketId || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Booking ID</label>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.bookingId || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">GDS PNR</label>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.gdsPnr || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Airline PNR</label>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.airlinePnr || '-'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Customer Deal</label>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{(selectedTicket.customerDeal || 0).toLocaleString()}</p>
                          </div>
                          {selectedTicket.profit && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Profit</label>
                              <p className="text-xl font-bold text-green-600 dark:text-green-400">৳{selectedTicket.profit.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">স্ট্যাটাস</h3>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                          {getStatusText(selectedTicket.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setShowTicketModal(false);
                          setSelectedTicketId(null);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        বন্ধ করুন
                      </button>
                      <button
                        onClick={() => handlePrintTicket(selectedTicket)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        প্রিন্ট করুন
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">টিকিট পাওয়া যায়নি</p>
                    <button
                      onClick={() => {
                        setShowTicketModal(false);
                        setSelectedTicketId(null);
                      }}
                      className="mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      বন্ধ করুন
                    </button>
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

export default TicketList;
