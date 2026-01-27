'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Scale, 
  Megaphone, 
  Laptop, 
  CreditCard, 
  Package, 
  Receipt, 
  RotateCcw, 
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  FileText,
  Calendar,
  Search,
  Download,
  Eye,
  Trash2,
  Edit,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

// Icon registry for persistence
const ICONS = { Scale, Megaphone, Laptop, CreditCard, Package, Receipt, RotateCcw, FileText };

const PersonalExpenses = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 10;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/personal-expense/categories');
        const data = await response.json();
        
        if (response.ok) {
          const categories = (data.categories || []).map((c) => ({
            ...c,
            icon: (ICONS[c.iconKey] || FileText),
            color: c.color || 'from-blue-500 to-blue-600',
            bgColor: c.bgColor || 'bg-blue-50 dark:bg-blue-900/20',
            iconColor: c.iconColor || 'text-blue-600 dark:text-blue-400',
            totalAmount: typeof c.totalAmount === 'number' ? c.totalAmount : Number(c.totalAmount || 0),
            itemCount: typeof c.itemCount === 'number' ? c.itemCount : Number(c.itemCount || 0),
            lastUpdated: c.lastUpdated || new Date().toISOString(),
          }));
          setExpenseCategories(categories);
        } else {
          throw new Error(data.error || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'ক্যাটাগরি লোড করতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return Array.isArray(expenseCategories) ? expenseCategories : [];
    return Array.isArray(expenseCategories) ? expenseCategories.filter((c) =>
      [c.name, c.banglaName, c.description]
        .filter(Boolean)
        .some((x) => x.toLowerCase().includes(q))
    ) : [];
  }, [query, expenseCategories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  // Calculate total expenses and budget
  const totalMonthlyBudget = expenseCategories.reduce((sum, c) => sum + (Number(c.monthlyAmount) || 0), 0);
  const totalThisMonthExpense = expenseCategories.reduce((sum, c) => sum + (Number(c.thisMonthExpense) || 0), 0);
  const totalRemaining = Math.max(0, totalMonthlyBudget - totalThisMonthExpense);
  const totalLifetimeExpense = expenseCategories.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0);

  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;

  const handleCategoryClick = (categoryId) => {
    router.push(`/personal/expense/${categoryId}`);
  };

  const handleAddCategory = () => {
    router.push('/personal/expense/add');
  };

  const handleDeleteCategory = async (e, categoryId, categoryName) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: `${categoryName || 'এই ক্যাটাগরি'} মুছে ফেলবেন?`,
      text: 'এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/personal-expense/categories/${categoryId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
          // Refresh the list
          const refreshResponse = await fetch('/api/personal-expense/categories');
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok) {
            const categories = (refreshData.categories || []).map((c) => ({
              ...c,
              icon: (ICONS[c.iconKey] || FileText),
              color: c.color || 'from-blue-500 to-blue-600',
              bgColor: c.bgColor || 'bg-blue-50 dark:bg-blue-900/20',
              iconColor: c.iconColor || 'text-blue-600 dark:text-blue-400',
              totalAmount: typeof c.totalAmount === 'number' ? c.totalAmount : Number(c.totalAmount || 0),
              itemCount: typeof c.itemCount === 'number' ? c.itemCount : Number(c.itemCount || 0),
              lastUpdated: c.lastUpdated || new Date().toISOString(),
            }));
            setExpenseCategories(categories);
          }
        } else {
          throw new Error(data.error || data.message || 'Failed to delete category');
        }
      } catch (err) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: err?.message || 'ক্যাটাগরি মুছে ফেলতে ব্যর্থ।',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">ব্যক্তিগত খরচ ব্যবস্থাপনা</h1>
                <p className="text-gray-600 dark:text-gray-400">দৈনিক ব্যক্তিগত খরচ ট্র্যাকিং</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                  className="w-full sm:w-72 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="ক্যাটাগরি খুঁজুন..."
                />
              </div>
              <button
                onClick={handleAddCategory}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2.5"
              >
                <Plus className="w-4 h-4" /> নতুন ক্যাটাগরি
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3.5 py-2.5">
                <Download className="w-4 h-4" /> এক্সপোর্ট
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">মাসিক বাজেট (গড়)</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(totalMonthlyBudget)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">এই মাসের ব্যয়</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalThisMonthExpense)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">আনুমানিক ব্যয় বাকি</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">সর্বমোট খরচ</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(totalLifetimeExpense)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ক্যাটাগরি</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">মাসিক গড়</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">এই মাসের ব্যয়</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">আনুমানিক ব্যয় বাকি</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          লোড হচ্ছে...
                        </div>
                      </td>
                    </tr>
                  ) : paged.length > 0 ? paged.map((category) => {
                    const Icon = category.icon;
                    return (
                      <tr 
                        key={category.id || category._id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer"
                        onClick={() => handleCategoryClick(category.id || category._id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-5 h-5 ${category.iconColor}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</div>
                              {category.banglaName && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">{category.banglaName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {formatCurrency(category.monthlyAmount)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(category.thisMonthExpense)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`text-sm font-semibold ${category.estimatedRemaining > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatCurrency(category.estimatedRemaining)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/personal/expense/${category.id || category._id}`}
                              className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                              title="বিস্তারিত দেখুন"
                            >
                              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </Link>
                            <button
                              onClick={(e) => handleDeleteCategory(e, category.id || category._id, category.name)}
                              className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                        {query ? 'কোন ক্যাটাগরি পাওয়া যায়নি' : 'কোন ক্যাটাগরি নেই। নতুন ক্যাটাগরি তৈরি করুন।'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                দেখানো হচ্ছে <span className="font-medium">{paged.length}</span> এর <span className="font-medium">{filtered.length}</span> ক্যাটাগরি
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  আগে
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-200">পৃষ্ঠা {currentPage} এর {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  পরে
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PersonalExpenses;
