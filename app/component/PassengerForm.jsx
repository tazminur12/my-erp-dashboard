
'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Globe, CreditCard } from 'lucide-react';

const PassengerForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: 'MR',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    passportNumber: '',
    nationality: 'BD',
    gender: 'M'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-orange-500" />
        Passenger Details
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <select 
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="MR">Mr.</option>
              <option value="MRS">Mrs.</option>
              <option value="MS">Ms.</option>
            </select>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="As per passport"
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="As per passport"
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Contact & Bio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <Mail className="w-4 h-4 text-gray-400" /> Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <Phone className="w-4 h-4 text-gray-400" /> Phone
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" /> Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              required
              value={formData.dob}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
            <select 
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>

        {/* Passport Info */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            Passport Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passport Number</label>
              <input
                type="text"
                name="passportNumber"
                required
                value={formData.passportNumber}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nationality</label>
              <select 
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="BD">Bangladesh</option>
                <option value="US">United States</option>
                <option value="IN">India</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Booking...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Book & Hold Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PassengerForm;
