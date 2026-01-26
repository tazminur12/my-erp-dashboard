'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import { Users, Search, Filter, Loader2, FileText, UserPlus, Building, Building2, User } from 'lucide-react';
import Link from 'next/link';

const ReferListPage = () => {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [summary, setSummary] = useState({
    totalReferrals: 0,
    officeReferrals: 0,
    agentReferrals: 0,
    topReferrer: 'N/A'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'office', 'agent'

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      // Fetch all umrahs to analyze referrals
      // In a real app, this should be a dedicated API endpoint with aggregation
      const response = await fetch('/api/hajj-umrah/umrahs?limit=1000');
      const data = await response.json();
      
      if (response.ok) {
        const umrahs = data.umrahs || [];
        
        // Process data for referrals
        // We are looking for umrahs that have reference information
        const referralList = umrahs.filter(u => u.reference_haji || u.source_type || u.agent_id || u.branch_id);
        
        // Calculate summary
        const officeCount = referralList.filter(r => r.source_type === 'office' || (!r.source_type && !r.agent_id)).length;
        const agentCount = referralList.filter(r => r.source_type === 'agent' || r.agent_id).length;
        
        // Find top referrer (by reference_haji name)
        const referrerCounts = {};
        referralList.forEach(r => {
          if (r.reference_haji) {
            referrerCounts[r.reference_haji] = (referrerCounts[r.reference_haji] || 0) + 1;
          }
        });
        
        let topReferrer = 'N/A';
        let maxCount = 0;
        Object.entries(referrerCounts).forEach(([name, count]) => {
          if (count > maxCount) {
            maxCount = count;
            topReferrer = name;
          }
        });

        setSummary({
          totalReferrals: referralList.length,
          officeReferrals: officeCount,
          agentReferrals: agentCount,
          topReferrer: maxCount > 0 ? `${topReferrer} (${maxCount})` : 'N/A'
        });

        setReferrals(referralList);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.filter(item => {
    const matchesSearch = (
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.reference_haji || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.customer_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'office') return matchesSearch && (item.source_type === 'office' || (!item.source_type && !item.agent_id));
    if (filterType === 'agent') return matchesSearch && (item.source_type === 'agent' || item.agent_id);
    
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              রেফারেন্স তালিকা
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              হজ ও উমরাহ রেফারেন্স এবং উৎসের তালিকা
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">মোট রেফারেন্স</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {summary.totalReferrals}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">অফিস রেফারেন্স</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {summary.officeReferrals}
                </h3>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">এজেন্ট রেফারেন্স</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {summary.agentReferrals}
                </h3>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">শীর্ষ রেফারার</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[150px]" title={summary.topReferrer}>
                  {summary.topReferrer}
                </h3>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <UserPlus className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                সব
              </button>
              <button
                onClick={() => setFilterType('office')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'office'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                অফিস
              </button>
              <button
                onClick={() => setFilterType('agent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'agent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                এজেন্ট
              </button>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">হাজী</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">উৎস</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">বিস্তারিত</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">রেফারেন্স (হাজী)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">লোডিং...</p>
                    </td>
                  </tr>
                ) : filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      কোন তথ্য পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.customer_id || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.source_type === 'agent' || item.agent_id
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {item.source_type === 'agent' || item.agent_id ? 'এজেন্ট' : 'অফিস'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {item.source_type === 'agent' || item.agent_id ? (
                            <span>এজেন্ট ID: {item.agent_id}</span>
                          ) : (
                            <div className="flex flex-col">
                              <span>ব্রাঞ্চ: {item.branch_id || 'N/A'}</span>
                              <span className="text-xs text-gray-500">এমপ্লয়ী: {item.employer_id || item.employerId || 'N/A'}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {item.reference_haji || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/hajj-umrah/umrah/haji/${item.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          বিস্তারিত
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReferListPage;