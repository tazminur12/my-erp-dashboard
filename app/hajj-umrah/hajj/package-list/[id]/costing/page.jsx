'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../../component/DashboardLayout';
import {
  ArrowLeft,
  Save,
  Calculator,
  ChevronDown,
  ChevronUp,
  Package,
  Plus,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';

const numberOrEmpty = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? '' : parsed.toString();
};

const getHotelDisplayName = (hotelType) => {
  const names = {
    makkahHotel1: 'মক্কা হোটেল ০১',
    makkahHotel2: 'মক্কা হোটেল ০২',
    makkahHotel3: 'মক্কা হোটেল ০৩',
    madinaHotel1: 'মদিনা হোটেল ০১',
    madinaHotel2: 'মদিনা হোটেল ০২',
  };
  return names[hotelType] || hotelType;
};

const HajPackageCosting = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [packageInfo, setPackageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultHotelDetails = useMemo(
    () => ({
      makkahHotel1: { adult: { price: '', nights: '' }, child: { price: '', nights: '' }, infant: { price: '', nights: '' } },
      makkahHotel2: { adult: { price: '', nights: '' }, child: { price: '', nights: '' }, infant: { price: '', nights: '' } },
      makkahHotel3: { adult: { price: '', nights: '' }, child: { price: '', nights: '' }, infant: { price: '', nights: '' } },
      madinaHotel1: { adult: { price: '', nights: '' }, child: { price: '', nights: '' }, infant: { price: '', nights: '' } },
      madinaHotel2: { adult: { price: '', nights: '' }, child: { price: '', nights: '' }, infant: { price: '', nights: '' } },
    }),
    []
  );

  const initialCosts = useMemo(
    () => ({
      idCard: '',
      hajjKollan: '',
      trainFee: '',
      hajjGuide: '',
      govtServiceCharge: '',
      licenseFee: '',
      transportFee: '',
      otherBdCosts: '',
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
      campFee: '',
      hotelDetails: {},
    }),
    []
  );

  const [formData, setFormData] = useState({
    sarToBdtRate: '',
    discount: '',
  });
  const [costs, setCosts] = useState(initialCosts);
  const [collapsed, setCollapsed] = useState({ bd: false, saudi: false });
  const [hotelDetails, setHotelDetails] = useState(defaultHotelDetails);
  const [showHotelPopup, setShowHotelPopup] = useState(false);
  const [currentHotelType, setCurrentHotelType] = useState('makkahHotel1');
  const [showAirFarePopup, setShowAirFarePopup] = useState(false);
  const [airFareDetails, setAirFareDetails] = useState({
    adult: { price: '' },
    child: { price: '' },
    infant: { price: '' },
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(amount || 0);

  useEffect(() => {
    if (!id) return;

    const fetchPackageData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/packages/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          const pkg = data.package || data.data;
          setPackageInfo(pkg);
          
          setFormData({
            sarToBdtRate: numberOrEmpty(pkg.sarToBdtRate) || '1',
            discount: numberOrEmpty(pkg.costs?.discount || pkg.discount),
          });

          if (pkg.costs && typeof pkg.costs === 'object') {
            const nextCosts = { ...initialCosts };
            Object.keys(nextCosts).forEach((key) => {
              if (key !== 'hotelDetails' && key !== 'airFareDetails') {
                nextCosts[key] = numberOrEmpty(pkg.costs[key]);
              }
            });
            nextCosts.hotelDetails = pkg.costs.hotelDetails || {};
            if (pkg.costs.airFareDetails) {
              setAirFareDetails({
                adult: { price: numberOrEmpty(pkg.costs.airFareDetails.adult?.price) },
                child: { price: numberOrEmpty(pkg.costs.airFareDetails.child?.price) },
                infant: { price: numberOrEmpty(pkg.costs.airFareDetails.infant?.price) },
              });
            }
            setCosts(nextCosts);
          }

          if (pkg.costs?.hotelDetails) {
            const merged = { ...defaultHotelDetails };
            Object.keys(pkg.costs.hotelDetails).forEach((hotelKey) => {
              const h = pkg.costs.hotelDetails[hotelKey] || {};
              merged[hotelKey] = {
                adult: {
                  price: numberOrEmpty(h?.adult?.price),
                  nights: numberOrEmpty(h?.adult?.nights),
                },
                child: {
                  price: numberOrEmpty(h?.child?.price),
                  nights: numberOrEmpty(h?.child?.nights),
                },
                infant: {
                  price: numberOrEmpty(h?.infant?.price),
                  nights: numberOrEmpty(h?.infant?.nights),
                },
              };
            });
            setHotelDetails(merged);
          } else {
            setHotelDetails(defaultHotelDetails);
          }
        } else {
          throw new Error(data.error || data.message || 'Failed to fetch package');
        }
      } catch (err) {
        console.error('Error fetching package:', err);
        setError(err.message || 'Failed to load package');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageData();
  }, [id, initialCosts, defaultHotelDetails]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getHotelSummary = (hotelType) => {
    const hotel = hotelDetails?.[hotelType];
    if (!hotel) return 'কোন যাত্রী যোগ করা হয়নি';

    const adultNights = hotel.adult?.nights || '0';
    const childNights = hotel.child?.nights || '0';
    const infantNights = hotel.infant?.nights || '0';

    const parts = [];
    if (adultNights !== '0') parts.push(`Adult: ${adultNights} রাত`);
    if (childNights !== '0') parts.push(`Child: ${childNights} রাত`);
    if (infantNights !== '0') parts.push(`Infant: ${infantNights} রাত`);

    return parts.length > 0 ? parts.join(', ') : 'কোন যাত্রী যোগ করা হয়নি';
  };

  const handleHotelAddClick = (hotelType) => {
    setCurrentHotelType(hotelType);
    setShowHotelPopup(true);
  };

  const openAirFarePopup = () => {
    setShowAirFarePopup(true);
  };

  const saveAirFareDetails = () => {
    setCosts((prev) => ({
      ...prev,
      airFareDetails,
    }));
    setShowAirFarePopup(false);
  };

  const handleAirFareDetailChange = (type, value) => {
    setAirFareDetails((prev) => ({
      ...prev,
      [type]: { price: value },
    }));
  };

  // Centralized cost calculations
  const costCalc = useMemo(() => {
    const sarToBdt = parseFloat(formData.sarToBdtRate) || 1;
    const discountAmount = parseFloat(formData.discount) || 0;

    const bdCosts =
      (parseFloat(costs.idCard) || 0) +
      (parseFloat(costs.hajjKollan) || 0) +
      (parseFloat(costs.trainFee) || 0) +
      (parseFloat(costs.hajjGuide) || 0) +
      (parseFloat(costs.govtServiceCharge) || 0) +
      (parseFloat(costs.licenseFee) || 0) +
      (parseFloat(costs.transportFee) || 0) +
      (parseFloat(costs.otherBdCosts) || 0);

    // Saudi costs that need to be multiplied by SAR rate
    const saudiCostsSAR =
      (parseFloat(costs.zamzamWater) || 0) +
      (parseFloat(costs.maktab) || 0) +
      (parseFloat(costs.electronicsFee) || 0) +
      (parseFloat(costs.groundServiceFee) || 0) +
      (parseFloat(costs.makkahRoute) || 0) +
      (parseFloat(costs.baggage) || 0) +
      (parseFloat(costs.serviceCharge) || 0) +
      (parseFloat(costs.monazzem) || 0) +
      (parseFloat(costs.campFee) || 0) +
      (parseFloat(costs.visaFee) || 0) +
      (parseFloat(costs.insuranceFee) || 0);
    const saudiCostsBDT = saudiCostsSAR * sarToBdt;

    // Air fare is directly in BDT (not SAR)
    const airFareBDT =
      (parseFloat(airFareDetails.adult.price) || 0) +
      (parseFloat(airFareDetails.child.price) || 0) +
      (parseFloat(airFareDetails.infant.price) || 0);

    const hotelSar = Object.keys(hotelDetails || {}).reduce((sum, key) => {
      const h = hotelDetails[key] || {};
      const adult = (parseFloat(h.adult?.price) || 0) * (parseFloat(h.adult?.nights) || 0);
      const child = (parseFloat(h.child?.price) || 0) * (parseFloat(h.child?.nights) || 0);
      const infant = (parseFloat(h.infant?.price) || 0) * (parseFloat(h.infant?.nights) || 0);
      return sum + adult + child + infant;
    }, 0);

    const saudiCostsBD = hotelSar * sarToBdt;
    const totalBD = bdCosts + saudiCostsBDT + airFareBDT + saudiCostsBD;
    const grandTotal = Math.max(0, totalBD - discountAmount);

    // Shared costs (BD costs + Saudi costs that are NOT passenger-specific)
    const passengerShared = bdCosts + saudiCostsBDT;
    const passengerTotals = {
      adult:
        passengerShared +
        (parseFloat(airFareDetails.adult.price) || 0) +
        Object.keys(hotelDetails || {}).reduce((sum, key) => {
          const h = hotelDetails[key] || {};
          const val = (parseFloat(h.adult?.price) || 0) * (parseFloat(h.adult?.nights) || 0) * sarToBdt;
          return sum + val;
        }, 0),
      child:
        passengerShared +
        (parseFloat(airFareDetails.child.price) || 0) +
        Object.keys(hotelDetails || {}).reduce((sum, key) => {
          const h = hotelDetails[key] || {};
          const val = (parseFloat(h.child?.price) || 0) * (parseFloat(h.child?.nights) || 0) * sarToBdt;
          return sum + val;
        }, 0),
      infant:
        passengerShared +
        (parseFloat(airFareDetails.infant.price) || 0) +
        Object.keys(hotelDetails || {}).reduce((sum, key) => {
          const h = hotelDetails[key] || {};
          const val = (parseFloat(h.infant?.price) || 0) * (parseFloat(h.infant?.nights) || 0) * sarToBdt;
          return sum + val;
        }, 0),
    };

    return {
      bdCosts,
      saudiCostsBDT,
      airFareBDT,
      hotelSar,
      saudiCostsBD,
      totalBD,
      grandTotal,
      passengerTotals,
    };
  }, [costs, hotelDetails, airFareDetails, formData.sarToBdtRate, formData.discount]);

  const handleHotelDetailChange = (hotelType, passengerType, field, value) => {
    setHotelDetails((prev) => ({
      ...prev,
      [hotelType]: {
        ...prev[hotelType],
        [passengerType]: {
          ...prev[hotelType][passengerType],
          [field]: value,
        },
      },
    }));
  };

  const saveHotelDetails = () => {
    setCosts((prev) => ({ ...prev, hotelDetails }));
    setShowHotelPopup(false);
  };

  const handleCostChange = (field, value) => {
    setCosts((prev) => ({ ...prev, [field]: value }));
  };

  const parseNumbers = (obj) => {
    const parsed = {};
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      if (key === 'hotelDetails' && val && typeof val === 'object') {
        const hd = {};
        Object.keys(val).forEach((hotelKey) => {
          const hotel = val[hotelKey] || {};
          hd[hotelKey] = {
            adult: {
              price: hotel.adult?.price === '' ? 0 : parseFloat(hotel.adult?.price) || 0,
              nights: hotel.adult?.nights === '' ? 0 : parseFloat(hotel.adult?.nights) || 0,
            },
            child: {
              price: hotel.child?.price === '' ? 0 : parseFloat(hotel.child?.price) || 0,
              nights: hotel.child?.nights === '' ? 0 : parseFloat(hotel.child?.nights) || 0,
            },
            infant: {
              price: hotel.infant?.price === '' ? 0 : parseFloat(hotel.infant?.price) || 0,
              nights: hotel.infant?.nights === '' ? 0 : parseFloat(hotel.infant?.nights) || 0,
            },
          };
        });
        parsed[key] = hd;
      } else if (key === 'airFareDetails' && val && typeof val === 'object') {
        parsed[key] = {
          adult: { price: val.adult?.price === '' ? 0 : parseFloat(val.adult?.price) || 0 },
          child: { price: val.child?.price === '' ? 0 : parseFloat(val.child?.price) || 0 },
          infant: { price: val.infant?.price === '' ? 0 : parseFloat(val.infant?.price) || 0 },
        };
      } else {
        parsed[key] = val === '' ? 0 : parseFloat(val) || 0;
      }
    });
    return parsed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);

    try {
      const payload = {
        sarToBdtRate: parseFloat(formData.sarToBdtRate) || 1,
        discount: parseFloat(formData.discount) || 0,
        costs: parseNumbers({ ...costs, hotelDetails, airFareDetails })
      };

      const response = await fetch(`/api/packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...packageInfo,
          sarToBdtRate: payload.sarToBdtRate,
          costs: payload.costs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update costing');
      }

      Swal.fire({
        title: 'সফল!',
        text: 'খরচ সফলভাবে আপডেট হয়েছে',
        icon: 'success',
        confirmButtonColor: '#10B981',
        timer: 2000,
      });

      setTimeout(() => {
        router.push(`/hajj/package-list`);
      }, 2000);
    } catch (error) {
      console.error('Error updating costing:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: error.message || 'খরচ সংরক্ষণ করা যায়নি',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">প্যাকেজ লোড করা হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !packageInfo?._id) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-gray-800 dark:text-white">Package not found</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <button
              onClick={() => router.push('/hajj-umrah/hajj/package-list')}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">হজ্জ প্যাকেজ তালিকায় ফিরুন</span>
            </button>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">হজ্জ প্যাকেজ খরচ আপডেট</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {packageInfo.packageName} • {packageInfo.customPackageType || packageInfo.packageType || 'Package'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <form id="package-costing-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Basic info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">মৌলিক তথ্য</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">খরচ সংরক্ষণ করুন</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SAR → BDT রেট</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sarToBdtRate}
                        onChange={(e) => handleFormChange('sarToBdtRate', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ডিসকাউন্ট</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) => handleFormChange('discount', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Bangladesh Costs */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <header
                    className="flex items-center justify-between px-6 py-4 cursor-pointer"
                    onClick={() => setCollapsed((prev) => ({ ...prev, bd: !prev.bd }))}
                  >
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">বাংলাদেশ অংশ</h3>
                    </div>
                    {collapsed.bd ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </header>
                  {!collapsed.bd && (
                    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Air Fare details popup trigger */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          বিমান ভাড়া (যাত্রীর ধরন অনুযায়ী)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={[
                              airFareDetails.adult.price ? `Adult: ${airFareDetails.adult.price} BDT` : null,
                              airFareDetails.child.price ? `Child: ${airFareDetails.child.price} BDT` : null,
                              airFareDetails.infant.price ? `Infant: ${airFareDetails.infant.price} BDT` : null,
                            ]
                              .filter(Boolean)
                              .join(' | ') || "কোন যাত্রী যোগ করা হয়নি। 'যাত্রী যোগ করুন' বাটনে ক্লিক করুন।"}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm"
                            placeholder="কোন যাত্রী যোগ করা হয়নি। 'যাত্রী যোগ করুন' বাটনে ক্লিক করুন।"
                          />
                          <button
                            type="button"
                            onClick={openAirFarePopup}
                            className="px-3 py-2 sm:px-4 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">যাত্রী যোগ করুন</span>
                            <span className="sm:hidden">যোগ</span>
                          </button>
                        </div>
                      </div>

                      {[
                        ['idCard', 'আইডি কার্ড ফি'],
                        ['hajjKollan', 'হজ্জ কল্যাণ ফি'],
                        ['trainFee', 'ট্রেনিং ফি'],
                        ['hajjGuide', 'হজ গাইড ফি'],
                        ['govtServiceCharge', 'সরকারি সার্ভিস চার্জ'],
                        ['licenseFee', 'লাইসেন্স চার্জ ফি'],
                        ['transportFee', 'যাতায়াত ফি'],
                        ['otherBdCosts', 'অন্যান্য খরচ'],
                      ].map(([key, label]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                          <input
                            type="number"
                            step="0.01"
                            value={costs[key]}
                            onChange={(e) => handleCostChange(key, e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Saudi Costs */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <header
                    className="flex items-center justify-between px-6 py-4 cursor-pointer"
                    onClick={() => setCollapsed((prev) => ({ ...prev, saudi: !prev.saudi }))}
                  >
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">সৌদি অংশ</h3>
                    </div>
                    {collapsed.saudi ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </header>
                  {!collapsed.saudi && (
                    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Hotel summaries */}
                      {[
                        ['makkahHotel1', 'মক্কা হোটেল ০১ (যাত্রীর ধরন অনুযায়ী)'],
                        ['makkahHotel2', 'মক্কা হোটেল ০২ (যাত্রীর ধরন অনুযায়ী)'],
                        ['makkahHotel3', 'মক্কা হোটেল ০৩ (যাত্রীর ধরন অনুযায়ী)'],
                        ['madinaHotel1', 'মদিনা হোটেল ০১ (যাত্রীর ধরন অনুযায়ী)'],
                        ['madinaHotel2', 'মদিনা হোটেল ০২ (যাত্রীর ধরন অনুযায়ী)'],
                      ].map(([key, label]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={getHotelSummary(key)}
                              readOnly
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm"
                              placeholder="কোন যাত্রী যোগ করা হয়নি। 'যাত্রী যোগ করুন' বাটনে ক্লিক করুন।"
                            />
                            <button
                              type="button"
                              onClick={() => handleHotelAddClick(key)}
                              className="px-3 py-2 sm:px-4 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">যাত্রী যোগ করুন</span>
                              <span className="sm:hidden">যোগ</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Numeric Saudi fields */}
                      {[
                        ['zamzamWater', 'জমজম পানি ফি'],
                        ['maktab', 'মক্তব ফি'],
                        ['electronicsFee', 'ইলেকট্রনিক্স ফি'],
                        ['groundServiceFee', 'গ্রাউন্ড সার্ভিস ফি'],
                        ['makkahRoute', 'মক্কা রুট ফি'],
                        ['baggage', 'ব্যাগেজ ফি'],
                        ['serviceCharge', 'সার্ভিস চার্জ ফি'],
                        ['monazzem', 'মোনাজ্জেম ফি'],
                        ['campFee', 'ক্যাম্প ফি'],
                        ['visaFee', 'ভিসা ফি'],
                        ['insuranceFee', 'ইনস্যুরেন্স ফি'],
                      ].map(([key, label]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                          <input
                            type="number"
                            step="0.01"
                            value={costs[key]}
                            onChange={(e) => handleCostChange(key, e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </section>

              </form>
            </div>

            {/* Summary Panel */}
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

                  {/* Save Button */}
                  <div className="mb-6">
                    <button
                      type="submit"
                      form="package-costing-form"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      <Save className="w-4 h-4" />
                      {isSubmitting ? 'Saving...' : 'Save Costing'}
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Passenger Breakdown */}
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/30 shadow-sm">
                      {['adult', 'child', 'infant'].map((type) => {
                        const isAdult = type === 'adult';
                        const isChild = type === 'child';
                        const title = isAdult ? 'Adult (প্রাপ্তবয়স্ক)' : isChild ? 'Child (শিশু)' : 'Infant (শিশু)';
                        const colorClass = isAdult ? 'blue' : isChild ? 'green' : 'orange';
                        const totalVal = costCalc.passengerTotals[type];
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
                              {Object.keys(hotelDetails || {}).map((hotelType) => {
                                const h = hotelDetails[hotelType] || {};
                                const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
                                const price = parseFloat(h[type]?.price) || 0;
                                const nights = parseFloat(h[type]?.nights) || 0;
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
                                const otherCosts = costCalc.bdCosts + costCalc.saudiCostsBDT;
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Details Modal */}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      Total: {(((parseFloat(hotelDetails[currentHotelType]?.[type]?.price) || 0) * (parseFloat(hotelDetails[currentHotelType]?.[type]?.nights) || 0)).toFixed(2))} SAR
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
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Air Fare Details Modal */}
      {showAirFarePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">বিমান ভাড়া - যাত্রীর ধরন অনুযায়ী</h3>
                <button
                  onClick={() => setShowAirFarePopup(false)}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price (BDT)</label>
                        <input
                          type="number"
                          value={airFareDetails[type]?.price || ''}
                          onChange={(e) => handleAirFareDetailChange(type, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      Total: {(parseFloat(airFareDetails[type]?.price) || 0).toFixed(2)} BDT
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
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
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

export default HajPackageCosting;
