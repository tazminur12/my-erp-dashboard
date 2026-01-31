import { NextResponse } from 'next/server';
import { searchFlights } from '../../../../lib/sabre';

const cacheStore = global.__fareCalendarCache || new Map();
global.__fareCalendarCache = cacheStore;
const TTL_MS = 10 * 60 * 1000;

const parseMinFare = (sr) => {
  try {
    const itins = sr?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary || [];
    const arr = Array.isArray(itins) ? itins : itins ? [itins] : [];
    let min = null;
    let currency = null;
    for (const itin of arr) {
      const p = Array.isArray(itin.AirItineraryPricingInfo) ? itin.AirItineraryPricingInfo[0] : itin.AirItineraryPricingInfo;
      const tf = p?.ItinTotalFare?.TotalFare || p?.ItinTotalFare?.TotalFare || p?.ItinTotalFare || p?.FareInfo?.[0]?.TPA_Extensions?.TotalFare;
      const amt = parseFloat(tf?.Amount ?? p?.ItinTotalFare?.TotalFare?.Amount ?? p?.ItinTotalFare?.TotalFare?.amount ?? p?.ItinTotalFare?.TotalFare);
      const cur = tf?.CurrencyCode ?? p?.ItinTotalFare?.TotalFare?.CurrencyCode ?? p?.ItinTotalFare?.TotalFare?.currency ?? 'BDT';
      if (isFinite(amt)) {
        if (min === null || amt < min) {
          min = amt;
          currency = cur || currency;
        }
      }
    }
    if (min === null) return null;
    return { amount: min, currency: currency || 'BDT' };
  } catch {
    return null;
  }
};

const daysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const month = searchParams.get('month');
    const cabin = searchParams.get('cabin') || 'Economy';
    const adults = parseInt(searchParams.get('adults') || '1', 10);

    if (!origin || !destination || !month) {
      return NextResponse.json({ success: false, error: 'origin, destination, month required' }, { status: 400 });
    }

    const [yStr, mStr] = month.split('-');
    const year = parseInt(yStr, 10);
    const mIdx = parseInt(mStr, 10) - 1;

    const totalDays = daysInMonth(year, mIdx);
    const dates = Array.from({ length: totalDays }, (_, i) => `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`);
    const limit = 8;
    const result = [];
    const cacheKey = JSON.stringify({ origin, destination, month, cabin, adults });
    const cached = cacheStore.get(cacheKey);
    if (cached && (Date.now() - cached.ts) < TTL_MS) {
      return NextResponse.json({
        success: true,
        origin,
        destination,
        month,
        fares: cached.data
      });
    }
    let i = 0;
    while (i < dates.length) {
      const batch = dates.slice(i, i + limit);
      const promises = batch.map(async (dateStr) => {
        try {
          const data = await searchFlights({
            origin,
            destination,
            departureDate: dateStr,
            travellers: { adults, class: cabin }
          }, { quiet: true });
          const minFare = parseMinFare(data);
          return {
            date: dateStr,
            ...(minFare ? minFare : { amount: null, currency: null })
          };
        } catch {
          return { date: dateStr, amount: null, currency: null };
        }
      });
      const batchResults = await Promise.all(promises);
      result.push(...batchResults);
      i += limit;
    }

    cacheStore.set(cacheKey, { ts: Date.now(), data: result });
    return NextResponse.json({
      success: true,
      origin,
      destination,
      month,
      fares: result
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch fare calendar' }, { status: 200 });
  }
}
