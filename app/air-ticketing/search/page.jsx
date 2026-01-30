
'use client';

import React from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import FlightSearch from '../../component/FlightSearch';
import { ArrowRight, Star, Shield, Headphones } from 'lucide-react';

const SearchPage = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
        {/* Hero Section with Background */}
        <div className="relative bg-gradient-to-r from-blue-900 to-indigo-900 h-[400px] -mb-32">
          {/* Abstract Travel Patterns/Illustrations Background could go here */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Explore the World with Premium Service
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Book flights, hotels, and holiday packages at the best prices.
            </p>
          </div>
        </div>

        {/* Search Widget Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <FlightSearch />
        </div>

        {/* Promotional Banners */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Promo 1 */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Download Mobile App</h3>
                <p className="text-blue-100 text-sm mb-4">Get exclusive app-only deals and manage trips on the go.</p>
                <div className="flex gap-2">
                  <div className="bg-black/30 w-8 h-8 rounded-lg"></div>
                  <div className="bg-black/30 w-8 h-8 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Promo 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 relative overflow-hidden group cursor-pointer">
              <div className="relative z-10">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-3 inline-block">Best Experience</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Fly with Indigo</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Experience comfort and luxury at affordable rates.</p>
                <button className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Book Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-50 dark:bg-gray-700 rounded-tl-full opacity-50"></div>
            </div>

            {/* Promo 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 relative overflow-hidden group cursor-pointer">
              <div className="relative z-10">
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md mb-3 inline-block">New Arrival</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Worldwide Hotels</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Find the perfect stay for your next vacation.</p>
                <button className="text-orange-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore Hotels <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Best Price Guarantee</h3>
              <p className="text-gray-500 text-sm">We ensure you get the most competitive rates in the market.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Secure Booking</h3>
              <p className="text-gray-500 text-sm">Your data and payments are protected with top-tier security.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
              <p className="text-gray-500 text-sm">Our expert team is always available to assist you.</p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SearchPage;
