'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import Swal from 'sweetalert2';
import {
  Settings,
  Smartphone,
  Shield,
  Clock,
  Save,
  Loader2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    otpEnabled: true,
    otpExpiryMinutes: 5,
    maxOtpAttempts: 3,
    maintenanceMode: false,
    allowRegistration: false,
    sessionTimeoutMinutes: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/system');
      const data = await response.json();

      if (response.ok && data.success) {
        setSettings({
          otpEnabled: data.settings.otpEnabled ?? true,
          otpExpiryMinutes: data.settings.otpExpiryMinutes ?? 5,
          maxOtpAttempts: data.settings.maxOtpAttempts ?? 3,
          maintenanceMode: data.settings.maintenanceMode ?? false,
          allowRegistration: data.settings.allowRegistration ?? false,
          sessionTimeoutMinutes: data.settings.sessionTimeoutMinutes ?? 30,
        });
        setLastUpdated(data.settings.updatedAt);
      } else {
        throw new Error(data.error || 'Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'সেটিংস লোড করতে সমস্যা হয়েছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNumberChange = (key, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setSettings((prev) => ({
        ...prev,
        [key]: numValue,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/settings/system', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLastUpdated(data.settings.updatedAt);
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: 'সিস্টেম সেটিংস সফলভাবে আপডেট করা হয়েছে',
          confirmButtonColor: '#10B981',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.error || data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: error.message || 'সেটিংস সেভ করতে সমস্যা হয়েছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({ enabled, onToggle, disabled }) => (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">সেটিংস লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-7 h-7 text-blue-600" />
                সিস্টেম সেটিংস
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                সিস্টেমের বিভিন্ন ফিচার নিয়ন্ত্রণ করুন
              </p>
            </div>
            <button
              onClick={fetchSettings}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="রিফ্রেশ"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              সর্বশেষ আপডেট: {new Date(lastUpdated).toLocaleString('bn-BD')}
            </p>
          )}
        </div>

        {/* OTP Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  OTP সেটিংস
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  লগইন এর সময় OTP ভেরিফিকেশন নিয়ন্ত্রণ করুন
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* OTP Enable/Disable */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${settings.otpEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {settings.otpEnabled ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    OTP ভেরিফিকেশন
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.otpEnabled 
                      ? 'লগইন এর সময় SMS OTP প্রয়োজন হবে' 
                      : 'শুধুমাত্র পাসওয়ার্ড দিয়ে লগইন করা যাবে'}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                enabled={settings.otpEnabled}
                onToggle={() => handleToggle('otpEnabled')}
              />
            </div>

            {/* OTP Expiry Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    OTP মেয়াদ (মিনিট)
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    OTP কতক্ষণ বৈধ থাকবে
                  </p>
                </div>
              </div>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.otpExpiryMinutes}
                onChange={(e) => handleNumberChange('otpExpiryMinutes', e.target.value)}
                className="w-20 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Max OTP Attempts */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    সর্বোচ্চ চেষ্টা
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    কতবার ভুল OTP দেওয়া যাবে
                  </p>
                </div>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxOtpAttempts}
                onChange={(e) => handleNumberChange('maxOtpAttempts', e.target.value)}
                className="w-20 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Info Box */}
            {!settings.otpEnabled && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    সতর্কতা
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    OTP বন্ধ থাকলে শুধুমাত্র পাসওয়ার্ড দিয়ে লগইন করা যাবে। এটি নিরাপত্তা ঝুঁকি বাড়াতে পারে।
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  সিকিউরিটি সেটিংস
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  সিস্টেম নিরাপত্তা সংক্রান্ত সেটিংস
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Session Timeout */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    সেশন টাইমআউট (মিনিট)
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    নিষ্ক্রিয় থাকলে কতক্ষণ পর অটো লগআউট হবে
                  </p>
                </div>
              </div>
              <input
                type="number"
                min="5"
                max="1440"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) => handleNumberChange('sessionTimeoutMinutes', e.target.value)}
                className="w-20 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${settings.maintenanceMode ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <AlertTriangle className={`w-5 h-5 ${settings.maintenanceMode ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    মেইনটেনেন্স মোড
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.maintenanceMode 
                      ? 'সিস্টেম মেইনটেনেন্স এ আছে, শুধু এডমিন লগইন করতে পারবে' 
                      : 'সিস্টেম স্বাভাবিক অবস্থায় আছে'}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                enabled={settings.maintenanceMode}
                onToggle={() => handleToggle('maintenanceMode')}
              />
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                তথ্য
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                এই সেটিংস পরিবর্তন করলে সাথে সাথে কার্যকর হবে। OTP বন্ধ করলে ব্যবহারকারীরা শুধুমাত্র 
                ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করতে পারবে।
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                সংরক্ষণ করা হচ্ছে...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                সেটিংস সংরক্ষণ করুন
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
