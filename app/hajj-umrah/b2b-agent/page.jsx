'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import Swal from 'sweetalert2';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Building2,
  Wallet,
  Receipt,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

const Agent = () => {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [deletingAgentId, setDeletingAgentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch agents
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/agents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError(error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch agents. Please try again.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const n = Number(amount) || 0;
    return `৳${n.toLocaleString('bn-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Client-side filtered list
  const filteredAgents = useMemo(() => {
    if (!searchTerm) return agents;
    const query = searchTerm.toLowerCase().trim();
    return agents.filter((a) => {
      const tradeName = (a.tradeName || '').toLowerCase();
      const tradeLocation = (a.tradeLocation || '').toLowerCase();
      const ownerName = (a.ownerName || '').toLowerCase();
      const contactNo = (a.contactNo || '').toLowerCase();
      const nid = (a.nid || '').toLowerCase();
      const passport = (a.passport || '').toLowerCase();
      return (
        tradeName.includes(query) ||
        tradeLocation.includes(query) ||
        ownerName.includes(query) ||
        contactNo.includes(query) ||
        nid.includes(query) ||
        passport.includes(query)
      );
    });
  }, [agents, searchTerm]);

  const handleAdd = () => {
    router.push('/hajj-umrah/b2b-agent/agent/add');
  };

  const handleEdit = (agent) => {
    const id = agent._id || agent.id;
    if (id) {
      router.push(`/hajj-umrah/b2b-agent/agent/${id}/edit`);
    }
  };

  const handleView = (agent) => {
    const id = agent._id || agent.id;
    if (id) {
      router.push(`/hajj-umrah/b2b-agent/agent/${id}`);
    } else {
      // Fallback to modal if no id present
      setSelectedAgent(agent);
      setShowModal(true);
    }
  };

  const handleDelete = async (agent) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${agent.tradeName} এর তথ্য মুছে ফেলতে চান? এই কাজটি অপরিবর্তনীয়।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      const agentId = agent._id || agent.id;
      if (agentId) {
        try {
          setDeletingAgentId(agentId);
          const response = await fetch(`/api/agents/${agentId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete agent');
          }

          Swal.fire({
            icon: 'success',
            title: 'সফল!',
            text: 'এজেন্ট সফলভাবে মুছে ফেলা হয়েছে।',
            confirmButtonColor: '#3b82f6',
          });

          // Refresh agents list
          fetchAgents();
        } catch (error) {
          console.error('Error deleting agent:', error);
          Swal.fire({
            icon: 'error',
            title: 'ত্রুটি',
            text: error.message || 'এজেন্ট মুছে ফেলতে ব্যর্থ হয়েছে।',
            confirmButtonColor: '#3b82f6',
          });
        } finally {
          setDeletingAgentId(null);
        }
      }
    }
  };

  // Calculate stats from agents data
  const totalAgents = agents.length;
  const totalPaid = useMemo(() => {
    return agents.reduce((sum, agent) => {
      return sum + (Number(agent.totalPaid) || Number(agent.totalDeposit) || 0);
    }, 0);
  }, [agents]);
  
  const totalBill = useMemo(() => {
    return agents.reduce((sum, agent) => {
      return sum + (Number(agent.totalBilled) || Number(agent.totalBill) || 0);
    }, 0);
  }, [agents]);
  
  const totalDue = useMemo(() => {
    return agents.reduce((sum, agent) => {
      return sum + (Number(agent.totalDue) || 0);
    }, 0);
  }, [agents]);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                হজ্জ ও উমরাহ এজেন্ট তালিকা
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                এজেন্টের ট্রেড তথ্য ব্যবস্থাপনা
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={handleAdd}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm sm:text-base">নতুন এজেন্ট যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট এজেন্ট</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : totalAgents.toLocaleString('bn-BD')}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট পরিশোধ</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট বিল</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalBill)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট বকেয়া</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalDue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="ট্রেড নাম, লোকেশন, মালিক, ফোন, NID, পাসপোর্ট দিয়ে সার্চ করুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto">
              <Filter className="w-4 h-4" />
              <span className="text-sm sm:text-base">ফিল্টার</span>
            </button>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ট্রেড নাম</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">মালিক</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">যোগাযোগ</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">মোট বিল</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">পরিশোধ</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">বকেয়া</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading agents...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        <button
                          onClick={fetchAgents}
                          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-12 h-12 text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No agents found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => {
                    const agentId = agent._id || agent.id;
                    const agentBill = Number(agent.totalBilled) || Number(agent.totalBill) || 0;
                    const agentPaid = Number(agent.totalPaid) || Number(agent.totalDeposit) || 0;
                    const agentDue = Number(agent.totalDue) || 0;
                    return (
                      <tr key={agentId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center">
                            <div className="shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              {agent.profilePicture ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={agent.profilePicture}
                                  alt={agent.tradeName}
                                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-purple-200 dark:border-purple-800"
                                />
                              ) : (
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                  <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">
                                    {(agent.tradeName || '?').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => handleView(agent)}
                                className="text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate hover:underline"
                                title="বিস্তারিত দেখুন"
                              >
                                {agent.tradeName}
                              </button>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.tradeLocation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{agent.ownerName}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{agent.contactNo}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                            {formatCurrency(agentBill)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(agentPaid)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <span className={`text-xs sm:text-sm font-medium ${agentDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {formatCurrency(agentDue)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => handleView(agent)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                              title="দেখুন"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(agent)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
                              title="সম্পাদনা করুন"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(agent)}
                              disabled={deletingAgentId === agentId}
                              className={`p-1 ${
                                deletingAgentId === agentId
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                              }`}
                              title={deletingAgentId === agentId ? 'মুছে ফেলা হচ্ছে...' : 'মুছুন'}
                            >
                              {deletingAgentId === agentId ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal */}
        {showModal && selectedAgent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAgent(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">এজেন্ট তথ্য</h2>

              <div className="space-y-4">
                {/* Profile Picture */}
                {selectedAgent.profilePicture && (
                  <div className="flex justify-center mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedAgent.profilePicture}
                      alt={selectedAgent.tradeName}
                      className="h-32 w-32 rounded-full object-cover border-4 border-purple-200 dark:border-purple-800"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ট্রেড নাম
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.tradeName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      লোকেশন
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.tradeLocation}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      মালিকের নাম
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.ownerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      যোগাযোগ
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.contactNo}</p>
                  </div>
                  {selectedAgent.dob && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        জন্ম তারিখ
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.dob}</p>
                    </div>
                  )}
                  {selectedAgent.nid && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        NID
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.nid}</p>
                    </div>
                  )}
                  {selectedAgent.passport && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Passport
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.passport}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Agent;
