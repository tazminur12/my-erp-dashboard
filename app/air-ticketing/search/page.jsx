
'use client';

import React from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import FlightSearch from '../../component/FlightSearch';
import RecentAirSearches from '../../component/RecentAirSearches';
import { ArrowRight, Star, Shield, Headphones } from 'lucide-react';

const SearchPage = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 pt-10">
      
        {/* Search Widget Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <FlightSearch />
          <RecentAirSearches />
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SearchPage;
