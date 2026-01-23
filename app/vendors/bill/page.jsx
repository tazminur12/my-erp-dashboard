'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../component/DashboardLayout';
import { useSession } from '../../hooks/useSession';
import { 
  Building2, 
  FileText, 
  Plus, 
  Save, 
  Search, 
  Calendar,
  DollarSign,
  Package,
  Receipt,
  Loader2,
  ArrowLeft,
  Plane
} from 'lucide-react';
import Swal from 'sweetalert2';

// Default fallback bill types
const DEFAULT_BILL_TYPES = [
  { value: 'hajj', label: 'হজ্জ', description: 'হজ্জ ভেন্ডর বিল তৈরি করুন' },
  { value: 'umrah', label: 'উমরাহ', description: 'উমরাহ ভেন্ডর বিল তৈরি করুন' },
  { value: 'air-ticket', label: 'এয়ার টিকেট', description: 'এয়ার টিকেট ভেন্ডর বিল তৈরি করুন' },
  { value: 'old-ticket-reissue', label: 'পুরাতন টিকেট রি-ইস্যু', description: 'পুরাতন টিকেট রি-ইস্যু ভেন্ডর বিল তৈরি করুন' },
  { value: 'others', label: 'অন্যান্য', description: 'অন্যান্য ধরনের ভেন্ডর বিল তৈরি করুন' }
];

const VendorBillGenerate = () => {
  const router = useRouter();
  const { session, user } = useSession();

  // Form state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [showVendorList, setShowVendorList] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [billType, setBillType] = useState('');
  const [formData, setFormData] = useState({
    // Common fields
    billDate: new Date().toISOString().split('T')[0],
    billNumber: '',
    description: '',
    amount: '',
    tax: '',
    discount: '',
    totalAmount: '',
    paymentMethod: '',
    paymentStatus: 'pending',
    dueDate: '',
    notes: '',
    // Air Ticket specific fields
    tripType: 'oneway',
    flightType: 'domestic',
    bookingId: '',
    gdsPnr: '',
    airlinePnr: '',
    airline: '',
    origin: '',
    destination: '',
    flightDate: '',
    returnDate: '',
    segments: [
      { origin: '', destination: '', date: '' },
      { origin: '', destination: '', date: '' }
    ],
    agent: '',
    purposeType: '',
    adultCount: 0,
    childCount: 0,
    infantCount: 0,
    customerDeal: 0,
    customerPaid: 0,
    customerDue: 0,
    baseFare: 0,
    taxBD: 0,
    e5: 0,
    e7: 0,
    g8: 0,
    ow: 0,
    p7: 0,
    p8: 0,
    ts: 0,
    ut: 0,
    yq: 0,
    taxes: 0,
    totalTaxes: 0,
    ait: 0,
    commissionRate: 0,
    plb: 0,
    salmaAirServiceCharge: 0,
    vendorServiceCharge: 0,
    vendorAmount: 0,
    vendorPaidFh: 0,
    vendorDue: 0,
    profit: 0,
    segmentCount: 1,
    flownSegment: false,
    // Hajj/Umrah specific fields
    packageId: '',
    packageName: '',
    agentId: '',
    agentName: '',
    departureDate: '',
    customerCount: 0,
    // Hajj specific fields
    hajjYear: '',
    reasonForCollection: '',
    amountCollected: 0,
    hajjiCount: 0,
    totalPeople: 0,
    // Hotel specific fields
    hotelName: '',
    hotelLocation: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfNights: 0,
    numberOfRooms: 0,
    roomType: '',
    perNightRate: 0,
    totalRoomCost: 0,
    // Service charges and fees
    visaFee: 0,
    serviceCharge: 0,
    groundServiceFee: 0,
    transportFee: 0,
    otherCharges: 0
  });

  const [touched, setTouched] = useState({});
  const vendorDropdownRef = useRef(null);
  
  // Air Ticket Search
  const [ticketSearchId, setTicketSearchId] = useState('');
  const [selectedTicketData, setSelectedTicketData] = useState(null);
  const [searchingTicket, setSearchingTicket] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      setVendorsLoading(true);
      try {
        const response = await fetch('/api/vendors');
        const data = await response.json();
        if (response.ok) {
          setVendors(data.vendors || data.data || []);
        }
      } catch (err) {
        console.error('Error fetching vendors:', err);
      } finally {
        setVendorsLoading(false);
      }
    };
    fetchVendors();
  }, []);

  // Filter vendors based on search query
  const filteredVendors = useMemo(() => {
    if (!vendorSearchQuery.trim()) return vendors.slice(0, 50);
    const query = vendorSearchQuery.toLowerCase();
    return vendors.filter(v => 
      (v.vendorId || '').toLowerCase().includes(query) ||
      (v.tradeName || '').toLowerCase().includes(query) ||
      (v.ownerName || '').toLowerCase().includes(query) ||
      (v.contactNo || '').toLowerCase().includes(query)
    ).slice(0, 50);
  }, [vendorSearchQuery, vendors]);

  // Use manual bill types
  const billTypes = useMemo(() => {
    return DEFAULT_BILL_TYPES;
  }, []);

  // Check if selected bill type is air
  const isAirTicket = useMemo(() => {
    if (!billType) return false;
    if (billType === 'old-ticket-reissue') return false;
    return billType.toLowerCase().includes('air') || billType.toLowerCase().includes('ticket');
  }, [billType]);

  // Check if selected bill type is Hajj
  const isHajj = useMemo(() => {
    if (!billType) return false;
    return billType.toLowerCase().includes('hajj') || billType.toLowerCase().includes('haj');
  }, [billType]);

  // Check if selected bill type is Umrah
  const isUmrah = useMemo(() => {
    if (!billType) return false;
    return billType.toLowerCase().includes('umrah');
  }, [billType]);

  // Check if selected bill type is Hotel
  const isHotel = useMemo(() => {
    if (!billType) return false;
    return billType.toLowerCase().includes('hotel');
  }, [billType]);

  // Combined check for special forms
  const needsSpecialForm = useMemo(() => {
    return isAirTicket || isHajj || isUmrah || isHotel;
  }, [isAirTicket, isHajj, isUmrah, isHotel]);

  // Handle click outside to close vendor dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target)) {
        setShowVendorList(false);
      }
    };

    if (showVendorList) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVendorList]);

  // Calculate total amount (for non-special bills)
  useEffect(() => {
    if (!needsSpecialForm) {
      const amount = parseFloat(formData.amount) || 0;
      const tax = parseFloat(formData.tax) || 0;
      const discount = parseFloat(formData.discount) || 0;
      const total = amount + tax - discount;
      setFormData(prev => ({ ...prev, totalAmount: total > 0 ? total.toFixed(2) : '' }));
    }
  }, [formData.amount, formData.tax, formData.discount, needsSpecialForm]);

  // Hotel Calculations
  useEffect(() => {
    if (isHotel) {
      const nights = parseFloat(formData.numberOfNights) || 0;
      const perNight = parseFloat(formData.perNightRate) || 0;
      const rooms = parseFloat(formData.numberOfRooms) || 0;
      const visaFee = parseFloat(formData.visaFee) || 0;
      const serviceCharge = parseFloat(formData.serviceCharge) || 0;
      const groundServiceFee = parseFloat(formData.groundServiceFee) || 0;
      const transportFee = parseFloat(formData.transportFee) || 0;
      const otherCharges = parseFloat(formData.otherCharges) || 0;

      const totalRoomCost = nights * perNight * rooms;
      const totalAmount = totalRoomCost + visaFee + serviceCharge + groundServiceFee + transportFee + otherCharges;

      setFormData(prev => ({
        ...prev,
        totalRoomCost: Math.max(0, Math.round(totalRoomCost)),
        totalAmount: totalAmount > 0 ? totalAmount.toFixed(2) : '',
        amount: totalAmount > 0 ? totalAmount : prev.amount
      }));
    }
  }, [
    isHotel,
    formData.numberOfNights,
    formData.perNightRate,
    formData.numberOfRooms,
    formData.visaFee,
    formData.serviceCharge,
    formData.groundServiceFee,
    formData.transportFee,
    formData.otherCharges
  ]);

  // Hajj/Umrah Calculations
  useEffect(() => {
    if (isHajj || isUmrah) {
      const totalPeople = parseFloat(formData.totalPeople) || 0;
      const hajjiCount = parseFloat(formData.hajjiCount) || 0;
      const totalAmount = totalPeople * hajjiCount;

      setFormData(prev => ({
        ...prev,
        totalAmount: totalAmount > 0 ? totalAmount.toFixed(2) : '',
        amount: totalAmount > 0 ? totalAmount : prev.amount
      }));
    }
  }, [
    isHajj,
    isUmrah,
    formData.totalPeople,
    formData.hajjiCount
  ]);

  // Auto-calculate hotel nights from check-in/check-out dates
  useEffect(() => {
    if (isHotel && formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (checkOut > checkIn) {
        const diffTime = Math.abs(checkOut - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays !== formData.numberOfNights) {
          setFormData(prev => ({ ...prev, numberOfNights: diffDays }));
        }
      }
    }
  }, [isHotel, formData.checkInDate, formData.checkOutDate]);

  // Air Ticket Calculations
  useEffect(() => {
    if (isAirTicket) {
      const toNumber = (v) => Number(v) || 0;
      const baseFare = toNumber(formData.baseFare);
      const taxes = toNumber(formData.taxes);
      const taxBD = toNumber(formData.taxBD);
      const e5 = toNumber(formData.e5);
      const e7 = toNumber(formData.e7);
      const g8 = toNumber(formData.g8);
      const ow = toNumber(formData.ow);
      const p7 = toNumber(formData.p7);
      const p8 = toNumber(formData.p8);
      const ts = toNumber(formData.ts);
      const ut = toNumber(formData.ut);
      const yq = toNumber(formData.yq);
      const commissionRate = toNumber(formData.commissionRate);
      const plb = toNumber(formData.plb);
      const salmaAirServiceCharge = toNumber(formData.salmaAirServiceCharge);
      const vendorServiceCharge = toNumber(formData.vendorServiceCharge);

      const commissionAmount = (baseFare * commissionRate) / 100;
      const totalTaxes = taxes + taxBD + e5 + e7 + g8 + ow + p7 + p8 + ts + ut + yq;
      
      const totalTransactionAmount = baseFare + totalTaxes + salmaAirServiceCharge;
      const penalties = 0;
      const bdUtE5Tax = taxBD + ut + e5;
      const ait = Math.max(0, Math.round((totalTransactionAmount - penalties - bdUtE5Tax) * 0.003));
      
      const vendorAmount = baseFare + totalTaxes + ait + salmaAirServiceCharge + vendorServiceCharge - commissionAmount - plb;
      const customerDeal = toNumber(formData.customerDeal);
      const vendorPaidFh = toNumber(formData.vendorPaidFh);
      const customerPaid = toNumber(formData.customerPaid);

      const vendorDue = Math.max(0, Math.round(vendorAmount - vendorPaidFh));
      const profit = Math.round(customerDeal - vendorAmount);
      const customerDue = Math.max(0, Math.round(customerDeal - customerPaid));

      const finalVendorAmount = Math.max(0, Math.round(vendorAmount));
      
      setFormData(prev => ({
        ...prev,
        ait: ait,
        totalTaxes: Math.max(0, Math.round(totalTaxes)),
        vendorAmount: finalVendorAmount,
        vendorDue,
        profit,
        customerDue,
        totalAmount: finalVendorAmount > 0 ? finalVendorAmount.toFixed(2) : prev.totalAmount,
        amount: finalVendorAmount > 0 ? finalVendorAmount : prev.amount
      }));
    }
  }, [
    isAirTicket,
    formData.baseFare,
    formData.taxes,
    formData.taxBD,
    formData.e5,
    formData.e7,
    formData.g8,
    formData.ow,
    formData.p7,
    formData.p8,
    formData.ts,
    formData.ut,
    formData.yq,
    formData.commissionRate,
    formData.plb,
    formData.salmaAirServiceCharge,
    formData.vendorServiceCharge,
    formData.customerDeal,
    formData.vendorPaidFh,
    formData.customerPaid
  ]);

  // Generate bill number using category prefix if available
  useEffect(() => {
    if (billType && !formData.billNumber) {
      const selectedType = billTypes.find(bt => bt.value === billType);
      const prefix = selectedType?.prefix 
        ? selectedType.prefix.toUpperCase() 
        : billType.toUpperCase().substring(0, 3);
      const timestamp = Date.now().toString().slice(-6);
      setFormData(prev => ({ 
        ...prev, 
        billNumber: `${prefix}-${timestamp}`,
        invoiceNumber: billType === 'invoice' ? `INV-${timestamp}` : prev.invoiceNumber
      }));
    }
  }, [billType, billTypes]);

  // Keep Total Amount in sync with Vendor Amount for Air Ticket
  useEffect(() => {
    if (isAirTicket && formData.vendorAmount) {
      const vendorAmount = parseFloat(formData.vendorAmount) || 0;
      setFormData(prev => {
        if (parseFloat(prev.totalAmount) !== vendorAmount) {
          return {
            ...prev,
            totalAmount: vendorAmount > 0 ? vendorAmount.toFixed(2) : '',
            amount: vendorAmount > 0 ? vendorAmount : prev.amount
          };
        }
        return prev;
      });
    }
  }, [isAirTicket, formData.vendorAmount]);

  // Auto-calculate totalAmount for Others bill type
  useEffect(() => {
    if (billType === 'others' && formData.amount) {
      setFormData(prev => ({
        ...prev,
        totalAmount: formData.amount
      }));
    }
  }, [billType, formData.amount]);

  // Validation
  const errors = useMemo(() => {
    const errs = {};
    if (!selectedVendor) errs.vendor = 'ভেন্ডর নির্বাচন করা আবশ্যক';
    if (!billType) errs.billType = 'বিলের ধরন নির্বাচন করা আবশ্যক';
    if (!formData.billDate) errs.billDate = 'বিলের তারিখ প্রয়োজন';
    if (!formData.amount || parseFloat(formData.amount) <= 0) errs.amount = 'সঠিক পরিমাণ প্রয়োজন';
    if (billType === 'others' && !formData.description) errs.description = 'বিলের ধরণ প্রয়োজন';
    if (billType === 'others' && !formData.totalAmount) errs.totalAmount = 'মোট পরিমাণ প্রয়োজন';
    return errs;
  }, [selectedVendor, billType, formData]);

  const hasError = (field) => touched[field] && errors[field];

  // Handle vendor selection
  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setVendorSearchQuery(vendor.vendorId || vendor._id);
    setShowVendorList(false);
    setTouched(prev => ({ ...prev, vendor: true }));
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Handle Search by Ticket ID
  const handleSearchTicket = async () => {
    if (!ticketSearchId.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'টিকেট আইডি প্রয়োজন',
        text: 'অনুগ্রহ করে Ticket ID (TKT...) বা Booking ID লিখুন',
      });
      return;
    }

    setSearchingTicket(true);
    try {
      const response = await fetch(`/api/air-tickets/${ticketSearchId}`);
      const data = await response.json();
      
      const ticket = data.ticket || data.data;
      
      if (response.ok && ticket) {
        setSelectedTicketData(ticket);
        
        const formatDate = (dateString) => {
          if (!dateString) return '';
          try {
            return new Date(dateString).toISOString().split('T')[0];
          } catch {
            return '';
          }
        };

        const getNumber = (value) => {
          const num = Number(value);
          return isNaN(num) ? 0 : num;
        };
        
        setFormData(prev => ({
          ...prev,
          bookingId: ticket?.bookingId || '',
          gdsPnr: ticket?.gdsPnr || '',
          airlinePnr: ticket?.airlinePnr || '',
          airline: ticket?.airline || '',
          origin: ticket?.origin || '',
          destination: ticket?.destination || '',
          flightDate: formatDate(ticket?.flightDate),
          returnDate: formatDate(ticket?.returnDate),
          tripType: ticket?.tripType || 'oneway',
          flightType: ticket?.flightType || 'domestic',
          adultCount: getNumber(ticket?.adultCount),
          childCount: getNumber(ticket?.childCount),
          infantCount: getNumber(ticket?.infantCount),
          agent: ticket?.agent || '',
          purposeType: ticket?.purposeType || '',
          segments: Array.isArray(ticket?.segments) && ticket.segments.length > 0
            ? ticket.segments.map(seg => ({
                origin: seg?.origin || '',
                destination: seg?.destination || '',
                date: formatDate(seg?.date)
              }))
            : prev.segments,
          segmentCount: getNumber(ticket?.segmentCount) || (ticket?.segments?.length || 1),
          flownSegment: ticket?.flownSegment || false,
          vendorAmount: getNumber(ticket?.vendorAmount || ticket?.vendorDeal || 0),
          totalAmount: getNumber(ticket?.vendorAmount || ticket?.vendorDeal || 0),
          customerDeal: getNumber(ticket?.customerDeal),
          customerPaid: getNumber(ticket?.customerPaid),
          customerDue: getNumber(ticket?.customerDue),
          vendorPaidFh: getNumber(ticket?.vendorPaidFh),
          vendorDue: getNumber(ticket?.vendorDue),
          profit: getNumber(ticket?.profit),
          baseFare: getNumber(ticket?.baseFare),
          taxBD: getNumber(ticket?.taxBD),
          e5: getNumber(ticket?.e5),
          e7: getNumber(ticket?.e7),
          g8: getNumber(ticket?.g8),
          ow: getNumber(ticket?.ow),
          p7: getNumber(ticket?.p7),
          p8: getNumber(ticket?.p8),
          ts: getNumber(ticket?.ts),
          ut: getNumber(ticket?.ut),
          yq: getNumber(ticket?.yq),
          taxes: getNumber(ticket?.taxes),
          totalTaxes: getNumber(ticket?.totalTaxes),
          commissionRate: getNumber(ticket?.commissionRate),
          plb: getNumber(ticket?.plb),
          salmaAirServiceCharge: getNumber(ticket?.salmaAirServiceCharge),
          vendorServiceCharge: getNumber(ticket?.vendorServiceCharge),
          ait: getNumber(ticket?.ait),
        }));
        
        Swal.fire({
          icon: 'success',
          title: 'টিকেট পাওয়া গেছে!',
          text: `টিকেট ${ticket?.ticketId || ticket?.bookingId || ticket?._id || ticketSearchId} সফলভাবে লোড হয়েছে।`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error('টিকেট পাওয়া যায়নি');
      }
    } catch (error) {
      console.error('Ticket search error:', error);
      Swal.fire({
        icon: 'error',
        title: 'টিকেট পাওয়া যায়নি',
        text: error.message || 'টিকেট খুঁজে পাওয়া যায়নি।',
      });
      setSelectedTicketData(null);
    } finally {
      setSearchingTicket(false);
    }
  };

  // Handle bill type change
  const handleBillTypeChange = (type) => {
    setBillType(type);
    setTouched(prev => ({ ...prev, billType: true }));
    // Reset form data except common fields
    setFormData(prev => ({
      billDate: prev.billDate,
      billNumber: '',
      description: '',
      amount: '',
      tax: '',
      discount: '',
      totalAmount: '',
      paymentMethod: '',
      paymentStatus: 'pending',
      dueDate: '',
      notes: '',
      // Reset all special fields
      tripType: 'oneway',
      flightType: 'domestic',
      bookingId: '',
      gdsPnr: '',
      airlinePnr: '',
      airline: '',
      origin: '',
      destination: '',
      flightDate: '',
      returnDate: '',
      segments: [
        { origin: '', destination: '', date: '' },
        { origin: '', destination: '', date: '' }
      ],
      agent: '',
      purposeType: '',
      adultCount: 0,
      childCount: 0,
      infantCount: 0,
      customerDeal: 0,
      customerPaid: 0,
      customerDue: 0,
      baseFare: 0,
      taxBD: 0,
      e5: 0,
      e7: 0,
      g8: 0,
      ow: 0,
      p7: 0,
      p8: 0,
      ts: 0,
      ut: 0,
      yq: 0,
      taxes: 0,
      totalTaxes: 0,
      ait: 0,
      commissionRate: 0,
      plb: 0,
      salmaAirServiceCharge: 0,
      vendorServiceCharge: 0,
      vendorAmount: 0,
      vendorPaidFh: 0,
      vendorDue: 0,
      profit: 0,
      segmentCount: 1,
      flownSegment: false,
      packageId: '',
      packageName: '',
      agentId: '',
      agentName: '',
      departureDate: '',
      customerCount: 0,
      hajjYear: '',
      reasonForCollection: '',
      amountCollected: 0,
      hajjiCount: 0,
      totalPeople: 0,
      hotelName: '',
      hotelLocation: '',
      checkInDate: '',
      checkOutDate: '',
      numberOfNights: 0,
      numberOfRooms: 0,
      roomType: '',
      perNightRate: 0,
      totalRoomCost: 0,
      visaFee: 0,
      serviceCharge: 0,
      groundServiceFee: 0,
      transportFee: 0,
      otherCharges: 0
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({
      vendor: true,
      billType: true,
      billDate: true,
      amount: true,
    });

    if (Object.keys(errors).length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'যাচাইকরণ ত্রুটি',
        text: 'অনুগ্রহ করে সব আবশ্যক ক্ষেত্র সঠিকভাবে পূরণ করুন।',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const vendorId = selectedVendor.vendorId || selectedVendor._id;
      
      const billData = {
        vendorId,
        vendorName: selectedVendor.tradeName,
        billType,
        billDate: formData.billDate,
        billNumber: formData.billNumber || '',
        description: formData.description || '',
        totalAmount: parseFloat(formData.totalAmount) || parseFloat(formData.amount) || 0,
        amount: parseFloat(formData.amount) || parseFloat(formData.totalAmount) || 0,
        tax: parseFloat(formData.tax) || 0,
        discount: parseFloat(formData.discount) || 0,
        paymentMethod: formData.paymentMethod || '',
        paymentStatus: formData.paymentStatus || 'pending',
        dueDate: formData.dueDate || '',
        notes: formData.notes || '',
        createdBy: user?.email || session?.user?.email || 'unknown',
        branchId: user?.branchId || 'main_branch',
        createdAt: new Date().toISOString(),
        ...formData
      };

      const response = await fetch(`/api/vendors/${vendorId}/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: 'ভেন্ডর বিল সফলভাবে তৈরি করা হয়েছে',
          confirmButtonColor: '#7c3aed',
        });
        router.push('/vendors');
      } else {
        throw new Error(data.error || 'Failed to create bill');
      }
    } catch (error) {
      console.error('Failed to create bill:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: error.message || 'বিল তৈরি করতে ব্যর্থ হয়েছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Air Ticket Form (simplified - only 4 fields)
  const renderAirTicketForm = () => {
    return (
      <div className="space-y-6">
        {/* Search by Ticket ID */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-purple-600" />
            সার্চ বাই টিকেট আইডি (Ticket ID / Booking ID)
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={ticketSearchId}
              onChange={(e) => setTicketSearchId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchTicket()}
              placeholder="Ticket ID (TKT...) বা Booking ID লিখুন..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={searchingTicket}
            />
            <button
              type="button"
              onClick={handleSearchTicket}
              disabled={searchingTicket}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searchingTicket ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  খুঁজছি...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  খুঁজুন
                </>
              )}
            </button>
          </div>
          {selectedTicketData && (
            <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                    টিকেট সফলভাবে লোড হয়েছে!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-700 dark:text-green-400">
                    {selectedTicketData?.ticketId && (
                      <div>
                        <span className="font-medium">টিকেট আইডি:</span> <strong className="text-blue-600 dark:text-blue-400">{selectedTicketData.ticketId}</strong>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">বুকিং আইডি:</span> <strong>{selectedTicketData?.bookingId || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="font-medium">GDS PNR:</span> <strong>{selectedTicketData?.gdsPnr || 'N/A'}</strong>
                    </div>
                    {formData.vendorAmount > 0 && (
                      <div>
                        <span className="font-medium">ভেন্ডর পরিমাণ:</span> <strong>৳{Number(formData.vendorAmount || 0).toLocaleString('bn-BD')}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Auto GDS PNR */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            স্বয়ংক্রিয় GDS PNR
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GDS PNR
            </label>
            <input
              type="text"
              name="gdsPnr"
              value={formData.gdsPnr}
              readOnly
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
              placeholder="টিকেট সার্চ থেকে স্বয়ংক্রিয়ভাবে পূরণ হবে"
            />
          </div>
        </div>

        {/* Vendor Bill */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            ভেন্ডর বিল
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ভেন্ডর পরিমাণ <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="vendorAmount"
              value={formData.vendorAmount}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Total Amount */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            মোট পরিমাণ
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              মোট পরিমাণ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 text-sm">৳</span>
              </div>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Hajj/Umrah Form
  const renderHajjUmrahForm = () => {
    const typeLabel = isHajj ? 'Hajj' : 'Umrah';
    const yearFieldLabel = isHajj ? 'Hajj Year' : 'Umrah Year';
    const countFieldLabel = isHajj ? 'হাজী সংখ্যা' : 'উমরাহযাত্রী সংখ্যা';
    const totalDescription = isHajj 
      ? '(জন প্রতি টাকা × হাজী সংখ্যা)' 
      : '(জন প্রতি টাকা × উমরাহযাত্রী সংখ্যা)';
    
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            {typeLabel} বিবরণ
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {yearFieldLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hajjYear"
                value={formData.hajjYear}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="যেমন: ২০২৪, ২০২৫"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                কি বাবদ টাকা জমা হচ্ছে <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reasonForCollection"
                value={formData.reasonForCollection}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="টাকা জমা হওয়ার কারণ লিখুন"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {countFieldLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hajjiCount"
                value={formData.hajjiCount}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                জন প্রতি টাকা <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="number"
                  name="totalPeople"
                  value={formData.totalPeople}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  মোট পরিমাণ
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 text-sm">৳</span>
                  </div>
                  <input
                    type="text"
                    name="totalAmount"
                    value={(formData.totalPeople * formData.hajjiCount).toFixed(2) || formData.totalAmount}
                    readOnly
                    className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {totalDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Hotel Form
  const renderHotelForm = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            হোটেল বিবরণ
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                হোটেলের নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hotelName"
                value={formData.hotelName}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="হোটেলের নাম"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                হোটেলের অবস্থান
              </label>
              <input
                type="text"
                name="hotelLocation"
                value={formData.hotelLocation}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="মক্কা / মদিনা / অন্যান্য"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                চেক-ইন তারিখ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                চেক-আউট তারিখ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                রাতের সংখ্যা
              </label>
              <input
                type="number"
                name="numberOfNights"
                value={formData.numberOfNights}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                রুমের সংখ্যা <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="numberOfRooms"
                value={formData.numberOfRooms}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                রুমের ধরন
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">রুমের ধরন নির্বাচন করুন</option>
                <option value="single">সিঙ্গল</option>
                <option value="double">ডাবল</option>
                <option value="triple">ট্রিপল</option>
                <option value="quad">কোয়াড</option>
                <option value="suite">স্যুট</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                প্রতি রাতের হার <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="number"
                  name="perNightRate"
                  value={formData.perNightRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                মোট রুম খরচ
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="number"
                  name="totalRoomCost"
                  value={formData.totalRoomCost}
                  readOnly
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            অতিরিক্ত চার্জ
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ভিসা ফি
              </label>
              <input
                type="number"
                name="visaFee"
                value={formData.visaFee}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                সেবা চার্জ
              </label>
              <input
                type="number"
                name="serviceCharge"
                value={formData.serviceCharge}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                গ্রাউন্ড সেবা ফি
              </label>
              <input
                type="number"
                name="groundServiceFee"
                value={formData.groundServiceFee}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                পরিবহন ফি
              </label>
              <input
                type="number"
                name="transportFee"
                value={formData.transportFee}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                অন্যান্য চার্জ
              </label>
              <input
                type="number"
                name="otherCharges"
                value={formData.otherCharges}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                মোট পরিমাণ
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="text"
                  name="totalAmount"
                  value={formData.totalAmount}
                  readOnly
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Others Form
  const renderOthersForm = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            বিলের বিবরণ
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                বিলের ধরণ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  hasError('description') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="বিলের ধরণ লিখুন (যেমন: পরিবহন খরচ, অফিস সরঞ্জাম, ইত্যাদি)"
              />
              {hasError('description') && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                পরিমাণ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  onBlur={() => setTouched(prev => ({ ...prev, amount: true }))}
                  min="0"
                  step="0.01"
                  className={`w-full pl-7 pr-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    hasError('amount') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {hasError('amount') && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                বিস্তারিত নোট
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="বিলের বিস্তারিত বিবরণ লিখুন..."
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                মোট পরিমাণ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount || formData.amount}
                  onChange={handleInputChange}
                  onBlur={() => setTouched(prev => ({ ...prev, totalAmount: true }))}
                  min="0"
                  step="0.01"
                  className={`w-full pl-7 pr-3 py-3 rounded-lg border-2 bg-purple-50 dark:bg-purple-900/20 text-gray-900 dark:text-gray-100 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    hasError('totalAmount') ? 'border-red-500' : 'border-purple-300 dark:border-purple-700'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {hasError('totalAmount') && (
                <p className="mt-1 text-sm text-red-600">{errors.totalAmount}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                মোট বিল পরিমাণ
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Old Ticket Reissue Form
  const renderOldTicketReissueForm = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-purple-600" />
            পুরাতন টিকেট রি-ইস্যু বিবরণ
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                এয়ারলাইন <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="airlineName"
                value={formData.airlineName}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="যেমন: বিমান বাংলাদেশ এয়ারলাইন্স"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                PNR <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="gdsPnr"
                value={formData.gdsPnr}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="যেমন: ABC123"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              মোট পরিমাণ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 text-sm">৳</span>
              </div>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full pl-7 pr-3 py-3 rounded-lg border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 text-gray-900 dark:text-gray-100 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              মোট বিল পরিমাণ
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                ভেন্ডর বিল তৈরি করুন
              </h1>
              <p className="text-gray-600 dark:text-gray-400">ভেন্ডর বিল তৈরি এবং জেনারেট করুন</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/vendors')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
        </div>

        {/* Main Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Vendor Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                ধাপ ১: ভেন্ডর নির্বাচন করুন
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ভেন্ডর <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={vendorDropdownRef}>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={selectedVendor ? (selectedVendor.vendorId || selectedVendor._id) : vendorSearchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVendorSearchQuery(val);
                      setShowVendorList(true);
                      if (val === '') {
                        setSelectedVendor(null);
                      }
                      setTouched(prev => ({ ...prev, vendor: true }));
                    }}
                    onFocus={() => setShowVendorList(true)}
                    placeholder="ভেন্ডর আইডি, নাম বা যোগাযোগ দিয়ে খুঁজুন..."
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      hasError('vendor') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                  />
                  {vendorsLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    </div>
                  )}
                  
                  {showVendorList && !vendorsLoading && (
                    <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredVendors.length > 0 ? (
                        filteredVendors.map((vendor) => (
                          <button
                            type="button"
                            key={vendor._id || vendor.vendorId}
                            onClick={() => handleVendorSelect(vendor)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                              selectedVendor?._id === vendor._id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {vendor.vendorId || vendor._id}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {vendor.tradeName} • {vendor.ownerName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {vendor.tradeLocation} • {vendor.contactNo}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          কোনো ভেন্ডর পাওয়া যায়নি
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {hasError('vendor') && (
                  <p className="mt-1 text-sm text-red-600">{errors.vendor}</p>
                )}
                {selectedVendor && (
                  <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                      নির্বাচিত: {selectedVendor.tradeName}
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      {selectedVendor.ownerName} • {selectedVendor.contactNo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Bill Type Selection */}
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                ধাপ ২: বিলের ধরন নির্বাচন করুন
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  বিলের ধরন <span className="text-red-500">*</span>
                </label>
                <select
                  name="billType"
                  value={billType}
                  onChange={(e) => handleBillTypeChange(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, billType: true }))}
                  className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    hasError('billType') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <option value="">বিলের ধরন নির্বাচন করুন</option>
                  {billTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {hasError('billType') && (
                  <p className="mt-1 text-sm text-red-600">{errors.billType}</p>
                )}
              </div>
            </div>

            {/* Step 3: Form Fields */}
            {billType && (
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  ধাপ ৩: বিলের বিবরণ পূরণ করুন
                </h2>

                {/* Show Special Forms based on bill type */}
                {billType === 'old-ticket-reissue' ? (
                  renderOldTicketReissueForm()
                ) : isAirTicket ? (
                  renderAirTicketForm()
                ) : isHajj || isUmrah ? (
                  renderHajjUmrahForm()
                ) : isHotel ? (
                  renderHotelForm()
                ) : billType === 'others' ? (
                  renderOthersForm()
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Common Fields */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          বিলের তারিখ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="date"
                            name="billDate"
                            value={formData.billDate}
                            onChange={handleInputChange}
                            onBlur={() => setTouched(prev => ({ ...prev, billDate: true }))}
                            className={`w-full pl-10 pr-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                              hasError('billDate') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                            }`}
                          />
                        </div>
                        {hasError('billDate') && (
                          <p className="mt-1 text-sm text-red-600">{errors.billDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          বিল নম্বর
                        </label>
                        <input
                          type="text"
                          name="billNumber"
                          value={formData.billNumber}
                          onChange={handleInputChange}
                          placeholder="স্বয়ংক্রিয়ভাবে তৈরি হবে"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          পরিমাণ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 text-sm">৳</span>
                          </div>
                          <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            onBlur={() => setTouched(prev => ({ ...prev, amount: true }))}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={`w-full pl-7 pr-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                              hasError('amount') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                            }`}
                          />
                        </div>
                        {hasError('amount') && (
                          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          মোট পরিমাণ
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 text-sm">৳</span>
                          </div>
                          <input
                            type="text"
                            name="totalAmount"
                            value={formData.totalAmount}
                            readOnly
                            className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        নোট
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="অতিরিক্ত নোট বা মন্তব্য..."
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/vendors')}
                className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedVendor || !billType}
                className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    বিল তৈরি করুন
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorBillGenerate;
