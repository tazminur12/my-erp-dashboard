/**
 * Permission & Module definitions
 * Best practice: Role → Permissions, User → Role (no direct user permissions)
 * Permission types: view, create, edit, delete (+ approve, export where applicable)
 */

export const PERMISSION_TYPES = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
};

export const MODULES = [
  { id: 'dashboard', name: 'Dashboard', nameBn: 'ড্যাশবোর্ড' },
  { id: 'transactions', name: 'Transactions', nameBn: 'লেনদেন' },
  { id: 'customers', name: 'Customers', nameBn: 'কাস্টমার' },
  { id: 'agents', name: 'Agents', nameBn: 'এজেন্ট' },
  { id: 'ledger', name: 'Ledger', nameBn: 'খাতা' },
  { id: 'reports', name: 'Reports', nameBn: 'রিপোর্ট' },
  { id: 'audit', name: 'Audit', nameBn: 'অডিট' },
  { id: 'settings', name: 'Settings', nameBn: 'সেটিংস' },
];

/**
 * Default permissions per module.
 * Each module can have: view, create, edit, delete, approve, export
 */
export const DEFAULT_PERMISSIONS = [
  { id: 'dashboard:view', module: 'dashboard', type: 'view', name: 'View Dashboard', nameBn: 'ড্যাশবোর্ড দেখুন' },
  { id: 'transactions:view', module: 'transactions', type: 'view', name: 'View Transactions', nameBn: 'লেনদেন দেখুন' },
  { id: 'transactions:create', module: 'transactions', type: 'create', name: 'Create Transaction', nameBn: 'লেনদেন তৈরি' },
  { id: 'transactions:edit', module: 'transactions', type: 'edit', name: 'Edit Transaction', nameBn: 'লেনদেন সম্পাদনা' },
  { id: 'transactions:delete', module: 'transactions', type: 'delete', name: 'Delete Transaction', nameBn: 'লেনদেন মুছুন' },
  { id: 'transactions:approve', module: 'transactions', type: 'approve', name: 'Approve Transaction', nameBn: 'লেনদেন অনুমোদন' },
  { id: 'customers:view', module: 'customers', type: 'view', name: 'View Customers', nameBn: 'কাস্টমার দেখুন' },
  { id: 'customers:create', module: 'customers', type: 'create', name: 'Create Customer', nameBn: 'কাস্টমার তৈরি' },
  { id: 'customers:edit', module: 'customers', type: 'edit', name: 'Edit Customer', nameBn: 'কাস্টমার সম্পাদনা' },
  { id: 'customers:delete', module: 'customers', type: 'delete', name: 'Delete Customer', nameBn: 'কাস্টমার মুছুন' },
  { id: 'agents:view', module: 'agents', type: 'view', name: 'View Agents', nameBn: 'এজেন্ট দেখুন' },
  { id: 'agents:create', module: 'agents', type: 'create', name: 'Create Agent', nameBn: 'এজেন্ট তৈরি' },
  { id: 'agents:edit', module: 'agents', type: 'edit', name: 'Edit Agent', nameBn: 'এজেন্ট সম্পাদনা' },
  { id: 'agents:delete', module: 'agents', type: 'delete', name: 'Delete Agent', nameBn: 'এজেন্ট মুছুন' },
  { id: 'ledger:view', module: 'ledger', type: 'view', name: 'View Ledger', nameBn: 'খাতা দেখুন' },
  { id: 'ledger:create', module: 'ledger', type: 'create', name: 'Create Ledger Entry', nameBn: 'খাতার এন্ট্রি তৈরি' },
  { id: 'ledger:edit', module: 'ledger', type: 'edit', name: 'Edit Ledger', nameBn: 'খাতা সম্পাদনা' },
  { id: 'ledger:delete', module: 'ledger', type: 'delete', name: 'Delete Ledger Entry', nameBn: 'খাতার এন্ট্রি মুছুন' },
  { id: 'reports:view', module: 'reports', type: 'view', name: 'View Reports', nameBn: 'রিপোর্ট দেখুন' },
  { id: 'reports:export', module: 'reports', type: 'export', name: 'Export Reports', nameBn: 'রিপোর্ট এক্সপোর্ট' },
  { id: 'audit:view', module: 'audit', type: 'view', name: 'View Audit Logs', nameBn: 'অডিট লগ দেখুন' },
  { id: 'audit:export', module: 'audit', type: 'export', name: 'Export Audit Logs', nameBn: 'অডিট লগ এক্সপোর্ট' },
  { id: 'settings:view', module: 'settings', type: 'view', name: 'View Settings', nameBn: 'সেটিংস দেখুন' },
  { id: 'settings:create', module: 'settings', type: 'create', name: 'Manage Users/Roles', nameBn: 'ব্যবহারকারী/ভূমিকা পরিচালনা' },
  { id: 'settings:edit', module: 'settings', type: 'edit', name: 'Edit Settings', nameBn: 'সেটিংস সম্পাদনা' },
  { id: 'settings:delete', module: 'settings', type: 'delete', name: 'Delete Settings Data', nameBn: 'সেটিংস ডেটা মুছুন' },
];

/**
 * Map sidebar navigation keys to module IDs for access control
 */
export const NAV_TO_MODULE = {
  dashboard: 'dashboard',
  transactions: 'transactions',
  vendors: 'customers',
  'hajj-umrah': 'customers',
  'air-ticketing': 'customers',
  'additional-services': 'customers',
  'hajj-umrah-b2b': 'agents',
  'air-agents': 'agents',
  loan: 'ledger',
  account: 'ledger',
  'miraj-industries': 'reports',
  'office-management': 'ledger',
  'money-exchange': 'ledger',
  marketing: 'reports',
  settings: 'settings',
  profile: 'dashboard', // always visible
  logout: 'dashboard',  // always visible
};

export const DEFAULT_ROLES = [
  { slug: 'super_admin', name: 'Super Admin', nameBn: 'সুপার অ্যাডমিন', permissions: DEFAULT_PERMISSIONS.map((p) => p.id), moduleAccess: MODULES.map((m) => m.id) },
  { slug: 'admin', name: 'Admin', nameBn: 'অ্যাডমিন', permissions: DEFAULT_PERMISSIONS.map((p) => p.id), moduleAccess: MODULES.map((m) => m.id) },
  { slug: 'manager', name: 'Manager', nameBn: 'ম্যানেজার', permissions: DEFAULT_PERMISSIONS.filter(p => p.module !== 'settings' && p.module !== 'audit').map((p) => p.id), moduleAccess: MODULES.filter(m => m.id !== 'settings' && m.id !== 'audit').map((m) => m.id) },
  { slug: 'accountant', name: 'Accountant', nameBn: 'হিসাবরক্ষক', permissions: ['dashboard:view', 'transactions:view', 'transactions:create', 'transactions:edit', 'ledger:view', 'reports:view', 'reports:export'], moduleAccess: ['dashboard', 'transactions', 'ledger', 'reports'] },
  { slug: 'reservation', name: 'Reservation', nameBn: 'রিজার্ভেশন', permissions: ['dashboard:view', 'customers:view', 'customers:create', 'customers:edit', 'agents:view'], moduleAccess: ['dashboard', 'customers', 'agents'] },
];

export function getModules() {
  return MODULES;
}

export function getPermissions() {
  return DEFAULT_PERMISSIONS;
}

export function getPermissionsByModule() {
  const byModule = {};
  DEFAULT_PERMISSIONS.forEach((p) => {
    if (!byModule[p.module]) byModule[p.module] = [];
    byModule[p.module].push(p);
  });
  return byModule;
}
