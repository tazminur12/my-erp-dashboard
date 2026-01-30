'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import Modal from '../../../component/Modal';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  ChevronDown, 
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  FileText,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import Swal from 'sweetalert2';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../../config/cloudinary';

const BankList = () => {
  const [banks, setBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedBankId, setExpandedBankId] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  // Form states
  const [bankForm, setBankForm] = useState({
    name: '',
    bank_code: '',
    slug: '',
    logo: '', // Added logo field
    districts: []
  });

  const [branchForm, setBranchForm] = useState({
    district_name: '',
    routing_number: '',
    branch_name: '',
    branch_slug: '',
    branch_code: '',
    swift_code: '',
    address: '',
    telephone: '',
    email: '',
    fax: ''
  });

  // Handle adding new district field to bank form
  const addDistrictField = () => {
    setBankForm({
      ...bankForm,
      districts: [...(bankForm.districts || []), { district_name: '', branches: [] }]
    });
  };

  // Handle removing district field
  const removeDistrictField = (index) => {
    const newDistricts = [...(bankForm.districts || [])];
    newDistricts.splice(index, 1);
    setBankForm({ ...bankForm, districts: newDistricts });
  };

  // Handle district name change
  const handleDistrictChange = (index, value) => {
    const newDistricts = [...(bankForm.districts || [])];
    newDistricts[index].district_name = value.toUpperCase();
    setBankForm({ ...bankForm, districts: newDistricts });
  };

  // Handle adding branch to a district in bank form
  const addBranchToDistrict = (districtIndex) => {
    const newDistricts = [...(bankForm.districts || [])];
    newDistricts[districtIndex].branches.push({
      routing_number: '',
      branch_name: '',
      branch_slug: '',
      branch_code: '',
      swift_code: '',
      address: '',
      telephone: '',
      email: '',
      fax: ''
    });
    setBankForm({ ...bankForm, districts: newDistricts });
  };

  // Handle removing branch from district
  const removeBranchFromDistrict = (districtIndex, branchIndex) => {
    const newDistricts = [...(bankForm.districts || [])];
    newDistricts[districtIndex].branches.splice(branchIndex, 1);
    setBankForm({ ...bankForm, districts: newDistricts });
  };

  // Handle branch field change in bank form
  const handleBranchFieldChange = (districtIndex, branchIndex, field, value) => {
    const newDistricts = [...(bankForm.districts || [])];
    newDistricts[districtIndex].branches[branchIndex][field] = value;
    if (field === 'branch_name') {
       newDistricts[districtIndex].branches[branchIndex]['branch_slug'] = value.toUpperCase().replace(/\s+/g, '_');
    }
    setBankForm({ ...bankForm, districts: newDistricts });
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
      cloudinaryFormData.append('folder', 'bank-logos');
      
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
      
      // Set uploaded image data - Just the URL
      setBankForm(prev => ({ ...prev, logo: result.secure_url }));
      
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        title: 'Upload Failed',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
      setLogoPreview(null);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  const removeLogo = () => {
    setBankForm(prev => ({ ...prev, logo: '' }));
    setLogoPreview(null);
  };

  // Fetch Banks
  const fetchBanks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (searchTerm) params.append('q', searchTerm);

      const response = await fetch(`/api/settings/general/banks?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setBanks(data.banks || []);
        setPagination(data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBanks();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, page]);

  // Bank Handlers
  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingBank 
        ? `/api/settings/general/banks/${editingBank._id}`
        : '/api/settings/general/banks';
      
      const method = editingBank ? 'PUT' : 'POST';
      
      // Auto-generate slug if not provided
      const payload = {
        ...bankForm,
        slug: bankForm.slug || bankForm.name.trim().toUpperCase().replace(/\s+/g, '_')
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Swal.fire('Success', `Bank ${editingBank ? 'updated' : 'added'} successfully`, 'success');
        setIsModalOpen(false);
        setEditingBank(null);
        setBankForm({ name: '', bank_code: '', slug: '', logo: '', districts: [] }); // Reset logo
        fetchBanks();
      } else {
        throw new Error('Failed to save bank');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBank = async (bank) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/settings/general/banks/${bank._id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          Swal.fire('Deleted!', 'Bank has been deleted.', 'success');
          fetchBanks();
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete bank', 'error');
      }
    }
  };

  // Branch Handlers
  const handleAddBranch = (bank) => {
    setSelectedBankId(bank._id);
    setEditingBranch(null);
    setBranchForm({
      district_name: '',
      routing_number: '',
      branch_name: '',
      branch_slug: '',
      branch_code: '',
      swift_code: '',
      address: '',
      telephone: '',
      email: '',
      fax: ''
    });
    setIsBranchModalOpen(true);
  };

  const handleEditBranch = (bank, districtIndex, branchIndex) => {
    setSelectedBankId(bank._id);
    setSelectedDistrictIndex(districtIndex);
    const branch = bank.districts[districtIndex].branches[branchIndex];
    const district = bank.districts[districtIndex];
    
    setEditingBranch({ ...branch, district_name: district.district_name, original_branch_code: branch.branch_code });
    setBranchForm({
      district_name: district.district_name,
      ...branch
    });
    setIsBranchModalOpen(true);
  };

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = `/api/settings/general/banks/${selectedBankId}/branches`;
      const method = editingBranch ? 'PUT' : 'POST';
      
      const payload = {
        ...branchForm,
        branch_slug: branchForm.branch_slug || branchForm.branch_name.toUpperCase().replace(/\s+/g, '_'),
        original_branch_code: editingBranch?.original_branch_code // For identifying branch to update
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Swal.fire('Success', `Branch ${editingBranch ? 'updated' : 'added'} successfully`, 'success');
        setIsBranchModalOpen(false);
        fetchBanks();
      } else {
        throw new Error('Failed to save branch');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              Bank Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage banks, districts and branches</p>
          </div>
          <button
            onClick={() => {
              setEditingBank(null);
              setBankForm({ name: '', bank_code: '', slug: '', logo: '', districts: [] }); // Reset logo
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Bank
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Bank Name, Branch, or Swift Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Bank List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-gray-500">Loading banks...</p>
            </div>
          ) : banks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No banks found</p>
            </div>
          ) : (
            banks.map((bank) => (
              <div key={bank._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
                {/* Bank Header */}
                <div className="p-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                  <div 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => setExpandedBankId(expandedBankId === bank._id ? null : bank._id)}
                  >
                    {expandedBankId === bank._id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{bank.name}</h3>
                      <div className="flex gap-3 text-sm text-gray-500">
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-medium">
                          Code: {bank.bank_code}
                        </span>
                        <span>{bank.districts?.length || 0} Districts</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddBranch(bank)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg tooltip"
                      title="Add Branch"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingBank(bank);
                        setBankForm({
                          name: bank.name,
                          bank_code: bank.bank_code,
                          slug: bank.slug,
                          logo: bank.logo || '', // Load existing logo
                          districts: bank.districts || []
                        });
                        setLogoPreview(bank.logo || null);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit Bank"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBank(bank)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Bank"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Branches List (Expandable) */}
                {expandedBankId === bank._id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                    {bank.districts?.length > 0 ? (
                      <div className="space-y-6">
                        {bank.districts.map((district, dIdx) => (
                          <div key={dIdx} className="ml-4">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {district.district_name} District
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {district.branches?.map((branch, bIdx) => (
                                <div key={bIdx} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group relative">
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button 
                                      onClick={() => handleEditBranch(bank, dIdx, bIdx)}
                                      className="p-1 hover:bg-gray-100 rounded text-blue-600"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  </div>
                                  
                                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{branch.branch_name}</h5>
                                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex justify-between">
                                      <span>Routing:</span>
                                      <span className="font-mono font-medium">{branch.routing_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Swift:</span>
                                      <span className="font-mono font-medium">{branch.swift_code}</span>
                                    </div>
                                    {branch.telephone && (
                                      <div className="flex items-center gap-2 pt-1">
                                        <Phone className="w-3 h-3" /> {branch.telephone}
                                      </div>
                                    )}
                                    {branch.email && (
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> {branch.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 text-sm py-4">No branches added yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bank Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBank ? 'Edit Bank' : 'Add New Bank'}
        >
          <form onSubmit={handleBankSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name *</label>
              <input
                type="text"
                required
                value={bankForm.name}
                onChange={(e) => setBankForm({...bankForm, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g. AB BANK LIMITED"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Code *</label>
                <input
                  type="text"
                  required
                  value={bankForm.bank_code}
                  onChange={(e) => setBankForm({...bankForm, bank_code: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g. 020"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (Optional)</label>
                <input
                  type="text"
                  value={bankForm.slug}
                  onChange={(e) => setBankForm({...bankForm, slug: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Auto-generated if empty"
                />
              </div>
              
              {/* Logo Upload */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bank Logo</label>
                
                {!bankForm.logo && !logoPreview ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {logoUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                          <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                              <span>Upload a file</span>
                              <input 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-2 inline-block">
                    <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white">
                      <img 
                        src={logoPreview || bankForm.logo} 
                        alt="Bank Logo" 
                        className="h-full w-full object-contain p-2" 
                      />
                      {logoUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Districts & Branches</h3>
                <button
                  type="button"
                  onClick={addDistrictField}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add District
                </button>
              </div>

              <div className="space-y-6">
                {bankForm.districts?.map((district, dIdx) => (
                  <div key={dIdx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">District Name</label>
                        <input
                          type="text"
                          value={district.district_name}
                          onChange={(e) => handleDistrictChange(dIdx, e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="e.g. DHAKA"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDistrictField(dIdx)}
                        className="mt-5 text-red-500 hover:text-red-700 p-2"
                        title="Remove District"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Branches</h4>
                        <button
                          type="button"
                          onClick={() => addBranchToDistrict(dIdx)}
                          className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Branch
                        </button>
                      </div>

                      <div className="space-y-3">
                        {district.branches?.map((branch, bIdx) => (
                          <div key={bIdx} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-800 relative group">
                            <button
                              type="button"
                              onClick={() => removeBranchFromDistrict(dIdx, bIdx)}
                              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            
                            <input
                              type="text"
                              placeholder="Branch Name"
                              value={branch.branch_name}
                              onChange={(e) => handleBranchFieldChange(dIdx, bIdx, 'branch_name', e.target.value)}
                              className="px-2 py-1.5 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Routing Number"
                              value={branch.routing_number}
                              onChange={(e) => handleBranchFieldChange(dIdx, bIdx, 'routing_number', e.target.value)}
                              className="px-2 py-1.5 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Swift Code"
                              value={branch.swift_code}
                              onChange={(e) => handleBranchFieldChange(dIdx, bIdx, 'swift_code', e.target.value)}
                              className="px-2 py-1.5 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Branch Code"
                              value={branch.branch_code}
                              onChange={(e) => handleBranchFieldChange(dIdx, bIdx, 'branch_code', e.target.value)}
                              className="px-2 py-1.5 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Email"
                              value={branch.email}
                              onChange={(e) => handleBranchFieldChange(dIdx, bIdx, 'email', e.target.value)}
                              className="px-2 py-1.5 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Telephone"
                              value={branch.telephone}
                              onChange={(e) => handleBranchFieldChange(dIdx, bIdx, 'telephone', e.target.value)}
                              className="px-2 py-1.5 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <textarea
                              placeholder="Address"
                              value={branch.address}
                              onChange={(e) => handleBranchFieldChange(dIdx, bIdx, 'address', e.target.value)}
                              className="col-span-2 px-2 py-1.5 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                              rows="2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Bank'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Branch Modal */}
        <Modal
          isOpen={isBranchModalOpen}
          onClose={() => setIsBranchModalOpen(false)}
          title={editingBranch ? 'Edit Branch' : 'Add New Branch'}
          size="lg"
        >
          <form onSubmit={handleBranchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District Name *</label>
                <input
                  type="text"
                  required
                  value={branchForm.district_name}
                  onChange={(e) => setBranchForm({...branchForm, district_name: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g. DHAKA"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={branchForm.branch_name}
                  onChange={(e) => setBranchForm({...branchForm, branch_name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g. PRINCIPAL BRANCH"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Routing Number *</label>
                <input
                  type="text"
                  required
                  value={branchForm.routing_number}
                  onChange={(e) => setBranchForm({...branchForm, routing_number: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Swift Code</label>
                <input
                  type="text"
                  value={branchForm.swift_code}
                  onChange={(e) => setBranchForm({...branchForm, swift_code: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch Code</label>
                <input
                  type="text"
                  value={branchForm.branch_code}
                  onChange={(e) => setBranchForm({...branchForm, branch_code: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telephone</label>
                <input
                  type="text"
                  value={branchForm.telephone}
                  onChange={(e) => setBranchForm({...branchForm, telephone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={branchForm.email}
                  onChange={(e) => setBranchForm({...branchForm, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({...branchForm, address: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Branch'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default BankList;
