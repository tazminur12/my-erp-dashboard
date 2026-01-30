
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import PassengerForm from '../../component/PassengerForm';
import { Plane, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const BookingPage = () => {
  const router = useRouter();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pnr, setPnr] = useState(null);

  useEffect(() => {
    // Retrieve flight from session storage
    const storedFlight = sessionStorage.getItem('selectedFlight');
    if (!storedFlight) {
      router.push('/air-ticketing/search');
      return;
    }
    setFlight(JSON.parse(storedFlight));
  }, [router]);

  const handleBooking = async (passengerData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/air-ticketing/create-pnr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight,
          passenger: passengerData
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setPnr(data.pnr);
      // Optional: clear session or keep for confirmation
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (!flight) return null; // Or loading spinner

  if (pnr) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Successful!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Your flight has been reserved. Please proceed to payment.</p>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-8 border border-dashed border-gray-300 dark:border-gray-700">
              <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">Booking Reference (PNR)</div>
              <div className="text-4xl font-mono font-bold text-orange-600 tracking-wider">{pnr}</div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => router.push('/air-ticketing/search')}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
              >
                Back to Search
              </button>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors">
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const legs = flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption;
  // Handle pricing safely
  const pricingInfo = Array.isArray(flight.AirItineraryPricingInfo) ? flight.AirItineraryPricingInfo[0] : flight.AirItineraryPricingInfo;
  const price = pricingInfo?.ItinTotalFare;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Review & Book Flight</h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Passenger Form */}
            <div className="flex-1 space-y-8">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-200">Booking Failed</h3>
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              <PassengerForm onSubmit={handleBooking} loading={loading} />
            </div>

            {/* Right: Flight Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                  Flight Summary
                </h3>

                <div className="space-y-6">
                  {legs.map((leg, i) => {
                     const first = leg.FlightSegment[0];
                     const last = leg.FlightSegment[leg.FlightSegment.length - 1];
                     return (
                       <div key={i} className="space-y-2">
                         <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                           <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs">
                             {i === 0 ? 'DEPART' : 'RETURN'}
                           </span>
                           {formatDate(first.DepartureDateTime)}
                         </div>
                         
                         <div className="flex justify-between items-center">
                           <div className="text-center">
                             <div className="text-2xl font-bold text-gray-900 dark:text-white">{first.DepartureAirport.LocationCode}</div>
                             <div className="text-xs text-gray-500">{formatTime(first.DepartureDateTime)}</div>
                           </div>
                           
                           <div className="flex flex-col items-center">
                             <Plane className="w-4 h-4 text-gray-400 rotate-90" />
                             <div className="text-xs text-gray-400 mt-1">
                               {leg.FlightSegment.length > 1 ? `${leg.FlightSegment.length - 1} Stop(s)` : 'Direct'}
                             </div>
                           </div>
                           
                           <div className="text-center">
                             <div className="text-2xl font-bold text-gray-900 dark:text-white">{last.ArrivalAirport.LocationCode}</div>
                             <div className="text-xs text-gray-500">{formatTime(last.ArrivalDateTime)}</div>
                           </div>
                         </div>
                         
                         <div className="text-xs text-gray-500 pt-2 flex items-center gap-1">
                            <img src={`//pic.tripcdn.com/airline_logo/3x/${first.MarketingAirline.Code.toLowerCase()}.png`} 
                                 alt={first.MarketingAirline.Code}
                                 className="w-4 h-4 object-contain"
                                 onError={(e) => e.target.style.display = 'none'}
                            />
                            {first.MarketingAirline.Code} {first.FlightNumber} • {first.Equipment?.[0]?.AirEquipType || 'Aircraft'}
                         </div>
                       </div>
                     );
                  })}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 mt-6 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Base Fare</span>
                    <span className="font-medium text-gray-900 dark:text-white">{price?.BaseFare?.Amount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Taxes & Fees</span>
                    <span className="font-medium text-gray-900 dark:text-white">{price?.Taxes?.TotalTax?.Amount || 'Included'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-2xl text-orange-600">
                      {price?.TotalFare?.CurrencyCode} {price?.TotalFare?.Amount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingPage;
