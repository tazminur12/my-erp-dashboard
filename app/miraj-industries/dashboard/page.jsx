'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Activity, 
  AlertTriangle,
  Milk,
  Package,
  DollarSign,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
  Camera,
  Heart,
  Baby,
  Utensils,
  FileText,
  Building,
  Clock,
  Loader2,
  Syringe,
  Stethoscope
} from 'lucide-react';

const CattleDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCows: 0,
    totalMilkProduction: 0,
    feedStock: 0,
    sickCattle: 0,
    upcomingVaccinations: 0,
    monthlyExpense: 0,
    monthlyIncome: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [
        cattleRes,
        milkRes,
        feedStockRes,
        healthRes,
        vaccinationRes,
        incomesRes,
        expensesRes,
        breedingRes
      ] = await Promise.all([
        fetch('/api/miraj-industries/cattle'),
        fetch(`/api/miraj-industries/milk-production?date=${new Date().toISOString().split('T')[0]}`),
        fetch('/api/miraj-industries/feed-stocks'),
        fetch('/api/miraj-industries/health-records?status=under_treatment'),
        fetch('/api/miraj-industries/vaccination-records'),
        fetch('/api/miraj-industries/farm-incomes'),
        fetch('/api/miraj-industries/farm-expenses'),
        fetch('/api/miraj-industries/breeding-records')
      ]);

      const cattleData = await cattleRes.json();
      const milkData = await milkRes.json();
      const feedStockData = await feedStockRes.json();
      const healthData = await healthRes.json();
      const vaccinationData = await vaccinationRes.json();
      const incomesData = await incomesRes.json();
      const expensesData = await expensesRes.json();
      const breedingData = await breedingRes.json();

      // Calculate statistics
      const cattle = cattleData.cattle || cattleData.data || [];
      const milkRecords = milkData.records || milkData.data || [];
      const feedStocks = feedStockData.stocks || feedStockData.data || [];
      const healthRecords = healthData.records || healthData.data || [];
      const vaccinations = vaccinationData.records || vaccinationData.data || [];
      const incomes = incomesData.incomes || incomesData.data || [];
      const expenses = expensesData.expenses || expensesData.data || [];
      const breedingRecords = breedingData.records || breedingData.data || [];

      // Today's milk production
      const today = new Date().toISOString().split('T')[0];
      const todayMilk = milkRecords
        .filter(record => record.date === today)
        .reduce((sum, record) => sum + (Number(record.totalQuantity) || 0), 0);

      // Feed stock percentage (calculate based on current stock vs total capacity)
      const totalFeedStock = feedStocks.reduce((sum, stock) => sum + (Number(stock.currentStock) || 0), 0);
      const totalCapacity = feedStocks.reduce((sum, stock) => sum + (Number(stock.capacity) || 1000), 0);
      const feedStockPercent = totalCapacity > 0 ? Math.round((totalFeedStock / totalCapacity) * 100) : 0;

      // Upcoming vaccinations (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const upcomingVaccinations = vaccinations.filter(vaccination => {
        if (!vaccination.nextDueDate) return false;
        const dueDate = new Date(vaccination.nextDueDate);
        return dueDate <= nextWeek && dueDate >= new Date();
      }).length;

      // Monthly income and expense
      const thisMonth = new Date().toISOString().slice(0, 7);
      const monthlyIncome = incomes
        .filter(income => income.date && income.date.startsWith(thisMonth))
        .reduce((sum, income) => sum + (Number(income.amount) || 0), 0);
      
      const monthlyExpense = expenses
        .filter(expense => expense.createdAt && expense.createdAt.startsWith(thisMonth))
        .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

      // Sick cattle count
      const sickCattle = healthRecords.filter(record => 
        record.status === 'under_treatment'
      ).length;

      // Recent activities
      const activities = [];
      
      // Add recent milk production activities
      const recentMilk = milkRecords
        .slice(0, 3)
        .map(record => ({
          id: `milk-${record.id}`,
          type: 'milk',
          message: `গরু #${record.cattleDisplayId || record.cattleId} থেকে ${record.totalQuantity || 0} লিটার দুধ উৎপাদন`,
          time: record.date ? getTimeAgo(record.date) : 'সম্প্রতি',
          icon: Milk
        }));
      activities.push(...recentMilk);

      // Add recent health activities
      const recentHealth = healthRecords
        .slice(0, 2)
        .map(record => ({
          id: `health-${record.id}`,
          type: 'health',
          message: `গরু #${record.cattleDisplayId || record.cattleId} এর স্বাস্থ্য পরীক্ষা সম্পন্ন`,
          time: record.date ? getTimeAgo(record.date) : 'সম্প্রতি',
          icon: Heart
        }));
      activities.push(...recentHealth);

      // Add recent breeding activities
      const recentBreeding = breedingRecords
        .slice(0, 2)
        .map(record => ({
          id: `breeding-${record.id}`,
          type: 'breeding',
          message: `গরু #${record.cowDisplayId || record.cowId} এর প্রজনন রেকর্ড আপডেট`,
          time: record.date ? getTimeAgo(record.date) : 'সম্প্রতি',
          icon: Baby
        }));
      activities.push(...recentBreeding);

      // Sort activities by date (most recent first) and take top 5
      activities.sort((a, b) => {
        const dateA = new Date(a.time);
        const dateB = new Date(b.time);
        return dateB - dateA;
      });

      setStats({
        totalCows: cattle.length,
        totalMilkProduction: todayMilk,
        feedStock: feedStockPercent,
        sickCattle: sickCattle,
        upcomingVaccinations: upcomingVaccinations,
        monthlyExpense: monthlyExpense,
        monthlyIncome: monthlyIncome
      });

      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'সম্প্রতি';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'কিছুক্ষণ আগে';
    if (diffInHours < 24) return `${diffInHours} ঘন্টা আগে`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'গতকাল';
    if (diffInDays < 7) return `${diffInDays} দিন আগে`;
    return date.toLocaleDateString('bn-BD');
  };

  const quickActions = [
    { 
      title: 'নতুন গরু যোগ করুন', 
      icon: Plus, 
      color: 'bg-blue-500 dark:bg-blue-600', 
      action: () => router.push('/miraj-industries/cattle-management')
    },
    { 
      title: 'দুধ উৎপাদন রেকর্ড', 
      icon: Milk, 
      color: 'bg-green-500 dark:bg-green-600', 
      action: () => router.push('/miraj-industries/milk-production')
    },
    { 
      title: 'খাদ্য ব্যবস্থাপনা', 
      icon: Utensils, 
      color: 'bg-orange-500 dark:bg-orange-600', 
      action: () => router.push('/miraj-industries/feed-management')
    },
    { 
      title: 'স্বাস্থ্য রেকর্ড', 
      icon: Heart, 
      color: 'bg-red-500 dark:bg-red-600', 
      action: () => router.push('/miraj-industries/health-records')
    },
    { 
      title: 'প্রজনন রেকর্ড', 
      icon: Baby, 
      color: 'bg-purple-500 dark:bg-purple-600', 
      action: () => router.push('/miraj-industries/breeding-records')
    },
    { 
      title: 'খরচ আয় রিপোর্ট', 
      icon: BarChart3, 
      color: 'bg-indigo-500 dark:bg-indigo-600', 
      action: () => router.push('/miraj-industries/financial-report')
    }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
        {/* Professional Cow Images Gallery - 3 Pictures Side by Side */}
        <div className="relative bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-3xl overflow-hidden shadow-xl">
          <div className="w-full flex items-center justify-center p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {/* Cow 1 */}
              <div className="relative">
                <img 
                  src="/Picture/cow1.jpg" 
                  alt="গবাদি পশু ১" 
                  className="w-full h-48 object-cover rounded-2xl shadow-xl border-4 border-white dark:border-gray-700"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Cow+1';
                  }}
                />
                <div className="absolute top-3 right-3 bg-green-500 dark:bg-green-600 text-white px-3 py-1 rounded-lg shadow-lg">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span className="font-semibold text-xs">স্বাস্থ্যকর</span>
                  </div>
                </div>
              </div>
              
              {/* Cow 2 */}
              <div className="relative">
                <img 
                  src="/Picture/cow2.jpg" 
                  alt="গবাদি পশু ২" 
                  className="w-full h-48 object-cover rounded-2xl shadow-xl border-4 border-white dark:border-gray-700"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Cow+2';
                  }}
                />
                <div className="absolute top-3 right-3 bg-green-500 dark:bg-green-600 text-white px-3 py-1 rounded-lg shadow-lg">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span className="font-semibold text-xs">স্বাস্থ্যকর</span>
                  </div>
                </div>
              </div>
              
              {/* Cow 3 */}
              <div className="relative">
                <img 
                  src="/Picture/cow3.jpg" 
                  alt="গবাদি পশু ৩" 
                  className="w-full h-48 object-cover rounded-2xl shadow-xl border-4 border-white dark:border-gray-700"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Cow+3';
                  }}
                />
                <div className="absolute top-3 right-3 bg-green-500 dark:bg-green-600 text-white px-3 py-1 rounded-lg shadow-lg">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span className="font-semibold text-xs">স্বাস্থ্যকর</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট গরু</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCows}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>সক্রিয়</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আজকের দুধ উৎপাদন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMilkProduction} লিটার</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <Milk className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>আজকের উৎপাদন</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">খাদ্য স্টক</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.feedStock}%</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-400">
              {stats.feedStock < 30 ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span>নিম্ন স্টক সতর্কতা</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>পর্যাপ্ত স্টক</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অসুস্থ গরু</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.sickCattle}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600 dark:text-red-400">
              <Heart className="w-4 h-4 mr-1" />
              <span>চিকিৎসা প্রয়োজন</span>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">মাসিক আয়-খরচ</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">মোট আয়</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  ৳{stats.monthlyIncome.toLocaleString('bn-BD')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">মোট খরচ</span>
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  ৳{stats.monthlyExpense.toLocaleString('bn-BD')}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">নিট লাভ</span>
                  <span className={`font-bold ${
                    (stats.monthlyIncome - stats.monthlyExpense) >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    ৳{(stats.monthlyIncome - stats.monthlyExpense).toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">আসন্ন কার্যক্রম</h3>
            <div className="space-y-3">
              {stats.upcomingVaccinations > 0 && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    আগামী সপ্তাহে {stats.upcomingVaccinations}টি টিকা
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Baby className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                <span className="text-gray-700 dark:text-gray-300">প্রজনন রেকর্ড আপডেট করুন</span>
              </div>
              {stats.feedStock < 30 && (
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                  <span className="text-gray-700 dark:text-gray-300">খাদ্য সরবরাহের সময়</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions with Featured Image */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">দ্রুত কার্যক্রম</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex flex-col items-center gap-2`}
                >
                  <action.icon className="w-6 h-6" />
                  <span className="text-sm font-medium text-center">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Featured Cow Image Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <img 
                src="/Picture/cow1.jpg" 
                alt="খামারের গরু" 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Farm+Cow';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-semibold text-lg">আমাদের খামার</h4>
                <p className="text-sm opacity-90">স্বাস্থ্যকর গবাদি পশু</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">মোট গরু</span>
                <span className="font-bold text-green-600 dark:text-green-400">{stats.totalCows}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">দুধ উৎপাদন</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{stats.totalMilkProduction} লিটার</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">স্বাস্থ্য অবস্থা</span>
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Heart className="w-4 h-4" />
                  <span className="font-semibold">ভাল</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সাম্প্রতিক কার্যক্রম</h3>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                    <activity.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>কোন সাম্প্রতিক কার্যক্রম নেই</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CattleDashboard;
