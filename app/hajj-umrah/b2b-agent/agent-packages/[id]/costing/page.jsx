'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../../component/DashboardLayout';
import { 
  ArrowLeft, 
  Save, 
  Calculator, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

const AgentPackageCosting = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  // Package details state
  const [packageInfo, setPackageInfo] = useState(null);
  const [packageLoading, setPackageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    sarToBdtRate: '',
    discount: ''
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
    idCard: '',
    hajjKollan: '',
    trainFee: '',
    hajjGuide: '',
    govtServiceCharge: '',
    licenseFee: '',
    transportFee: '',
    otherBdCosts: ''
  });

  // Passenger types state
  const [bangladeshVisaPassengers, setBangladeshVisaPassengers] = useState([]);
  const [bangladeshAirfarePassengers, setBangladeshAirfarePassengers] = useState([]);
  const [bangladeshBusPassengers, setBangladeshBusPassengers] = useState([]);
  const [bangladeshTrainingOtherPassengers, setBangladeshTrainingOtherPassengers] = useState([]);
  const [saudiVisaPassengers, setSaudiVisaPassengers] = useState([]);
  const [saudiMakkahHotelPassengers, setSaudiMakkahHotelPassengers] = useState([]);
  const [saudiMadinaHotelPassengers, setSaudiMadinaHotelPassengers] = useState([]);
  const [saudiMakkahFoodPassengers, setSaudiMakkahFoodPassengers] = useState([]);
  const [saudiMadinaFoodPassengers, setSaudiMadinaFoodPassengers] = useState([]);
  const [saudiMakkahZiyaraPassengers, setSaudiMakkahZiyaraPassengers] = useState([]);
  const [saudiMadinaZiyaraPassengers, setSaudiMadinaZiyaraPassengers] = useState([]);
  const [saudiTransportPassengers, setSaudiTransportPassengers] = useState([]);
  const [saudiCampFeePassengers, setSaudiCampFeePassengers] = useState([]);
  const [saudiAlMashayerPassengers, setSaudiAlMashayerPassengers] = useState([]);
  const [saudiOthersPassengers, setSaudiOthersPassengers] = useState([]);

  const [collapsedSections, setCollapsedSections] = useState({
    bangladesh: false,
    saudi: false
  });

  // Modal states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [passengerModalConfig, setPassengerModalConfig] = useState({ group: '', type: 'standard' });
  const [newPassenger, setNewPassenger] = useState({
    type: 'Adult',
    count: 0,
    price: 0,
    roomNumber: 0,
    perNight: 0,
    totalNights: 0,
    days: 0,
    perDayPrice: 0,
    hotelName: ''
  });

  // Fetch package data
  useEffect(() => {
    if (id) {
      fetchPackageData();
    }
  }, [id]);

  const fetchPackageData = async () => {
    try {
      setPackageLoading(true);
      // Try /api/packages first since packages are stored in 'packages' collection
      let response = await fetch(`/api/packages/${id}`);
      let data = await response.json();
      
      // If not found in /api/packages, try /api/agent-packages as fallback
      if (!response.ok || (!data.package && !data.data)) {
        console.log('Package not found in /api/packages, trying /api/agent-packages...');
        response = await fetch(`/api/agent-packages/${id}`);
        data = await response.json();
      }
      
      if (response.ok && (data.package || data.data)) {
        const pkg = data.package || data.data;
        setPackageInfo(pkg);
        
        // Initialize form data
        if (pkg.sarToBdtRate !== undefined && pkg.sarToBdtRate !== null) {
          setFormData(prev => ({ ...prev, sarToBdtRate: pkg.sarToBdtRate.toString() }));
        }
        if (pkg.discount !== undefined && pkg.discount !== null) {
          setFormData(prev => ({ ...prev, discount: pkg.discount.toString() }));
        }
        
        // Initialize costs
        if (pkg.costs && typeof pkg.costs === 'object') {
          setCosts(prev => ({ ...prev, ...pkg.costs }));
        }
        
        // Initialize passenger arrays with IDs
        const addId = (arr) => Array.isArray(arr) ? arr.map(p => ({ ...p, id: p.id || Math.random().toString(36).substr(2, 9) })) : [];
        
        setBangladeshVisaPassengers(addId(pkg.bangladeshVisaPassengers));
        setBangladeshAirfarePassengers(addId(pkg.bangladeshAirfarePassengers));
        setBangladeshBusPassengers(addId(pkg.bangladeshBusPassengers));
        setBangladeshTrainingOtherPassengers(addId(pkg.bangladeshTrainingOtherPassengers));
        setSaudiVisaPassengers(addId(pkg.saudiVisaPassengers));
        setSaudiMakkahHotelPassengers(addId(pkg.saudiMakkahHotelPassengers));
        setSaudiMadinaHotelPassengers(addId(pkg.saudiMadinaHotelPassengers));
        setSaudiMakkahFoodPassengers(addId(pkg.saudiMakkahFoodPassengers));
        setSaudiMadinaFoodPassengers(addId(pkg.saudiMadinaFoodPassengers));
        setSaudiMakkahZiyaraPassengers(addId(pkg.saudiMakkahZiyaraPassengers));
        setSaudiMadinaZiyaraPassengers(addId(pkg.saudiMadinaZiyaraPassengers));
        setSaudiTransportPassengers(addId(pkg.saudiTransportPassengers));
        setSaudiCampFeePassengers(addId(pkg.saudiCampFeePassengers));
        setSaudiAlMashayerPassengers(addId(pkg.saudiAlMashayerPassengers));
        setSaudiOthersPassengers(addId(pkg.saudiOthersPassengers));
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
      setPackageLoading(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
    
    const bangladeshVisaCosts = bangladeshVisaPassengers.reduce((sum, passenger) => 
      sum + ((passenger.price || 0) * (passenger.count || 0)), 0
    );
    const bangladeshAirfareCosts = bangladeshAirfarePassengers.reduce((sum, passenger) => 
      sum + ((passenger.price || 0) * (passenger.count || 0)), 0
    );
    const bangladeshBusCosts = bangladeshBusPassengers.reduce((sum, passenger) => 
      sum + ((passenger.price || 0) * (passenger.count || 0)), 0
    );
    const bangladeshTrainingOtherCosts = bangladeshTrainingOtherPassengers.reduce((sum, passenger) => 
      sum + ((passenger.price || 0) * (passenger.count || 0)), 0
    );

    const otherBangladeshCosts = 
      (parseFloat(costs.idCard) || 0) +
      (parseFloat(costs.hajjKollan) || 0) +
      (parseFloat(costs.hajjGuide) || 0) +
      (parseFloat(costs.govtServiceCharge) || 0) +
      (parseFloat(costs.licenseFee) || 0) +
      (parseFloat(costs.transportFee) || 0) +
      (parseFloat(costs.otherBdCosts) || 0);

    const bangladeshCosts = bangladeshVisaCosts + bangladeshAirfareCosts + bangladeshBusCosts + bangladeshTrainingOtherCosts + otherBangladeshCosts;

    // Saudi passenger-specific costs
    const saudiVisaCosts = saudiVisaPassengers.reduce((sum, passenger) => 
      sum + ((passenger.price || 0) * (passenger.count || 0)), 0
    );
    const saudiMakkahHotelCosts = saudiMakkahHotelPassengers.reduce((sum, passenger) => 
      sum + ((passenger.roomNumber || 0) * (passenger.perNight || 0) * (passenger.totalNights || 0)), 0
    );
    const saudiMadinaHotelCosts = saudiMadinaHotelPassengers.reduce((sum, passenger) => 
      sum + ((passenger.roomNumber || 0) * (passenger.perNight || 0) * (passenger.totalNights || 0)), 0
    );
    const saudiMakkahFoodCosts = saudiMakkahFoodPassengers.reduce((sum, passenger) => 
      sum + ((passenger.count || 0) * (passenger.days || 0) * (passenger.perDayPrice || 0)), 0
    );
    const saudiMadinaFoodCosts = saudiMadinaFoodPassengers.reduce((sum, passenger) => 
      sum + ((passenger.count || 0) * (passenger.days || 0) * (passenger.perDayPrice || 0)), 0
    );
    const saudiMakkahZiyaraCosts = saudiMakkahZiyaraPassengers.reduce((sum, passenger) => 
      sum + ((passenger.price || 0) * (passenger.count || 0)), 0
    );
    const saudiMadinaZiyaraCosts = saudiMadinaZiyaraPassengers.reduce((sum, passenger) => 
      sum + ((passenger.price || 0) * (passenger.count || 0)), 0
    );
    const saudiTransportCosts = saudiTransportPassengers.reduce((sum, passenger) => 
      sum + ((passenger.price || 0) * (passenger.count || 0)), 0
    );
    const saudiCampFeeCosts = saudiCampFeePassengers.reduce((sum, passenger) => 
      sum + ((passenger.price || 0) * (passenger.count || 0)), 0
    );
    const saudiAlMashayerCosts = saudiAlMashayerPassengers.reduce((sum, passenger) => 
      sum + ((passenger.price || 0) * (passenger.count || 0)), 0
    );
    const saudiOthersCosts = saudiOthersPassengers.reduce((sum, passenger) => 
      sum + ((passenger.price || 0) * (passenger.count || 0)), 0
    );

    let saudiCostsRaw = 0;
    
    if (packageInfo?.customPackageType === 'Custom Umrah' || packageInfo?.customPackageType === 'Custom Hajj') {
      saudiCostsRaw = 
        saudiVisaCosts +
        saudiMakkahHotelCosts +
        saudiMadinaHotelCosts +
        saudiMakkahFoodCosts +
        saudiMadinaFoodCosts +
        saudiMakkahZiyaraCosts +
        saudiMadinaZiyaraCosts +
        saudiTransportCosts +
        saudiCampFeeCosts +
        saudiAlMashayerCosts +
        saudiOthersCosts;
    } else {
      saudiCostsRaw = 
        (parseFloat(costs.makkahHotel1) || 0) +
        (parseFloat(costs.makkahHotel2) || 0) +
        (parseFloat(costs.makkahHotel3) || 0) +
        (parseFloat(costs.madinaHotel1) || 0) +
        (parseFloat(costs.madinaHotel2) || 0) +
        (parseFloat(costs.zamzamWater) || 0) +
        (parseFloat(costs.maktab) || 0) +
        (parseFloat(costs.visaFee) || 0) +
        (parseFloat(costs.insuranceFee) || 0) +
        (parseFloat(costs.electronicsFee) || 0) +
        (parseFloat(costs.groundServiceFee) || 0) +
        (parseFloat(costs.makkahRoute) || 0) +
        (parseFloat(costs.baggage) || 0) +
        (parseFloat(costs.serviceCharge) || 0) +
        (parseFloat(costs.monazzem) || 0) +
        (parseFloat(costs.food) || 0) +
        (parseFloat(costs.ziyaraFee) || 0);
    }

    const saudiCosts = saudiCostsRaw * sarToBdtRate;
    const subtotal = bangladeshCosts + saudiCosts;
    const grandTotal = Math.max(0, subtotal - (parseFloat(formData.discount) || 0));

    return {
      subtotal,
      grandTotal,
      totalAirFare: bangladeshAirfareCosts,
      bangladeshVisaCosts,
      bangladeshBusCosts,
      bangladeshTrainingOtherCosts,
      saudiVisaCosts,
      saudiMakkahHotelCosts,
      saudiMadinaHotelCosts,
      saudiMakkahFoodCosts,
      saudiMadinaFoodCosts,
      saudiMakkahZiyaraCosts,
      saudiMadinaZiyaraCosts,
      saudiTransportCosts,
      saudiCampFeeCosts,
      saudiAlMashayerCosts,
      saudiOthersCosts
    };
  };

  const totals = calculateTotals();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(number || 0);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setCosts(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle section
  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Generate ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Create passenger handlers
  const createPassengerHandlers = (setter) => ({
    handleChange: (id, field, value) => {
      setter(prev => 
        prev.map(p => 
          p.id === id 
            ? { 
                ...p, 
                [field]: ['count', 'roomNumber', 'totalNights', 'days'].includes(field)
                  ? Math.max(0, parseInt(value) || 0) 
                  : ['price', 'perNight', 'perDayPrice'].includes(field)
                    ? Math.max(0, parseFloat(value) || 0)
                    : value
              }
            : p
        )
      );
    },
  });

  // Passenger handlers
  const bdVisaHandlers = createPassengerHandlers(setBangladeshVisaPassengers);
  const bdAirfareHandlers = createPassengerHandlers(setBangladeshAirfarePassengers);
  const bdBusHandlers = createPassengerHandlers(setBangladeshBusPassengers);
  const bdTrainingHandlers = createPassengerHandlers(setBangladeshTrainingOtherPassengers);
  const saVisaHandlers = createPassengerHandlers(setSaudiVisaPassengers);
  const saMakkahHotelHandlers = createPassengerHandlers(setSaudiMakkahHotelPassengers);
  const saMadinaHotelHandlers = createPassengerHandlers(setSaudiMadinaHotelPassengers);
  const saMakkahFoodHandlers = createPassengerHandlers(setSaudiMakkahFoodPassengers);
  const saMadinaFoodHandlers = createPassengerHandlers(setSaudiMadinaFoodPassengers);
  const saMakkahZiyaraHandlers = createPassengerHandlers(setSaudiMakkahZiyaraPassengers);
  const saMadinaZiyaraHandlers = createPassengerHandlers(setSaudiMadinaZiyaraPassengers);
  const saTransportHandlers = createPassengerHandlers(setSaudiTransportPassengers);
  const saCampFeeHandlers = createPassengerHandlers(setSaudiCampFeePassengers);
  const saAlMashayerHandlers = createPassengerHandlers(setSaudiAlMashayerPassengers);
  const saOthersHandlers = createPassengerHandlers(setSaudiOthersPassengers);

  // Open passenger modal
  const openPassengerModal = (group, type) => {
    setPassengerModalConfig({ group, type });
    setNewPassenger({
      type: 'Adult',
      count: 0,
      price: 0,
      roomNumber: 0,
      perNight: 0,
      totalNights: 0,
      days: 0,
      perDayPrice: 0,
      hotelName: ''
    });
    setShowPassengerModal(true);
  };

  // Close passenger modal
  const closePassengerModal = () => {
    setShowPassengerModal(false);
    setNewPassenger({
      type: 'Adult',
      count: 0,
      price: 0,
      roomNumber: 0,
      perNight: 0,
      totalNights: 0,
      days: 0,
      perDayPrice: 0,
      hotelName: ''
    });
  };

  // Add passenger
  const addPassenger = () => {
    const passenger = {
      id: generateId(),
      ...newPassenger
    };
    
    const setters = {
      'bdVisa': setBangladeshVisaPassengers,
      'bdAirfare': setBangladeshAirfarePassengers,
      'bdBus': setBangladeshBusPassengers,
      'bdTraining': setBangladeshTrainingOtherPassengers,
      'saVisa': setSaudiVisaPassengers,
      'saMakkahHotel': setSaudiMakkahHotelPassengers,
      'saMadinaHotel': setSaudiMadinaHotelPassengers,
      'saMakkahFood': setSaudiMakkahFoodPassengers,
      'saMadinaFood': setSaudiMadinaFoodPassengers,
      'saMakkahZiyara': setSaudiMakkahZiyaraPassengers,
      'saMadinaZiyara': setSaudiMadinaZiyaraPassengers,
      'saTransport': setSaudiTransportPassengers,
      'saCampFee': setSaudiCampFeePassengers,
      'saAlMashayer': setSaudiAlMashayerPassengers,
      'saOthers': setSaudiOthersPassengers
    };
    
    const setter = setters[passengerModalConfig.group];
    if (setter) {
      setter(prev => [...prev, passenger]);
    }
    closePassengerModal();
  };

  // Remove passenger
  const removePassenger = (group, id) => {
    const setters = {
      'bdVisa': setBangladeshVisaPassengers,
      'bdAirfare': setBangladeshAirfarePassengers,
      'bdBus': setBangladeshBusPassengers,
      'bdTraining': setBangladeshTrainingOtherPassengers,
      'saVisa': setSaudiVisaPassengers,
      'saMakkahHotel': setSaudiMakkahHotelPassengers,
      'saMadinaHotel': setSaudiMadinaHotelPassengers,
      'saMakkahFood': setSaudiMakkahFoodPassengers,
      'saMadinaFood': setSaudiMadinaFoodPassengers,
      'saMakkahZiyara': setSaudiMakkahZiyaraPassengers,
      'saMadinaZiyara': setSaudiMadinaZiyaraPassengers,
      'saTransport': setSaudiTransportPassengers,
      'saCampFee': setSaudiCampFeePassengers,
      'saAlMashayer': setSaudiAlMashayerPassengers,
      'saOthers': setSaudiOthersPassengers
    };
    
    const setter = setters[group];
    if (setter) {
      setter(prev => prev.filter(p => p.id !== id));
    }
  };

  // Save costing
  const handleSave = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const costingData = {
        sarToBdtRate: parseFloat(formData.sarToBdtRate) || 1,
        discount: parseFloat(formData.discount) || 0,
        costs,
        bangladeshVisaPassengers,
        bangladeshAirfarePassengers,
        bangladeshBusPassengers,
        bangladeshTrainingOtherPassengers,
        saudiVisaPassengers,
        saudiMakkahHotelPassengers,
        saudiMadinaHotelPassengers,
        saudiMakkahFoodPassengers,
        saudiMadinaFoodPassengers,
        saudiMakkahZiyaraPassengers,
        saudiMadinaZiyaraPassengers,
        saudiTransportPassengers,
        saudiCampFeePassengers,
        saudiAlMashayerPassengers,
        saudiOthersPassengers,
        totals
      };
      
      // Try /api/packages first, then /api/agent-packages as fallback
      let response = await fetch(`/api/packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(costingData),
      });

      // If /api/packages doesn't work, try /api/agent-packages
      if (!response.ok) {
        response = await fetch(`/api/agent-packages/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(costingData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'খরচ সফলভাবে সংরক্ষণ করা হয়েছে',
          icon: 'success',
          confirmButtonColor: '#10B981',
          timer: 2000,
        }).then(() => {
          router.push(`/hajj-umrah/b2b-agent/agent-packages/${id}`);
        });
      } else {
        throw new Error(data.error || 'Failed to save costing');
      }
    } catch (error) {
      console.error('Error saving costing:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'খরচ সংরক্ষণ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render passenger section
  const renderPassengerSection = (title, passengers, handlers, colorClass, groupKey, isSaudi = false) => (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{title}</label>
        <button
          type="button"
          onClick={() => openPassengerModal(groupKey, 'standard')}
          className={`px-4 py-2 ${colorClass} text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium`}
        >
          + যাত্রী যোগ করুন
        </button>
      </div>
      
      {passengers.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          কোন যাত্রী যোগ করা হয়নি
        </div>
      ) : (
        <div className="space-y-3">
          {passengers.map((passenger) => (
            <div key={passenger.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">যাত্রীর ধরন</label>
                  <select
                    value={passenger.type}
                    onChange={(e) => handlers.handleChange(passenger.id, 'type', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm`}
                  >
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                    <option value="Infant">Infant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">সংখ্যা</label>
                  <input
                    type="number"
                    value={passenger.count}
                    onChange={(e) => handlers.handleChange(passenger.id, 'count', e.target.value)}
                    min="0"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isSaudi ? 'মূল্য (SAR)' : 'মূল্য (BDT)'}
                  </label>
                  <input
                    type="number"
                    value={passenger.price}
                    onChange={(e) => handlers.handleChange(passenger.id, 'price', e.target.value)}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm`}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removePassenger(groupKey, passenger.id)}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    মুছুন
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                মোট: {passenger.count || 0} × {formatCurrency((passenger.price || 0) * (isSaudi ? (parseFloat(formData.sarToBdtRate) || 1) : 1))} = {formatCurrency((passenger.count || 0) * (passenger.price || 0) * (isSaudi ? (parseFloat(formData.sarToBdtRate) || 1) : 1))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Helper function to render hotel passenger section
  const renderHotelPassengerSection = (title, passengers, handlers, colorClass, groupKey) => (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{title}</label>
        <button
          type="button"
          onClick={() => openPassengerModal(groupKey, 'hotel')}
          className={`px-4 py-2 ${colorClass} text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium`}
        >
          + যাত্রী যোগ করুন
        </button>
      </div>
      
      {passengers.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          কোন যাত্রী যোগ করা হয়নি
        </div>
      ) : (
        <div className="space-y-3">
          {passengers.map((passenger) => {
            const totalPerPerson = (passenger.roomNumber || 0) * (passenger.perNight || 0) * (passenger.totalNights || 0);
            return (
              <div key={passenger.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">যাত্রীর ধরন</label>
                    <select
                      value={passenger.type}
                      onChange={(e) => handlers.handleChange(passenger.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                      <option value="Infant">Infant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">রুম সংখ্যা</label>
                    <input
                      type="number"
                      value={passenger.roomNumber}
                      onChange={(e) => handlers.handleChange(passenger.id, 'roomNumber', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">প্রতি রাত (SAR)</label>
                    <input
                      type="number"
                      value={passenger.perNight}
                      onChange={(e) => handlers.handleChange(passenger.id, 'perNight', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">মোট রাত</label>
                    <input
                      type="number"
                      value={passenger.totalNights}
                      onChange={(e) => handlers.handleChange(passenger.id, 'totalNights', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removePassenger(groupKey, passenger.id)}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      মুছুন
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  মোট: {passenger.roomNumber || 0} × {formatCurrency((passenger.perNight || 0) * (parseFloat(formData.sarToBdtRate) || 1))} × {passenger.totalNights || 0} = {formatCurrency(totalPerPerson * (parseFloat(formData.sarToBdtRate) || 1))} BDT
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Helper function to render food passenger section
  const renderFoodPassengerSection = (title, passengers, handlers, colorClass, groupKey) => (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{title}</label>
        <button
          type="button"
          onClick={() => openPassengerModal(groupKey, 'food')}
          className={`px-4 py-2 ${colorClass} text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium`}
        >
          + যাত্রী যোগ করুন
        </button>
      </div>
      
      {passengers.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          কোন যাত্রী যোগ করা হয়নি
        </div>
      ) : (
        <div className="space-y-3">
          {passengers.map((passenger) => (
            <div key={passenger.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">যাত্রীর ধরন</label>
                  <select
                    value={passenger.type}
                    onChange={(e) => handlers.handleChange(passenger.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                    <option value="Infant">Infant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">সংখ্যা</label>
                  <input
                    type="number"
                    value={passenger.count}
                    onChange={(e) => handlers.handleChange(passenger.id, 'count', e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">কত দিন</label>
                  <input
                    type="number"
                    value={passenger.days}
                    onChange={(e) => handlers.handleChange(passenger.id, 'days', e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">প্রতি দিন (SAR)</label>
                  <input
                    type="number"
                    value={passenger.perDayPrice}
                    onChange={(e) => handlers.handleChange(passenger.id, 'perDayPrice', e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removePassenger(groupKey, passenger.id)}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    মুছুন
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                মোট: {passenger.count || 0} × {passenger.days || 0} × {formatCurrency((passenger.perDayPrice || 0) * (parseFloat(formData.sarToBdtRate) || 1))} = {formatCurrency((passenger.count || 0) * (passenger.days || 0) * (passenger.perDayPrice || 0) * (parseFloat(formData.sarToBdtRate) || 1))} BDT
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (packageLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!packageInfo) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Package Not Found</h2>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push(`/hajj-umrah/b2b-agent/agent-packages/${id}`)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">খরচ যোগ করুন</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{packageInfo?.packageName || ''}</p>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Save className="w-5 h-5" />
                <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                    মূল সেটিংস
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        SAR to BDT Rate
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ছাড় (BDT)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Bangladesh Costs Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleSection('bangladesh')}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                        বাংলাদেশ অংশ
                      </span>
                      {collapsedSections.bangladesh ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      )}
                    </h3>
                  </div>
                  
                  {!collapsedSections.bangladesh && (
                    <div className="px-6 pb-6 space-y-6">
                      {/* Bangladesh Visa */}
                      {renderPassengerSection(
                        "ভিসা খরচ (যাত্রীর ধরন অনুযায়ী)",
                        bangladeshVisaPassengers,
                        bdVisaHandlers,
                        "bg-red-600 hover:bg-red-700",
                        'bdVisa',
                        false
                      )}

                      {/* Bangladesh Airfare */}
                      {renderPassengerSection(
                        "বিমান ভাড়া (যাত্রীর ধরন অনুযায়ী)",
                        bangladeshAirfarePassengers,
                        bdAirfareHandlers,
                        "bg-purple-600 hover:bg-purple-700",
                        'bdAirfare',
                        false
                      )}

                      {/* Bangladesh Bus */}
                      {renderPassengerSection(
                        "বাস সার্ভিস (যাত্রীর ধরন অনুযায়ী)",
                        bangladeshBusPassengers,
                        bdBusHandlers,
                        "bg-blue-600 hover:bg-blue-700",
                        'bdBus',
                        false
                      )}

                      {/* Bangladesh Training/Other */}
                      {renderPassengerSection(
                        "ট্রেনিং/অন্যান্য (যাত্রীর ধরন অনুযায়ী)",
                        bangladeshTrainingOtherPassengers,
                        bdTrainingHandlers,
                        "bg-yellow-600 hover:bg-yellow-700",
                        'bdTraining',
                        false
                      )}

                      {/* Other Bangladesh Costs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">আইডি কার্ড ফি</label>
                          <input
                            type="number"
                            name="idCard"
                            value={costs.idCard}
                            onChange={handleCostChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হজ্জ কল্যাণ ফি</label>
                          <input
                            type="number"
                            name="hajjKollan"
                            value={costs.hajjKollan}
                            onChange={handleCostChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হজ গাইড ফি</label>
                          <input
                            type="number"
                            name="hajjGuide"
                            value={costs.hajjGuide}
                            onChange={handleCostChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সার্ভিস চার্জ (সরকারি)</label>
                          <input
                            type="number"
                            name="govtServiceCharge"
                            value={costs.govtServiceCharge}
                            onChange={handleCostChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">লাইসেন্স চার্জ ফি</label>
                          <input
                            type="number"
                            name="licenseFee"
                            value={costs.licenseFee}
                            onChange={handleCostChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাতায়াত ফি</label>
                          <input
                            type="number"
                            name="transportFee"
                            value={costs.transportFee}
                            onChange={handleCostChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">অন্যান্য বাংলাদেশি খরচ</label>
                          <input
                            type="number"
                            name="otherBdCosts"
                            value={costs.otherBdCosts}
                            onChange={handleCostChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Saudi Costs Section - Only for Custom packages */}
                {(packageInfo?.customPackageType === 'Custom Umrah' || packageInfo?.customPackageType === 'Custom Hajj') && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div 
                      className="p-6 cursor-pointer"
                      onClick={() => toggleSection('saudi')}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                        <span className="flex items-center">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                          সৌদি অংশ
                        </span>
                        {collapsedSections.saudi ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        )}
                      </h3>
                    </div>
                    
                    {!collapsedSections.saudi && (
                      <div className="px-6 pb-6 space-y-6">
                        {/* Saudi Visa */}
                        {renderPassengerSection(
                          "সৌদি ভিসা খরচ",
                          saudiVisaPassengers,
                          saVisaHandlers,
                          "bg-blue-600 hover:bg-blue-700",
                          'saVisa',
                          true
                        )}

                        {/* Saudi Makkah Hotel */}
                        {renderHotelPassengerSection(
                          "মক্কা হোটেল",
                          saudiMakkahHotelPassengers,
                          saMakkahHotelHandlers,
                          "bg-purple-600 hover:bg-purple-700",
                          'saMakkahHotel'
                        )}

                        {/* Saudi Madina Hotel */}
                        {renderHotelPassengerSection(
                          "মদিনা হোটেল",
                          saudiMadinaHotelPassengers,
                          saMadinaHotelHandlers,
                          "bg-green-600 hover:bg-green-700",
                          'saMadinaHotel'
                        )}

                        {/* Saudi Makkah Food */}
                        {renderFoodPassengerSection(
                          "মক্কা খাবার",
                          saudiMakkahFoodPassengers,
                          saMakkahFoodHandlers,
                          "bg-yellow-600 hover:bg-yellow-700",
                          'saMakkahFood'
                        )}

                        {/* Saudi Madina Food */}
                        {renderFoodPassengerSection(
                          "মদিনা খাবার",
                          saudiMadinaFoodPassengers,
                          saMadinaFoodHandlers,
                          "bg-yellow-600 hover:bg-yellow-700",
                          'saMadinaFood'
                        )}

                        {/* Saudi Makkah Ziyara */}
                        {renderPassengerSection(
                          "মক্কা জিয়ারত",
                          saudiMakkahZiyaraPassengers,
                          saMakkahZiyaraHandlers,
                          "bg-indigo-600 hover:bg-indigo-700",
                          'saMakkahZiyara',
                          true
                        )}

                        {/* Saudi Madina Ziyara */}
                        {renderPassengerSection(
                          "মদিনা জিয়ারত",
                          saudiMadinaZiyaraPassengers,
                          saMadinaZiyaraHandlers,
                          "bg-indigo-600 hover:bg-indigo-700",
                          'saMadinaZiyara',
                          true
                        )}

                        {/* Saudi Transport */}
                        {renderPassengerSection(
                          "পরিবহন",
                          saudiTransportPassengers,
                          saTransportHandlers,
                          "bg-teal-600 hover:bg-teal-700",
                          'saTransport',
                          true
                        )}

                        {/* Saudi Camp Fee */}
                        {renderPassengerSection(
                          "ক্যাম্প ফি",
                          saudiCampFeePassengers,
                          saCampFeeHandlers,
                          "bg-amber-600 hover:bg-amber-700",
                          'saCampFee',
                          true
                        )}

                        {/* Saudi Al Mashayer */}
                        {renderPassengerSection(
                          "আল মাশায়ের",
                          saudiAlMashayerPassengers,
                          saAlMashayerHandlers,
                          "bg-cyan-600 hover:bg-cyan-700",
                          'saAlMashayer',
                          true
                        )}

                        {/* Saudi Others */}
                        {renderPassengerSection(
                          "অন্যান্য",
                          saudiOthersPassengers,
                          saOthersHandlers,
                          "bg-gray-600 hover:bg-gray-700",
                          'saOthers',
                          true
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Summary Panel */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-6">
                      <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                      খরচের সারসংক্ষেপ
                    </h3>

                    <div className="space-y-4">
                      <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ভিসা খরচ</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.bangladeshVisaCosts)}</span>
                        </div>
                      </div>

                      <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বিমান ভাড়া</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.totalAirFare)}</span>
                        </div>
                      </div>

                      <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">বাস সার্ভিস খরচ</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.bangladeshBusCosts)}</span>
                        </div>
                      </div>

                      <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ট্রেনিং/অন্যান্য খরচ</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.bangladeshTrainingOtherCosts)}</span>
                        </div>
                      </div>

                      {/* Saudi Costs for Custom Packages */}
                      {(packageInfo?.customPackageType === 'Custom Umrah' || packageInfo?.customPackageType === 'Custom Hajj') && (
                        <>
                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">সৌদি ভিসা খরচ</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.saudiVisaCosts * (parseFloat(formData.sarToBdtRate) || 1))}</span>
                            </div>
                          </div>

                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">মক্কা হোটেল</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.saudiMakkahHotelCosts * (parseFloat(formData.sarToBdtRate) || 1))}</span>
                            </div>
                          </div>

                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">মদিনা হোটেল</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.saudiMadinaHotelCosts * (parseFloat(formData.sarToBdtRate) || 1))}</span>
                            </div>
                          </div>

                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">মক্কা খাবার</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.saudiMakkahFoodCosts * (parseFloat(formData.sarToBdtRate) || 1))}</span>
                            </div>
                          </div>

                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">মদিনা খাবার</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.saudiMadinaFoodCosts * (parseFloat(formData.sarToBdtRate) || 1))}</span>
                            </div>
                          </div>

                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">মক্কা জিয়ারত</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.saudiMakkahZiyaraCosts * (parseFloat(formData.sarToBdtRate) || 1))}</span>
                            </div>
                          </div>

                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">মদিনা জিয়ারত</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.saudiMadinaZiyaraCosts * (parseFloat(formData.sarToBdtRate) || 1))}</span>
                            </div>
                          </div>

                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">পরিবহন</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.saudiTransportCosts * (parseFloat(formData.sarToBdtRate) || 1))}</span>
                            </div>
                          </div>

                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ক্যাম্প ফি</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.saudiCampFeeCosts * (parseFloat(formData.sarToBdtRate) || 1))}</span>
                            </div>
                          </div>

                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">আল মাশায়ের</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.saudiAlMashayerCosts * (parseFloat(formData.sarToBdtRate) || 1))}</span>
                            </div>
                          </div>

                          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">অন্যান্য</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.saudiOthersCosts * (parseFloat(formData.sarToBdtRate) || 1))}</span>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ছাড়</span>
                        <span className="text-sm font-semibold text-red-600">-{formatCurrency(parseFloat(formData.discount) || 0)}</span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b-2 border-gray-300 dark:border-gray-600">
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300">উপমোট</span>
                        <span className="text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.subtotal)}</span>
                      </div>

                      <div className="flex justify-between items-center py-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg px-4">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">মোট</span>
                        <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(totals.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Passenger Modal */}
        {showPassengerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">যাত্রী যোগ করুন</h3>
                <button
                  onClick={closePassengerModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                  <select
                    value={newPassenger.type}
                    onChange={(e) => setNewPassenger(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                    <option value="Infant">Infant</option>
                  </select>
                </div>
                
                {passengerModalConfig.type === 'hotel' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">রুম সংখ্যা</label>
                      <input
                        type="number"
                        value={newPassenger.roomNumber}
                        onChange={(e) => setNewPassenger(prev => ({ ...prev, roomNumber: e.target.value }))}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রতি রাত (SAR)</label>
                      <input
                        type="number"
                        value={newPassenger.perNight}
                        onChange={(e) => setNewPassenger(prev => ({ ...prev, perNight: e.target.value }))}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মোট রাত</label>
                      <input
                        type="number"
                        value={newPassenger.totalNights}
                        onChange={(e) => setNewPassenger(prev => ({ ...prev, totalNights: e.target.value }))}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </>
                ) : passengerModalConfig.type === 'food' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                      <input
                        type="number"
                        value={newPassenger.count}
                        onChange={(e) => setNewPassenger(prev => ({ ...prev, count: e.target.value }))}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">কত দিন</label>
                      <input
                        type="number"
                        value={newPassenger.days}
                        onChange={(e) => setNewPassenger(prev => ({ ...prev, days: e.target.value }))}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রতি দিন (SAR)</label>
                      <input
                        type="number"
                        value={newPassenger.perDayPrice}
                        onChange={(e) => setNewPassenger(prev => ({ ...prev, perDayPrice: e.target.value }))}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                      <input
                        type="number"
                        value={newPassenger.count}
                        onChange={(e) => setNewPassenger(prev => ({ ...prev, count: e.target.value }))}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {passengerModalConfig.group.startsWith('sa') ? 'মূল্য (SAR)' : 'মূল্য (BDT)'}
                      </label>
                      <input
                        type="number"
                        value={newPassenger.price}
                        onChange={(e) => setNewPassenger(prev => ({ ...prev, price: e.target.value }))}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closePassengerModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={addPassenger}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    যোগ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AgentPackageCosting;
