'use client';

import React, { useState } from 'react';
import { 
  Plane, 
  ArrowRightLeft,
  Calendar,
  Search
} from 'lucide-react';

const FlightSearch = ({ onSearch }) => {
  const [tripType, setTripType] = useState('roundtrip');
  const [fareType, setFareType] = useState('regular');
  const [activeTab, setActiveTab] = useState('flight');
  
  // State for inputs
  const [fromLocation, setFromLocation] = useState({ code: '', city: '' });
  const [toLocation, setToLocation] = useState({ code: '', city: '' });
  const [dates, setDates] = useState({ departure: '', return: '' });
  const [travellers, setTravellers] = useState({ count: 1, type: 'Traveller', class: 'Economy' });

  const handleSearchClick = () => {
    // Validate inputs
    if (!fromLocation.code || !toLocation.code || !dates.departure) {
      alert('Please fill in all required fields (From, To, Departure Date)');
      return;
    }

    if (onSearch) {
      onSearch({
        origin: fromLocation.code,
        destination: toLocation.code,
        departureDate: dates.departure,
        returnDate: tripType === 'roundtrip' ? dates.return : undefined,
        passengers: travellers.count,
        tripType,
        fareType,
        class: travellers.class
      });
    }
  };

  const tabs = [
    { id: 'flight', label: 'Flight', icon: Plane },
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-4 mb-6 border-b border-gray-200 dark:border-gray-700 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[80px] p-2 rounded-lg transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'}`} />
              <span className="text-xs font-medium whitespace-nowrap">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="h-0.5 w-full bg-orange-500 mt-2 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'flight' && (
        <div className="space-y-6">
          {/* Trip Type Selection */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="oneway"
                checked={tripType === 'oneway'}
                onChange={(e) => setTripType(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">One Way</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="roundtrip"
                checked={tripType === 'roundtrip'}
                onChange={(e) => setTripType(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Round Trip</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="multicity"
                checked={tripType === 'multicity'}
                onChange={(e) => setTripType(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Multi City</span>
            </label>
          </div>

          {/* Search Inputs Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* From & To */}
            <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-2 relative">
              {/* From */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 relative group hover:border-blue-500 transition-colors bg-white dark:bg-gray-700">
                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">From</label>
                <div className="mt-1">
                  <input 
                    type="text" 
                    value={fromLocation.code}
                    onChange={(e) => setFromLocation({...fromLocation, code: e.target.value.toUpperCase()})}
                    className="w-full text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder-gray-400"
                    placeholder="e.g. DAC"
                    maxLength={3}
                  />
                  <input 
                    type="text"
                    value={fromLocation.city}
                    onChange={(e) => setFromLocation({...fromLocation, city: e.target.value})}
                    className="w-full text-sm text-gray-600 dark:text-gray-300 bg-transparent border-none p-0 focus:ring-0 mt-1 placeholder-gray-400"
                    placeholder="City Name"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <button 
                onClick={() => {
                  const temp = fromLocation;
                  setFromLocation(toLocation);
                  setToLocation(temp);
                }}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full p-1.5 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hidden md:block"
              >
                <ArrowRightLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>

              {/* To */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 relative group hover:border-blue-500 transition-colors bg-white dark:bg-gray-700">
                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">To</label>
                <div className="mt-1">
                  <input 
                    type="text" 
                    value={toLocation.code}
                    onChange={(e) => setToLocation({...toLocation, code: e.target.value.toUpperCase()})}
                    className="w-full text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder-gray-400"
                    placeholder="e.g. CXB"
                    maxLength={3}
                  />
                  <input 
                    type="text"
                    value={toLocation.city}
                    onChange={(e) => setToLocation({...toLocation, city: e.target.value})}
                    className="w-full text-sm text-gray-600 dark:text-gray-300 bg-transparent border-none p-0 focus:ring-0 mt-1 placeholder-gray-400"
                    placeholder="City Name"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-2">
              {/* Departure */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 relative group hover:border-blue-500 transition-colors bg-white dark:bg-gray-700">
                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold flex items-center mb-1">
                  Departure <span className="ml-1 text-blue-600"><Calendar className="w-3 h-3" /></span>
                </label>
                <input 
                  type="date"
                  value={dates.departure}
                  onChange={(e) => setDates({...dates, departure: e.target.value})}
                  className="w-full text-lg font-bold text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                />
              </div>

              {/* Return */}
              <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 relative group hover:border-blue-500 transition-colors bg-white dark:bg-gray-700 ${tripType === 'oneway' ? 'opacity-50' : ''}`}>
                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold flex items-center mb-1">
                  Return <span className="ml-1 text-blue-600"><Calendar className="w-3 h-3" /></span>
                </label>
                {tripType === 'oneway' ? (
                  <div 
                    onClick={() => setTripType('roundtrip')}
                    className="text-sm text-gray-400 dark:text-gray-500 font-medium cursor-pointer pt-2"
                  >
                    Tap to add return date
                  </div>
                ) : (
                  <input 
                    type="date"
                    value={dates.return}
                    onChange={(e) => setDates({...dates, return: e.target.value})}
                    className="w-full text-lg font-bold text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                  />
                )}
              </div>
            </div>

            {/* Travellers & Class */}
            <div className="lg:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 relative group hover:border-blue-500 transition-colors bg-white dark:bg-gray-700">
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Travellers & Class</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input 
                    type="number" 
                    min="1"
                    value={travellers.count}
                    onChange={(e) => setTravellers({...travellers, count: parseInt(e.target.value) || 1})}
                    className="w-full text-lg font-bold text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                  />
                  <span className="text-xs text-gray-500">Traveller(s)</span>
                </div>
                <div className="flex-1">
                  <select 
                    value={travellers.class}
                    onChange={(e) => setTravellers({...travellers, class: e.target.value})}
                    className="w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 mt-1"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-1 flex items-center justify-center">
              <button 
                onClick={handleSearchClick}
                className="w-full h-full min-h-[60px] bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition-all duration-200 flex items-center justify-center transform active:scale-95"
              >
                <Search className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Fare Type */}
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${fareType === 'regular' ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}>
                {fareType === 'regular' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>
              <input
                type="radio"
                name="fareType"
                value="regular"
                checked={fareType === 'regular'}
                onChange={(e) => setFareType(e.target.value)}
                className="hidden"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Regular Fare</span>
            </label>
            
            <label className="flex items-center cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${fareType === 'student' ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}>
                {fareType === 'student' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>
              <input
                type="radio"
                name="fareType"
                value="student"
                checked={fareType === 'student'}
                onChange={(e) => setFareType(e.target.value)}
                className="hidden"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Student Fare</span>
            </label>

            <label className="flex items-center cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${fareType === 'umrah' ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}>
                {fareType === 'umrah' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>
              <input
                type="radio"
                name="fareType"
                value="umrah"
                checked={fareType === 'umrah'}
                onChange={(e) => setFareType(e.target.value)}
                className="hidden"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Umrah Fare</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightSearch;
