'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import {
  Shield,
  Save,
  Loader2,
  ChevronDown,
  ChevronRight,
  Users,
  Check,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function PermissionManagementPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [permissionsByModule, setPermissionsByModule] = useState({});
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [rolePermissions, setRolePermissions] = useState(() => new Set());
  const [expandedModules, setExpandedModules] = useState({});

  const fetchPermissions = useCallback(async () => {
    const res = await fetch('/api/permissions');
    const data = await res.json();
    if (data.success) {
      setPermissions(data.permissions || []);
      setPermissionsByModule(data.permissionsByModule || {});
      setModules(data.modules || []);
    }
  }, []);

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
      await Promise.all([fetchPermissions(), fetchRoles()]);
      setLoading(false);
    })();
  }, [fetchPermissions, fetchRoles]);

  useEffect(() => {
    if (!selectedRoleId) return;
    (async () => {
      const res = await fetch(`/api/roles/${selectedRoleId}`);
      const data = await res.json();
      if (data.success && data.role) {
        const set = new Set(data.role.permissions || []);
        setRolePermissions(set);
      }
    })();
  }, [selectedRoleId]);

  const togglePermission = (permId) => {
    setRolePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleModuleExpand = (modId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const selectAllInModule = (modId) => {
    const perms = permissionsByModule[modId] || [];
    const ids = perms.map((p) => p.id);
    const allSelected = ids.every((id) => rolePermissions.has(id));
    setRolePermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/roles/${selectedRoleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: Array.from(rolePermissions) }),
      });
      const data = await res.json();
      if (data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'সংরক্ষণ হয়েছে',
          text: 'অনুমতিসমূহ সফলভাবে আপডেট হয়েছে।',
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
        text: e.message || 'অনুমতি সংরক্ষণ করতে ব্যর্থ।',
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-600" />
            অনুমতি ব্যবস্থাপনা
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            ভূমিকা অনুযায়ী অনুমতি (View, Create, Edit, Delete) সেট করুন। ব্যবহারকারী → ভূমিকা → অনুমতি।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role selector */}
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

          {/* Permissions by module */}
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
                      {selectedRole.nameBn || selectedRole.name} — অনুমতিসমূহ
                    </span>
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
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {modules.map((mod) => {
                      const perms = permissionsByModule[mod.id] || [];
                      const expanded = expandedModules[mod.id] !== false;
                      const allSelected = perms.length > 0 && perms.every((p) => rolePermissions.has(p.id));
                      return (
                        <div
                          key={mod.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg mb-3 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleModuleExpand(mod.id)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <span className="font-medium text-gray-900 dark:text-white">
                              {mod.nameBn || mod.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectAllInModule(mod.id);
                                }}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {allSelected ? 'সব অপসারণ' : 'সব নির্বাচন'}
                              </button>
                              {expanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </button>
                          {expanded && (
                            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white dark:bg-gray-800">
                              {perms.map((p) => {
                                const checked = rolePermissions.has(p.id);
                                return (
                                  <label
                                    key={p.id}
                                    className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => togglePermission(p.id)}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {p.nameBn || p.name}
                                    </span>
                                    {checked ? (
                                      <Check className="h-4 w-4 text-green-500 ml-auto" />
                                    ) : (
                                      <X className="h-4 w-4 text-gray-300 dark:text-gray-600 ml-auto" />
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
