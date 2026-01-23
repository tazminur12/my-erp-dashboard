'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  FileText,
  Loader2,
  Building,
  Globe,
  CheckCircle,
  XCircle,
  Copy,
  CreditCard,
} from 'lucide-react';
import DashboardLayout from '../../../component/DashboardLayout';
import Swal from 'sweetalert2';

const CustomerDetails = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // Loading and data states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/other-customers/${id}`);
        const data = await response.json();

        if (response.ok) {
          setCustomer(data.customer || data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch customer');
        }
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError(err.message || 'Failed to load customer');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleCopyId = (customerId) => {
    navigator.clipboard.writeText(customerId).then(() => {
      Swal.fire({
        title: 'কপি সফল!',
        text: 'Customer ID কপি করা হয়েছে',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      });
    }).catch(() => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ID কপি করতে সমস্যা হয়েছে',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      });
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !customer) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-4">
                  {error?.message || 'Customer not found'}
                </p>
                {id && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Customer ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{id}</code>
                  </p>
                )}
                <button
                  onClick={() => router.push('/additional-services/customer-list')}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Back to Customer List
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const fullName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim();

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/additional-services/customer-list')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Customer List
            </button>
            <div className="flex justify-between items-start">
              <div>
                {/* Customer ID Badge */}
                <div className="mb-3">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-mono font-semibold">
                      {customer.customerId || customer.id || customer._id}
                    </span>
                    <button
                      onClick={() => handleCopyId(customer.customerId || customer.id || customer._id)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5 transition-colors"
                      title="Copy ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Customer Details</p>
              </div>
              <button
                onClick={() => router.push(`/additional-services/customer/edit/${id}`)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Customer
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</label>
                    <p className="text-gray-900 dark:text-white mt-1">{customer.firstName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</label>
                    <p className="text-gray-900 dark:text-white mt-1">{customer.lastName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                    <p className="text-gray-900 dark:text-white mt-1">{fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.status === 'active' || customer.isActive !== false
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                        }`}
                      >
                        {customer.status === 'active' || customer.isActive !== false ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </h2>
                <div className="space-y-4">
                  {customer.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                        <p className="text-gray-900 dark:text-white mt-1">
                          <a
                            href={`tel:${customer.phone}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {customer.phone}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                        <p className="text-gray-900 dark:text-white mt-1">
                          <a
                            href={`mailto:${customer.email}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {customer.email}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Information */}
              {(customer.address || customer.city || customer.country) && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Information
                  </h2>
                  <div className="space-y-4">
                    {customer.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                          <p className="text-gray-900 dark:text-white mt-1">{customer.address}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customer.city && (
                        <div className="flex items-start gap-3">
                          <Building className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City</label>
                            <p className="text-gray-900 dark:text-white mt-1">{customer.city}</p>
                          </div>
                        </div>
                      )}
                      {customer.country && (
                        <div className="flex items-start gap-3">
                          <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</label>
                            <p className="text-gray-900 dark:text-white mt-1">{customer.country}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {customer.notes && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{customer.notes}</p>
                </div>
              )}
            </div>

            {/* Right Column - Metadata */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push(`/additional-services/customer/edit/${id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Customer
                  </button>
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone}`}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Call Customer
                    </a>
                  )}
                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </a>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Metadata</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4" />
                      Customer ID
                    </label>
                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-blue-900 dark:text-blue-400 font-mono text-sm font-semibold flex-1">
                        {customer.customerId || customer.id || customer._id}
                      </p>
                      <button
                        onClick={() => handleCopyId(customer.customerId || customer.id || customer._id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
                        title="Copy ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {customer.createdAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        Created At
                      </label>
                      <p className="text-gray-900 dark:text-white">{formatDate(customer.createdAt)}</p>
                    </div>
                  )}
                  {customer.updatedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        Last Updated
                      </label>
                      <p className="text-gray-900 dark:text-white">{formatDate(customer.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetails;
