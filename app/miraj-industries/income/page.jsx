'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Loader2, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  Filter
} from 'lucide-react';
import Swal from 'sweetalert2';

const IncomeList = () => {
  const router = useRouter();
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchIncomes = async () => {
    try {
      setIsLoading(true);
      let url = '/api/miraj-industries/farm-incomes?';
      if (query) url += `search=${query}&`;
      if (filterDate) url += `date=${filterDate}&`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setIncomes(data.incomes || []);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchIncomes();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, filterDate]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'নিশ্চিত করুন',
      text: 'এই আয়টি মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/miraj-industries/farm-incomes/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'মুছে ফেলা হয়েছে',
            showConfirmButton: false,
            timer: 1500
          });
          fetchIncomes();
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'ত্রুটি',
          text: 'মুছে ফেলতে ব্যর্থ'
        });
      }
    }
  };

  const totalIncome = incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">আয় ব্যবস্থাপনা</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">সকল আয়ের তালিকা ও বিবরণ</p>
            </div>
          </div>
          <Link
            href="/miraj-industries/income/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            নতুন আয় যোগ করুন
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট আয়</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ৳{totalIncome.toLocaleString('bn-BD')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">মোট লেনদেন</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {incomes.length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="উৎস, বিবরণ বা কাস্টমার খুঁজুন..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
            />
          </div>
          <div className="md:w-64 relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">উৎস ও বিবরণ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">কাস্টমার</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">পরিমাণ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        লোড হচ্ছে...
                      </div>
                    </td>
                  </tr>
                ) : incomes.length > 0 ? (
                  incomes.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.date ? new Date(item.date).toLocaleDateString('bn-BD') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.source}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {item.customer || '—'}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                        ৳{Number(item.amount).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/miraj-industries/income/${item.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {/* <Link
                            href={`/miraj-industries/income/${item.id}/edit`}
                            className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link> */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      কোন তথ্য পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IncomeList;
