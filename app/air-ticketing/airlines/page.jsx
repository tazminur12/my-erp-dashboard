'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, Filter, Eye, Plane, Building, Phone, Mail, Globe, MapPin, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../config/cloudinary';
import Swal from 'sweetalert2';
import DashboardLayout from '../../component/DashboardLayout';

const AirlineList = () => {
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [airlines, setAirlines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fetch airlines with filters
  useEffect(() => {
    const fetchAirlines = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '100',
        });
        
        if (debouncedSearchTerm) {
          params.append('q', debouncedSearchTerm);
        }
        
        if (statusFilter !== 'All') {
          params.append('status', statusFilter);
        }

        const response = await fetch(`/api/airlines?${params.toString()}`);
        const result = await response.json();

        if (response.ok) {
          setAirlines(result.airlines || result.data || []);
          setPagination(result.pagination || {});
        } else {
          throw new Error(result.error || 'Failed to fetch airlines');
        }
      } catch (err) {
        console.error('Error fetching airlines:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAirlines();
  }, [page, debouncedSearchTerm, statusFilter]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [airlineToDelete, setAirlineToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country: '',
    headquarters: '',
    phone: '',
    email: '',
    website: '',
    established: '',
    status: 'Active',
    routes: '',
    fleet: '',
    logo: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      country: '',
      headquarters: '',
      phone: '',
      email: '',
      website: '',
      established: '',
      status: 'Active',
      routes: '',
      fleet: '',
      logo: ''
    });
    setLogoPreview(null);
  };

  // Cloudinary Upload Function
  const uploadToCloudinary = async (file) => {
    try {
      // Validate Cloudinary configuration first
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setLogoUploading(true);
      
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'airlines');
      
      // Upload to Cloudinary
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      const imageUrl = result.secure_url;
      
      // Update form data with image URL
      setFormData(prev => ({ ...prev, logo: imageUrl }));
      
      Swal.fire({
        title: 'সফল!',
        text: 'লোগো সফলভাবে আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
      
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'লোগো আপলোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        country: formData.country || null,
        headquarters: formData.headquarters || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        established: formData.established || null,
        status: formData.status || 'Active',
        routes: formData.routes ? parseInt(formData.routes) : 0,
        fleet: formData.fleet ? parseInt(formData.fleet) : 0,
        logo: formData.logo || null,
      };
      
      const url = editingAirline 
        ? `/api/airlines/${editingAirline._id || editingAirline.airlineId || editingAirline.id}`
        : '/api/airlines';
      
      const method = editingAirline ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: editingAirline ? 'এয়ারলাইন আপডেট হয়েছে!' : 'নতুন এয়ারলাইন যোগ করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        
        setIsModalOpen(false);
        setEditingAirline(null);
        resetForm();
        
        // Refetch airlines
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '100',
        });
        if (debouncedSearchTerm) params.append('q', debouncedSearchTerm);
        if (statusFilter !== 'All') params.append('status', statusFilter);
        
        const refetchResponse = await fetch(`/api/airlines?${params.toString()}`);
        const refetchResult = await refetchResponse.json();
        if (refetchResponse.ok) {
          setAirlines(refetchResult.airlines || refetchResult.data || []);
          setPagination(refetchResult.pagination || {});
        }
      } else {
        throw new Error(result.error || 'Failed to save airline');
      }
    } catch (error) {
      console.error('Error submitting airline:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'এয়ারলাইন সংরক্ষণ করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (airline) => {
    setEditingAirline(airline);
    setFormData({
      name: airline.name || '',
      code: airline.code || '',
      country: airline.country || '',
      headquarters: airline.headquarters || '',
      phone: airline.phone || '',
      email: airline.email || '',
      website: airline.website || '',
      established: airline.established || '',
      status: airline.status || 'Active',
      routes: airline.routes ? airline.routes.toString() : '',
      fleet: airline.fleet ? airline.fleet.toString() : '',
      logo: airline.logo || ''
    });
    setLogoPreview(airline.logo || null);
    setIsModalOpen(true);
  };

  const handleDelete = (airline) => {
    setAirlineToDelete(airline);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const airlineId = airlineToDelete._id || airlineToDelete.airlineId || airlineToDelete.id;
      const response = await fetch(`/api/airlines/${airlineId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'এয়ারলাইন মুছে ফেলা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        
        setShowDeleteModal(false);
        setAirlineToDelete(null);
        
        // Refetch airlines
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '100',
        });
        if (debouncedSearchTerm) params.append('q', debouncedSearchTerm);
        if (statusFilter !== 'All') params.append('status', statusFilter);
        
        const refetchResponse = await fetch(`/api/airlines?${params.toString()}`);
        const refetchResult = await refetchResponse.json();
        if (refetchResponse.ok) {
          setAirlines(refetchResult.airlines || refetchResult.data || []);
          setPagination(refetchResult.pagination || {});
        }
      } else {
        throw new Error(result.error || 'Failed to delete airline');
      }
    } catch (error) {
      console.error('Error deleting airline:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'এয়ারলাইন মুছতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Search is handled by the API, so we can use airlines directly
  const filteredAirlines = airlines;

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Plane className="w-8 h-8 text-blue-600" />
                Airline Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage airline information, routes, and fleet details</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Airline
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Airlines</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : pagination?.total || airlines.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Airlines</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {isLoading ? '...' : airlines.filter(a => a.status === 'Active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Building className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Routes</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {isLoading ? '...' : airlines.reduce((sum, airline) => sum + (airline.routes || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Fleet</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {isLoading ? '...' : airlines.reduce((sum, airline) => sum + (airline.fleet || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Plane className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search airlines by name, code, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                />
              </div>
            </div>
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Airlines Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading airlines...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">Error loading airlines: {error.message}</p>
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    page: page.toString(),
                    limit: '100',
                  });
                  if (debouncedSearchTerm) params.append('q', debouncedSearchTerm);
                  if (statusFilter !== 'All') params.append('status', statusFilter);
                  window.location.reload();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Airline
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fleet & Routes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAirlines.map((airline) => {
                    const airlineId = airline._id || airline.airlineId || airline.id;
                    return (
                      <tr key={airlineId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/air-ticketing/airlines/${airlineId}`} className="flex items-center group">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                                src={airline.logo || '/api/placeholder/100/60'}
                                alt={airline.name}
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/100/60';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{airline.name}</div>
                              {airline.established && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">Est. {airline.established}</div>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {airline.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                            <div>
                              <div className="font-medium">{airline.country || 'N/A'}</div>
                              {airline.headquarters && (
                                <div className="text-gray-500 dark:text-gray-400 text-xs">{airline.headquarters}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {airline.phone && (
                              <div className="flex items-center mb-1">
                                <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                                <span>{airline.phone}</span>
                              </div>
                            )}
                            {airline.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                                <span className="truncate max-w-32">{airline.email}</span>
                              </div>
                            )}
                            {!airline.phone && !airline.email && (
                              <span className="text-gray-400 dark:text-gray-500">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <Plane className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1" />
                                {airline.fleet || 0} Aircraft
                              </span>
                              <span className="flex items-center">
                                <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1" />
                                {airline.routes || 0} Routes
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            airline.status === 'Active' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {airline.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const airlineId = airline._id || airline.airlineId || airline.id;
                                router.push(`/air-ticketing/airlines/${airlineId}`);
                              }}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(airline)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit Airline"
                              disabled={isSubmitting}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(airline)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete Airline"
                              disabled={isDeleting}
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
          )}
          
          {!isLoading && !error && filteredAirlines.length === 0 && (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No airlines found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {debouncedSearchTerm || statusFilter !== 'All' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by adding your first airline.'}
              </p>
              {!debouncedSearchTerm && statusFilter === 'All' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Add New Airline
                </button>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingAirline ? 'Edit Airline' : 'Add New Airline'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {editingAirline ? 'Update airline information' : 'Enter airline details'}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Logo Upload Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Airline Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {logoPreview || formData.logo ? (
                      <div className="relative">
                        <img
                          src={logoPreview || formData.logo}
                          alt="Airline Logo Preview"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                        <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        {logoUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span>আপলোড হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            <span>{logoPreview || formData.logo ? 'লোগো পরিবর্তন করুন' : 'লোগো আপলোড করুন'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={logoUploading}
                        />
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        JPG, PNG বা GIF (সর্বোচ্চ 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Airline Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter airline name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Airline Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength="3"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., BG, EK"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter country"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Headquarters
                    </label>
                    <input
                      type="text"
                      value={formData.headquarters}
                      onChange={(e) => setFormData({...formData, headquarters: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter headquarters location"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter website URL"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Established Year
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.established}
                      onChange={(e) => setFormData({...formData, established: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter established year"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Routes
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.routes}
                      onChange={(e) => setFormData({...formData, routes: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter number of routes"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fleet Size
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.fleet}
                      onChange={(e) => setFormData({...formData, fleet: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter fleet size"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingAirline(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || logoUploading}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {editingAirline ? 'Updating...' : 'Adding...'}
                      </span>
                    ) : (
                      editingAirline ? 'Update Airline' : 'Add Airline'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full mr-4">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Airline</h3>
                    <p className="text-gray-600 dark:text-gray-400">This action cannot be undone.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete <strong>{airlineToDelete?.name}</strong>? 
                    All associated data will be permanently removed.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Airline'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AirlineList;
