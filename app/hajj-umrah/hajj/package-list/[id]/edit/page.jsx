'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

const HajPackageEdit = () => {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id; // assuming dynamic route: /hajj/package/edit/[id]

  // Form state - same structure as creation
  const [formData, setFormData] = useState({
    packageName: '',
    packageYear: '',
    arbiYear: '',
    packageCategory: 'A',
    packageType: 'Fitra',
    customPackageType: 'Haj Selection',
    sarToBdtRate: '',
    status: 'Active',
    notes: ''
  });

  const [costs, setCosts] = useState({
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
    campFee: ''
  });

  const [discount, setDiscount] = useState('');
  const [discountDetails, setDiscountDetails] = useState({
    adult: '',
    child: '',
    infant: ''
  });

  const [airFareDetails, setAirFareDetails] = useState({
    adult: { price: '' },
    child: { price: '' },
    infant: { price: '' }
  });

  const [hotelDetails, setHotelDetails] = useState({
    makkahHotel1: { adult: { price: '', nights: '' }, child: { price: '', nights: '' }, infant: { price: '', nights: '' } },
    makkahHotel2: { adult: { price: '', nights: '' }, child: { price: '', nights: '' }, infant: { price: '', nights: '' } },
    makkahHotel3: { adult: { price: '', nights: '' }, child: { price: '', nights: '' }, infant: { price: '', nights: '' } },
    madinaHotel1: { adult: { price: '', nights: '' }, child: { price: '', nights: '' }, infant: { price: '', nights: '' } },
    madinaHotel2: { adult: { price: '', nights: '' }, child: { price: '', nights: '' }, infant: { price: '', nights: '' } }
  });

  const [collapsedSections, setCollapsedSections] = useState({ costDetails: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAirFarePopup, setShowAirFarePopup] = useState(false);
  const [showHotelPopup, setShowHotelPopup] = useState(false);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [currentHotelType, setCurrentHotelType] = useState('');

  // ───────────────────────────────────────────────
  // 1. Load existing package data
  // ───────────────────────────────────────────────
  useEffect(() => {
    if (!packageId) return;

    const fetchPackage = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/packages/${packageId}`);
        
        if (!res.ok) {
          throw new Error('Package not found');
        }

        const data = await res.json();

        // Populate formData
        setFormData({
          packageName: data.packageName || '',
          packageYear: data.packageYear || '',
          arbiYear: data.arbiYear || '',
          packageCategory: data.packageCategory || 'A',
          packageType: data.packageType || 'Fitra',
          customPackageType: data.customPackageType || 'Haj Selection',
          sarToBdtRate: data.sarToBdtRate?.toString() || '',
          status: data.status || 'Active',
          notes: data.notes || ''
        });

        // Populate costs
        if (data.costs) {
          setCosts(data.costs);

          // Nested objects
          if (data.costs.airFareDetails) {
            setAirFareDetails(data.costs.airFareDetails);
          }
          if (data.costs.hotelDetails) {
            setHotelDetails(data.costs.hotelDetails);
          }
          if (data.costs.discountDetails) {
            setDiscountDetails(data.costs.discountDetails);
            setDiscount(data.costs.discount?.toString() || '');
          }
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load package data',
          icon: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  // Auto-generate package name (same logic as create)
  useEffect(() => {
    if (!formData.packageYear) {
      setFormData(prev => ({ ...prev, packageName: '' }));
      return;
    }

    const year = formData.packageYear || '';
    const arbi = formData.arbiYear ? ` ${formData.arbiYear}` : '';
    const type = formData.packageType || 'Fitra';
    const cat = formData.packageCategory || 'A';

    const name = `Haj ${year}${arbi} ${type} ${cat}`;
    setFormData(prev => ({ ...prev, packageName: name }));
  }, [
    formData.packageYear,
    formData.arbiYear,
    formData.packageType,
    formData.packageCategory
  ]);

  // ───────────────────────────────────────────────
  // Reuse same calculation logic from your create page
  // (copy-paste calculateTotals, calculatePassengerTypeTotals, etc.)
  // ───────────────────────────────────────────────

  const calculateTotals = useMemo(() => {
    // ... same as your original calculateTotals logic ...
    // (paste your full calculateTotals code here)
    // Make sure to return the same shape of object
  }, [costs, hotelDetails, airFareDetails, formData.sarToBdtRate, discount]);

  const calculatePassengerTypeTotals = useMemo(() => {
    // ... same as your original passenger type calculation ...
  }, [/* dependencies */]);

  const totals = calculateTotals;
  const passengerTotals = calculatePassengerTypeTotals;

  // ───────────────────────────────────────────────
  // Handlers (mostly same as create, just renamed some)
  // ───────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setCosts(prev => ({ ...prev, [name]: parseFloat(value) || '' }));
  };

  // ... keep all other handlers: handleAirFareDetailChange, handleHotelDetailChange, etc.

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!packageId) return;

    // Optional: add your validateForm() check here

    setIsSubmitting(true);

    try {
      const payload = {
        // same structure as create
        packageName: formData.packageName,
        packageYear: formData.packageYear,
        arbiYear: formData.arbiYear || '',
        packageCategory: formData.packageCategory,
        packageType: formData.packageType,
        customPackageType: formData.customPackageType,
        sarToBdtRate: parseFloat(formData.sarToBdtRate) || 0,
        notes: formData.notes,
        costs: {
          ...costs,
          discount: parseFloat(discount) || 0,
          discountDetails,
          airFareDetails,
          hotelDetails
        },
        totals: {
          // same as create
          bangladeshCosts: totals.bangladeshCosts,
          saudiCosts: totals.saudiCosts,
          // ...
          passengerTotals
        },
        status: formData.status
      };

      const res = await fetch(`/api/packages/${packageId}`, {
        method: 'PATCH',   // or PUT — depending on your backend
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Update failed');
      }

      Swal.fire({
        title: 'সফল!',
        text: 'প্যাকেজ সফলভাবে আপডেট হয়েছে',
        icon: 'success',
        timer: 2000
      });

      setTimeout(() => {
        router.push('/hajj-umrah/hajj/package-list');
      }, 1800);

    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'ত্রুটি!',
        text: err.message || 'আপডেট করতে সমস্যা হয়েছে',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600" />
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">প্যাকেজ লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        {/* ─────────────────────────────────────────────── */}
        {/* Header - Changed title & back button text */}
        {/* ─────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>প্যাকেজ তালিকায় ফিরুন</span>
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                হজ্জ প্যাকেজ সম্পাদনা
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                প্যাকেজ আইডি: {packageId}
              </p>
            </div>
          </div>

          {/* The rest of your form is almost identical to create page */}
          {/* Just change button text & header icons where needed */}

          {/* ... paste your full form JSX here ... */}
          {/* Change only these parts: */}

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg flex items-center space-x-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>আপডেট হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>

          {/* ... rest of your JSX (popups, summary panel, etc.) remains same ... */}

        </div>
      </div>

      {/* Keep all your popup modals as they are */}

    </DashboardLayout>
  );
};

export default HajPackageEdit;