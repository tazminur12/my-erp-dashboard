
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
  Calendar,
  Eye
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
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes session
  const [filterStops, setFilterStops] = useState('all'); // all | direct | one | multi
  const [filterAirlines, setFilterAirlines] = useState({});
  const [availableAirlines, setAvailableAirlines] = useState([]);
  const [altPrices, setAltPrices] = useState({ prev: null, next: null });
  const [taxOpenIndex, setTaxOpenIndex] = useState(null);

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
  const adults = parseInt(searchParams.get('adults') || '1', 10);
  const children = parseInt(searchParams.get('children') || '0', 10);
  const kids = parseInt(searchParams.get('kids') || '0', 10);
  const infants = parseInt(searchParams.get('infants') || '0', 10);
  const passengers = adults + children + kids + infants;
  const tripType = searchParams.get('tripType');
  const cabinClass = searchParams.get('class') || 'Economy';
  
  let segments = [];
  try {
    const segmentsStr = searchParams.get('segments');
    if (segmentsStr) {
      segments = JSON.parse(segmentsStr);
    }
  } catch (e) {
    console.error('Failed to parse segments', e);
  }

  useEffect(() => {
    if ((origin && destination && departureDate) || (tripType === 'multiway' && segments.length > 0)) {
      performSearch();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/air-ticketing/flight-search?debug=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departureDate,
          returnDate,
          passengers,
          tripType,
          segments,
          travellers: {
            adults,
            children,
            kids,
            infants,
            class: cabinClass
          },
          sortOption,
          filterStops,
          filterAirlines
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
      try {
        const carriers = Array.from(new Set(itineraries.map(getAirlineCode).filter(Boolean)));
        setAvailableAirlines(carriers);
        setFilterAirlines((prev) => {
          const next = {};
          carriers.forEach((c) => { next[c] = prev[c] || false; });
          return next;
        });
      } catch {}
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStopsCount = (itinerary) => {
    try {
      const legs = itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption;
      return legs.reduce((acc, leg) => acc + Math.max(0, (leg.FlightSegment?.length || 1) - 1), 0);
    } catch {
      return 0;
    }
  };

  const getTotalElapsedMinutes = (itinerary) => {
    try {
      const legs = itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption;
      return legs.reduce((acc, leg) => acc + (leg.ElapsedTime || 0), 0);
    } catch {
      return 0;
    }
  };

  const getLayoverLabel = (segments) => {
    if (!segments || segments.length < 2) return 'Direct';
    const parts = [];
    for (let i = 0; i < segments.length - 1; i++) {
      const arr = new Date(segments[i].ArrivalDateTime);
      const dep = new Date(segments[i + 1].DepartureDateTime);
      const diffMin = Math.max(0, Math.round((dep - arr) / 60000));
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      parts.push(`${h}h ${m}m at ${segments[i].ArrivalAirport.LocationCode}`);
    }
    return parts.join(' • ');
  };

  const getAirlineCode = (itinerary) => {
    try {
      const legs = itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption;
      const firstSeg = legs[0].FlightSegment[0];
      return firstSeg.MarketingAirline.Code;
    } catch {
      return null;
    }
  };
  const getAirlineName = (code) => {
    if (code === 'BS') return 'US-Bangla Airlines';
    if (code === 'BG') return 'Biman Bangladesh';
    if (code === '2A') return 'Air Astra';
    return `${code} Airlines`;
  };

  const getSeatsLeft = (itinerary, pricingInfo) => {
    try {
      const legs = itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption || [];
      for (const leg of legs) {
        for (const seg of leg.FlightSegment || []) {
          const n = seg?.TPA_Extensions?.SeatsRemaining?.Number;
          if (n) return n;
        }
      }
      const nFi = pricingInfo?.FareInfos?.FareInfo?.[0]?.TPA_Extensions?.SeatsRemaining?.Number;
      if (nFi) return nFi;
      const n2 = pricingInfo?.PTC_FareBreakdowns?.[0]?.TPA_Extensions?.SeatsRemaining?.Number;
      if (n2) return n2;
      return null;
    } catch {
      return null;
    }
  };

  const getBaggageInfo = (itinerary, pricingInfo) => {
    const pick = (...vals) => vals.find((v) => !!v);
    let checkin = pick(
      pricingInfo?.TPA_Extensions?.Baggage?.Checkin,
      pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Baggage?.Checkin,
      pricingInfo?.FareInfos?.FareInfo?.[0]?.TPA_Extensions?.Baggage?.Checkin,
      pricingInfo?.PTC_FareBreakdowns?.[0]?.TPA_Extensions?.Baggage?.Checkin
    );
    let cabin = pick(
      pricingInfo?.TPA_Extensions?.Baggage?.Cabin,
      pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Baggage?.Cabin,
      pricingInfo?.FareInfos?.FareInfo?.[0]?.TPA_Extensions?.Baggage?.Cabin,
      pricingInfo?.PTC_FareBreakdowns?.[0]?.TPA_Extensions?.Baggage?.Cabin
    );
    if (!checkin || !cabin) {
      const infoRoot =
        pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.BaggageInformation ||
        pricingInfo?.TPA_Extensions?.BaggageInformation;
      const list = Array.isArray(infoRoot) ? infoRoot : infoRoot ? [infoRoot] : [];
      const first = list[0];
      if (first) {
        const desc = first?.Description || first?.Provision || first?.BaggageDetails?.[0]?.Description;
        const pieces = first?.Pieces ?? first?.Piece;
        const weight = first?.Weight;
        const inferred = pieces ? `${pieces} Pc` : weight ? `${weight} Kg` : desc || null;
        if (!checkin) checkin = inferred || null;
        if (!cabin) cabin = first?.Cabin || null;
      }
    }
    if (!checkin || !cabin) {
      try {
        const legs = itinerary?.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption || [];
        for (const leg of legs) {
          for (const seg of leg.FlightSegment || []) {
            const ch = seg?.TPA_Extensions?.Baggage?.Checkin;
            const cb = seg?.TPA_Extensions?.Baggage?.Cabin;
            if (!checkin && ch) checkin = ch;
            if (!cabin && cb) cabin = cb;
          }
        }
      } catch {}
    }
    const label = checkin && cabin ? `${checkin} • ${cabin}` : checkin || cabin || null;
    return { checkin: checkin || null, cabin: cabin || null, label };
  };
  const applyFilters = (list) => {
    if (!list) return [];
    return list.filter((itinerary) => {
      const stops = getStopsCount(itinerary);
      const code = getAirlineCode(itinerary);
      const airlineSelected = Object.values(filterAirlines).some(Boolean)
        ? !!code && filterAirlines[code]
        : true;

      let stopsOk = true;
      if (filterStops === 'direct') stopsOk = stops === 0;
      else if (filterStops === 'one') stopsOk = stops === 1;
      else if (filterStops === 'multi') stopsOk = stops >= 2;

      return airlineSelected && stopsOk;
    });
  };

  const safeSaveSelectedFlight = (itinerary) => {
    try {
      sessionStorage.setItem('selectedFlight', JSON.stringify(itinerary));
    } catch {
      try {
        localStorage.setItem('selectedFlight', JSON.stringify(itinerary));
      } catch {}
    }
  };

  const handleSelectFlight = (itinerary) => {
    safeSaveSelectedFlight(itinerary);
    const query = new URLSearchParams({
      adults: String(adults),
      children: String(children),
      kids: String(kids),
      infants: String(infants),
      class: cabinClass
    });
    router.push(`/air-ticketing/book?${query.toString()}`);
  };
  const buildBookingQuery = () => {
    return new URLSearchParams({
      adults: String(adults),
      children: String(children),
      kids: String(kids),
      infants: String(infants),
      class: cabinClass
    }).toString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatAmount = (value, fractionDigits) => {
    if (value === null || value === undefined) return '—';
    const num = Number(value);
    if (!isFinite(num)) return '—';
    const opts = typeof fractionDigits === 'number'
      ? { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }
      : { maximumFractionDigits: 2 };
    return num.toLocaleString('en-US', opts);
  };
  const getPassengerFare = (pricingInfo) => {
    return (
      pricingInfo?.PTC_FareBreakdowns?.[0]?.PassengerFare ||
      pricingInfo?.PTC_FareBreakdowns?.PTC_FareBreakdown?.[0]?.PassengerFare ||
      null
    );
  };
  const getTaxList = (pricingInfo) => {
    try {
      const pf = getPassengerFare(pricingInfo);
      const taxes = pf?.Taxes;
      const items = taxes?.Tax || [];
      const arr = Array.isArray(items) ? items : items ? [items] : [];
      return arr.map((t) => ({
        code: t?.TaxCode || t?.Code || '',
        amount: parseFloat(t?.Amount || 0),
        currency: t?.CurrencyCode || pf?.Taxes?.TotalTax?.CurrencyCode || pricingInfo?.ItinTotalFare?.TotalFare?.CurrencyCode || 'BDT',
        description: t?.Description || ''
      })).filter((x) => x.amount > 0);
    } catch {
      return [];
    }
  };
  const computeAIT = (pricingInfo, totalAmt) => {
    try {
      const items = getTaxList(pricingInfo);
      const excluded = new Set(['BD', 'UT', 'E5']);
      const excludedSum = items.reduce((s, t) => {
        const code = String(t.code || '').toUpperCase();
        return excluded.has(code) ? s + (parseFloat(t.amount) || 0) : s;
      }, 0);
      const penalties = 0;
      const base = (parseFloat(totalAmt) || 0) - penalties - excludedSum;
      const val = base * 0.003;
      if (!isFinite(val) || val < 0) return 0;
      return val;
    } catch {
      return 0;
    }
  };
  
  useEffect(() => {
    const fetchAlt = async (days) => {
      try {
        const body = {
          origin,
          destination,
          departureDate,
          returnDate,
          passengers,
          tripType,
          segments,
          travellers: { adults, children, kids, infants, class: cabinClass }
        };
        if (tripType === 'multiway' && segments.length > 0) {
          body.segments = segments.map(s => ({ ...s, departureDate: shiftIsoDate(s.departureDate, days) }));
        } else {
          body.departureDate = shiftIsoDate(departureDate, days);
          body.returnDate = returnDate ? shiftIsoDate(returnDate, days) : '';
        }
        const res = await fetch('/api/air-ticketing/flight-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        const priced = data?.data?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary || [];
        const min = priced.length
          ? Math.min(
              ...priced.map(pi =>
                parseFloat(
                  (Array.isArray(pi.AirItineraryPricingInfo) ? pi.AirItineraryPricingInfo[0] : pi.AirItineraryPricingInfo)
                    ?.ItinTotalFare?.Amount || 0
                )
              )
            )
          : null;
        return min;
      } catch {
        return null;
      }
    };
    const run = async () => {
      if (!origin && tripType !== 'multiway') return;
      const [prevMin, nextMin] = await Promise.all([fetchAlt(-1), fetchAlt(1)]);
      setAltPrices({ prev: prevMin, next: nextMin });
    };
    run();
  }, [origin, destination, departureDate, returnDate, cabinClass, adults, children, kids, infants, tripType, segments]);

  const shiftIsoDate = (isoDate, days) => {
    if (!isoDate) return isoDate;
    const d = new Date(isoDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const navigateWithParams = (paramsObj) => {
    const q = new URLSearchParams(paramsObj);
    if (tripType === 'multiway' && segments.length > 0) {
      q.set('segments', JSON.stringify(paramsObj.segments || segments));
    }
    router.replace(`/air-ticketing/flight-results?${q.toString()}`);
  };

  const handlePrevNextDay = (days) => {
    if (tripType === 'multiway' && segments.length > 0) {
      const shifted = segments.map(s => ({ ...s, departureDate: shiftIsoDate(s.departureDate, days) }));
      navigateWithParams({
        origin,
        destination,
        departureDate,
        returnDate,
        tripType,
        adults: String(adults),
        children: String(children),
        kids: String(kids),
        infants: String(infants),
        class: cabinClass,
        segments: shifted
      });
    } else {
      const nextDeparture = shiftIsoDate(departureDate, days);
      const nextReturn = returnDate ? shiftIsoDate(returnDate, days) : '';
      navigateWithParams({
        origin,
        destination,
        departureDate: nextDeparture,
        returnDate: nextReturn,
        tripType,
        adults: String(adults),
        children: String(children),
        kids: String(kids),
        infants: String(infants),
        class: cabinClass
      });
    }
  };

  const handleModifySearch = () => {
    const q = new URLSearchParams({
      origin: origin || '',
      destination: destination || '',
      departureDate: departureDate || '',
      returnDate: returnDate || '',
      tripType: tripType || 'oneway',
      adults: String(adults),
      children: String(children),
      kids: String(kids),
      infants: String(infants),
      class: cabinClass
    });
    if (tripType === 'multiway' && segments.length > 0) {
      q.set('segments', JSON.stringify(segments));
    }
    router.push(`/air-ticketing/search?${q.toString()}`);
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
  const handleTabClick = async (tab, index, itinerary, pricingInfo) => {
    setActiveTab(tab);
    try {
      if (tab === 'baggage') {
        const info = getBaggageInfo(itinerary, pricingInfo);
        if (!(info.cabin || info.checkin)) {
          const res = await fetch('/api/air-ticketing/baggage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pricingInfo })
          });
          const data = await res.json();
          if (res.ok && data?.baggage) {
            setResults((prev) => {
              const next = [...prev];
              const target = next[index];
              const p = Array.isArray(target.AirItineraryPricingInfo) ? target.AirItineraryPricingInfo[0] : target.AirItineraryPricingInfo;
              p.TPA_Extensions = p.TPA_Extensions || {};
              p.TPA_Extensions.Baggage = { ...(p.TPA_Extensions.Baggage || {}), Checkin: data.baggage };
              return next;
            });
          }
        }
      } else if (tab === 'cancellation' || tab === 'datechange') {
        const rules = pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Rules;
        const missing = tab === 'cancellation' ? !rules?.Cancellation : !rules?.DateChange;
        if (missing) {
          const res = await fetch('/api/air-ticketing/fare-rules/fetch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pricingInfo })
          });
          const data = await res.json();
          if (res.ok && data?.rules) {
            setResults((prev) => {
              const next = [...prev];
              const target = next[index];
              const p = Array.isArray(target.AirItineraryPricingInfo) ? target.AirItineraryPricingInfo[0] : target.AirItineraryPricingInfo;
              p.FareInfo = p.FareInfo || [{}];
              p.FareInfo[0].TPA_Extensions = p.FareInfo[0].TPA_Extensions || {};
              p.FareInfo[0].TPA_Extensions.Rules = {
                ...(p.FareInfo[0].TPA_Extensions.Rules || {}),
                Cancellation: data.rules.cancellation,
                DateChange: data.rules.dateChange,
                NoShow: data.rules.noShow
              };
              return next;
            });
          }
        }
      }
    } catch {}
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
  const getFastestStats = () => {
    if (!results || results.length === 0) return { minutes: null, amount: null, currency: 'BDT' };
    let best = null;
    for (const r of results) {
      const minutes = getTotalElapsedMinutes(r);
      const p = Array.isArray(r.AirItineraryPricingInfo) ? r.AirItineraryPricingInfo[0] : r.AirItineraryPricingInfo;
      const pricing = p?.ItinTotalFare;
      const amount = parseFloat(pricing?.TotalFare?.Amount || pricing?.Amount || 0);
      const currency = pricing?.TotalFare?.CurrencyCode || 'BDT';
      if (!best || (minutes || 0) < (best.minutes || Infinity)) {
        best = { minutes, amount, currency };
      }
    }
    return best || { minutes: null, amount: null, currency: 'BDT' };
  };

  // --- Components ---

  const fastestStats = getFastestStats();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 font-sans">
        

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Mobile Filter Toggle */}
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"
                >
                  <Filter className="w-5 h-5" />
                </button>
                
                <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-600">
                  <Plane className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-gray-900 dark:text-white">
                    <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
                      {tripType === 'multiway' ? (
                        <span>Multi-City Trip</span>
                      ) : (
                        <>
                          {origin} <span className="text-gray-400">→</span> {destination}
                        </>
                      )}
                    </h1>
                    <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
                    <div className="hidden sm:block font-medium text-sm md:text-base">
                      {tripType === 'multiway' && segments.length > 0 
                        ? `${new Date(segments[0].departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${new Date(segments[segments.length - 1].departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : departureDate ? new Date(departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
                      }
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2 md:gap-4">
                    <span className="text-green-600 font-semibold">{results ? `${results.length} Flights Available` : 'Searching...'}</span>
                    <span className="hidden sm:inline text-gray-400">• Price includes VAT & Tax</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{passengers} Passenger(s)</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleModifySearch}
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
            <div className={`${showFilters ? 'block' : 'hidden'} w-full lg:w-[280px] flex-shrink-0 space-y-4`}>
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
                  <button
                    className="text-xs text-blue-600 font-medium hover:underline"
                    onClick={() => {
                      setSortOption('cheapest');
                      setFilterStops('all');
                      setFilterAirlines({ BS: false, BG: false, '2A': false });
                    }}
                  >
                    Reset
                  </button>
                </div>
                {/* Stops */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Stops</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterStops('direct')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border ${filterStops === 'direct' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'} transition-colors`}
                    >
                      Direct
                    </button>
                    <button
                      onClick={() => setFilterStops('one')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border ${filterStops === 'one' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'} transition-colors`}
                    >
                      1 Stop
                    </button>
                    <button
                      onClick={() => setFilterStops('multi')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border ${filterStops === 'multi' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'} transition-colors`}
                    >
                      1+ Stop
                    </button>
                  </div>
                </div>
                {/* Baggage filter removed to avoid demo data */}
                {/* Airlines */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Preferred Airlines</h4>
                  <div className="space-y-3">
                    {availableAirlines.length === 0 ? (
                      <div className="text-xs text-gray-500">No airlines</div>
                    ) : (
                      availableAirlines.map((code) => (
                        <label key={code} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={!!filterAirlines[code]}
                            onChange={(e) => setFilterAirlines((prev) => ({ ...prev, [code]: e.target.checked }))}
                            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs text-gray-700">
                              {code}
                            </div>
                            <div className="flex flex-col">
                              <div className="font-bold text-gray-900 dark:text-white text-sm">
                                {getAirlineName(code)}
                              </div>
                              <div className="text-[11px] text-gray-500">{code}</div>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
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
              
              {/* Airline chips removed to avoid demo data */}

              {/* Sorting Bar */}
              {!loading && results && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setSortOption('cheapest')}
                      className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${sortOption === 'cheapest' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <div className="text-xs text-gray-400 font-normal">Cheapest</div>
                      <div>BDT {formatAmount(getLowestPrice())}</div>
                    </button>
                    <button 
                      onClick={() => setSortOption('fastest')}
                      className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${sortOption === 'fastest' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <div className="text-xs text-gray-400 font-normal">Fastest</div>
                      <div>
                        {fastestStats.minutes ? formatDuration(fastestStats.minutes) : '—'}
                        {fastestStats.amount ? ` • ${fastestStats.currency} ${formatAmount(fastestStats.amount)}` : ''}
                      </div>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                    <button onClick={() => handlePrevNextDay(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Prev Day {altPrices.prev ? `• BDT ${formatAmount(altPrices.prev)}` : ''}</span>
                    <div className="h-4 w-[1px] bg-gray-300"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Next Day {altPrices.next ? `• BDT ${formatAmount(altPrices.next)}` : ''}</span>
                    <button onClick={() => handlePrevNextDay(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
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
                  {applyFilters(results).map((itinerary, index) => {
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
                    const currency = pricing?.TotalFare?.CurrencyCode || 'BDT';
                    const baseFareAmt = parseFloat(pricing?.EquivFare?.Amount || 0);
                    let taxesAmt = parseFloat(pricing?.Taxes?.TotalTax?.Amount ?? 0);
                    if (!taxesAmt) {
                      taxesAmt = 0;
                    }
                    const totalAmt = parseFloat(pricing?.TotalFare?.Amount || 0);
                    const aitVal = computeAIT(pricingInfo, totalAmt);
                    const payableTotal = totalAmt + aitVal;
                    const brandName = pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Brand?.Name || '';
                    const bookingClass = first.ResBookDesigCode || '';
                    const seatsLeft = getSeatsLeft(itinerary, pricingInfo);
                    const baggage = getBaggageInfo(itinerary, pricingInfo);
                    const refundableFlag =
                      pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Refundables?.Refundable ||
                      pricingInfo?.TPA_Extensions?.Refundable ||
                      null;
                    const totalElapsed = getTotalElapsedMinutes(itinerary);
                    const isCheapest = totalAmt && totalAmt === getLowestPrice();
                    const cabinCode =
                      pricingInfo?.TPA_Extensions?.Cabin?.Cabin ||
                      pricingInfo?.FareInfos?.FareInfo?.[0]?.TPA_Extensions?.Cabin?.Cabin ||
                      null;
                    
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
                                <div className="flex items-center gap-2">
                                  <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Book & Hold</span>
                                  {filterAirlines[airlineCode] && (
                                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Preferred</span>
                                  )}
                                </div>
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
                                <div className="text-[10px] text-gray-500 mt-1">{getLayoverLabel(segments)}</div>
                                <div className="flex gap-4 mt-2">
                                   <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                     <Luggage className="w-3 h-3" /> {baggage?.label || '—'}
                                   </div>
                                   <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                     <Armchair className="w-3 h-3" /> {seatsLeft ? `${seatsLeft} seats left` : '—'}
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
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${refundableFlag ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{refundableFlag ? 'Refundable' : 'Non Refundable'}</span>
                                {isCheapest && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">Cheapest</span>}
                              </div>
                              <div className="text-2xl font-bold text-[#2e2b5f] dark:text-blue-400">{currency} {formatAmount(totalAmt)}</div>
                              <a
                                href={`/air-ticketing/book?${buildBookingQuery()}`}
                                onMouseDown={() => safeSaveSelectedFlight(itinerary)}
                                className="mt-2 w-full bg-[#2e2b5f] hover:bg-[#3d3983] text-white py-2.5 rounded-lg font-bold text-sm shadow-md transform transition active:scale-95 text-center"
                              >
                                Book Flight
                              </a>
                              <div className="text-right w-full">
                                <div className="text-[10px] text-gray-400 mt-0.5">Price for {passengers} travelers</div>
                                {brandName ? <div className="text-[10px] text-gray-500 mt-0.5">Fare Brand: {brandName}</div> : null}
                                <div className="text-[10px] text-gray-500 mt-0.5">
                                  Booking Class: {bookingClass}
                                  {seatsLeft ? ` • ${seatsLeft} seats left` : ''}
                                  {cabinCode ? ` • Cabin: ${cabinCode}` : ''}
                                </div>
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
                               {['itinerary', 'fare', 'baggage', 'cancellation', 'datechange'].map((tab) => (
                                 <button
                                   key={tab}
                                   onClick={() => handleTabClick(tab, index, itinerary, pricingInfo)}
                                   className={`pb-2 px-4 text-sm font-medium transition-colors relative ${
                                     activeTab === tab 
                                       ? 'text-[#2e2b5f] dark:text-blue-400' 
                                       : 'text-gray-500 hover:text-gray-700'
                                   }`}
                                 >
                                   {tab === 'datechange' ? 'Date Change' : (tab.charAt(0).toUpperCase() + tab.slice(1))}
                                   {activeTab === tab && (
                                     <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2e2b5f] dark:bg-blue-400 rounded-t-full"></div>
                                   )}
                                 </button>
                               ))}
                             </div>

                             {/* Itinerary Tab */}
                             {activeTab === 'itinerary' && (
                               <div className="space-y-6 px-4">
                                  <div className="text-lg font-bold text-[#2e2b5f] dark:text-white mb-2">
                                    Total journey time {formatDuration(totalElapsed)}
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
                                              <div className="text-xs text-gray-400 mt-1"></div>

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
                                                    <div>Aircraft : {seg.Equipment?.[0]?.AirEquipType || '—'}</div>
                                                    <div>Class : {cabinClass} • Booking {seg.ResBookDesigCode || bookingClass}</div>
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
                                              <div className="text-xs text-gray-400 mt-1"></div>
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
                                      <td className="py-3 px-4">{getBaggageInfo(itinerary, pricingInfo).cabin || '—'}</td>
                                      <td className="py-3 px-4">{getBaggageInfo(itinerary, pricingInfo).checkin || '—'}</td>
                                     </tr>
                                   </tbody>
                                 </table>
                               </div>
                             )}

                             {activeTab === 'fare' && (
                               <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-visible">
                                 <div className="px-4 py-3 text-xs text-gray-500 flex items-center gap-3">
                                   <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">Refundable</span>
                                   <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">Book & Hold</span>
                                 </div>
                                 <table className="w-full text-sm">
                                   <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500">
                                     <tr>
                                       <th className="py-3 px-4 text-left">Pax Type</th>
                                       <th className="py-3 px-4 text-left">Base Fare</th>
                                       <th className="py-3 px-4 text-left">Tax</th>
                                       <th className="py-3 px-4 text-left">Other</th>
                                       <th className="py-3 px-4 text-left">Discount</th>
                                       <th className="py-3 px-4 text-left">AIT</th>
                                       <th className="py-3 px-4 text-left">Pax Count</th>
                                       <th className="py-3 px-4 text-left">Amount</th>
                                     </tr>
                                   </thead>
                                   <tbody className="text-gray-700 dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-700">
                                     <tr>
                                       <td className="py-3 px-4">Adult</td>
                                       <td className="py-3 px-4">{currency} {formatAmount(baseFareAmt, 2)}</td>
                                      <td className="py-3 px-4">
                                        <div
                                          className="relative inline-flex items-center gap-2"
                                          onMouseEnter={() => setTaxOpenIndex(index)}
                                          onMouseLeave={() => setTaxOpenIndex(null)}
                                        >
                                          <span>{currency} {formatAmount(taxesAmt, 2)}</span>
                                          <Eye className="w-4 h-4 text-gray-500" />
                                          {taxOpenIndex === index && (
                                            <div className="absolute bottom-full left-0 mb-2 z-50 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
                                              {getTaxList(pricingInfo).length > 0 ? (
                                                <table className="w-full text-xs">
                                                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500">
                                                    <tr>
                                                      <th className="py-2 px-3 text-left">Code</th>
                                                      <th className="py-2 px-3 text-left">Amount</th>
                                                      <th className="py-2 px-3 text-left">Description</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="text-gray-700 dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-700">
                                                    {getTaxList(pricingInfo).map((t, i) => (
                                                      <tr key={`${t.code}-${i}`}>
                                                        <td className="py-2 px-3">{t.code || '—'}</td>
                                                        <td className="py-2 px-3">{t.currency} {formatAmount(t.amount, 2)}</td>
                                                        <td className="py-2 px-3">{t.description || '—'}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              ) : (
                                                <div className="px-3 py-2 text-xs text-gray-500">No tax details provided by airline</div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                       <td className="py-3 px-4">{currency} 0</td>
                                       <td className="py-3 px-4">{currency} 0</td>
                                       <td className="py-3 px-4">{currency} {formatAmount(computeAIT(pricingInfo, totalAmt), 2)}</td>
                                       <td className="py-3 px-4">{adults}</td>
                                       <td className="py-3 px-4">{currency} {formatAmount(payableTotal, 2)}</td>
                                     </tr>
                                   </tbody>
                                 </table>
                                 <div className="flex justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm font-bold">
                                   <span>Total Payable</span>
                                   <span>{currency} {formatAmount(payableTotal, 2)}</span>
                                 </div>
                               </div>
                             )}

                            {activeTab === 'cancellation' && (
                               <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                 <div>{pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Rules?.Cancellation || 'Refer airline policy'}</div>
                               </div>
                             )}

                             {activeTab === 'datechange' && (
                               <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                 <div>{pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Rules?.DateChange || 'Refer airline policy'}</div>
                               </div>
                             )}

                             {/* Fare Rules Tab */}
                             {activeTab === 'rules' && (
                               <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                 <div className="flex gap-4">
                                   <div className="min-w-[100px] font-bold text-gray-900 dark:text-white">Cancellation</div>
                                   <div>{pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Rules?.Cancellation || 'Refer airline policy'}</div>
                                 </div>
                                 <div className="flex gap-4">
                                   <div className="min-w-[100px] font-bold text-gray-900 dark:text-white">Date Change</div>
                                   <div>{pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Rules?.DateChange || 'Refer airline policy'}</div>
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
