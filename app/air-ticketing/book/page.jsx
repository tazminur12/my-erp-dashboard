'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import PassengerForm from '../../component/PassengerForm';
import { Plane, AlertCircle, CheckCircle, Clock, ArrowLeft, ChevronDown, User } from 'lucide-react';

const SessionTimer = () => {
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-6 flex items-center justify-between">
      <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Session Timeout in</span>
      <div className="text-xl font-bold text-gray-900 dark:text-white font-mono">
        {String(minutes).padStart(2, '0')} <span className="text-sm">min</span> : {String(seconds).padStart(2, '0')} <span className="text-sm">sec</span>
      </div>
    </div>
  );
};

const BookingStepper = () => {
  return (
    <div className="bg-[#1e1b4b] text-white py-4 px-4 sm:px-6 lg:px-8 mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
         <button className="text-white hover:text-gray-300">
             <ArrowLeft className="w-6 h-6" />
         </button>
         
         <div className="flex items-center gap-4 flex-1 justify-center">
            <div className="flex items-center gap-2 opacity-60">
                <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-xs">1</div>
                <span className="text-sm hidden sm:inline">Flight Itinerary</span>
            </div>
            <div className="w-16 h-[1px] bg-gray-500"></div>
             <div className="flex items-center gap-2 font-bold">
                <div className="w-6 h-6 rounded-full bg-white text-[#1e1b4b] flex items-center justify-center text-xs">2</div>
                <span className="text-sm hidden sm:inline">Review & Book</span>
            </div>
         </div>
         
         <div className="w-6"></div> {/* Spacer for centering */}
      </div>
    </div>
  );
};

const BookingPage = () => {
  const router = useRouter();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pnr, setPnr] = useState(null);
  
  // Passenger Data State
  const [passengerData, setPassengerData] = useState({
    title: 'MR',
    firstName: '',
    lastName: '',
    dob: '',
    passportNumber: '',
    nationality: 'BD',
    gender: 'M'
  });

  // Contact Data State
  const [contactData, setContactData] = useState({
    email: '',
    phone: '',
    countryCode: '+880'
  });

  useEffect(() => {
    // Retrieve flight from session storage
    const storedFlight = sessionStorage.getItem('selectedFlight');
    if (!storedFlight) {
      router.push('/air-ticketing/search');
      return;
    }
    setFlight(JSON.parse(storedFlight));
  }, [router]);

  const handlePassengerChange = (newData) => {
    setPassengerData(newData);
  };

  const handleContactChange = (e) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  const handleBooking = async () => {
    setLoading(true);
    setError(null);

    // Merge data
    const finalData = {
        ...passengerData,
        email: contactData.email,
        phone: contactData.phone // Handle country code if needed
    };

    try {
      const res = await fetch('/api/air-ticketing/create-pnr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight,
          passenger: finalData
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setPnr(data.pnr);
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
  
  const getDuration = (start, end) => {
     const diff = new Date(end) - new Date(start);
     const hours = Math.floor(diff / (1000 * 60 * 60));
     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
     return `${hours}h ${minutes}m`;
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
  const pricingInfo = Array.isArray(flight.AirItineraryPricingInfo) ? flight.AirItineraryPricingInfo[0] : flight.AirItineraryPricingInfo;
  const price = pricingInfo?.ItinTotalFare;
  const baseFare = parseFloat(price?.BaseFare?.Amount || 0);
  const tax = parseFloat(price?.Taxes?.TotalTax?.Amount || 0);
  const total = parseFloat(price?.TotalFare?.Amount || 0);
  const discount = 382; // Example discount
  const serviceFee = 0;
  const aitVat = 15;
  const payable = total - discount + serviceFee + aitVat; 

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <BookingStepper />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Forms */}
            <div className="flex-1">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-200">Booking Failed</h3>
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              <PassengerForm data={passengerData} onChange={handlePassengerChange} />
              
              {/* Contact Details Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                 <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Contact Details</h2>
                 <p className="text-sm text-gray-500 mb-4">Airlines will send updates on this contact</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                        <input 
                            type="email" 
                            name="email"
                            value={contactData.email}
                            onChange={handleContactChange}
                            className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                        <div className="flex">
                             <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                🇧🇩 +880
                             </span>
                             <input 
                                type="tel" 
                                name="phone"
                                value={contactData.phone}
                                onChange={handleContactChange}
                                className="rounded-none rounded-r-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5" 
                             />
                        </div>
                    </div>
                 </div>
              </div>

               {/* Buttons */}
               <div className="flex justify-between items-center mt-8">
                  <button 
                    onClick={() => router.back()}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleBooking}
                    disabled={loading}
                    className="px-8 py-2.5 bg-[#1e1b4b] text-white font-medium rounded-lg hover:bg-[#2e2a6b] transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? 'Processing...' : 'Next'}
                  </button>
               </div>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:w-[350px] space-y-6">
              <SessionTimer />
              
              {legs.map((leg, i) => {
                 const first = leg.FlightSegment[0];
                 const last = leg.FlightSegment[leg.FlightSegment.length - 1];
                 const airlineCode = first.MarketingAirline.Code;
                 const airlineName = first.MarketingAirline.Code === 'BS' ? 'US-Bangla Airlines' : airlineCode; // Simple mapping example
                 
                 return (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Departure &nbsp; <span className="text-gray-900 dark:text-white font-bold">{formatDate(first.DepartureDateTime)}</span></p>
                       </div>
                       <button className="text-xs text-blue-600 hover:underline">View Details</button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                           <div className="text-xs text-gray-500 mb-1">{first.DepartureAirport.LocationCode}</div>
                           <div className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(first.DepartureDateTime)}</div>
                           <div className="text-xs text-gray-400">{formatDate(first.DepartureDateTime)}</div>
                        </div>
                        <div className="flex flex-col items-center px-2">
                             <div className="text-xs text-green-500 mb-1">Direct</div>
                             <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full border border-gray-300"></div>
                                <div className="w-12 border-t border-dashed border-gray-300 relative">
                                    <Plane className="w-3 h-3 text-gray-400 absolute -top-1.5 left-1/2 -translate-x-1/2 rotate-90" />
                                </div>
                                <Plane className="w-3 h-3 text-gray-900 rotate-90" />
                             </div>
                             <div className="text-xs text-gray-400 mt-1">{getDuration(first.DepartureDateTime, last.ArrivalDateTime)}</div>
                        </div>
                         <div className="text-center">
                           <div className="text-xs text-gray-500 mb-1">{last.ArrivalAirport.LocationCode}</div>
                           <div className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(last.ArrivalDateTime)}</div>
                           <div className="text-xs text-gray-400">{formatDate(last.ArrivalDateTime)}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-dashed border-gray-200">
                        <div className="flex items-center gap-2">
                            <img src={`//pic.tripcdn.com/airline_logo/3x/${airlineCode.toLowerCase()}.png`} 
                                 className="w-5 h-5 object-contain"
                                 alt={airlineCode}
                                 onError={(e) => e.target.style.display = 'none'} 
                            />
                            <span>{airlineName}, {airlineCode}-{first.FlightNumber}</span>
                        </div>
                        <div className="flex gap-3">
                            <span>Refundable</span>
                            <span>Seat: {first.ResBookDesigCode}</span>
                        </div>
                    </div>
                  </div>
                 );
              })}
              
              <div className="bg-red-50 text-red-600 text-xs p-2 rounded flex justify-between items-center">
                 <span>Total Earned Reward Points</span>
                 <span className="font-bold">+ 46</span>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 dark:text-white">Customer Price Summary</h3>
                    <div className="flex gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User className="w-3 h-3"/> 1</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3"/> 0</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3"/> 0</span>
                    </div>
                </div>
                
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Traveller 1 (Adult) <ChevronDown className="w-3 h-3 inline"/></span>
                        <span>{baseFare.toFixed(2)} BDT</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Discount</span>
                        <span className="text-green-600">-{discount.toFixed(2)} BDT</span>
                    </div>
                     <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>AIT & VAT</span>
                        <span>{aitVat.toFixed(2)} BDT</span>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-2 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                        <span>Total Payable (incl. All charges)</span>
                        <span>{(total + aitVat - discount).toFixed(2)} BDT</span>
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