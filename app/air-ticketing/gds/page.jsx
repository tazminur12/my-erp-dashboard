'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Globe,
  Server,
  Loader2,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  User,
  Percent,
  Database,
  Ticket,
  DollarSign,
  Building2,
  MoreVertical,
  Copy,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

// GDS Provider logos/colors
const GDS_PROVIDERS = {
  'Amadeus': { color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-900/20' },
  'Sabre': { color: 'bg-red-500', textColor: 'text-red-600', bgLight: 'bg-red-50 dark:bg-red-900/20' },
  'Galileo': { color: 'bg-orange-500', textColor: 'text-orange-600', bgLight: 'bg-orange-50 dark:bg-orange-900/20' },
  'Worldspan': { color: 'bg-purple-500', textColor: 'text-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-900/20' },
  'Travelport': { color: 'bg-green-500', textColor: 'text-green-600', bgLight: 'bg-green-50 dark:bg-green-900/20' },
  'Other': { color: 'bg-gray-500', textColor: 'text-gray-600', bgLight: 'bg-gray-50 dark:bg-gray-900/20' }
};

const GDSManagementList = () => {
  const router = useRouter();
  const [gdsRecords, setGdsRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [providerFilter, setProviderFilter] = useState('All');
  const [availableProviders, setAvailableProviders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const fetchGDSRecords = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (providerFilter && providerFilter !== 'All') params.append('provider', providerFilter);

      const response = await fetch(`/api/air-ticketing/gds?${params.toString()}`);
      const result = await response.json();

      if (response.ok) {
        setGdsRecords(result.data || []);
        setAvailableProviders(result.providers || []);
        setPagination(result.pagination || {});
      } else {
        throw new Error(result.error || 'Failed to fetch records');
      }
    } catch (error) {
      console.error('Error fetching GDS records:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ডাটা লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchGDSRecords();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, providerFilter]);

  const handleDelete = async (record) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `"${record.name}" মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/air-ticketing/gds/${record._id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'সফল!',
            text: 'GDS সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981'
          });
          fetchGDSRecords();
        } else {
          throw new Error(data.error || 'Delete failed');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'GDS মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444'
        });
      }
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Stats calculation
  const stats = useMemo(() => ({
    total: gdsRecords.length,
    active: gdsRecords.filter(r => r.status === 'Active').length,
    inactive: gdsRecords.filter(r => r.status === 'Inactive').length,
    avgCommission: gdsRecords.length > 0 
      ? (gdsRecords.reduce((sum, r) => sum + (r.commissionRate || 0), 0) / gdsRecords.length).toFixed(2)
      : 0
  }), [gdsRecords]);

  const getProviderStyle = (provider) => {
    return GDS_PROVIDERS[provider] || GDS_PROVIDERS['Other'];
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Server className="w-8 h-8 text-indigo-600" />
                GDS Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Global Distribution System - এয়ার টিকেটিং বুকিং সিস্টেম
              </p>
            </div>
            <Link
              href="/air-ticketing/gds/add"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              নতুন GDS যোগ করুন
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট GDS</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <Server className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">সক্রিয় GDS</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">নিষ্ক্রিয় GDS</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">গড় কমিশন</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.avgCommission}%</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Percent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="GDS নাম, কোড বা PCC খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="md:w-48">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="All">সব Provider</option>
                  <option value="Amadeus">Amadeus</option>
                  <option value="Sabre">Sabre</option>
                  <option value="Galileo">Galileo</option>
                  <option value="Worldspan">Worldspan</option>
                  <option value="Travelport">Travelport</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="All">সব স্ট্যাটাস</option>
                  <option value="Active">সক্রিয়</option>
                  <option value="Inactive">নিষ্ক্রিয়</option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchGDSRecords}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="রিফ্রেশ"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* GDS Cards Grid */}
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">ডাটা লোড হচ্ছে...</p>
            </div>
          </div>
        ) : gdsRecords.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div className="text-center">
              <Server className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">কোনো GDS পাওয়া যায়নি</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                নতুন GDS যোগ করতে উপরের বোতামে ক্লিক করুন
              </p>
              <Link
                href="/air-ticketing/gds/add"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                নতুন GDS যোগ করুন
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gdsRecords.map((gds) => {
              const providerStyle = getProviderStyle(gds.provider);
              return (
                <div
                  key={gds._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Card Header */}
                  <div className={`${providerStyle.bgLight} px-6 py-4 border-b border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${providerStyle.color} rounded-lg flex items-center justify-center`}>
                          <Server className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{gds.name}</h3>
                          <p className={`text-sm ${providerStyle.textColor} dark:text-gray-400`}>{gds.provider}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        gds.status === 'Active'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {gds.status === 'Active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-4 space-y-3">
                    {/* GDS Code & PCC */}
                    <div className="flex items-center justify-between">
                      {gds.gdsCode && (
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Code:</span>
                          <span className="font-mono font-medium text-gray-900 dark:text-white">{gds.gdsCode}</span>
                        </div>
                      )}
                      {gds.pccCode && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(gds.pccCode, gds._id)}
                            className="flex items-center gap-1 text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Copy PCC"
                          >
                            <span className="font-mono">{gds.pccCode}</span>
                            {copiedId === gds._id ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Commission */}
                    {gds.commissionRate > 0 && (
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">কমিশন:</span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">{gds.commissionRate}%</span>
                      </div>
                    )}

                    {/* Contact */}
                    {gds.contactPerson && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{gds.contactPerson}</span>
                      </div>
                    )}

                    {gds.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${gds.contactPhone}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          {gds.contactPhone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {gds.createdAt && new Date(gds.createdAt).toLocaleDateString('bn-BD')}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/air-ticketing/gds/${gds._id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="বিস্তারিত দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/air-ticketing/gds/${gds._id}/edit`)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="সম্পাদনা করুন"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(gds)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Info */}
        {!isLoading && gdsRecords.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            মোট {pagination.total || gdsRecords.length} টি GDS
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GDSManagementList;
