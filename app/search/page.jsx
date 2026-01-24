'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '../component/DashboardLayout';
import {
  Search,
  CreditCard,
  User,
  Plane,
  Building2,
  Users,
  FileText,
  Loader2,
  ArrowRight,
  X
} from 'lucide-react';
import Link from 'next/link';

const SearchResults = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({
    transactions: [],
    hajis: [],
    umrahs: [],
    airCustomers: [],
    airTickets: [],
    vendors: [],
    agents: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(query);

  // Fetch search results
  useEffect(() => {
    if (query.trim()) {
      fetchResults(query);
    }
  }, [query]);

  const fetchResults = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({
        transactions: [],
        hajis: [],
        umrahs: [],
        airCustomers: [],
        airTickets: [],
        vendors: [],
        agents: []
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results || {
          transactions: [],
          hajis: [],
          umrahs: [],
          airCustomers: [],
          airTickets: [],
          vendors: [],
          agents: []
        });
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError(err.message || 'Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleClear = () => {
    setSearchInput('');
    router.push('/search');
  };

  const getTypeLabel = (type) => {
    const labels = {
      transaction: 'লেনদেন',
      haji: 'হাজী',
      umrah: 'উমরাহ',
      airCustomer: 'এয়ার কাস্টমার',
      airTicket: 'এয়ার টিকেট',
      vendor: 'ভেন্ডর',
      agent: 'এজেন্ট'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      transaction: CreditCard,
      haji: User,
      umrah: User,
      airCustomer: User,
      airTicket: Plane,
      vendor: Building2,
      agent: Users
    };
    return icons[type] || FileText;
  };

  const totalResults = 
    results.transactions.length +
    results.hajis.length +
    results.umrahs.length +
    results.airCustomers.length +
    results.airTickets.length +
    results.vendors.length +
    results.agents.length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            সার্চ করুন
          </h1>
          
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ট্রানজেকশন, কাস্টমার, টিকেট, ভেন্ডর, এজেন্ট ইত্যাদি খুঁজুন..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">সার্চ করা হচ্ছে...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && query && (
          <>
            {totalResults === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  কোন ফলাফল পাওয়া যায়নি
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  "{query}" এর জন্য কোন ফলাফল পাওয়া যায়নি। অনুগ্রহ করে অন্য কিছু খুঁজুন।
                </p>
              </div>
            ) : (
              <>
                {/* Results Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{totalResults}</span> টি ফলাফল পাওয়া গেছে "{query}" এর জন্য
                  </p>
                </div>

                {/* Transactions */}
                {results.transactions.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        লেনদেন ({results.transactions.length})
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {results.transactions.map((item) => (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.subtitle}
                              </p>
                              {item.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hajis */}
                {results.hajis.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      <User className="w-5 h-5 text-green-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        হাজী ({results.hajis.length})
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {results.hajis.map((item) => (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.subtitle}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Umrahs */}
                {results.umrahs.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      <User className="w-5 h-5 text-purple-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        উমরাহ ({results.umrahs.length})
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {results.umrahs.map((item) => (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.subtitle}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Air Customers */}
                {results.airCustomers.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      <User className="w-5 h-5 text-blue-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        এয়ার কাস্টমার ({results.airCustomers.length})
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {results.airCustomers.map((item) => (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.subtitle}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Air Tickets */}
                {results.airTickets.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      <Plane className="w-5 h-5 text-indigo-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        এয়ার টিকেট ({results.airTickets.length})
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {results.airTickets.map((item) => (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.subtitle}
                              </p>
                              {item.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vendors */}
                {results.vendors.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      <Building2 className="w-5 h-5 text-orange-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        ভেন্ডর ({results.vendors.length})
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {results.vendors.map((item) => (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.subtitle}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agents */}
                {results.agents.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      <Users className="w-5 h-5 text-teal-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        এজেন্ট ({results.agents.length})
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {results.agents.map((item) => (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.subtitle}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Empty State - No Query */}
        {!loading && !error && !query && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              সার্চ করুন
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              উপরের সার্চ বক্সে কিছু লিখে সার্চ করুন
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SearchResults;
