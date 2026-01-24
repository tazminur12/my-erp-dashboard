'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import { ArrowLeft, User, Phone, Users, Loader2, XCircle, AlertCircle } from 'lucide-react';

const relationshipLabels = {
  brother: 'ভাই',
  sister: 'বোন',
  aunt: 'ফুফি',
  son: 'ছেলে',
  daughter: 'মেয়ে'
};

const PersonalExpenseDetails = () => {
  const params = useParams();
  const id = params?.id;
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState(null);
  const [showAllTx, setShowAllTx] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setError(new Error('Profile ID is required'));
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch(`/api/personal-expense/${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || data.error || 'প্রোফাইল পাওয়া যায়নি');
        }
        setProfile(data.item || data.data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!id) return;
      try {
        setTxLoading(true);
        const response = await fetch(`/api/transactions?scope=personal-expense&personalExpenseProfileId=${id}&limit=50`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || data.error || 'ট্রানজেকশন পাওয়া যায়নি');
        }
        setTransactions(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setTxError(err);
      } finally {
        setTxLoading(false);
      }
    };
    fetchTransactions();
  }, [id]);

  const totalTaken = useMemo(() => {
    const txSum = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    if (transactions.length > 0) return txSum;
    if (typeof profile?.totalTaken === 'number') return profile.totalTaken;
    return txSum;
  }, [profile?.totalTaken, transactions]);

  const visibleTransactions = useMemo(() => {
    if (showAllTx) return transactions;
    return transactions.slice(0, 8);
  }, [showAllTx, transactions]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">প্রোফাইল লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error?.message || 'প্রোফাইল পাওয়া যায়নি'}</p>
              <Link
                href="/personal/expense"
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <Link
              href="/personal/expense"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">Personal Expense প্রোফাইল বিস্তারিত</p>
            </div>
          </div>

          <Link
            href={`/personal/expense/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2.5"
          >
            Edit
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-24 h-24 rounded-2xl object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{profile.name}</p>
                <div className="flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    {relationshipLabels[profile.relationship] || profile.relationship}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {profile.mobile}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">মোট নেওয়া</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ৳{Number(totalTaken || 0).toLocaleString('bn-BD')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">মোট নেওয়া</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-red-600 dark:text-red-400" />
              ব্যক্তিগত তথ্য
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                <p className="text-gray-500 dark:text-gray-400 mb-1">পিতার নাম</p>
                <p className="text-gray-900 dark:text-white">{profile.fatherName || '—'}</p>
              </div>
              <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                <p className="text-gray-500 dark:text-gray-400 mb-1">মাতার নাম</p>
                <p className="text-gray-900 dark:text-white">{profile.motherName || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">লেনদেন সারাংশ</h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>মোট নেওয়া</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ৳{Number(totalTaken || 0).toLocaleString('bn-BD')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>মোট ট্রানজেকশন</span>
                <span className="font-semibold text-gray-900 dark:text-white">{transactions.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">ট্রানজেকশন হিস্ট্রি</h2>
            {transactions.length > 8 && (
              <button
                onClick={() => setShowAllTx((prev) => !prev)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                {showAllTx ? 'কম দেখান' : 'সব দেখুন'}
              </button>
            )}
          </div>

          {txLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              ট্রানজেকশন লোড হচ্ছে...
            </div>
          )}

          {!txLoading && txError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {txError?.message || 'ট্রানজেকশন লোড করা যায়নি'}
            </p>
          )}

          {!txLoading && !txError && transactions.length === 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">এখনও কোনো ট্রানজেকশন নেই।</p>
          )}

          {!txLoading && !txError && transactions.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {visibleTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tx.description || tx.notes || 'Personal Expense'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {tx.date || '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    {(tx.description || tx.notes) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {tx.description || tx.notes}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      ৳{Number(tx.amount || 0).toLocaleString('bn-BD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PersonalExpenseDetails;
