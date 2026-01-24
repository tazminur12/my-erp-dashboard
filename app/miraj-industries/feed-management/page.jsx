'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Utensils,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  Scale,
  DollarSign,
  Truck,
  Store,
  BarChart3,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

const FeedManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showAddFeedModal, setShowAddFeedModal] = useState(false);
  const [showAddUsageModal, setShowAddUsageModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [types, setTypes] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [usages, setUsages] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newFeed, setNewFeed] = useState({
    name: '',
    type: '',
    unit: 'kg',
    costPerUnit: '',
    supplier: '',
    description: ''
  });

  const [newStock, setNewStock] = useState({
    feedTypeId: '',
    quantity: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    supplier: '',
    cost: '',
    notes: ''
  });

  const [newUsage, setNewUsage] = useState({
    feedTypeId: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    cattleId: '',
    purpose: '',
    notes: ''
  });

  const unitOptions = ['kg', 'gm', 'liter', 'bag', 'ton'];

  // Fetch feed types
  useEffect(() => {
    const fetchFeedTypes = async () => {
      try {
        const response = await fetch('/api/miraj-industries/feed-types');
        const data = await response.json();
        if (response.ok) {
          setTypes(data.feedTypes || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching feed types:', error);
      }
    };
    fetchFeedTypes();
  }, []);

  // Fetch feed stocks
  useEffect(() => {
    const fetchFeedStocks = async () => {
      try {
        const response = await fetch('/api/miraj-industries/feed-stocks');
        const data = await response.json();
        if (response.ok) {
          setStocks(data.stocks || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching feed stocks:', error);
      }
    };
    fetchFeedStocks();
  }, []);

  // Fetch feed usages
  useEffect(() => {
    const fetchFeedUsages = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (filterDate) params.append('date', filterDate);

        const response = await fetch(`/api/miraj-industries/feed-usages?${params.toString()}`);
        const data = await response.json();
        if (response.ok) {
          setUsages(data.usages || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching feed usages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedUsages();
  }, [searchTerm, filterDate]);

  // Fetch cattle list
  useEffect(() => {
    const fetchCattle = async () => {
      try {
        const response = await fetch('/api/miraj-industries/cattle');
        const data = await response.json();
        if (response.ok) {
          setCattleList(data.cattle || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching cattle:', error);
      }
    };
    fetchCattle();
  }, []);

  const stats = useMemo(() => {
    const totalStockValue = (stocks || []).reduce((sum, stock) => {
      const feedType = (types || []).find(feed => feed.id === stock.feedTypeId);
      return sum + (Number(stock.currentStock || 0) * Number(feedType?.costPerUnit || 0));
    }, 0);

    const lowStockItems = (stocks || []).filter(stock => Number(stock.currentStock || 0) <= Number(stock.minStock || 0)).length;

    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyFeedCost = (usages || [])
      .filter(usage => String(usage.date || '').startsWith(thisMonth))
      .reduce((sum, usage) => {
        const feedType = (types || []).find(feed => feed.id === usage.feedTypeId);
        return sum + (Number(usage.quantity || 0) * Number(feedType?.costPerUnit || 0));
      }, 0);

    const averageDailyUsage = (usages || []).length > 0 
      ? (usages || []).reduce((sum, usage) => sum + Number(usage.quantity || 0), 0) / (usages || []).length 
      : 0;

    return {
      totalStockValue,
      lowStockItems,
      monthlyFeedCost,
      averageDailyUsage,
      totalFeedTypes: (types || []).length,
      stockAlert: lowStockItems > 0
    };
  }, [types, stocks, usages]);

  const handleAddFeed = async () => {
    if (!newFeed.name.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'খাদ্যের নাম আবশ্যক',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/miraj-industries/feed-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFeed.name.trim(),
          type: newFeed.type || '',
          unit: newFeed.unit || 'kg',
          costPerUnit: Number(newFeed.costPerUnit || 0),
          supplier: newFeed.supplier || '',
          description: newFeed.description || ''
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'খাদ্যের ধরন যোগ করা হয়েছে',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowAddFeedModal(false);
        resetFeedForm();
        // Refresh feed types
        const refreshResponse = await fetch('/api/miraj-industries/feed-types');
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setTypes(refreshData.feedTypes || refreshData.data || []);
        }
      } else {
        throw new Error(data.error || 'Failed to create feed type');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'খাদ্যের ধরন যোগ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStock = async () => {
    if (!newStock.feedTypeId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'খাদ্যের ধরন নির্বাচন করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    if (!newStock.quantity || Number(newStock.quantity) <= 0) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সঠিক পরিমাণ লিখুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/miraj-industries/feed-stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedTypeId: newStock.feedTypeId,
          quantity: Number(newStock.quantity),
          purchaseDate: newStock.purchaseDate,
          expiryDate: newStock.expiryDate || '',
          supplier: newStock.supplier || '',
          cost: Number(newStock.cost || 0),
          notes: newStock.notes || ''
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'খাদ্য স্টক যোগ করা হয়েছে',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowAddStockModal(false);
        resetStockForm();
        // Refresh stocks
        const refreshResponse = await fetch('/api/miraj-industries/feed-stocks');
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setStocks(refreshData.stocks || refreshData.data || []);
        }
      } else {
        throw new Error(data.error || 'Failed to create feed stock');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'খাদ্য স্টক যোগ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUsage = async () => {
    if (!newUsage.feedTypeId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'খাদ্যের ধরন নির্বাচন করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    if (!newUsage.quantity || Number(newUsage.quantity) <= 0) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সঠিক পরিমাণ লিখুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/miraj-industries/feed-usages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedTypeId: newUsage.feedTypeId,
          date: newUsage.date,
          quantity: Number(newUsage.quantity),
          cattleId: newUsage.cattleId || '',
          purpose: newUsage.purpose || '',
          notes: newUsage.notes || ''
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'খাদ্য ব্যবহার রেকর্ড যোগ করা হয়েছে',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setShowAddUsageModal(false);
        resetUsageForm();
        // Refresh usages and stocks
        const [usagesResponse, stocksResponse] = await Promise.all([
          fetch('/api/miraj-industries/feed-usages'),
          fetch('/api/miraj-industries/feed-stocks')
        ]);
        const usagesData = await usagesResponse.json();
        const stocksData = await stocksResponse.json();
        if (usagesResponse.ok) {
          setUsages(usagesData.usages || usagesData.data || []);
        }
        if (stocksResponse.ok) {
          setStocks(stocksData.stocks || stocksData.data || []);
        }
      } else {
        throw new Error(data.error || 'Failed to create feed usage');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'খাদ্য ব্যবহার রেকর্ড যোগ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই রেকর্ড মুছে ফেলা হবে',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/miraj-industries/feed-usages/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'রেকর্ড সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          // Refresh usages and stocks
          const [usagesResponse, stocksResponse] = await Promise.all([
            fetch('/api/miraj-industries/feed-usages'),
            fetch('/api/miraj-industries/feed-stocks')
          ]);
          const usagesData = await usagesResponse.json();
          const stocksData = await stocksResponse.json();
          if (usagesResponse.ok) {
            setUsages(usagesData.usages || usagesData.data || []);
          }
          if (stocksResponse.ok) {
            setStocks(stocksData.stocks || stocksData.data || []);
          }
        } else {
          throw new Error(data.error || 'Failed to delete usage');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'রেকর্ড মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const resetFeedForm = () => {
    setNewFeed({
      name: '',
      type: '',
      unit: 'kg',
      costPerUnit: '',
      supplier: '',
      description: ''
    });
  };

  const resetStockForm = () => {
    setNewStock({
      feedTypeId: '',
      quantity: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      supplier: '',
      cost: '',
      notes: ''
    });
  };

  const resetUsageForm = () => {
    setNewUsage({
      feedTypeId: '',
      date: new Date().toISOString().split('T')[0],
      quantity: '',
      cattleId: '',
      purpose: '',
      notes: ''
    });
  };

  const getStockStatus = (current, minimum) => {
    if (current <= minimum) {
      return { status: 'low', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20', icon: AlertTriangle };
    } else if (current <= minimum * 1.5) {
      return { status: 'medium', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20', icon: Clock };
    } else {
      return { status: 'good', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20', icon: CheckCircle };
    }
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">খাদ্য ব্যবস্থাপনা</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">খাদ্যের স্টক, ক্রয় ও ব্যবহারের রেকর্ড</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddFeedModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              খাদ্যের ধরন
            </button>
            <button 
              onClick={() => setShowAddStockModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Truck className="w-5 h-5" />
              স্টক যোগ
            </button>
            <button 
              onClick={() => setShowAddUsageModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Utensils className="w-5 h-5" />
              ব্যবহার
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট স্টক মূল্য</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{stats.totalStockValue.toLocaleString('bn-BD')}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
              <Store className="w-4 h-4 mr-1" />
              <span>{stats.totalFeedTypes} ধরনের খাদ্য</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">নিম্ন স্টক</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.lowStockItems}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>সতর্কতা প্রয়োজন</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মাসিক খাদ্য খরচ</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{stats.monthlyFeedCost.toLocaleString('bn-BD')}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span>এই মাসের খরচ</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">গড় দৈনিক ব্যবহার</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageDailyUsage.toFixed(1)} কেজি</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400">
              <BarChart3 className="w-4 h-4 mr-1" />
              <span>গড় ব্যবহার</span>
            </div>
          </div>
        </div>

        {/* Stock Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">খাদ্য স্টক অবস্থা</h3>
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2">
              <Download className="w-5 h-5" />
              রিপোর্ট
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    খাদ্যের নাম
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    বর্তমান স্টক
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ন্যূনতম স্টক
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    অবস্থা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ক্রয় তারিখ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    মেয়াদ শেষ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      কোন স্টক পাওয়া যায়নি
                    </td>
                  </tr>
                ) : stocks.map((stock) => {
                  const stockStatus = getStockStatus(stock.currentStock, stock.minStock);
                  const StatusIcon = stockStatus.icon;
                  
                  return (
                    <tr key={stock.id || stock._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{stock.feedName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Scale className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{stock.currentStock || 0} কেজি</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{stock.minStock || 0} কেজি</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                            {stockStatus.status === 'low' ? 'নিম্ন' : 
                             stockStatus.status === 'medium' ? 'মধ্যম' : 'ভাল'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {stock.purchaseDate ? new Date(stock.purchaseDate).toLocaleDateString('bn-BD') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {stock.expiryDate ? new Date(stock.expiryDate).toLocaleDateString('bn-BD') : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usage Records */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">খাদ্য ব্যবহার রেকর্ড</h3>
            <div className="flex gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    তারিখ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    খাদ্য
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    পরিমাণ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    গরু
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    উদ্দেশ্য
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ক্রিয়া
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {usages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      কোন রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                ) : usages.map((usage) => (
                  <tr key={usage.id || usage._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {usage.date ? new Date(usage.date).toLocaleDateString('bn-BD') : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{usage.feedName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Scale className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{usage.quantity || 0} কেজি</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">{usage.cattleName || usage.cattleId || 'All'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">{usage.purpose || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteRecord(usage.id || usage._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Feed Type Modal */}
        {showAddFeedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">নতুন খাদ্যের ধরন যোগ করুন</h2>
                <button 
                  onClick={() => { setShowAddFeedModal(false); resetFeedForm(); }} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddFeed(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">খাদ্যের নাম <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newFeed.name}
                    onChange={(e) => setNewFeed({...newFeed, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="খাদ্যের নাম লিখুন"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">খাদ্যের ধরন</label>
                  <input
                    type="text"
                    value={newFeed.type}
                    onChange={(e) => setNewFeed({...newFeed, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="খাদ্যের ধরন লিখুন"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">একক</label>
                    <select
                      value={newFeed.unit}
                      onChange={(e) => setNewFeed({...newFeed, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {unitOptions.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">একক প্রতি খরচ (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newFeed.costPerUnit}
                      onChange={(e) => setNewFeed({...newFeed, costPerUnit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="খরচ"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">সরবরাহকারী</label>
                  <input
                    type="text"
                    value={newFeed.supplier}
                    onChange={(e) => setNewFeed({...newFeed, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="সরবরাহকারীর নাম"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বিবরণ</label>
                  <textarea
                    value={newFeed.description}
                    onChange={(e) => setNewFeed({...newFeed, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="খাদ্যের বিবরণ"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowAddFeedModal(false); resetFeedForm(); }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
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

        {/* Add Stock Modal */}
        {showAddStockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">খাদ্য স্টক যোগ করুন</h2>
                <button 
                  onClick={() => { setShowAddStockModal(false); resetStockForm(); }} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddStock(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">খাদ্যের ধরন <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={newStock.feedTypeId}
                    onChange={(e) => setNewStock({...newStock, feedTypeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">খাদ্য নির্বাচন করুন</option>
                    {types.map(feed => (
                      <option key={feed.id || feed._id} value={feed.id || feed._id}>{feed.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পরিমাণ <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newStock.quantity}
                      onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="পরিমাণ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">মূল্য (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newStock.cost}
                      onChange={(e) => setNewStock({...newStock, cost: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="মূল্য"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ক্রয় তারিখ <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={newStock.purchaseDate}
                      onChange={(e) => setNewStock({...newStock, purchaseDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">মেয়াদ শেষ</label>
                    <input
                      type="date"
                      value={newStock.expiryDate}
                      onChange={(e) => setNewStock({...newStock, expiryDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">সরবরাহকারী</label>
                  <input
                    type="text"
                    value={newStock.supplier}
                    onChange={(e) => setNewStock({...newStock, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="সরবরাহকারীর নাম"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={newStock.notes}
                    onChange={(e) => setNewStock({...newStock, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowAddStockModal(false); resetStockForm(); }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
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

        {/* Add Usage Modal */}
        {showAddUsageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">খাদ্য ব্যবহার রেকর্ড</h2>
                <button 
                  onClick={() => { setShowAddUsageModal(false); resetUsageForm(); }} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddUsage(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">খাদ্যের ধরন <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={newUsage.feedTypeId}
                    onChange={(e) => setNewUsage({...newUsage, feedTypeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">খাদ্য নির্বাচন করুন</option>
                    {types.map(feed => (
                      <option key={feed.id || feed._id} value={feed.id || feed._id}>{feed.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">তারিখ <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={newUsage.date}
                      onChange={(e) => setNewUsage({...newUsage, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পরিমাণ <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newUsage.quantity}
                      onChange={(e) => setNewUsage({...newUsage, quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="পরিমাণ"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">গরু</label>
                  <select
                    value={newUsage.cattleId}
                    onChange={(e) => setNewUsage({...newUsage, cattleId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">সব গরু (All)</option>
                    {cattleList.map(cattle => {
                      const cattleId = cattle.id || cattle._id;
                      return (
                        <option key={cattleId} value={cattleId}>{cattle.name} ({cattle.tagNumber || cattleId})</option>
                      );
                    })}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">উদ্দেশ্য</label>
                  <input
                    type="text"
                    value={newUsage.purpose}
                    onChange={(e) => setNewUsage({...newUsage, purpose: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="খাদ্য ব্যবহারের উদ্দেশ্য"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট</label>
                  <textarea
                    value={newUsage.notes}
                    onChange={(e) => setNewUsage({...newUsage, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="অতিরিক্ত তথ্য"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowAddUsageModal(false); resetUsageForm(); }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
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
      </div>
    </DashboardLayout>
  );
};

export default FeedManagement;
