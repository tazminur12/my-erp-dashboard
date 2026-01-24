'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from './useSession';

/**
 * Fetches current user's role, permissions, and moduleAccess from /api/roles/me.
 * User → Role → Permissions, ModuleAccess.
 */
export function useRoleAccess() {
  const { authenticated } = useSession();
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [moduleAccess, setModuleAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccess = useCallback(async () => {
    if (!authenticated) {
      setPermissions([]);
      setModuleAccess([]);
      setRole(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/roles/me');
      const data = await res.json();
      if (data.success) {
        setRole(data.role || null);
        setPermissions(data.permissions || []);
        setModuleAccess(data.moduleAccess || []);
      } else {
        setPermissions([]);
        setModuleAccess([]);
        setRole(null);
      }
    } catch (err) {
      console.error('useRoleAccess:', err);
      setError(err.message);
      setPermissions([]);
      setModuleAccess([]);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  const hasPermission = useCallback(
    (permissionId) => Array.isArray(permissions) && permissions.includes(permissionId),
    [permissions]
  );

  const hasModuleAccess = useCallback(
    (moduleId) => Array.isArray(moduleAccess) && moduleAccess.includes(moduleId),
    [moduleAccess]
  );

  return {
    role,
    permissions,
    moduleAccess,
    loading,
    error,
    hasPermission,
    hasModuleAccess,
    refetch: fetchAccess,
  };
}
