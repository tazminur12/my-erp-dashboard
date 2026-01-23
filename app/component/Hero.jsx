'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, BarChart3, Users, CheckCircle, Sparkles, Download, X } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const Hero = () => {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleInstallClick = async () => {
    if (isInstalled) {
      return;
    }
    
    if (isInstallable) {
      // Try to install directly
      const installed = await promptInstall();
      if (!installed) {
        // If user dismissed, show instructions
        setShowInstructions(true);
      }
    } else {
      // If not installable, show instructions
      setShowInstructions(true);
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800" />
      <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/20 -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">মডার্ন ERP প্ল্যাটফর্ম</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white transition-colors duration-200 pd-2">
              <span className="text-blue-600 dark:text-blue-400">BIN Rashid Group ERP</span> – আপনার ব্যবসার স্মার্ট নিয়ন্ত্রণ
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl transition-colors duration-200">
              অপারেশন সহজ করুন, রিয়েল-টাইম ড্যাশবোর্ডে সিদ্ধান্ত নিন এবং টিমকে সক্ষম করুন।
              সুরক্ষিত, দ্রুত এবং স্কেলেবল সিস্টেমের মাধ্যমে ব্যবসার উন্নতি আনুন।
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                শুরু করুন
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white transition-all duration-200"
              >
                ড্যাশবোর্ড
              </Link>
              {!isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="px-8 py-3 bg-green-600 dark:bg-green-500 text-white font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  App ইনস্টল করুন
                </button>
              )}
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">ডেটা নিরাপত্তা</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">রোল-বেসড অ্যাক্সেস ও সুরক্ষিত স্টোরেজ</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">রিয়েল-টাইম রিপোর্টিং</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ড্যাশবোর্ডে তাত্ক্ষণিক অন্তর্দৃষ্টি</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">টিম-ফ্রেন্ডলি</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">সহজ ব্যবহার ও সহযোগিতা</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              <span>বাংলা ও ইংরেজি সাপোর্ট</span>
              <span className="mx-2">•</span>
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              <span>ডার্ক মোড রেডি</span>
              <span className="mx-2">•</span>
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              <span>মডিউলার আর্কিটেকচার</span>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">সিস্টেম স্ট্যাটাস</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Operational</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-gray-50 dark:bg-gray-700 p-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Modules</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Multiple</p>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-700 p-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Performance</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Optimized</p>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-700 p-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Support</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Install Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                App ইনস্টল করুন
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                আপনার device-এর জন্য manual installation instructions:
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Chrome/Edge/Android */}
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Chrome/Edge/Android:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Address bar-এ install icon (📥) click করুন অথবা Menu (⋮) → &quot;Install App&quot; / &quot;Install [App Name]&quot;
                </p>
              </div>

              {/* iOS/Safari */}
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  iOS/Safari (iPhone/iPad):
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share button (📤) tap করুন → &quot;Add to Home Screen&quot; → &quot;Add&quot; click করুন
                </p>
              </div>

              {/* Desktop */}
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Desktop (Chrome/Edge):
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Address bar-এ install icon (➕) click করুন অথবা Menu → &quot;Install [App Name]&quot;
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
