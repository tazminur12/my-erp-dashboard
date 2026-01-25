'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../../../component/DashboardLayout';
import { 
  Save, 
  Calculator, 
  Package, 
  X, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Trash2,
  Users
} from 'lucide-react';
import Swal from 'sweetalert2';

const AgentPackageCreation = () => {
  const router = useRouter();
  const params = useParams();
  const agentIdFromUrl = params.id;
  
  // State for agents
  const [agentsData, setAgentsData] = useState(null);
  const [agentsLoading, setAgentsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    packageName: '',
    packageYear: '',
    packageType: 'Regular',
    customPackageType: '',
    sarToBdtRate: '',
    notes: '',
    agentId: agentIdFromUrl || '',
    status: 'Active'
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

  // Bangladesh visa passenger types state
  const [bangladeshVisaPassengers, setBangladeshVisaPassengers] = useState([]);
  const [bangladeshAirfarePassengers, setBangladeshAirfarePassengers] = useState([]);
  const [bangladeshBusPassengers, setBangladeshBusPassengers] = useState([]);
  const [bangladeshTrainingOtherPassengers, setBangladeshTrainingOtherPassengers] = useState([]);

  // Saudi passenger types state for Custom Umrah
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

  const [discount, setDiscount] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generic modal for adding passengers across all sections
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [passengerModalConfig, setPassengerModalConfig] = useState({ group: '', type: 'standard' });
  const [newPassenger, setNewPassenger] = useState({
    type: 'Adult',
    count: 0,
    price: 0,
    hotelName: '',
    roomNumber: 0,
    perNight: 0,
    totalNights: 0,
    hajiCount: 0,
    days: 0,
    perDayPrice: 0
  });

  // Bangladesh cost modal state
  const [showBdCostModal, setShowBdCostModal] = useState(false);
  const [bdCostModalConfig, setBdCostModalConfig] = useState({ field: '', label: '' });
  const [newBdCost, setNewBdCost] = useState(0);

  // Saudi cost modal state
  const [showSaudiCostModal, setShowSaudiCostModal] = useState(false);
  const [saudiCostModalConfig, setSaudiCostModalConfig] = useState({ field: '', label: '' });
  const [newSaudiCost, setNewSaudiCost] = useState(0);
  
  const [collapsedSections, setCollapsedSections] = useState({
    costDetails: false,
    attachments: false
  });
  const [errors, setErrors] = useState({});

  // const fileInputRef = useRef(null);
  // const dropZoneRef = useRef(null);

  // Cloudinary configuration - Replace with your actual values
  const CLOUD_NAME = 'your-cloud-name';
  const UPLOAD_PRESET = 'your-upload-preset';

  // Fetch agents
  useEffect(() => {
    fetchAgents();
  }, []);

  // Set agentId from URL if available
  useEffect(() => {
    if (agentIdFromUrl && !formData.agentId) {
      setFormData(prev => ({ ...prev, agentId: agentIdFromUrl }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentIdFromUrl]);

  const fetchAgents = async () => {
    try {
      setAgentsLoading(true);
      const response = await fetch('/api/agents');
      const data = await response.json();
      
      if (response.ok) {
        setAgentsData({ data: data.data || data.agents || [] });
      } else {
        throw new Error(data.error || 'Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch agents',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setAgentsLoading(false);
    }
  };

  // Calculate totals without passenger types
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

    // For Custom Hajj, include direct input fields
    let otherBangladeshCosts = 0;
    if (formData.customPackageType === 'Custom Hajj') {
      otherBangladeshCosts = 
        (parseFloat(costs.idCard) || 0) +
        (parseFloat(costs.hajjKollan) || 0) +
        (parseFloat(costs.hajjGuide) || 0) +
        (parseFloat(costs.govtServiceCharge) || 0) +
        (parseFloat(costs.licenseFee) || 0) +
        (parseFloat(costs.trainFee) || 0) +
        (parseFloat(costs.transportFee) || 0) +
        (parseFloat(costs.otherBdCosts) || 0);
    } else {
      otherBangladeshCosts = 
        (parseFloat(costs.idCard) || 0) +
        (parseFloat(costs.hajjKollan) || 0) +
        (parseFloat(costs.hajjGuide) || 0) +
        (parseFloat(costs.govtServiceCharge) || 0) +
        (parseFloat(costs.licenseFee) || 0);
    }

    // For Custom Hajj, add direct bangladeshAirfare input if provided
    const directBangladeshAirfare = formData.customPackageType === 'Custom Hajj' 
      ? (parseFloat(costs.bangladeshAirfare) || 0) 
      : 0;

    const bangladeshCosts = bangladeshVisaCosts + bangladeshAirfareCosts + directBangladeshAirfare + bangladeshBusCosts + bangladeshTrainingOtherCosts + otherBangladeshCosts;

    // Saudi passenger-specific costs for Custom Umrah
    const saudiVisaCosts = saudiVisaPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiMakkahHotelCosts = saudiMakkahHotelPassengers.reduce((sum, passenger) => 
      sum + (passenger.roomNumber * passenger.perNight * passenger.totalNights), 0
    );
    const saudiMadinaHotelCosts = saudiMadinaHotelPassengers.reduce((sum, passenger) => 
      sum + (passenger.roomNumber * passenger.perNight * passenger.totalNights), 0
    );
    const saudiMakkahFoodCosts = saudiMakkahFoodPassengers.reduce((sum, passenger) => 
      sum + (passenger.count * (passenger.days || 0) * (passenger.perDayPrice || 0)), 0
    );
    const saudiMadinaFoodCosts = saudiMadinaFoodPassengers.reduce((sum, passenger) => 
      sum + (passenger.count * (passenger.days || 0) * (passenger.perDayPrice || 0)), 0
    );
    const saudiMakkahZiyaraCosts = saudiMakkahZiyaraPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiMadinaZiyaraCosts = saudiMadinaZiyaraPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiTransportCosts = saudiTransportPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiCampFeeCosts = saudiCampFeePassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiAlMashayerCosts = saudiAlMashayerPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiOthersCosts = saudiOthersPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );

    let saudiCostsRaw = 0;
    
    if (formData.customPackageType === 'Custom Umrah' || formData.customPackageType === 'Custom Hajj') {
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
      (costs.makkahHotel1 || 0) +
      (costs.makkahHotel2 || 0) +
      (costs.makkahHotel3 || 0) +
      (costs.madinaHotel1 || 0) +
      (costs.madinaHotel2 || 0) +
      (costs.zamzamWater || 0) +
      (costs.maktab || 0) +
      (costs.visaFee || 0) +
      (costs.insuranceFee || 0) +
      (costs.electronicsFee || 0) +
      (costs.groundServiceFee || 0) +
      (costs.makkahRoute || 0) +
      (costs.baggage || 0) +
      (costs.serviceCharge || 0) +
      (costs.monazzem || 0) +
      (costs.food || 0) +
      (costs.ziyaraFee || 0);
    }

    const saudiCosts = saudiCostsRaw * sarToBdtRate;
    const madinaRoomCost = 0;
    const subtotal = bangladeshCosts + saudiCosts + madinaRoomCost;
    const grandTotal = Math.max(0, subtotal - (parseFloat(discount) || 0));

    const hotelCostsRaw =
      (costs.makkahHotel1 || 0) +
      (costs.makkahHotel2 || 0) +
      (costs.makkahHotel3 || 0) +
      (costs.madinaHotel1 || 0) +
      (costs.madinaHotel2 || 0);

    const serviceCostsRaw = (costs.groundServiceFee || 0);
    const feesRaw =
      (costs.visaFee || 0) +
      (costs.insuranceFee || 0) +
      (costs.electronicsFee || 0) +
      (costs.serviceCharge || 0);

    return {
      subtotal,
      grandTotal,
      totalAirFare: bangladeshAirfareCosts + directBangladeshAirfare,
      hotelCosts: hotelCostsRaw * sarToBdtRate,
      serviceCosts: serviceCostsRaw * sarToBdtRate,
      fees: feesRaw * sarToBdtRate,
      bangladeshVisaPassengers,
      bangladeshAirfarePassengers,
      bangladeshBusPassengers,
      bangladeshTrainingOtherPassengers,
      bangladeshVisaCosts,
      bangladeshBusCosts,
      bangladeshTrainingOtherCosts,
      otherBangladeshCosts,
      directBangladeshAirfare,
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

  // Handle Bangladesh visa passenger changes
  const handleBangladeshVisaChange = (id, field, value) => {
    setBangladeshVisaPassengers(prev => 
      prev.map(passenger => 
        passenger.id === id 
          ? { ...passenger, [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : field === 'type' ? value : parseFloat(value) || 0 }
          : passenger
      )
    );
  };

  // Handle Bangladesh airfare passenger changes
  const handleBangladeshAirfareChange = (id, field, value) => {
    setBangladeshAirfarePassengers(prev => 
      prev.map(passenger => 
        passenger.id === id 
          ? { ...passenger, [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : parseFloat(value) || 0 }
          : passenger
      )
    );
  };

  // Generic modal handlers
  const openPassengerModal = (group, type) => {
    setPassengerModalConfig({ group, type });
    setNewPassenger({
      type: 'Adult',
      count: 0,
      price: 0,
      hotelName: '',
      roomNumber: 0,
      perNight: 0,
      totalNights: 0,
      hajiCount: 0,
      days: 0,
      perDayPrice: 0
    });
    setShowPassengerModal(true);
  };

  const closePassengerModal = () => {
    setShowPassengerModal(false);
  };

  const handleNewPassengerChange = (field, value) => {
    const numericFieldsInt = ['count', 'roomNumber', 'totalNights', 'hajiCount', 'days'];
    const numericFieldsFloat = ['price', 'perNight', 'perDayPrice'];
    let parsed = value;
    
    if (value === '' || value === null || value === undefined) {
      if (numericFieldsInt.includes(field) || numericFieldsFloat.includes(field)) {
        parsed = '';
      }
    } else {
      if (numericFieldsInt.includes(field)) {
        const intValue = parseInt(value);
        parsed = isNaN(intValue) ? '' : Math.max(0, intValue);
      }
      if (numericFieldsFloat.includes(field)) {
        const floatValue = parseFloat(value);
        parsed = isNaN(floatValue) ? '' : Math.max(0, floatValue);
      }
    }
    
    setNewPassenger(prev => ({ ...prev, [field]: parsed }));
  };

  const savePassengerFromModal = () => {
    const id = Date.now();
    const { group, type } = passengerModalConfig;
    
    const count = newPassenger.count === '' ? 0 : newPassenger.count;
    const price = newPassenger.price === '' ? 0 : newPassenger.price;
    const roomNumber = newPassenger.roomNumber === '' ? 0 : newPassenger.roomNumber;
    const perNight = newPassenger.perNight === '' ? 0 : newPassenger.perNight;
    const totalNights = newPassenger.totalNights === '' ? 0 : newPassenger.totalNights;
    
    if (count <= 0) return;
    if (type === 'standard' && price <= 0) return;
    if (type === 'hotel' && (roomNumber <= 0 || perNight <= 0 || totalNights <= 0)) return;

    const base = { id, type: newPassenger.type, count: count, price: price };
    if (group === 'bdVisa') setBangladeshVisaPassengers(prev => [...prev, base]);
    if (group === 'bdAirfare') setBangladeshAirfarePassengers(prev => [...prev, base]);
    if (group === 'bdBus') setBangladeshBusPassengers(prev => [...prev, base]);
    if (group === 'bdTraining') setBangladeshTrainingOtherPassengers(prev => [...prev, base]);
    if (group === 'saVisa') setSaudiVisaPassengers(prev => [...prev, base]);
    if (group === 'saMakkahZiyara') setSaudiMakkahZiyaraPassengers(prev => [...prev, base]);
    if (group === 'saMadinaZiyara') setSaudiMadinaZiyaraPassengers(prev => [...prev, base]);
    if (group === 'saTransport') setSaudiTransportPassengers(prev => [...prev, base]);
    if (group === 'saCampFee') setSaudiCampFeePassengers(prev => [...prev, base]);
    if (group === 'saAlMashayer') setSaudiAlMashayerPassengers(prev => [...prev, base]);
    if (group === 'saOthers') setSaudiOthersPassengers(prev => [...prev, base]);

    if (type === 'hotel') {
      const hajiCount = newPassenger.hajiCount === '' ? 0 : newPassenger.hajiCount;
      const hotel = {
        id,
        type: newPassenger.type,
        hotelName: newPassenger.hotelName || '',
        roomNumber: roomNumber,
        perNight: perNight,
        totalNights: totalNights,
        hajiCount: hajiCount
      };
      if (group === 'saMakkahHotel') setSaudiMakkahHotelPassengers(prev => [...prev, hotel]);
      if (group === 'saMadinaHotel') setSaudiMadinaHotelPassengers(prev => [...prev, hotel]);
    }

    if (type === 'food') {
      const days = newPassenger.days === '' ? 0 : newPassenger.days;
      const perDayPrice = newPassenger.perDayPrice === '' ? 0 : newPassenger.perDayPrice;
      const food = {
        id,
        type: newPassenger.type,
        count: count,
        days: days,
        perDayPrice: perDayPrice,
        price: price
      };
      if (group === 'saMakkahFood') setSaudiMakkahFoodPassengers(prev => [...prev, food]);
      if (group === 'saMadinaFood') setSaudiMadinaFoodPassengers(prev => [...prev, food]);
    }

    setShowPassengerModal(false);
  };

  // Remove Bangladesh visa passenger type
  const removeBangladeshVisaPassenger = (id) => {
    setBangladeshVisaPassengers(prev => prev.filter(passenger => passenger.id !== id));
  };

  // Remove Bangladesh airfare passenger type
  const removeBangladeshAirfarePassenger = (id) => {
    setBangladeshAirfarePassengers(prev => prev.filter(passenger => passenger.id !== id));
  };

  // Handle Bangladesh bus passenger changes
  const handleBangladeshBusChange = (id, field, value) => {
    setBangladeshBusPassengers(prev => 
      prev.map(passenger => 
        passenger.id === id 
          ? { ...passenger, [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : parseFloat(value) || 0 }
          : passenger
      )
    );
  };

  // Remove Bangladesh bus passenger type
  const removeBangladeshBusPassenger = (id) => {
    setBangladeshBusPassengers(prev => prev.filter(passenger => passenger.id !== id));
  };

  // Handle Bangladesh training/other passenger changes
  const handleBangladeshTrainingOtherChange = (id, field, value) => {
    setBangladeshTrainingOtherPassengers(prev => 
      prev.map(passenger => 
        passenger.id === id 
          ? { ...passenger, [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : parseFloat(value) || 0 }
          : passenger
      )
    );
  };

  // Remove Bangladesh training/other passenger type
  const removeBangladeshTrainingOtherPassenger = (id) => {
    setBangladeshTrainingOtherPassengers(prev => prev.filter(passenger => passenger.id !== id));
  };

  // Saudi passenger handlers
  const createSaudiPassengerHandlers = (setter, prefix, isHotel = false, isFood = false) => ({
    handleChange: (id, field, value) => {
      setter(prev => 
        prev.map(passenger => 
          passenger.id === id 
            ? { 
                ...passenger, 
                [field]: field === 'count' || field === 'roomNumber' || field === 'totalNights' || field === 'hajiCount' || field === 'days'
                  ? Math.max(0, parseInt(value) || 0) 
                  : field === 'perNight' || field === 'perDayPrice' || field === 'price'
                    ? Math.max(0, parseFloat(value) || 0)
                    : value
              }
            : passenger
        )
      );
    },
    addPassenger: () => {
      const newId = Date.now();
      const basePassenger = {
        id: newId,
        type: 'Adult',
        count: 0,
        price: 0
      };
      
      if (isHotel) {
        setter(prev => [...prev, {
          ...basePassenger,
          hotelName: '',
          roomNumber: 0,
          perNight: 0,
          totalNights: 0,
          hajiCount: 0
        }]);
      } else if (isFood) {
        setter(prev => [...prev, {
          ...basePassenger,
          days: 0,
          perDayPrice: 0
        }]);
      } else {
        setter(prev => [...prev, basePassenger]);
      }
    },
    removePassenger: (id) => {
      setter(prev => prev.filter(passenger => passenger.id !== id));
    }
  });

  // Create handlers for all Saudi passenger types
  const saudiVisaHandlers = createSaudiPassengerHandlers(setSaudiVisaPassengers, 'visa');
  const saudiMakkahHotelHandlers = createSaudiPassengerHandlers(setSaudiMakkahHotelPassengers, 'makkahHotel', true);
  const saudiMadinaHotelHandlers = createSaudiPassengerHandlers(setSaudiMadinaHotelPassengers, 'madinaHotel', true);
  const saudiMakkahFoodHandlers = createSaudiPassengerHandlers(setSaudiMakkahFoodPassengers, 'makkahFood', false, true);
  const saudiMadinaFoodHandlers = createSaudiPassengerHandlers(setSaudiMadinaFoodPassengers, 'madinaFood', false, true);
  const saudiMakkahZiyaraHandlers = createSaudiPassengerHandlers(setSaudiMakkahZiyaraPassengers, 'makkahZiyara');
  const saudiMadinaZiyaraHandlers = createSaudiPassengerHandlers(setSaudiMadinaZiyaraPassengers, 'madinaZiyara');
  const saudiTransportHandlers = createSaudiPassengerHandlers(setSaudiTransportPassengers, 'transport');
  const saudiCampFeeHandlers = createSaudiPassengerHandlers(setSaudiCampFeePassengers, 'campFee');
  const saudiAlMashayerHandlers = createSaudiPassengerHandlers(setSaudiAlMashayerPassengers, 'alMashayer');
  const saudiOthersHandlers = createSaudiPassengerHandlers(setSaudiOthersPassengers, 'others');

  // Removal by group for summary cross buttons
  // const removePassengerByGroup = (group, id) => {
  //   if (group === 'bdVisa') setBangladeshVisaPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'bdAirfare') setBangladeshAirfarePassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'bdBus') setBangladeshBusPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'bdTraining') setBangladeshTrainingOtherPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'saVisa') setSaudiVisaPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'saMakkahHotel') setSaudiMakkahHotelPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'saMadinaHotel') setSaudiMadinaHotelPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'saMakkahFood') setSaudiMakkahFoodPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'saMadinaFood') setSaudiMadinaFoodPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'saMakkahZiyara') setSaudiMakkahZiyaraPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'saMadinaZiyara') setSaudiMadinaZiyaraPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'saTransport') setSaudiTransportPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'saCampFee') setSaudiCampFeePassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'saAlMashayer') setSaudiAlMashayerPassengers(prev => prev.filter(p => p.id !== id));
  //   if (group === 'saOthers') setSaudiOthersPassengers(prev => prev.filter(p => p.id !== id));
  // };

  // Bangladesh cost modal handlers
  const openBdCostModal = (field, label) => {
    setBdCostModalConfig({ field, label });
    setNewBdCost(costs[field] || 0);
    setShowBdCostModal(true);
  };

  const closeBdCostModal = () => {
    setShowBdCostModal(false);
  };

  const saveBdCost = () => {
    setCosts(prev => ({
      ...prev,
      [bdCostModalConfig.field]: newBdCost
    }));
    setShowBdCostModal(false);
  };

  // Saudi cost modal handlers
  const openSaudiCostModal = (field, label) => {
    setSaudiCostModalConfig({ field, label });
    setNewSaudiCost(costs[field] || 0);
    setShowSaudiCostModal(true);
  };

  const closeSaudiCostModal = () => {
    setShowSaudiCostModal(false);
  };

  const saveSaudiCost = () => {
    setCosts(prev => ({
      ...prev,
      [saudiCostModalConfig.field]: newSaudiCost
    }));
    setShowSaudiCostModal(false);
  };

  // Helper function to render Saudi passenger type section
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
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>কোন যাত্রী যোগ করা হয়নি। &quot;যাত্রী যোগ করুন&quot; বাটনে ক্লিক করুন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {passengers.map((passenger) => (
            <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                  <select
                    value={passenger.type}
                    onChange={(e) => handlers.handleChange(passenger.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                    <option value="Infant">Infant</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                  <input
                    type="number"
                    value={passenger.count}
                    onChange={(e) => handlers.handleChange(passenger.id, 'count', e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">কত দিন</label>
                  <input
                    type="number"
                    value={passenger.days || 0}
                    onChange={(e) => handlers.handleChange(passenger.id, 'days', e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রতি দিন SAR</label>
                  <input
                    type="number"
                    value={passenger.perDayPrice || 0}
                    onChange={(e) => handlers.handleChange(passenger.id, 'perDayPrice', e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00 SAR"
                  />
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium">ক্যালকুলেশন:</div>
                <div className="text-xs">
                  {passenger.count} × {passenger.days || 0} × {formatNumber(passenger.perDayPrice || 0)} = {formatNumber((passenger.count || 0) * (passenger.days || 0) * (passenger.perDayPrice || 0))} BDT
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSaudiPassengerSection = (title, passengers, handlers, colorClass, groupKey) => (
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
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>কোন যাত্রী যোগ করা হয়নি। &quot;যাত্রী যোগ করুন&quot; বাটনে ক্লিক করুন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {passengers.map((passenger) => (
            <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                  <select
                    value={passenger.type}
                    onChange={(e) => handlers.handleChange(passenger.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                    <option value="Infant">Infant</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                  <input
                    type="number"
                    value={passenger.count}
                    onChange={(e) => handlers.handleChange(passenger.id, 'count', e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (BDT)</label>
                  <input
                    type="number"
                    value={passenger.price}
                    onChange={(e) => handlers.handleChange(passenger.id, 'price', e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00 BDT"
                  />
                </div>
                
                <div className="flex items-end"></div>
              </div>
              
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                মোট: {passenger.count} × {formatNumber(passenger.price)} = {formatNumber(passenger.count * passenger.price)} BDT
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Helper function to render hotel passenger type section with enhanced fields
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
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>কোন যাত্রী যোগ করা হয়নি। &quot;যাত্রী যোগ করুন&quot; বাটনে ক্লিক করুন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {passengers.map((passenger) => {
            const totalPerPerson = passenger.roomNumber * passenger.perNight * passenger.totalNights;
            return (
              <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                    <select
                      value={passenger.type}
                      onChange={(e) => handlers.handleChange(passenger.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                      <option value="Infant">Infant</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হোটেল নাম</label>
                    <input
                      type="text"
                      value={passenger.hotelName}
                      onChange={(e) => handlers.handleChange(passenger.id, 'hotelName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="হোটেল নাম"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">রুম সংখ্যা</label>
                    <input
                      type="number"
                      value={passenger.roomNumber}
                      onChange={(e) => handlers.handleChange(passenger.id, 'roomNumber', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রতি রাত (SAR)</label>
                    <input
                      type="number"
                      value={passenger.perNight}
                      onChange={(e) => handlers.handleChange(passenger.id, 'perNight', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00 BDT"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মোট রাত</label>
                    <input
                      type="number"
                      value={passenger.totalNights}
                      onChange={(e) => handlers.handleChange(passenger.id, 'totalNights', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হাজী সংখ্যা</label>
                    <input
                      type="number"
                      value={passenger.hajiCount}
                      onChange={(e) => handlers.handleChange(passenger.id, 'hajiCount', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="font-medium">ক্যালকুলেশন:</div>
                    <div className="text-xs">
                      {passenger.roomNumber} × {passenger.perNight} × {passenger.totalNights} = {formatCurrency(totalPerPerson * (parseFloat(formData.sarToBdtRate) || 1))} BDT 
                    </div>
                  </div>
                  <div></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // File upload handlers
  // const handleFileUpload = async (files) => {
  //   const fileArray = Array.from(files);
  //   const validFiles = fileArray.filter(file => {
  //     const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
  //     const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
  //     return isValidType && isValidSize;
  //   });

  //   if (validFiles.length !== fileArray.length) {
  //     Swal.fire({
  //       title: 'Invalid Files',
  //       text: 'Please upload only images and PDFs under 10MB',
  //       icon: 'warning',
  //       confirmButtonColor: '#059669'
  //     });
  //     return;
  //   }

  //   for (const file of validFiles) {
  //     await uploadToCloudinary(file);
  //   }
  // };

  const uploadToCloudinary = async (file) => {
    const uploadId = Date.now() + Math.random();
    setUploadingFiles(prev => [...prev, { id: uploadId, file, progress: 0 }]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      
      setAttachments(prev => [...prev, {
        public_id: result.public_id,
        url: result.url,
        secure_url: result.secure_url,
        format: result.format,
        bytes: result.bytes,
        original_name: file.name
      }]);

      setUploadingFiles(prev => prev.filter(item => item.id !== uploadId));
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => prev.filter(item => item.id !== uploadId));
      Swal.fire({
        title: 'Upload Failed',
        text: `Failed to upload ${file.name}`,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  // const removeAttachment = (index) => {
  //   setAttachments(prev => prev.filter((_, i) => i !== index));
  // };

  // Drag and drop handlers
  // const handleDragOver = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  // };

  // const handleDrop = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   const files = e.dataTransfer.files;
  //   if (files.length > 0) {
  //     handleFileUpload(files);
  //   }
  // };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.packageName.trim()) {
      newErrors.packageName = 'Package name is required';
    }

    if (!formData.packageYear) {
      newErrors.packageYear = 'Package year is required';
    }

    if (!formData.agentId) {
      newErrors.agentId = 'Please select an agent';
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
        ...formData,
        bangladeshAirfarePassengers,
        bangladeshBusPassengers,
        bangladeshTrainingOtherPassengers,
        bangladeshVisaPassengers,
        saudiVisaPassengers,
        saudiMakkahHotelPassengers,
        saudiMadinaHotelPassengers,
        saudiMakkahFoodPassengers,
        saudiMadinaFoodPassengers,
        saudiMakkahZiyaraPassengers,
        saudiMadinaZiyaraPassengers,
        saudiTransportPassengers,
        saudiOthersPassengers,
        costs,
        totals,
        attachments,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create package');
      }

      Swal.fire({
        title: 'Success!',
        text: 'Package created successfully!',
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        // Navigate to agent profile after success
        if (formData.agentId) {
          router.push(`/hajj-umrah/b2b-agent/agent/${formData.agentId}`);
        } else {
          router.push('/hajj-umrah/b2b-agent');
        }
      });
      
      // Reset form on success
      setFormData({
        packageName: '',
        packageYear: '',
        packageType: 'Regular',
        customPackageType: '',
        sarToBdtRate: '',
        notes: '',
        agentId: agentIdFromUrl || '',
        status: 'Active'
      });
      setCosts(Object.fromEntries(Object.keys(costs || {}).map(key => [key, ''])));
      setBangladeshVisaPassengers([]);
      setBangladeshAirfarePassengers([]);
      setBangladeshBusPassengers([]);
      setBangladeshTrainingOtherPassengers([]);
      setSaudiVisaPassengers([]);
      setSaudiMakkahHotelPassengers([]);
      setSaudiMadinaHotelPassengers([]);
      setSaudiMakkahFoodPassengers([]);
      setSaudiMadinaFoodPassengers([]);
      setSaudiMakkahZiyaraPassengers([]);
      setSaudiMadinaZiyaraPassengers([]);
      setSaudiTransportPassengers([]);
      setSaudiOthersPassengers([]);
      setDiscount('');
      setAttachments([]);
      setErrors({});
    } catch (error) {
      console.error('Error creating package:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to create package',
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

  const isFormValid = formData.packageName.trim() && formData.packageYear && totals.subtotal > 0 && formData.agentId;
  const hasAgents = agentsData?.data?.length > 0;

  // Due to the large size, I'll continue with the rest of the component in the next part...
  // The component structure continues with the JSX return statement...

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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              হজ ও উমরাহ প্যাকেজ তৈরি
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              পেশাদার হজ ও উমরাহ প্যাকেজ তৈরি করুন এবং পরিচালনা করুন
            </p>
          </div>

          {/* Agent Selection Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">এজেন্ট নির্বাচন করুন</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  এজেন্ট নির্বাচন করুন *
                </label>
                <select
                  value={formData.agentId}
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.agentId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                  disabled={!!agentIdFromUrl}
                >
                  <option value="">এজেন্ট নির্বাচন করুন</option>
                  {agentsData?.data?.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.tradeName} - {agent.ownerName} ({agent.contact})
                    </option>
                  ))}
                </select>
                {errors.agentId && (
                  <p className="text-sm text-red-500 mt-1">{errors.agentId}</p>
                )}
                {agentsLoading && (
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">এজেন্ট লোড হচ্ছে...</p>
                  </div>
                )}
                {!agentsLoading && agentsData?.data?.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">কোন এজেন্ট পাওয়া যায়নি। প্রথমে এজেন্ট যোগ করুন।</p>
                )}
              </div>
              
              {formData.agentId && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3">নির্বাচিত এজেন্ট</h3>
                  {(() => {
                    const selectedAgent = agentsData?.data?.find(agent => agent._id === formData.agentId);
                    return selectedAgent ? (
                      <div className="flex items-start gap-4">
                        {/* Agent Profile Picture */}
                        <div className="shrink-0">
                          {selectedAgent.profilePicture || selectedAgent.profileImage || selectedAgent.image ? (
                            <img 
                              src={selectedAgent.profilePicture || selectedAgent.profileImage || selectedAgent.image} 
                              alt={selectedAgent.tradeName || 'Agent'}
                              className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-20 h-20 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center ${selectedAgent.profilePicture || selectedAgent.profileImage || selectedAgent.image ? 'hidden' : ''}`}
                          >
                            <Users className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                          </div>
                        </div>
                        {/* Agent Info */}
                        <div className="text-sm text-blue-800 dark:text-blue-200 flex-1">
                          <p className="font-semibold text-base mb-1">{selectedAgent.tradeName}</p>
                          <p><strong>মালিক:</strong> {selectedAgent.ownerName}</p>
                          <p><strong>যোগাযোগ:</strong> {selectedAgent.contact}</p>
                          <p><strong>অবস্থান:</strong> {selectedAgent.location}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-purple-600" />
                    মৌলিক তথ্য
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        কাস্টম প্যাকেজ টাইপ
                      </label>
                      <select
                        name="customPackageType"
                        value={formData.customPackageType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">কাস্টম প্যাকেজ নির্বাচন করুন</option>
                        <option value="Custom Hajj">Hajj</option>
                        <option value="Custom Umrah">Umrah</option>
                      </select>
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
                        {Array.from({ length: 21 }, (_, i) => 2030 - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      {errors.packageYear && (
                        <p className="mt-1 text-sm text-red-600">{errors.packageYear}</p>
                      )}
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        প্যাকেজ নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="packageName"
                        value={formData.packageName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                          errors.packageName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="প্যাকেজের নাম লিখুন"
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
                        placeholder="0.00 BDT"
                      />
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
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Draft">Draft</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cost Details Section - Collapsible */}
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
                      {/* Bangladesh Portion Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                          বাংলাদেশ অংশ
                        </h3>
                        
                        {/* Show simple form only for Custom Haj */}
                        {formData.customPackageType === 'Custom Hajj' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  বিমান ভাড়া
                                </label>
                                <input 
                                  type="number" 
                                  name="bangladeshAirfare" 
                                  value={costs.bangladeshAirfare || ''} 
                                  onChange={handleCostChange} 
                                  min="0" 
                                  step="0.01" 
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                  placeholder="0.00" 
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  হজ্জ কল্যাণ ফি
                                </label>
                                <input 
                                  type="number" 
                                  name="hajjKollan" 
                                  value={costs.hajjKollan || ''} 
                                  onChange={handleCostChange} 
                                  min="0" 
                                  step="0.01" 
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                  placeholder="0.00" 
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  হজ গাইড ফি
                                </label>
                                <input 
                                  type="number" 
                                  name="hajjGuide" 
                                  value={costs.hajjGuide || ''} 
                                  onChange={handleCostChange} 
                                  min="0" 
                                  step="0.01" 
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                  placeholder="0.00" 
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  লাইসেন্স চার্জ ফি
                                </label>
                                <input 
                                  type="number" 
                                  name="licenseFee" 
                                  value={costs.licenseFee || ''} 
                                  onChange={handleCostChange} 
                                  min="0" 
                                  step="0.01" 
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                  placeholder="0.00" 
                                />
                              </div>

                              {/* Full width field */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  অন্যান্য বাংলাদেশি খরচ
                                </label>
                                <input 
                                  type="number" 
                                  name="otherBdCosts" 
                                  value={costs.otherBdCosts || ''} 
                                  onChange={handleCostChange} 
                                  min="0" 
                                  step="0.01" 
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                  placeholder="0.00" 
                                />
                              </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  আইডি কার্ড ফি
                                </label>
                                <input 
                                  type="number" 
                                  name="idCard" 
                                  value={costs.idCard || ''} 
                                  onChange={handleCostChange} 
                                  min="0" 
                                  step="0.01" 
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                  placeholder="0.00" 
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  ট্রেনিং ফি
                                </label>
                                <input 
                                  type="number" 
                                  name="trainFee" 
                                  value={costs.trainFee || ''} 
                                  onChange={handleCostChange} 
                                  min="0" 
                                  step="0.01" 
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                  placeholder="0.00" 
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  সার্ভিস চার্জ (সরকারি)
                                </label>
                                <input 
                                  type="number" 
                                  name="govtServiceCharge" 
                                  value={costs.govtServiceCharge || ''} 
                                  onChange={handleCostChange} 
                                  min="0" 
                                  step="0.01" 
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                  placeholder="0.00" 
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  যাতায়াত ফি
                                </label>
                                <input 
                                  type="number" 
                                  name="transportFee" 
                                  value={costs.transportFee || ''} 
                                  onChange={handleCostChange} 
                                  min="0" 
                                  step="0.01" 
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                  placeholder="0.00" 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Original complex form for other package types
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bangladesh Visa Costing */}
                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ভিসা খরচ (যাত্রীর ধরন অনুযায়ী)</label>
                                <button
                                  type="button"
                                  onClick={() => openPassengerModal('bdVisa', 'standard')}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                >
                                  + যাত্রী যোগ করুন
                                </button>
                              </div>
                              
                              {bangladeshVisaPassengers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                  <p className="text-sm">কোন যাত্রী যোগ করা হয়নি। &quot;যাত্রী যোগ করুন&quot; বাটনে ক্লিক করুন।</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {bangladeshVisaPassengers.map((passenger) => (
                                    <div key={passenger.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                                          <select
                                            value={passenger.type}
                                            onChange={(e) => handleBangladeshVisaChange(passenger.id, 'type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                          >
                                            <option value="Adult">Adult</option>
                                            <option value="Child">Child</option>
                                            <option value="Infant">Infant</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                                          <input
                                            type="number"
                                            value={passenger.count}
                                            onChange={(e) => handleBangladeshVisaChange(passenger.id, 'count', e.target.value)}
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (BDT)</label>
                                          <input
                                            type="number"
                                            value={passenger.price}
                                            onChange={(e) => handleBangladeshVisaChange(passenger.id, 'price', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0.00 BDT"
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3 flex items-center justify-between">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                          মোট: {passenger.count} × {formatCurrency(passenger.price)} = {formatCurrency(passenger.count * passenger.price)} BDT
                                        </div>
                                        <button
                                          onClick={() => removeBangladeshVisaPassenger(passenger.id)}
                                          className="text-red-500 hover:text-red-700"
                                          type="button"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Bangladesh Airfare Passenger Types */}
                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">বিমান ভাড়া (যাত্রীর ধরন অনুযায়ী)</label>
                                <button
                                  type="button"
                                  onClick={() => openPassengerModal('bdAirfare', 'standard')}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                >
                                  + যাত্রী যোগ করুন
                                </button>
                              </div>
                              
                              {bangladeshAirfarePassengers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                  <p>কোন যাত্রী যোগ করা হয়নি। &quot;যাত্রী যোগ করুন&quot; বাটনে ক্লিক করুন।</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {bangladeshAirfarePassengers.map((passenger) => (
                                    <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                                          <select
                                            value={passenger.type}
                                            onChange={(e) => handleBangladeshAirfareChange(passenger.id, 'type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                          >
                                            <option value="Adult">Adult</option>
                                            <option value="Child">Child</option>
                                            <option value="Infant">Infant</option>
                                          </select>
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                                          <input
                                            type="number"
                                            value={passenger.count}
                                            onChange={(e) => handleBangladeshAirfareChange(passenger.id, 'count', e.target.value)}
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0"
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (BDT)</label>
                                          <input
                                            type="number"
                                            value={passenger.price}
                                            onChange={(e) => handleBangladeshAirfareChange(passenger.id, 'price', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0.00 BDT"
                                          />
                                        </div>
                                        
                                        <div className="flex items-end">
                                          <button
                                            onClick={() => removeBangladeshAirfarePassenger(passenger.id)}
                                            className="text-red-500 hover:text-red-700"
                                            type="button"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                        মোট: {passenger.count} × {formatCurrency(passenger.price)} = {formatCurrency(passenger.count * passenger.price)} BDT
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {formData.customPackageType !== 'Custom Umrah' ? (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">আইডি কার্ড ফি</label>
                                  <div className="flex gap-2">
                                    <input type="number" name="idCard" value={costs.idCard || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                    <button type="button" onClick={() => openBdCostModal('idCard', 'আইডি কার্ড ফি')} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                      <Calculator className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <span className="text-xs text-gray-500 mt-1">মূল্য (BDT)</span>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হজ্জ কল্যাণ ফি</label>
                                  <div className="flex gap-2">
                                    <input type="number" name="hajjKollan" value={costs.hajjKollan || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                    <button type="button" onClick={() => openBdCostModal('hajjKollan', 'হজ্জ কল্যাণ ফি')} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                      <Calculator className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <span className="text-xs text-gray-500 mt-1">মূল্য (BDT)</span>
                                </div>

                                {/* Bangladesh Bus Service Passenger Types */}
                                <div className="md:col-span-2">
                                  <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">বাস সার্ভিস (যাত্রীর ধরন অনুযায়ী)</label>
                                    <button
                                      type="button"
                                      onClick={() => openPassengerModal('bdBus', 'standard')}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                      + যাত্রী যোগ করুন
                                    </button>
                                  </div>
                                  
                                  {bangladeshBusPassengers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                      <p>কোন যাত্রী যোগ করা হয়নি। &quot;যাত্রী যোগ করুন&quot; বাটনে ক্লিক করুন।</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {bangladeshBusPassengers.map((passenger) => (
                                        <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                                              <select
                                                value={passenger.type}
                                                onChange={(e) => handleBangladeshBusChange(passenger.id, 'type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                              >
                                                <option value="Adult">Adult</option>
                                                <option value="Child">Child</option>
                                                <option value="Infant">Infant</option>
                                              </select>
                                            </div>
                                            
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                                              <input
                                                type="number"
                                                value={passenger.count}
                                                onChange={(e) => handleBangladeshBusChange(passenger.id, 'count', e.target.value)}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                placeholder="0"
                                              />
                                            </div>
                                            
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (BDT)</label>
                                              <input
                                                type="number"
                                                value={passenger.price}
                                                onChange={(e) => handleBangladeshBusChange(passenger.id, 'price', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                placeholder="0.00 BDT"
                                              />
                                            </div>
                                            
                                            <div className="flex items-end">
                                              <button
                                                onClick={() => removeBangladeshBusPassenger(passenger.id)}
                                                className="text-red-500 hover:text-red-700"
                                                type="button"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </div>
                                          
                                          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                            মোট: {passenger.count} × {formatCurrency(passenger.price)} = {formatCurrency(passenger.count * passenger.price)} BDT
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Bangladesh Training/Other Passenger Types */}
                                <div className="md:col-span-2">
                                  <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ট্রেনিং/অন্যান্য খরচ (যাত্রীর ধরন অনুযায়ী)</label>
                                    <button
                                      type="button"
                                      onClick={() => openPassengerModal('bdTraining', 'standard')}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                      + যাত্রী যোগ করুন
                                    </button>
                                  </div>
                                  
                                  {bangladeshTrainingOtherPassengers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                      <p>কোন যাত্রী যোগ করা হয়নি। &quot;যাত্রী যোগ করুন&quot; বাটনে ক্লিক করুন।</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {bangladeshTrainingOtherPassengers.map((passenger) => (
                                        <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                                              <select
                                                value={passenger.type}
                                                onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                              >
                                                <option value="Adult">Adult</option>
                                                <option value="Child">Child</option>
                                                <option value="Infant">Infant</option>
                                              </select>
                                            </div>
                                            
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                                              <input
                                                type="number"
                                                value={passenger.count}
                                                onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'count', e.target.value)}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                placeholder="0"
                                              />
                                            </div>
                                            
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (BDT)</label>
                                              <input
                                                type="number"
                                                value={passenger.price}
                                                onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'price', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                placeholder="0.00 BDT"
                                              />
                                            </div>
                                            
                                            <div className="flex items-end">
                                              <button
                                                onClick={() => removeBangladeshTrainingOtherPassenger(passenger.id)}
                                                className="text-red-500 hover:text-red-700"
                                                type="button"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </div>
                                          
                                          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                            মোট: {passenger.count} × {formatCurrency(passenger.price)} = {formatCurrency(passenger.count * passenger.price)} BDT
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হজ গাইড ফি</label>
                                  <div className="flex gap-2">
                                    <input type="number" name="hajjGuide" value={costs.hajjGuide || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                    <button type="button" onClick={() => openBdCostModal('hajjGuide', 'হজ গাইড ফি')} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                      <Calculator className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <span className="text-xs text-gray-500 mt-1">মূল্য (BDT)</span>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সার্ভিস চার্জ (সরকারি)</label>
                                  <div className="flex gap-2">
                                    <input type="number" name="govtServiceCharge" value={costs.govtServiceCharge || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                    <button type="button" onClick={() => openBdCostModal('govtServiceCharge', 'সার্ভিস চার্জ (সরকারি)')} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                      <Calculator className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <span className="text-xs text-gray-500 mt-1">মূল্য (BDT)</span>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">লাইসেন্স চার্জ ফি</label>
                                  <div className="flex gap-2">
                                    <input type="number" name="licenseFee" value={costs.licenseFee || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                    <button type="button" onClick={() => openBdCostModal('licenseFee', 'লাইসেন্স চার্জ ফি')} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                      <Calculator className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <span className="text-xs text-gray-500 mt-1">মূল্য (BDT)</span>
                                </div>
                              </>
                            ) : (
                              // Custom Umrah - Show Bus Service and Training/Other passenger types
                              <>
                                {/* Bangladesh Bus Service Passenger Types for Custom Umrah */}
                                <div className="md:col-span-2">
                                  <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">বাস সার্ভিস (যাত্রীর ধরন অনুযায়ী)</label>
                                    <button
                                      type="button"
                                      onClick={() => openPassengerModal('bdBus', 'standard')}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                      + যাত্রী যোগ করুন
                                    </button>
                                  </div>

                                  {bangladeshBusPassengers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                      <p>কোন যাত্রী যোগ করা হয়নি। &quot;যাত্রী যোগ করুন&quot; বাটনে ক্লিক করুন।</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {bangladeshBusPassengers.map((passenger) => (
                                        <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                                              <select
                                                value={passenger.type}
                                                onChange={(e) => handleBangladeshBusChange(passenger.id, 'type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                              >
                                                <option value="Adult">Adult</option>
                                                <option value="Child">Child</option>
                                                <option value="Infant">Infant</option>
                                              </select>
                                            </div>

                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                                              <input
                                                type="number"
                                                value={passenger.count}
                                                onChange={(e) => handleBangladeshBusChange(passenger.id, 'count', e.target.value)}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                placeholder="0"
                                              />
                                            </div>
                                            
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (BDT)</label>
                                              <input
                                                type="number"
                                                value={passenger.price}
                                                onChange={(e) => handleBangladeshBusChange(passenger.id, 'price', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                placeholder="0.00 BDT"
                                              />
                                            </div>
                                            
                                            <div className="flex items-end">
                                              <button
                                                onClick={() => removeBangladeshBusPassenger(passenger.id)}
                                                className="text-red-500 hover:text-red-700"
                                                type="button"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </div>
                                          
                                          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                            মোট: {passenger.count} × {formatCurrency(passenger.price)} = {formatCurrency(passenger.count * passenger.price)} BDT
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Bangladesh Training/Other Passenger Types for Custom Umrah */}
                                <div className="md:col-span-2">
                                  <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ট্রেনিং/অন্যান্য খরচ (যাত্রীর ধরন অনুযায়ী)</label>
                                    <button
                                      type="button"
                                      onClick={() => openPassengerModal('bdTraining', 'standard')}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                      + যাত্রী যোগ করুন
                                    </button>
                                  </div>
                                  
                                  {bangladeshTrainingOtherPassengers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                      <p>কোন যাত্রী যোগ করা হয়নি। &quot;যাত্রী যোগ করুন&quot; বাটনে ক্লিক করুন।</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {bangladeshTrainingOtherPassengers.map((passenger) => (
                                        <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                                              <select
                                                value={passenger.type}
                                                onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                              >
                                                <option value="Adult">Adult</option>
                                                <option value="Child">Child</option>
                                                <option value="Infant">Infant</option>
                                              </select>
                                            </div>
                                            
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                                              <input
                                                type="number"
                                                value={passenger.count}
                                                onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'count', e.target.value)}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                placeholder="0"
                                              />
                                            </div>
                                            
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (BDT)</label>
                                              <input
                                                type="number"
                                                value={passenger.price}
                                                onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'price', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                placeholder="0.00 BDT"
                                              />
                                            </div>
                                            
                                            <div className="flex items-end">
                                              <button
                                                onClick={() => removeBangladeshTrainingOtherPassenger(passenger.id)}
                                                className="text-red-500 hover:text-red-700"
                                                type="button"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </div>
                                          
                                          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                            মোট: {passenger.count} × {formatCurrency(passenger.price)} = {formatCurrency(passenger.count * passenger.price)} BDT
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Saudi Portion Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                          <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                          সৌদি অংশ
                        </h3>
                        

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Conditional rendering based on Custom Umrah selection */}
                          {formData.customPackageType === 'Custom Umrah' ? (
                            // Show passenger-specific fields for Custom Umrah
                            <>
                              {/* Saudi Visa */}
                              {renderSaudiPassengerSection(
                                "ভিসা খরচ (যাত্রীর ধরন অনুযায়ী)",
                                saudiVisaPassengers,
                                saudiVisaHandlers,
                                "bg-red-600 hover:bg-red-700",
                                'saVisa'
                              )}

                              {/* Makkah Hotel */}
                              {renderHotelPassengerSection(
                                "মক্কা হোটেল (যাত্রীর ধরন অনুযায়ী)",
                                saudiMakkahHotelPassengers,
                                saudiMakkahHotelHandlers,
                                "bg-orange-600 hover:bg-orange-700",
                                'saMakkahHotel'
                              )}

                              {/* Madina Hotel */}
                              {renderHotelPassengerSection(
                                "মদিনা হোটেল (যাত্রীর ধরন অনুযায়ী)",
                                saudiMadinaHotelPassengers,
                                saudiMadinaHotelHandlers,
                                "bg-green-600 hover:bg-green-700",
                                'saMadinaHotel'
                              )}

                              {/* Makkah Food */}
                              {renderFoodPassengerSection(
                                "মক্কা খাবার (যাত্রীর ধরন অনুযায়ী)",
                                saudiMakkahFoodPassengers,
                                saudiMakkahFoodHandlers,
                                "bg-yellow-600 hover:bg-yellow-700",
                                'saMakkahFood'
                              )}

                              {/* Madina Food */}
                              {renderFoodPassengerSection(
                                "মদিনা খাবার (যাত্রীর ধরন অনুযায়ী)",
                                saudiMadinaFoodPassengers,
                                saudiMadinaFoodHandlers,
                                "bg-yellow-600 hover:bg-yellow-700",
                                'saMadinaFood'
                              )}

                              {/* Makka Ziyara */}
                              {renderSaudiPassengerSection(
                                "মক্কা জিয়ারা (যাত্রীর ধরন অনুযায়ী)",
                                saudiMakkahZiyaraPassengers,
                                saudiMakkahZiyaraHandlers,
                                "bg-indigo-600 hover:bg-indigo-700",
                                'saMakkahZiyara'
                              )}

                              {/* Madina Ziyara */}
                              {renderSaudiPassengerSection(
                                "মদিনা জিয়ারা (যাত্রীর ধরন অনুযায়ী)",
                                saudiMadinaZiyaraPassengers,
                                saudiMadinaZiyaraHandlers,
                                "bg-indigo-600 hover:bg-indigo-700",
                                'saMadinaZiyara'
                              )}

                              {/* Transport */}
                              {renderSaudiPassengerSection(
                                "পরিবহন (যাত্রীর ধরন অনুযায়ী)",
                                saudiTransportPassengers,
                                saudiTransportHandlers,
                                "bg-teal-600 hover:bg-teal-700",
                                'saTransport'
                              )}

                              {/* Camp Fee */}
                              {renderSaudiPassengerSection(
                                "ক্যাম্প ফি (যাত্রীর ধরন অনুযায়ী)",
                                saudiCampFeePassengers,
                                saudiCampFeeHandlers,
                                "bg-amber-600 hover:bg-amber-700",
                                'saCampFee'
                              )}

                              {/* Al Mashayer */}
                              {renderSaudiPassengerSection(
                                "আল মাশায়ের (যাত্রীর ধরন অনুযায়ী)",
                                saudiAlMashayerPassengers,
                                saudiAlMashayerHandlers,
                                "bg-cyan-600 hover:bg-cyan-700",
                                'saAlMashayer'
                              )}

                              {/* Others */}
                              {renderSaudiPassengerSection(
                                "অন্যান্য (যাত্রীর ধরন অনুযায়ী)",
                                saudiOthersPassengers,
                                saudiOthersHandlers,
                                "bg-gray-600 hover:bg-gray-700",
                                'saOthers'
                              )}
                            </>
                          ) : formData.customPackageType === 'Custom Hajj' ? (
                            // Show passenger-specific fields for Custom Hajj (same as Custom Umrah)
                            <>
                              {/* Saudi Visa */}
                              {renderSaudiPassengerSection(
                                "ভিসা খরচ (যাত্রীর ধরন অনুযায়ী)",
                                saudiVisaPassengers,
                                saudiVisaHandlers,
                                "bg-red-600 hover:bg-red-700",
                                'saVisa'
                              )}

                              {/* Makkah Hotel */}
                              {renderHotelPassengerSection(
                                "মক্কা হোটেল (যাত্রীর ধরন অনুযায়ী)",
                                saudiMakkahHotelPassengers,
                                saudiMakkahHotelHandlers,
                                "bg-orange-600 hover:bg-orange-700",
                                'saMakkahHotel'
                              )}

                              {/* Madina Hotel */}
                              {renderHotelPassengerSection(
                                "মদিনা হোটেল (যাত্রীর ধরন অনুযায়ী)",
                                saudiMadinaHotelPassengers,
                                saudiMadinaHotelHandlers,
                                "bg-green-600 hover:bg-green-700",
                                'saMadinaHotel'
                              )}

                              {/* Makkah Food */}
                              {renderFoodPassengerSection(
                                "মক্কা খাবার (যাত্রীর ধরন অনুযায়ী)",
                                saudiMakkahFoodPassengers,
                                saudiMakkahFoodHandlers,
                                "bg-yellow-600 hover:bg-yellow-700",
                                'saMakkahFood'
                              )}

                              {/* Madina Food */}
                              {renderFoodPassengerSection(
                                "মদিনা খাবার (যাত্রীর ধরন অনুযায়ী)",
                                saudiMadinaFoodPassengers,
                                saudiMadinaFoodHandlers,
                                "bg-yellow-600 hover:bg-yellow-700",
                                'saMadinaFood'
                              )}

                              {/* Makka Ziyara */}
                              {renderSaudiPassengerSection(
                                "মক্কা জিয়ারা (যাত্রীর ধরন অনুযায়ী)",
                                saudiMakkahZiyaraPassengers,
                                saudiMakkahZiyaraHandlers,
                                "bg-indigo-600 hover:bg-indigo-700",
                                'saMakkahZiyara'
                              )}

                              {/* Madina Ziyara */}
                              {renderSaudiPassengerSection(
                                "মদিনা জিয়ারা (যাত্রীর ধরন অনুযায়ী)",
                                saudiMadinaZiyaraPassengers,
                                saudiMadinaZiyaraHandlers,
                                "bg-indigo-600 hover:bg-indigo-700",
                                'saMadinaZiyara'
                              )}

                              {/* Transport */}
                              {renderSaudiPassengerSection(
                                "পরিবহন (যাত্রীর ধরন অনুযায়ী)",
                                saudiTransportPassengers,
                                saudiTransportHandlers,
                                "bg-teal-600 hover:bg-teal-700",
                                'saTransport'
                              )}

                              {/* Camp Fee */}
                              {renderSaudiPassengerSection(
                                "ক্যাম্প ফি (যাত্রীর ধরন অনুযায়ী)",
                                saudiCampFeePassengers,
                                saudiCampFeeHandlers,
                                "bg-amber-600 hover:bg-amber-700",
                                'saCampFee'
                              )}

                              {/* Al Mashayer */}
                              {renderSaudiPassengerSection(
                                "আল মাশায়ের (যাত্রীর ধরন অনুযায়ী)",
                                saudiAlMashayerPassengers,
                                saudiAlMashayerHandlers,
                                "bg-cyan-600 hover:bg-cyan-700",
                                'saAlMashayer'
                              )}

                              {/* Others */}
                              {renderSaudiPassengerSection(
                                "অন্যান্য (যাত্রীর ধরন অনুযায়ী)",
                                saudiOthersPassengers,
                                saudiOthersHandlers,
                                "bg-gray-600 hover:bg-gray-700",
                                'saOthers'
                              )}
                            </>
                          ) : (
                            // Show all fields for other package types
                            <>
                              {/* Makkah Hotels */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল 01</label>
                                <div className="flex gap-2">
                                  <input type="number" name="makkahHotel1" value={costs.makkahHotel1 || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('makkahHotel1', 'মক্কা হোটেল 01')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল 02</label>
                                <div className="flex gap-2">
                                  <input type="number" name="makkahHotel2" value={costs.makkahHotel2 || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('makkahHotel2', 'মক্কা হোটেল 02')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল 03</label>
                                <div className="flex gap-2">
                                  <input type="number" name="makkahHotel3" value={costs.makkahHotel3 || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('makkahHotel3', 'মক্কা হোটেল 03')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>

                              {/* Madina Hotels */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মদিনা হোটেল 01</label>
                                <div className="flex gap-2">
                                  <input type="number" name="madinaHotel1" value={costs.madinaHotel1 || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('madinaHotel1', 'মদিনা হোটেল 01')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মদিনা হোটেল 02</label>
                                <div className="flex gap-2">
                                  <input type="number" name="madinaHotel2" value={costs.madinaHotel2 || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('madinaHotel2', 'মদিনা হোটেল 02')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">জমজম পানি ফি</label>
                                <div className="flex gap-2">
                                  <input type="number" name="zamzamWater" value={costs.zamzamWater || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('zamzamWater', 'জমজম পানি ফি')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্তব ফি</label>
                                <div className="flex gap-2">
                                  <input type="number" name="maktab" value={costs.maktab || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('maktab', 'মক্তব ফি')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ভিসা ফি</label>
                                <div className="flex gap-2">
                                  <input type="number" name="visaFee" value={costs.visaFee || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('visaFee', 'ভিসা ফি')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ইনস্যুরেন্স ফি</label>
                                <div className="flex gap-2">
                                  <input type="number" name="insuranceFee" value={costs.insuranceFee || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('insuranceFee', 'ইনস্যুরেন্স ফি')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ইলেকট্রনিক্স ফি</label>
                                <div className="flex gap-2">
                                  <input type="number" name="electronicsFee" value={costs.electronicsFee || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('electronicsFee', 'ইলেকট্রনিক্স ফি')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">গ্রাউন্ড সার্ভিস ফি</label>
                                <div className="flex gap-2">
                                  <input type="number" name="groundServiceFee" value={costs.groundServiceFee || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('groundServiceFee', 'গ্রাউন্ড সার্ভিস ফি')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা রুট ফি</label>
                                <div className="flex gap-2">
                                  <input type="number" name="makkahRoute" value={costs.makkahRoute || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('makkahRoute', 'মক্কা রুট ফি')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ব্যাগেজ ফি</label>
                                <div className="flex gap-2">
                                  <input type="number" name="baggage" value={costs.baggage || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('baggage', 'ব্যাগেজ ফি')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সার্ভিস চার্জ ফি</label>
                                <div className="flex gap-2">
                                  <input type="number" name="serviceCharge" value={costs.serviceCharge || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('serviceCharge', 'সার্ভিস চার্জ ফি')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মোনাজ্জেম ফি</label>
                                <div className="flex gap-2">
                                  <input type="number" name="monazzem" value={costs.monazzem || ''} onChange={handleCostChange} min="0" step="0.01" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                                  <button type="button" onClick={() => openSaudiCostModal('monazzem', 'মোনাজ্জেম ফি')} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <Calculator className="w-5 h-5" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">মূল্য (SAR)</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Discount Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                          ছাড়
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ছাড়ের পরিমাণ</label>
                            <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
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
                    disabled={!isFormValid || isSubmitting || !hasAgents}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>প্যাকেজ তৈরি করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                      খরচের সারসংক্ষেপ
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Summary items from totals */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ভিসা খরচ</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.bangladeshVisaCosts)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বিমান ভাড়া</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.totalAirFare)}</span>
                    </div>

                    {formData.customPackageType === 'Custom Hajj' && (
                      <>
                        {totals.bangladeshBusCosts > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">বাস সার্ভিস খরচ</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.bangladeshBusCosts)}</span>
                          </div>
                        )}
                        {totals.bangladeshTrainingOtherCosts > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ট্রেনিং/অন্যান্য খরচ</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.bangladeshTrainingOtherCosts)}</span>
                          </div>
                        )}
                        {totals.otherBangladeshCosts > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">অন্যান্য বাংলাদেশি খরচ</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.otherBangladeshCosts)}</span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ছাড়</span>
                      <span className="text-sm font-semibold text-red-600">-{formatCurrency(discount)}</span>
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

          {/* Modals - Generic Passenger Modal */}
          {showPassengerModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">যাত্রী যোগ করুন</h3>
                  <button onClick={closePassengerModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                    <select
                      value={newPassenger.type}
                      onChange={(e) => handleNewPassengerChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                      <option value="Infant">Infant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                    <input type="number" value={newPassenger.count} onChange={(e) => handleNewPassengerChange('count', e.target.value)} min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0" />
                  </div>

                  {passengerModalConfig.type === 'standard' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (BDT)</label>
                      <input type="number" value={newPassenger.price} onChange={(e) => handleNewPassengerChange('price', e.target.value)} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00 BDT" />
                    </div>
                  )}

                  {passengerModalConfig.type === 'hotel' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হোটেল নাম</label>
                        <input type="text" value={newPassenger.hotelName} onChange={(e) => handleNewPassengerChange('hotelName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="হোটেল নাম" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">রুম সংখ্যা</label>
                        <input type="number" value={newPassenger.roomNumber} onChange={(e) => handleNewPassengerChange('roomNumber', e.target.value)} min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রতি রাত (SAR)</label>
                        <input type="number" value={newPassenger.perNight} onChange={(e) => handleNewPassengerChange('perNight', e.target.value)} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00 SAR" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মোট রাত</label>
                        <input type="number" value={newPassenger.totalNights} onChange={(e) => handleNewPassengerChange('totalNights', e.target.value)} min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0" />
                      </div>
                    </>
                  )}

                  {passengerModalConfig.type === 'food' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">কত দিন</label>
                        <input type="number" value={newPassenger.days} onChange={(e) => handleNewPassengerChange('days', e.target.value)} min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রতি দিন SAR</label>
                        <input type="number" value={newPassenger.perDayPrice} onChange={(e) => handleNewPassengerChange('perDayPrice', e.target.value)} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00 SAR" />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button onClick={closePassengerModal} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">বাতিল</button>
                  <button onClick={savePassengerFromModal} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">যোগ করুন</button>
                </div>
              </div>
            </div>
          )}

          {/* Bangladesh Cost Modal */}
          {showBdCostModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {bdCostModalConfig.label} সম্পাদনা
                  </h3>
                  <button onClick={closeBdCostModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {bdCostModalConfig.label} (BDT)
                    </label>
                    <input
                      type="number"
                      value={newBdCost}
                      onChange={(e) => setNewBdCost(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00 BDT"
                    />
                  </div>

                  {newBdCost > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        মোট: {formatCurrency(newBdCost)} BDT
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button onClick={closeBdCostModal} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">বাতিল</button>
                  <button onClick={saveBdCost} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">সংরক্ষণ</button>
                </div>
              </div>
            </div>
          )}

          {/* Saudi Cost Modal */}
          {showSaudiCostModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {saudiCostModalConfig.label} সম্পাদনা
                  </h3>
                  <button onClick={closeSaudiCostModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {saudiCostModalConfig.label} (SAR)
                    </label>
                    <input
                      type="number"
                      value={newSaudiCost}
                      onChange={(e) => setNewSaudiCost(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00 SAR"
                    />
                  </div>

                  {newSaudiCost > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        মোট: {newSaudiCost.toLocaleString()} SAR
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        BDT: {formatCurrency(newSaudiCost * (parseFloat(formData.sarToBdtRate) || 1))}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button onClick={closeSaudiCostModal} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">বাতিল</button>
                  <button onClick={saveSaudiCost} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">সংরক্ষণ</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentPackageCreation;
