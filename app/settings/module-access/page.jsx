'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import {
  LayoutDashboard,
  Save,
  Loader2,
  Users,
  Check,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { MODULES } from '@/lib/permissions';

export default function ModuleAccessPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [roleModuleAccess, setRoleModuleAccess] = useState(new Set());

  const fetchRoles = useCallback(async () => {
    const res = await fetch('/api/roles');
    const data = await res.json();
    if (data.success) {
      setRoles(data.roles || []);
      if (data.roles?.length && !selectedRoleId) {
        setSelectedRoleId(data.roles[0].id);
      }
    }
  }, [selectedRoleId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchRoles();
      setLoading(false);
    })();
  }, [fetchRoles]);

  useEffect(() => {
    if (!selectedRoleId) return;
    (async () => {
      const res = await fetch(`/api/roles/${selectedRoleId}`);
      const data = await res.json();
      if (data.success && data.role) {
        setRoleModuleAccess(new Set(data.role.moduleAccess || []));
      }
    })();
  }, [selectedRoleId]);

  const toggleModule = (modId) => {
    setRoleModuleAccess((prev) => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  };

  const selectAll = () => {
    const all = MODULES.map((m) => m.id);
    const allSelected = all.every((id) => roleModuleAccess.has(id));
    if (allSelected) setRoleModuleAccess(new Set());
    else setRoleModuleAccess(new Set(all));
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/roles/${selectedRoleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleAccess: Array.from(roleModuleAccess) }),
      });
      const data = await res.json();
      if (data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'সংরক্ষণ হয়েছে',
          text: 'মডিউল অ্যাক্সেস সফলভাবে আপডেট হয়েছে। সাইডবার মেনু এই অ্যাক্সেস অনুযায়ী দেখাবে।',
          confirmButtonColor: '#3b82f6',
        });
        fetchRoles();
      } else {
        throw new Error(data.error || 'সংরক্ষণ ব্যর্থ');
      }
    } catch (e) {
      await Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: e.message || 'মডিউল অ্যাক্সেস সংরক্ষণ করতে ব্যর্থ।',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">লোড হচ্ছে...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-blue-600" />
            মডিউল অ্যাক্সেস
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            কোন ভূমিকা কোন মডিউল দেখতে পাবে তা সেট করুন। সাইডবার মেনু এই অ্যাক্সেস অনুযায়ী দেখাবে/লুকাবে।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                ভূমিকা নির্বাচন করুন
              </h2>
              <div className="space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedRoleId === r.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {r.nameBn || r.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {!selectedRole ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  একটি ভূমিকা নির্বাচন করুন
                </div>
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedRole.nameBn || selectedRole.name} — মডিউল অ্যাক্সেস
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAll}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        সব নির্বাচন/অপসারণ
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        সংরক্ষণ
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {MODULES.map((mod) => {
                        const hasAccess = roleModuleAccess.has(mod.id);
                        return (
                          <label
                            key={mod.id}
                            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                              hasAccess
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={hasAccess}
                              onChange={() => toggleModule(mod.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-medium text-gray-900 dark:text-white flex-1">
                              {mod.nameBn || mod.name}
                            </span>
                            {hasAccess ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <X className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
