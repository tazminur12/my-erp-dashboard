
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plane, 
  Hotel, 
  Wifi, 
  ShieldCheck, 
  Search,
  ArrowRightLeft,
  Calendar,
  User,
  MapPin,
  Check
} from 'lucide-react';
import { airports } from '@/lib/airports';

const FlightSearch = ({ compact = false }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('flight');
  const [tripType, setTripType] = useState('roundtrip');
  
  // Search States
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  
  const [travellers, setTravellers] = useState({ count: 1, class: 'Economy' });
  const [fareType, setFareType] = useState('regular');

  const fromRef = useRef(null);
  const toRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredFromAirports = airports.filter(a => 
    a.city.toLowerCase().includes(fromSearch.toLowerCase()) || 
    a.code.toLowerCase().includes(fromSearch.toLowerCase()) ||
    a.name.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToAirports = airports.filter(a => 
    a.city.toLowerCase().includes(toSearch.toLowerCase()) || 
    a.code.toLowerCase().includes(toSearch.toLowerCase()) ||
    a.name.toLowerCase().includes(toSearch.toLowerCase())
  );

  const handleSelectFrom = (airport) => {
    setSelectedFrom(airport);
    setFromSearch(`${airport.city} (${airport.code})`);
    setShowFromSuggestions(false);
  };

  const handleSelectTo = (airport) => {
    setSelectedTo(airport);
    setToSearch(`${airport.city} (${airport.code})`);
    setShowToSuggestions(false);
  };

  const handleSearchClick = () => {
    if (!selectedFrom || !selectedTo || !departureDate) {
      alert('Please fill in From, To, and Journey Date');
      return;
    }

    const query = new URLSearchParams({
      origin: selectedFrom.code,
      destination: selectedTo.code,
      departureDate,
      passengers: travellers.count,
      class: travellers.class,
      tripType
    });

    if (tripType === 'roundtrip' && returnDate) {
      query.append('returnDate', returnDate);
    }

    router.push(`/air-ticketing/flight-results?${query.toString()}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto font-sans">
      {/* Top Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-md p-1.5 flex space-x-2">
          {[
            { id: 'flight', label: 'Flights', icon: Plane },
            { id: 'hotel', label: 'Hotel', icon: Hotel },
            { id: 'esim', label: 'E-Sim', icon: Wifi },
            { id: 'insurance', label: 'Insurance', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'bg-white text-blue-900 shadow-sm ring-1 ring-gray-200' 
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Search Box */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        
        {/* Trip Type & Tags */}
        <div className="flex items-center justify-between mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg inline-flex">
            {['One Way', 'Round Way', 'Multi Way'].map((type) => {
              const value = type.toLowerCase().replace(' ', '');
              const isSelected = tripType === value || (value === 'roundway' && tripType === 'roundtrip');
              return (
                <button
                  key={type}
                  onClick={() => setTripType(value === 'roundway' ? 'roundtrip' : value)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
          
          <div className="hidden md:block text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-100">
            Book International and Domestic Flights
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative">
          
          {/* FROM */}
          <div className="lg:col-span-4 relative" ref={fromRef}>
            <div className={`border rounded-xl p-4 cursor-text transition-all ${showFromSuggestions ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'}`}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">From</label>
              <input
                type="text"
                value={fromSearch}
                onChange={(e) => {
                  setFromSearch(e.target.value);
                  setShowFromSuggestions(true);
                  if(selectedFrom) setSelectedFrom(null);
                }}
                onFocus={() => setShowFromSuggestions(true)}
                className="w-full font-bold text-gray-900 dark:text-white text-lg bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300"
                placeholder="City or Airport"
              />
              <div className="text-sm text-gray-500 truncate">
                {selectedFrom ? selectedFrom.name : 'Select Departure City'}
              </div>
            </div>

            {/* From Suggestions Dropdown */}
            {showFromSuggestions && fromSearch && (
              <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 mt-2 z-50 max-h-80 overflow-y-auto">
                {filteredFromAirports.length > 0 ? (
                  filteredFromAirports.map((airport) => (
                    <button
                      key={airport.code}
                      onClick={() => handleSelectFrom(airport)}
                      className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {airport.city} ({airport.code})
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                          {airport.name}, {airport.country}
                        </div>
                      </div>
                      <Plane className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transform -rotate-45" />
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-gray-500 text-center text-sm">No airports found</div>
                )}
              </div>
            )}
          </div>

          {/* Swap Button (Absolute Centered) */}
          <div className="absolute left-[33%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:block">
            <button 
              onClick={() => {
                const tempS = selectedFrom; setSelectedFrom(selectedTo); setSelectedTo(tempS);
                const tempT = fromSearch; setFromSearch(toSearch); setToSearch(tempT);
              }}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full p-2 shadow-lg hover:rotate-180 transition-all duration-300"
            >
              <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
          </div>

          {/* TO */}
          <div className="lg:col-span-4 relative" ref={toRef}>
            <div className={`border rounded-xl p-4 cursor-text transition-all ${showToSuggestions ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'}`}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">To</label>
              <input
                type="text"
                value={toSearch}
                onChange={(e) => {
                  setToSearch(e.target.value);
                  setShowToSuggestions(true);
                  if(selectedTo) setSelectedTo(null);
                }}
                onFocus={() => setShowToSuggestions(true)}
                className="w-full font-bold text-gray-900 dark:text-white text-lg bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300"
                placeholder="City or Airport"
              />
              <div className="text-sm text-gray-500 truncate">
                {selectedTo ? selectedTo.name : 'Select Destination City'}
              </div>
            </div>

             {/* To Suggestions Dropdown */}
             {showToSuggestions && toSearch && (
              <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 mt-2 z-50 max-h-80 overflow-y-auto">
                {filteredToAirports.length > 0 ? (
                  filteredToAirports.map((airport) => (
                    <button
                      key={airport.code}
                      onClick={() => handleSelectTo(airport)}
                      className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {airport.city} ({airport.code})
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                          {airport.name}, {airport.country}
                        </div>
                      </div>
                      <Plane className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transform rotate-45" />
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-gray-500 text-center text-sm">No airports found</div>
                )}
              </div>
            )}
          </div>

          {/* DATES & TRAVELLER */}
          <div className="lg:col-span-2">
            <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 h-full flex flex-col justify-center hover:border-gray-300 transition-colors">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Journey Date
              </label>
              <input 
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full font-bold text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 text-sm"
              />
              <div className="text-xs text-gray-400 mt-1">
                {departureDate ? new Date(departureDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'Select Date'}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {tripType === 'roundtrip' ? (
              <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 h-full flex flex-col justify-center hover:border-gray-300 transition-colors">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Return Date
                </label>
                <input 
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full font-bold text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 text-sm"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {returnDate ? new Date(returnDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'Book Roundtrip'}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setTripType('roundtrip')}
                className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 h-full w-full flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <span className="text-xs font-bold">+ Add Return</span>
                <span className="text-[10px] mt-1">Save more on round trips</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Travellers & Search Button */}
        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          
          {/* Travellers & Class Selector */}
          <div className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 transition-colors relative group">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Travellers & Class</label>
              <div className="font-bold text-gray-900 dark:text-white text-lg">
                {travellers.count} Traveler, {travellers.class}
              </div>
            </div>
            <User className="w-5 h-5 text-gray-400" />
            
            {/* Simple Popover for editing (hidden by default, shown on hover/focus could be better but simplified here) */}
            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 p-4 mt-2 hidden group-hover:block z-20">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-sm">Travelers</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setTravellers({...travellers, count: Math.max(1, travellers.count - 1)})} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">-</button>
                  <span className="font-bold">{travellers.count}</span>
                  <button onClick={() => setTravellers({...travellers, count: travellers.count + 1})} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">+</button>
                </div>
              </div>
              <div>
                <span className="font-medium text-sm mb-2 block">Class</span>
                <div className="flex gap-2">
                  {['Economy', 'Business', 'First'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setTravellers({...travellers, class: c})}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${travellers.class === c ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearchClick}
            className="bg-[#2e2b5f] hover:bg-[#3d3983] text-white rounded-xl px-12 py-4 font-bold text-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 lg:w-auto w-full"
          >
            SEARCH
            <Plane className="w-5 h-5 transform -rotate-45" />
          </button>
        </div>

        {/* Fare Type Checkbox */}
        <div className="mt-6 flex items-center gap-6">
          <label className="flex items-center cursor-pointer gap-2 group">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${fareType === 'regular' ? 'border-blue-600' : 'border-gray-300'}`}>
              {fareType === 'regular' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
            </div>
            <input type="radio" name="fare" className="hidden" checked={fareType === 'regular'} onChange={() => setFareType('regular')} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">Regular Fares</span>
          </label>
          
          <label className="flex items-center cursor-pointer gap-2 group">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${fareType === 'umrah' ? 'border-blue-600' : 'border-gray-300'}`}>
              {fareType === 'umrah' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
            </div>
            <input type="radio" name="fare" className="hidden" checked={fareType === 'umrah'} onChange={() => setFareType('umrah')} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
              Umrah Fares <span className="text-[10px] text-red-500 font-bold -mt-2 ml-0.5">new</span>
            </span>
          </label>
        </div>

      </div>
    </div>
  );
};

export default FlightSearch;
