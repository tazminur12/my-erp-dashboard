'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Mail, 
  Send, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  Image,
  Paperclip,
  Eye,
  Loader2,
  TrendingUp,
  FileText,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import Swal from 'sweetalert2';

// Convert Arabic numerals to Bengali numerals
const toBengaliNumeral = (num) => {
  if (num === null || num === undefined || num === '...') return num;
  
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const numStr = String(num);
  
  if (numStr.includes(',')) {
    return numStr.split(',').map(part => {
      return part.split('').map(char => {
        if (char >= '0' && char <= '9') {
          return bengaliDigits[parseInt(char)];
        }
        return char;
      }).join('');
    }).join(',');
  }
  
  return numStr.split('').map(char => {
    if (char >= '0' && char <= '9') {
      return bengaliDigits[parseInt(char)];
    }
    return char;
  }).join('');
};

const EmailMarketing = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!selectedGroup) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে প্রাপক গ্রুপ নির্বাচন করুন',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    setIsSending(true);
    
    // Simulate sending
    setTimeout(() => {
      setIsSending(false);
      Swal.fire({
        title: 'সফল!',
        text: 'ইমেইল সফলভাবে পাঠানো হয়েছে',
        icon: 'success',
        confirmButtonColor: '#10B981',
      });
      setSubject('');
      setBody('');
      setSelectedGroup('');
    }, 2000);
  };

  const handlePreview = () => {
    if (!subject || !body) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'প্রিভিউ করার জন্য বিষয় এবং কন্টেন্ট প্রয়োজন',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    Swal.fire({
      title: subject,
      html: `<div style="text-align: left; padding: 20px;">${body.replace(/\n/g, '<br>')}</div>`,
      width: '600px',
      confirmButtonText: 'বন্ধ করুন',
      confirmButtonColor: '#6B7280',
    });
  };

  const handleSaveDraft = () => {
    Swal.fire({
      title: 'সফল!',
      text: 'ড্রাফট হিসেবে সংরক্ষণ করা হয়েছে',
      icon: 'success',
      confirmButtonColor: '#10B981',
    });
  };

  // Mock data for email history
  const emailHistory = [
    {
      id: 1,
      recipient: 'সব গ্রাহক',
      subject: 'বিশেষ হজ্জ প্যাকেজ অফার ২০২৪',
      sentDate: '২০২৪-০১-১০ ১১:০০ AM',
      status: 'delivered',
      recipients: 1250,
      opened: 890,
      clicked: 230
    },
    {
      id: 2,
      recipient: 'ভিআইপি গ্রাহক',
      subject: 'এক্সক্লুসিভ উমরাহ প্যাকেজ - সীমিত আসন',
      sentDate: '২০২৪-০১-০৯ ০৩:৩০ PM',
      status: 'delivered',
      recipients: 145,
      opened: 120,
      clicked: 45
    },
    {
      id: 3,
      recipient: 'নতুন লিড',
      subject: 'বিন রশিদে স্বাগতম - আপনার ভ্রমণ সঙ্গী',
      sentDate: '২০২৪-০১-০৮ ১০:১৫ AM',
      status: 'failed',
      recipients: 50,
      opened: 0,
      clicked: 0
    },
    {
      id: 4,
      recipient: 'এয়ার টিকেট গ্রাহক',
      subject: 'বিশেষ ছাড় - আন্তর্জাতিক ফ্লাইট',
      sentDate: '২০২৪-০১-০৭ ০২:০০ PM',
      status: 'delivered',
      recipients: 320,
      opened: 245,
      clicked: 78
    },
    {
      id: 5,
      recipient: 'হজ্জ গ্রাহক',
      subject: 'হজ্জ ২০২৪ - গুরুত্বপূর্ণ তথ্য',
      sentDate: '২০২৪-০১-০৬ ০৯:৩০ AM',
      status: 'delivered',
      recipients: 89,
      opened: 67,
      clicked: 23
    }
  ];

  const stats = [
    { 
      label: 'মোট ইমেইল পাঠানো', 
      value: '৮,৪৫০', 
      icon: Mail, 
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-500'
    },
    { 
      label: 'ডেলিভার্ড', 
      value: '৮,১২০', 
      icon: CheckCircle, 
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'খোলা হয়েছে', 
      value: '৫,৮৯০', 
      icon: Eye, 
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'ব্যর্থ', 
      value: '৩৩০', 
      icon: XCircle, 
      color: 'red',
      gradient: 'from-red-500 to-pink-500'
    }
  ];

  const recipientGroups = [
    { value: 'all', label: 'সব গ্রাহক', count: 2450 },
    { value: 'vip', label: 'ভিআইপি গ্রাহক', count: 145 },
    { value: 'new', label: 'নতুন লিড', count: 320 },
    { value: 'hajj', label: 'হজ্জ গ্রাহক', count: 89 },
    { value: 'umrah', label: 'উমরাহ গ্রাহক', count: 156 },
    { value: 'air', label: 'এয়ার টিকেট গ্রাহক', count: 890 }
  ];

  const filteredHistory = emailHistory.filter(email => 
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Mail className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ইমেইল মার্কেটিং</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    আপনার গ্রাহকদের কাছে পেশাদার ইমেইল ক্যাম্পেইন তৈরি করুন এবং পাঠান
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">টেমপ্লেট</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} text-white flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1 p-2">
                <button
                  onClick={() => setActiveTab('compose')}
                  className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                    activeTab === 'compose'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  ইমেইল লিখুন
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                    activeTab === 'history'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  ইতিহাস
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  বিশ্লেষণ
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'compose' && (
              <div className="p-6">
                <form onSubmit={handleSendEmail} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      প্রাপক নির্বাচন করুন
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">একটি গ্রুপ নির্বাচন করুন...</option>
                      {recipientGroups.map(group => (
                        <option key={group.value} value={group.value}>
                          {group.label} ({toBengaliNumeral(group.count)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      বিষয়
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ইমেইলের বিষয় লিখুন..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ইমেইল কন্টেন্ট
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={14}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                      placeholder="আপনার ইমেইল কন্টেন্ট এখানে লিখুন..."
                      required
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Image className="w-4 h-4" />
                        ছবি যোগ করুন
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Paperclip className="w-4 h-4" />
                        ফাইল সংযুক্ত করুন
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={isSending}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          পাঠানো হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          ইমেইল পাঠান
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ড্রাফট হিসেবে সংরক্ষণ
                    </button>
                    <button
                      type="button"
                      onClick={handlePreview}
                      className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      প্রিভিউ
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {/* Search and Filter */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ইমেইল ইতিহাস খুঁজুন..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Filter className="w-4 h-4" />
                      ফিল্টার
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Download className="w-4 h-4" />
                      এক্সপোর্ট
                    </button>
                  </div>
                </div>

                {/* Email History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">প্রাপক গ্রুপ</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">বিষয়</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">প্রাপক</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">খোলা</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ক্লিক</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">তারিখ ও সময়</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center">
                            <Search className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">কোন ইমেইল পাওয়া যায়নি</p>
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((email) => {
                          const openRate = Math.round((email.opened / email.recipients) * 100);
                          const clickRate = Math.round((email.clicked / email.recipients) * 100);
                          
                          return (
                            <tr key={email.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">#{email.id}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-900 dark:text-white">{email.recipient}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={email.subject}>
                                {email.subject}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {toBengaliNumeral(email.recipients)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <span className="text-gray-900 dark:text-white font-medium">
                                    {toBengaliNumeral(email.opened)}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                                    ({toBengaliNumeral(openRate)}%)
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <span className="text-gray-900 dark:text-white font-medium">
                                    {toBengaliNumeral(email.clicked)}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                                    ({toBengaliNumeral(clickRate)}%)
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{email.sentDate}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                  email.status === 'delivered' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                  {email.status === 'delivered' ? (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5" />
                                  )}
                                  {email.status === 'delivered' ? 'ডেলিভার্ড' : 'ব্যর্থ'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="p-12">
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">ইমেইল বিশ্লেষণ শীঘ্রই আসছে</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    খোলার হার, ক্লিক-থ্রু হার এবং engagement metrics সহ বিস্তারিত বিশ্লেষণ এখানে উপলব্ধ হবে
                  </p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">খোলার হার</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ইমেইল খোলার পরিসংখ্যান</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <Target className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">ক্লিক হার</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">লিঙ্ক ক্লিকের পরিসংখ্যান</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                      <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Engagement</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">গ্রাহক engagement metrics</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmailMarketing;
