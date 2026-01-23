'use client';

import React from 'react';
import Navbar from './component/Navbar';
import Hero from './component/Hero';
import Footer from './component/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}
