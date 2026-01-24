'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Camera, 
  Heart, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Scale,
  Tag,
  MapPin,
  Phone,
  Mail,
  Download,
  Upload,
  Loader2,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../config/cloudinary';

const CattleManagement = () => {
  const router = useRouter();
  const [cattleList, setCattleList] = useState([]);
  const [filteredCattle, setFilteredCattle] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [newCattle, setNewCattle] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    purchaseDate: '',
    healthStatus: 'healthy',
    image: '',
    imagePublicId: '',
    gender: 'female',
    color: '',
    tagNumber: '',
    purchasePrice: '',
    vendor: '',
    notes: ''
  });

  const healthStatusOptions = [
    { value: 'healthy', label: 'সুস্থ', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' },
    { value: 'sick', label: 'অসুস্থ', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' },
    { value: 'under_treatment', label: 'চিকিৎসাধীন', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' }
  ];

  const breedOptions = [
    'হলস্টেইন ফ্রিজিয়ান',
    'জার্সি',
    'সাহিওয়াল',
    'রেড সিন্ধি',
    'গির',
    'থারপারকার',
    'ক্রস ব্রিড',
    'স্থানীয় জাত',
    'অন্যান্য'
  ];

  // Fetch cattle
  useEffect(() => {
    const fetchCattle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/miraj-industries/cattle');
        const data = await response.json();
        if (response.ok) {
          setCattleList(data.cattle || data.data || []);
        } else {
          throw new Error(data.error || 'Failed to fetch cattle');
        }
      } catch (error) {
        console.error('Error fetching cattle:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'গরুর তথ্য লোড করতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCattle();
  }, []);

  useEffect(() => {
    filterCattle();
  }, [cattleList, searchTerm, filterStatus]);

  const filterCattle = () => {
    let filtered = cattleList.filter(cattle => 
      (cattle.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cattle.id || cattle._id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cattle.breed || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cattle.tagNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(cattle => cattle.healthStatus === filterStatus);
    }

    setFilteredCattle(filtered);
  };

  const handleAddCattle = async () => {
    if (!newCattle.name.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'গরুর নাম আবশ্যক',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: newCattle.name.trim(),
        breed: newCattle.breed || '',
        age: Number(newCattle.age || 0),
        weight: Number(newCattle.weight || 0),
        purchaseDate: newCattle.purchaseDate || '',
        healthStatus: newCattle.healthStatus || 'healthy',
        image: newCattle.image || '',
        imagePublicId: newCattle.imagePublicId || '',
        gender: newCattle.gender || 'female',
        color: newCattle.color || '',
        tagNumber: newCattle.tagNumber || '',
        purchasePrice: Number(newCattle.purchasePrice || 0),
        vendor: newCattle.vendor || '',
        notes: newCattle.notes || ''
      };

      const response = await fetch('/api/miraj-industries/cattle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'গরু সফলভাবে যোগ করা হয়েছে',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowAddModal(false);
        resetForm();
        // Refresh cattle list
        const refreshResponse = await fetch('/api/miraj-industries/cattle');
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setCattleList(refreshData.cattle || refreshData.data || []);
        }
      } else {
        throw new Error(data.error || 'Failed to create cattle');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'গরু যোগ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCattle = async () => {
    if (!selectedCattle?.id) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        name: selectedCattle.name?.trim() || '',
        breed: selectedCattle.breed || '',
        age: Number(selectedCattle.age || 0),
        weight: Number(selectedCattle.weight || 0),
        purchaseDate: selectedCattle.purchaseDate || '',
        healthStatus: selectedCattle.healthStatus || 'healthy',
        image: selectedCattle.image || '',
        imagePublicId: selectedCattle.imagePublicId || '',
        gender: selectedCattle.gender || 'female',
        color: selectedCattle.color || '',
        tagNumber: selectedCattle.tagNumber || '',
        purchasePrice: Number(selectedCattle.purchasePrice || 0),
        vendor: selectedCattle.vendor || '',
        notes: selectedCattle.notes || ''
      };

      const response = await fetch(`/api/miraj-industries/cattle/${selectedCattle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'গরুর তথ্য আপডেট করা হয়েছে',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowEditModal(false);
        setSelectedCattle(null);
        // Refresh cattle list
        const refreshResponse = await fetch('/api/miraj-industries/cattle');
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setCattleList(refreshData.cattle || refreshData.data || []);
        }
      } else {
        throw new Error(data.error || 'Failed to update cattle');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'গরুর তথ্য আপডেট করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCattle = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই গরুটি মুছে ফেলা হবে',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/miraj-industries/cattle/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'গরু সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          // Refresh cattle list
          const refreshResponse = await fetch('/api/miraj-industries/cattle');
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok) {
            setCattleList(refreshData.cattle || refreshData.data || []);
          }
        } else {
          throw new Error(data.error || 'Failed to delete cattle');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'গরু মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const resetForm = () => {
    setNewCattle({
      name: '',
      breed: '',
      age: '',
      weight: '',
      purchaseDate: '',
      healthStatus: 'healthy',
      image: '',
      imagePublicId: '',
      gender: 'female',
      color: '',
      tagNumber: '',
      purchasePrice: '',
      vendor: '',
      notes: ''
    });
    setImagePreview(null);
    setUploadError('');
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadError('');
    
    if (!validateCloudinaryConfig()) {
      setUploadError('Cloudinary configuration missing.');
      return;
    }

    try {
      setUploadingImage(true);
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('ফাইল সাইজ ৫MB এর কম হতে হবে');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      formData.append('folder', 'cattle');

      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setNewCattle((prev) => ({
        ...prev,
        image: result.secure_url,
        imagePublicId: result.public_id
      }));
    } catch (err) {
      setUploadError(err.message || 'ছবি আপলোড করা যায়নি। আবার চেষ্টা করুন।');
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditImageUpload = async (file) => {
    if (!file) return;
    setUploadError('');
    
    if (!validateCloudinaryConfig()) {
      setUploadError('Cloudinary configuration missing.');
      return;
    }

    try {
      setUploadingImage(true);
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('ফাইল সাইজ ৫MB এর কম হতে হবে');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      formData.append('folder', 'cattle');

      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setSelectedCattle((prev) => ({
        ...prev,
        image: result.secure_url,
        imagePublicId: result.public_id
      }));
    } catch (err) {
      setUploadError(err.message || 'ছবি আপলোড করা যায়নি। আবার চেষ্টা করুন।');
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'sick':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'under_treatment':
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getHealthStatusClass = (status) => {
    const statusObj = healthStatusOptions.find(opt => opt.value === status);
    return statusObj ? statusObj.color : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">গবাদি পশু ব্যবস্থাপনা</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">গরুর তথ্য সংরক্ষণ ও ব্যবস্থাপনা</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            নতুন গরু যোগ করুন
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="গরুর নাম, ID, জাত বা ট্যাগ নম্বর দিয়ে খুঁজুন..."
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
                <option value="healthy">সুস্থ</option>
                <option value="sick">অসুস্থ</option>
                <option value="under_treatment">চিকিৎসাধীন</option>
              </select>
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2">
                <Download className="w-5 h-5" />
                রিপোর্ট
              </button>
            </div>
          </div>
        </div>

        {/* Cattle List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    গরুর তথ্য
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    জাত ও বয়স
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ওজন
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ক্রয় তারিখ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    স্বাস্থ্য অবস্থা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ক্রিয়া
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCattle.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      কোন গরু পাওয়া যায়নি
                    </td>
                  </tr>
                ) : filteredCattle.map((cattle) => {
                  const cattleId = cattle.id || cattle._id;
                  return (
                    <tr key={cattleId} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {cattle.image ? (
                              <img className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" src={cattle.image} alt={cattle.name} />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <Camera className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{cattle.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {cattle.tagNumber || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{cattle.breed || 'N/A'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{cattle.age || 0} বছর</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Scale className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{cattle.weight || 0} কেজি</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {cattle.purchaseDate ? new Date(cattle.purchaseDate).toLocaleDateString('bn-BD') : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getHealthStatusIcon(cattle.healthStatus)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusClass(cattle.healthStatus)}`}>
                            {healthStatusOptions.find(opt => opt.value === cattle.healthStatus)?.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/miraj-industries/cattle/${cattleId}`)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCattle({ ...cattle });
                              setImagePreview(cattle.image);
                              setShowEditModal(true);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCattle(cattleId)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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

        {/* Add Cattle Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">নতুন গরু যোগ করুন</h2>
                <button 
                  onClick={() => { setShowAddModal(false); resetForm(); }} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddCattle(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গরুর নাম <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={newCattle.name}
                      onChange={(e) => setNewCattle({...newCattle, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="গরুর নাম লিখুন"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">জাত</label>
                    <input
                      type="text"
                      value={newCattle.breed}
                      onChange={(e) => setNewCattle({ ...newCattle, breed: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="গরুর জাত লিখুন"
                      list="breed-suggestions"
                    />
                    <datalist id="breed-suggestions">
                      {breedOptions.map(breed => (
                        <option key={breed} value={breed} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বয়স (বছর)</label>
                    <input
                      type="number"
                      value={newCattle.age}
                      onChange={(e) => setNewCattle({...newCattle, age: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="বয়স লিখুন"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ওজন (কেজি)</label>
                    <input
                      type="number"
                      value={newCattle.weight}
                      onChange={(e) => setNewCattle({...newCattle, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ওজন লিখুন"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ক্রয় তারিখ</label>
                    <input
                      type="date"
                      value={newCattle.purchaseDate}
                      onChange={(e) => setNewCattle({...newCattle, purchaseDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">স্বাস্থ্য অবস্থা</label>
                    <select
                      value={newCattle.healthStatus}
                      onChange={(e) => setNewCattle({...newCattle, healthStatus: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {healthStatusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">লিঙ্গ</label>
                    <select
                      value={newCattle.gender}
                      onChange={(e) => setNewCattle({...newCattle, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="female">গাভী</option>
                      <option value="male">ষাঁড়</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">রং</label>
                    <input
                      type="text"
                      value={newCattle.color}
                      onChange={(e) => setNewCattle({...newCattle, color: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="গরুর রং"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ট্যাগ নম্বর</label>
                    <input
                      type="text"
                      value={newCattle.tagNumber}
                      onChange={(e) => setNewCattle({...newCattle, tagNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ট্যাগ নম্বর (স্বয়ংক্রিয় তৈরি হবে)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ক্রয় মূল্য (৳)</label>
                    <input
                      type="number"
                      value={newCattle.purchasePrice}
                      onChange={(e) => setNewCattle({...newCattle, purchasePrice: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ক্রয় মূল্য"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বিক্রেতা</label>
                    <input
                      type="text"
                      value={newCattle.vendor}
                      onChange={(e) => setNewCattle({...newCattle, vendor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="বিক্রেতার নাম"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ছবি আপলোড</label>
                  <div className="flex items-center gap-4">
                    {imagePreview || newCattle.image ? (
                      <div className="relative">
                        <img src={imagePreview || newCattle.image} alt="Preview" className="h-24 w-24 rounded object-cover border-2 border-gray-200 dark:border-gray-700" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setNewCattle(prev => ({ ...prev, image: '', imagePublicId: '' }));
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        {uploadingImage ? (
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files && e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={uploadingImage}
                      />
                      {uploadingImage && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ছবি আপলোড হচ্ছে...</p>
                      )}
                      {uploadError && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{uploadError}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={newCattle.notes}
                    onChange={(e) => setNewCattle({...newCattle, notes: e.target.value})}
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
                    disabled={isSubmitting || uploadingImage}
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

        {/* Edit Cattle Modal */}
        {showEditModal && selectedCattle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">গরুর তথ্য সম্পাদনা করুন</h2>
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedCattle(null); setImagePreview(null); }} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleEditCattle(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গরুর নাম <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={selectedCattle.name || ''}
                      onChange={(e) => setSelectedCattle({...selectedCattle, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="গরুর নাম লিখুন"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">জাত</label>
                    <input
                      type="text"
                      value={selectedCattle.breed || ''}
                      onChange={(e) => setSelectedCattle({ ...selectedCattle, breed: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="গরুর জাত লিখুন"
                      list="breed-suggestions-edit"
                    />
                    <datalist id="breed-suggestions-edit">
                      {breedOptions.map(breed => (
                        <option key={breed} value={breed} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বয়স (বছর)</label>
                    <input
                      type="number"
                      value={selectedCattle.age || ''}
                      onChange={(e) => setSelectedCattle({...selectedCattle, age: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="বয়স লিখুন"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ওজন (কেজি)</label>
                    <input
                      type="number"
                      value={selectedCattle.weight || ''}
                      onChange={(e) => setSelectedCattle({...selectedCattle, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ওজন লিখুন"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ক্রয় তারিখ</label>
                    <input
                      type="date"
                      value={selectedCattle.purchaseDate || ''}
                      onChange={(e) => setSelectedCattle({...selectedCattle, purchaseDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">স্বাস্থ্য অবস্থা</label>
                    <select
                      value={selectedCattle.healthStatus || 'healthy'}
                      onChange={(e) => setSelectedCattle({...selectedCattle, healthStatus: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {healthStatusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">লিঙ্গ</label>
                    <select
                      value={selectedCattle.gender || 'female'}
                      onChange={(e) => setSelectedCattle({...selectedCattle, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="female">গাভী</option>
                      <option value="male">ষাঁড়</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">রং</label>
                    <input
                      type="text"
                      value={selectedCattle.color || ''}
                      onChange={(e) => setSelectedCattle({...selectedCattle, color: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="গরুর রং"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ট্যাগ নম্বর</label>
                    <input
                      type="text"
                      value={selectedCattle.tagNumber || ''}
                      onChange={(e) => setSelectedCattle({...selectedCattle, tagNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ট্যাগ নম্বর"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ক্রয় মূল্য (৳)</label>
                    <input
                      type="number"
                      value={selectedCattle.purchasePrice || ''}
                      onChange={(e) => setSelectedCattle({...selectedCattle, purchasePrice: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ক্রয় মূল্য"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বিক্রেতা</label>
                    <input
                      type="text"
                      value={selectedCattle.vendor || ''}
                      onChange={(e) => setSelectedCattle({...selectedCattle, vendor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="বিক্রেতার নাম"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ছবি আপলোড</label>
                  <div className="flex items-center gap-4">
                    {imagePreview || selectedCattle.image ? (
                      <div className="relative">
                        <img src={imagePreview || selectedCattle.image} alt="Preview" className="h-24 w-24 rounded object-cover border-2 border-gray-200 dark:border-gray-700" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedCattle(prev => ({ ...prev, image: '', imagePublicId: '' }));
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        {uploadingImage ? (
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleEditImageUpload(e.target.files && e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={uploadingImage}
                      />
                      {uploadingImage && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ছবি আপলোড হচ্ছে...</p>
                      )}
                      {uploadError && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{uploadError}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={selectedCattle.notes || ''}
                    onChange={(e) => setSelectedCattle({...selectedCattle, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য বা নোট"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setSelectedCattle(null); setImagePreview(null); }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        আপডেট হচ্ছে...
                      </>
                    ) : (
                      'আপডেট করুন'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Cattle Modal */}
        {showViewModal && selectedCattle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">গরুর বিস্তারিত তথ্য</h2>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {selectedCattle.image ? (
                      <img className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" src={selectedCattle.image} alt={selectedCattle.name} />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCattle.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">ID: {selectedCattle.id || selectedCattle._id} | ট্যাগ: {selectedCattle.tagNumber || 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {getHealthStatusIcon(selectedCattle.healthStatus)}
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getHealthStatusClass(selectedCattle.healthStatus)}`}>
                        {healthStatusOptions.find(opt => opt.value === selectedCattle.healthStatus)?.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">মৌলিক তথ্য</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">জাত:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedCattle.breed || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">বয়স:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedCattle.age || 0} বছর</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">ওজন:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedCattle.weight || 0} কেজি</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">লিঙ্গ:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedCattle.gender === 'female' ? 'মহিষা' : 'ষাঁড়'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">রং:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedCattle.color || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">ক্রয় তথ্য</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">ক্রয় তারিখ:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedCattle.purchaseDate ? new Date(selectedCattle.purchaseDate).toLocaleDateString('bn-BD') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">ক্রয় মূল্য:</span>
                        <span className="font-medium text-gray-900 dark:text-white">৳{Number(selectedCattle.purchasePrice || 0).toLocaleString('bn-BD')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">বিক্রেতা:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedCattle.vendor || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedCattle.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">নোট</h4>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedCattle.notes}</p>
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

export default CattleManagement;
