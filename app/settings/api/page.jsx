'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import Swal from 'sweetalert2';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Code,
  X,
  Save,
  Loader2,
  Globe,
  Mail,
  Phone,
  Settings
} from 'lucide-react';

export default function ApiManagement() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  const initialFormState = {
    ipccName: '',
    iataCode: '',
    gds: 'SABRE BD',
    businessName: '',
    contact: '',
    email: '',
    commission: '0.00',
    isPercent: true,
    miscCharge: '0.00',
    configJson: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/settings/api-configs');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch API configs');
      }

      setConfigs(data.configs || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
      setError(error.message || 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const filteredConfigs = configs.filter((config) =>
    config.ipccName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.iataCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (config = null) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        ipccName: config.ipccName,
        iataCode: config.iataCode,
        gds: config.gds,
        businessName: config.businessName,
        contact: config.contact,
        email: config.email,
        commission: config.commission,
        isPercent: config.isPercent,
        miscCharge: config.miscCharge,
        configJson: config.configJson
      });
    } else {
      setEditingConfig(null);
      setFormData(initialFormState);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingConfig(null);
    setFormData(initialFormState);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePercentChange = (val) => {
    setFormData(prev => ({ ...prev, isPercent: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const url = editingConfig 
        ? `/api/settings/api-configs/${editingConfig.id}`
        : '/api/settings/api-configs';
      
      const method = editingConfig ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to save configuration');
      }

      await fetchConfigs();
      handleCloseModal();
      
      Swal.fire({
        icon: 'success',
        title: editingConfig ? 'Updated!' : 'Created!',
        text: editingConfig 
          ? 'API configuration updated successfully.' 
          : 'New API configuration created successfully.',
        confirmButtonColor: '#059669',
        timer: 2000
      });
    } catch (error) {
      console.error('Error saving config:', error);
      setError(error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/settings/api-configs/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete configuration');
        }

        await fetchConfigs();
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Configuration has been deleted.',
          confirmButtonColor: '#059669',
          timer: 2000
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonColor: '#dc2626',
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              API Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage API configurations and credentials
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Add New API</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by IPCC Name, IATA Code, or Business Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
            />
          </div>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading configurations...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      IPCC / IATA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Business Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      GDS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredConfigs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'No matching configurations found' : 'No API configurations found. Create one to get started.'}
                      </td>
                    </tr>
                  ) : (
                    filteredConfigs.map((config) => (
                      <tr key={config.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">{config.ipccName}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{config.iataCode}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-sm">
                            <span className="text-gray-900 dark:text-white font-medium">{config.businessName || 'N/A'}</span>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                              {config.email && <Mail className="h-3 w-3" />}
                              {config.contact && <Phone className="h-3 w-3" />}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            {config.gds}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {config.commission} {config.isPercent ? '%' : ''}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenModal(config)}
                              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 p-1 rounded transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(config.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8 relative flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-lg sticky top-0 z-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingConfig ? 'Edit API Configuration' : 'New API Configuration'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="apiForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Row 1 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        IPCC Name *
                      </label>
                      <input
                        type="text"
                        name="ipccName"
                        value={formData.ipccName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        required
                        placeholder="e.g. Sabre BD"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        IATA/Code *
                      </label>
                      <input
                        type="text"
                        name="iataCode"
                        value={formData.iataCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        required
                        placeholder="e.g. XQ9L"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        GDS/Airlines *
                      </label>
                      <select
                        name="gds"
                        value={formData.gds}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        required
                      >
                        <option value="SABRE BD">SABRE BD</option>
                        <option value="AMADEUS">AMADEUS</option>
                        <option value="GALILEO">GALILEO</option>
                        <option value="FLY DUBAI">FLY DUBAI</option>
                        <option value="AIR ARABIA">AIR ARABIA</option>
                        <option value="INDIGO">INDIGO</option>
                        <option value="SPICEJET">SPICEJET</option>
                        <option value="JAZEERA">JAZEERA</option>
                        <option value="SALAM AIR">SALAM AIR</option>
                        <option value="AIR ASIA">AIR ASIA</option>
                      </select>
                    </div>

                    {/* Row 2 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Contact
                      </label>
                      <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>

                    {/* Row 3 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Commission
                      </label>
                      <input
                        type="text"
                        name="commission"
                        value={formData.commission}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Is Percent?
                      </label>
                      <div className="flex items-center space-x-6 mt-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <div 
                            className={`w-4 h-4 border border-gray-400 rounded flex items-center justify-center ${formData.isPercent ? 'bg-gray-800 border-gray-800' : 'bg-white'}`}
                            onClick={() => handlePercentChange(true)}
                          >
                            {formData.isPercent && <div className="w-2 h-2 bg-white" />}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 uppercase">Yes</span>
                        </label>
                        
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <div 
                            className={`w-4 h-4 border border-gray-400 rounded flex items-center justify-center ${!formData.isPercent ? 'bg-gray-800 border-gray-800' : 'bg-white'}`}
                            onClick={() => handlePercentChange(false)}
                          >
                             {!formData.isPercent && <div className="w-2 h-2 bg-white" />}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 uppercase">No</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Misc Charge
                      </label>
                      <input
                        type="text"
                        name="miscCharge"
                        value={formData.miscCharge}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 4 - Config JSON */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Config JSON *
                    </label>
                    <textarea
                      name="configJson"
                      value={formData.configJson}
                      onChange={handleChange}
                      rows={12}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                      required
                      placeholder={`isLIVE=true
userId=...`}
                    />
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="apiForm"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{editingConfig ? 'Update' : 'Save'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
