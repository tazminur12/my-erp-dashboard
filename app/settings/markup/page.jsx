'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import Modal from '../../component/Modal';
import { Plus, Edit, Trash2, Search, DollarSign, Percent, Save, X, Loader2, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

const MarkupManagement = () => {
  const [markups, setMarkups] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMarkup, setEditingMarkup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial State matching the complex form
  const initialFormState = {
    provider: 'SABRE BD',
    priority: 0,
    origin: 'DAC',
    is_include_origin: true,
    is_exclude_origin: false,
    
    is_outbound: true,
    is_inbound: false,
    is_freedom: false,

    airlines: '', // Textarea: H9
    is_suspend_airline: false,

    fly_type: 'intl', // any, intl, domestic
    
    applied_on: 'always', // always, specific
    
    routes: '', // Textarea
    cabin_classes: '', // Textarea
    fare_basis: '', // Textarea
    
    status: 'active', // active, inactive

    // Right Column
    commission_provision: '0.00',
    commission_less_applied: '0.00',
    commission_type: 'percentage', // percentage, fixed

    plb_commission_less_applied: '0.00',

    markup_value: '0.00',
    markup_type: 'percentage', // percentage, fixed

    segment_cashback: '0.00',

    service_charge: '0',
    service_charge_type: 'pnr_wise', // pnr_wise, ticket_wise

    date_change_charge: '0.00',
    refund_charge: '0.00'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch Markups
  const fetchMarkups = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/markup');
      const data = await response.json();
      if (data.success) {
        setMarkups(data.data);
      }
    } catch (error) {
      console.error('Error fetching markups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Airlines for dropdown (optional, kept for reference)
  const fetchAirlines = async () => {
    try {
      const response = await fetch('/api/airlines?limit=1000');
      const data = await response.json();
      if (data.airlines) {
        setAirlines(data.airlines);
      }
    } catch (error) {
      console.error('Error fetching airlines:', error);
    }
  };

  useEffect(() => {
    fetchMarkups();
    fetchAirlines();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingMarkup 
        ? `/api/settings/markup/${editingMarkup._id}`
        : '/api/settings/markup';
      
      const method = editingMarkup ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Markup ${editingMarkup ? 'updated' : 'added'} successfully`,
          timer: 1500
        });
        setIsModalOpen(false);
        fetchMarkups();
        resetForm();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/settings/markup/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
          Swal.fire('Deleted!', 'Markup has been deleted.', 'success');
          fetchMarkups();
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingMarkup(null);
  };

  const openEditModal = (markup) => {
    setEditingMarkup(markup);
    setFormData({ ...initialFormState, ...markup });
    setIsModalOpen(true);
  };

  const filteredMarkups = markups.filter(m => 
    (m.airlines || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.origin || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-blue-600" />
              Markup Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Configure advanced markup rules</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Markup
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Airline or Origin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Table List View */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-gray-500">Loading rules...</p>
            </div>
          ) : filteredMarkups.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No markup rules found. Add one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Airline(s)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Origin</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Markup</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMarkups.map((markup) => (
                    <tr key={markup._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {markup.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {markup.airlines || 'All Airlines'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {markup.origin || 'Any'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600">
                          {markup.markup_value} {markup.markup_type === 'percentage' ? '%' : 'Fixed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          markup.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {markup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/settings/markup/${markup._id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(markup)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(markup._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Large Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-5xl rounded-lg bg-white dark:bg-gray-800 shadow-xl my-8 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-[#78A738] text-white px-6 py-4 rounded-t-lg flex justify-between items-center flex-shrink-0">
                  <h2 className="text-lg font-bold uppercase tracking-wide">Flights Markup</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="overflow-y-auto p-6 flex-grow">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* LEFT COLUMN */}
                  <div className="space-y-4">
                    {/* Provider */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start sm:items-center">
                      <label className="font-semibold text-sm sm:pt-0">Provider</label>
                      <select 
                        className="col-span-2 w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        value={formData.provider}
                        onChange={(e) => setFormData({...formData, provider: e.target.value})}
                      >
                        <option value="SABRE BD">SABRE BD</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start sm:items-center">
                      <label className="font-semibold text-sm sm:pt-0">Priority</label>
                      <input 
                        type="number" 
                        className="col-span-2 w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      />
                    </div>

                    {/* Origin */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
                      <label className="font-semibold text-sm pt-0 sm:pt-2">Origin</label>
                      <div className="col-span-2 space-y-2">
                        <textarea 
                          className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600" 
                          rows="2"
                          placeholder="DAC"
                          value={formData.origin}
                          onChange={(e) => setFormData({...formData, origin: e.target.value})}
                        />
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input 
                              type="checkbox" 
                              checked={formData.is_include_origin}
                              onChange={(e) => setFormData({...formData, is_include_origin: e.target.checked})}
                            /> Include
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input 
                              type="checkbox" 
                              checked={formData.is_exclude_origin}
                              onChange={(e) => setFormData({...formData, is_exclude_origin: e.target.checked})}
                            /> Exclude
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Journey Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                      <div className="hidden sm:block"></div>
                      <div className="col-span-2 flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.is_outbound}
                            onChange={(e) => setFormData({...formData, is_outbound: e.target.checked})}
                          /> Outbound
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.is_inbound}
                            onChange={(e) => setFormData({...formData, is_inbound: e.target.checked})}
                          /> Inbound
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.is_freedom}
                            onChange={(e) => setFormData({...formData, is_freedom: e.target.checked})}
                          /> Freedom
                        </label>
                      </div>
                    </div>

                    {/* Airline(s) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
                      <label className="font-semibold text-sm pt-0 sm:pt-2">Airline(s)</label>
                      <div className="col-span-2 space-y-2">
                        <textarea 
                          className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600" 
                          rows="2"
                          placeholder="H9"
                          value={formData.airlines}
                          onChange={(e) => setFormData({...formData, airlines: e.target.value})}
                        />
                        <p className="text-xs text-gray-500">Keep empty for all airlines</p>
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.is_suspend_airline}
                            onChange={(e) => setFormData({...formData, is_suspend_airline: e.target.checked})}
                          /> Suspend This Airline
                        </label>
                      </div>
                    </div>

                    {/* Fly Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start sm:items-center">
                      <label className="font-semibold text-sm sm:pt-0">Fly Type</label>
                      <div className="col-span-2 flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.fly_type === 'any'}
                            onChange={() => setFormData({...formData, fly_type: 'any'})}
                          /> Any
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.fly_type === 'intl'}
                            onChange={() => setFormData({...formData, fly_type: 'intl'})}
                          /> Intl.
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.fly_type === 'domestic'}
                            onChange={() => setFormData({...formData, fly_type: 'domestic'})}
                          /> Domestic
                        </label>
                      </div>
                    </div>

                    {/* Applied On */}
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <label className="font-semibold text-sm">Applied On</label>
                      <div className="col-span-2 space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.applied_on === 'always'}
                            onChange={() => setFormData({...formData, applied_on: 'always'})}
                          /> Always
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.applied_on === 'specific'}
                            onChange={() => setFormData({...formData, applied_on: 'specific'})}
                          /> Specific Time Period
                        </label>
                      </div>
                    </div>

                    {/* C1: Fly Route(s) */}
                    <div className="grid grid-cols-3 gap-4 items-start">
                      <label className="font-semibold text-sm pt-2">C1: Fly Route(s)</label>
                      <div className="col-span-2">
                        <textarea 
                          className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600" 
                          rows="2"
                          placeholder="Enter Route. ie. DAC-KUL, DAC-CCU"
                          value={formData.routes}
                          onChange={(e) => setFormData({...formData, routes: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Keep empty for all routes</p>
                      </div>
                    </div>

                    {/* C2: Cabin Class(es) */}
                    <div className="grid grid-cols-3 gap-4 items-start">
                      <label className="font-semibold text-sm pt-2">C2: Cabin Class(es)</label>
                      <div className="col-span-2">
                        <input 
                          type="text"
                          className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600" 
                          placeholder="Enter Cabin Classes. ie. Y, J"
                          value={formData.cabin_classes}
                          onChange={(e) => setFormData({...formData, cabin_classes: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Keep empty for all classes</p>
                      </div>
                    </div>

                    {/* C3: FareBasis Codes */}
                    <div className="grid grid-cols-3 gap-4 items-start">
                      <label className="font-semibold text-sm pt-2">C3: FareBasis Codes</label>
                      <div className="col-span-2">
                        <input 
                          type="text"
                          className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600" 
                          placeholder="Enter FareBasis codes"
                          value={formData.fare_basis}
                          onChange={(e) => setFormData({...formData, fare_basis: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Keep empty for any Farebasis codes</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start sm:items-center">
                      <label className="font-semibold text-sm sm:pt-0">Status</label>
                      <div className="col-span-2 flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.status === 'active'}
                            onChange={() => setFormData({...formData, status: 'active'})}
                          /> Active
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.status === 'inactive'}
                            onChange={() => setFormData({...formData, status: 'inactive'})}
                          /> Inactive
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-6">
                    
                    {/* GDS/AIRLINE Commission */}
                    <div>
                      <h3 className="font-semibold text-sm mb-2">GDS/AIRLINE Commission</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Provision</label>
                          <input 
                            type="number" step="0.01"
                            className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                            value={formData.commission_provision}
                            onChange={(e) => setFormData({...formData, commission_provision: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Less Applied</label>
                          <input 
                            type="number" step="0.01"
                            className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                            value={formData.commission_less_applied}
                            onChange={(e) => setFormData({...formData, commission_less_applied: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.commission_type === 'percentage'}
                            onChange={() => setFormData({...formData, commission_type: 'percentage'})}
                          /> %
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.commission_type === 'fixed'}
                            onChange={() => setFormData({...formData, commission_type: 'fixed'})}
                          /> Fixed
                        </label>
                      </div>
                    </div>

                    {/* PLB Commission */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="font-semibold text-sm mb-2">PLB Commission in (%)</h3>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Less Applied</label>
                        <input 
                          type="number" step="0.01"
                          className="w-1/2 p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                          value={formData.plb_commission_less_applied}
                          onChange={(e) => setFormData({...formData, plb_commission_less_applied: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Markup */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="font-semibold text-sm mb-2">Markup (On Base Fare)</h3>
                      <div className="flex gap-4 items-center">
                        <div className="w-1/2">
                          <label className="block text-xs text-gray-500 mb-1">Value</label>
                          <input 
                            type="number" step="0.01"
                            className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                            value={formData.markup_value}
                            onChange={(e) => setFormData({...formData, markup_value: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 pt-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input 
                              type="checkbox" 
                              checked={formData.markup_type === 'percentage'}
                              onChange={() => setFormData({...formData, markup_type: 'percentage'})}
                            /> %
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input 
                              type="checkbox" 
                              checked={formData.markup_type === 'fixed'}
                              onChange={() => setFormData({...formData, markup_type: 'fixed'})}
                            /> Fixed
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Segment Cashback */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="font-semibold text-sm mb-2">Segment(s) Cashback</h3>
                      <div className="w-full sm:w-1/2">
                        <label className="block text-xs text-gray-500 mb-1">Value</label>
                        <input 
                          type="number" step="0.01"
                          className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                          value={formData.segment_cashback}
                          onChange={(e) => setFormData({...formData, segment_cashback: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Service Charge */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="font-semibold text-sm mb-2">Service Charge (if applicable)</h3>
                      <div className="flex gap-4 items-center">
                        <div className="w-1/2">
                          <label className="block text-xs text-gray-500 mb-1">Value</label>
                          <input 
                            type="number" step="0.01"
                            className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                            value={formData.service_charge}
                            onChange={(e) => setFormData({...formData, service_charge: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 pt-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input 
                              type="checkbox" 
                              checked={formData.service_charge_type === 'pnr_wise'}
                              onChange={() => setFormData({...formData, service_charge_type: 'pnr_wise'})}
                            /> PNR wise
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input 
                              type="checkbox" 
                              checked={formData.service_charge_type === 'ticket_wise'}
                              onChange={() => setFormData({...formData, service_charge_type: 'ticket_wise'})}
                            /> Ticket wise
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Date Change Service Charges */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="font-semibold text-sm mb-2">Date Change Service Charges (if applicable)</h3>
                      <div className="w-full">
                        <label className="block text-xs text-gray-500 mb-1">Value</label>
                        <input 
                          type="number" step="0.01"
                          className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                          value={formData.date_change_charge}
                          onChange={(e) => setFormData({...formData, date_change_charge: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Refund Service Charges */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="font-semibold text-sm mb-2">Refund Service Charges (if applicable)</h3>
                      <div className="w-full">
                        <label className="block text-xs text-gray-500 mb-1">Value</label>
                        <input 
                          type="number" step="0.01"
                          className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                          value={formData.refund_charge}
                          onChange={(e) => setFormData({...formData, refund_charge: e.target.value})}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                  </form>
                </div>
                
                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#005140] text-white font-medium rounded hover:bg-[#004130] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarkupManagement;
