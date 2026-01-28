'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../../../component/DashboardLayout';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

const roles = [
  { value: 'super_admin', label: 'Super Admin', bn: 'সুপার অ্যাডমিন' },
  { value: 'admin', label: 'Admin', bn: 'অ্যাডমিন' },
  { value: 'manager', label: 'Manager', bn: 'ম্যানেজার' },
  { value: 'accountant', label: 'Accountant', bn: 'হিসাবরক্ষক' },
  { value: 'reservation', label: 'Reservation', bn: 'রিজার্ভেশন' },
];

export default function AddUserPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'reservation',
    branchId: '',
    isEmployee: false,
    employeeId: '',
    password: '',
    confirmPassword: '',
  });

  const fetchBranches = useCallback(async () => {
    try {
      const response = await fetch('/api/branches?status=active');
      const responseData = await response.json();

      if (response.ok) {
        setBranches(responseData.branches || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  }, []);

  const fetchEmployees = useCallback(async (branchId) => {
    try {
      let url = '/api/employees?status=active';
      if (branchId) {
        url += `&branch=${branchId}`;
      }
      const response = await fetch(url);
      const responseData = await response.json();

      if (response.ok) {
        setEmployees(responseData.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (formData.branchId) {
      fetchEmployees(formData.branchId);
    } else {
      setEmployees([]);
    }
  }, [formData.branchId, fetchEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        Swal.fire({
          icon: 'error',
          title: 'Password Mismatch',
          text: 'Passwords do not match. Please try again.',
          confirmButtonColor: '#3b82f6',
        });
        setSubmitting(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        Swal.fire({
          icon: 'error',
          title: 'Invalid Password',
          text: 'Password must be at least 6 characters long.',
          confirmButtonColor: '#3b82f6',
        });
        setSubmitting(false);
        return;
      }

      // Find selected branch name
      const selectedBranch = branches.find(b => b.id === formData.branchId);
      const branchName = selectedBranch?.name || selectedBranch?.branchName || '';

      // Create new user via API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          branchId: formData.branchId,
          branchName: branchName,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'User Created!',
        text: 'New user has been created successfully.',
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: true,
      });

      // Redirect to users list
      router.push('/settings/users');
      
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.message || 'Failed to save user. Please try again.');
      
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: error.message || 'Failed to save user. Please try again.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center space-x-4">
          <Link 
            href="/settings/users"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New User
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add a new user to the system
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Branch Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch
              </label>
              <select
                required
                value={formData.branchId}
                onChange={(e) =>
                  setFormData({ ...formData, branchId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name || branch.branchName}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isEmployee"
                checked={formData.isEmployee}
                onChange={(e) => setFormData({ ...formData, isEmployee: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isEmployee" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                Is this user an Employee?
              </label>
            </div>

            {/* Employee Selection */}
            {formData.isEmployee && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Employee
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => {
                    const empId = e.target.value;
                    const selectedEmp = employees.find(emp => emp._id === empId || emp.id === empId);
                    
                    if (selectedEmp) {
                      setFormData({
                        ...formData,
                        employeeId: empId,
                        name: selectedEmp.name || selectedEmp.fullName || '',
                        email: selectedEmp.email || '',
                        phone: selectedEmp.phone || selectedEmp.mobile || '',
                      });
                    } else {
                      setFormData({
                        ...formData,
                        employeeId: '',
                        name: '',
                        email: '',
                        phone: '',
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id || emp.id} value={emp._id || emp.id}>
                      {emp.name || emp.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                {roles
                  .filter(role => session?.user?.role === 'super_admin' || role.value !== 'super_admin')
                  .map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label} ({role.bn})
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/settings/users"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create User</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
