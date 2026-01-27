'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  ArrowLeft,
  FileText,
  Scale,
  Megaphone,
  Laptop,
  CreditCard,
  Package,
  Receipt,
  RotateCcw,
  Loader2,
  Calendar,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Clock,
  Edit,
  MoreVertical,
  Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';

// Icons
const ICONS = { FileText, Scale, Megaphone, Laptop, CreditCard, Package, Receipt, RotateCcw };

const CategoryDetails = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  const [category, setCategory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // 1. Fetch category details
        const catRes = await fetch(`/api/personal-expense/categories/${id}`);
        const catData = await catRes.json();
        
        if (!catRes.ok) throw new Error(catData.error || 'Failed to fetch category');
        
        setCategory(catData.category);

        // 2. Fetch transactions for this category
        // Note: We're filtering by categoryId and scope='personal-expense'
        const txRes = await fetch(`/api/transactions?scope=personal-expense&categoryId=${id}`);
        const txData = await txRes.json();
        
        if (txRes.ok) {
          setTransactions(txData.data || []);
        }
      } catch (err) {
        console.error('Error loading details:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "এটি এই ক্যাটাগরি এবং এর সমস্ত তথ্য মুছে ফেলবে!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/personal-expense/categories/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await Swal.fire(
            'মুছে ফেলা হয়েছে!',
            'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।',
            'success'
          );
          router.push('/personal/expense');
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        Swal.fire(
          'ত্রুটি!',
          'মুছে ফেলার সময় সমস্যা হয়েছে।',
          'error'
        );
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !category) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Category not found'}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ফিরে যান
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = ICONS[category.iconKey] || FileText;
  const formatCurrency = (amount) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {category.name}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {category.expenseType === 'regular' ? 'নিয়মিত' : 'অনিয়মিত'}
                  </span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{category.banglaName || 'No Bangla Name'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/personal/expense/${id}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                সম্পাদনা
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-transparent hover:border-red-200 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">মোট খরচ</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(category.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.frequency === 'monthly' ? 'মাসিক বাজেট' : 'বাৎসরিক বাজেট'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(category.monthlyAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">লেনদেন সংখ্যা</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {transactions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {category.description && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">বিবরণ</h3>
              <p className="text-gray-600 dark:text-gray-400">{category.description}</p>
            </div>
          )}

          {/* Transactions List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">লেনদেনের ইতিহাস</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">তারিখ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">বিবরণ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">পরিমাণ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">পেমেন্ট মেথড</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id || tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(tx.date).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {tx.description || tx.notes || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600 dark:text-red-400">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                          {tx.paymentMethod || 'Cash'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        কোন লেনদেন পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CategoryDetails;
