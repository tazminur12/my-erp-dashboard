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
  Check,
  Plus,
  Trash2,
  PlaneTakeoff,
  PlaneLanding,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import airportsData from '../jsondata/airports.json';

const FlightSearch = ({
  compact = false,
  initialTripType,
  initialOrigin,
  initialDestination,
  initialDepartureDate,
  initialReturnDate,
  initialTravellers,
  initialSegments,
  initialFareType,
  onSearchComplete
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('flight');
  const [tripType, setTripType] = useState('oneway');
  
  // Search States
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  
  const [travellers, setTravellers] = useState({ 
    adults: 1, 
    children: 0, 
    kids: 0, 
    infants: 0, 
    class: 'Economy' 
  });
  const [fareType, setFareType] = useState('regular');
  const [fareCalendar, setFareCalendar] = useState({});
  const [calendarMonth, setCalendarMonth] = useState(null);
  const [isCalLoading, setIsCalLoading] = useState(false);
  const [calStats, setCalStats] = useState({ min: null, max: null });
  const calFetchIdRef = useRef(0);
  
  useEffect(() => {
    if (initialTripType) setTripType(initialTripType);
    if (initialOrigin) {
      setSelectedFrom({ iata: initialOrigin, name: initialOrigin });
      setFromSearch(initialOrigin);
    }
    if (initialDestination) {
      setSelectedTo({ iata: initialDestination, name: initialDestination });
      setToSearch(initialDestination);
    }
    if (initialDepartureDate) setDepartureDate(initialDepartureDate);
    if (initialReturnDate) setReturnDate(initialReturnDate);
    if (initialTravellers) setTravellers(initialTravellers);
    if (initialSegments && Array.isArray(initialSegments) && initialSegments.length > 0) {
      const mapped = initialSegments.map((s, idx) => ({
        id: idx + 1,
        from: s.origin ? { iata: s.origin, name: s.origin } : null,
        to: s.destination ? { iata: s.destination, name: s.destination } : null,
        date: s.departureDate || '',
        fromSearch: s.origin || '',
        toSearch: s.destination || ''
      }));
      setMultiCitySegments(mapped);
      setTripType('multiway');
    }
    if (initialFareType) setFareType(initialFareType);
  }, []);
  
  const getTotalPassengers = () => {
    return travellers.adults + travellers.children + travellers.kids + travellers.infants;
  };

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const multiCityRef = useRef(null);
  const formatCompact = (n) => {
    if (!isFinite(n) || n <= 0) return '';
    const v = Math.round(n);
    if (v >= 1000000) return `${Math.round(v/1000000)}m`;
    if (v >= 1000) return `${Math.round(v/1000)}k`;
    return String(v);
  };
  const fetchFareCalendar = async (baseDate) => {
    try {
      if (!selectedFrom || !selectedTo) return;
      const fetchId = ++calFetchIdRef.current;
      const monthStr = `${baseDate.getFullYear()}-${String(baseDate.getMonth()+1).padStart(2,'0')}`;
      setIsCalLoading(true);
      setTimeout(() => {
        if (calFetchIdRef.current === fetchId) setIsCalLoading(false);
      }, 12000);
      const qs = new URLSearchParams({
        origin: selectedFrom.iata,
        destination: selectedTo.iata,
        month: monthStr,
        adults: String(travellers.adults),
        cabin: travellers.class
      });
      const res = await fetch(`/api/air-ticketing/fare-calendar?${qs.toString()}`);
      const data = await res.json();
      const map = {};
      if (res.ok && data?.fares && Array.isArray(data.fares)) {
        data.fares.forEach(f => {
          if (f?.date) map[f.date] = { amount: f.amount, currency: f.currency };
        });
        const vals = Object.values(map).map(x => x?.amount).filter(a => typeof a === 'number' && isFinite(a));
        if (vals.length) {
          const mn = Math.min(...vals);
          const mx = Math.max(...vals);
          setCalStats({ min: mn, max: mx });
        } else {
          setCalStats({ min: null, max: null });
        }
      }
      if (calFetchIdRef.current === fetchId) setFareCalendar(map);
    } catch {
    } finally {
      setIsCalLoading(false);
    }
  };
  const renderFareDay = (day, date) => {
    const key = date.toISOString().slice(0,10);
    const info = fareCalendar[key];
    return (
      <div className="flex flex-col items-center">
        <span className="font-semibold">{day}</span>
        {info && typeof info.amount === 'number'
          ? <span className="text-[10px] mt-1 text-pink-600">৳ {formatCompact(info.amount)}</span>
          : <span className="text-[10px] mt-1 skeleton-fare">&nbsp;</span>}
      </div>
    );
  };
  const renderCalHeader = ({ date, decreaseMonth, increaseMonth, changeMonth, changeYear }) => {
    const monthName = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString('default', { month: 'long' }));
    const years = Array.from({ length: 3 }, (_, i) => year - 1 + i); // previous, current, next
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <button type="button" onClick={decreaseMonth} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <select
            value={monthName}
            onChange={(e) => {
              const idx = months.findIndex(m => m === e.target.value);
              if (idx >= 0) changeMonth(idx);
            }}
            className="text-sm font-semibold bg-transparent"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => changeYear(parseInt(e.target.value, 10))}
            className="text-sm font-semibold bg-transparent"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button type="button" onClick={increaseMonth} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };
  useEffect(() => {
    try {
      if (selectedFrom && selectedTo) {
        const base = calendarMonth || new Date();
        const first = new Date(base.getFullYear(), base.getMonth(), 1);
        setCalendarMonth(first);
        fetchFareCalendar(first);
      }
    } catch {}
  }, [selectedFrom?.iata, selectedTo?.iata, travellers.adults, travellers.class]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
      if (multiCityRef.current && !multiCityRef.current.contains(event.target)) {
        setActiveSegmentField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [fromAirports, setFromAirports] = useState([]);
  const [toAirports, setToAirports] = useState([]);
  const [isSearchingFrom, setIsSearchingFrom] = useState(false);
  const [isSearchingTo, setIsSearchingTo] = useState(false);

  // Fetch airports from API
  const fetchAirports = async (query, setAirports, setIsSearching) => {
    if (!query) {
      setAirports([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/airports?q=${encodeURIComponent(query)}&limit=20`);
      const data = await response.json();
      if (response.ok) {
        setAirports(data.airports || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching airports:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search for From input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromSearch && (!selectedFrom || fromSearch !== `${selectedFrom.name} (${selectedFrom.iata})`)) {
        fetchAirports(fromSearch, setFromAirports, setIsSearchingFrom);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [fromSearch, selectedFrom]);

  // Debounce search for To input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (toSearch && (!selectedTo || toSearch !== `${selectedTo.name} (${selectedTo.iata})`)) {
        fetchAirports(toSearch, setToAirports, setIsSearchingTo);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [toSearch, selectedTo]);

  const [multiCitySegments, setMultiCitySegments] = useState([
    { id: 1, from: null, to: null, date: '', fromSearch: '', toSearch: '' },
    { id: 2, from: null, to: null, date: '', fromSearch: '', toSearch: '' },
  ]);
  const [activeSegmentField, setActiveSegmentField] = useState(null); // { id, field }

  const handleMultiCitySelect = (id, field, airport) => {
    setMultiCitySegments(prev => prev.map(seg => {
      if (seg.id === id) {
        return {
          ...seg,
          [field]: airport,
          [`${field}Search`]: `${airport.name} (${airport.iata})`
        };
      }
      return seg;
    }));
    setActiveSegmentField(null);
  };

  const handleMultiCitySearchChange = (id, field, value) => {
    setMultiCitySegments(prev => prev.map(seg => {
      if (seg.id === id) {
        const updatedSeg = { ...seg, [`${field}Search`]: value };
        if (updatedSeg[field]) updatedSeg[field] = null; // Clear selected airport if typing
        return updatedSeg;
      }
      return seg;
    }));
    setActiveSegmentField({ id, field });
  };

  const [rotatingId, setRotatingId] = useState(null);
  const [isMainRotating, setIsMainRotating] = useState(false);

  const handleMainSwap = () => {
    setIsMainRotating(true);
    setTimeout(() => setIsMainRotating(false), 500);

    const tempS = selectedFrom; setSelectedFrom(selectedTo); setSelectedTo(tempS);
    const tempT = fromSearch; setFromSearch(toSearch); setToSearch(tempT);
  };

  const handleSegmentSwap = (id) => {
    setRotatingId(id);
    setTimeout(() => setRotatingId(null), 500); // Animation duration

    setMultiCitySegments(prev => prev.map(seg => {
      if (seg.id === id) {
        return {
          ...seg,
          from: seg.to,
          to: seg.from,
          fromSearch: seg.toSearch,
          toSearch: seg.fromSearch
        };
      }
      return seg;
    }));
  };

  // Debounce search for Multi City inputs
  useEffect(() => {
    if (activeSegmentField) {
      const { id, field } = activeSegmentField;
      const segment = multiCitySegments.find(s => s.id === id);
      const searchValue = segment[`${field}Search`];
      
      const timer = setTimeout(() => {
        if (searchValue && (!segment[field] || searchValue !== `${segment[field].name} (${segment[field].iata})`)) {
          if (field === 'from') {
            fetchAirports(searchValue, setFromAirports, setIsSearchingFrom);
          } else {
            fetchAirports(searchValue, setToAirports, setIsSearchingTo);
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [multiCitySegments, activeSegmentField]);

  const addSegment = () => {
    if (multiCitySegments.length < 5) {
      setMultiCitySegments([
        ...multiCitySegments,
        { id: Date.now(), from: null, to: null, date: '', fromSearch: '', toSearch: '' }
      ]);
    }
  };

  const removeSegment = (id) => {
    if (multiCitySegments.length > 2) {
      setMultiCitySegments(multiCitySegments.filter(s => s.id !== id));
    }
  };

  const handleSelectFrom = (airport) => {
    setSelectedFrom(airport);
    setFromSearch(`${airport.name} (${airport.iata})`);
    setShowFromSuggestions(false);
  };

  const handleSelectTo = (airport) => {
    setSelectedTo(airport);
    setToSearch(`${airport.name} (${airport.iata})`);
    setShowToSuggestions(false);
  };

  const handleSearchClick = () => {
    if (tripType === 'multiway') {
      // Validate all segments
      const isValid = multiCitySegments.every(seg => seg.from && seg.to && seg.date);
      if (!isValid) {
        alert('Please fill in From, To, and Journey Date for all segments');
        return;
      }

      const segmentsData = multiCitySegments.map(seg => ({
        origin: seg.from.iata,
        destination: seg.to.iata,
        departureDate: seg.date
      }));

      const queryObjMulti = {
        tripType,
        adults: travellers.adults,
        children: travellers.children,
        kids: travellers.kids,
        infants: travellers.infants,
        class: travellers.class,
        segments: JSON.stringify(segmentsData),
        fareType
      };
      const query = new URLSearchParams({
        ...queryObjMulti
      });

      try {
        const recentRaw = localStorage.getItem('recent_air_searches');
        const recent = recentRaw ? JSON.parse(recentRaw) : [];
        const entry = {
          tripType,
          segments: segmentsData,
          travellers,
          fareType,
          queryString: query.toString(),
          ts: Date.now()
        };
        const key = JSON.stringify({ tripType, segments: segmentsData, travellers, fareType });
        const filtered = recent.filter(r => JSON.stringify({ tripType: r.tripType, segments: r.segments, travellers: r.travellers, fareType: r.fareType }) !== key);
        const next = [entry, ...filtered].slice(0, 5);
        localStorage.setItem('recent_air_searches', JSON.stringify(next));
      } catch {}

      router.push(`/air-ticketing/flight-results?${query.toString()}`);
      if (onSearchComplete) onSearchComplete();
      return;
    }

    if (!selectedFrom || !selectedTo || !departureDate) {
      alert('Please fill in From, To, and Journey Date');
      return;
    }

    const baseObj = {
      origin: selectedFrom.iata,
      destination: selectedTo.iata,
      departureDate,
      adults: travellers.adults,
      children: travellers.children,
      kids: travellers.kids,
      infants: travellers.infants,
      class: travellers.class,
      tripType,
      fareType
    };
    const query = new URLSearchParams(baseObj);

    if (tripType === 'roundtrip' && returnDate) {
      query.append('returnDate', returnDate);
    }

    try {
      const recentRaw = localStorage.getItem('recent_air_searches');
      const recent = recentRaw ? JSON.parse(recentRaw) : [];
      const entry = {
        tripType,
        origin: selectedFrom.iata,
        destination: selectedTo.iata,
        departureDate,
        returnDate: tripType === 'roundtrip' ? returnDate || '' : '',
        travellers,
        fareType,
        queryString: query.toString(),
        ts: Date.now()
      };
      const key = JSON.stringify({
        tripType,
        origin: selectedFrom.iata,
        destination: selectedTo.iata,
        departureDate,
        returnDate: tripType === 'roundtrip' ? (returnDate || '') : '',
        travellers,
        fareType
      });
      const filtered = recent.filter(r => JSON.stringify({
        tripType: r.tripType,
        origin: r.origin,
        destination: r.destination,
        departureDate: r.departureDate,
        returnDate: r.returnDate || '',
        travellers: r.travellers,
        fareType: r.fareType
      }) !== key);
      const next = [entry, ...filtered].slice(0, 5);
      localStorage.setItem('recent_air_searches', JSON.stringify(next));
    } catch {}

    router.push(`/air-ticketing/flight-results?${query.toString()}`);
    if (onSearchComplete) onSearchComplete();
  };

  return (
    <div className="w-full max-w-6xl mx-auto font-sans">
      
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
        {tripType === 'multiway' ? (
          <div className="space-y-4" ref={multiCityRef}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {multiCitySegments.map((segment, index) => (
                <React.Fragment key={segment.id}>
                  {/* FROM & TO */}
                  <div className={`md:col-span-6 relative ${activeSegmentField?.id === segment.id ? 'z-20' : 'z-0'}`}>
                    <div className="flex items-center gap-1">
                      {/* From Input */}
                      <div className="relative flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-3 hover:border-blue-400 transition-colors group">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                          From
                        </label>
                        <div className="flex items-center gap-2">
                           {segment.from && <span className="text-lg font-bold text-gray-900 dark:text-white">{segment.from.iata}</span>}
                           <div className="flex-1 min-w-0">
                             <input
                              type="text"
                              value={segment.fromSearch}
                              onChange={(e) => handleMultiCitySearchChange(segment.id, 'from', e.target.value)}
                              onFocus={() => setActiveSegmentField({ id: segment.id, field: 'from' })}
                              className={`w-full font-bold text-gray-900 dark:text-white text-lg bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300 truncate ${segment.from ? 'text-sm' : ''}`}
                              placeholder="City or Airport"
                            />
                            <div className="text-xs text-gray-500 truncate">
                              {segment.from ? segment.from.name : 'Select Departure City'}
                            </div>
                           </div>
                        </div>
                        
                        {/* Suggestions */}
                        {activeSegmentField?.id === segment.id && activeSegmentField?.field === 'from' && segment.fromSearch && (
                          <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 max-h-60 overflow-y-auto mt-2">
                            {isSearchingFrom ? (
                              <div className="p-3 text-center text-xs text-gray-500">Searching...</div>
                            ) : fromAirports.length > 0 ? (
                              fromAirports.map((airport) => (
                                <button
                                  key={airport._id || airport.id}
                                  onClick={() => handleMultiCitySelect(segment.id, 'from', airport)}
                                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 flex items-center justify-between group"
                                >
                                  <div className="truncate">
                                    <div className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                      {airport.iata} <span className="font-normal text-xs text-gray-500 truncate">{airport.name}</span>
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-gray-500 text-center text-xs">No airports found</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Swap Button */}
                      <button 
                        onClick={() => handleSegmentSwap(segment.id)}
                        className={`p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg text-blue-600 dark:text-blue-400 transition-transform duration-500 z-10 -ml-5 -mr-5 relative ${rotatingId === segment.id ? 'rotate-180' : ''}`}
                      >
                        <ArrowRightLeft className="w-5 h-5" />
                      </button>

                      {/* To Input */}
                      <div className="relative flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-3 hover:border-blue-400 transition-colors group">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                          To
                        </label>
                         <div className="flex items-center gap-2">
                           {segment.to && <span className="text-lg font-bold text-gray-900 dark:text-white">{segment.to.iata}</span>}
                           <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={segment.toSearch}
                              onChange={(e) => handleMultiCitySearchChange(segment.id, 'to', e.target.value)}
                              onFocus={() => setActiveSegmentField({ id: segment.id, field: 'to' })}
                              className={`w-full font-bold text-gray-900 dark:text-white text-lg bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300 truncate ${segment.to ? 'text-sm' : ''}`}
                              placeholder="City or Airport"
                            />
                            <div className="text-xs text-gray-500 truncate">
                              {segment.to ? segment.to.name : 'Select Destination'}
                            </div>
                           </div>
                         </div>

                        {/* Suggestions */}
                        {activeSegmentField?.id === segment.id && activeSegmentField?.field === 'to' && segment.toSearch && (
                          <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 max-h-60 overflow-y-auto mt-2">
                            {isSearchingTo ? (
                              <div className="p-3 text-center text-xs text-gray-500">Searching...</div>
                            ) : toAirports.length > 0 ? (
                              toAirports.map((airport) => (
                                <button
                                  key={airport._id || airport.id}
                                  onClick={() => handleMultiCitySelect(segment.id, 'to', airport)}
                                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 flex items-center justify-between group"
                                >
                                  <div className="truncate">
                                    <div className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                      {airport.iata} <span className="font-normal text-xs text-gray-500 truncate">{airport.name}</span>
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-gray-500 text-center text-xs">No airports found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DATE */}
                  <div className="md:col-span-3">
                    <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 h-full flex flex-col justify-center hover:border-gray-300 transition-colors">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Journey Date
                      </label>
                      <DatePicker
                        selected={segment.date ? new Date(segment.date) : null}
                        onChange={(date) => setMultiCitySegments(prev => prev.map(s => s.id === segment.id ? { ...s, date: (date ? date.toISOString().slice(0,10) : '') } : s))}
                        placeholderText="Select Date"
                        dateFormat="dd MMM, yyyy"
                        minDate={new Date()}
                        className="w-full font-bold text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 text-sm"
                        popperPlacement="bottom-start"
                        showPopperArrow={false}
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        {segment.date ? new Date(segment.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
                      </div>
                    </div>
                  </div>

                  {/* Travellers/Class (Only for first row) or Spacer/Remove */}
                  <div className="md:col-span-3 flex items-center gap-2">
                    {index === 0 ? (
                      <div className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 h-full flex flex-col justify-center relative group hover:border-gray-300 transition-colors">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <User className="w-3 h-3" /> {travellers.class}
                        </label>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">
                          {getTotalPassengers()} Traveler
                        </div>
                        {/* Dropdown */}
                        <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 p-4 mt-2 hidden group-hover:block z-20 min-w-[280px]">
                          <div className="space-y-4 mb-4">
                            {/* Adults */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">Adults</div>
                                    <div className="text-xs text-gray-500">12 years & above</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setTravellers(prev => ({...prev, adults: Math.max(1, prev.adults - 1)}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">-</button>
                                  <span className="font-bold text-sm w-4 text-center">{travellers.adults}</span>
                                  <button onClick={() => setTravellers(prev => ({...prev, adults: prev.adults + 1}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">+</button>
                                </div>
                            </div>

                            {/* Children */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">Children</div>
                                    <div className="text-xs text-gray-500">From 5 to under 12</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setTravellers(prev => ({...prev, children: Math.max(0, prev.children - 1)}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">-</button>
                                  <span className="font-bold text-sm w-4 text-center">{travellers.children}</span>
                                  <button onClick={() => setTravellers(prev => ({...prev, children: prev.children + 1}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">+</button>
                                </div>
                            </div>

                            {/* Kids */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">Kids</div>
                                    <div className="text-xs text-gray-500">From 2 to under 5</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setTravellers(prev => ({...prev, kids: Math.max(0, prev.kids - 1)}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">-</button>
                                  <span className="font-bold text-sm w-4 text-center">{travellers.kids}</span>
                                  <button onClick={() => setTravellers(prev => ({...prev, kids: prev.kids + 1}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">+</button>
                                </div>
                            </div>

                            {/* Infants */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">Infants</div>
                                    <div className="text-xs text-gray-500">Under 2 years</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setTravellers(prev => ({...prev, infants: Math.max(0, prev.infants - 1)}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">-</button>
                                  <span className="font-bold text-sm w-4 text-center">{travellers.infants}</span>
                                  <button onClick={() => setTravellers(prev => ({...prev, infants: prev.infants + 1}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">+</button>
                                </div>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-100">
                            <span className="font-medium text-sm mb-2 block">Class</span>
                            <div className="flex flex-wrap gap-2">
                              {['Economy', 'Business', 'First'].map(c => (
                                <button 
                                  key={c}
                                  onClick={() => setTravellers({...travellers, class: c})}
                                  className={`px-2 py-1 rounded-md text-xs font-medium border ${travellers.class === c ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200'}`}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700">Done</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 h-full w-full">
                        {multiCitySegments.length > 2 && (
                          <button 
                            onClick={() => removeSegment(segment.id)}
                            className="p-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors h-full flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Actions Row */}
            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={addSegment}
                disabled={multiCitySegments.length >= 5}
                className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Add City
              </button>

              <button 
                onClick={handleSearchClick}
                className="bg-[#2e2b5f] hover:bg-[#3d3983] text-white rounded-xl px-8 py-3 font-bold text-sm shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                SEARCH
                <Plane className="w-4 h-4 transform -rotate-45" />
              </button>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative">
          
          {/* FROM */}
          <div className="lg:col-span-4 relative" ref={fromRef}>
            <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-3 hover:border-blue-400 transition-colors group ${showFromSuggestions ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">From</label>
              <div className="flex items-center gap-2">
                 {selectedFrom && <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedFrom.iata}</span>}
                 <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={fromSearch}
                    onChange={(e) => {
                      setFromSearch(e.target.value);
                      setShowFromSuggestions(true);
                      if(selectedFrom) setSelectedFrom(null);
                    }}
                    onFocus={() => setShowFromSuggestions(true)}
                    className={`w-full font-bold text-gray-900 dark:text-white text-lg bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300 truncate ${selectedFrom ? 'text-sm' : ''}`}
                    placeholder="City or Airport"
                  />
                  <div className="text-xs text-gray-500 truncate">
                    {selectedFrom ? selectedFrom.name : 'Select Departure City'}
                  </div>
                 </div>
              </div>
            </div>

            {/* From Suggestions Dropdown */}
            {showFromSuggestions && fromSearch && (
              <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 mt-2 z-50 max-h-80 overflow-y-auto">
                {isSearchingFrom ? (
                  <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                ) : fromAirports.length > 0 ? (
                  fromAirports.map((airport) => (
                    <button
                      key={airport._id || airport.id}
                      onClick={() => handleSelectFrom(airport)}
                      className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {airport.name} ({airport.iata})
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                          {airport.iso}
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
              onClick={handleMainSwap}
              className={`bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg text-blue-600 dark:text-blue-400 transition-transform duration-500 ${isMainRotating ? 'rotate-180' : ''}`}
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* TO */}
          <div className="lg:col-span-4 relative" ref={toRef}>
            <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-3 hover:border-blue-400 transition-colors group ${showToSuggestions ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">To</label>
              <div className="flex items-center gap-2">
                 {selectedTo && <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedTo.iata}</span>}
                 <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={toSearch}
                    onChange={(e) => {
                      setToSearch(e.target.value);
                      setShowToSuggestions(true);
                      if(selectedTo) setSelectedTo(null);
                    }}
                    onFocus={() => setShowToSuggestions(true)}
                    className={`w-full font-bold text-gray-900 dark:text-white text-lg bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300 truncate ${selectedTo ? 'text-sm' : ''}`}
                    placeholder="City or Airport"
                  />
                  <div className="text-xs text-gray-500 truncate">
                    {selectedTo ? selectedTo.name : 'Select Destination City'}
                  </div>
                 </div>
              </div>
            </div>

             {/* To Suggestions Dropdown */}
             {showToSuggestions && toSearch && (
              <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 mt-2 z-50 max-h-80 overflow-y-auto">
                {isSearchingTo ? (
                  <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                ) : toAirports.length > 0 ? (
                  toAirports.map((airport) => (
                    <button
                      key={airport._id || airport.id}
                      onClick={() => handleSelectTo(airport)}
                      className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {airport.name} ({airport.iata})
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                          {airport.iso}
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
                {isCalLoading && <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-600">Updating fares…</span>}
              </label>
              <DatePicker
                selected={departureDate ? new Date(departureDate) : null}
                onChange={(date) => setDepartureDate(date ? date.toISOString().slice(0,10) : '')}
                placeholderText="Select Date"
                dateFormat="dd MMM, yyyy"
                minDate={new Date()}
                className="w-full font-bold text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 text-sm"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                renderDayContents={renderFareDay}
                renderCustomHeader={renderCalHeader}
                onCalendarOpen={() => {
                  const base = departureDate ? new Date(departureDate) : new Date();
                  const first = new Date(base.getFullYear(), base.getMonth(), 1);
                  setCalendarMonth(first);
                  fetchFareCalendar(first);
                }}
                onMonthChange={(date) => {
                  const first = new Date(date.getFullYear(), date.getMonth(), 1);
                  setCalendarMonth(first);
                  fetchFareCalendar(first);
                }}
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
                <DatePicker
                  selected={returnDate ? new Date(returnDate) : null}
                  onChange={(date) => setReturnDate(date ? date.toISOString().slice(0,10) : '')}
                  placeholderText="Select Date"
                  dateFormat="dd MMM, yyyy"
                  minDate={departureDate ? new Date(departureDate) : new Date()}
                  className="w-full font-bold text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 text-sm"
                  popperPlacement="bottom-start"
                  showPopperArrow={false}
                  renderDayContents={renderFareDay}
                  renderCustomHeader={renderCalHeader}
                  onCalendarOpen={() => {
                    const base = returnDate ? new Date(returnDate) : new Date();
                    const first = new Date(base.getFullYear(), base.getMonth(), 1);
                    setCalendarMonth(first);
                    fetchFareCalendar(first);
                  }}
                  onMonthChange={(date) => {
                    const first = new Date(date.getFullYear(), date.getMonth(), 1);
                    setCalendarMonth(first);
                    fetchFareCalendar(first);
                  }}
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
        )}

        {/* Bottom Row: Travellers & Search Button (Only show if NOT multiway, as multiway has its own button) */}
        {tripType !== 'multiway' && (
        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          
          {/* Travellers & Class Selector */}
          <div className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 transition-colors relative group">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Travellers & Class</label>
              <div className="font-bold text-gray-900 dark:text-white text-lg">
                {getTotalPassengers()} Traveler, {travellers.class}
              </div>
            </div>
            <User className="w-5 h-5 text-gray-400" />
            
            {/* Simple Popover for editing (hidden by default, shown on hover/focus could be better but simplified here) */}
            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 p-4 mt-2 hidden group-hover:block z-20 min-w-[280px]">
                          <div className="space-y-4 mb-4">
                            {/* Adults */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">Adults</div>
                                    <div className="text-xs text-gray-500">12 years & above</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setTravellers(prev => ({...prev, adults: Math.max(1, prev.adults - 1)}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">-</button>
                                  <span className="font-bold text-sm w-4 text-center">{travellers.adults}</span>
                                  <button onClick={() => setTravellers(prev => ({...prev, adults: prev.adults + 1}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">+</button>
                                </div>
                            </div>

                            {/* Children */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">Children</div>
                                    <div className="text-xs text-gray-500">From 5 to under 12</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setTravellers(prev => ({...prev, children: Math.max(0, prev.children - 1)}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">-</button>
                                  <span className="font-bold text-sm w-4 text-center">{travellers.children}</span>
                                  <button onClick={() => setTravellers(prev => ({...prev, children: prev.children + 1}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">+</button>
                                </div>
                            </div>

                            {/* Kids */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">Kids</div>
                                    <div className="text-xs text-gray-500">From 2 to under 5</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setTravellers(prev => ({...prev, kids: Math.max(0, prev.kids - 1)}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">-</button>
                                  <span className="font-bold text-sm w-4 text-center">{travellers.kids}</span>
                                  <button onClick={() => setTravellers(prev => ({...prev, kids: prev.kids + 1}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">+</button>
                                </div>
                            </div>

                            {/* Infants */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">Infants</div>
                                    <div className="text-xs text-gray-500">Under 2 years</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setTravellers(prev => ({...prev, infants: Math.max(0, prev.infants - 1)}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">-</button>
                                  <span className="font-bold text-sm w-4 text-center">{travellers.infants}</span>
                                  <button onClick={() => setTravellers(prev => ({...prev, infants: prev.infants + 1}))} className="w-8 h-8 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-50">+</button>
                                </div>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-100">
                            <span className="font-medium text-sm mb-2 block">Class</span>
                            <div className="flex flex-wrap gap-2">
                              {['Economy', 'Business', 'First'].map(c => (
                                <button 
                                  key={c}
                                  onClick={() => setTravellers({...travellers, class: c})}
                                  className={`px-2 py-1 rounded-md text-xs font-medium border ${travellers.class === c ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200'}`}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700">Done</button>
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
        )}

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
