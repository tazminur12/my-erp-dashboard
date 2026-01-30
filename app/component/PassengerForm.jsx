'use client';

import React from 'react';
import { User } from 'lucide-react';

const PassengerForm = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          Traveler 1 <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">Adult</span> <span className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-100 dark:border-red-800">Required</span>
        </h2>
      </div>

      <div className="space-y-6">
        {/* Saved Travelers */}
        <div>
           <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Select Traveller From Your List</label>
           <select className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block">
             <option>Select Traveller...</option>
           </select>
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
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date of Birth ( Minimum age is 12 years )</label>
            <input
              type="date"
              name="dob"
              value={data.dob}
              onChange={handleChange}
              className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
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