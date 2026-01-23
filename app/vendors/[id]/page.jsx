'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Building2, Phone, User, MapPin, Calendar, CreditCard, FileText, ArrowLeft, Clock, Edit,
  DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, AlertCircle, CheckCircle,
  Briefcase, Globe, Mail, Hash, Calendar as CalendarIcon, Star, Loader2, Eye, Trash2, X, Plus, Save
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

const VendorDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [activeTab, setActiveTab] = useState('bills');
  const [transactionPage, setTransactionPage] = useState(1);
  const transactionLimit = 10;
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    billNumber: '',
    billType: '',
    billDate: '',
    totalAmount: '',
    paidAmount: '',
    dueDate: '',
    paymentMethod: '',
    paymentStatus: 'pending',
    description: '',
    notes: ''
  });

  // State for data
  const [vendor, setVendor] = useState(null);
  const [vendorBills, setVendorBills] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billsLoading, setBillsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [billLoading, setBillLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);

  // Fetch vendor
  useEffect(() => {
    if (id) {
      fetchVendor();
      fetchVendorBills();
      fetchTransactions();
    }
  }, [id]);

  // Fetch transactions when page changes
  useEffect(() => {
    if (id && activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [transactionPage, activeTab, id]);

  const fetchBankAccounts = async () => {
    setBankAccountsLoading(true);
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
      setBankAccountsLoading(false);
    }
  };

  // Fetch bank accounts when tab changes or on mount
  useEffect(() => {
    if (id && (activeTab === 'bank-accounts' || !bankAccounts.length)) {
      fetchBankAccounts();
    }
  }, [activeTab, id]);

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
        title: 'Error!',
        text: error.message || 'Failed to load vendor',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendorBills = async () => {
    setBillsLoading(true);
    try {
      const response = await fetch(`/api/vendors/${id}/bills`);
      const result = await response.json();

      if (response.ok) {
        setVendorBills(result.bills || result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch vendor bills');
      }
    } catch (error) {
      console.error('Error fetching vendor bills:', error);
      // Don't show error if bills collection doesn't exist yet
      setVendorBills([]);
    } finally {
      setBillsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        partyType: 'vendor',
        partyId: id,
        page: transactionPage.toString(),
        limit: transactionLimit.toString(),
      });

      const response = await fetch(`/api/transactions?${queryParams}`);
      const result = await response.json();

      if (response.ok) {
        setTransactions(result.transactions || result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchBill = async (billId) => {
    setBillLoading(true);
    try {
      const response = await fetch(`/api/vendors/${id}/bills/${billId}`);
      const result = await response.json();

      if (response.ok) {
        setSelectedBill(result.bill || result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch bill');
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to load bill',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setBillLoading(false);
    }
  };

  // Calculate financial totals from vendor bills
  const calculatedFinancials = useMemo(() => {
    if (vendorBills.length === 0) {
      return {
        totalBillAmount: 0,
        totalPaid: 0,
        totalDue: 0,
      };
    }

    const totalBillAmount = vendorBills.reduce((sum, bill) => sum + (Number(bill.totalAmount) || 0), 0);
    const totalPaid = vendorBills.reduce((sum, bill) => sum + (Number(bill.paidAmount) || 0), 0);
    const totalDue = Math.max(0, totalBillAmount - totalPaid);

    return {
      totalBillAmount,
      totalPaid,
      totalDue,
    };
  }, [vendorBills]);

  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Handle view bill modal
  const handleViewBill = (billId) => {
    setSelectedBillId(billId);
    setShowBillModal(true);
    fetchBill(billId);
  };

  // Handle edit bill
  const handleEditBill = (bill) => {
    setEditFormData({
      billNumber: bill.billNumber || bill.billId || '',
      billType: bill.billType || '',
      billDate: bill.billDate ? new Date(bill.billDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      totalAmount: bill.totalAmount || bill.amount || '',
      paidAmount: bill.paidAmount || '',
      dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : '',
      paymentMethod: bill.paymentMethod || '',
      paymentStatus: bill.paymentStatus || 'pending',
      description: bill.description || '',
      notes: bill.notes || ''
    });
    setSelectedBillId(bill._id || bill.billId);
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save edited bill
  const handleSaveEdit = async () => {
    if (!editFormData.billNumber || !editFormData.totalAmount) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'বিল নম্বর এবং মোট পরিমাণ আবশ্যক',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }

    setIsUpdating(true);
    try {
      const billId = selectedBillId;
      const response = await fetch(`/api/vendors/${id}/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billNumber: editFormData.billNumber,
          billType: editFormData.billType,
          billDate: editFormData.billDate,
          totalAmount: Number(editFormData.totalAmount),
          paidAmount: Number(editFormData.paidAmount || 0),
          dueDate: editFormData.dueDate || undefined,
          paymentMethod: editFormData.paymentMethod || undefined,
          paymentStatus: editFormData.paymentStatus,
          description: editFormData.description || undefined,
          notes: editFormData.notes || undefined
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Bill updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#7c3aed',
        });
        setShowEditModal(false);
        setSelectedBillId(null);
        fetchVendorBills();
        fetchVendor();
      } else {
        throw new Error(result.error || 'Failed to update bill');
      }
    } catch (error) {
      console.error('Failed to update bill:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to update bill',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedBillId(null);
    setEditFormData({
      billNumber: '',
      billType: '',
      billDate: '',
      totalAmount: '',
      paidAmount: '',
      dueDate: '',
      paymentMethod: '',
      paymentStatus: 'pending',
      description: '',
      notes: ''
    });
  };

  // Handle delete bill
  const handleDeleteBill = async (bill) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `বিল "${bill.billNumber || bill.billId || 'N/A'}" মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        const billId = bill._id || bill.billId;
        const response = await fetch(`/api/vendors/${id}/bills/${billId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Bill deleted successfully!',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#7c3aed',
          });
          fetchVendorBills();
          fetchVendor();
        } else {
          throw new Error(result.error || 'Failed to delete bill');
        }
      } catch (error) {
        console.error('Failed to delete bill:', error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to delete bill',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowBillModal(false);
    setSelectedBillId(null);
    setSelectedBill(null);
  };

  const formatBankCurrency = (amount, currency = 'BDT') => {
    return `${currency} ${Number(amount || 0).toLocaleString('bn-BD')}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <div className="text-gray-500 dark:text-gray-400">ভেন্ডর তথ্য লোড হচ্ছে...</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!vendor) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 dark:text-gray-400 text-lg">ভেন্ডর পাওয়া যায়নি</div>
              <Link href="/vendors" className="text-purple-600 hover:text-purple-700 mt-2 inline-block">
                ← ভেন্ডর তালিকায় ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate financial totals
  const paidAmount = Math.max(0, Number(
    vendor?.totalPaid ?? 
    vendor?.paidAmount ?? 
    vendor?.totalPaidAmount ?? 
    calculatedFinancials.totalPaid ??
    0
  ));
  const dueAmount = Math.max(0, Number(
    vendor?.totalDue ?? 
    vendor?.dueAmount ?? 
    vendor?.outstandingAmount ?? 
    vendor?.totalDueAmount ?? 
    calculatedFinancials.totalDue ??
    0
  ));
  const totalBill = Math.max(0, paidAmount + dueAmount);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-100 via-blue-50 to-blue-100 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-blue-900/20 rounded-2xl p-6 text-gray-900 dark:text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {vendor.logo ? (
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src={vendor.logo}
                    alt={`${vendor.tradeName} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-white/80 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{vendor.tradeName}</h1>
                <p className="text-gray-700 dark:text-gray-300 text-lg">{vendor.ownerName}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/80 dark:bg-gray-800 rounded-full text-sm text-gray-900 dark:text-white">
                    <Hash className="w-4 h-4" />
                    {vendor.vendorId || vendor._id}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-sm text-gray-900 dark:text-white">
                    <CheckCircle className="w-4 h-4" />
                    {vendor.status || 'active'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href={`/vendors/${vendor._id || vendor.vendorId}/bank-accounts`}
                className="inline-flex items-center gap-2 rounded-lg bg-white/80 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 px-4 py-2 text-sm font-medium transition-colors text-gray-900 dark:text-white"
              >
                <CreditCard className="w-4 h-4" />
                ব্যাংক একাউন্ট
              </Link>
              <Link 
                href={`/vendors/${vendor._id || vendor.vendorId}/edit`} 
                className="inline-flex items-center gap-2 rounded-lg bg-white/80 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 px-4 py-2 text-sm font-medium transition-colors text-gray-900 dark:text-white"
              >
                <Edit className="w-4 h-4" />
                ভেন্ডর সম্পাদনা
              </Link>
              <Link 
                href="/vendors" 
                className="inline-flex items-center gap-2 rounded-lg bg-white/80 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 px-4 py-2 text-sm font-medium transition-colors text-gray-900 dark:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                তালিকায় ফিরে যান
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ভেন্ডর বিল</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalBill > 0 ? formatCurrency(totalBill) : '৳0'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  মোট {vendorBills.length} টি বিল
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">পরিশোধ</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {paidAmount > 0 ? formatCurrency(paidAmount) : '৳0'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {vendorBills.length > 0 
                    ? `${vendorBills.filter(b => {
                        const due = (Number(b.totalAmount) || 0) - (Number(b.paidAmount) || 0);
                        return due <= 0;
                      }).length} টি বিল পরিশোধিত`
                    : 'কোনো বিল নেই'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">বকেয়া</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {dueAmount > 0 ? formatCurrency(dueAmount) : '৳0'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {vendorBills.length > 0 
                    ? `${vendorBills.filter(b => {
                        const due = (Number(b.totalAmount) || 0) - (Number(b.paidAmount) || 0);
                        return due > 0;
                      }).length} টি বিল বকেয়া`
                    : 'কোনো বিল নেই'}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('financial')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'financial'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  আর্থিক তথ্য
                </div>
              </button>
              <button
                onClick={() => setActiveTab('information')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'information'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  ভেন্ডর তথ্য
                </div>
              </button>
              <button
                onClick={() => setActiveTab('bills')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'bills'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  ভেন্ডর বিল
                </div>
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'transactions'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  লেনদেনের ইতিহাস
                </div>
              </button>
              <button
                onClick={() => setActiveTab('bank-accounts')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'bank-accounts'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  ব্যাংক একাউন্ট
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Vendor Information Tab */}
            {activeTab === 'information' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {vendor.logo && (
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                          <img
                            src={vendor.logo}
                            alt={`${vendor.tradeName} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ভেন্ডর লোগো</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">কোম্পানির ব্র্যান্ডিং</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Hash className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ভেন্ডর আইডি</div>
                        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.vendorId || vendor._id}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">মালিকের নাম</div>
                        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.ownerName}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ব্যবসার অবস্থান</div>
                        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.tradeLocation}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">যোগাযোগের নম্বর</div>
                        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.contactNo}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">জন্ম তারিখ</div>
                        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.dob || 'প্রদান করা হয়নি'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">এনআইডি নম্বর</div>
                        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.nid || 'প্রদান করা হয়নি'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 mt-1 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">পাসপোর্ট নম্বর</div>
                        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.passport || 'প্রদান করা হয়নি'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Data Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">পরিশোধিত পরিমাণ</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(paidAmount)}
                      </div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">বকেয়া পরিমাণ</div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(dueAmount)}
                      </div>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">মোট বিল পরিমাণ</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(totalBill)}
                      </div>
                    </div>
                    <Receipt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Vendor Bills Tab */}
            {activeTab === 'bills' && (
              <div className="space-y-6">
                {billsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                      <span className="text-gray-600 dark:text-gray-400">বিল লোড হচ্ছে...</span>
                    </div>
                  </div>
                ) : vendorBills.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">কোনো বিল পাওয়া যায়নি</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">বিল নম্বর</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">বিল ধরন</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">মোট পরিমাণ</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">পরিশোধিত</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">বকেয়া</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">স্ট্যাটাস</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">তারিখ</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {vendorBills.map((bill) => {
                          const dueAmount = (Number(bill.totalAmount) || 0) - (Number(bill.paidAmount) || 0);
                          return (
                            <tr key={bill._id || bill.billId} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {bill.billNumber || bill.billId || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {bill.billType || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {formatCurrency(bill.totalAmount || 0)}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(bill.paidAmount || 0)}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                                {formatCurrency(dueAmount)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                  bill.paymentStatus === 'paid' || dueAmount <= 0
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                  {bill.paymentStatus === 'paid' || dueAmount <= 0 ? 'পরিশোধিত' : 'বকেয়া'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {bill.billDate || bill.createdAt 
                                  ? new Date(bill.billDate || bill.createdAt).toLocaleDateString('bn-BD')
                                  : '—'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleViewBill(bill._id || bill.billId)}
                                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    title="বিস্তারিত দেখুন"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEditBill(bill)}
                                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    title="সম্পাদনা করুন"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBill(bill)}
                                    disabled={isDeleting}
                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="মুছে ফেলুন"
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Bill View Modal */}
            <Modal
              isOpen={showBillModal}
              onClose={handleCloseModal}
              title="বিল বিবরণ"
              size="lg"
            >
              {billLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">বিল লোড হচ্ছে...</span>
                </div>
              ) : selectedBill ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedBill.billNumber || selectedBill.billId || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedBill.billType || '—'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      (selectedBill.paymentStatus === 'paid' || ((Number(selectedBill.totalAmount) || 0) - (Number(selectedBill.paidAmount) || 0)) <= 0)
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {(selectedBill.paymentStatus === 'paid' || ((Number(selectedBill.totalAmount) || 0) - (Number(selectedBill.paidAmount) || 0)) <= 0) ? 'পরিশোধিত' : 'বকেয়া'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">বিল তারিখ</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedBill.billDate || selectedBill.createdAt)}</p>
                    </div>
                    {selectedBill.dueDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">পরিশোধের তারিখ</label>
                        <p className="text-gray-900 dark:text-white">{formatDate(selectedBill.dueDate)}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">মোট পরিমাণ</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedBill.totalAmount || 0)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">পরিশোধিত</label>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(selectedBill.paidAmount || 0)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">বকেয়া</label>
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(Math.max(0, (Number(selectedBill.totalAmount) || 0) - (Number(selectedBill.paidAmount) || 0)))}
                      </p>
                    </div>
                    {selectedBill.paymentMethod && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">পেমেন্ট পদ্ধতি</label>
                        <p className="text-gray-900 dark:text-white">{selectedBill.paymentMethod}</p>
                      </div>
                    )}
                    {selectedBill.description && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">বিবরণ</label>
                        <p className="text-gray-900 dark:text-white">{selectedBill.description}</p>
                      </div>
                    )}
                    {selectedBill.notes && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">নোট</label>
                        <p className="text-gray-900 dark:text-white">{selectedBill.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        handleEditBill(selectedBill);
                        handleCloseModal();
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      সম্পাদনা করুন
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">বিল লোড করতে সমস্যা হয়েছে</p>
                </div>
              )}
            </Modal>

            {/* Edit Bill Modal */}
            <Modal
              isOpen={showEditModal}
              onClose={handleCloseEditModal}
              title="বিল সম্পাদনা করুন"
              size="lg"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      বিল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.billNumber}
                      onChange={(e) => handleEditFormChange('billNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="বিল নম্বর"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      বিল ধরন
                    </label>
                    <input
                      type="text"
                      value={editFormData.billType}
                      onChange={(e) => handleEditFormChange('billType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="বিল ধরন"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      বিল তারিখ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editFormData.billDate}
                      onChange={(e) => handleEditFormChange('billDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      পরিশোধের তারিখ
                    </label>
                    <input
                      type="date"
                      value={editFormData.dueDate}
                      onChange={(e) => handleEditFormChange('dueDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      মোট পরিমাণ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.totalAmount}
                      onChange={(e) => handleEditFormChange('totalAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      পরিশোধিত পরিমাণ
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.paidAmount}
                      onChange={(e) => handleEditFormChange('paidAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      পেমেন্ট পদ্ধতি
                    </label>
                    <select
                      value={editFormData.paymentMethod}
                      onChange={(e) => handleEditFormChange('paymentMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">নির্বাচন করুন</option>
                      <option value="cash">নগদ</option>
                      <option value="bank">ব্যাংক</option>
                      <option value="mobile-banking">মোবাইল ব্যাংকিং</option>
                      <option value="check">চেক</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      পেমেন্ট স্ট্যাটাস
                    </label>
                    <select
                      value={editFormData.paymentStatus}
                      onChange={(e) => handleEditFormChange('paymentStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="pending">বকেয়া</option>
                      <option value="partial">আংশিক</option>
                      <option value="paid">পরিশোধিত</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      বিবরণ
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="বিলের বিবরণ"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      নোট
                    </label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => handleEditFormChange('notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="অতিরিক্ত নোট"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">বকেয়া পরিমাণ:</span>
                    <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(Math.max(0, (Number(editFormData.totalAmount) || 0) - (Number(editFormData.paidAmount) || 0)))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleCloseEditModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        সংরক্ষণ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        সংরক্ষণ করুন
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Modal>

            {/* Transaction History Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                      <span className="text-gray-600 dark:text-gray-400">লেনদেন লোড হচ্ছে...</span>
                    </div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">কোনো লেনদেন পাওয়া যায়নি</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">লেনদেন আইডি</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ধরন</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">পরিমাণ</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">পদ্ধতি</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">রেফারেন্স</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">তারিখ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {transactions.map((transaction) => {
                            const isDebit = transaction.transactionType === 'debit' || transaction.type === 'debit';
                            const amount = Number(transaction.amount || 0);
                            return (
                              <tr key={transaction._id || transaction.transactionId} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                  {transaction.transactionId || transaction._id || '—'}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                    isDebit
                                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  }`}>
                                    {isDebit ? 'ডেবিট' : 'ক্রেডিট'}
                                  </span>
                                </td>
                                <td className={`px-4 py-3 text-sm font-semibold ${
                                  isDebit 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {isDebit ? '-' : '+'}{formatCurrency(amount)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                  {transaction.paymentMethod || transaction.paymentDetails?.method || '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                  {transaction.reference || transaction.paymentDetails?.reference || '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                  {transaction.createdAt || transaction.date
                                    ? new Date(transaction.createdAt || transaction.date).toLocaleDateString('bn-BD', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Bank Accounts Tab */}
            {activeTab === 'bank-accounts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ব্যাংক একাউন্ট</h3>
                  <Link
                    href={`/vendors/${id}/bank-accounts`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    সব ব্যাংক একাউন্ট দেখুন
                  </Link>
                </div>

                {bankAccountsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : bankAccounts.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      কোনো ব্যাংক একাউন্ট নেই
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      আপনার প্রথম ব্যাংক একাউন্ট যোগ করুন
                    </p>
                    <Link
                      href={`/vendors/${id}/bank-accounts`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      ব্যাংক একাউন্ট যোগ করুন
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        মোট {bankAccounts.length} টি ব্যাংক একাউন্ট
                      </p>
                      <Link
                        href={`/vendors/${id}/bank-accounts`}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
                      >
                        সব দেখুন →
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {bankAccounts.slice(0, 6).map((account) => (
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
                          </div>

                          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Account Holder</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {account.accountHolder}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {account.accountType}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {formatBankCurrency(account.currentBalance || account.initialBalance, account.currency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {bankAccounts.length > 6 && (
                      <div className="text-center pt-4">
                        <Link
                          href={`/vendors/${id}/bank-accounts`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                          সব ব্যাংক একাউন্ট দেখুন ({bankAccounts.length} টি)
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDetails;
