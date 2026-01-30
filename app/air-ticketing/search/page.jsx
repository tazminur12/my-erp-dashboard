
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import FlightSearch from '../../component/FlightSearch';
import { 
  Loader2, 
  AlertCircle, 
  Plane, 
  Clock, 
  Calendar, 
  Filter,
  ChevronDown,
  ChevronUp,
  Briefcase
} from 'lucide-react';

const SearchPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  
  // Filter States (Mock)
  const [filters, setFilters] = useState({
    stops: 'any', // any, direct, 1stop
    price: 500000,
    airlines: []
  });

  const router = useRouter();

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setExpandedId(null);
    
    try {
      const res = await fetch('/api/air-ticketing/flight-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      const itineraries = data.data?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary;
      
      if (!itineraries || itineraries.length === 0) {
        throw new Error('No flights found for this route.');
      }
      
      setResults(itineraries);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = (itinerary) => {
    // Store selected flight in sessionStorage
    sessionStorage.setItem('selectedFlight', JSON.stringify(itinerary));
    // Navigate to booking page
    router.push('/air-ticketing/book');
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const toggleDetails = (index) => {
    setExpandedId(expandedId === index ? null : index);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Find Your Perfect Flight
            </h1>
            <FlightSearch onSearch={handleSearch} compact={!!results} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Filters */}
            <div className="w-full lg:w-1/4 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
                </div>

                {/* Stops Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Stops</h4>
                  <div className="space-y-2">
                    {['Any', 'Direct', '1 Stop', '2+ Stops'].map((stop) => (
                      <label key={stop} className="flex items-center cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500" />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{stop}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Price Range</h4>
                  <input type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Min</span>
                    <span>Max</span>
                  </div>
                </div>

                {/* Airlines */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Airlines</h4>
                  <div className="space-y-2">
                    {['Biman Bangladesh', 'US-Bangla', 'Novoair', 'Emirates'].map((airline) => (
                      <label key={airline} className="flex items-center cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500" />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{airline}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Area */}
            <div className="w-full lg:w-3/4">
              
              {/* Loading State */}
              {loading && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Searching best fares...</h3>
                  <p className="text-gray-500 text-sm mt-2">Connecting to Sabre Global Distribution System</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-200">Search Failed</h3>
                    <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Empty State / Initial */}
              {!loading && !results && !error && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Fly?</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Use the search box above to find the best flights to your dream destination.
                  </p>
                </div>
              )}

              {/* Results List */}
              {results && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {results.length} Flights Found
                    </h2>
                    <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm px-3 py-2 focus:ring-orange-500 focus:border-orange-500">
                      <option>Cheapest First</option>
                      <option>Fastest First</option>
                      <option>Earliest Departure</option>
                    </select>
                  </div>

                  {results.map((itinerary, index) => {
                    const legs = itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption;
                    const pricingInfo = Array.isArray(itinerary.AirItineraryPricingInfo) 
                      ? itinerary.AirItineraryPricingInfo[0] 
                      : itinerary.AirItineraryPricingInfo;
                    const pricing = pricingInfo?.ItinTotalFare;
                    
                    if (!pricing) return null;

                    return (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200">
                        {/* Main Card Content */}
                        <div className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            
                            {/* Flight Info */}
                            <div className="flex-1 space-y-6">
                              {legs.map((leg, legIndex) => {
                                const segments = leg.FlightSegment;
                                const first = segments[0];
                                const last = segments[segments.length - 1];
                                const airline = first.MarketingAirline.Code;
                                const duration = leg.ElapsedTime; // In minutes, if available, or calculate
                                
                                return (
                                  <div key={legIndex} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                                    {/* Airline Logo/Code */}
                                    <div className="flex flex-col items-center w-16">
                                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                                        {airline}
                                      </div>
                                      <span className="text-xs text-gray-500">{airline}</span>
                                    </div>

                                    {/* Route Visual */}
                                    <div className="flex-1 w-full grid grid-cols-3 items-center text-center sm:text-left">
                                      <div>
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                                          {formatTime(first.DepartureDateTime)}
                                        </div>
                                        <div className="text-sm text-gray-500 font-medium">{first.DepartureAirport.LocationCode}</div>
                                        <div className="text-xs text-gray-400 mt-1">{formatDate(first.DepartureDateTime)}</div>
                                      </div>

                                      <div className="flex flex-col items-center px-2">
                                        <div className="text-xs text-gray-500 mb-1">
                                          {formatDuration(leg.ElapsedTime)}
                                        </div>
                                        <div className="w-full flex items-center gap-1">
                                          <div className="h-[1px] bg-gray-300 dark:bg-gray-600 w-full relative">
                                            {segments.length > 1 && (
                                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-gray-400 rounded-full"></div>
                                            )}
                                          </div>
                                          <Plane className="w-4 h-4 text-orange-500 transform rotate-90 flex-shrink-0" />
                                          <div className="h-[1px] bg-gray-300 dark:bg-gray-600 w-full relative"></div>
                                        </div>
                                        <div className="text-xs text-green-600 font-medium mt-1">
                                          {segments.length > 1 ? `${segments.length - 1} Stop(s)` : 'Non-stop'}
                                        </div>
                                      </div>

                                      <div className="text-right">
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                                          {formatTime(last.ArrivalDateTime)}
                                        </div>
                                        <div className="text-sm text-gray-500 font-medium">{last.ArrivalAirport.LocationCode}</div>
                                        <div className="text-xs text-gray-400 mt-1">{formatDate(last.ArrivalDateTime)}</div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Price & Book */}
                            <div className="lg:w-48 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700 pt-6 lg:pt-0 lg:pl-6">
                              <div className="text-center lg:text-right mb-4">
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Total Fare</div>
                                <div className="text-2xl font-bold text-orange-600">
                                  {pricing.TotalFare.CurrencyCode} {pricing.TotalFare.Amount}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Includes taxes & fees</div>
                              </div>
                              
                              <button 
                                onClick={() => handleSelectFlight(itinerary)}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-lg font-bold shadow-md transform transition hover:-translate-y-0.5"
                              >
                                Select
                              </button>
                              
                              <button 
                                onClick={() => toggleDetails(index)}
                                className="w-full mt-3 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                              >
                                {expandedId === index ? 'Hide Details' : 'Flight Details'}
                                {expandedId === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>

                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedId === index && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 p-6">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Itinerary Details</h4>
                            <div className="space-y-6">
                              {legs.map((leg, legIndex) => (
                                <div key={legIndex} className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
                                  {leg.FlightSegment.map((seg, segIndex) => (
                                    <div key={segIndex} className="relative">
                                      {/* Dot */}
                                      <div className="absolute -left-[31px] top-1 w-4 h-4 bg-orange-500 rounded-full border-4 border-white dark:border-gray-900"></div>
                                      
                                      <div className="flex flex-col sm:flex-row gap-4 mb-2">
                                        <div className="flex-1">
                                          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {seg.MarketingAirline.Code} {seg.FlightNumber}
                                            <span className="text-xs font-normal px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                              {seg.Equipment?.[0]?.AirEquipType || 'Boeing 737'}
                                            </span>
                                          </div>
                                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Operated by {seg.OperatingAirline?.Code || seg.MarketingAirline.Code}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div>
                                          <div className="text-xs text-gray-500 uppercase">Depart</div>
                                          <div className="font-semibold text-gray-900 dark:text-white">{formatTime(seg.DepartureDateTime)}</div>
                                          <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(seg.DepartureDateTime)}</div>
                                          <div className="text-sm font-medium mt-1">{seg.DepartureAirport.LocationCode}</div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-500 uppercase">Arrive</div>
                                          <div className="font-semibold text-gray-900 dark:text-white">{formatTime(seg.ArrivalDateTime)}</div>
                                          <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(seg.ArrivalDateTime)}</div>
                                          <div className="text-sm font-medium mt-1">{seg.ArrivalAirport.LocationCode}</div>
                                        </div>
                                      </div>
                                      
                                      {/* Layover warning if not last segment */}
                                      {segIndex < leg.FlightSegment.length - 1 && (
                                        <div className="my-4 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg w-fit">
                                          <Clock className="w-4 h-4" />
                                          <span>Layover / Connection</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchPage;
