'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, PlaneTakeoff, MapPin, Globe, Clock, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import DashboardLayout from '../../../component/DashboardLayout';
import Modal from '../../../component/Modal';

const AirportList = () => {
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [airports, setAirports] = useState([]);
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
  
  // Fetch airports
  useEffect(() => {
    const fetchAirports = async () => {
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
        
        const response = await fetch(`/api/airports?${params.toString()}`);
        const result = await response.json();

        if (response.ok) {
          setAirports(result.airports || result.data || []);
          setPagination(result.pagination || {});
        } else {
          throw new Error(result.error || 'Failed to fetch airports');
        }
      } catch (err) {
        console.error('Error fetching airports:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAirports();
  }, [page, debouncedSearchTerm]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [airportToDelete, setAirportToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    country: '',
    timezone: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      city: '',
      country: '',
      timezone: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        city: formData.city || null,
        country: formData.country || null,
        timezone: formData.timezone || null
      };
      
      const url = editingAirport 
        ? `/api/airports/${editingAirport._id || editingAirport.id}`
        : '/api/airports';
      
      const method = editingAirport ? 'PUT' : 'POST';
      
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
          title: 'Success!',
          text: editingAirport ? 'Airport updated successfully!' : 'New airport added successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10B981',
        });
        
        setIsModalOpen(false);
        setEditingAirport(null);
        resetForm();
        
        // Refetch airports
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '100',
        });
        if (debouncedSearchTerm) params.append('q', debouncedSearchTerm);
        
        const refetchResponse = await fetch(`/api/airports?${params.toString()}`);
        const refetchResult = await refetchResponse.json();
        if (refetchResponse.ok) {
          setAirports(refetchResult.airports || refetchResult.data || []);
          setPagination(refetchResult.pagination || {});
        }
      } else {
        throw new Error(result.error || 'Failed to save airport');
      }
    } catch (error) {
      console.error('Error submitting airport:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to save airport.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (airport) => {
    setEditingAirport(airport);
    setFormData({
      name: airport.name || '',
      code: airport.code || '',
      city: airport.city || '',
      country: airport.country || '',
      timezone: airport.timezone || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (airport) => {
    setAirportToDelete(airport);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const airportId = airportToDelete._id || airportToDelete.id;
      const response = await fetch(`/api/airports/${airportId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Airport deleted successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10B981',
        });
        
        setShowDeleteModal(false);
        setAirportToDelete(null);
        
        // Refetch airports
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '100',
        });
        if (debouncedSearchTerm) params.append('q', debouncedSearchTerm);
        
        const refetchResponse = await fetch(`/api/airports?${params.toString()}`);
        const refetchResult = await refetchResponse.json();
        if (refetchResponse.ok) {
          setAirports(refetchResult.airports || refetchResult.data || []);
          setPagination(refetchResult.pagination || {});
        }
      } else {
        throw new Error(result.error || 'Failed to delete airport');
      }
    } catch (error) {
      console.error('Error deleting airport:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to delete airport.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <PlaneTakeoff className="w-8 h-8 text-blue-600" />
                Airport Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage airport information and locations</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Airport
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Airports</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : pagination?.total || airports.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <PlaneTakeoff className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                  placeholder="Search airports by name, code, city, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Airports Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading airports...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">Error loading airports: {error.message}</p>
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    page: page.toString(),
                    limit: '100',
                  });
                  if (debouncedSearchTerm) params.append('q', debouncedSearchTerm);
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
                      Airport
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time Zone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {airports.map((airport) => (
                    <tr key={airport._id || airport.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <PlaneTakeoff className="w-5 h-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{airport.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {airport.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                          <div>
                            <div className="font-medium">{airport.city || 'N/A'}</div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">{airport.country}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                          {airport.timezone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(airport)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit Airport"
                            disabled={isSubmitting}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(airport)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Airport"
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!isLoading && !error && airports.length === 0 && (
            <div className="text-center py-12">
              <PlaneTakeoff className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No airports found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {debouncedSearchTerm
                  ? 'Try adjusting your search criteria.' 
                  : 'Get started by adding your first airport.'}
              </p>
              {!debouncedSearchTerm && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Add New Airport
                </button>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAirport(null);
            resetForm();
          }}
          title={editingAirport ? 'Edit Airport' : 'Add New Airport'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Airport Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Hazrat Shahjalal International Airport"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IATA Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength="3"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., DAC"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Dhaka"
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
                    placeholder="e.g., Bangladesh"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Zone
                </label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., UTC+06:00"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingAirport(null);
                  resetForm();
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingAirport ? 'Updating...' : 'Adding...'}
                  </span>
                ) : (
                  editingAirport ? 'Update Airport' : 'Add Airport'
                )}
              </button>
            </div>
          </form>
        </Modal>

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
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Airport</h3>
                    <p className="text-gray-600 dark:text-gray-400">This action cannot be undone.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete <strong>{airportToDelete?.name}</strong>? 
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
                      'Delete Airport'
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

export default AirportList;
