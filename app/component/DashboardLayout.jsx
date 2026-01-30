'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '../hooks/useSession';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { Loader2, LogIn } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { loading, authenticated } = useSession();
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for session to fully load before rendering
    if (!loading) {
      const timer = setTimeout(() => setSessionReady(true), 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    // When unauthenticated, redirect to login so user can sign in again (fixes refresh loop)
    if (!loading && sessionReady && !authenticated) {
      const callbackUrl = pathname ? encodeURIComponent(pathname) : '/dashboard';
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [loading, sessionReady, authenticated, pathname, router]);

  // Sidebar toggle only controls visibility; no route-based override

  // Show loading state while session is loading
  if (loading || !sessionReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show sign-in prompt while redirect runs (avoids "refresh" dead-end)
  if (!authenticated) {
    const callbackUrl = pathname ? encodeURIComponent(pathname) : '/dashboard';
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Session expired. Please sign in again.</p>
          <Link
            href={`/login?callbackUrl=${callbackUrl}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign in again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar Component */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={sidebarOpen ? "lg:pl-72" : "lg:pl-0"}>
        {/* Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(prev => !prev)} />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Tawk.to Live Chat Script */}
      <Script id="tawk-to-script" strategy="afterInteractive">
        {`
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/63626c7edaff0e1306d55022/1jceegqfr';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
          })();
        `}
      </Script>
    </div>
  );
};

export default DashboardLayout;
