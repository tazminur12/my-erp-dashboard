'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Plane, DollarSign, ChevronRight, CheckCircle, User, Building2, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../component/DashboardLayout';
import Swal from 'sweetalert2';

export default function TicketCheck() {
  const router = useRouter();
  
  // Step-by-step navigation
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Loading states
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingAirlines, setIsLoadingAirlines] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Data states
  const [employeesData, setEmployeesData] = useState(null);
  const [airlinesData, setAirlinesData] = useState(null);
  const [passengerResults, setPassengerResults] = useState([]);

  // Airlines list from database
  const airlinesList = useMemo(() => {
    if (!airlinesData?.airlines || airlinesData.airlines.length === 0) {
      return [];
    }
    
    return airlinesData.airlines
      .filter(airline => {
        const isActive = airline.status === 'Active' || airline.status === 'active' || airline.isActive === true;
        return isActive;
      })
      .map(airline => {
        const name = airline.name || airline.airlineName || airline.airline_name || airline.companyName || airline.tradeName;
        return name;
      })
      .filter(Boolean)
      .sort();
  }, [airlinesData]);

  const reservationOfficers = useMemo(() => {
    if (!employeesData?.employees) return [];
    return employeesData.employees.map(emp => ({
      id: emp._id || emp.id || emp.employeeId,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeId || 'Unknown'
    }));
  }, [employeesData]);

  const [formValues, setFormValues] = useState({
    formDate: new Date().toISOString().split('T')[0], // Auto-filled with today's date
    passengerName: '',
    travellingCountry: '',
    passportNo: '',
    contactNo: '',
    isWhatsAppSame: true,
    whatsAppNo: '',
    airlineName: '',
    origin: '',
    destination: '',
    airlinesPnr: '', // Changed from bookingRef
    issuingAgentName: '',
    issuingAgentContact: '', // Added
    agentEmail: '', // Changed from email
    reservationOfficerId: '',
    serviceCharge: '' // Service Charge (BDT) - সম্পূর্ণ profit
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [passengerSearchTerm, setPassengerSearchTerm] = useState('');
  const [showPassengerResults, setShowPassengerResults] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  
  // Airline search states
  const [airlineSearchTerm, setAirlineSearchTerm] = useState('');
  const [showAirlineList, setShowAirlineList] = useState(false);
  const [filteredAirlines, setFilteredAirlines] = useState([]);

  // Fetch active employees for reservation officers
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const response = await fetch('/api/employees?status=active&limit=100&page=1');
        const data = await response.json();
        if (response.ok) {
          setEmployeesData(data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch airlines for searchable dropdown
  useEffect(() => {
    const fetchAirlines = async () => {
      setIsLoadingAirlines(true);
      try {
        const response = await fetch('/api/airlines?limit=100');
        const data = await response.json();
        if (response.ok) {
          setAirlinesData(data);
        }
      } catch (error) {
        console.error('Error fetching airlines:', error);
      } finally {
        setIsLoadingAirlines(false);
      }
    };
    fetchAirlines();
  }, []);

  // Search passengers when search term changes
  useEffect(() => {
    const searchPassengers = async () => {
      if (passengerSearchTerm.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/air-customers?search=${encodeURIComponent(passengerSearchTerm)}&limit=50`);
          const data = await response.json();
          if (response.ok && data.customers) {
            setPassengerResults(data.customers);
          } else {
            setPassengerResults([]);
          }
        } catch (error) {
          console.error('Error searching passengers:', error);
          setPassengerResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setPassengerResults([]);
      }
    };

    const timeoutId = setTimeout(searchPassengers, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [passengerSearchTerm]);

  // Filter airlines based on search
  useEffect(() => {
    if (airlineSearchTerm) {
      const filtered = airlinesList.filter(airline =>
        airline.toLowerCase().includes(airlineSearchTerm.toLowerCase())
      );
      setFilteredAirlines(filtered);
    } else {
      setFilteredAirlines(airlinesList);
    }
  }, [airlineSearchTerm, airlinesList]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowPassengerResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePassengerSelect = (passenger) => {
    setSelectedPassenger(passenger);
    setFormValues(prev => ({
      ...prev,
      passengerName: passenger.name || `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim(),
      passportNo: passenger.passportNumber || '',
      contactNo: passenger.mobile || passenger.phone || '',
      whatsAppNo: passenger.whatsappNo || passenger.mobile || '',
      agentEmail: passenger.email || '',
      isWhatsAppSame: !passenger.whatsappNo || passenger.whatsappNo === passenger.mobile
    }));
    setPassengerSearchTerm('');
    setShowPassengerResults(false);
  };

  function handleAirlineSelect(airline) {
    setAirlineSearchTerm(airline);
    updateValue('airlineName', airline);
    setShowAirlineList(false);
  }

  function updateValue(field, value) {
    setFormValues(prev => ({ ...prev, [field]: value }));
  }

  function validateEmail(email) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Calculate profit automatically - Service Charge is completely profit
  const profit = useMemo(() => {
    const serviceCharge = parseFloat(formValues.serviceCharge) || 0;
    return serviceCharge; // Service Charge is completely profit
  }, [formValues.serviceCharge]);
  
  // Step navigation functions
  const goToStep = (step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };
  
  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };
  
  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Passenger Information
        if (!formValues.passengerName || !formValues.travellingCountry || 
            !formValues.passportNo || !formValues.contactNo) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'অনুগ্রহ করে যাত্রীর সব আবশ্যক তথ্য দিন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        if (!formValues.isWhatsAppSame && !formValues.whatsAppNo) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'WhatsApp নম্বর দিন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        return true;
      case 2: // Flight Information
        if (!formValues.airlineName || !formValues.origin || !formValues.destination || 
            !formValues.airlinesPnr) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'অনুগ্রহ করে সব ফ্লাইট তথ্য দিন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        return true;
      case 3: // Agent & Officer
        if (!formValues.issuingAgentName || !formValues.issuingAgentContact || 
            !formValues.reservationOfficerId) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'অনুগ্রহ করে ইস্যুকারী এজেন্ট এবং রিজার্ভেশন অফিসার নির্বাচন করুন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        if (formValues.agentEmail && !validateEmail(formValues.agentEmail)) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'সঠিক ইমেইল ঠিকানা দিন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        return true;
      case 4: // Financial Details
        if (!formValues.serviceCharge) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'অনুগ্রহ করে সার্ভিস চার্জ দিন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };
  
  // Step definitions
  const steps = [
    { number: 1, title: 'যাত্রী তথ্য', description: 'Passenger Information' },
    { number: 2, title: 'ফ্লাইট তথ্য', description: 'Flight Information' },
    { number: 3, title: 'এজেন্ট ও অফিসার', description: 'Agent & Officer' },
    { number: 4, title: 'আর্থিক বিবরণ', description: 'Financial Details' }
  ];
  
  const getStepColor = (step, isActive, isCompleted) => {
    if (isCompleted) {
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-400',
        circle: 'bg-green-600 dark:bg-green-500'
      };
    }
    if (isActive) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-400',
        circle: 'bg-blue-600 dark:bg-blue-500'
      };
    }
    return {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-500 dark:text-gray-400',
      circle: 'bg-gray-400 dark:bg-gray-600'
    };
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Final validation
    if (!validateCurrentStep()) {
      return;
    }

    setSubmitting(true);

    // Get reservation officer name
    const selectedOfficer = reservationOfficers.find(officer => officer.id === formValues.reservationOfficerId);
    const reservationOfficerName = selectedOfficer ? selectedOfficer.name : '';

    // Prepare payload
    const payload = {
      customerId: selectedPassenger?._id || null,
      formDate: formValues.formDate,
      passengerName: formValues.passengerName,
      travellingCountry: formValues.travellingCountry,
      passportNo: formValues.passportNo,
      contactNo: formValues.contactNo,
      isWhatsAppSame: formValues.isWhatsAppSame,
      whatsAppNo: formValues.isWhatsAppSame ? formValues.contactNo : formValues.whatsAppNo,
      airlineName: formValues.airlineName,
      origin: formValues.origin,
      destination: formValues.destination,
      airlinesPnr: formValues.airlinesPnr,
      issuingAgentName: formValues.issuingAgentName,
      issuingAgentContact: formValues.issuingAgentContact,
      agentEmail: formValues.agentEmail,
      reservationOfficerId: formValues.reservationOfficerId,
      reservationOfficerName: reservationOfficerName,
      serviceCharge: parseFloat(formValues.serviceCharge) || 0,
      profit: profit, // Service Charge is completely profit
      notes: ''
    };

    try {
      const response = await fetch('/api/ticket-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitting(false);
        Swal.fire({
          title: 'সফল!',
          text: 'টিকেট চেক সফলভাবে তৈরি হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        // Reset form
        handleReset();
        setCurrentStep(1);
      } else {
        setSubmitting(false);
        Swal.fire({
          title: 'ত্রুটি!',
          text: data.error || data.message || 'টিকেট চেক তৈরি করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    } catch (error) {
      setSubmitting(false);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'টিকেট চেক তৈরি করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    }
  }

  function handleReset() {
    setFormValues({
      formDate: new Date().toISOString().split('T')[0],
      passengerName: '',
      travellingCountry: '',
      passportNo: '',
      contactNo: '',
      isWhatsAppSame: true,
      whatsAppNo: '',
      airlineName: '',
      origin: '',
      destination: '',
      airlinesPnr: '',
      issuingAgentName: '',
      issuingAgentContact: '',
      agentEmail: '',
      reservationOfficerId: '',
      serviceCharge: ''
    });
    setSelectedPassenger(null);
    setPassengerSearchTerm('');
    setAirlineSearchTerm('');
    setSubmittedMessage('');
    setCurrentStep(1);
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Plane className="w-8 h-8 text-blue-600" />
                    টিকেট চেক
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Step-by-Step টিকেট চেক প্রক্রিয়া</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between overflow-x-auto">
              {steps.map((step, index) => {
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                const stepColor = getStepColor(step.number, isActive, isCompleted);
                
                return (
                  <div key={step.number} className="flex items-center min-w-0">
                    <button
                      onClick={() => goToStep(step.number)}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${stepColor.bg} ${stepColor.text} ${currentStep >= step.number ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${stepColor.circle} text-white`}>
                        {isCompleted ? <CheckCircle className="w-3 h-3" /> : step.number}
                      </div>
                      <div className="text-left hidden sm:block">
                        <div className="text-sm font-semibold">{step.title}</div>
                        <div className="text-xs opacity-75">{step.description}</div>
                      </div>
                    </button>
                    {index < steps.length - 1 && (
                      <ChevronRight className={`w-4 h-4 mx-1 transition-colors duration-300 ${
                        isCompleted ? 'text-green-500' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} onReset={handleReset} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            {/* Step 1: Passenger Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">যাত্রী তথ্য</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Date (Auto) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">তারিখ (স্বয়ংক্রিয়)</label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.formDate}
                      readOnly
                    />
                  </div>

                  {/* Passenger Name with Search */}
                  <div className="md:col-span-2 lg:col-span-1 relative" ref={searchRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      যাত্রীর নাম
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="যাত্রী খুঁজুন বা নাম লিখুন..."
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={passengerSearchTerm || formValues.passengerName}
                        onChange={e => {
                          const value = e.target.value;
                          setPassengerSearchTerm(value);
                          if (!value) {
                            updateValue('passengerName', '');
                            setSelectedPassenger(null);
                          } else {
                            updateValue('passengerName', value);
                          }
                          setShowPassengerResults(value.trim().length >= 2);
                        }}
                        onFocus={() => {
                          setShowPassengerResults(true);
                        }}
                        required
                      />
                      {selectedPassenger && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPassenger(null);
                            setPassengerSearchTerm('');
                            updateValue('passengerName', '');
                          }}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {showPassengerResults && (
                      <div
                        ref={resultsRef}
                        className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
                      >
                        {passengerSearchTerm.trim().length >= 2 ? (
                          isSearching ? (
                            <div className="p-4 text-center">
                              <Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-600" />
                              <p className="text-sm text-gray-500 mt-2">খোঁজা হচ্ছে...</p>
                            </div>
                          ) : passengerResults.length > 0 ? (
                            <ul className="py-1">
                              {passengerResults.map((passenger) => {
                                const fullName = passenger.name || `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim();
                                return (
                                  <li
                                    key={passenger._id || passenger.id || passenger.customerId}
                                    className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                                    onClick={() => handlePassengerSelect(passenger)}
                                  >
                                    <div className="font-medium text-gray-900 dark:text-white">{fullName}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {passenger.mobile || passenger.phone ? `Phone: ${passenger.mobile || passenger.phone}` : ''}
                                      {passenger.passportNumber ? ` | Passport: ${passenger.passportNumber}` : ''}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                              কোন যাত্রী পাওয়া যায়নি
                            </div>
                          )
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Passport No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">পাসপোর্ট নম্বর</label>
                    <input
                      type="text"
                      placeholder="যেমনঃ BN0123456"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                      value={formValues.passportNo}
                      onChange={e => updateValue('passportNo', e.target.value)}
                      required
                    />
                  </div>

                  {/* Contact No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">যোগাযোগ নম্বর</label>
                    <input
                      type="tel"
                      placeholder="যেমনঃ +8801XXXXXXXXX"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                      value={formValues.contactNo}
                      onChange={e => updateValue('contactNo', e.target.value)}
                      required
                    />
                  </div>

                  {/* WhatsApp same toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      id="waSame"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formValues.isWhatsAppSame}
                      onChange={e => updateValue('isWhatsAppSame', e.target.checked)}
                    />
                    <label htmlFor="waSame" className="text-sm text-gray-700 dark:text-gray-200">WhatsApp যোগাযোগ নম্বরের মতো</label>
                  </div>

                  {/* WhatsApp No (conditional) */}
                  {!formValues.isWhatsAppSame && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">WhatsApp নম্বর</label>
                      <input
                        type="tel"
                        placeholder="যেমনঃ +8801XXXXXXXXX"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
                        value={formValues.whatsAppNo}
                        onChange={e => updateValue('whatsAppNo', e.target.value)}
                        required={!formValues.isWhatsAppSame}
                      />
                    </div>
                  )}

                  {/* Travelling Country */}
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ভ্রমণের দেশ</label>
                    <input
                      type="text"
                      placeholder="যেমনঃ Saudi Arabia"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.travellingCountry}
                      onChange={e => updateValue('travellingCountry', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Flight Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">ফ্লাইট তথ্য</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Airlines Name (Searchable) */}
                  <div className="relative">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      <Plane className="w-4 h-4" />
                      এয়ারলাইন্সের নাম
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="এয়ারলাইন খুঁজুন..."
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={airlineSearchTerm || formValues.airlineName}
                        onChange={(e) => {
                          setAirlineSearchTerm(e.target.value);
                          updateValue('airlineName', e.target.value);
                          setShowAirlineList(true);
                        }}
                        onFocus={() => setShowAirlineList(true)}
                        required
                      />
                      {airlineSearchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setAirlineSearchTerm('');
                            updateValue('airlineName', '');
                            setShowAirlineList(false);
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                    
                    {showAirlineList && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {isLoadingAirlines ? (
                          <div className="p-3 text-center text-sm text-gray-500">এয়ারলাইন লোড হচ্ছে...</div>
                        ) : filteredAirlines.length > 0 ? (
                          filteredAirlines.map((airline, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAirlineSelect(airline)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm"
                            >
                              {airline}
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-sm text-gray-500">
                            {airlinesList.length === 0 
                              ? 'ডাটাবেসে কোন এয়ারলাইন নেই। Airline List page থেকে এয়ারলাইন যোগ করুন।' 
                              : 'আপনার অনুসন্ধানের সাথে কোন এয়ারলাইন মিলেনি।'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Origin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">উৎপত্তি</label>
                    <input
                      type="text"
                      placeholder="যেমনঃ DAC"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                      value={formValues.origin}
                      onChange={e => updateValue('origin', e.target.value)}
                      required
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">গন্তব্য</label>
                    <input
                      type="text"
                      placeholder="যেমনঃ RUH"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                      value={formValues.destination}
                      onChange={e => updateValue('destination', e.target.value)}
                      required
                    />
                  </div>

                  {/* Airlines PNR */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">এয়ারলাইন্স PNR</label>
                    <input
                      type="text"
                      placeholder="যেমনঃ ABC123"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                      value={formValues.airlinesPnr}
                      onChange={e => updateValue('airlinesPnr', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Agent & Officer */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">এজেন্ট ও অফিসার তথ্য</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Issuing Agent Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      ইস্যুকারী এজেন্টের নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="এজেন্টের সম্পূর্ণ নাম"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.issuingAgentName}
                      onChange={e => updateValue('issuingAgentName', e.target.value)}
                      required
                    />
                  </div>

                  {/* Issuing Agent Contact No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      ইস্যুকারী এজেন্ট যোগাযোগ নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="যেমনঃ +8801XXXXXXXXX"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                      value={formValues.issuingAgentContact}
                      onChange={e => updateValue('issuingAgentContact', e.target.value)}
                      required
                    />
                  </div>

                  {/* Agent Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      এজেন্ট ইমেইল
                    </label>
                    <input
                      type="email"
                      placeholder="agent@example.com"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                      value={formValues.agentEmail}
                      onChange={e => updateValue('agentEmail', e.target.value)}
                    />
                  </div>

                  {/* Reservation Officer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      রিজার্ভেশন অফিসার নির্বাচন করুন <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      value={formValues.reservationOfficerId}
                      onChange={e => updateValue('reservationOfficerId', e.target.value)}
                      disabled={isLoadingEmployees}
                      required
                    >
                      <option value="" disabled>
                        {isLoadingEmployees ? 'লোড হচ্ছে...' : 'অফিসার নির্বাচন করুন'}
                      </option>
                      {reservationOfficers.length > 0 ? (
                        reservationOfficers.map(officer => (
                          <option key={officer.id} value={officer.id}>{officer.name}</option>
                        ))
                      ) : !isLoadingEmployees ? (
                        <option value="" disabled>কোন কর্মচারী পাওয়া যায়নি</option>
                      ) : null}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Financial Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">আর্থিক বিবরণ</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Service Charge (BDT) - সম্পূর্ণ profit */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      <DollarSign className="w-4 h-4" />
                      সার্ভিস চার্জ (BDT) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>৳</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full pl-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 font-english"
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
                        value={formValues.serviceCharge}
                        onChange={e => updateValue('serviceCharge', e.target.value)}
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">সার্ভিস চার্জ সম্পূর্ণ লাভ</p>
                  </div>

                  {/* Profit (Calculated from Service Charge) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">লাভ (প্রফিট)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>৳</span>
                      <input
                        type="text"
                        className={`w-full pl-7 rounded-md border-2 px-3 py-2 font-semibold font-english ${
                          profit >= 0 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
                        value={profit.toFixed(2)}
                        readOnly
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">সার্ভিস চার্জ = সম্পূর্ণ লাভ</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                type="button"
                onClick={previousStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-md border-2 font-medium transition-all duration-200 ${
                  currentStep === 1
                    ? 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                <ChevronRight className="w-4 h-4 inline-block rotate-180 mr-2" />
                পূর্ববর্তী
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ধাপ {currentStep} এর {totalSteps}
                </span>
              </div>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  পরবর্তী
                  <ChevronRight className="w-4 h-4 inline-block ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 inline-block animate-spin mr-2" />
                      সংরক্ষণ করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 inline-block mr-2" />
                      সংরক্ষণ করুন
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
