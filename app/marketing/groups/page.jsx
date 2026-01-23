'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Users,
  Edit,
  Trash2,
  MoreVertical,
  Tag,
  Calendar,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle,
  X
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

const Groups = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue'
  });

  // Fetch groups
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/contacts/groups');
      const data = await response.json();

      if (response.ok) {
        setGroups(data.groups || data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err.message || 'Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে গ্রুপের নাম লিখুন',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contacts/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'গ্রুপ সফলভাবে তৈরি করা হয়েছে',
          icon: 'success',
          confirmButtonColor: '#10B981',
        });
        setShowCreateModal(false);
        setFormData({ name: '', description: '', color: 'blue' });
        fetchGroups();
      } else {
        throw new Error(data.error || 'Failed to create group');
      }
    } catch (err) {
      console.error('Error creating group:', err);
      Swal.fire({
        title: 'ত্রুটি!',
        text: err.message || 'গ্রুপ তৈরি করতে ব্যর্থ হয়েছে',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে গ্রুপের নাম লিখুন',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/contacts/groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'গ্রুপ সফলভাবে আপডেট করা হয়েছে',
          icon: 'success',
          confirmButtonColor: '#10B981',
        });
        setEditingGroup(null);
        setFormData({ name: '', description: '', color: 'blue' });
        fetchGroups();
      } else {
        throw new Error(data.error || 'Failed to update group');
      }
    } catch (err) {
      console.error('Error updating group:', err);
      Swal.fire({
        title: 'ত্রুটি!',
        text: err.message || 'গ্রুপ আপডেট করতে ব্যর্থ হয়েছে',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "আপনি এটি ফিরিয়ে আনতে পারবেন না!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল করুন'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/contacts/groups/${groupId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'গ্রুপ সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonColor: '#10B981',
          });
          fetchGroups();
        } else {
          throw new Error(data.error || 'Failed to delete group');
        }
      } catch (err) {
        console.error('Error deleting group:', err);
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.message || 'গ্রুপ মুছে ফেলতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name || '',
      description: group.description || '',
      color: group.color || 'blue'
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingGroup(null);
    setFormData({ name: '', description: '', color: 'blue' });
  };

  const colors = [
    { name: 'blue', value: 'blue', bg: 'bg-blue-500', ring: 'ring-blue-500' },
    { name: 'green', value: 'green', bg: 'bg-green-500', ring: 'ring-green-500' },
    { name: 'purple', value: 'purple', bg: 'bg-purple-500', ring: 'ring-purple-500' },
    { name: 'orange', value: 'orange', bg: 'bg-orange-500', ring: 'ring-orange-500' },
    { name: 'red', value: 'red', bg: 'bg-red-500', ring: 'ring-red-500' },
    { name: 'yellow', value: 'yellow', bg: 'bg-yellow-500', ring: 'ring-yellow-500' },
    { name: 'indigo', value: 'indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
    { name: 'pink', value: 'pink', bg: 'bg-pink-500', ring: 'ring-pink-500' },
  ];

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { 
      label: 'মোট গ্রুপ', 
      value: groups.length, 
      color: 'blue', 
      icon: FolderOpen,
      gradient: 'from-blue-500 to-indigo-500'
    },
    { 
      label: 'মোট কন্টাক্ট', 
      value: groups.reduce((sum, g) => sum + (g.contactCount || 0), 0), 
      color: 'green', 
      icon: Users,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'সক্রিয় গ্রুপ', 
      value: groups.filter(g => g.status !== 'inactive').length, 
      color: 'purple', 
      icon: Tag,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'এই মাসে নতুন', 
      value: groups.filter(g => {
        const createdDate = new Date(g.createdDate || g.createdAt);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
      }).length, 
      color: 'orange', 
      icon: Plus,
      gradient: 'from-orange-500 to-amber-500'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
      green: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
      purple: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
      orange: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
      red: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
      yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400' },
      indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
      pink: { bg: 'bg-pink-100 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400' },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <FolderOpen className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">কন্টাক্ট গ্রুপ</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    টার্গেটেড মার্কেটিংয়ের জন্য আপনার কন্টাক্টগুলোকে গ্রুপে সংগঠিত করুন
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                নতুন গ্রুপ তৈরি করুন
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {isLoading ? '...' : toBengaliNumeral(stat.value?.toLocaleString())}
                    </p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} text-white flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="গ্রুপ খুঁজুন..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Groups Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">গ্রুপ লোড হচ্ছে...</p>
              </div>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {searchTerm ? 'কোন গ্রুপ পাওয়া যায়নি' : 'কোন গ্রুপ নেই'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                {searchTerm 
                  ? 'আপনার অনুসন্ধান পরিবর্তন করে চেষ্টা করুন'
                  : 'আপনার প্রথম গ্রুপ তৈরি করুন'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  নতুন গ্রুপ তৈরি করুন
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => {
                const colorClasses = getColorClasses(group.color);
                
                return (
                  <div 
                    key={group.id || group._id} 
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Group Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center`}>
                          <FolderOpen className={`w-6 h-6 ${colorClasses.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{group.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <Users className="w-3.5 h-3.5" />
                            {toBengaliNumeral(group.contactCount || 0)} কন্টাক্ট
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Group Description */}
                    {group.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {group.description}
                      </p>
                    )}

                    {/* Group Meta */}
                    <div className="space-y-2 mb-4">
                      {group.createdDate && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          তৈরি: {new Date(group.createdDate || group.createdAt).toLocaleDateString('bn-BD')}
                        </div>
                      )}
                      {group.lastUpdated && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Tag className="w-3.5 h-3.5" />
                          শেষ আপডেট: {new Date(group.lastUpdated || group.updatedAt).toLocaleDateString('bn-BD')}
                        </div>
                      )}
                    </div>

                    {/* Group Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-sm font-medium">
                        <UserPlus className="w-4 h-4" />
                        কন্টাক্ট যোগ করুন
                      </button>
                      <button 
                        onClick={() => handleEditGroup(group)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="সম্পাদনা"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteGroup(group.id || group._id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create/Edit Group Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
              <div 
                className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingGroup ? 'গ্রুপ সম্পাদনা করুন' : 'নতুন গ্রুপ তৈরি করুন'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      গ্রুপের নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="গ্রুপের নাম লিখুন..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      বিবরণ
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="গ্রুপের বিবরণ লিখুন..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      রঙ
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {colors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`w-10 h-10 rounded-full ${color.bg} hover:ring-2 hover:ring-offset-2 ${color.ring} transition-all ${
                            formData.color === color.value ? `ring-2 ring-offset-2 ${color.ring}` : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {editingGroup ? 'আপডেট হচ্ছে...' : 'তৈরি হচ্ছে...'}
                        </>
                      ) : (
                        editingGroup ? 'আপডেট করুন' : 'তৈরি করুন'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Groups;
