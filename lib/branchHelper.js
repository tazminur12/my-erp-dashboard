/**
 * Branch Helper Functions
 * Provides utilities for branch-wise data filtering and access control
 */

/**
 * Get branch filter query based on user session
 * Super Admin can see all branches, others see only their branch
 * 
 * @param {Object} session - User session from NextAuth
 * @param {boolean} allowAll - If true, super_admin gets no filter (all data)
 * @returns {Object} MongoDB query filter for branch
 */
export function getBranchFilter(session, allowAll = true) {
  // If no session or no branchId, return empty filter (show all)
  if (!session?.user?.branchId) {
    return {};
  }

  // Super admin can see all branches if allowAll is true
  if (session.user.role === 'super_admin' && allowAll) {
    return {};
  }

  // Regular users only see their branch data
  return { branchId: session.user.branchId };
}

/**
 * Get branch filter with optional branch override
 * Useful for super admin to filter by specific branch
 * 
 * @param {Object} session - User session from NextAuth
 * @param {string} selectedBranchId - Optional branch ID to filter (for super admin)
 * @returns {Object} MongoDB query filter for branch
 */
export function getBranchFilterWithOverride(session, selectedBranchId = null) {
  // If no session, return empty filter
  if (!session?.user) {
    return {};
  }

  // If super admin selected a specific branch
  if (session.user.role === 'super_admin' && selectedBranchId && selectedBranchId !== 'all') {
    return { branchId: selectedBranchId };
  }

  // If super admin selected "all" or no selection
  if (session.user.role === 'super_admin') {
    return {};
  }

  // Regular users only see their branch
  if (session.user.branchId) {
    return { branchId: session.user.branchId };
  }

  return {};
}

/**
 * Check if user can access a specific branch's data
 * 
 * @param {Object} session - User session from NextAuth
 * @param {string} targetBranchId - Branch ID to check access for
 * @returns {boolean} True if user can access the branch
 */
export function canAccessBranch(session, targetBranchId) {
  if (!session?.user) {
    return false;
  }

  // Super admin can access all branches
  if (session.user.role === 'super_admin') {
    return true;
  }

  // Regular users can only access their own branch
  return session.user.branchId === targetBranchId;
}

/**
 * Get branch info to add to new records
 * 
 * @param {Object} session - User session from NextAuth
 * @returns {Object} Branch info object with branchId and branchName
 */
export function getBranchInfo(session) {
  if (!session?.user) {
    return {
      branchId: '',
      branchName: '',
    };
  }

  return {
    branchId: session.user.branchId || '',
    branchName: session.user.branchName || '',
  };
}

/**
 * Check if user is super admin
 * 
 * @param {Object} session - User session from NextAuth
 * @returns {boolean} True if user is super admin
 */
export function isSuperAdmin(session) {
  return session?.user?.role === 'super_admin';
}

/**
 * Build aggregation pipeline match stage with branch filter
 * 
 * @param {Object} session - User session from NextAuth
 * @param {string} selectedBranchId - Optional branch ID for super admin
 * @param {Object} additionalMatch - Additional match conditions
 * @returns {Object} MongoDB match stage object
 */
export function buildBranchMatchStage(session, selectedBranchId = null, additionalMatch = {}) {
  const branchFilter = getBranchFilterWithOverride(session, selectedBranchId);
  return { ...branchFilter, ...additionalMatch };
}
