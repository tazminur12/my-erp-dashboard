'use client';

import React from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import FlightSearch from '../../component/FlightSearch';

const SearchPage = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Flight Search
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search and book flights, hotels, and more
            </p>
          </div>
          
          <FlightSearch />
          
          {/* Recent Searches or Promotions could go here */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Best Deals</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Find the best flight deals to popular destinations.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Easy Booking</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Seamless booking experience with instant confirmation.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Our support team is available around the clock to assist you.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchPage;
