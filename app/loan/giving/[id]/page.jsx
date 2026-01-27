'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingDown,
  Edit,
  Download,
  Loader2,
  CreditCard,
  Home,
  Briefcase,
  UserCircle,
  CalendarDays,
  FileCheck
} from 'lucide-react';
import DashboardLayout from '../../../component/DashboardLayout';
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

const LoanDetails = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loan, setLoan] = useState(null);
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('profile');

  // Fetch loan details
  useEffect(() => {
    const fetchLoan = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/loans/giving/${id}`);
        const data = await response.json();

        if (response.ok) {
          setLoan(data.loan || data.data);
          // You can fetch transaction summary separately if needed
          // setTransactionSummary(data.transactionSummary);
        } else {
          throw new Error(data.error || 'Failed to fetch loan');
        }
      } catch (err) {
        console.error('Error fetching loan:', err);
        setError(err.message || 'Failed to load loan');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTransactions = async () => {
      if (!id) return;
      setTransactionsLoading(true);
      try {
        const response = await fetch(`/api/transactions?partyType=loan&partyId=${id}&limit=100`);
        const data = await response.json();
        if (response.ok) {
          setTransactions(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchLoan();
    fetchTransactions();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'closed':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'সক্রিয়';
      case 'completed':
        return 'সম্পন্ন';
      case 'pending':
        return 'বিচারাধীন';
      case 'rejected':
        return 'প্রত্যাখ্যাত';
      case 'closed':
        return 'বন্ধ';
      case 'overdue':
        return 'মেয়াদ উত্তীর্ণ';
      default:
        return status || 'অজানা';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'closed':
        return <FileCheck className="w-5 h-5" />;
      case 'overdue':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount) => {
    const numericValue = Number(amount) || 0;
    const formatted = `৳${numericValue.toLocaleString('en-US')}`;
    return formatted.replace(/([৳\s])([\d,]+)/g, (match, symbol, numbers) => {
      return symbol + toBengaliNumeral(numbers);
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">ঋণের তথ্য লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !loan) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ঋণ পাওয়া যায়নি
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                আপনি যে ঋণটি খুঁজছেন তা পাওয়া যায়নি বা মুছে ফেলা হয়েছে।
              </p>
              <button
                onClick={() => router.push('/loan/giving-list')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ঋণ তালিকায় ফিরে যান
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalAmount = Number(loan.totalAmount || loan.amount || 0);
  const paidAmount = Number(loan.paidAmount || 0);
  const dueAmount = Number(loan.totalDue || loan.remainingAmount || Math.max(0, totalAmount - paidAmount));
  const progressPercentage = totalAmount ? Math.min(100, (paidAmount / totalAmount) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ফিরে যান</span>
            </button>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ঋণের বিস্তারিত তথ্য</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    ঋণ প্রদান - {loan.loanId || id}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const editId = id || loan?.loanId || loan?._id || loan?.id;
                    if (!editId) {
                      Swal.fire({
                        title: 'ত্রুটি!',
                        text: 'ঋণ ID পাওয়া যায়নি',
                        icon: 'error',
                        confirmButtonText: 'ঠিক আছে',
                        confirmButtonColor: '#EF4444',
                      });
                      return;
                    }
                    router.push(`/loan/giving/${editId}/edit`);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  সম্পাদনা
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors shadow-md">
                  <Download className="w-4 h-4" />
                  ডাউনলোড
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-2 font-medium text-sm transition-colors relative ${
                activeTab === 'profile'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              প্রোফাইল তথ্য
              {activeTab === 'profile' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('loan')}
              className={`pb-3 px-2 font-medium text-sm transition-colors relative ${
                activeTab === 'loan'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              লোন ও লেনদেন
              {activeTab === 'loan' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'profile' && (
              <div className="animate-fadeIn">
                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                      <UserCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ব্যক্তিগত তথ্য</h2>
                  </div>

                  {/* Profile Photo */}
                  {loan.profilePhoto && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">প্রোফাইল ছবি</p>
                      <div className="relative w-24 h-24 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={loan.profilePhoto}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-full h-full hidden items-center justify-center bg-gray-200 dark:bg-gray-600">
                          <UserCircle className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">পূর্ণ নাম</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">
                        {loan.fullName || `${loan.firstName || ''} ${loan.lastName || ''}`.trim() || 'N/A'}
                      </p>
                    </div>

                    {loan.firstName && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">নামের প্রথম অংশ</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.firstName}</p>
                        </div>
                        {loan.lastName && (
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">নামের শেষ অংশ</p>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.lastName}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {loan.fatherName && (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">পিতার নাম</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.fatherName}</p>
                      </div>
                    )}

                    {loan.motherName && (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">মাতার নাম</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.motherName}</p>
                      </div>
                    )}

                    {loan.dateOfBirth && (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">জন্ম তারিখ</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{formatDate(loan.dateOfBirth)}</p>
                      </div>
                    )}

                    {loan.gender && (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">লিঙ্গ</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {loan.gender === 'Male' ? 'পুরুষ' : loan.gender === 'Female' ? 'মহিলা' : loan.gender}
                        </p>
                      </div>
                    )}

                    {loan.maritalStatus && (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">বৈবাহিক অবস্থা</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {loan.maritalStatus === 'Single' ? 'অবিবাহিত' :
                           loan.maritalStatus === 'Married' ? 'বিবাহিত' :
                           loan.maritalStatus === 'Divorced' ? 'তালাকপ্রাপ্ত' :
                           loan.maritalStatus === 'Widowed' ? 'বিধবা/বিধুর' :
                           loan.maritalStatus}
                        </p>
                      </div>
                    )}

                    {loan.nidNumber && (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          জাতীয় পরিচয়পত্র নম্বর
                        </p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.nidNumber}</p>
                      </div>
                    )}
                  </div>

                  {/* NID Images */}
                  {(loan.nidFrontImage || loan.nidBackImage) && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        জাতীয় পরিচয়পত্রের ছবি
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loan.nidFrontImage && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">এনআইডি সামনের দিক</p>
                            <div className="relative w-full aspect-[16/10] rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800 shadow-sm">
                              <img
                                src={loan.nidFrontImage}
                                alt="NID Front"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="w-full h-full hidden items-center justify-center bg-gray-100 dark:bg-gray-700">
                                <FileText className="w-12 h-12 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        )}
                        {loan.nidBackImage && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">এনআইডি পিছনের দিক</p>
                            <div className="relative w-full aspect-[16/10] rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800 shadow-sm">
                              <img
                                src={loan.nidBackImage}
                                alt="NID Back"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="w-full h-full hidden items-center justify-center bg-gray-100 dark:bg-gray-700">
                                <FileText className="w-12 h-12 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact & Address Information */}
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">যোগাযোগ ও ঠিকানা</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {loan.contactPhone && (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">মোবাইল নম্বর</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-lg">
                          {loan.contactPhone}
                        </p>
                      </div>
                    )}

                    {loan.contactEmail && (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">ইমেইল</p>
                        </div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.contactEmail}</p>
                      </div>
                    )}

                    {loan.presentAddress && (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <Home className="w-4 h-4 text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">বর্তমান ঠিকানা</p>
                        </div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.presentAddress}</p>
                        {(loan.district || loan.upazila) && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            {loan.district}{loan.upazila ? `, ${loan.upazila}` : ''}
                            {loan.postCode && ` - ${loan.postCode}`}
                          </p>
                        )}
                      </div>
                    )}

                    {loan.permanentAddress && (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">স্থায়ী ঠিকানা</p>
                        </div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.permanentAddress}</p>
                      </div>
                    )}

                    {loan.contactPerson && (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">যোগাযোগের ব্যক্তির নাম</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.contactPerson}</p>
                      </div>
                    )}

                    {(loan.emergencyContact || loan.emergencyPhone) && (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">জরুরি যোগাযোগ</p>
                        {loan.emergencyContact && (
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.emergencyContact}</p>
                        )}
                        {loan.emergencyPhone && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{loan.emergencyPhone}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Information */}
              {(loan.businessName || loan.businessType || loan.businessAddress) && (
                <div className="mb-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                      <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ব্যবসায়িক তথ্য</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loan.businessName && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <p className="text-xs font-medium text-purple-700 dark:text-purple-300">ব্যবসার নাম</p>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">{loan.businessName}</p>
                      </div>
                    )}

                    {loan.businessType && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <p className="text-xs font-medium text-purple-700 dark:text-purple-300">ব্যবসার ধরন</p>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">{loan.businessType}</p>
                      </div>
                    )}

                    {loan.businessAddress && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <p className="text-xs font-medium text-purple-700 dark:text-purple-300">ব্যবসার ঠিকানা</p>
                        </div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.businessAddress}</p>
                      </div>
                    )}

                    {loan.businessRegistration && (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ব্যবসার নিবন্ধন নম্বর</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.businessRegistration}</p>
                      </div>
                    )}

                    {loan.businessExperience && (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ব্যবসার অভিজ্ঞতা</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.businessExperience}</p>
                      </div>
                    )}
                  </div>
              </div>
            )}

            {activeTab === 'loan' && (
              <div className="animate-fadeIn space-y-6">
                {/* Status Banner */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(loan.status)}`}>
                        {getStatusIcon(loan.status)}
                        {getStatusText(loan.status)}
                      </span>
                      <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md text-sm font-medium">
                        ঋণ প্রদান
                      </span>
                    </div>
                  </div>
                </div>

                {/* Loan Dates */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-indigo-100 dark:bg-indigo-900/20 p-2 rounded-lg">
                      <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ঋণের তারিখ</h2>
                  </div>
                
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loan.commencementDate && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">শুরুর তারিখ</p>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                          {formatDate(loan.commencementDate)}
                        </p>
                      </div>
                    )}

                    {loan.completionDate && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <p className="text-xs font-medium text-green-700 dark:text-green-300">সমাপ্তির তারিখ</p>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                          {formatDate(loan.completionDate)}
                        </p>
                      </div>
                    )}

                    {loan.commitmentDate && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <p className="text-xs font-medium text-purple-700 dark:text-purple-300">কমিট্মেন্ট তারিখ</p>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                          {formatDate(loan.commitmentDate)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-lg">
                      <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">আর্থিক সারসংক্ষেপ</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl border shadow-md bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-800/20 border-purple-300 dark:border-purple-700">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">মোট ঋণের পরিমাণ</p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                    
                    <div className="p-6 rounded-xl border shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border-green-300 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">মোট পরিশোধ</p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(paidAmount)}
                      </p>
                    </div>
                    
                    <div className="p-6 rounded-xl border shadow-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-300 dark:border-amber-700">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">মোট বাকি</p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(dueAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar inside Financial Summary */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        পরিশোধের অগ্রগতি
                      </h3>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {toBengaliNumeral(progressPercentage.toFixed(1))}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3 shadow-inner">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 shadow-md ${
                          progressPercentage >= 100 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : progressPercentage >= 50
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        }`}
                        style={{ width: `${Math.min(100, progressPercentage)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          পরিশোধ: <span className="text-green-600 dark:text-green-400 font-bold">{formatCurrency(paidAmount)}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          বাকি: <span className="text-amber-600 dark:text-amber-400 font-bold">{formatCurrency(dueAmount)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions History */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">লেনদেনের ইতিহাস</h2>
                  </div>

                  {transactionsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            <th scope="col" className="px-6 py-3">তারিখ</th>
                            <th scope="col" className="px-6 py-3">বিবরণ</th>
                            <th scope="col" className="px-6 py-3">পেমেন্ট মেথড</th>
                            <th scope="col" className="px-6 py-3 text-right">পরিমাণ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx) => (
                            <tr key={tx._id || tx.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                {formatDate(tx.date)}
                              </td>
                              <td className="px-6 py-4">
                                {tx.description || tx.type || 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                {tx.paymentMethod || 'N/A'}
                              </td>
                              <td className={`px-6 py-4 text-right font-bold ${
                                tx.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {tx.transactionType === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      কোনো লেনদেন পাওয়া যায়নি
                    </div>
                  )}
                </div>

                {/* Notes */}
                {loan.notes && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">নোট</h3>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{loan.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

              {/* Loan Information */}
              <div className="mb-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 dark:bg-indigo-900/20 p-2 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ঋণের তারিখ</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {loan.commencementDate && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">শুরুর তারিখ</p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">
                        {formatDate(loan.commencementDate)}
                      </p>
                    </div>
                  )}

                  {loan.completionDate && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarDays className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-xs font-medium text-green-700 dark:text-green-300">সমাপ্তির তারিখ</p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">
                        {formatDate(loan.completionDate)}
                      </p>
                    </div>
                  )}

                  {loan.commitmentDate && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarDays className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-300">কমিট্মেন্ট তারিখ</p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">
                        {formatDate(loan.commitmentDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mb-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">আর্থিক সারসংক্ষেপ</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl border shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-300 dark:border-blue-700">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">মোট ঋণের পরিমাণ</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-xl border shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border-green-300 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">মোট পরিশোধ</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(paidAmount)}
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-xl border shadow-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-300 dark:border-amber-700">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">মোট বাকি</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(dueAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    পরিশোধের অগ্রগতি
                  </h3>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {toBengaliNumeral(progressPercentage.toFixed(1))}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3 shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 shadow-md ${
                      progressPercentage >= 100 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : progressPercentage >= 50
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`}
                    style={{ width: `${Math.min(100, progressPercentage)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      পরিশোধ: <span className="text-green-600 dark:text-green-400 font-bold">{formatCurrency(paidAmount)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      বাকি: <span className="text-amber-600 dark:text-amber-400 font-bold">{formatCurrency(dueAmount)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {loan.notes && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">নোট</h3>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{loan.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LoanDetails;
