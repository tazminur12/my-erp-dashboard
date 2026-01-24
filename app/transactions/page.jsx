'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../component/DashboardLayout';
import Image from 'next/image';
import { 
  CreditCard, 
  Search, 
  Filter,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Tag,
  X,
  RefreshCw,
  Loader2,
  Edit,
  Trash2,
  Save,
  FileDown
} from 'lucide-react';
import { generateSalmaReceiptPDF } from '../utils/pdfGenerator';
import Swal from 'sweetalert2';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

const TransactionsList = () => {
  const isDark = false; // Default theme - can be enhanced later
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: '',
    transactionType: '',
    category: '',
    paymentMethod: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showHeader, setShowHeader] = useState(true);
  const [showPDFDownloadModal, setShowPDFDownloadModal] = useState(false);
  const [pdfDateRange, setPDFDateRange] = useState('daily');
  const [pdfCustomStartDate, setPDFCustomStartDate] = useState('');
  const [pdfCustomEndDate, setPDFCustomEndDate] = useState('');

  // Data fetching state
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          ...(searchTerm && { search: searchTerm }),
          ...(filters.transactionType && { transactionType: filters.transactionType }),
          ...(filters.category && { category: filters.category }),
          ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
          ...(filters.status && { status: filters.status }),
          ...(filters.dateRange && { dateRange: filters.dateRange })
        });

        const response = await fetch(`/api/transactions?${queryParams.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setTransactions(data.transactions || data.data || []);
          setTotalCount(data.totalCount || data.count || 0);
          setTotalPages(data.totalPages || Math.ceil((data.totalCount || 0) / itemsPerPage));
        } else {
          setError(data.error || 'Failed to fetch transactions');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err.message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, itemsPerPage, searchTerm, filters]);

  // Filter options
  const filterOptions = {
    transactionType: [
      { value: '', label: 'সব টাইপ' },
      { value: 'credit', label: 'ক্রেডিট (আয়)' },
      { value: 'debit', label: 'ডেবিট (ব্যয়)' }
    ],
    category: [
      { value: '', label: 'সব ক্যাটাগরি' },
      { value: 'Account Transfer', label: 'Account Transfer (একাউন্ট টু একাউন্ট)' },
      { value: 'হাজ্জ প্যাকেজ', label: 'হাজ্জ প্যাকেজ' },
      { value: 'ওমরাহ প্যাকেজ', label: 'ওমরাহ প্যাকেজ' },
      { value: 'এয়ার টিকেট', label: 'এয়ার টিকেট' },
      { value: 'ভিসা সার্ভিস', label: 'ভিসা সার্ভিস' },
      { value: 'হোটেল বুকিং', label: 'হোটেল বুকিং' },
      { value: 'ইনসুরেন্স', label: 'ইনসুরেন্স' },
      { value: 'অন্যান্য সেবা', label: 'অন্যান্য সেবা' }
    ],
    paymentMethod: [
      { value: '', label: 'সব পেমেন্ট মেথড' },
      { value: 'bank-transfer', label: 'ব্যাংক ট্রান্সফার' },
      { value: 'mobile-banking', label: 'মোবাইল ব্যাংকিং' },
      { value: 'cheque', label: 'চেক' }
    ],
    status: [
      { value: '', label: 'সব স্ট্যাটাস' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  };

  const currentTransactions = transactions;

  // Helper functions
  const getTypeColor = (type) => {
    return type === 'credit' 
      ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
      : 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Data access helpers
  const isPersonalExpenseTxn = (t) => {
    try {
      const desc = (t.description || t.details || '').toString();
      if (/^Personal\s+Expense/i.test(desc)) return true;
      if (Array.isArray(t.tags) && t.tags.some(tag => String(tag).toLowerCase().includes('personal'))) return true;
      if ((t.category === 'Bank Transaction' || !t.category) && t.paymentDetails?.category) return true;
    } catch { /* ignore */ }
    return false;
  };

  const getCustomerName = (t) => {
    if (isPersonalExpenseTxn(t)) {
      const desc = (t.description || t.details || '').toString();
      const match = desc.match(/Personal\s+Expense\s*-\s*(.+)/i);
      const fromDescription = match?.[1]?.trim();
      return t.paymentDetails?.category || fromDescription || 'Personal Expense';
    }
    
    // For transfer transactions, use account names
    if (t.transactionType === 'transfer') {
      if (t.fromAccount && t.toAccount) {
        const fromName = t.fromAccount.bankName || t.fromAccount.accountName || t.fromAccount.name || 'Account';
        const toName = t.toAccount.bankName || t.toAccount.accountName || t.toAccount.name || 'Account';
        return `${fromName} → ${toName}`;
      }
      if (t.debitAccount && t.creditAccount) {
        const fromName = t.debitAccount.bankName || t.debitAccount.accountName || t.debitAccount.name || 'Account';
        const toName = t.creditAccount.bankName || t.creditAccount.accountName || t.creditAccount.name || 'Account';
        return `${fromName} → ${toName}`;
      }
      // Fallback to partyName if set by API
      if (t.partyName && t.partyName !== 'Unknown') return t.partyName;
      return 'Account Transfer';
    }
    
    // For account transactions (credit/debit without party)
    if ((t.transactionType === 'credit' || t.transactionType === 'debit') && !t.partyType && !t.partyId) {
      if (t.targetAccount) {
        return t.targetAccount.bankName || t.targetAccount.accountName || t.targetAccount.accountTitle || t.targetAccount.accountHolder || 'Bank Account';
      }
      if (t.debitAccount) {
        return t.debitAccount.bankName || t.debitAccount.accountName || t.debitAccount.name || 'Bank Account';
      }
      if (t.creditAccount) {
        return t.creditAccount.bankName || t.creditAccount.accountName || t.creditAccount.name || 'Bank Account';
      }
    }
    
    if (t.partyType === 'money-exchange' || t.partyType === 'money_exchange') {
      const moneyExchangeInfo = t.moneyExchangeInfo || {};
      const currencyName = moneyExchangeInfo.currencyName || t.party?.currencyName;
      const fullName = moneyExchangeInfo.fullName || t.party?.fullName || t.partyName;
      const type = moneyExchangeInfo.type || '';
      const currencyCode = moneyExchangeInfo.currencyCode || '';
      
      if (type && currencyName) {
        return `${type === 'Buy' ? 'ক্রয়' : type === 'Sell' ? 'বিক্রয়' : type} - ${currencyCode ? `${currencyCode} (${currencyName})` : currencyName}`;
      }
      if (currencyName) return currencyName;
      if (fullName && fullName !== 'Money Exchange' && fullName !== 'Unknown') return fullName;
    }
    
    // For vendor transactions
    if (t.partyType === 'vendor') {
      const vendorName = t.party?.tradeName || t.party?.vendorName || t.party?.ownerName || t.party?.name || t.partyName;
      if (vendorName && vendorName !== 'Unknown' && vendorName !== 'N/A') {
        return vendorName;
      }
    }
    
    // For loan, use loanInfo name
    if (t.partyType === 'loan' && t.loanInfo) {
      return t.loanInfo.name || t.customerName || t.partyName || 'Unknown';
    }
    
    const name = 
      t.customerName ||
      t.customer?.name ||
      t.partyName ||
      t.party?.name ||
      t.customer?.fullName ||
      t.party?.fullName ||
      t.party?.tradeName ||
      t.party?.vendorName ||
      '';
    
    if (!name || name.trim() === '' || name.toLowerCase() === 'unknown') {
      return 'N/A';
    }
    
    return name;
  };

  const getCustomerPhone = (t) => {
    if (isPersonalExpenseTxn(t)) return '';
    if (t.partyType === 'money-exchange' || t.partyType === 'money_exchange') {
      const moneyExchangeInfo = t.moneyExchangeInfo || {};
      return moneyExchangeInfo.mobileNumber || t.party?.mobileNumber || t.partyPhone || '';
    }
    // For loan, use loanInfo customerPhone
    if (t.partyType === 'loan' && t.loanInfo && t.loanInfo.customerPhone) {
      return t.loanInfo.customerPhone;
    }
    if (t.customerPhone) return t.customerPhone;
    if (t.customer) {
      return t.customer.mobile || t.customer.phone || t.customer.mobileNumber || t.customer.contactNo || '';
    }
    if (t.party) {
      return t.party.mobile || t.party.phone || t.party.mobileNumber || t.party.contactNo || t.party.contactPhone || '';
    }
    return t.partyPhone || '';
  };

  const getCustomerImage = (t) => {
    // For vendor transactions
    if (t.partyType === 'vendor' && t.party) {
      return t.party.logo || t.party.image || t.party.profileImage || null;
    }
    // For customer transactions
    if (t.customer) {
      return t.customer.customerImage || t.customer.image || t.customer.profileImage || t.customer.avatar || null;
    }
    // For party transactions
    if (t.party) {
      return t.party.customerImage || t.party.image || t.party.profileImage || t.party.avatar || t.party.logo || null;
    }
    return null;
  };

  const getCategory = (t) => {
    if (isPersonalExpenseTxn(t)) {
      const desc = (t.description || t.details || '').toString();
      const match = desc.match(/Personal\s+Expense\s*-\s*(.+)/i);
      const fromDescription = match?.[1]?.trim();
      return fromDescription || t.paymentDetails?.category || 'Personal Expense';
    }
    
    // Account Transfer – always show category
    if (t.transactionType === 'transfer') {
      const raw = t.category || t.serviceCategory || t.paymentDetails?.category || '';
      if (raw && typeof raw === 'string' && raw.trim()) return raw;
      return 'Account Transfer';
    }
    
    if (t.category && typeof t.category === 'object') {
      const name = t.category.name || t.category.label || t.category.title || t.category.categoryName;
      if (name) return name;
    }
    
    const raw = t.category || t.categoryId || t.serviceCategory || t.paymentDetails?.category || '';
    
    if (!raw || raw === '') {
      const customerType = t.customerType || t.partyType || '';
      if (customerType === 'haji' || customerType === 'hajj') return 'হাজ্জ প্যাকেজ';
      if (customerType === 'umrah') return 'ওমরাহ প্যাকেজ';
      if (customerType === 'office' || customerType === 'officeExpenses') return 'অফিস ব্যয়';
      if (customerType === 'money-exchange' || customerType === 'moneyExchange') return 'মানি এক্সচেঞ্জ';
      if (customerType === 'airCustomer') return 'এয়ার টিকেট';
      if (customerType === 'vendor') return 'ভেন্ডর';
      if (customerType === 'agent') return 'এজেন্ট';
      return 'N/A';
    }
    
    if (typeof raw === 'string' && !raw.match(/^[0-9a-f]{24}$/i) && raw.length < 30) {
      return raw;
    }
    
    const customerType = t.customerType || t.partyType || '';
    if (customerType === 'haji' || customerType === 'hajj') return 'হাজ্জ প্যাকেজ';
    if (customerType === 'umrah') return 'ওমরাহ প্যাকেজ';
    if (customerType === 'office' || customerType === 'officeExpenses') return 'অফিস ব্যয়';
    if (customerType === 'money-exchange' || customerType === 'moneyExchange') return 'মানি এক্সচেঞ্জ';
    if (customerType === 'airCustomer') return 'এয়ার টিকেট';
    if (customerType === 'vendor') return 'ভেন্ডর';
    if (customerType === 'agent') return 'এজেন্ট';
    
    return 'N/A';
  };

  // Event handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      dateRange: '',
      transactionType: '',
      category: '',
      paymentMethod: '',
      status: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      transactionType: transaction.transactionType,
      category: transaction.category,
      paymentMethod: transaction.paymentMethod,
      paymentDetails: {
        bankName: transaction.paymentDetails?.bankName || '',
        accountNumber: transaction.paymentDetails?.accountNumber || '',
        chequeNumber: transaction.paymentDetails?.chequeNumber || '',
        mobileProvider: transaction.paymentDetails?.mobileProvider || '',
        transactionId: transaction.paymentDetails?.transactionId || '',
        amount: transaction.paymentDetails?.amount || '',
        reference: transaction.paymentDetails?.reference || ''
      },
      notes: transaction.notes || '',
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleDeleteTransaction = async (transaction) => {
    const result = await Swal.fire({
      title: 'লেনদেন মুছে ফেলুন?',
      text: `আপনি কি ${transaction.transactionId} লেনদেনটি মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      background: isDark ? '#1F2937' : '#F9FAFB'
    });

    if (result.isConfirmed) {
      try {
        const transactionId = transaction?._id || transaction?.transactionId;
        const response = await fetch(`/api/transactions/${transactionId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'লেনদেন সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            background: isDark ? '#1F2937' : '#F9FAFB',
          });
          // Refetch transactions
          setTransactions(prev => prev.filter(t => (t._id || t.transactionId) !== transactionId));
        } else {
          throw new Error('Failed to delete transaction');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'লেনদেন মুছে ফেলতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          background: isDark ? '#1F2937' : '#FEF2F2',
        });
      }
    }
  };

  const preparePDFData = (transaction) => {
    let accountManagerName = '';
    
    if (transaction.accountManager) {
      if (typeof transaction.accountManager === 'string') {
        accountManagerName = transaction.accountManager;
      } else if (typeof transaction.accountManager === 'object') {
        accountManagerName = transaction.accountManager.name 
          || transaction.accountManager.fullName
          || transaction.accountManager.accountManagerName
          || '';
      }
    }
    
    if (!accountManagerName && transaction.accountManagerName) {
      accountManagerName = transaction.accountManagerName;
    }
    
    accountManagerName = accountManagerName ? accountManagerName.trim() : '';
    
    let address = '';
    if (transaction.customerAddress && transaction.customerAddress.trim() && transaction.customerAddress !== '[Full Address]') {
      address = transaction.customerAddress.trim();
    } else if (transaction.customer?.address) {
      address = transaction.customer.address.trim();
    } else if (transaction.party?.address) {
      address = transaction.party.address.trim();
    }
    
    const finalAddress = (address && address.trim() && address !== '[Full Address]') 
      ? address.trim() 
      : '[Full Address]';
    
    let uniqueTransactionId = transaction.transactionId;
    if (!uniqueTransactionId || (uniqueTransactionId.length === 24 && /^[0-9a-fA-F]{24}$/.test(uniqueTransactionId))) {
      uniqueTransactionId = transaction.uniqueId 
        || transaction.uniqueTransactionId
        || transaction.txnId
        || transaction.id
        || transaction.transactionId;
    }
    
    if (!uniqueTransactionId || uniqueTransactionId === transaction._id) {
      if (transaction._id && transaction._id.length === 24 && /^[0-9a-fA-F]{24}$/.test(transaction._id)) {
        uniqueTransactionId = `TXN-${transaction._id.slice(-8).toUpperCase()}`;
      } else {
        uniqueTransactionId = transaction._id || 'N/A';
      }
    }
    
    return {
      transactionId: uniqueTransactionId,
      transactionType: transaction.transactionType,
      status: transaction.status,
      customerId: transaction.customerId || transaction.customer?._id || transaction.customer?.id,
      customerName: getCustomerName(transaction),
      customerPhone: getCustomerPhone(transaction),
      customerEmail: transaction.customerEmail || transaction.customer?.email || transaction.party?.email,
      customerAddress: finalAddress,
      category: getCategory(transaction),
      paymentMethod: transaction.paymentMethod,
      bankName: transaction.paymentDetails?.bankName || '[Bank Name]',
      accountNumber: transaction.paymentDetails?.accountNumber || '[Acc No]',
      accountManagerName: accountManagerName || '',
      date: transaction.date ? formatDate(transaction.date) : 'DD-MM-YYYY',
      amount: transaction.paymentDetails?.amount || transaction.amount || 0,
      charge: transaction.charge || transaction.paymentDetails?.charge || 0,
      totalAmount: (parseFloat(transaction.paymentDetails?.amount || transaction.amount || 0)) + (parseFloat(transaction.charge || transaction.paymentDetails?.charge || 0)),
      notes: transaction.notes || '',
    };
  };

  const handleDownloadPDFBangla = async (transaction, showHeader = true) => {
    try {
      Swal.fire({
        title: 'PDF তৈরি হচ্ছে...',
        text: `${transaction.transactionId} এর রিসিট তৈরি হচ্ছে`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: isDark ? '#1F2937' : '#F9FAFB'
      });

      const pdfData = preparePDFData(transaction);
      const result = await generateSalmaReceiptPDF(pdfData, {
        language: 'bn',
        showHeader: showHeader,
      });

      Swal.close();

      if (result.success) {
        Swal.fire({
          title: 'সফল!',
          text: `PDF সফলভাবে ডাউনলোড হয়েছে`,
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          background: isDark ? '#1F2937' : '#F9FAFB',
        });
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Swal.close();
      Swal.fire({
        title: 'ত্রুটি!',
        text: `PDF তৈরি করতে সমস্যা হয়েছে`,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        background: isDark ? '#1F2937' : '#FEF2F2',
      });
    }
  };

  const handleDownloadPDFEnglish = async (transaction, showHeader = true) => {
    try {
      Swal.fire({
        title: 'Generating PDF...',
        text: `Generating receipt for ${transaction.transactionId}`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: isDark ? '#1F2937' : '#F9FAFB'
      });

      const pdfData = preparePDFData(transaction);
      const result = await generateSalmaReceiptPDF(pdfData, {
        language: 'en',
        showHeader: showHeader,
      });

      Swal.close();

      if (result.success) {
        Swal.fire({
          title: 'Success!',
          text: `PDF downloaded successfully`,
          icon: 'success',
          confirmButtonText: 'OK',
          background: isDark ? '#1F2937' : '#F9FAFB',
        });
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Swal.close();
      Swal.fire({
        title: 'Error!',
        text: `Failed to generate PDF`,
        icon: 'error',
        confirmButtonText: 'OK',
        background: isDark ? '#1F2937' : '#FEF2F2',
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateTransaction = async () => {
    if (!editFormData.transactionType || !editFormData.category || !editFormData.paymentMethod) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      return;
    }

    try {
      const updateData = {
        transactionType: editFormData.transactionType,
        category: editFormData.category,
        paymentMethod: editFormData.paymentMethod,
        paymentDetails: {
          bankName: editFormData.paymentDetails.bankName || null,
          accountNumber: editFormData.paymentDetails.accountNumber || null,
          chequeNumber: editFormData.paymentDetails.chequeNumber || null,
          mobileProvider: editFormData.paymentDetails.mobileProvider || null,
          transactionId: editFormData.paymentDetails.transactionId || null,
          amount: parseFloat(editFormData.paymentDetails.amount) || 0,
          reference: editFormData.paymentDetails.reference || null
        },
        notes: editFormData.notes || null,
        date: editFormData.date
      };

      const response = await fetch(`/api/transactions/${editingTransaction.transactionId || editingTransaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'লেনদেন সফলভাবে আপডেট হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          background: isDark ? '#1F2937' : '#F9FAFB',
        });
        setShowEditModal(false);
        setEditingTransaction(null);
        // Refetch transactions
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          ...(searchTerm && { search: searchTerm }),
          ...(filters.transactionType && { transactionType: filters.transactionType }),
        });
        const refetchResponse = await fetch(`/api/transactions?${queryParams.toString()}`);
        const refetchData = await refetchResponse.json();
        if (refetchResponse.ok) {
          setTransactions(refetchData.transactions || refetchData.data || []);
        }
      } else {
        throw new Error('Failed to update transaction');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'লেনদেন আপডেট করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        background: isDark ? '#1F2937' : '#FEF2F2',
      });
    }
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(currentTransactions.map(t => t.transactionId || t._id));
    }
    setSelectAll(!selectAll);
  };

  const generateTransactionListPDF = async () => {
    try {
      Swal.fire({
        title: 'PDF তৈরি হচ্ছে...',
        text: 'Transaction List PDF তৈরি হচ্ছে',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: isDark ? '#1F2937' : '#F9FAFB'
      });

      let startDate, endDate;
      const now = new Date();
      
      if (pdfDateRange === 'daily') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      } else if (pdfDateRange === 'weekly') {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - diff), 23, 59, 59);
      } else if (pdfDateRange === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      } else if (pdfDateRange === 'custom') {
        if (!pdfCustomStartDate || !pdfCustomEndDate) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'অনুগ্রহ করে শুরু এবং শেষের তারিখ নির্বাচন করুন।',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            background: isDark ? '#1F2937' : '#FEF2F2'
          });
          return;
        }
        startDate = new Date(pdfCustomStartDate);
        endDate = new Date(pdfCustomEndDate + 'T23:59:59');
      }

      const filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
      });

      if (filteredTransactions.length === 0) {
        Swal.fire({
          title: 'সতর্কতা!',
          text: 'নির্বাচিত তারিখে কোন লেনদেন নেই।',
          icon: 'warning',
          confirmButtonText: 'ঠিক আছে',
          background: isDark ? '#1F2937' : '#F9FAFB'
        });
        return;
      }

      // Import jsPDF and html2canvas dynamically
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const rowsPerPage = 15;
      const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
      
      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        if (pageNum > 0) {
          doc.addPage();
        }
        
        const startIdx = pageNum * rowsPerPage;
        const endIdx = Math.min(startIdx + rowsPerPage, filteredTransactions.length);
        const pageTransactions = filteredTransactions.slice(startIdx, endIdx);
        
        const pageContainer = document.createElement('div');
        pageContainer.style.position = 'absolute';
        pageContainer.style.left = '-9999px';
        pageContainer.style.top = '-9999px';
        pageContainer.style.backgroundColor = 'white';
        pageContainer.style.padding = '30px 40px';
        pageContainer.style.width = '1050px';
        pageContainer.style.boxSizing = 'border-box';
        
        pageContainer.innerHTML = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #000; line-height: 1.4;">
            ${pageNum === 0 ? `
              <h1 style="text-align: center; color: #2563EB; font-size: 28px; margin: 0 0 8px 0; font-weight: 700;">
                Transaction List Report
              </h1>
              <p style="text-align: center; color: #6B7280; font-size: 14px; margin: 0 0 25px 0;">
                ${formatDate(startDate)} - ${formatDate(endDate)}
              </p>
            ` : `
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #2563EB; font-size: 18px; margin: 0;">Transaction List Report (Continued)</h2>
                <p style="color: #6B7280; font-size: 12px; margin: 0;">Page ${pageNum + 1} of ${totalPages}</p>
              </div>
            `}
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #2563EB; color: white;">
                  <th style="border: 1px solid #CBD5E1; padding: 14px 10px; text-align: center;">#</th>
                  <th style="border: 1px solid #CBD5E1; padding: 14px 10px; text-align: center;">Date</th>
                  <th style="border: 1px solid #CBD5E1; padding: 14px 10px; text-align: left;">Customer</th>
                  <th style="border: 1px solid #CBD5E1; padding: 14px 10px; text-align: left;">Phone</th>
                  <th style="border: 1px solid #CBD5E1; padding: 14px 10px; text-align: center;">Type</th>
                  <th style="border: 1px solid #CBD5E1; padding: 14px 10px; text-align: left;">Category</th>
                  <th style="border: 1px solid #CBD5E1; padding: 14px 10px; text-align: left;">Payment Method</th>
                  <th style="border: 1px solid #CBD5E1; padding: 14px 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${pageTransactions.map((t, index) => {
                  const globalIndex = startIdx + index;
                  return `
                    <tr style="background-color: ${index % 2 === 0 ? '#F9FAFB' : 'white'};">
                      <td style="border: 1px solid #E5E7EB; padding: 11px 10px; text-align: center;">${globalIndex + 1}</td>
                      <td style="border: 1px solid #E5E7EB; padding: 11px 10px; text-align: center;">${formatDate(t.date)}</td>
                      <td style="border: 1px solid #E5E7EB; padding: 11px 10px;">${getCustomerName(t) || '-'}</td>
                      <td style="border: 1px solid #E5E7EB; padding: 11px 10px;">${getCustomerPhone(t) || '-'}</td>
                      <td style="border: 1px solid #E5E7EB; padding: 11px 10px; text-align: center;">
                        <span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; ${
                          t.transactionType === 'credit' 
                            ? 'background: #D1FAE5; color: #065F46;' 
                            : 'background: #FEE2E2; color: #991B1B;'
                        }">${t.transactionType === 'credit' ? 'Credit' : 'Debit'}</span>
                      </td>
                      <td style="border: 1px solid #E5E7EB; padding: 11px 10px;">${getCategory(t)}</td>
                      <td style="border: 1px solid #E5E7EB; padding: 11px 10px;">${
                        t.paymentMethod === 'bank-transfer' ? 'Bank Transfer' : 
                        t.paymentMethod === 'cheque' ? 'Cheque' : 
                        t.paymentMethod === 'mobile-banking' ? 'Mobile Banking' : 
                        t.paymentMethod || '-'
                      }</td>
                      <td style="border: 1px solid #E5E7EB; padding: 11px 10px; text-align: right; font-weight: 600; color: ${
                        t.transactionType === 'credit' ? '#16A34A' : '#DC2626'
                      };">${formatAmount(parseFloat(t.paymentDetails?.amount || t.amount || 0))}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            <div style="margin-top: 20px; padding-top: 12px; border-top: 2px solid #E5E7EB; text-align: center;">
              <p style="color: #9CA3AF; font-size: 11px; margin: 0;">
                Page ${pageNum + 1} of ${totalPages} | Generated on: ${formatDate(new Date())}
              </p>
            </div>
          </div>
        `;
        
        document.body.appendChild(pageContainer);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const pageCanvas = await html2canvas(pageContainer, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        
        document.body.removeChild(pageContainer);
        
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 1.0);
        const imgWidth = pageWidth - 20;
        const imgHeight = (pageCanvas.height * imgWidth) / pageCanvas.width;
        const yPosition = imgHeight < (pageHeight - 20) ? (pageHeight - imgHeight) / 2 : 10;
        
        doc.addImage(pageImgData, 'JPEG', 10, yPosition, imgWidth, imgHeight);
      }
      
      const fileName = `Transaction_List_${pdfDateRange}_${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      Swal.close();
      setShowPDFDownloadModal(false);
      
      Swal.fire({
        title: 'সফল!',
        text: `Transaction List PDF সফলভাবে ডাউনলোড হয়েছে`,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        background: isDark ? '#1F2937' : '#F9FAFB',
      });
      
    } catch (error) {
      console.error('PDF generation error:', error);
      Swal.close();
      Swal.fire({
        title: 'ত্রুটি!',
        text: `PDF তৈরি করতে সমস্যা হয়েছে: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        background: isDark ? '#1F2937' : '#FEF2F2',
      });
    }
  };

  const handleBulkDownloadPDF = async () => {
    if (selectedTransactions.length === 0) {
      Swal.fire({
        title: 'সতর্কতা!',
        text: 'কোন লেনদেন নির্বাচন করা হয়নি।',
        icon: 'warning',
        confirmButtonText: 'ঠিক আছে',
        background: isDark ? '#1F2937' : '#F9FAFB'
      });
      return;
    }

    try {
      Swal.fire({
        title: 'PDF তৈরি হচ্ছে...',
        text: `${selectedTransactions.length}টি লেনদেনের PDF তৈরি হচ্ছে`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: isDark ? '#1F2937' : '#F9FAFB'
      });

      let successCount = 0;
      let errorCount = 0;

      for (const transactionId of selectedTransactions) {
        const transaction = currentTransactions.find(t => (t.transactionId || t._id) === transactionId);
        if (transaction) {
          try {
            const pdfData = preparePDFData(transaction);
            const result = await generateSalmaReceiptPDF(pdfData, {
              language: 'bn',
              showHeader: true,
            });
            if (result.success) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error(`PDF generation error for ${transactionId}:`, error);
            errorCount++;
          }
        }
      }

      Swal.close();

      if (successCount > 0) {
        Swal.fire({
          title: 'সফল!',
          text: `${successCount}টি PDF সফলভাবে ডাউনলোড হয়েছে${errorCount > 0 ? `, ${errorCount}টি ব্যর্থ` : ''}`,
          icon: successCount === selectedTransactions.length ? 'success' : 'warning',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          background: isDark ? '#1F2937' : '#F9FAFB'
        });
      } else {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'কোন PDF তৈরি করা যায়নি।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
          background: isDark ? '#1F2937' : '#FEF2F2'
        });
      }

      setSelectedTransactions([]);
      setSelectAll(false);

    } catch (error) {
      console.error('Bulk PDF generation error:', error);
      Swal.close();
      
      Swal.fire({
        title: 'ত্রুটি!',
        text: `PDF তৈরি করতে সমস্যা হয়েছে: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                    Transactions List
                  </h1>
                  <p className={`mt-2 text-lg transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    সব লেনদেনের তালিকা এবং পরিচালনা
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {selectedTransactions.length > 0 && (
                  <button
                    onClick={handleBulkDownloadPDF}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    PDF ডাউনলোড ({selectedTransactions.length})
                  </button>
                )}
                <button
                  onClick={() => setShowPDFDownloadModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <FileDown className="w-5 h-5" />
                  Transaction List PDF
                </button>
                <button
                  onClick={() => window.location.href = '/transactions/new'}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <CreditCard className="w-5 h-5" />
                  নতুন লেনদেন
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters Section */}
          <div className={`mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border transition-colors duration-300 ${
            isDark ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Transaction ID, নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 border rounded-xl font-medium transition-all duration-200 ${
                  showFilters
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600'
                    : isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-5 h-5" />
                ফিল্টার
                {Object.values(filters).some(value => value !== '') && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Clear Filters Button */}
              {Object.values(filters).some(value => value !== '') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-xl font-medium transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                  ফিল্টার সরান
                </button>
              )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      তারিখের পরিসর
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="">সব তারিখ</option>
                      <option value="today">আজ</option>
                      <option value="yesterday">গতকাল</option>
                      <option value="last-week">গত সপ্তাহ</option>
                      <option value="last-month">গত মাস</option>
                    </select>
                  </div>

                  {/* Transaction Type Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      লেনদেনের ধরন
                    </label>
                    <select
                      value={filters.transactionType}
                      onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                    >
                      {filterOptions.transactionType.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ক্যাটাগরি
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                    >
                      {filterOptions.category.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      পেমেন্ট মেথড
                    </label>
                    <select
                      value={filters.paymentMethod}
                      onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                    >
                      {filterOptions.paymentMethod.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      স্ট্যাটাস
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                    >
                      {filterOptions.status.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className={`mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                    ডেটা লোড করতে সমস্যা
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline"
                  >
                    আবার চেষ্টা করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className={`mb-4 bg-white dark:bg-gray-800 rounded-xl p-4 border transition-colors duration-300 ${
            isDark ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  মোট ফলাফল: <span className="font-semibold text-blue-600">{totalCount}</span>
                </span>
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  বর্তমান পৃষ্ঠা: <span className="font-semibold">{currentTransactions.length}</span>
                </span>
                {selectedTransactions.length > 0 && (
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>
                    নির্বাচিত: <span className="font-semibold">{selectedTransactions.length}</span>
                  </span>
                )}
              </div>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearFilters();
                  window.location.reload();
                }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                রিসেট করুন
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 ${
            isDark ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`bg-gray-50 dark:bg-gray-700`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                      Transaction ID
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                      কাস্টমার
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                      ধরন
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                      ক্যাটাগরি
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                      পেমেন্ট মেথড
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                      পরিমাণ
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                      তারিখ
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                      স্ট্যাটাস
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                      অ্যাকশন
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-gray-700`}>
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                          <span className="text-gray-600 dark:text-gray-400 text-lg">লেনদেন লোড হচ্ছে...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <X className="w-6 h-6 text-red-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              ডেটা লোড করতে সমস্যা
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                              {error}
                            </p>
                            <button
                              onClick={() => window.location.reload()}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                            >
                              আবার চেষ্টা করুন
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : currentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-16 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CreditCard className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                          কোন লেনদেন পাওয়া যায়নি
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                          {searchTerm || Object.values(filters).some(value => value !== '')
                            ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোন লেনদেন নেই।'
                            : 'এখনও কোন লেনদেন যোগ করা হয়নি।'
                          }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          {searchTerm || Object.values(filters).some(value => value !== '') ? (
                            <button
                              onClick={clearFilters}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                            >
                              ফিল্টার সরান
                            </button>
                          ) : (
                            <button
                              onClick={() => window.location.href = '/transactions/new'}
                              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                            >
                              নতুন লেনদেন যোগ করুন
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : currentTransactions.map((transaction) => {
                    const transactionId = transaction.transactionId || transaction._id;
                    const isSelected = selectedTransactions.includes(transactionId);
                    
                    return (
                      <tr key={transactionId} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectTransaction(transactionId)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                            {transaction.transactionId || transaction._id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getCustomerImage(transaction) ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <Image
                                  src={getCustomerImage(transaction)}
                                  alt={getCustomerName(transaction) || 'Customer'}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            )}
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {getCustomerName(transaction)}
                              </div>
                              {!!getCustomerPhone(transaction) && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {getCustomerPhone(transaction)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.transactionType)}`}>
                            {transaction.transactionType === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Tag className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {getCategory(transaction)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {transaction.paymentMethod === 'bank-transfer' ? 'ব্যাংক ট্রান্সফার' : 
                             transaction.paymentMethod === 'cheque' ? 'চেক' : 
                             transaction.paymentMethod === 'mobile-banking' ? 'মোবাইল ব্যাংকিং' : 
                             transaction.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className={`text-sm font-semibold ${
                              transaction.transactionType === 'credit' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {formatAmount(transaction.paymentDetails?.amount || transaction.amount || 0)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {formatDate(transaction.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor((transaction.status || '').toLowerCase())}`}>
                            {transaction.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewTransaction(transaction)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                              title="দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all duration-200"
                              title="সম্পাদনা করুন"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border transition-colors duration-300 ${
              isDark ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    পৃষ্ঠা {currentPage} এর {totalPages}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    আগে
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    পরে
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Details Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    লেনদেনের বিবরণ
                  </h3>
                  <button
                    onClick={() => setShowTransactionModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Transaction ID
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono">{selectedTransaction.transactionId || selectedTransaction._id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      কাস্টমারের নাম
                    </label>
                    <p className="text-gray-900 dark:text-white">{getCustomerName(selectedTransaction)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      ফোন নম্বর
                    </label>
                    <p className="text-gray-900 dark:text-white">{getCustomerPhone(selectedTransaction) || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      লেনদেনের ধরন
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedTransaction.transactionType)}`}>
                      {selectedTransaction.transactionType === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      ক্যাটাগরি
                    </label>
                    <p className="text-gray-900 dark:text-white">{getCategory(selectedTransaction)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      পরিমাণ
                    </label>
                    <p className={`font-semibold ${
                      selectedTransaction.transactionType === 'credit' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatAmount(selectedTransaction.paymentDetails?.amount || selectedTransaction.amount || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      তারিখ
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedTransaction.date)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className={`mb-4 p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showHeader}
                      onChange={(e) => setShowHeader(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Header দেখান (Logo, Title, Tagline)
                    </span>
                  </label>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleDownloadPDFBangla(selectedTransaction, showHeader)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    <Download className="w-5 h-5" />
                    বাংলা PDF
                  </button>
                  <button
                    onClick={() => handleDownloadPDFEnglish(selectedTransaction, showHeader)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    <Download className="w-5 h-5" />
                    English PDF
                  </button>
                  <button
                    onClick={() => setShowTransactionModal(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Transaction Modal */}
        {showEditModal && editingTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    লেনদেন সম্পাদনা করুন
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    লেনদেনের ধরন *
                  </label>
                  <select
                    name="transactionType"
                    value={editFormData.transactionType}
                    onChange={handleEditInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="credit">ক্রেডিট (আয়)</option>
                    <option value="debit">ডেবিট (ব্যয়)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ক্যাটাগরি *
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="hajj">হাজ্জ & উমরাহ</option>
                    <option value="air-ticket">এয়ার টিকেট</option>
                    <option value="visa">ভিসা সার্ভিস</option>
                    <option value="hotel">হোটেল বুকিং</option>
                    <option value="insurance">ইনসুরেন্স</option>
                    <option value="other">অন্যান্য সেবা</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    পেমেন্ট মেথড *
                  </label>
                  <select
                    name="paymentMethod"
                    value={editFormData.paymentMethod}
                    onChange={handleEditInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="bank-transfer">ব্যাংক ট্রান্সফার</option>
                    <option value="cheque">চেক</option>
                    <option value="mobile-banking">মোবাইল ব্যাংকিং</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    পরিমাণ *
                  </label>
                  <input
                    type="number"
                    name="paymentDetails.amount"
                    value={editFormData.paymentDetails?.amount || ''}
                    onChange={handleEditInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={handleUpdateTransaction}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  আপডেট করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Download Modal */}
        {showPDFDownloadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Transaction List PDF Download
                  </h3>
                  <button
                    onClick={() => setShowPDFDownloadModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    তারিখের পরিসর নির্বাচন করুন
                  </label>
                  <select
                    value={pdfDateRange}
                    onChange={(e) => setPDFDateRange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="daily">আজকের লেনদেন (Daily)</option>
                    <option value="weekly">এই সপ্তাহের লেনদেন (Weekly)</option>
                    <option value="monthly">এই মাসের লেনদেন (Monthly)</option>
                    <option value="custom">কাস্টম তারিখ (Custom Date)</option>
                  </select>
                </div>

                {pdfDateRange === 'custom' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        শুরুর তারিখ
                      </label>
                      <input
                        type="date"
                        value={pdfCustomStartDate}
                        onChange={(e) => setPDFCustomStartDate(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        শেষের তারিখ
                      </label>
                      <input
                        type="date"
                        value={pdfCustomEndDate}
                        onChange={(e) => setPDFCustomEndDate(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowPDFDownloadModal(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={generateTransactionListPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200"
                >
                  <FileDown className="w-5 h-5" />
                  PDF ডাউনলোড করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TransactionsList;
