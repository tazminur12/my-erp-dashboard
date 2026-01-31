'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Clock } from 'lucide-react';

const RecentAirSearches = () => {
  const router = useRouter();
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('recent_air_searches');
      const arr = raw ? JSON.parse(raw) : [];
      const sorted = arr.sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 5);
      setItems(sorted);
    } catch {
      setItems([]);
    }
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Recent Searches</div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {items.map((it, idx) => {
            const title =
              it.tripType === 'multiway'
                ? `${it.segments?.[0]?.origin || ''} → ${it.segments?.[it.segments.length - 1]?.destination || ''}`
                : `${it.origin} → ${it.destination}`;
            const dateText =
              it.tripType === 'multiway'
                ? `${it.segments?.[0]?.departureDate || ''} - ${it.segments?.[it.segments.length - 1]?.departureDate || ''}`
                : it.departureDate + (it.returnDate ? ` • ${it.returnDate}` : '');
            const paxCount =
              (it.travellers?.adults || 0) +
              (it.travellers?.children || 0) +
              (it.travellers?.kids || 0) +
              (it.travellers?.infants || 0);
            return (
              <button
                key={idx}
                onClick={() => router.push(`/air-ticketing/flight-results?${it.queryString}`)}
                className="text-left p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{title}</div>
                    <div className="text-[11px] text-gray-500">
                      {dateText} • {paxCount} pax • {it.travellers?.class || 'Economy'}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(it.ts).toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentAirSearches;
