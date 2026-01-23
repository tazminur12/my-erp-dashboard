'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../component/DashboardLayout';
import { 
  ArrowLeft, 
  Edit, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  Plus,
  Trash2,
  Eye,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

const HotelDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  const [hotel, setHotel] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingContract, setViewingContract] = useState(null);
  const [editingContractId, setEditingContractId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contract form data
  const [contractFormData, setContractFormData] = useState({
    contractType: 'হজ্ব',
    nusukAgencyId: '',
    requestNumber: '',
    hotelName: '',
    contractNumber: '',
    contractStart: '',
    contractEnd: '',
    hajjiCount: '',
    nusukPayment: '',
    cashPayment: '',
    otherBills: ''
  });

  // Fetch hotel data
  useEffect(() => {
    if (id) {
      fetchHotelData();
      fetchContracts();
      fetchLicenses();
    }
  }, [id]);

  const fetchHotelData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/hotels/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setHotel(data.hotel || data.data);
        if (data.hotel?.hotelName || data.data?.hotelName) {
          setContractFormData(prev => ({
            ...prev,
            hotelName: data.hotel?.hotelName || data.data?.hotelName
          }));
        }
      } else {
        throw new Error(data.error || 'Failed to fetch hotel');
      }
    } catch (err) {
      console.error('Error fetching hotel:', err);
      setError(err.message || 'Failed to load hotel');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContracts = async () => {
    try {
      setContractsLoading(true);
      const response = await fetch(`/api/hotel-contracts?hotelId=${id}&limit=1000`);
      const data = await response.json();
      
      if (response.ok) {
        setContracts(data.contracts || data.data || []);
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setContractsLoading(false);
    }
  };

  const fetchLicenses = async () => {
    try {
      const response = await fetch('/api/licenses');
      const data = await response.json();
      
      if (response.ok) {
        setLicenses(data.licenses || data.data || []);
      }
    } catch (err) {
      console.error('Error fetching licenses:', err);
    }
  };

  const resetContractForm = () => {
    setContractFormData({
      contractType: 'হজ্ব',
      nusukAgencyId: '',
      requestNumber: '',
      hotelName: hotel?.hotelName || '',
      contractNumber: '',
      contractStart: '',
      contractEnd: '',
      hajjiCount: '',
      nusukPayment: '',
      cashPayment: '',
      otherBills: ''
    });
  };

  const handleGoBack = () => {
    router.push('/hajj-umrah/hajj/hotel-management');
  };

  const handleEdit = () => {
    router.push(`/hajj-umrah/hajj/hotel-management/${id}/edit`);
  };

  const handleCreateContract = () => {
    resetContractForm();
    setEditingContractId(null);
    setIsContractModalOpen(true);
  };

  const handleViewContract = (contract) => {
    setViewingContract(contract);
    setIsViewModalOpen(true);
  };

  const handleEditContract = (contract) => {
    const contractId = contract._id || contract.id;
    router.push(`/hajj-umrah/hajj/hotel-management/${id}/contracts/${contractId}/edit`);
  };

  const handleDeleteContract = async (contractId) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই চুক্তি মুছে ফেলা হলে এটি পুনরুদ্ধার করা যাবে না!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/hotel-contracts/${contractId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'হোটেল চুক্তি সফলভাবে মুছে ফেলা হয়েছে।',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          fetchContracts();
        } else {
          throw new Error(data.error || 'Failed to delete contract');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'হোটেল চুক্তি মুছে ফেলতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const payload = {
        hotelId: id,
        contractType: contractFormData.contractType,
        nusukAgencyId: contractFormData.nusukAgencyId,
        requestNumber: contractFormData.requestNumber,
        hotelName: contractFormData.hotelName,
        contractNumber: contractFormData.contractNumber,
        contractStart: contractFormData.contractStart,
        contractEnd: contractFormData.contractEnd,
        hajjiCount: contractFormData.hajjiCount,
        nusukPayment: contractFormData.nusukPayment || 0,
        cashPayment: contractFormData.cashPayment || 0,
        otherBills: contractFormData.otherBills || 0
      };

      const response = await fetch('/api/hotel-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to save contract');
      }

      Swal.fire({
        title: 'সফল!',
        text: 'হোটেল চুক্তি সফলভাবে সংরক্ষণ হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
      
      setIsContractModalOpen(false);
      resetContractForm();
      fetchContracts();
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'হোটেল চুক্তি সংরক্ষণ করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateContract = async (e) => {
    e.preventDefault();
    
    if (!editingContractId) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        contractType: contractFormData.contractType,
        nusukAgencyId: contractFormData.nusukAgencyId,
        requestNumber: contractFormData.requestNumber,
        hotelName: contractFormData.hotelName,
        contractNumber: contractFormData.contractNumber,
        contractStart: contractFormData.contractStart,
        contractEnd: contractFormData.contractEnd,
        hajjiCount: contractFormData.hajjiCount,
        nusukPayment: contractFormData.nusukPayment || 0,
        cashPayment: contractFormData.cashPayment || 0,
        otherBills: contractFormData.otherBills || 0
      };

      const response = await fetch(`/api/hotel-contracts/${editingContractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update contract');
      }

      Swal.fire({
        title: 'সফল!',
        text: 'হোটেল চুক্তি সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
      
      setIsEditModalOpen(false);
      setEditingContractId(null);
      resetContractForm();
      fetchContracts();
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'হোটেল চুক্তি আপডেট করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">হোটেল ডেটা লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !hotel) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">হোটেল পাওয়া যায়নি</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">আপনি যে হোটেল খুঁজছেন তা বিদ্যমান নেই।</p>
            <button
              onClick={handleGoBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              হোটেল তালিকায় ফিরে যান
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {hotel.hotelName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{hotel.area} • {hotel.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateContract}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  হোটেল চুক্তি তৈরি করুন
                </button>
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  সম্পাদনা করুন
                </button>
              </div>
            </div>
          </div>

          {/* Hotel Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              হোটেল তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">এলাকা</label>
                  <p className="text-gray-900 dark:text-white">{hotel.area || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">হোটেলের নাম</label>
                  <p className="text-gray-900 dark:text-white">{hotel.hotelName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">তাসরিহ নং</label>
                  <p className="text-gray-900 dark:text-white">{hotel.tasrihNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">তাসনিফ নং</label>
                  <p className="text-gray-900 dark:text-white">{hotel.tasnifNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ঠিকানা</label>
                  <p className="text-gray-900 dark:text-white">{hotel.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">হারাম এলাকা থেকে দুরত্ব</label>
                  <p className="text-gray-900 dark:text-white">{hotel.distanceFromHaram ? `${hotel.distanceFromHaram} মি` : 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">ইমেইল</p>
                    <p className="text-gray-900 dark:text-white">{hotel.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">মোবাইল নং</p>
                    <p className="text-gray-900 dark:text-white">{hotel.mobileNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Contracts Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                হোটেল চুক্তি
              </h3>
            </div>
            
            {/* Contracts List - Table Format */}
            {contractsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">চুক্তি লোড হচ্ছে...</p>
              </div>
            ) : contracts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">হজ্ব/উমরাহ</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">সাল</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">চুক্তি নাম্বার</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">চুক্তি শুরু</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">চুক্তি শেষ</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">বেড সংখ্যা</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">বেডপ্রতি বিল</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">মোট বিল</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">স্ট্যাটাস</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {contracts.map((contract) => {
                      const contractYear = contract.contractStart 
                        ? new Date(contract.contractStart).getFullYear() 
                        : (contract.contractEnd ? new Date(contract.contractEnd).getFullYear() : 'N/A');
                      
                      const totalBill = contract.totalBill || 
                        (parseFloat(contract.nusukPayment || 0) + 
                         parseFloat(contract.cashPayment || 0) + 
                         parseFloat(contract.otherBills || 0));
                      
                      const hajjiCount = parseFloat(contract.hajjiCount || 0);
                      const perPersonBill = hajjiCount > 0 ? (totalBill / hajjiCount) : 0;
                      
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const contractEndDate = contract.contractEnd ? new Date(contract.contractEnd) : null;
                      const isUsed = contractEndDate && contractEndDate < today;
                      const status = isUsed ? 'ব্যবহৃত' : 'অব্যবহৃত';
                      const statusColor = isUsed 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
                      
                      return (
                        <tr key={contract._id || contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contract.contractType === 'হজ্ব' 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                : contract.contractType === 'উমরাহ'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {contract.contractType || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {contractYear}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {contract.contractNumber || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {contract.contractStart ? new Date(contract.contractStart).toLocaleDateString('bn-BD') : 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {contract.contractEnd ? new Date(contract.contractEnd).toLocaleDateString('bn-BD') : 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {contract.hajjiCount || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            ৳{perPersonBill.toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                            ৳{totalBill.toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewContract(contract)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="ভিউ"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditContract(contract)}
                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                title="আপডেট"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteContract(contract._id || contract.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="ডিলিট"
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
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>কোন চুক্তি পাওয়া যায়নি</p>
                <p className="text-sm mt-2">নতুন চুক্তি তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hotel Contract Modal */}
      {isContractModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">হোটেল চুক্তি</h2>
                <button
                  onClick={() => {
                    setIsContractModalOpen(false);
                    resetContractForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleContractSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    হোটেল চুক্তি (হজ্ব / উমরাহ / অন্যান্য) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contractFormData.contractType}
                    onChange={(e) => setContractFormData({ ...contractFormData, contractType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="হজ্ব">হজ্ব</option>
                    <option value="উমরাহ">উমরাহ</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    নুসুক এজেন্সি <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contractFormData.nusukAgencyId}
                    onChange={(e) => setContractFormData({ ...contractFormData, nusukAgencyId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">নুসুক এজেন্সি নির্বাচন করুন</option>
                    {licenses.map((license) => (
                      <option key={license._id || license.id} value={license._id || license.id}>
                        {license.licenseNumber} - {license.licenseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    রিকোয়েস্ট নাম্বার <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contractFormData.requestNumber}
                    onChange={(e) => setContractFormData({ ...contractFormData, requestNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="রিকোয়েস্ট নাম্বার লিখুন"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    হোটেল নেম (নুসুক অনুযায়ী) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contractFormData.hotelName}
                    onChange={(e) => setContractFormData({ ...contractFormData, hotelName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="হোটেল নেম লিখুন"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    চুক্তি নাম্বার <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contractFormData.contractNumber}
                    onChange={(e) => setContractFormData({ ...contractFormData, contractNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="চুক্তি নাম্বার লিখুন"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      চুক্তি শুরু <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={contractFormData.contractStart}
                      onChange={(e) => setContractFormData({ ...contractFormData, contractStart: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      চুক্তি শেষ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={contractFormData.contractEnd}
                      onChange={(e) => setContractFormData({ ...contractFormData, contractEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    বেড সংখ্যা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={contractFormData.hajjiCount}
                    onChange={(e) => setContractFormData({ ...contractFormData, hajjiCount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="বেড সংখ্যা লিখুন"
                    min="1"
                    step="1"
                    required
                  />
                </div>

                {/* Payment Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">পেমেন্ট তথ্য</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        নুসুক পেমেন্ট
                      </label>
                      <input
                        type="number"
                        value={contractFormData.nusukPayment}
                        onChange={(e) => setContractFormData({ ...contractFormData, nusukPayment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="নুসুক পেমেন্ট লিখুন"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ক্যাশ পেমেন্ট
                      </label>
                      <input
                        type="number"
                        value={contractFormData.cashPayment}
                        onChange={(e) => setContractFormData({ ...contractFormData, cashPayment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="ক্যাশ পেমেন্ট লিখুন"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        অন্যান্য বিল
                      </label>
                      <input
                        type="number"
                        value={contractFormData.otherBills}
                        onChange={(e) => setContractFormData({ ...contractFormData, otherBills: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="অন্যান্য বিল লিখুন"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculated Values */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">গণনা</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">মোট বিল (নুসুক অনুযায়ী):</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {(
                          parseFloat(contractFormData.nusukPayment || 0) +
                          parseFloat(contractFormData.cashPayment || 0) +
                          parseFloat(contractFormData.otherBills || 0)
                        ).toLocaleString('bn-BD')} ৳
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">বেডপ্রতি:</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {contractFormData.hajjiCount && parseFloat(contractFormData.hajjiCount) > 0
                          ? (
                              (
                                (parseFloat(contractFormData.nusukPayment || 0) +
                                 parseFloat(contractFormData.cashPayment || 0) +
                                 parseFloat(contractFormData.otherBills || 0)) /
                                parseFloat(contractFormData.hajjiCount)
                              ).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            ) + ' ৳'
                          : '0.00 ৳'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsContractModalOpen(false);
                      resetContractForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hotel Contract Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">হোটেল চুক্তি সম্পাদনা করুন</h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingContractId(null);
                    resetContractForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateContract} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    হোটেল চুক্তি (হজ্ব / উমরাহ / অন্যান্য) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contractFormData.contractType}
                    onChange={(e) => setContractFormData({ ...contractFormData, contractType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="হজ্ব">হজ্ব</option>
                    <option value="উমরাহ">উমরাহ</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    নুসুক এজেন্সি <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contractFormData.nusukAgencyId}
                    onChange={(e) => setContractFormData({ ...contractFormData, nusukAgencyId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">নুসুক এজেন্সি নির্বাচন করুন</option>
                    {licenses.map((license) => (
                      <option key={license._id || license.id} value={license._id || license.id}>
                        {license.licenseNumber} - {license.licenseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    রিকোয়েস্ট নাম্বার <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contractFormData.requestNumber}
                    onChange={(e) => setContractFormData({ ...contractFormData, requestNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="রিকোয়েস্ট নাম্বার লিখুন"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    হোটেল নেম (নুসুক অনুযায়ী) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contractFormData.hotelName}
                    onChange={(e) => setContractFormData({ ...contractFormData, hotelName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="হোটেল নেম লিখুন"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    চুক্তি নাম্বার <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contractFormData.contractNumber}
                    onChange={(e) => setContractFormData({ ...contractFormData, contractNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="চুক্তি নাম্বার লিখুন"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      চুক্তি শুরু <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={contractFormData.contractStart}
                      onChange={(e) => setContractFormData({ ...contractFormData, contractStart: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      চুক্তি শেষ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={contractFormData.contractEnd}
                      onChange={(e) => setContractFormData({ ...contractFormData, contractEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    বেড সংখ্যা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={contractFormData.hajjiCount}
                    onChange={(e) => setContractFormData({ ...contractFormData, hajjiCount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="বেড সংখ্যা লিখুন"
                    min="1"
                    step="1"
                    required
                  />
                </div>

                {/* Payment Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">পেমেন্ট তথ্য</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        নুসুক পেমেন্ট
                      </label>
                      <input
                        type="number"
                        value={contractFormData.nusukPayment}
                        onChange={(e) => setContractFormData({ ...contractFormData, nusukPayment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="নুসুক পেমেন্ট লিখুন"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ক্যাশ পেমেন্ট
                      </label>
                      <input
                        type="number"
                        value={contractFormData.cashPayment}
                        onChange={(e) => setContractFormData({ ...contractFormData, cashPayment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="ক্যাশ পেমেন্ট লিখুন"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        অন্যান্য বিল
                      </label>
                      <input
                        type="number"
                        value={contractFormData.otherBills}
                        onChange={(e) => setContractFormData({ ...contractFormData, otherBills: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="অন্যান্য বিল লিখুন"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculated Values */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">গণনা</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">মোট বিল (নুসুক অনুযায়ী):</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {(
                          parseFloat(contractFormData.nusukPayment || 0) +
                          parseFloat(contractFormData.cashPayment || 0) +
                          parseFloat(contractFormData.otherBills || 0)
                        ).toLocaleString('bn-BD')} ৳
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">বেডপ্রতি:</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {contractFormData.hajjiCount && parseFloat(contractFormData.hajjiCount) > 0
                          ? (
                              (
                                (parseFloat(contractFormData.nusukPayment || 0) +
                                 parseFloat(contractFormData.cashPayment || 0) +
                                 parseFloat(contractFormData.otherBills || 0)) /
                                parseFloat(contractFormData.hajjiCount)
                              ).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            ) + ' ৳'
                          : '0.00 ৳'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingContractId(null);
                      resetContractForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Hotel Contract Modal */}
      {isViewModalOpen && viewingContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">হোটেল চুক্তি বিবরণ</h2>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingContract(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      হোটেল চুক্তি (হজ্ব / উমরাহ / অন্যান্য)
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {viewingContract.contractType || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      সাল
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {viewingContract.contractStart 
                        ? new Date(viewingContract.contractStart).getFullYear() 
                        : (viewingContract.contractEnd ? new Date(viewingContract.contractEnd).getFullYear() : 'N/A')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      চুক্তি নাম্বার
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {viewingContract.contractNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      রিকোয়েস্ট নাম্বার
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {viewingContract.requestNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      চুক্তি শুরু
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {viewingContract.contractStart ? new Date(viewingContract.contractStart).toLocaleDateString('bn-BD') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      চুক্তি শেষ
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {viewingContract.contractEnd ? new Date(viewingContract.contractEnd).toLocaleDateString('bn-BD') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      বেড সংখ্যা
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {viewingContract.hajjiCount || 0}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      হোটেল নাম
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {viewingContract.hotelName || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">পেমেন্ট তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        নুসুক পেমেন্ট
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        ৳{parseFloat(viewingContract.nusukPayment || 0).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ক্যাশ পেমেন্ট
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        ৳{parseFloat(viewingContract.cashPayment || 0).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        অন্যান্য বিল
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        ৳{parseFloat(viewingContract.otherBills || 0).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">গণনা</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">বেডপ্রতি বিল:</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {(() => {
                          const hajjiCount = parseFloat(viewingContract.hajjiCount || 0);
                          const totalBill = parseFloat(viewingContract.totalBill || 0) || 
                            (parseFloat(viewingContract.nusukPayment || 0) + 
                             parseFloat(viewingContract.cashPayment || 0) + 
                             parseFloat(viewingContract.otherBills || 0));
                          return hajjiCount > 0 
                            ? `৳${(totalBill / hajjiCount).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : '৳0.00';
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">মোট বিল:</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {(() => {
                          const totalBill = parseFloat(viewingContract.totalBill || 0) || 
                            (parseFloat(viewingContract.nusukPayment || 0) + 
                             parseFloat(viewingContract.cashPayment || 0) + 
                             parseFloat(viewingContract.otherBills || 0));
                          return `৳${totalBill.toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">স্ট্যাটাস:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const contractEndDate = viewingContract.contractEnd ? new Date(viewingContract.contractEnd) : null;
                          const isUsed = contractEndDate && contractEndDate < today;
                          return isUsed 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
                        })()
                      }`}>
                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const contractEndDate = viewingContract.contractEnd ? new Date(viewingContract.contractEnd) : null;
                          const isUsed = contractEndDate && contractEndDate < today;
                          return isUsed ? 'ব্যবহৃত' : 'অব্যবহৃত';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setViewingContract(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HotelDetails;
