
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  Loader2, 
  AlertCircle, 
  Plane, 
  Clock, 
  Filter,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Luggage,
  Armchair,
  RefreshCw,
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  MapPin,
  Calendar
} from 'lucide-react';

const FlightResultsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  
  // UI States
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('cheapest');
  const [activeTab, setActiveTab] = useState('itinerary'); // itinerary, baggage, rules
  const [priceModalData, setPriceModalData] = useState(null); // stores pricing info for modal
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes session

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse params
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');
  const passengers = searchParams.get('passengers') || 1;
  const tripType = searchParams.get('tripType');
  const cabinClass = searchParams.get('class') || 'Economy';

  useEffect(() => {
    if (origin && destination && departureDate) {
      performSearch();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/air-ticketing/flight-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departureDate,
          returnDate,
          passengers,
          tripType
        })
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
    sessionStorage.setItem('selectedFlight', JSON.stringify(itinerary));
    router.push('/air-ticketing/book');
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const toggleDetails = (index) => {
    if (expandedId === index) {
      setExpandedId(null);
    } else {
      setExpandedId(index);
      setActiveTab('itinerary');
    }
  };

  // Helper to get lowest price for display
  const getLowestPrice = () => {
    if (!results || results.length === 0) return 0;
    const prices = results.map(r => {
      const p = Array.isArray(r.AirItineraryPricingInfo) ? r.AirItineraryPricingInfo[0] : r.AirItineraryPricingInfo;
      return parseFloat(p?.ItinTotalFare?.Amount || 0);
    });
    return Math.min(...prices);
  };

  // --- Components ---

  const PriceBreakdownModal = ({ pricing, onClose }) => {
    if (!pricing) return null;
    
    // Handle structure variation (pricingInfo vs ItinTotalFare)
    const fare = pricing.ItinTotalFare || pricing;
    
    const base = parseFloat(fare.BaseFare?.Amount || 0);
    const total = parseFloat(fare.TotalFare?.Amount || 0);
    const tax = total - base;
    const currency = fare.TotalFare?.CurrencyCode || 'BDT';
    
    // Mock Discount for professional look (Real logic would come from API/Promo)
    const discount = Math.round(base * 0.10); // 10% discount
    const aitVat = 15.00; // Mock AIT & VAT
    const finalTotal = total - discount + aitVat;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all scale-100">
          <div className="bg-white dark:bg-gray-900 px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg text-[#2e2b5f] dark:text-white">Price Breakdown</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
             <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl mb-6">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500">
                     <th className="py-3 px-4 text-center font-medium border-r border-gray-100 dark:border-gray-700">Type</th>
                     <th className="py-3 px-4 text-center font-medium border-r border-gray-100 dark:border-gray-700">Base</th>
                     <th className="py-3 px-4 text-center font-medium border-r border-gray-100 dark:border-gray-700">Taxes</th>
                     <th className="py-3 px-4 text-center font-medium">Total Fare</th>
                   </tr>
                 </thead>
                 <tbody className="text-gray-700 dark:text-gray-300">
                   <tr>
                     <td className="py-4 px-4 text-center border-r border-gray-100 dark:border-gray-700">Adult ({passengers})</td>
                     <td className="py-4 px-4 text-center border-r border-gray-100 dark:border-gray-700">{base.toLocaleString()} ৳</td>
                     <td className="py-4 px-4 text-center border-r border-gray-100 dark:border-gray-700">{tax.toLocaleString()} ৳</td>
                     <td className="py-4 px-4 text-center font-medium">{total.toLocaleString()} ৳</td>
                   </tr>
                 </tbody>
               </table>
             </div>
             
             <div className="space-y-3">
               <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                 <span>Discount</span>
                 <span className="text-[#2e2b5f] dark:text-blue-400 font-bold">- BDT {discount.toLocaleString()}.00</span>
               </div>
               <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                 <span>Total AIT & VAT</span>
                 <span className="font-bold text-[#2e2b5f] dark:text-blue-400">BDT {aitVat.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center pt-3 mt-2">
                 <span className="font-bold text-base text-[#2e2b5f] dark:text-white">Total Customer payable</span>
                 <span className="text-xl font-bold text-[#2e2b5f] dark:text-blue-400">BDT {finalTotal.toLocaleString()}.00</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 font-sans">
        
        {/* Modal Overlay */}
        {priceModalData && (
          <PriceBreakdownModal 
            pricing={priceModalData} 
            onClose={() => setPriceModalData(null)} 
          />
        )}

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Mobile Filter Toggle */}
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"
                >
                  <Filter className="w-5 h-5" />
                </button>
                
                <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-600">
                  <Plane className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-gray-900 dark:text-white">
                    <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
                      {origin} <span className="text-gray-400">→</span> {destination}
                    </h1>
                    <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
                    <div className="hidden sm:block font-medium text-sm md:text-base">
                      {new Date(departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2 md:gap-4">
                    <span>{results ? `${results.length} Flights` : 'Searching...'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{passengers} Traveler(s)</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => router.push('/air-ticketing/search')}
                className="bg-[#2e2b5f] hover:bg-[#3d3983] text-white px-4 py-2 md:px-6 rounded-lg font-semibold text-xs md:text-sm transition-colors shadow-md w-full md:w-auto"
              >
                Modify Search
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Sidebar Filters - Responsive */}
            <div className={`
              lg:block w-full lg:w-[280px] flex-shrink-0 space-y-4 
              ${showFilters ? 'block' : 'hidden'}
            `}>
              {/* ... (existing filter content same as before) ... */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                  {Math.floor(timeLeft / 60)} <span className="text-sm font-normal text-gray-500">min</span> : {(timeLeft % 60).toString().padStart(2, '0')} <span className="text-sm font-normal text-gray-500">sec</span>
                </div>
                <div className="text-xs text-gray-400">Session Timeout</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Sort & Filter</h3>
                  <button className="text-xs text-blue-600 font-medium hover:underline">Reset</button>
                </div>
                {/* Stops */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Stops</h4>
                  <div className="flex gap-2">
                    {['Direct', '1 Stop', '1+ Stop'].map((stop, i) => (
                      <button key={stop} className={`flex-1 py-2 text-xs font-medium rounded-lg border ${i === 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'} transition-colors`}>
                        {stop}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Baggage */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Baggage Filter</h4>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100">20 Kg</button>
                  </div>
                </div>
                {/* Airlines */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Preferred Airlines</h4>
                  <div className="space-y-3">
                    {['US-Bangla Airlines', 'Biman Bangladesh Airlines', 'Air Astra'].map((airline) => (
                      <label key={airline} className="flex items-center cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 transition-colors">{airline}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Refundable */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Refundable</h4>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Non Refundable</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Refundable</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              
              {/* Airline Tickers */}
              {!loading && results && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs">BS</div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">US-Bangla</div>
                      <div className="text-xs text-gray-500">BDT {getLowestPrice()}</div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-all opacity-60">
                     <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs">BG</div>
                     <div>
                      <div className="font-bold text-gray-900 dark:text-white">Biman</div>
                      <div className="text-xs text-gray-500">BDT {getLowestPrice() + 500}</div>
                    </div>
                  </div>
                   <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-all opacity-60">
                     <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs">2A</div>
                     <div>
                      <div className="font-bold text-gray-900 dark:text-white">Air Astra</div>
                      <div className="text-xs text-gray-500">BDT {getLowestPrice() + 800}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sorting Bar */}
              {!loading && results && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setSortOption('cheapest')}
                      className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${sortOption === 'cheapest' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <div className="text-xs text-gray-400 font-normal">Cheapest</div>
                      <div>BDT {getLowestPrice()}</div>
                    </button>
                    <button 
                      onClick={() => setSortOption('fastest')}
                      className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${sortOption === 'fastest' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <div className="text-xs text-gray-400 font-normal">Fastest</div>
                      <div>BDT {getLowestPrice() + 200}</div>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Prev Day</span>
                    <div className="h-4 w-[1px] bg-gray-300"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Next Day</span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Flight Cards */}
              {!loading && results && (
                <div className="space-y-4">
                  {results.map((itinerary, index) => {
                    const legs = itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption;
                    const leg = legs[0];
                    const segments = leg.FlightSegment;
                    const first = segments[0];
                    const last = segments[segments.length - 1];
                    const airlineCode = first.MarketingAirline.Code;
                    
                    const pricingInfo = Array.isArray(itinerary.AirItineraryPricingInfo) 
                      ? itinerary.AirItineraryPricingInfo[0] 
                      : itinerary.AirItineraryPricingInfo;
                    const pricing = pricingInfo?.ItinTotalFare;
                    
                    if (!pricing) return null;

                    return (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
                        <div className="p-5">
                          <div className="flex flex-col lg:flex-row items-center gap-6">
                            
                            {/* Checkbox & Airline Logo */}
                            <div className="flex items-start gap-4 w-full lg:w-[28%]">
                              <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-bold text-gray-900 dark:text-white text-base">
                                    {airlineCode === 'BS' ? 'US-Bangla Airlines' : airlineCode === 'BG' ? 'Biman Bangladesh' : `${airlineCode} Airlines`}
                                  </div>
                                  <span className="text-xs font-normal text-gray-500">{airlineCode}-{first.FlightNumber}</span>
                                </div>
                                <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Book & Hold</span>
                              </div>
                            </div>

                            {/* Route & Timing */}
                            <div className="flex-1 w-full flex items-center justify-between gap-4">
                              <div className="text-left">
                                <div className="text-xs text-gray-400 font-medium mb-1">{origin} - {first.DepartureAirport.LocationCode}</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(first.DepartureDateTime)}</div>
                                <div className="text-xs text-gray-500 mt-1">{new Date(first.DepartureDateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'short' })}</div>
                              </div>

                              <div className="flex-1 flex flex-col items-center px-4">
                                <div className="text-xs text-gray-400 mb-2">{formatDuration(leg.ElapsedTime)}</div>
                                <div className="w-full flex items-center gap-2">
                                  <div className="h-[1px] bg-gray-300 dark:bg-gray-600 w-full relative"></div>
                                  <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {segments.length > 1 ? `${segments.length - 1} Stop` : 'Direct'}
                                  </div>
                                  <div className="h-[1px] bg-gray-300 dark:bg-gray-600 w-full relative">
                                    <Plane className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 transform rotate-90" />
                                  </div>
                                </div>
                                <div className="flex gap-4 mt-2">
                                   <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                     <Luggage className="w-3 h-3" /> 20 Kg
                                   </div>
                                   <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                     <Armchair className="w-3 h-3" /> 9 Seat
                                   </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xs text-gray-400 font-medium mb-1">{destination} - {last.ArrivalAirport.LocationCode}</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(last.ArrivalDateTime)}</div>
                                <div className="text-xs text-gray-500 mt-1">{new Date(last.ArrivalDateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'short' })}</div>
                              </div>
                            </div>

                            {/* Price & Action */}
                            <div className="w-full lg:w-[25%] flex flex-col items-end border-l border-dashed border-gray-200 dark:border-gray-700 pl-6 gap-2">
                              <div className="flex gap-2 mb-1">
                                 <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">Refundable</span>
                                 <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                   <div className="w-3 h-3 rounded-full bg-orange-400 text-white flex items-center justify-center text-[8px]">৳</div>
                                   +46
                                 </span>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-2xl font-bold text-[#2e2b5f] dark:text-blue-400">
                                  {pricing.TotalFare.CurrencyCode} {pricing.TotalFare.Amount}
                                </div>
                                <div className="text-xs text-gray-400 line-through">
                                  {pricing.TotalFare.CurrencyCode} {(parseFloat(pricing.TotalFare.Amount) * 1.1).toFixed(2)}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">Price for {passengers} travelers</div>
                              </div>

                              <div className="w-full flex flex-col gap-2 mt-2">
                                <button 
                                  onClick={() => setPriceModalData(pricingInfo)}
                                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center justify-end gap-1 font-medium transition-colors"
                                >
                                  Price Breakdown <ChevronDown className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => handleSelectFlight(itinerary)}
                                  className="w-full bg-[#2e2b5f] hover:bg-[#3d3983] text-white py-2.5 rounded-lg font-bold text-sm shadow-md transform transition active:scale-95"
                                >
                                  Book Flight
                                </button>
                              </div>
                            </div>

                          </div>
                          
                          {/* Bottom Drawer Toggle */}
                          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-end">
                            <button 
                              onClick={() => toggleDetails(index)}
                              className="text-xs font-semibold text-gray-500 hover:text-[#2e2b5f] flex items-center gap-1 transition-colors"
                            >
                              {expandedId === index ? 'Hide Details' : 'Flight Details'}
                              {expandedId === index ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Details Section */}
                        {expandedId === index && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 p-6 animate-in slide-in-from-top-2 duration-200">
                             {/* Tabs */}
                             <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                               {['itinerary', 'baggage', 'rules'].map((tab) => (
                                 <button
                                   key={tab}
                                   onClick={() => setActiveTab(tab)}
                                   className={`pb-2 px-4 text-sm font-medium transition-colors relative ${
                                     activeTab === tab 
                                       ? 'text-[#2e2b5f] dark:text-blue-400' 
                                       : 'text-gray-500 hover:text-gray-700'
                                   }`}
                                 >
                                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                   {activeTab === tab && (
                                     <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2e2b5f] dark:bg-blue-400 rounded-t-full"></div>
                                   )}
                                 </button>
                               ))}
                             </div>

                             {/* Itinerary Tab */}
                             {activeTab === 'itinerary' && (
                               <div className="space-y-6 px-4">
                                 <div className="text-lg font-bold text-[#2e2b5f] dark:text-white mb-8">
                                   {origin}- {destination}
                                 </div>
                                 {legs.map((leg, legIndex) => (
                                   <div key={legIndex} className="relative space-y-0">
                                     {leg.FlightSegment.map((seg, segIndex) => (
                                       <div key={segIndex} className="relative pb-10 last:pb-0">
                                         
                                         {/* Departure */}
                                         <div className="flex gap-8 relative">
                                            {/* Left: Time & Date */}
                                            <div className="w-24 text-right flex-shrink-0">
                                              <div className="font-bold text-lg text-[#2e2b5f] dark:text-white">{formatTime(seg.DepartureDateTime)}</div>
                                              <div className="text-sm text-gray-500 font-medium">{new Date(seg.DepartureDateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                                            </div>

                                            {/* Center: Timeline Line & Dot */}
                                            <div className="relative flex flex-col items-center">
                                               <div className="w-4 h-4 rounded-full bg-[#2e2b5f] border-2 border-white shadow-sm z-10 relative"></div>
                                               <div className="absolute top-4 bottom-[-40px] w-0 border-l-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                                            </div>

                                            {/* Right: Airport Info */}
                                            <div className="flex-1 pb-8">
                                              <div className="font-bold text-base text-[#2e2b5f] dark:text-white">
                                                {seg.DepartureAirport.LocationCode === 'DAC' ? 'Hazrat Shahjalal International Airport' : seg.DepartureAirport.LocationCode === 'CXB' ? "Cox's Bazar Airport" : `${seg.DepartureAirport.LocationCode} Airport`}
                                              </div>
                                              <div className="text-sm text-gray-500 font-medium mt-1">
                                                ({seg.DepartureAirport.LocationCode})
                                              </div>
                                              <div className="text-xs text-gray-400 mt-1">
                                                Approx 2 to 3 hours for the check-in<br/>Terminal: D
                                              </div>

                                              {/* Airline Info - Indented under Departure */}
                                              <div className="mt-6 flex items-start gap-4">
                                                <div className="w-8 h-8 flex-shrink-0">
                                                  {/* Airline Logo Placeholder */}
                                                  {seg.MarketingAirline.Code === 'BS' && (
                                                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/5/52/US-Bangla_Airlines_logo.svg/1200px-US-Bangla_Airlines_logo.svg.png" alt="BS" className="w-full h-auto object-contain" />
                                                  )}
                                                </div>
                                                <div>
                                                  <div className="font-bold text-sm text-[#2e2b5f] dark:text-white">
                                                    {seg.MarketingAirline.Code === 'BS' ? 'US-Bangla Airlines' : seg.MarketingAirline.Code} - {seg.FlightNumber}
                                                  </div>
                                                  <div className="text-xs text-gray-500 mt-1 font-medium space-y-1">
                                                    <div>Operated by : {seg.OperatingAirline.Code}</div>
                                                    <div>Aircraft : {seg.Equipment?.[0]?.AirEquipType || 'ATR 72 - 600'}</div>
                                                    <div>Class : {cabinClass} - (Economy)</div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                         </div>

                                         {/* Arrival (Only show for last segment or break down if multi-leg) */}
                                         <div className="flex gap-8 relative mt-2">
                                            {/* Left: Time & Date */}
                                            <div className="w-24 text-right flex-shrink-0">
                                              <div className="font-bold text-lg text-[#2e2b5f] dark:text-white">{formatTime(seg.ArrivalDateTime)}</div>
                                              <div className="text-sm text-gray-500 font-medium">{new Date(seg.ArrivalDateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                                            </div>

                                            {/* Center: Timeline Line & Dot */}
                                            <div className="relative flex flex-col items-center">
                                               <div className="w-4 h-4 rounded-full bg-[#2e2b5f] border-2 border-white shadow-sm z-10"></div>
                                            </div>

                                            {/* Right: Airport Info */}
                                            <div className="flex-1">
                                              <div className="font-bold text-base text-[#2e2b5f] dark:text-white">
                                                {seg.ArrivalAirport.LocationCode === 'DAC' ? 'Hazrat Shahjalal International Airport' : seg.ArrivalAirport.LocationCode === 'CXB' ? "Cox's Bazar Airport" : `${seg.ArrivalAirport.LocationCode} Airport`}
                                              </div>
                                              <div className="text-sm text-gray-500 font-medium mt-1">
                                                ({seg.ArrivalAirport.LocationCode})
                                              </div>
                                              <div className="text-xs text-gray-400 mt-1">
                                                Terminal: D
                                              </div>
                                            </div>
                                         </div>
                                       </div>
                                     ))}
                                   </div>
                                 ))}
                               </div>
                             )}

                             {/* Baggage Tab */}
                             {activeTab === 'baggage' && (
                               <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                 <table className="w-full text-sm">
                                   <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500">
                                     <tr>
                                       <th className="py-3 px-4 text-left">Sector</th>
                                       <th className="py-3 px-4 text-left">Cabin</th>
                                       <th className="py-3 px-4 text-left">Check-in</th>
                                     </tr>
                                   </thead>
                                   <tbody className="text-gray-700 dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-700">
                                     <tr>
                                       <td className="py-3 px-4">{origin} - {destination}</td>
                                       <td className="py-3 px-4">7 KG</td>
                                       <td className="py-3 px-4">20 KG</td>
                                     </tr>
                                   </tbody>
                                 </table>
                               </div>
                             )}

                             {/* Fare Rules Tab */}
                             {activeTab === 'rules' && (
                               <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                 <div className="flex gap-4">
                                   <div className="min-w-[100px] font-bold text-gray-900 dark:text-white">Cancellation</div>
                                   <div>Refundable with penalty of BDT 1500 before 24 hours of flight.</div>
                                 </div>
                                 <div className="flex gap-4">
                                   <div className="min-w-[100px] font-bold text-gray-900 dark:text-white">Date Change</div>
                                   <div>Allowed with penalty of BDT 1000 + Fare difference.</div>
                                 </div>
                                 <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-yellow-800 dark:text-yellow-200 text-xs">
                                   * The airline penalty fee is indicative and subject to change without prior notice.
                                 </div>
                               </div>
                             )}

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

export default FlightResultsPage;
