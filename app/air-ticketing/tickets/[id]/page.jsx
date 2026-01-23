'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../component/DashboardLayout';
import { Calendar, Plane, User, ArrowLeft, Edit, Receipt, Phone, MapPin, RefreshCcw, Loader2 } from 'lucide-react';

const Field = ({ label, value }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value || '-'}</span>
  </div>
);

const TicketDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);

  // Log the ID when component mounts or ID changes
  useEffect(() => {
    if (id) {
      console.log('TicketDetails - ID from params:', id, typeof id);
    }
  }, [id]);

  const fetchTicket = async () => {
    if (!id) return;
    
    setIsRefetching(true);
    setError(null);
    try {
      console.log('Fetching ticket with ID:', id);
      const response = await fetch(`/api/air-tickets/${encodeURIComponent(id)}`);
      const result = await response.json();

      console.log('API Response:', { status: response.status, result });

      if (response.ok) {
        setTicket(result.ticket || result.data);
      } else {
        const errorMessage = result.error || result.message || 'Failed to fetch ticket';
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchTicket();
    }
  }, [id]);

  if (!id) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center space-y-3">
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">Ticket ID missing.</p>
          <p className="text-gray-600 dark:text-gray-300">Please open this page from the ticket list.</p>
          <button
            onClick={() => router.push('/air-ticketing/tickets')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to tickets
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="text-gray-600 dark:text-gray-300">Loading ticket...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !ticket) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center space-y-3">
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">Unable to load ticket.</p>
          <p className="text-gray-600 dark:text-gray-300">{error?.message || 'Ticket not found.'}</p>
          {id && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Ticket ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{id}</code>
            </p>
          )}
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/air-ticketing/tickets')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to tickets
            </button>
            <button
              onClick={fetchTicket}
              disabled={isRefetching}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/air-ticketing/tickets')}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Ticket Details</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Booking ID: {ticket.bookingId || ticket.ticketId || ticket._id}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchTicket}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2"
              >
                <RefreshCcw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <Link
                href={`/air-ticketing/tickets/${ticket._id || ticket.ticketId || ticket.bookingId}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Link>
              <Link
                href="/air-ticketing/invoice"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
              >
                <Receipt className="w-4 h-4" />
                <span>Invoice</span>
              </Link>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Route</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {(ticket.origin || 'N/A')} → {(ticket.destination || 'N/A')}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Flight Date</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(ticket.flightDate)}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Customer</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.customerName || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking & passenger */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Passenger</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Name" value={ticket.customerName} />
                  <Field label="Phone" value={ticket.customerPhone} />
                  <Field label="Purpose" value={ticket.purposeType} />
                  <Field label="Trip Type" value={ticket.tripType} />
                  <Field label="Flight Type" value={ticket.flightType} />
                  <Field label="Status" value={ticket.status} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Plane className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Itinerary</h2>
                </div>
                {ticket.tripType === 'multicity' ? (
                  <div className="space-y-3">
                    {(ticket.segments || []).map((seg, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-800 dark:text-gray-200">
                            {seg.origin || '-'} → {seg.destination || '-'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(seg.date)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Origin" value={ticket.origin} />
                    <Field label="Destination" value={ticket.destination} />
                    <Field label="Return Date" value={formatDate(ticket.returnDate)} />
                  </div>
                )}
              </div>
            </div>

            {/* Finance */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Finance</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Customer Deal" value={ticket.customerDeal ? `৳${ticket.customerDeal.toLocaleString()}` : '-'} />
                  <Field label="Customer Paid" value={ticket.customerPaid ? `৳${ticket.customerPaid.toLocaleString()}` : '-'} />
                  <Field label="Customer Due" value={ticket.customerDue ? `৳${ticket.customerDue.toLocaleString()}` : '-'} />
                  <Field label="Vendor Amount" value={ticket.vendorAmount ? `৳${ticket.vendorAmount.toLocaleString()}` : '-'} />
                  <Field label="Vendor Paid" value={ticket.vendorPaidFh ? `৳${ticket.vendorPaidFh.toLocaleString()}` : '-'} />
                  <Field label="Vendor Due" value={ticket.vendorDue ? `৳${ticket.vendorDue.toLocaleString()}` : '-'} />
                  <Field label="Profit" value={ticket.profit ? `৳${ticket.profit.toLocaleString()}` : '-'} />
                  <Field label="Due Date" value={formatDate(ticket.dueDate)} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agent & Airline</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Agent" value={ticket.agent} />
                  <Field label="Airline" value={ticket.airline} />
                  <Field label="Booking Date" value={formatDate(ticket.date)} />
                  <Field label="PNR (GDS)" value={ticket.gdsPnr} />
                  <Field label="PNR (Airline)" value={ticket.airlinePnr} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TicketDetails;
