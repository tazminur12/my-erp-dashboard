'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function UserDetailsPage({ params }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Unwrap params
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setUserId(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user details');
        }

        setUser(data.user);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const getRoleLabel = (role) => {
    const roles = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      accountant: 'Accountant',
      reservation: 'Reservation',
      user: 'User'
    };
    return roles[role] || role;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading user details...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Error Loading User</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Link 
            href="/settings/users"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Users
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link 
            href="/settings/users"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              View detailed information about {user.name}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 px-8 py-10 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
              <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 text-white overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12" />
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20 uppercase tracking-wide`}>
                    {getRoleLabel(user.role)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    user.status === 'active' 
                      ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                      : 'bg-red-500/20 text-red-100 border border-red-400/30'
                  }`}>
                    {user.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">
              Contact & System Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <Phone className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <Building2 className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{user.branchName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role / Permission</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{getRoleLabel(user.role)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <Calendar className="h-5 w-5 text-indigo-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined Date</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {user.updated_at && (
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                      {new Date(user.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
