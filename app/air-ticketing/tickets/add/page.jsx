'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '../../../hooks/useSession';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  Save, 
  ArrowLeft, 
  Calendar, 
  Receipt,
  Eye,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search, 
  User,
  Users,
  Building,
  Plane,
  Plus,
  CheckCircle,
  X,
  Loader2,
} from 'lucide-react';
import Swal from 'sweetalert2';

// Modal Component
const Modal = ({ isOpen, onClose, title, size = 'md', children }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModalFooter = ({ children }) => {
  return (
    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );
};

const NewTicket = () => {
  const router = useRouter();
  const { user } = useSession();
  
  // Get today's date in YYYY-MM-DD format for default value
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    tripType: 'oneway',
    flightType: 'domestic',
    date: getTodayDate(),
    bookingId: '',
    gdsPnr: '',
    airlinePnr: '',
    airline: '',
    airlineId: '',
    origin: '',
    destination: '',
    flightDate: '',
    returnDate: '',
    segments: [
      { origin: '', destination: '', date: '' },
      { origin: '', destination: '', date: '' }
    ],
    agent: '',
    agentId: '',
    issuedBy: '',
    issuedById: '',
    vendor: '',
    vendorId: '',
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
    dueDate: '',
    status: 'pending',
    segmentCount: 1,
    flownSegment: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showTaxes, setShowTaxes] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [touched, setTouched] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Customer search state
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Agent search state
  const [agentQuery, setAgentQuery] = useState('');
  const [agentResults, setAgentResults] = useState([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Airline search state
  const [airlineQuery, setAirlineQuery] = useState('');
  const [airlineResults, setAirlineResults] = useState([]);
  const [airlineLoading, setAirlineLoading] = useState(false);
  const [showAirlineDropdown, setShowAirlineDropdown] = useState(false);
  const [selectedAirlineId, setSelectedAirlineId] = useState('');

  // Employee search state
  const [employeeQuery, setEmployeeQuery] = useState('');
  const [employeeResults, setEmployeeResults] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState(null);
  const [loadingEmployeeProfile, setLoadingEmployeeProfile] = useState(false);

  // Vendor search state
  const [vendorQuery, setVendorQuery] = useState('');
  const [vendorResults, setVendorResults] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');

  // Add new customer modal state
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    mobile: '',
    email: '',
    passportNumber: '',
    address: ''
  });
  const [addingCustomer, setAddingCustomer] = useState(false);

  const markTouched = (name) => setTouched(prev => ({ ...prev, [name]: true }));

  // Debounced backend search for air customers
  useEffect(() => {
    const q = customerQuery.trim();
    if (!q || q.length < 2) {
      setCustomerResults([]);
      return;
    }

    let active = true;
    setCustomerLoading(true);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          search: q,
          page: '1',
          limit: '20',
          isActive: 'true'
        });
        
        const res = await fetch(`/api/air-customers?${params.toString()}`);
        const data = await res.json();
        
        let list = [];
        if (data?.success && Array.isArray(data.customers)) {
          list = data.customers;
        } else if (Array.isArray(data?.customers)) {
          list = data.customers;
        } else if (Array.isArray(data)) {
          list = data;
        }

        const normalizedQ = q.toLowerCase();
        const filtered = list.filter((c) => {
          const id = String(c.id || c.customerId || c._id || '').toLowerCase();
          const name = String(c.name || '').toLowerCase();
          const phone = String(c.phone || c.mobile || '');
          const email = String(c.email || '').toLowerCase();
          const passportNumber = String(c.passportNumber || '').toLowerCase();
          return (
            id.includes(normalizedQ) ||
            name.includes(normalizedQ) ||
            phone.includes(q) ||
            email.includes(normalizedQ) ||
            passportNumber.includes(normalizedQ)
          );
        });

        if (active) setCustomerResults(filtered.slice(0, 10));
      } catch (err) {
        if (active) setCustomerResults([]);
      } finally {
        if (active) setCustomerLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customerQuery]);

  // Fetch initial customers when dropdown is shown
  useEffect(() => {
    if (showCustomerDropdown && customerResults.length === 0 && !customerQuery && !customerLoading) {
      const fetchInitialCustomers = async () => {
        try {
          const params = new URLSearchParams({ 
            limit: '10', 
            page: '1', 
            isActive: 'true' 
          });
          const res = await fetch(`/api/air-customers?${params.toString()}`);
          const data = await res.json();
          
          let list = [];
          if (data?.success && Array.isArray(data.customers)) {
            list = data.customers;
          } else if (Array.isArray(data?.customers)) {
            list = data.customers;
          } else if (Array.isArray(data)) {
            list = data;
          }
          
          setCustomerResults(list.slice(0, 10));
        } catch (err) {
          // Silent fail
        }
      };
      fetchInitialCustomers();
    }
  }, [showCustomerDropdown, customerResults.length, customerQuery, customerLoading]);

  const handleSelectCustomer = (customer) => {
    const customerId = customer.customerId || customer.id || customer._id || '';
    const customerName = customer.name || '';
    const customerPhone = customer.mobile || customer.phone || '';
    
    setFormData(prev => ({
      ...prev,
      customerId: customerId,
      customerName: customerName,
      customerPhone: customerPhone
    }));
    setCustomerQuery(customerName || customerId);
    setShowCustomerDropdown(false);
  };

  // Debounced backend search for agents
  useEffect(() => {
    const q = agentQuery.trim();
    
    let active = true;
    setAgentLoading(true);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (q.length >= 2) {
          params.append('search', q);
        }
        params.append('limit', '20');
        params.append('page', '1');
        
        const res = await fetch(`/api/air-agents?${params.toString()}`);
        const responseData = await res.json();
        
        let list = [];
        if (responseData?.success && Array.isArray(responseData.data)) {
          list = responseData.data;
        } else if (Array.isArray(responseData?.data)) {
          list = responseData.data;
        } else if (Array.isArray(responseData)) {
          list = responseData;
        }

        if (q.length >= 2) {
          const normalizedQ = q.toLowerCase();
          const filtered = list.filter((a) => {
            const id = String(a.id || a.agentId || a.idCode || a._id || '').toLowerCase();
            const name = String(a.name || a.tradeName || a.companyName || a.personalName || '').toLowerCase();
            const phone = String(a.phone || a.contactNo || a.mobile || '');
            const email = String(a.email || '').toLowerCase();
            return (
              id.includes(normalizedQ) ||
              name.includes(normalizedQ) ||
              phone.includes(q) ||
              email.includes(normalizedQ)
            );
          });
          if (active) setAgentResults(filtered.slice(0, 10));
        } else {
          if (active) setAgentResults(list.slice(0, 10));
        }
      } catch (err) {
        if (active) setAgentResults([]);
      } finally {
        if (active) setAgentLoading(false);
      }
    }, q.length >= 2 ? 350 : 100);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [agentQuery]);

  // Fetch initial agents when dropdown is shown
  useEffect(() => {
    if (showAgentDropdown && agentResults.length === 0 && agentQuery.length < 2 && !agentLoading) {
      const fetchInitialAgents = async () => {
        try {
          const params = new URLSearchParams({ limit: '10', page: '1' });
          const res = await fetch(`/api/air-agents?${params.toString()}`);
          const responseData = await res.json();
          
          let list = [];
          if (responseData?.success && Array.isArray(responseData.data)) {
            list = responseData.data;
          } else if (Array.isArray(responseData?.data)) {
            list = responseData.data;
          } else if (Array.isArray(responseData)) {
            list = responseData;
          }
          
          setAgentResults(list.slice(0, 10));
        } catch (err) {
          // Silent fail
        }
      };
      fetchInitialAgents();
    }
  }, [showAgentDropdown, agentResults.length, agentQuery, agentLoading]);

  const handleSelectAgent = (agent) => {
    const agentId = agent.id || agent.agentId || agent.idCode || agent._id || '';
    const agentName = agent.name || agent.tradeName || agent.companyName || agent.personalName || agentId;
    setFormData(prev => ({
      ...prev,
      agent: agentName,
      agentId: agentId
    }));
    setSelectedAgentId(agentId);
    setAgentQuery(agentName);
    setShowAgentDropdown(false);
  };

  // Debounced backend search for airlines
  useEffect(() => {
    const q = airlineQuery.trim();
    if (!q || q.length < 2) {
      setAirlineResults([]);
      return;
    }

    let active = true;
    setAirlineLoading(true);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: q, limit: '20', page: '1' });
        const res = await fetch(`/api/airlines?${params.toString()}`);
        const responseData = await res.json();
        
        let list = [];
        if (responseData?.success && Array.isArray(responseData.data)) {
          list = responseData.data;
        } else if (Array.isArray(responseData?.data)) {
          list = responseData.data;
        } else if (Array.isArray(responseData)) {
          list = responseData;
        }

        const normalizedQ = q.toLowerCase();
        const filtered = list.filter((a) => {
          const id = String(a.id || a.airlineId || a._id || '').toLowerCase();
          const name = String(a.name || '').toLowerCase();
          const code = String(a.code || '').toLowerCase();
          const country = String(a.country || '').toLowerCase();
          return (
            id.includes(normalizedQ) ||
            name.includes(normalizedQ) ||
            code.includes(normalizedQ) ||
            country.includes(normalizedQ)
          );
        });

        if (active) setAirlineResults(filtered.slice(0, 10));
      } catch (err) {
        if (active) setAirlineResults([]);
      } finally {
        if (active) setAirlineLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [airlineQuery]);

  const handleSelectAirline = (airline) => {
    const airlineId = airline.id || airline.airlineId || airline._id || '';
    const airlineName = airline.name || airline.code || airlineId;
    setFormData(prev => ({
      ...prev,
      airline: airlineName,
      airlineId: airlineId
    }));
    setSelectedAirlineId(airlineId);
    setAirlineQuery(airlineName);
    setShowAirlineDropdown(false);
  };

  // Debounced backend search for employees
  useEffect(() => {
    const q = employeeQuery.trim();

    let active = true;

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (q.length >= 2) {
          params.append('search', q);
          params.append('limit', '100');
        } else {
          params.append('limit', '10');
        }
        
        const res = await fetch(`/api/employees?${params.toString()}`);
        const data = await res.json();
        
        let list = [];
        if (data?.success && Array.isArray(data.data)) {
          list = data.data;
        } else if (data?.success && Array.isArray(data.employees)) {
          list = data.employees;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data?.employees)) {
          list = data.employees;
        } else if (Array.isArray(data)) {
          list = data;
        }

        if (q.length >= 2) {
          const normalizedQ = q.toLowerCase();
          const filtered = list.filter((emp) => {
            const id = String(emp.employeeId || emp.id || emp._id || '').toLowerCase();
            const firstName = String(emp.firstName || '').toLowerCase();
            const lastName = String(emp.lastName || '').toLowerCase();
            const fullName = String(emp.fullName || emp.name || `${firstName} ${lastName}`.trim() || '').toLowerCase();
            const email = String(emp.email || '').toLowerCase();
            const phone = String(emp.phone || emp.mobile || emp.contactNo || '');
            const designation = String(emp.designation || emp.position || '').toLowerCase();
            return (
              id.includes(normalizedQ) ||
              firstName.includes(normalizedQ) ||
              lastName.includes(normalizedQ) ||
              fullName.includes(normalizedQ) ||
              email.includes(normalizedQ) ||
              phone.includes(q) ||
              designation.includes(normalizedQ)
            );
          });

          if (active) setEmployeeResults(filtered.slice(0, 10));
        } else {
          if (active) setEmployeeResults(list.slice(0, 10));
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
        if (active) setEmployeeResults([]);
      }
    }, q.length >= 2 ? 350 : 100);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [employeeQuery]);

  // Fetch initial employees when dropdown is shown
  useEffect(() => {
    if (showEmployeeDropdown && employeeResults.length === 0 && employeeQuery.length < 2) {
      const fetchInitialEmployees = async () => {
        try {
          const params = new URLSearchParams({ limit: '10' });
          const res = await fetch(`/api/employees?${params.toString()}`);
          const data = await res.json();
          
          let list = [];
          if (data?.success && Array.isArray(data.data)) {
            list = data.data;
          } else if (data?.success && Array.isArray(data.employees)) {
            list = data.employees;
          } else if (Array.isArray(data?.data)) {
            list = data.data;
          } else if (Array.isArray(data?.employees)) {
            list = data.employees;
          } else if (Array.isArray(data)) {
            list = data;
          }
          
          setEmployeeResults(list.slice(0, 10));
        } catch (err) {
          // Silent fail
        }
      };
      fetchInitialEmployees();
    }
  }, [showEmployeeDropdown, employeeResults.length, employeeQuery]);

  const handleSelectEmployee = async (employee) => {
    const employeeId = employee.employeeId || employee.id || employee._id || '';
    const firstName = employee.firstName || '';
    const lastName = employee.lastName || '';
    const fullName = employee.fullName || employee.name || 
      (firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || lastName || employeeId);
    setFormData(prev => ({
      ...prev,
      issuedBy: fullName,
      issuedById: employeeId
    }));
    setSelectedEmployeeId(employeeId);
    setEmployeeQuery(fullName);
    setShowEmployeeDropdown(false);
    
    // Fetch employee profile with statistics
    if (employeeId) {
      setLoadingEmployeeProfile(true);
      try {
        const response = await fetch(`/api/employees/${employeeId}`);
        const data = await response.json();
        
        if (response.ok && data.employee) {
          setSelectedEmployeeProfile(data.employee);
        } else {
          setSelectedEmployeeProfile(null);
        }
      } catch (error) {
        console.error('Error fetching employee profile:', error);
        setSelectedEmployeeProfile(null);
      } finally {
        setLoadingEmployeeProfile(false);
      }
    } else {
      setSelectedEmployeeProfile(null);
    }
  };

  // Debounced backend search for vendors
  useEffect(() => {
    const q = vendorQuery.trim();

    let active = true;
    setVendorLoading(true);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (q.length >= 2) {
          params.append('search', q);
        }
        params.append('limit', q.length >= 2 ? '100' : '10');
        
        const res = await fetch(`/api/vendors?${params.toString()}`);
        const data = await res.json();
        
        let list = [];
        if (data?.success && Array.isArray(data.vendors)) {
          list = data.vendors;
        } else if (data?.success && Array.isArray(data.data)) {
          list = data.data;
        } else if (Array.isArray(data?.vendors)) {
          list = data.vendors;
        } else if (Array.isArray(data)) {
          list = data;
        } else if (data?.data && Array.isArray(data.data)) {
          list = data.data;
        }

        if (q.length >= 2) {
          const normalizedQ = q.toLowerCase();
          const filtered = list.filter((vendor) => {
            const id = String(vendor.vendorId || vendor.id || vendor._id || '').toLowerCase();
            const tradeName = String(vendor.tradeName || vendor.name || '').toLowerCase();
            const ownerName = String(vendor.ownerName || '').toLowerCase();
            const contactNo = String(vendor.contactNo || vendor.phone || vendor.contactPhone || '');
            const location = String(vendor.tradeLocation || vendor.location || '').toLowerCase();
            return (
              id.includes(normalizedQ) ||
              tradeName.includes(normalizedQ) ||
              ownerName.includes(normalizedQ) ||
              contactNo.includes(q) ||
              location.includes(normalizedQ)
            );
          });
          if (active) {
            setVendorResults(filtered.slice(0, 10));
            setVendorLoading(false);
          }
        } else {
          if (active) {
            setVendorResults(list.slice(0, 10));
            setVendorLoading(false);
          }
        }
      } catch (err) {
        console.error('Error fetching vendors:', err);
        if (active) {
          setVendorResults([]);
          setVendorLoading(false);
        }
      }
    }, q.length >= 2 ? 350 : 100);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [vendorQuery]);

  // Fetch initial vendors when dropdown is shown
  useEffect(() => {
    if (showVendorDropdown && vendorResults.length === 0 && vendorQuery.length < 2 && !vendorLoading) {
      const fetchInitialVendors = async () => {
        try {
          const params = new URLSearchParams({ limit: '10' });
          const res = await fetch(`/api/vendors?${params.toString()}`);
          const data = await res.json();
          
          let list = [];
          if (data?.success && Array.isArray(data.vendors)) {
            list = data.vendors;
          } else if (data?.success && Array.isArray(data.data)) {
            list = data.data;
          } else if (Array.isArray(data?.vendors)) {
            list = data.vendors;
          } else if (Array.isArray(data)) {
            list = data;
          } else if (data?.data && Array.isArray(data.data)) {
            list = data.data;
          }
          
          setVendorResults(list.slice(0, 10));
        } catch (err) {
          // Silent fail
        }
      };
      fetchInitialVendors();
    }
  }, [showVendorDropdown, vendorResults.length, vendorQuery, vendorLoading]);

  const handleSelectVendor = (vendor) => {
    const vendorId = vendor.vendorId || vendor.id || vendor._id || '';
    const vendorName = vendor.tradeName || vendor.name || vendorId;
    setFormData(prev => ({
      ...prev,
      vendor: vendorName,
      vendorId: vendorId
    }));
    setSelectedVendorId(vendorId);
    setVendorQuery(vendorName);
    setShowVendorDropdown(false);
  };

  // Handle add new customer
  const handleAddNewCustomer = async () => {
    if (!newCustomerData.name || !newCustomerData.mobile) {
      setError('Name and mobile number are required');
      return;
    }

    setAddingCustomer(true);
    setError('');

    try {
      const response = await fetch('/api/air-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCustomerData.name,
          mobile: newCustomerData.mobile,
          email: newCustomerData.email || '',
          passportNumber: newCustomerData.passportNumber || '',
          address: newCustomerData.address || '',
          isActive: true
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add customer');
      }

      const newCustomer = result.customer || result.data || result;
      
      // Auto-select the newly created customer
      handleSelectCustomer(newCustomer);
      
      // Close modal and reset form
      setShowAddCustomerModal(false);
      setNewCustomerData({
        name: '',
        mobile: '',
        email: '',
        passportNumber: '',
        address: ''
      });
      
      setSuccess('Customer added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add customer');
    } finally {
      setAddingCustomer(false);
    }
  };

  const validate = (values) => {
    const errs = {};
    if (!values.customerId) errs.customerId = 'Customer is required';
    if (!values.date) errs.date = 'Selling date is required';
    if (!values.airline) errs.airline = 'Airline is required';
    // if (!values.segmentCount || values.segmentCount < 1) errs.segmentCount = 'Segment Count is required (minimum 1)';

    if (values.tripType === 'multicity') {
      if (!values.segments || values.segments.length < 2) {
        errs.segments = 'Add at least 2 segments';
      } else {
        values.segments.forEach((seg, idx) => {
          if (!seg.origin || !seg.destination || !seg.date) {
            errs[`segment_${idx}`] = 'Fill origin, destination and date';
          }
        });
      }
    } else {
      if (!values.origin) errs.origin = 'Origin is required';
      if (!values.destination) errs.destination = 'Destination is required';
      if (!values.flightDate) errs.flightDate = 'Flight date is required';
      if (values.tripType === 'roundtrip' && !values.returnDate) {
        errs.returnDate = 'Return date is required for round trip';
      }
    }
    return errs;
  };

  // Auto-calculate vendor amount when breakdown fields change
  React.useEffect(() => {
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

    setFormData((prev) => ({
      ...prev,
      ait: ait,
      totalTaxes: Math.max(0, Math.round(totalTaxes)),
      vendorAmount: Math.max(0, Math.round(vendorAmount))
    }));
  }, [
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
    formData.vendorServiceCharge
  ]);

  // Auto-calc vendorDue and profit when dependencies change
  React.useEffect(() => {
    const toNumber = (v) => Number(v) || 0;
    const vendorAmount = toNumber(formData.vendorAmount);
    const vendorPaidFh = toNumber(formData.vendorPaidFh);
    const customerDeal = toNumber(formData.customerDeal);

    const vendorDue = Math.max(0, Math.round(vendorAmount - vendorPaidFh));
    const profit = Math.round(customerDeal - vendorAmount);

    if (vendorDue !== formData.vendorDue || profit !== formData.profit) {
      setFormData(prev => ({ ...prev, vendorDue, profit }));
    }
  }, [formData.vendorAmount, formData.vendorPaidFh, formData.customerDeal]);

  // Auto-calculate customer due from deal and paid
  React.useEffect(() => {
    const deal = Number(formData.customerDeal) || 0;
    const paid = Number(formData.customerPaid) || 0;
    const due = Math.max(0, Math.round(deal - paid));
    if (due !== formData.customerDue) {
      setFormData(prev => ({ ...prev, customerDue: due }));
    }
  }, [formData.customerDeal, formData.customerPaid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const errs = validate(formData);
    setValidationErrors(errs);
    if (Object.keys(errs).length > 0) {
      const errorMessages = {
        customerId: 'গ্রাহক নির্বাচন করুন',
        date: 'বিক্রয় তারিখ নির্বাচন করুন',
        airline: 'এয়ারলাইন নির্বাচন করুন',
        origin: 'উৎপত্তি স্থান (Origin) প্রয়োজন',
        destination: 'গন্তব্য স্থান (Destination) প্রয়োজন',
        flightDate: 'ফ্লাইট তারিখ প্রয়োজন',
        returnDate: 'রিটার্ন তারিখ প্রয়োজন (Round Trip এর জন্য)',
        segments: 'অন্তত ২টি সেগমেন্ট যোগ করুন (Multicity এর জন্য)',
      };
      
      const errorList = Object.keys(errs)
        .filter(key => !key.startsWith('segment_'))
        .map(key => {
          const fieldName = errorMessages[key] || key;
          return `• ${fieldName}`;
        });
      
      const segmentErrors = Object.keys(errs).filter(key => key.startsWith('segment_'));
      if (segmentErrors.length > 0) {
        errorList.push('• সেগমেন্টগুলোর উৎপত্তি, গন্তব্য এবং তারিখ পূরণ করুন');
      }
      
      Swal.fire({
        title: 'আবশ্যক তথ্য অনুপস্থিত!',
        html: `অনুগ্রহ করে নিম্নলিখিত তথ্যগুলো পূরণ করুন:<br><br>${errorList.join('<br>')}`,
        icon: 'warning',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      
      setError('Please fix validation errors before submitting');
      setLoading(false);
      return;
    }

    try {
      const toNumber = (val) => {
        const num = Number(val);
        return isNaN(num) ? 0 : num;
      };
      
      const ticketData = {
        customerId: String(formData.customerId || '').trim(),
        customerName: String(formData.customerName || '').trim(),
        customerPhone: String(formData.customerPhone || '').trim(),
        tripType: formData.tripType || 'oneway',
        flightType: formData.flightType || 'domestic',
        date: formData.date || '',
        bookingId: String(formData.bookingId || '').trim(),
        gdsPnr: String(formData.gdsPnr || '').trim(),
        airlinePnr: String(formData.airlinePnr || '').trim(),
        airline: String(formData.airline || '').trim(),
        airlineId: formData.airlineId ? String(formData.airlineId).trim() : '',
        status: formData.status || 'pending',
        origin: String(formData.origin || '').trim(),
        destination: String(formData.destination || '').trim(),
        flightDate: formData.flightDate || '',
        returnDate: formData.returnDate || '',
        segments: Array.isArray(formData.segments) ? formData.segments.map(seg => ({
          origin: String(seg.origin || '').trim(),
          destination: String(seg.destination || '').trim(),
          date: String(seg.date || '').trim()
        })) : [],
        agent: String(formData.agent || '').trim(),
        agentId: formData.agentId ? String(formData.agentId).trim() : '',
        issuedBy: String(formData.issuedBy || '').trim(),
        issuedById: formData.issuedById ? String(formData.issuedById).trim() : '',
        vendor: String(formData.vendor || '').trim(),
        vendorId: formData.vendorId ? String(formData.vendorId).trim() : '',
        purposeType: String(formData.purposeType || '').trim(),
        adultCount: toNumber(formData.adultCount),
        childCount: toNumber(formData.childCount),
        infantCount: toNumber(formData.infantCount),
        customerDeal: toNumber(formData.customerDeal),
        customerPaid: toNumber(formData.customerPaid),
        customerDue: toNumber(formData.customerDue),
        dueDate: formData.dueDate || '',
        baseFare: toNumber(formData.baseFare),
        taxBD: toNumber(formData.taxBD),
        e5: toNumber(formData.e5),
        e7: toNumber(formData.e7),
        g8: toNumber(formData.g8),
        ow: toNumber(formData.ow),
        p7: toNumber(formData.p7),
        p8: toNumber(formData.p8),
        ts: toNumber(formData.ts),
        ut: toNumber(formData.ut),
        yq: toNumber(formData.yq),
        taxes: toNumber(formData.taxes),
        totalTaxes: toNumber(formData.totalTaxes),
        ait: toNumber(formData.ait),
        commissionRate: toNumber(formData.commissionRate),
        plb: toNumber(formData.plb),
        salmaAirServiceCharge: toNumber(formData.salmaAirServiceCharge),
        vendorServiceCharge: toNumber(formData.vendorServiceCharge),
        vendorAmount: toNumber(formData.vendorAmount),
        vendorPaidFh: toNumber(formData.vendorPaidFh),
        vendorDue: toNumber(formData.vendorDue),
        profit: toNumber(formData.profit),
        segmentCount: toNumber(formData.segmentCount) || 1,
        flownSegment: Boolean(formData.flownSegment),
        createdBy: user?.id || user?._id || user?.email || 'unknown_user',
        employeeId: user?.employeeId || null,
        branchId: user?.branchId || null,
      };

      // Create ticket
      const ticketResponse = await fetch('/api/air-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      const ticketResult = await ticketResponse.json();

      if (!ticketResponse.ok) {
        throw new Error(ticketResult.error || 'Failed to create ticket');
      }

      const createdTicket = ticketResult.ticket || ticketResult.data || ticketResult;

      // If vendor is selected, create a vendor bill automatically
      if (formData.vendorId && formData.vendorId.trim() !== '') {
        try {
          const billData = {
            vendorId: formData.vendorId,
            vendorName: formData.vendor || '',
            billType: 'air-ticket',
            billDate: formData.date || getTodayDate(),
            billNumber: formData.bookingId || createdTicket?.ticketId || createdTicket?.bookingId || '',
            description: `এয়ার টিকিট: ${formData.origin || ''} → ${formData.destination || ''} | ${formData.airline || ''}`,
            totalAmount: toNumber(formData.vendorAmount),
            amount: toNumber(formData.vendorAmount),
            paidAmount: toNumber(formData.vendorPaidFh),
            paymentStatus: toNumber(formData.vendorPaidFh) >= toNumber(formData.vendorAmount) ? 'paid' : 'pending',
            dueDate: formData.dueDate || '',
            notes: `Ticket ID: ${createdTicket?.ticketId || createdTicket?.bookingId || 'N/A'} | Booking ID: ${formData.bookingId || 'N/A'}`,
            tripType: formData.tripType || 'oneway',
            flightType: formData.flightType || 'domestic',
            bookingId: formData.bookingId || '',
            gdsPnr: formData.gdsPnr || '',
            airlinePnr: formData.airlinePnr || '',
            airline: formData.airline || '',
            origin: formData.origin || '',
            destination: formData.destination || '',
            flightDate: formData.flightDate || '',
            returnDate: formData.returnDate || '',
            segments: Array.isArray(formData.segments) ? formData.segments : [],
            agent: formData.agent || '',
            purposeType: formData.purposeType || '',
            adultCount: toNumber(formData.adultCount),
            childCount: toNumber(formData.childCount),
            infantCount: toNumber(formData.infantCount),
            customerDeal: toNumber(formData.customerDeal),
            customerPaid: toNumber(formData.customerPaid),
            customerDue: toNumber(formData.customerDue),
            baseFare: toNumber(formData.baseFare),
            taxBD: toNumber(formData.taxBD),
            e5: toNumber(formData.e5),
            e7: toNumber(formData.e7),
            g8: toNumber(formData.g8),
            ow: toNumber(formData.ow),
            p7: toNumber(formData.p7),
            p8: toNumber(formData.p8),
            ts: toNumber(formData.ts),
            ut: toNumber(formData.ut),
            yq: toNumber(formData.yq),
            taxes: toNumber(formData.taxes),
            totalTaxes: toNumber(formData.totalTaxes),
            ait: toNumber(formData.ait),
            commissionRate: toNumber(formData.commissionRate),
            plb: toNumber(formData.plb),
            salmaAirServiceCharge: toNumber(formData.salmaAirServiceCharge),
            vendorServiceCharge: toNumber(formData.vendorServiceCharge),
            vendorAmount: toNumber(formData.vendorAmount),
            vendorPaidFh: toNumber(formData.vendorPaidFh),
            vendorDue: toNumber(formData.vendorDue),
            profit: toNumber(formData.profit),
            segmentCount: toNumber(formData.segmentCount) || 1,
            flownSegment: Boolean(formData.flownSegment),
            ticketId: createdTicket?.ticketId || createdTicket?._id || '',
            ticketReference: createdTicket?.ticketId || createdTicket?.bookingId || formData.bookingId || ''
          };

          const billResponse = await fetch(`/api/vendors/${formData.vendorId}/bills`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(billData),
          });

          if (billResponse.ok) {
            console.log('Vendor bill created successfully for ticket');
          }
        } catch (billError) {
          console.error('Error creating vendor bill:', billError);
        }
      }

      setSuccess('Booking saved successfully!');
      
      Swal.fire({
        title: 'সফল!',
        text: 'টিকিট সফলভাবে বুক করা হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      }).then(() => {
        router.push('/air-ticketing/tickets');
      });

    } catch (error) {
      console.error('Error creating ticket:', error);
      const errorMessage = error?.message || 'Failed to create ticket';
      setError(errorMessage);
      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      setLoading(false);
    }
  };

  // Keep segment count in sync for multicity
  React.useEffect(() => {
    if (formData.tripType === 'multicity') {
      setFormData(prev => ({ ...prev, segmentCount: prev.segments?.length || 0 }));
    }
  }, [formData.tripType, formData.segments]);

  const handleSegmentChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.segments];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, segments: updated };
    });
  };

  const addSegment = () => {
    setFormData(prev => ({
      ...prev,
      segments: [...prev.segments, { origin: '', destination: '', date: '' }]
    }));
  };

  const removeSegment = (index) => {
    setFormData(prev => {
      if ((prev.segments?.length || 0) <= 2) return prev;
      const updated = prev.segments.filter((_, i) => i !== index);
      return { ...prev, segments: updated };
    });
  };

  // Step-specific validation functions
  const validateStep = (step) => {
    const errors = [];
    
    if (step === 1) {
      if (!formData.customerId) {
        errors.push('গ্রাহক নির্বাচন করুন');
      }
    } else if (step === 2) {
      if (!formData.date) {
        errors.push('বিক্রয় তারিখ নির্বাচন করুন');
      }
      if (!formData.airline) {
        errors.push('এয়ারলাইন নির্বাচন করুন');
      }
      // if (!formData.segmentCount || formData.segmentCount < 1) {
      //   errors.push('Segment Count প্রয়োজন (সর্বনিম্ন ১)');
      // }
      
      if (formData.tripType === 'multicity') {
        if (!formData.segments || formData.segments.length < 2) {
          errors.push('অন্তত ২টি সেগমেন্ট যোগ করুন');
        } else {
          formData.segments.forEach((seg, idx) => {
            if (!seg.origin || !seg.destination || !seg.date) {
              errors.push(`সেগমেন্ট ${idx + 1}: উৎপত্তি, গন্তব্য এবং তারিখ পূরণ করুন`);
            }
          });
        }
      } else {
        if (!formData.origin) {
          errors.push('উৎপত্তি স্থান (Origin) প্রয়োজন');
        }
        if (!formData.destination) {
          errors.push('গন্তব্য স্থান (Destination) প্রয়োজন');
        }
        if (!formData.flightDate) {
          errors.push('ফ্লাইট তারিখ প্রয়োজন');
        }
        if (formData.tripType === 'roundtrip' && !formData.returnDate) {
          errors.push('রিটার্ন তারিখ প্রয়োজন (Round Trip এর জন্য)');
        }
      }
    }
    
    return errors;
  };

  // Step navigation functions
  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    
    if (stepErrors.length > 0) {
      if (currentStep === 1) {
        markTouched('customerId');
      } else if (currentStep === 2) {
        markTouched('date');
        markTouched('airline');
        // markTouched('segmentCount');
        markTouched('origin');
        markTouched('destination');
        markTouched('flightDate');
        markTouched('returnDate');
      }
      
      const errs = validate(formData);
      setValidationErrors(errs);
      
      Swal.fire({
        title: 'আবশ্যক তথ্য অনুপস্থিত!',
        html: `অনুগ্রহ করে নিম্নলিখিত তথ্যগুলো পূরণ করুন:<br><br>${stepErrors.map(err => `• ${err}`).join('<br>')}`,
        icon: 'warning',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= totalSteps) {
      if (step > currentStep) {
        for (let s = currentStep; s < step; s++) {
          const stepErrors = validateStep(s);
          if (stepErrors.length > 0) {
            if (s === 1) {
              markTouched('customerId');
            } else if (s === 2) {
              markTouched('date');
              markTouched('airline');
              // markTouched('segmentCount');
              markTouched('origin');
              markTouched('destination');
              markTouched('flightDate');
              markTouched('returnDate');
            }
            
            const errs = validate(formData);
            setValidationErrors(errs);
            
            Swal.fire({
              title: 'আবশ্যক তথ্য অনুপস্থিত!',
              html: `স্টেপ ${s} এ নিম্নলিখিত তথ্যগুলো পূরণ করুন:<br><br>${stepErrors.map(err => `• ${err}`).join('<br>')}`,
              icon: 'warning',
              confirmButtonText: 'ঠিক আছে',
              confirmButtonColor: '#EF4444',
            });
            
            return;
          }
        }
      }
      
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step titles
  const stepTitles = [
    'গ্রাহক তথ্য',
    'ফ্লাইট তথ্য',
    'যাত্রী ও মূল্য',
    'ভেন্ডর বিবরণ',
    'রিভিউ ও নিশ্চিতকরণ'
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/air-ticketing/tickets')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  নতুন টিকিট বিক্রয়
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  গ্রাহকের জন্য নতুন এয়ার টিকিট বুক করুন
                </p>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {success}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step Progress Indicator */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {stepTitles.map((title, index) => {
                const stepNum = index + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                
                return (
                  <div key={stepNum} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <button
                        type="button"
                        onClick={() => goToStep(stepNum)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <span className="font-semibold">{stepNum}</span>
                        )}
                      </button>
                      <span className={`mt-2 text-xs font-medium text-center ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {title}
                      </span>
                    </div>
                    {stepNum < totalSteps && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        isCompleted
                          ? 'bg-green-500'
                          : currentStep > stepNum
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Receipt className="w-5 h-5 mr-2 text-blue-600" />
                  Step 1: গ্রাহক তথ্য
                </h2>
                
                {/* Customer Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Customer * <span className="text-gray-500">(Search by name, ID, phone, or email)</span>
                    </label>
                    <Link
                      href="/air-ticketing/passengers/add"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Customer
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="customer"
                      value={customerQuery}
                      onChange={(e) => {
                        setCustomerQuery(e.target.value);
                        setShowCustomerDropdown(true);
                        if (!e.target.value) {
                          setFormData(prev => ({
                            ...prev,
                            customerId: '',
                            customerName: '',
                            customerPhone: ''
                          }));
                        }
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowCustomerDropdown(false);
                          markTouched('customerId');
                          setValidationErrors(validate(formData));
                        }, 200);
                      }}
                      placeholder="Search customer by name, ID, phone, or email..."
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        touched.customerId && validationErrors.customerId
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      required
                    />
                    {touched.customerId && validationErrors.customerId && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.customerId}</p>
                    )}
                    {showCustomerDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                        {customerLoading ? (
                          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
                        ) : customerResults.length === 0 ? (
                          <div className="px-3 py-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {customerQuery.length < 2 ? 'No recent customers found' : 'No customers found'}
                            </div>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setShowCustomerDropdown(false);
                                setShowAddCustomerModal(true);
                              }}
                              className="w-full text-left px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add New Customer
                            </button>
                          </div>
                        ) : (
                          <>
                            {customerResults.map((c) => (
                              <button
                                key={String(c.customerId || c.id || c._id)}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelectCustomer(c)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">{c.name || 'N/A'}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        ID: {c.customerId || c.id || c._id}
                                      </div>
                                      {c.passportNumber && (
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                          Passport: {c.passportNumber}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-300">{c.mobile || c.phone || ''}</div>
                                </div>
                              </button>
                            ))}
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setShowCustomerDropdown(false);
                                setShowAddCustomerModal(true);
                              }}
                              className="w-full text-left px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 border-t border-gray-200 dark:border-gray-600"
                            >
                              <Plus className="w-4 h-4" />
                              Add New Customer
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.customerId && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Selected: <span className="font-medium text-gray-900 dark:text-white">{formData.customerName}</span>
                      {formData.customerPhone && (
                        <span className="ml-2 text-gray-500">({formData.customerPhone})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Flight Information */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Plane className="w-5 h-5 mr-2 text-green-600" />
                  Step 2: ফ্লাইট তথ্য
                </h2>
            
                {/* Top row: Date, Booking ID, Flight Type, Status */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selling Date *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="date"
                        id="date"
                        value={formData.date}
                        onChange={(e) => { handleChange(e); if (touched.date) setValidationErrors(validate({ ...formData, date: e.target.value })); }}
                        onBlur={() => { markTouched('date'); markTouched('customerId'); setValidationErrors(validate(formData)); }}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                      {touched.date && validationErrors.date && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.date}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Booking ID
                    </label>
                    <input
                      type="text"
                      name="bookingId"
                      id="bookingId"
                      value={formData.bookingId}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Booking reference (optional)"
                    />
                  </div>
                  <div>
                    <label htmlFor="flightType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Route Category</label>
                    <select
                      name="flightType"
                      id="flightType"
                      value={formData.flightType}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                       <option value="domestic">Domestic</option>
                       <option value="international">International</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                       <option value="booked">Booked</option>
                       <option value="issued">Issued</option>
                       <option value="partial">Partial Due</option>
                       <option value="flown">Flown</option>
                       <option value="refund">Refund Submitted</option>
                       <option value="refund settled">Refund Settled</option>
                       <option value="refunded">Refunded</option>
                       <option value="void">Void</option>
                       <option value="unconfirmed">Unconfirmed</option>
                       <option value="in progress">In Progress</option>
                    </select>
                  </div>
                </div>

                {/* PNRs and Airline */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GDS PNR</label>
                    <input
                      type="text"
                      name="gdsPnr"
                      value={formData.gdsPnr}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ABC123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Airlines PNR</label>
                    <input
                      type="text"
                      name="airlinePnr"
                      value={formData.airlinePnr}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="DEF456"
                    />
                  </div>
                  <div>
                    <label htmlFor="airline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Airlines *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="airline"
                        value={airlineQuery}
                        onChange={(e) => {
                          setAirlineQuery(e.target.value);
                          setShowAirlineDropdown(true);
                          if (!e.target.value) {
                            setFormData(prev => ({
                              ...prev,
                              airline: '',
                              airlineId: ''
                            }));
                            setSelectedAirlineId('');
                          }
                        }}
                        onFocus={() => {
                          if (airlineResults.length > 0 || airlineQuery.length >= 2) {
                            setShowAirlineDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowAirlineDropdown(false);
                            markTouched('airline');
                            setValidationErrors(validate(formData));
                          }, 200);
                        }}
                        placeholder="Search airline by name, ID, code, or country..."
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          touched.airline && validationErrors.airline
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        required
                      />
                      {touched.airline && validationErrors.airline && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.airline}</p>
                      )}
                      {showAirlineDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                          {airlineLoading ? (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
                          ) : airlineResults.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {airlineQuery.length < 2 ? 'Type at least 2 characters to search' : 'No airlines found'}
                            </div>
                          ) : (
                            airlineResults.map((a) => (
                              <button
                                key={String(a.id || a.airlineId || a._id)}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelectAirline(a)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Plane className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {a.name || 'N/A'}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        ID: {a.id || a.airlineId || a._id} | Code: {a.code || 'N/A'}
                                      </div>
                                      {a.country && (
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                          {a.country}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    {selectedAirlineId && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Selected Airline ID: <span className="font-medium text-gray-900 dark:text-white">{selectedAirlineId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Flight Type */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trip Type *</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tripType: 'oneway' }))}
                        className={`px-3 py-2 rounded-lg border ${formData.tripType === 'oneway' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                      >
                        One Way
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tripType: 'roundtrip' }))}
                        className={`px-3 py-2 rounded-lg border ${formData.tripType === 'roundtrip' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                      >
                        Round Trip
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tripType: 'multicity' }))}
                        className={`px-3 py-2 rounded-lg border ${formData.tripType === 'multicity' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                      >
                        Multi City
                      </button>
                    </div>
                  </div>
                </div>

                {/* Route and Dates */}
                {formData.tripType !== 'multicity' ? (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Origin *</label>
                      <input
                        type="text"
                        name="origin"
                        id="origin"
                        value={formData.origin}
                        onChange={(e) => { handleChange(e); if (touched.origin) setValidationErrors(validate({ ...formData, origin: e.target.value })); }}
                        onBlur={() => { markTouched('origin'); setValidationErrors(validate(formData)); }}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="DAC"
                        required
                      />
                      {touched.origin && validationErrors.origin && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.origin}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination *</label>
                      <input
                        type="text"
                        name="destination"
                        id="destination"
                        value={formData.destination}
                        onChange={(e) => { handleChange(e); if (touched.destination) setValidationErrors(validate({ ...formData, destination: e.target.value })); }}
                        onBlur={() => { markTouched('destination'); setValidationErrors(validate(formData)); }}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="DXB"
                        required
                      />
                      {touched.destination && validationErrors.destination && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.destination}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="flightDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flight Date *</label>
                      <input
                        type="date"
                        name="flightDate"
                        id="flightDate"
                        value={formData.flightDate}
                        onChange={(e) => { handleChange(e); if (touched.flightDate) setValidationErrors(validate({ ...formData, flightDate: e.target.value })); }}
                        onBlur={() => { markTouched('flightDate'); setValidationErrors(validate(formData)); }}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                      {touched.flightDate && validationErrors.flightDate && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.flightDate}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Return Date{formData.tripType === 'roundtrip' ? ' *' : ''}</label>
                      <input
                        type="date"
                        name="returnDate"
                        id="returnDate"
                        value={formData.returnDate}
                        onChange={(e) => { handleChange(e); if (touched.returnDate) setValidationErrors(validate({ ...formData, returnDate: e.target.value })); }}
                        onBlur={() => { markTouched('returnDate'); setValidationErrors(validate(formData)); }}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required={formData.tripType === 'roundtrip'}
                      />
                      {touched.returnDate && validationErrors.returnDate && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.returnDate}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Multi City Segments</h3>
                      <button
                        type="button"
                        onClick={addSegment}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Segment
                      </button>
                    </div>
                    {formData.segments?.map((seg, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Origin *</label>
                          <input
                            type="text"
                            value={seg.origin}
                            onChange={(e) => handleSegmentChange(idx, 'origin', e.target.value)}
                            className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="DAC"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination *</label>
                          <input
                            type="text"
                            value={seg.destination}
                            onChange={(e) => handleSegmentChange(idx, 'destination', e.target.value)}
                            className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="DXB"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flight Date *</label>
                          <input
                            type="date"
                            value={seg.date}
                            onChange={(e) => handleSegmentChange(idx, 'date', e.target.value)}
                            className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div className="md:col-span-1 flex md:justify-end">
                          <button
                            type="button"
                            onClick={() => removeSegment(idx)}
                            disabled={(formData.segments?.length || 0) <= 2}
                            className={`w-full md:w-auto px-3 py-2 rounded-lg border ${((formData.segments?.length || 0) <= 2) ? 'text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed' : 'text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* Step 3: Passenger Count & Customer Pricing */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-orange-600" />
                  Step 3: যাত্রী ও মূল্য
                </h2>

                {/* Passenger Types */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Passenger Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adult</label>
                      <input
                        type="number"
                        name="adultCount"
                        value={formData.adultCount}
                        onChange={handleChange}
                        min="0"
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Child</label>
                      <input
                        type="number"
                        name="childCount"
                        value={formData.childCount}
                        onChange={handleChange}
                        min="0"
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Infant</label>
                      <input
                        type="number"
                        name="infantCount"
                        value={formData.infantCount}
                        onChange={handleChange}
                        min="0"
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer finance */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Customer Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Deal</label>
                      <input
                        type="number"
                        name="customerDeal"
                        value={formData.customerDeal}
                        onChange={handleChange}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Agent & Vendor */}
            {currentStep === 4 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Receipt className="w-5 h-5 mr-2 text-indigo-600" />
                  Step 4: ভেন্ডর বিবরণ
                </h2>

                {/* Agent and Vendor Selection */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Agent Name / ID */}
                    <div>
                      <label htmlFor="agent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Agent Name / ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="agent"
                          value={agentQuery}
                          onChange={(e) => {
                            setAgentQuery(e.target.value);
                            setShowAgentDropdown(true);
                            if (!e.target.value) {
                              setFormData(prev => ({
                                ...prev,
                                agent: '',
                                agentId: ''
                              }));
                              setSelectedAgentId('');
                            }
                          }}
                          onFocus={() => {
                            setShowAgentDropdown(true);
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              setShowAgentDropdown(false);
                            }, 200);
                          }}
                          placeholder="এজেন্ট খুঁজুন... (নাম/ফোন/আইডি)"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        {showAgentDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto p-2">
                            {agentLoading ? (
                              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
                            ) : agentResults.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                {agentQuery.length < 2 ? 'Type at least 2 characters to search' : 'No agents found'}
                              </div>
                            ) : (
                              agentResults.map((a) => {
                                const photoUrl = a.photo || a.photoUrl || a.image || a.logo || a.avatar || a.profilePicture || '';
                                const agentName = a.name || a.tradeName || a.companyName || a.personalName || 'N/A';
                                const agentPhone = a.mobile || a.phone || a.contactNo || '';
                                const agentId = a.agentId || a.idCode || a.id || a._id || '';
                                
                                return (
                                  <button
                                    key={String(agentId)}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSelectAgent(a)}
                                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors mb-2 last:mb-0"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                        {photoUrl ? (
                                          <img 
                                            src={photoUrl} 
                                            alt={agentName} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                        ) : null}
                                        <div className={`w-full h-full bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center ${photoUrl ? 'hidden' : 'flex'}`}>
                                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                                          {agentName}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                          {agentPhone || agentId}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                      {selectedAgentId && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Selected Agent ID: <span className="font-medium text-gray-900 dark:text-white">{selectedAgentId}</span>
                        </div>
                      )}
                    </div>

                    {/* Vendor Name / ID */}
                    <div>
                      <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vendor Name / ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="vendor"
                          value={vendorQuery}
                          onChange={(e) => {
                            setVendorQuery(e.target.value);
                            setShowVendorDropdown(true);
                            if (!e.target.value) {
                              setFormData(prev => ({
                                ...prev,
                                vendor: '',
                                vendorId: ''
                              }));
                              setSelectedVendorId('');
                            }
                          }}
                          onFocus={() => {
                            setShowVendorDropdown(true);
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              setShowVendorDropdown(false);
                            }, 200);
                          }}
                          placeholder="ভেন্ডর খুঁজুন... (নাম/ফোন/আইডি)"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        {showVendorDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto p-2">
                            {vendorLoading ? (
                              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
                            ) : vendorResults.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                {vendorQuery.length < 2 ? 'Type at least 2 characters to search' : 'No vendors found'}
                              </div>
                            ) : (
                              vendorResults.map((v) => {
                                const logoUrl = v.logo || v.photo || v.photoUrl || v.image || v.avatar || v.profilePicture || '';
                                const vendorName = v.tradeName || v.name || 'N/A';
                                const vendorPhone = v.contactNo || v.phone || v.contactPhone || '';
                                const vendorId = v.vendorId || v.id || v._id || '';
                                
                                return (
                                  <button
                                    key={String(vendorId)}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSelectVendor(v)}
                                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors mb-2 last:mb-0"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                        {logoUrl ? (
                                          <img 
                                            src={logoUrl} 
                                            alt={vendorName} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                        ) : null}
                                        <div className={`w-full h-full bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center ${logoUrl ? 'hidden' : 'flex'}`}>
                                          <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                                          {vendorName}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                          {vendorPhone || vendorId}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                      {selectedVendorId && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Selected: <span className="font-medium text-gray-900 dark:text-white">{formData.vendor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vendor Amount Breakdown - This is a large section, I'll include the key parts */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vendor Amount Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Fare</label>
                      <input type="number" name="baseFare" value={formData.baseFare} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taxes</label>
                      <input type="number" name="taxes" value={formData.taxes} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                    </div>
                    
                    {/* Tax Details Section with Toggle */}
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={() => setShowTaxes(!showTaxes)}
                        className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-2"
                      >
                        <span>Tax Details</span>
                        {showTaxes ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      
                      {/* Collapsible Tax Fields */}
                      <div className={`transition-all duration-300 overflow-hidden ${showTaxes ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">BD</label>
                            <input type="number" name="taxBD" value={formData.taxBD} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E5</label>
                            <input type="number" name="e5" value={formData.e5} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E7</label>
                            <input type="number" name="e7" value={formData.e7} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">G8</label>
                            <input type="number" name="g8" value={formData.g8} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OW</label>
                            <input type="number" name="ow" value={formData.ow} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">P7</label>
                            <input type="number" name="p7" value={formData.p7} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">P8</label>
                            <input type="number" name="p8" value={formData.p8} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">TS</label>
                            <input type="number" name="ts" value={formData.ts} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">UT</label>
                            <input type="number" name="ut" value={formData.ut} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">YQ</label>
                            <input type="number" name="yq" value={formData.yq} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Taxes</label>
                      <input type="number" name="totalTaxes" value={formData.totalTaxes} readOnly className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 focus:outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        AIT (Advance Income Tax)
                      </label>
                      <input 
                        type="number" 
                        name="ait" 
                        value={formData.ait} 
                        readOnly 
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 focus:outline-none text-gray-900 dark:text-white" 
                        placeholder="0" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commission Rate (%)</label>
                      <input type="number" name="commissionRate" value={formData.commissionRate} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PLB</label>
                      <input type="number" name="plb" value={formData.plb} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salma Air Service Charge</label>
                      <input type="number" name="salmaAirServiceCharge" value={formData.salmaAirServiceCharge} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Service Charge</label>
                      <input type="number" name="vendorServiceCharge" value={formData.vendorServiceCharge} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* Vendor finance */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Amount</label>
                    <input type="number" name="vendorAmount" value={formData.vendorAmount} readOnly className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 focus:outline-none text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Paid (FH)</label>
                    <input
                      type="number"
                      name="vendorPaidFh"
                      value={formData.vendorPaidFh}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Due</label>
                    <input
                      type="number"
                      name="vendorDue"
                      value={formData.vendorDue}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profit</label>
                    <input
                      type="number"
                      name="profit"
                      value={formData.profit}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Segment Count</label>
                    <input
                      type="number"
                      name="segmentCount"
                      value={formData.segmentCount}
                      onChange={handleChange}
                      min="1"
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center mt-7">
                    <input
                      id="flownSegment"
                      type="checkbox"
                      name="flownSegment"
                      checked={formData.flownSegment}
                      onChange={(e) => setFormData(prev => ({ ...prev, flownSegment: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="flownSegment" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Flown Segment</label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Confirmation */}
            {currentStep === 5 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Receipt className="w-5 h-5 mr-2 text-green-600" />
                  Step 5: রিভিউ ও নিশ্চিতকরণ
                </h2>

                {/* Summary of All Entered Data */}
                <div className="space-y-6 mb-6">
                  {/* Customer Information */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      গ্রাহক তথ্য
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">গ্রাহক:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.customerName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">বিক্রয় তারিখ:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.date || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Flight Information */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <Plane className="w-5 h-5 mr-2 text-purple-600" />
                      ফ্লাইট তথ্য
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">এয়ারলাইন:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.airline || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">ট্রিপ টাইপ:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.tripType || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">উৎপত্তি:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.origin || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">গন্তব্য:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.destination || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">ফ্লাইট তারিখ:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.flightDate || 'N/A'}</span>
                      </div>
                      {formData.returnDate && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">রিটার্ন তারিখ:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.returnDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Passenger Information */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-orange-600" />
                      যাত্রী ও মূল্য
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">প্রাপ্তবয়স্ক:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.adultCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">শিশু:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.childCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">শিশু (ইনফ্যান্ট):</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.infantCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">গ্রাহক ডিল:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.customerDeal || 0} BDT</span>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Information */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-indigo-600" />
                      ভেন্ডর বিবরণ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">এজেন্ট:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.agent || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">ভেন্ডর:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.vendor || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Base Fare:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.baseFare || 0} BDT</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Taxes:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.totalTaxes || 0} BDT</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Vendor Amount:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.vendorAmount || 0} BDT</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issued By (Office Employee) */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Issued By (Office Employee)</h3>
                  <div>
                    <label htmlFor="issuedBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Office Employee
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="issuedBy"
                        value={employeeQuery}
                        onChange={(e) => {
                          setEmployeeQuery(e.target.value);
                          setShowEmployeeDropdown(true);
                          if (!e.target.value) {
                            setFormData(prev => ({
                              ...prev,
                              issuedBy: '',
                              issuedById: ''
                            }));
                            setSelectedEmployeeId('');
                          }
                        }}
                        onFocus={() => {
                          setShowEmployeeDropdown(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowEmployeeDropdown(false);
                          }, 200);
                        }}
                        placeholder="Search employee by name, ID, or designation..."
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {showEmployeeDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto p-2">
                          {employeeResults.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {employeeQuery.length < 2 ? 'Type at least 2 characters to search' : 'No employees found'}
                            </div>
                          ) : (
                            employeeResults.map((emp) => {
                              const photoUrl = emp.photo || emp.photoUrl || emp.image || emp.avatar || emp.profilePicture || '';
                              const employeeName = emp.fullName || emp.name || 
                                (emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}`.trim() : 
                                emp.firstName || emp.lastName || 'N/A');
                              const employeePhone = emp.phone || emp.mobile || emp.contactNo || '';
                              const employeeId = emp.employeeId || emp.id || emp._id || '';
                              
                              return (
                                <button
                                  key={String(employeeId)}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => handleSelectEmployee(emp)}
                                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors mb-2 last:mb-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                      {photoUrl ? (
                                        <img 
                                          src={photoUrl} 
                                          alt={employeeName} 
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div className={`w-full h-full bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center ${photoUrl ? 'hidden' : 'flex'}`}>
                                        <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                                        {employeeName}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {employeePhone || employeeId}
                                      </div>
                                      {(emp.designation || emp.position) && (
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                          {emp.designation || emp.position}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                    {selectedEmployeeId && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Selected: <span className="font-medium text-gray-900 dark:text-white">{formData.issuedBy}</span>
                        </div>
                        
                        {/* Employee Profile Statistics */}
                        {loadingEmployeeProfile ? (
                          <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">Loading employee profile...</span>
                            </div>
                          </div>
                        ) : selectedEmployeeProfile && selectedEmployeeProfile.statistics ? (
                          <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <User className="w-4 h-4 mr-2 text-blue-600" />
                              Employee Profile Statistics
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tickets</div>
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {selectedEmployeeProfile.statistics.ticketCount || 0}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  ৳{(selectedEmployeeProfile.statistics.ticketSellTotal || 0).toLocaleString()}
                                </div>
                              </div>
                              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hajis</div>
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {selectedEmployeeProfile.statistics.hajiCount || 0}
                                </div>
                              </div>
                              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Umrahs</div>
                                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                  {selectedEmployeeProfile.statistics.umrahCount || 0}
                                </div>
                              </div>
                              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Services</div>
                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                  {selectedEmployeeProfile.statistics.additionalServicesCount || 0}
                                </div>
                              </div>
                            </div>
                            {selectedEmployeeProfile.designation || selectedEmployeeProfile.position ? (
                              <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                                Position: <span className="font-medium">{selectedEmployeeProfile.designation || selectedEmployeeProfile.position}</span>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Step Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/air-ticketing/tickets')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 inline mr-2" />
                ফিরে যান
              </button>

              <div className="flex space-x-4">
                {currentStep > 1 && currentStep < totalSteps && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    পূর্ববর্তী
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                  >
                    পরবর্তী
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      পূর্ববর্তী
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const errs = validate(formData);
                        setValidationErrors(errs);
                        if (Object.keys(errs).length === 0) setShowPreview(true);
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      প্রিভিউ
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          বুক হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          টিকিট বুক করুন
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>

          {/* Preview Modal */}
          <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Preview Ticket" size="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-semibold text-gray-900 dark:text-white">Booking</div>
                <div className="text-gray-700 dark:text-gray-300">Customer: {formData.customerName || '-'}</div>
                <div className="text-gray-700 dark:text-gray-300">Date: {formData.date || '-'}</div>
                {formData.bookingId && (
                  <div className="text-gray-700 dark:text-gray-300">Booking ID: {formData.bookingId}</div>
                )}
                <div className="text-gray-700 dark:text-gray-300">
                  Ticket ID: <span className="text-blue-600 dark:text-blue-400 font-semibold">Auto-generated after creation</span>
                </div>
                <div className="text-gray-700 dark:text-gray-300">Status: {formData.status}</div>
                <div className="text-gray-700 dark:text-gray-300">Airline: {formData.airline || '-'}</div>
                <div className="text-gray-700 dark:text-gray-300">Trip: {formData.tripType}</div>
                {formData.tripType !== 'multicity' ? (
                  <>
                    <div className="text-gray-700 dark:text-gray-300">Route: {formData.origin || '-'} → {formData.destination || '-'}</div>
                    <div className="text-gray-700 dark:text-gray-300">Flight: {formData.flightDate || '-'}</div>
                    {formData.tripType === 'roundtrip' && (
                      <div className="text-gray-700 dark:text-gray-300">Return: {formData.returnDate || '-'}</div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-700 dark:text-gray-300">
                    Segments:
                    <ul className="list-disc ml-5 mt-1">
                      {formData.segments?.map((s, i) => (
                        <li key={i}>{s.origin || '-'} → {s.destination || '-'} on {s.date || '-'}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-gray-900 dark:text-white">Finance</div>
                <div className="text-gray-700 dark:text-gray-300">Base Fare: {formData.baseFare}</div>
                <div className="text-gray-700 dark:text-gray-300">Taxes: {formData.totalTaxes}</div>
                <div className="text-gray-700 dark:text-gray-300">AIT: {formData.ait}</div>
                <div className="text-gray-700 dark:text-gray-300">Salma Air Service Charge: {formData.salmaAirServiceCharge}</div>
                <div className="text-gray-700 dark:text-gray-300">Vendor Service Charge: {formData.vendorServiceCharge}</div>
                <div className="text-gray-700 dark:text-gray-300">Vendor Amount: {formData.vendorAmount}</div>
                <div className="text-gray-700 dark:text-gray-300">Vendor Paid: {formData.vendorPaidFh}</div>
                <div className="text-gray-700 dark:text-gray-300">Vendor Due: {formData.vendorDue}</div>
                <div className="text-gray-700 dark:text-gray-300">Customer Deal: {formData.customerDeal}</div>
                <div className="text-gray-700 dark:text-gray-300">Profit: {formData.profit}</div>
              </div>
            </div>
            <ModalFooter>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  setShowPreview(false);
                  await new Promise(r => setTimeout(r, 50));
                  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                  const form = document.querySelector('form');
                  if (form) form.dispatchEvent(submitEvent);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm & Save
              </button>
            </ModalFooter>
          </Modal>

          {/* Add New Customer Modal */}
          <Modal isOpen={showAddCustomerModal} onClose={() => setShowAddCustomerModal(false)} title="নতুন কাস্টমার যোগ করুন" size="lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name * <span className="text-gray-500">(নাম)</span>
                </label>
                <input
                  type="text"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mobile * <span className="text-gray-500">(মোবাইল নম্বর)</span>
                </label>
                <input
                  type="text"
                  value={newCustomerData.mobile}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, mobile: e.target.value }))}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter mobile number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-gray-500">(ইমেইল - ঐচ্ছিক)</span>
                </label>
                <input
                  type="email"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Passport Number <span className="text-gray-500">(পাসপোর্ট নম্বর - ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  value={newCustomerData.passportNumber}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, passportNumber: e.target.value }))}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter passport number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address <span className="text-gray-500">(ঠিকানা - ঐচ্ছিক)</span>
                </label>
                <textarea
                  value={newCustomerData.address}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, address: e.target.value }))}
                  rows="3"
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter address"
                />
              </div>
            </div>
            
            <ModalFooter>
              <button
                type="button"
                onClick={() => {
                  setShowAddCustomerModal(false);
                  setNewCustomerData({
                    name: '',
                    mobile: '',
                    email: '',
                    passportNumber: '',
                    address: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleAddNewCustomer}
                disabled={addingCustomer || !newCustomerData.name || !newCustomerData.mobile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {addingCustomer ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    যোগ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    কাস্টমার যোগ করুন
                  </>
                )}
              </button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewTicket;
