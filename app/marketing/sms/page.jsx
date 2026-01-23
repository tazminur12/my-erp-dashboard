'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  MessageSquare, 
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
  Loader2,
  TrendingUp,
  Target,
  Zap,
  AlertCircle,
  FileText
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

const SmsMarketing = () => {
  const [activeTab, setActiveTab] = useState('send');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const handleMessageChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    setCharacterCount(text.length);
  };

  const handleSendSMS = async (e) => {
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

    if (!message.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে বার্তা লিখুন',
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
        text: 'এসএমএস সফলভাবে পাঠানো হয়েছে',
        icon: 'success',
        confirmButtonColor: '#10B981',
      });
      setMessage('');
      setCharacterCount(0);
      setSelectedGroup('');
    }, 2000);
  };

  const handleSaveDraft = () => {
    if (!message.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ড্রাফট হিসেবে সংরক্ষণ করার জন্য বার্তা প্রয়োজন',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    Swal.fire({
      title: 'সফল!',
      text: 'ড্রাফট হিসেবে সংরক্ষণ করা হয়েছে',
      icon: 'success',
      confirmButtonColor: '#10B981',
    });
  };

  // Mock data for SMS history
  const smsHistory = [
    {
      id: 1,
      recipient: 'সব গ্রাহক',
      message: 'আসসালামু আলাইকুম। বিশেষ অফার - হজ্জ প্যাকেজ ২০২৪ এ এখনই বুকিং করুন।',
      sentDate: '২০২৪-০১-১০ ১০:৩০ AM',
      status: 'delivered',
      recipients: 150
    },
    {
      id: 2,
      recipient: 'ভিআইপি গ্রাহক',
      message: 'এক্সক্লুসিভ হজ্জ প্যাকেজ - সীমিত আসন। এখনই যোগাযোগ করুন।',
      sentDate: '২০২৪-০১-০৯ ০২:১৫ PM',
      status: 'delivered',
      recipients: 45
    },
    {
      id: 3,
      recipient: 'নতুন লিড',
      message: 'বিন রশিদে স্বাগতম - আপনার বিশ্বস্ত ভ্রমণ সঙ্গী।',
      sentDate: '২০২৪-০১-০৮ ০৯:০০ AM',
      status: 'failed',
      recipients: 20
    },
    {
      id: 4,
      recipient: 'উমরাহ গ্রাহক',
      message: 'উমরাহ প্যাকেজ ২০২৪ - বিশেষ ছাড়। এখনই বুকিং করুন।',
      sentDate: '২০২৪-০১-০৭ ১১:৪৫ AM',
      status: 'delivered',
      recipients: 89
    },
    {
      id: 5,
      recipient: 'এয়ার টিকেট গ্রাহক',
      message: 'আন্তর্জাতিক ফ্লাইটে বিশেষ ছাড়। সীমিত সময়ের অফার।',
      sentDate: '২০২৪-০১-০৬ ০৩:২০ PM',
      status: 'delivered',
      recipients: 320
    }
  ];

  const stats = [
    { 
      label: 'মোট এসএমএস পাঠানো', 
      value: '১২,৪৫০', 
      icon: MessageSquare, 
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-500'
    },
    { 
      label: 'ডেলিভার্ড', 
      value: '১১,৮৯০', 
      icon: CheckCircle, 
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'ব্যর্থ', 
      value: '৫৬০', 
      icon: XCircle, 
      color: 'red',
      gradient: 'from-red-500 to-pink-500'
    },
    { 
      label: 'বিচারাধীন', 
      value: '১২৫', 
      icon: Clock, 
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500'
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

  const filteredHistory = smsHistory.filter(sms => 
    sms.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sms.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const smsCount = Math.ceil(characterCount / 160);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">এসএমএস মার্কেটিং</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    আপনার গ্রাহকদের কাছে বাল্ক এসএমএস পাঠান এবং ডেলিভারি স্ট্যাটাস ট্র্যাক করুন
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">কন্টাক্ট ইম্পোর্ট</span>
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
                  onClick={() => setActiveTab('send')}
                  className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                    activeTab === 'send'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  এসএমএস পাঠান
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                    activeTab === 'history'
                      ? 'bg-green-600 text-white shadow-md'
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
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  বিশ্লেষণ
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'send' && (
              <div className="p-6">
                <form onSubmit={handleSendSMS} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      প্রাপক নির্বাচন করুন
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        বার্তা
                      </label>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          characterCount > 160 ? 'text-red-600 dark:text-red-400' : 
                          characterCount > 140 ? 'text-amber-600 dark:text-amber-400' : 
                          'text-gray-500 dark:text-gray-400'
                        }`}>
                          {toBengaliNumeral(characterCount)} / ১৬০ অক্ষর
                        </span>
                        {characterCount > 160 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({toBengaliNumeral(smsCount)} টি এসএমএস)
                          </span>
                        )}
                      </div>
                    </div>
                    <textarea
                      value={message}
                      onChange={handleMessageChange}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent font-sans resize-none"
                      placeholder="আপনার বার্তা এখানে লিখুন..."
                      required
                      maxLength={480}
                    />
                    <div className="mt-2 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ১৬০ অক্ষরের বেশি বার্তা একাধিক এসএমএসে বিভক্ত হবে
                      </p>
                    </div>
                  </div>

                  {/* Message Preview */}
                  {message && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">প্রিভিউ:</p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{message}</p>
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            প্রাপক: {recipientGroups.find(g => g.value === selectedGroup)?.label || 'নির্বাচন করুন'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            এসএমএস সংখ্যা: {toBengaliNumeral(smsCount)} | মোট অক্ষর: {toBengaliNumeral(characterCount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={isSending || !message.trim() || !selectedGroup}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          পাঠানো হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          এসএমএস পাঠান
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={!message.trim()}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ড্রাফট হিসেবে সংরক্ষণ
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
                        placeholder="এসএমএস ইতিহাস খুঁজুন..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

                {/* SMS History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">প্রাপক গ্রুপ</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">বার্তা</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">প্রাপক</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">তারিখ ও সময়</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <Search className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">কোন এসএমএস পাওয়া যায়নি</p>
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((sms) => (
                          <tr key={sms.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">#{sms.id}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-white">{sms.recipient}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md">
                              <div className="line-clamp-2" title={sms.message}>
                                {sms.message}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {toBengaliNumeral(sms.recipients)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{sms.sentDate}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                sms.status === 'delivered' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {sms.status === 'delivered' ? (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                                {sms.status === 'delivered' ? 'ডেলিভার্ড' : 'ব্যর্থ'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="p-12">
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">এসএমএস বিশ্লেষণ শীঘ্রই আসছে</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                    ডেলিভারি রেট, ব্যর্থতার কারণ এবং engagement metrics সহ বিস্তারিত বিশ্লেষণ এখানে উপলব্ধ হবে
                  </p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">ডেলিভারি রেট</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">এসএমএস ডেলিভারির পরিসংখ্যান</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">ব্যর্থতার কারণ</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ব্যর্থ এসএমএসের বিশ্লেষণ</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                      <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">সময়সূচী</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">সর্বোত্তম পাঠানোর সময়</p>
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

export default SmsMarketing;
