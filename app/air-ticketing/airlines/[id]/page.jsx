'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Calendar, 
  Plane, 
  TrendingUp, 
  Users,
  BarChart3,
  DollarSign,
  Award,
  Activity,
  Building,
  Map,
  Download,
  Share2,
  XCircle,
  AlertCircle,
  Loader2,
  Plus
} from 'lucide-react';

const AirlineDetails = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [airline, setAirline] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Fetch airline data from API
  const fetchAirline = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
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
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAirline();
  }, [fetchAirline]);

  // Fetch routes when Routes tab is active
  const fetchRoutes = useCallback(async () => {
    if (!id) return;
    
    setIsLoadingRoutes(true);
    try {
      const response = await fetch(`/api/airlines/${id}/routes`);
      const result = await response.json();

      if (response.ok) {
        setRoutes(result.routes || result.data || []);
      } else {
        console.error('Error fetching routes:', result.error);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
    } finally {
      setIsLoadingRoutes(false);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'routes') {
      fetchRoutes();
    }
  }, [activeTab, fetchRoutes]);

  // Handle navigation to edit page
  const handleEdit = () => {
    router.push(`/air-ticketing/airlines`);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'routes', name: 'Routes', icon: Map },
    { id: 'fleet', name: 'Fleet', icon: Plane },
    { id: 'financials', name: 'Financials', icon: DollarSign },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'tickets', name: 'Recent Tickets', icon: DollarSign }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'maintenance': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'inactive': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'confirmed': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const renderOverview = () => {
    if (!airline) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Routes</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{airline.routes || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Map className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fleet Size</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{airline.fleet || 0}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Plane className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          {airline.revenue && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Annual Revenue</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(airline.revenue)}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          )}
          
          {airline.employees && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employees</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{formatNumber(airline.employees)}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Company Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {airline.headquarters && (
                <div className="flex items-start">
                  <Building className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Headquarters</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{airline.headquarters}</p>
                  </div>
                </div>
              )}
              {airline.established && (
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Established</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{airline.established}</p>
                  </div>
                </div>
              )}
              {airline.country && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Country</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{airline.country}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <Activity className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(airline.status || 'Active')}`}>
                    {airline.status || 'Active'}
                  </span>
                </div>
              </div>
              {airline.airlineId && (
                <div className="flex items-start">
                  <Award className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Airline ID</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{airline.airlineId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {airline.description && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">About {airline.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{airline.description}</p>
            </div>
          )}
        </div>

        {/* Contact Information */}
        {(airline.phone || airline.email || airline.website) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {airline.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{airline.phone}</p>
                  </div>
                </div>
              )}
              {airline.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{airline.email}</p>
                  </div>
                </div>
              )}
              {airline.website && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Website</p>
                    <a 
                      href={airline.website.startsWith('http') ? airline.website : `https://${airline.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {airline.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRoutes = () => {
    if (!airline) return null;

    if (isLoadingRoutes) {
      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading routes...</p>
            </div>
          </div>
        </div>
      );
    }

    if (routes.length === 0) {
      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div className="text-center">
              <Map className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Route Network</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">No routes found for this airline</p>
              <button
                onClick={() => router.push(`/air-ticketing/airlines/${id}/routes/add`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add First Route
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Route Network</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Routes: {routes.length}
              </span>
              <button
                onClick={() => router.push(`/air-ticketing/airlines/${id}/routes/add`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Route
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {routes.map((route) => (
              <div
                key={route.id || route._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Origin</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{route.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                      <Plane className="w-5 h-5 text-gray-400 dark:text-gray-500 mx-2" />
                      <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Destination</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{route.destination}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status || 'Active')}`}>
                    {route.status || 'Active'}
                  </span>
                </div>

                {/* Segments */}
                {route.segments && route.segments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Segments ({route.segmentCount || route.segments.length})
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {route.segments.map((segment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                                {index + 1}
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{segment.from}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                              <Plane className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-1" />
                              <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{segment.to}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                            {segment.flightNumber && (
                              <span>Flight: {segment.flightNumber}</span>
                            )}
                            {segment.duration && (
                              <span>Duration: {segment.duration}</span>
                            )}
                            {segment.aircraft && (
                              <span>Aircraft: {segment.aircraft}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {route.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Notes:</span> {route.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFleet = () => {
    if (!airline) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <Plane className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fleet Overview</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fleet information coming soon</p>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancials = () => {
    if (!airline) return null;

    if (!airline.revenue && !airline.profit && !airline.passengerCapacity && !airline.cargoCapacity) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>Financial information not available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(airline.revenue || airline.profit) && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue & Profit</h3>
              <div className="space-y-4">
                {airline.revenue && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Annual Revenue</span>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(airline.revenue)}</span>
                  </div>
                )}
                {airline.profit && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Annual Profit</span>
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(airline.profit)}</span>
                    </div>
                    {airline.revenue && airline.profit && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</span>
                        <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                          {((airline.profit / airline.revenue) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {(airline.passengerCapacity || airline.cargoCapacity) && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Capacity Metrics</h3>
              <div className="space-y-4">
                {airline.passengerCapacity && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Passenger Capacity</span>
                    <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">{formatNumber(airline.passengerCapacity)}</span>
                  </div>
                )}
                {airline.cargoCapacity && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cargo Capacity (kg)</span>
                    <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{formatNumber(airline.cargoCapacity)}</span>
                  </div>
                )}
                {airline.revenue && airline.passengerCapacity && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue per Passenger</span>
                    <span className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                      {formatCurrency(airline.revenue / airline.passengerCapacity)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPerformance = () => {
    if (!airline) return null;

    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>Performance metrics coming soon</p>
        </div>
      </div>
    );
  };

  const renderRecentTickets = () => {
    if (!airline) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recent Ticket Sales</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ticket information coming soon</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'routes': return renderRoutes();
      case 'fleet': return renderFleet();
      case 'financials': return renderFinancials();
      case 'performance': return renderPerformance();
      case 'tickets': return renderRecentTickets();
      default: return renderOverview();
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center transition-colors duration-200">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading airline details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center transition-colors duration-200">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">Error loading airline: {error.message}</p>
            <button
              onClick={() => fetchAirline()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!airline) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center transition-colors duration-200">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Airline not found</p>
            <button
              onClick={() => router.push('/air-ticketing/airlines')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Airlines
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/air-ticketing/airlines')}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Airlines
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button 
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center space-x-6">
              <img
                src={airline.logo || '/api/placeholder/120/80'}
                alt={airline.name}
                className="w-20 h-20 rounded-xl border border-gray-200 dark:border-gray-700 object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/120/80';
                }}
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{airline.name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  {airline.code && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                      {airline.code}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(airline.status || 'Active')}`}>
                    {airline.status || 'Active'}
                  </span>
                  {airline.headquarters && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {airline.headquarters}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </DashboardLayout>
  );
};

export default AirlineDetails;
