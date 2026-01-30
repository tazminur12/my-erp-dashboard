'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Search, Check, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PassengerForm = ({ data, onChange, passengerType = 'ADT', flightDate = new Date(), travelerIndex = 1 }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [travellers, setTravellers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Calculate Date Limits
  const travelDate = new Date(flightDate);
  let minDate = null;
  let maxDate = new Date(); // Default to today/travel date

  if (passengerType === 'ADT') {
    // Adult: 12+ years
    maxDate = new Date(travelDate);
    maxDate.setFullYear(maxDate.getFullYear() - 12);
    minDate = new Date(travelDate);
    minDate.setFullYear(minDate.getFullYear() - 100); // Reasonable upper limit
  } else if (passengerType === 'CHD') {
    // Child: 2-11 years
    maxDate = new Date(travelDate);
    maxDate.setFullYear(maxDate.getFullYear() - 2);
    minDate = new Date(travelDate);
    minDate.setFullYear(minDate.getFullYear() - 12);
    minDate.setDate(minDate.getDate() + 1); // Just over 12 years is adult
  } else if (passengerType === 'INF') {
    // Infant: 0-2 years
    maxDate = new Date(travelDate);
    minDate = new Date(travelDate);
    minDate.setFullYear(minDate.getFullYear() - 2);
    minDate.setDate(minDate.getDate() + 1);
  }

  const getPassengerLabel = () => {
    switch (passengerType) {
      case 'CHD': return 'Child (2-11 yrs)';
      case 'INF': return 'Infant (0-2 yrs)';
      default: return 'Adult (12+ yrs)';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleDateChange = (date) => {
    if (!date) return;
    // Format to YYYY-MM-DD for consistency
    const formattedDate = date.toISOString().split('T')[0];
    onChange({ ...data, dob: formattedDate });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch travellers on search
  useEffect(() => {
    const fetchTravellers = async () => {
      if (!searchQuery.trim()) {
        setTravellers([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const response = await fetch(`/api/air-customers?search=${encodeURIComponent(searchQuery)}&limit=10`);
        const result = await response.json();
        if (response.ok) {
          setTravellers(result.customers || []);
        }
      } catch (error) {
        console.error('Error fetching travellers:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchTravellers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectTraveller = async (traveller) => {
    // Split name into First and Last name
    const nameParts = (traveller.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const dobSource = traveller.dateOfBirth || traveller.dob || '';
    const normalizedDob = dobSource ? new Date(dobSource).toISOString().split('T')[0] : data.dob;
    
    let finalDob = normalizedDob;
    if (!finalDob) {
      try {
        const id = traveller._id || traveller.customerId;
        if (id) {
          const res = await fetch(`/api/air-customers/${id}`);
          const result = await res.json();
          if (res.ok && result.passenger) {
            const pd = result.passenger.dateOfBirth || '';
            if (pd) {
              finalDob = new Date(pd).toISOString().split('T')[0];
            }
          }
        }
      } catch {}
    }

    onChange({
      ...data,
      firstName: firstName,
      lastName: lastName,
      email: traveller.email || data.email || '',
      phone: traveller.mobile || data.phone || '',
      passportNumber: traveller.passportNumber || '',
      nationality: traveller.nationality || 'BD', // Default or from API if available
      dob: finalDob, // Format YYYY-MM-DD
      gender: traveller.gender || 'M', // Default or from API
    });
    
    setSearchQuery(traveller.name || '');
    setShowDropdown(false);
  };

  // Custom Input for DatePicker to support better styling
  const CustomDateInput = React.forwardRef(({ value, onClick, onChange }, ref) => (
    <div className="relative">
      <input
        value={value}
        onClick={onClick}
        onChange={onChange}
        ref={ref}
        placeholder="DD/MM/YYYY"
        className="w-full p-2.5 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
      />
      <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  ));
  CustomDateInput.displayName = 'CustomDateInput';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          Traveler {travelerIndex} <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">{getPassengerLabel()}</span> <span className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-100 dark:border-red-800">Required</span>
        </h2>
      </div>

      <div className="space-y-6">
        {/* Saved Travelers Search */}
        <div className="relative" ref={dropdownRef}>
           <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Select Traveller From Your List</label>
           
           <div className="relative">
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => {
                 setSearchQuery(e.target.value);
                 setShowDropdown(true);
               }}
               onFocus={() => setShowDropdown(true)}
               placeholder="Search traveller by name, email or phone..."
               className="w-full p-2.5 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block"
             />
             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
           </div>

           {/* Dropdown Results */}
           {showDropdown && (searchQuery || travellers.length > 0) && (
             <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
               {isSearching ? (
                 <div className="p-3 text-center text-xs text-gray-500">Searching...</div>
               ) : travellers.length > 0 ? (
                 travellers.map((traveller) => (
                   <button
                     key={traveller._id || traveller.customerId}
                     onClick={() => handleSelectTraveller(traveller)}
                     className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center justify-between group"
                   >
                     <div>
                       <div className="font-medium text-gray-900 dark:text-white text-sm">{traveller.name}</div>
                       <div className="text-xs text-gray-500 flex gap-2">
                         <span>{traveller.mobile}</span>
                         {traveller.passportNumber && <span>• {traveller.passportNumber}</span>}
                       </div>
                     </div>
                     <Check className={`w-4 h-4 text-blue-600 ${searchQuery === traveller.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                   </button>
                 ))
               ) : (
                 <div className="p-3 text-center text-xs text-gray-500">No travellers found</div>
               )}
             </div>
           )}
        </div>
        
        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">or, Enter Traveller Details</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Given Name / First name</label>
            <div className="flex gap-2">
                <select 
                  name="title"
                  value={data.title}
                  onChange={handleChange}
                  className="w-24 p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MR">Mr</option>
                  <option value="MRS">Mrs</option>
                  <option value="MS">Ms</option>
                </select>
                <input
                  type="text"
                  name="firstName"
                  value={data.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Surname / Last name</label>
            <input
              type="text"
              name="lastName"
              value={data.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Gender & DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Select Gender</label>
            <select 
              name="gender"
              value={data.gender}
              onChange={handleChange}
              className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date of Birth ( {passengerType === 'ADT' ? 'Minimum age is 12 years' : passengerType === 'CHD' ? 'Age 2-11 years' : 'Age 0-2 years'} )</label>
            <DatePicker
              selected={data.dob ? new Date(data.dob) : null}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              showYearDropdown
              showMonthDropdown
              scrollableYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={100}
              minDate={minDate}
              maxDate={maxDate}
              customInput={<CustomDateInput />}
              wrapperClassName="w-full"
            />
          </div>
        </div>

        {/* Nationality & FF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Select nationality/Country</label>
            <select 
                name="nationality"
                value={data.nationality}
                onChange={handleChange}
                className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="BD">Bangladesh</option>
                <option value="US">United States</option>
                <option value="IN">India</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
            </select>
             <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border border-green-600 flex items-center justify-center text-[8px]">i</span>
                The passenger is automatically recorded for future reference.
             </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Frequent flyer airline code with number ( Optional )</label>
            <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Airline"
                  className="w-20 p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Number"
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
          </div>
        </div>
        
         <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Passport Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Passport Number</label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={data.passportNumber}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default PassengerForm;
