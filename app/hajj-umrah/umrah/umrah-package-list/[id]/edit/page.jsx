'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../../component/DashboardLayout';
import { 
  Plus, 
  Save, 
  Calculator, 
  Package, 
  X, 
  ChevronDown, 
  ChevronUp,
  FileText,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import Swal from 'sweetalert2';

const UmrahPackageEdit = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  // Form state
  const [formData, setFormData] = useState({
    packageName: '',
    packageYear: '',
    packageMonth: '',
    packageType: 'Regular',
    customPackageType: 'Custom Umrah',
    sarToBdtRate: '',
    status: 'Active',
    notes: ''
  });

  // Cost fields state
  const [costs, setCosts] = useState({
    airFare: '',
    makkahHotel1: '',
    makkahHotel2: '',
    makkahHotel3: '',
    madinaHotel1: '',
    madinaHotel2: '',
    zamzamWater: '',
    maktab: '',
    visaFee: '',
    insuranceFee: '',
    electronicsFee: '',
    groundServiceFee: '',
    makkahRoute: '',
    baggage: '',
    serviceCharge: '',
    monazzem: '',
    food: '',
    ziyaraFee: '',
    campFee: '',
    idCard: '',
    hajjKollan: '',
    trainFee: '',
    hajjGuide: '',
    govtServiceCharge: '',
    licenseFee: '',
    transportFee: '',
    otherBdCosts: ''
  });

  const [discount, setDiscount] = useState('');
  const [discountDetails, setDiscountDetails] = useState({
    adult: '',
    child: '',
    infant: ''
  });
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    costDetails: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Air fare popup state
  const [showAirFarePopup, setShowAirFarePopup] = useState(false);
  const [airFareDetails, setAirFareDetails] = useState({
    adult: { price: '' },
    child: { price: '' },
    infant: { price: '' }
  });

  // Hotel popup state
  const [showHotelPopup, setShowHotelPopup] = useState(false);
  const [currentHotelType, setCurrentHotelType] = useState('');
  const [hotelDetails, setHotelDetails] = useState({
    makkahHotel1: { 
      adult: { price: '', nights: '' },
      child: { price: '', nights: '' },
      infant: { price: '', nights: '' }
    },
    makkahHotel2: { 
      adult: { price: '', nights: '' },
      child: { price: '', nights: '' },
      infant: { price: '', nights: '' }
    },
    makkahHotel3: { 
      adult: { price: '', nights: '' },
      child: { price: '', nights: '' },
      infant: { price: '', nights: '' }
    },
    madinaHotel1: { 
      adult: { price: '', nights: '' },
      child: { price: '', nights: '' },
      infant: { price: '', nights: '' }
    },
    madinaHotel2: { 
      adult: { price: '', nights: '' },
      child: { price: '', nights: '' },
      infant: { price: '', nights: '' }
    }
  });

  // Fetch package data
  useEffect(() => {
    if (id) {
      fetchPackageData();
    }
  }, [id]);

  const fetchPackageData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/packages/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        const pkg = data.package || data.data;
        
        // Populate form data
        setFormData({
          packageName: pkg.packageName || '',
          packageYear: pkg.packageYear || '',
          packageMonth: pkg.packageMonth || '',
          packageType: pkg.packageType || 'Regular',
          customPackageType: pkg.customPackageType || 'Custom Umrah',
          sarToBdtRate: pkg.sarToBdtRate || '',
          status: pkg.status || 'Active',
          notes: pkg.notes || ''
        });

        // Populate costs
        if (pkg.costs) {
          const nextCosts = { ...costs };
          Object.keys(nextCosts).forEach((key) => {
            if (key !== 'hotelDetails' && key !== 'airFareDetails' && pkg.costs[key] !== undefined) {
              nextCosts[key] = pkg.costs[key] || '';
            }
          });
          setCosts(nextCosts);

          // Set air fare details
          if (pkg.costs.airFareDetails) {
            setAirFareDetails({
              adult: { price: pkg.costs.airFareDetails.adult?.price || '' },
              child: { price: pkg.costs.airFareDetails.child?.price || '' },
              infant: { price: pkg.costs.airFareDetails.infant?.price || '' }
            });
          }

          // Set hotel details
          if (pkg.costs.hotelDetails) {
            const merged = { ...hotelDetails };
            Object.keys(pkg.costs.hotelDetails).forEach((hotelKey) => {
              const h = pkg.costs.hotelDetails[hotelKey] || {};
              merged[hotelKey] = {
                adult: {
                  price: h?.adult?.price || '',
                  nights: h?.adult?.nights || '',
                },
                child: {
                  price: h?.child?.price || '',
                  nights: h?.child?.nights || '',
                },
                infant: {
                  price: h?.infant?.price || '',
                  nights: h?.infant?.nights || '',
                },
              };
            });
            setHotelDetails(merged);
          }

          // Set discount details
          if (pkg.costs.discountDetails) {
            setDiscountDetails({
              adult: pkg.costs.discountDetails.adult || '',
              child: pkg.costs.discountDetails.child || '',
              infant: pkg.costs.discountDetails.infant || ''
            });
            const totalDiscount = 
              (parseFloat(pkg.costs.discountDetails.adult) || 0) +
              (parseFloat(pkg.costs.discountDetails.child) || 0) +
              (parseFloat(pkg.costs.discountDetails.infant) || 0);
            setDiscount(totalDiscount.toString());
          } else if (pkg.costs.discount) {
            setDiscount(pkg.costs.discount.toString());
          }
        }
      } else {
        throw new Error(data.error || 'Failed to fetch package');
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'প্যাকেজ লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate package name when year, month, or packageType changes
  useEffect(() => {
    if (!formData.packageYear) {
      setFormData(prev => ({
        ...prev,
        packageName: ''
      }));
      return;
    }

    const customPackageType = 'Umrah';
    const year = formData.packageYear || '';
    const month = formData.packageMonth || '';
    const packageType = formData.packageType || 'Regular';

    const generatedName = `${customPackageType} ${year}${month ? ` ${month}` : ''} ${packageType}`;
    
    setFormData(prev => ({
      ...prev,
      packageName: generatedName
    }));
  }, [formData.packageYear, formData.packageMonth, formData.packageType]);

  const calculateTotalHotelCost = (hotelType) => {
    const hotel = hotelDetails[hotelType];
    const adultTotal = (parseFloat(hotel.adult.price) || 0) * (parseFloat(hotel.adult.nights) || 0);
    const childTotal = (parseFloat(hotel.child.price) || 0) * (parseFloat(hotel.child.nights) || 0);
    const infantTotal = (parseFloat(hotel.infant.price) || 0) * (parseFloat(hotel.infant.nights) || 0);
    return adultTotal + childTotal + infantTotal;
  };

  const calculateAllHotelCosts = () => {
    return Object.keys(hotelDetails).reduce((total, hotelType) => {
      return total + calculateTotalHotelCost(hotelType);
    }, 0);
  };

  // Calculate totals (SAR costs converted to BDT)
  const calculateTotals = useMemo(() => {
    const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
    
    const bangladeshCosts = 
      (parseFloat(costs.idCard) || 0) +
      (parseFloat(costs.hajjKollan) || 0) +
      (parseFloat(costs.trainFee) || 0) +
      (parseFloat(costs.hajjGuide) || 0) +
      (parseFloat(costs.visaFee) || 0) +
      (parseFloat(costs.govtServiceCharge) || 0) +
      (parseFloat(costs.licenseFee) || 0) +
      (parseFloat(costs.transportFee) || 0) +
      (parseFloat(costs.otherBdCosts) || 0);

    const saudiCostsRaw = 
      (parseFloat(costs.zamzamWater) || 0) +
      (parseFloat(costs.maktab) || 0) +
      (parseFloat(costs.insuranceFee) || 0) +
      (parseFloat(costs.electronicsFee) || 0) +
      (parseFloat(costs.groundServiceFee) || 0) +
      (parseFloat(costs.makkahRoute) || 0) +
      (parseFloat(costs.baggage) || 0) +
      (parseFloat(costs.serviceCharge) || 0) +
      (parseFloat(costs.monazzem) || 0) +
      (parseFloat(costs.food) || 0) +
      (parseFloat(costs.ziyaraFee) || 0) +
      (parseFloat(costs.campFee) || 0);

    const saudiCosts = saudiCostsRaw * sarToBdtRate;
    
    // Calculate hotel costs from hotelDetails state
    const hotelCostsRaw = calculateAllHotelCosts();
    const hotelCosts = hotelCostsRaw * sarToBdtRate;
    
    // Calculate air fare from airFareDetails state
    const airFareBDT =
      (parseFloat(airFareDetails.adult.price) || 0) +
      (parseFloat(airFareDetails.child.price) || 0) +
      (parseFloat(airFareDetails.infant.price) || 0);
    
    const subtotal = bangladeshCosts + saudiCosts + hotelCosts + airFareBDT;
    const grandTotal = Math.max(0, subtotal - (parseFloat(discount) || 0));

    const serviceCostsRaw = (parseFloat(costs.groundServiceFee) || 0);
    const feesRaw = (parseFloat(costs.visaFee) || 0) + (parseFloat(costs.insuranceFee) || 0) + (parseFloat(costs.electronicsFee) || 0) + (parseFloat(costs.serviceCharge) || 0);

    return {
      subtotal,
      grandTotal,
      bangladeshCosts,
      saudiCosts,
      hotelCosts,
      airFareBDT,
      serviceCosts: serviceCostsRaw * sarToBdtRate,
      fees: feesRaw * sarToBdtRate,
      airFareDetails: airFareDetails
    };
  }, [costs, hotelDetails, airFareDetails, formData.sarToBdtRate, discount]);

  const totals = calculateTotals;

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCostChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    
    setCosts(prev => ({
      ...prev,
      [name]: numericValue
    }));
  };

  // Air fare popup functions
  const handleAirFareDetailChange = (type, value) => {
    setAirFareDetails(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        price: value
      }
    }));
  };

  const saveAirFareDetails = () => {
    setCosts(prev => ({
      ...prev,
      airFareDetails: airFareDetails
    }));
    setShowAirFarePopup(false);
  };

  const openAirFarePopup = () => {
    if (costs.airFareDetails) {
      setAirFareDetails(costs.airFareDetails);
    }
    setShowAirFarePopup(true);
  };

  // Hotel popup functions
  const handleHotelDetailChange = (hotelType, passengerType, field, value) => {
    setHotelDetails(prev => ({
      ...prev,
      [hotelType]: {
        ...prev[hotelType],
        [passengerType]: {
          ...prev[hotelType][passengerType],
          [field]: value
        }
      }
    }));
  };

  const saveHotelDetails = () => {
    setCosts(prev => ({
      ...prev,
      hotelDetails: hotelDetails
    }));
    setShowHotelPopup(false);
  };

  const openHotelPopup = (hotelType) => {
    setCurrentHotelType(hotelType);
    if (costs.hotelDetails) {
      setHotelDetails(costs.hotelDetails);
    }
    setShowHotelPopup(true);
  };

  // Discount popup functions
  const handleDiscountDetailChange = (passengerType, value) => {
    setDiscountDetails(prev => ({
      ...prev,
      [passengerType]: value
    }));
  };

  const saveDiscountDetails = () => {
    const totalDiscount = 
      (parseFloat(discountDetails.adult) || 0) +
      (parseFloat(discountDetails.child) || 0) +
      (parseFloat(discountDetails.infant) || 0);
    setDiscount(totalDiscount);
    setShowDiscountPopup(false);
  };

  const openDiscountPopup = () => {
    if (costs.discountDetails) {
      setDiscountDetails(costs.discountDetails);
    }
    setShowDiscountPopup(true);
  };

  const getHotelDisplayName = (hotelType) => {
    const names = {
      makkahHotel1: 'মক্কা হোটেল ০১',
      makkahHotel2: 'মক্কা হোটেল ০২', 
      makkahHotel3: 'মক্কা হোটেল ০৩',
      madinaHotel1: 'মদিনা হোটেল ০১',
      madinaHotel2: 'মদিনা হোটেল ০২'
    };
    return names[hotelType] || hotelType;
  };

  const getHotelSummary = (hotelType) => {
    const hotel = hotelDetails[hotelType];
    if (!hotel) return 'কোন যাত্রী যোগ করা হয়নি';
    
    const adultNights = hotel.adult.nights || '0';
    const childNights = hotel.child.nights || '0';
    const infantNights = hotel.infant.nights || '0';
    
    const parts = [];
    if (adultNights !== '0') parts.push(`Adult: ${adultNights} রাত`);
    if (childNights !== '0') parts.push(`Child: ${childNights} রাত`);
    if (infantNights !== '0') parts.push(`Infant: ${infantNights} রাত`);
    
    return parts.length > 0 ? parts.join(', ') : 'কোন যাত্রী যোগ করা হয়নি';
  };

  // Calculate totals by passenger type
  const calculatePassengerTypeTotals = () => {
    const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
    
    let adultTotal = 0;
    let childTotal = 0;
    let infantTotal = 0;

    // Calculate air fare from airFareDetails state
    adultTotal += parseFloat(airFareDetails.adult?.price) || 0;
    childTotal += parseFloat(airFareDetails.child?.price) || 0;
    infantTotal += parseFloat(airFareDetails.infant?.price) || 0;

    // Calculate hotel costs from hotelDetails state
    Object.keys(hotelDetails).forEach(hotelType => {
      const hotel = hotelDetails[hotelType];
      if (hotel) {
        adultTotal += ((parseFloat(hotel.adult?.price) || 0) * (parseFloat(hotel.adult?.nights) || 0)) * sarToBdtRate;
        childTotal += ((parseFloat(hotel.child?.price) || 0) * (parseFloat(hotel.child?.nights) || 0)) * sarToBdtRate;
        infantTotal += ((parseFloat(hotel.infant?.price) || 0) * (parseFloat(hotel.infant?.nights) || 0)) * sarToBdtRate;
      }
    });

    const otherCosts = totals.bangladeshCosts + totals.saudiCosts;
    
    adultTotal += otherCosts;
    childTotal += otherCosts;
    infantTotal += otherCosts;

    let adultFinal = adultTotal - (parseFloat(discountDetails.adult) || 0);
    let childFinal = childTotal - (parseFloat(discountDetails.child) || 0);
    let infantFinal = infantTotal - (parseFloat(discountDetails.infant) || 0);
    
    adultFinal = Math.max(0, adultFinal);
    childFinal = Math.max(0, childFinal);
    infantFinal = Math.max(0, infantFinal);

    return {
      adult: adultFinal,
      child: childFinal,
      infant: infantFinal
    };
  };

  const passengerTotals = calculatePassengerTypeTotals();

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.packageName.trim()) {
      newErrors.packageName = 'Package name is required';
    }

    if (!formData.packageYear) {
      newErrors.packageYear = 'Package year is required';
    }

    if (totals.subtotal <= 0) {
      newErrors.costs = 'At least one cost must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields and add at least one cost',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        packageName: formData.packageName,
        packageYear: formData.packageYear,
        packageMonth: formData.packageMonth || '',
        packageType: formData.packageType,
        customPackageType: formData.customPackageType,
        sarToBdtRate: formData.sarToBdtRate || 0,
        notes: formData.notes,
        costs: {
          ...costs,
          discount: parseFloat(discount) || 0,
          discountDetails: discountDetails,
          airFareDetails: airFareDetails,
          hotelDetails: hotelDetails
        },
        totals: {
          bangladeshCosts: totals.bangladeshCosts,
          saudiCosts: totals.saudiCosts,
          hotelCosts: totals.hotelCosts,
          serviceCosts: totals.serviceCosts,
          fees: totals.fees,
          subtotal: totals.subtotal,
          grandTotal: totals.grandTotal,
          airFareDetails: airFareDetails,
          passengerTotals: passengerTotals
        },
        status: formData.status || 'Active'
      };

      const response = await fetch(`/api/packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update package');
      }

      Swal.fire({
        title: 'সফল!',
        text: 'উমরাহ প্যাকেজ সফলভাবে আপডেট হয়েছে',
        icon: 'success',
        confirmButtonColor: '#10B981',
        timer: 2000,
      });

      setTimeout(() => {
        router.push(`/umrah/umrah-package-list`);
      }, 2000);

    } catch (error) {
      console.error('Error updating package:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'প্যাকেজ আপডেট করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const isFormValid = formData.packageName.trim() && formData.packageYear && totals.subtotal > 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">প্যাকেজ লোড করা হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <style>{`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6">
              <button
                onClick={() => router.push('/hajj-umrah/umrah/umrah-package-list')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">উমরাহ প্যাকেজ তালিকায় ফিরুন</span>
              </button>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                উমরাহ প্যাকেজ সম্পাদনা
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                উমরাহ প্যাকেজের তথ্য আপডেট করুন
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form - Same structure as creation page */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-purple-600" />
                    মৌলিক তথ্য
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        কাস্টম প্যাকেজ টাইপ
                      </label>
                      <input
                        type="text"
                        value="Umrah"
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        সাল <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="packageYear"
                        value={formData.packageYear}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                          errors.packageYear ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="">Select Year</option>
                        <option value="2030">2030</option>
                        <option value="2029">2029</option>
                        <option value="2028">2028</option>
                        <option value="2027">2027</option>
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                        <option value="2019">2019</option>
                        <option value="2018">2018</option>
                        <option value="2017">2017</option>
                        <option value="2016">2016</option>
                        <option value="2015">2015</option>
                        <option value="2014">2014</option>
                        <option value="2013">2013</option>
                        <option value="2012">2012</option>
                        <option value="2011">2011</option>
                        <option value="2010">2010</option>
                      </select>
                      {errors.packageYear && (
                        <p className="mt-1 text-sm text-red-600">{errors.packageYear}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        মাস <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <select
                        name="packageMonth"
                        value={formData.packageMonth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">মাস নির্বাচন করুন</option>
                        <option value="January">জানুয়ারি (January)</option>
                        <option value="February">ফেব্রুয়ারি (February)</option>
                        <option value="March">মার্চ (March)</option>
                        <option value="April">এপ্রিল (April)</option>
                        <option value="May">মে (May)</option>
                        <option value="June">জুন (June)</option>
                        <option value="July">জুলাই (July)</option>
                        <option value="August">আগস্ট (August)</option>
                        <option value="September">সেপ্টেম্বর (September)</option>
                        <option value="October">অক্টোবর (October)</option>
                        <option value="November">নভেম্বর (November)</option>
                        <option value="December">ডিসেম্বর (December)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        প্যাকেজ টাইপ
                      </label>
                      <select
                        name="packageType"
                        value={formData.packageType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Regular">Regular</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          প্যাকেজ নাম <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="packageName"
                          value={formData.packageName}
                          readOnly
                          className={`w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white cursor-not-allowed ${
                            errors.packageName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        {errors.packageName && (
                          <p className="mt-1 text-sm text-red-600">{errors.packageName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          রিয়াল রেট (SAR → BDT)
                        </label>
                        <input
                          type="number"
                          name="sarToBdtRate"
                          value={formData.sarToBdtRate}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        স্ট্যাটাস
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Active">সক্রিয় (Active)</option>
                        <option value="Draft">খসড়া (Draft)</option>
                        <option value="Inactive">নিষ্ক্রিয় (Inactive)</option>
                        <option value="Suspended">স্থগিত (Suspended)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cost Details - Same as creation page */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleSection('costDetails')}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                      <span className="flex items-center">
                        <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                        খরচের বিবরণ
                      </span>
                      {collapsedSections.costDetails ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      )}
                    </h2>
                  </div>

                  {!collapsedSections.costDetails && (
                    <div className="px-6 pb-6 space-y-8">
                      {/* Bangladesh Portion */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">বাংলাদেশ অংশ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">বিমান ভাড়া</label>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="text" 
                                value={airFareDetails.adult.price || airFareDetails.child.price || airFareDetails.infant.price ? 
                                  `Adult: ${airFareDetails.adult.price || '0'}, Child: ${airFareDetails.child.price || '0'}, Infant: ${airFareDetails.infant.price || '0'}` 
                                  : 'বিস্তারিত দেখুন'} 
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                              />
                              <button
                                type="button"
                                onClick={openAirFarePopup}
                                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <Plus className="w-4 h-4" />
                                <span>বিস্তারিত</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হজ গাইড ফি</label>
                            <input type="number" name="hajjGuide" value={costs.hajjGuide} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ভিসা ফি</label>
                            <input type="number" name="visaFee" value={costs.visaFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">অন্যান্য বাংলাদেশি খরচ</label>
                            <input type="number" name="otherBdCosts" value={costs.otherBdCosts} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                          </div>
                        </div>
                      </div>

                      {/* Saudi Portion */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সৌদি অংশ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল (যাত্রীর ধরন অনুযায়ী)</label>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="text" 
                                value={getHotelSummary('makkahHotel1')} 
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                              />
                              <button
                                type="button"
                                onClick={() => openHotelPopup('makkahHotel1')}
                                className="px-2 py-2 sm:px-3 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">যাত্রী যোগ করুন</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মদিনা হোটেল (যাত্রীর ধরন অনুযায়ী)</label>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="text" 
                                value={getHotelSummary('madinaHotel1')} 
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                              />
                              <button
                                type="button"
                                onClick={() => openHotelPopup('madinaHotel1')}
                                className="px-2 py-2 sm:px-3 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">যাত্রী যোগ করুন</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">খাবার</label>
                            <input type="number" name="food" value={costs.food} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ইনস্যুরেন্স ফি</label>
                            <input type="number" name="insuranceFee" value={costs.insuranceFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">জিয়ারা ফি</label>
                            <input type="number" name="ziyaraFee" value={costs.ziyaraFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ক্যাম্প ফি</label>
                            <input type="number" name="campFee" value={costs.campFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                          </div>
                        </div>
                      </div>

                      {/* Discount */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ছাড় (যাত্রীর ধরন অনুযায়ী)</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              value={
                                discountDetails.adult || discountDetails.child || discountDetails.infant 
                                  ? `Adult: ${discountDetails.adult || '0'}, Child: ${discountDetails.child || '0'}, Infant: ${discountDetails.infant || '0'}` 
                                  : 'বিস্তারিত দেখুন'
                              } 
                              readOnly
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                            />
                            <button
                              type="button"
                              onClick={openDiscountPopup}
                              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>বিস্তারিত</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    নোট
                  </h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="প্যাকেজ সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    <span>{isSubmitting ? 'আপডেট করা হচ্ছে...' : 'প্যাকেজ আপডেট করুন'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Summary Panel - Same as creation page */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <Calculator className="w-5 h-5 text-white" />
                      </div>
                      খরচের সারসংক্ষেপ
                    </h3>
                  </div>

                  <div className="space-y-5">
                    {/* Passenger Breakdown - Same structure as creation */}
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/30 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md flex items-center justify-center mr-2">
                          <Package className="w-3.5 h-3.5 text-white" />
                        </div>
                        সম্পূর্ণ খরচ বিস্তারিত
                      </h4>
                      
                      {/* Adult, Child, Infant breakdowns - Same as creation page */}
                      {['adult', 'child', 'infant'].map((type) => {
                        const isAdult = type === 'adult';
                        const isChild = type === 'child';
                        const title = isAdult ? 'Adult (প্রাপ্তবয়স্ক)' : isChild ? 'Child (শিশু)' : 'Infant (শিশু)';
                        const colorClass = isAdult ? 'blue' : isChild ? 'green' : 'orange';
                        const totalVal = passengerTotals[type];
                        return (
                          <div
                            key={type}
                            className={`bg-white dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 mb-3 shadow-sm border border-${colorClass}-200/50 dark:border-${colorClass}-700/30`}
                          >
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                              <span className={`text-sm font-bold text-${colorClass}-700 dark:text-${colorClass}-400 flex items-center`}>
                                <div className={`w-2 h-2 bg-${colorClass}-500 rounded-full mr-2`}></div>
                                {title}
                              </span>
                              <span className={`text-base font-bold text-${colorClass}-600 dark:text-${colorClass}-400`}>
                                {formatCurrency(totalVal)}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs">
                              {airFareDetails[type]?.price && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 dark:text-gray-400">বিমান ভাড়া</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(parseFloat(airFareDetails[type]?.price) || 0)}
                                  </span>
                                </div>
                              )}
                              {Object.keys(hotelDetails).map((hotelType) => {
                                const hotel = hotelDetails[hotelType];
                                const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
                                const price = parseFloat(hotel[type]?.price) || 0;
                                const nights = parseFloat(hotel[type]?.nights) || 0;
                                const totalHotel = price * nights * sarToBdtRate;
                                if (totalHotel > 0) {
                                  return (
                                    <div key={hotelType} className="flex justify-between items-center">
                                      <span className="text-gray-600 dark:text-gray-400">{getHotelDisplayName(hotelType)}</span>
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(totalHotel)}
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                              {(() => {
                                const otherCosts = totals.bangladeshCosts + totals.saudiCosts;
                                if (otherCosts > 0) {
                                  return (
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 dark:text-gray-400">অন্যান্য খরচ (সমান)</span>
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(otherCosts)}
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Discount Summary */}
                    {discountDetails.adult || discountDetails.child || discountDetails.infant ? (
                      <div className="bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 dark:from-red-900/20 dark:via-pink-900/20 dark:to-orange-900/20 rounded-xl p-4 border-2 border-red-200 dark:border-red-700/50 shadow-md">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-red-600 to-orange-600 rounded-md flex items-center justify-center mr-2">
                            <Package className="w-3.5 h-3.5 text-white" />
                          </div>
                          ছাড় বিস্তারিত
                        </h4>
                        <div className="space-y-2.5">
                          {discountDetails.adult && (
                            <div className="flex justify-between items-center py-2.5 px-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-blue-500 shadow-sm">
                              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Adult (প্রাপ্তবয়স্ক)</span>
                              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                -{formatCurrency(discountDetails.adult)}
                              </span>
                            </div>
                          )}
                          {discountDetails.child && (
                            <div className="flex justify-between items-center py-2.5 px-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-green-500 shadow-sm">
                              <span className="text-sm font-semibold text-green-700 dark:text-green-400">Child (শিশু)</span>
                              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                -{formatCurrency(discountDetails.child)}
                              </span>
                            </div>
                          )}
                          {discountDetails.infant && (
                            <div className="flex justify-between items-center py-2.5 px-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-orange-500 shadow-sm">
                              <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Infant (শিশু)</span>
                              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                -{formatCurrency(discountDetails.infant)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 rounded-xl shadow-lg mt-2">
                            <span className="text-base font-bold text-white">মোট ছাড়</span>
                            <span className="text-base font-bold text-white">
                              -{formatCurrency(discount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Final Totals */}
                    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-300/50 dark:border-purple-700/30 shadow-lg">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                        চূড়ান্ত মোট খরচ (ছাড় পরে)
                      </h4>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/40 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-sm">
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Adult (প্রাপ্তবয়স্ক)</span>
                          <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(passengerTotals.adult)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/40 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-sm">
                          <span className="text-sm font-bold text-green-700 dark:text-green-300">Child (শিশু)</span>
                          <span className="text-base font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(passengerTotals.child)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/40 rounded-xl border-2 border-orange-300 dark:border-orange-700 shadow-sm">
                          <span className="text-sm font-bold text-orange-700 dark:text-orange-300">Infant (শিশু)</span>
                          <span className="text-base font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(passengerTotals.infant)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals - Same as creation page */}
      {/* Air Fare Popup Modal */}
      {showAirFarePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  বিমান ভাড়া বিস্তারিত
                </h3>
                <button
                  onClick={() => setShowAirFarePopup(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {['adult', 'child', 'infant'].map((type) => (
                  <div key={type} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {type === 'adult' ? 'Adult' : type === 'child' ? 'Child' : 'Infant'}
                    </h4>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price (BDT)</label>
                      <input
                        type="number"
                        value={airFareDetails[type].price}
                        onChange={(e) => handleAirFareDetailChange(type, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAirFarePopup(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAirFareDetails}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Details Popup Modal */}
      {showHotelPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getHotelDisplayName(currentHotelType)} - যাত্রীর ধরন অনুযায়ী
                </h3>
                <button
                  onClick={() => setShowHotelPopup(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {['adult', 'child', 'infant'].map((type) => (
                  <div key={type} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {type === 'adult' ? 'Adult' : type === 'child' ? 'Child' : 'Infant'}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price per Night (SAR)</label>
                        <input
                          type="number"
                          value={hotelDetails[currentHotelType]?.[type]?.price || ''}
                          onChange={(e) => handleHotelDetailChange(currentHotelType, type, 'price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Number of Nights</label>
                        <input
                          type="number"
                          value={hotelDetails[currentHotelType]?.[type]?.nights || ''}
                          onChange={(e) => handleHotelDetailChange(currentHotelType, type, 'nights', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="0"
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      Total: {((parseFloat(hotelDetails[currentHotelType]?.[type]?.price) || 0) * (parseFloat(hotelDetails[currentHotelType]?.[type]?.nights) || 0)).toFixed(2)} SAR
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowHotelPopup(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveHotelDetails}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discount Details Popup Modal */}
      {showDiscountPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  ছাড় বিস্তারিত
                </h3>
                <button
                  onClick={() => setShowDiscountPopup(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {['adult', 'child', 'infant'].map((type) => (
                  <div key={type} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {type === 'adult' ? 'Adult' : type === 'child' ? 'Child' : 'Infant'}
                    </h4>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Discount Amount (BDT)</label>
                      <input
                        type="number"
                        value={discountDetails[type]}
                        onChange={(e) => handleDiscountDetailChange(type, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDiscountPopup(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveDiscountDetails}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UmrahPackageEdit;
