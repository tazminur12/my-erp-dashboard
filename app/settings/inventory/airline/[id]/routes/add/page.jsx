'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../../component/DashboardLayout';
import { 
  ArrowLeft,
  MapPin,
  Plane,
  Plus,
  X,
  Save,
  Loader2,
  Map
} from 'lucide-react';
import Swal from 'sweetalert2';

const AddRoute = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  
  const [airline, setAirline] = useState(null);
  const [isLoadingAirline, setIsLoadingAirline] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    status: 'Active',
    notes: '',
    segments: []
  });

  // Fetch airline data
  const fetchAirline = useCallback(async () => {
    if (!id) return;
    
    setIsLoadingAirline(true);
    try {
      const response = await fetch(`/api/airlines/${id}`);
      const result = await response.json();

      if (response.ok) {
        setAirline(result.airline || result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch airline');
      }
    } catch (err) {
      console.error('Error fetching airline:', err);
      Swal.fire({
        title: 'ত্রুটি!',
        text: err.message || 'এয়ারলাইন লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoadingAirline(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAirline();
  }, [fetchAirline]);

  // Add new segment
  const addSegment = () => {
    setFormData(prev => ({
      ...prev,
      segments: [...prev.segments, {
        from: '',
        to: '',
        flightNumber: '',
        duration: '',
        aircraft: '',
        notes: ''
      }]
    }));
  };

  // Remove segment
  const removeSegment = (index) => {
    setFormData(prev => ({
      ...prev,
      segments: prev.segments.filter((_, i) => i !== index)
    }));
  };

  // Update segment
  const updateSegment = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      segments: prev.segments.map((seg, i) => 
        i === index ? { ...seg, [field]: value } : seg
      )
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.origin || !formData.origin.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'Origin আবশ্যক',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    if (!formData.destination || !formData.destination.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'Destination আবশ্যক',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    // Validate segments
    for (let i = 0; i < formData.segments.length; i++) {
      const segment = formData.segments[i];
      if (!segment.from || !segment.from.trim() || !segment.to || !segment.to.trim()) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: `Segment ${i + 1} এর জন্য From এবং To আবশ্যক`,
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
        status: formData.status,
        notes: formData.notes.trim() || null,
        segments: formData.segments.map(seg => ({
          from: seg.from.trim(),
          to: seg.to.trim(),
          flightNumber: seg.flightNumber.trim() || null,
          duration: seg.duration.trim() || null,
          aircraft: seg.aircraft.trim() || null,
          notes: seg.notes.trim() || null,
        }))
      };

      const response = await fetch(`/api/airlines/${id}/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'Route সফলভাবে যোগ করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        }).then(() => {
          router.push(`/settings/inventory/airline/${id}`);
        });
      } else {
        throw new Error(result.error || 'Failed to create route');
      }
    } catch (error) {
      console.error('Error creating route:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'Route যোগ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAirline) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center transition-colors duration-200">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading airline...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push(`/settings/inventory/airline/${id}`)}
              className="flex items-center mb-4 transition-colors duration-200 font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Airline Details
            </button>
            
            <div className="flex items-center space-x-4">
              {airline?.logo && (
                <img
                  src={airline.logo}
                  alt={airline.name}
                  className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Add New Route
                </h1>
                <p className="mt-1 text-sm lg:text-base text-gray-600 dark:text-gray-400">
                  {airline?.name} - Create a new route with segments
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Map className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Route Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Origin */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Origin <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      required
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      placeholder="e.g., Dhaka (DAC)"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      required
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      placeholder="e.g., Dubai (DXB)"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    placeholder="Additional notes about this route..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Segments Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Route Segments</h2>
                </div>
                <button
                  type="button"
                  onClick={addSegment}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Segment
                </button>
              </div>

              {formData.segments.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Plane className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No segments added yet</p>
                  <button
                    type="button"
                    onClick={addSegment}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Segment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.segments.map((segment, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Segment {index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeSegment(index)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* From */}
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            From <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={segment.from}
                            onChange={(e) => updateSegment(index, 'from', e.target.value)}
                            placeholder="e.g., Dhaka (DAC)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 text-sm"
                          />
                        </div>

                        {/* To */}
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            To <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={segment.to}
                            onChange={(e) => updateSegment(index, 'to', e.target.value)}
                            placeholder="e.g., Dubai (DXB)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 text-sm"
                          />
                        </div>

                        {/* Flight Number */}
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Flight Number
                          </label>
                          <input
                            type="text"
                            value={segment.flightNumber}
                            onChange={(e) => updateSegment(index, 'flightNumber', e.target.value)}
                            placeholder="e.g., BG 101"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 text-sm"
                          />
                        </div>

                        {/* Duration */}
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={segment.duration}
                            onChange={(e) => updateSegment(index, 'duration', e.target.value)}
                            placeholder="e.g., 3h 30m"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 text-sm"
                          />
                        </div>

                        {/* Aircraft */}
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Aircraft
                          </label>
                          <input
                            type="text"
                            value={segment.aircraft}
                            onChange={(e) => updateSegment(index, 'aircraft', e.target.value)}
                            placeholder="e.g., Boeing 777"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 text-sm"
                          />
                        </div>

                        {/* Segment Notes */}
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={segment.notes}
                            onChange={(e) => updateSegment(index, 'notes', e.target.value)}
                            placeholder="Segment notes..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => router.push(`/air-ticketing/airlines/${id}`)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Route...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Route
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddRoute;
