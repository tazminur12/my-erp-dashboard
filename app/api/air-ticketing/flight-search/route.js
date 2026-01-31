
import { NextResponse } from 'next/server';
import { searchFlights } from '@/lib/sabre';
import { getDb } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const debug = searchParams.get('debug') === 'true';
    const body = await request.json();
    const { origin, destination, departureDate, returnDate, passengers, tripType, segments, travellers, sortOption, filterStops, filterAirlines } = body;

    // Validation
    if (tripType === 'multiway') {
      if (!segments || !Array.isArray(segments) || segments.length === 0) {
        return NextResponse.json(
          { error: 'Missing segments for multi-city search' },
          { status: 400 }
        );
      }
    } else if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, departureDate' },
        { status: 400 }
      );
    }

    // Strict Date Validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (departureDate && !dateRegex.test(departureDate)) {
      return NextResponse.json(
        { error: 'Invalid departureDate format. Must be YYYY-MM-DD' },
        { status: 400 }
      );
    }
    if (returnDate && !dateRegex.test(returnDate)) {
      return NextResponse.json(
        { error: 'Invalid returnDate format. Must be YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Parallel Execution: Fetch Markups & Search Flights
    const db = await getDb();
    const [markups, searchResults] = await Promise.all([
      db.collection('markups').find({ status: 'active' }).toArray(),
      searchFlights({
        origin,
        destination,
        departureDate,
        returnDate,
        passengers: passengers || 1,
        segments, // Pass segments for multi-city
        travellers
      })
    ]);

    // Create Markup Map for O(1) lookup
    // Now we need to support the new schema where 'airlines' is a string like "EK, QR" or empty for all
    // and 'priority' determines order.
    
    // Sort markups by priority (highest first)
    markups.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Apply Markups to Search Results
    if (searchResults?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary) {
      const normalizeSeats = (itinerary) => {
        try {
          const legs = itinerary.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption || [];
          for (const leg of legs) {
            for (const seg of leg.FlightSegment || []) {
              const n = seg?.TPA_Extensions?.SeatsRemaining?.Number;
              if (n) return n;
            }
          }
          const pinfo = Array.isArray(itinerary.AirItineraryPricingInfo) ? itinerary.AirItineraryPricingInfo[0] : itinerary.AirItineraryPricingInfo;
          const fareInfos = pinfo?.FareInfos?.FareInfo || [];
          for (const fi of fareInfos) {
            const nfi = fi?.TPA_Extensions?.SeatsRemaining?.Number;
            if (nfi) return nfi;
          }
          return null;
        } catch {
          return null;
        }
      };
      const normalizeBaggage = (pricingInfo) => {
        const cands = [
          pricingInfo?.TPA_Extensions?.Baggage?.Checkin,
          pricingInfo?.TPA_Extensions?.Baggage?.Cabin,
          pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Baggage?.Checkin,
          pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Baggage?.Cabin,
          pricingInfo?.PTC_FareBreakdowns?.[0]?.TPA_Extensions?.Baggage?.Checkin,
          pricingInfo?.PTC_FareBreakdowns?.[0]?.TPA_Extensions?.Baggage?.Cabin
        ];
        const direct = cands.find(Boolean);
        if (direct) return { text: direct };
        const info = pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.BaggageInformation || pricingInfo?.TPA_Extensions?.BaggageInformation;
        if (info) {
          const first = Array.isArray(info) ? info[0] : info;
          const desc = first?.Description || first?.Provision || (first?.BaggageDetails && first.BaggageDetails[0]?.Description);
          if (desc) return { text: desc };
          const pieces = first?.Pieces;
          const weight = first?.Weight;
          if (pieces) return { text: `${pieces}PC` };
          if (weight) return { text: `${weight}KG` };
        }
        return null;
      };
      searchResults.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.forEach(itinerary => {
        // Find Validating Carrier
        let carrier = null;
        try {
           carrier = itinerary.AirItineraryPricingInfo?.[0]?.TPA_Extensions?.ValidatingCarrier?.Code;
        } catch (e) {}

        if (!carrier) {
          try {
             carrier = itinerary.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption?.[0]?.FlightSegment?.[0]?.MarketingAirline?.Code;
          } catch (e) {}
        }
        
        // Find matching markup rule
        // We iterate through sorted markups and pick the first one that matches the criteria
        const matchedMarkup = markups.find(m => {
          // 1. Check Airline
          if (m.airlines && m.airlines.trim() !== '') {
            const allowedAirlines = m.airlines.split(',').map(a => a.trim().toUpperCase());
            if (!allowedAirlines.includes(carrier)) return false;
          }
          
          // 2. Check Origin (Basic implementation)
          if (m.origin && m.origin.trim() !== '') {
             // We would need to extract origin from itinerary to match effectively
             // For now, skipping strict origin check to keep it simple or assuming global origin matches
          }
          
          return true; // Match found if all checks pass
        });

        // Apply Markup if found
        if (matchedMarkup && carrier) {
          const pricingInfo = itinerary.AirItineraryPricingInfo[0];
          
          if (pricingInfo?.ItinTotalFare?.TotalFare?.Amount) {
            let originalPrice = parseFloat(pricingInfo.ItinTotalFare.TotalFare.Amount);
            let addedMarkup = 0;
            const markupVal = parseFloat(matchedMarkup.markup_value || 0);

            if (matchedMarkup.markup_type === 'percentage') {
              addedMarkup = originalPrice * (markupVal / 100);
            } else {
              addedMarkup = markupVal;
            }

            // Update Total Fare
            const newPrice = (originalPrice + addedMarkup).toFixed(2);
            pricingInfo.ItinTotalFare.TotalFare.Amount = newPrice;
            
            // Add a flag to indicate markup was applied
            pricingInfo.ItinTotalFare.TotalFare.MarkupApplied = {
               amount: addedMarkup.toFixed(2),
               type: matchedMarkup.markup_type,
               ruleId: matchedMarkup._id
            };
          }
        }
        
        const pricingInfo = itinerary.AirItineraryPricingInfo?.[0];
        if (pricingInfo) {
          const seats = normalizeSeats(itinerary);
          if (seats) {
            pricingInfo.TPA_Extensions = pricingInfo.TPA_Extensions || {};
            pricingInfo.TPA_Extensions.SeatsRemaining = { Number: seats };
            if (Array.isArray(pricingInfo.PTC_FareBreakdowns) && pricingInfo.PTC_FareBreakdowns.length > 0) {
            if (pricingInfo.PTC_FareBreakdowns?.PTC_FareBreakdown?.[0]) {
              pricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown[0].TPA_Extensions =
                pricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown[0].TPA_Extensions || {};
              pricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown[0].TPA_Extensions.SeatsRemaining = { Number: seats };
            }
            }
          }
          const bag = normalizeBaggage(pricingInfo);
          if (bag) {
            pricingInfo.TPA_Extensions = pricingInfo.TPA_Extensions || {};
            pricingInfo.TPA_Extensions.Baggage = { Checkin: bag.text };
          }
          // Normalize Cabin from FareInfos if present
          const cabinCode = pricingInfo?.FareInfos?.FareInfo?.[0]?.TPA_Extensions?.Cabin?.Cabin;
          if (cabinCode) {
            pricingInfo.TPA_Extensions = pricingInfo.TPA_Extensions || {};
            pricingInfo.TPA_Extensions.Cabin = { Cabin: cabinCode };
          }
          // Normalize Taxes.TotalTax in ItinTotalFare if missing
          try {
            const pf = pricingInfo?.PTC_FareBreakdowns?.PTC_FareBreakdown?.[0]?.PassengerFare;
            let taxAmt = pf?.Taxes?.TotalTax?.Amount;
            if (taxAmt == null) {
              const list = pf?.Taxes?.Tax || [];
              taxAmt = list.reduce((sum, t) => sum + (parseFloat(t?.Amount || 0) || 0), 0);
            }
            if (taxAmt != null) {
              pricingInfo.ItinTotalFare = pricingInfo.ItinTotalFare || {};
              pricingInfo.ItinTotalFare.Taxes = pricingInfo.ItinTotalFare.Taxes || {};
              pricingInfo.ItinTotalFare.Taxes.TotalTax = {
                Amount: taxAmt,
                CurrencyCode: pricingInfo.ItinTotalFare?.TotalFare?.CurrencyCode || pf?.TotalFare?.CurrencyCode || pf?.EquivFare?.CurrencyCode || 'BDT'
              };
            }
          } catch {}
        }
      });
    }
    if (searchResults?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary) {
      const itins = searchResults.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary;
      const countStops = (itin) => {
        try {
          const legs = itin.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption || [];
          return legs.reduce((acc, leg) => acc + Math.max(0, (leg.FlightSegment?.length || 1) - 1), 0);
        } catch {
          return 0;
        }
      };
      const totalElapsed = (itin) => {
        try {
          const legs = itin.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption || [];
          return legs.reduce((acc, leg) => acc + (leg.ElapsedTime || 0), 0);
        } catch {
          return 0;
        }
      };
      const getCarrier = (itin) => {
        try {
          const seg = itin.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption?.[0]?.FlightSegment?.[0];
          return seg?.MarketingAirline?.Code || null;
        } catch {
          return null;
        }
      };
      const getTotal = (itin) => {
        try {
          const pinfo = Array.isArray(itin.AirItineraryPricingInfo) ? itin.AirItineraryPricingInfo[0] : itin.AirItineraryPricingInfo;
          return parseFloat(pinfo?.ItinTotalFare?.TotalFare?.Amount || 0);
        } catch {
          return 0;
        }
      };
      const airlinesSelected = filterAirlines && Object.values(filterAirlines).some(Boolean);
      const filtered = itins.filter((itin) => {
        const stops = countStops(itin);
        let okStops = true;
        if (filterStops === 'direct') okStops = stops === 0;
        else if (filterStops === 'one') okStops = stops === 1;
        else if (filterStops === 'multi') okStops = stops >= 2;
        const carr = getCarrier(itin);
        const okAir = airlinesSelected ? (!!carr && !!filterAirlines?.[carr]) : true;
        return okStops && okAir;
      });
      if (sortOption === 'fastest') {
        filtered.sort((a, b) => totalElapsed(a) - totalElapsed(b));
      } else if (sortOption === 'cheapest') {
        filtered.sort((a, b) => getTotal(a) - getTotal(b));
      }
      searchResults.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary = filtered;
    }

    const buildSummary = (sr) => {
      try {
        const itins = sr?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary || [];
        const total = itins.length;
        const first = itins[0];
        const legs = first?.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption || [];
        const segs = legs[0]?.FlightSegment || [];
        const pinfo = Array.isArray(first?.AirItineraryPricingInfo) ? first.AirItineraryPricingInfo[0] : first?.AirItineraryPricingInfo;
        const fare = pinfo?.ItinTotalFare;
        return {
          totalItineraries: total,
          sample: {
            segmentsCount: segs.length,
            firstSegment: {
              marketing: segs[0]?.MarketingAirline?.Code,
              flightNumber: segs[0]?.FlightNumber,
              origin: segs[0]?.DepartureAirport?.LocationCode,
              depart: segs[0]?.DepartureDateTime,
              destination: segs[0]?.ArrivalAirport?.LocationCode,
              arrive: segs[0]?.ArrivalDateTime,
              bookingClass: segs[0]?.ResBookDesigCode,
            },
            pricing: {
              currency: fare?.TotalFare?.CurrencyCode,
              base: fare?.EquivFare?.Amount,
              taxes: fare?.Taxes?.TotalTax?.Amount,
              total: fare?.TotalFare?.Amount,
              baggage: pinfo?.TPA_Extensions?.Baggage || null,
              seatsRemaining: pinfo?.TPA_Extensions?.SeatsRemaining || pinfo?.FareInfos?.FareInfo?.[0]?.TPA_Extensions?.SeatsRemaining || null,
              brand: pinfo?.FareInfo?.[0]?.TPA_Extensions?.Brand?.Name || null,
              cabin: pinfo?.TPA_Extensions?.Cabin?.Cabin || pinfo?.FareInfos?.FareInfo?.[0]?.TPA_Extensions?.Cabin?.Cabin || null
            }
          },
          rawSample: {
            AirItineraryPricingInfo: pinfo || null,
            OriginDestinationOptionsCount: (first?.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption || []).length
          }
        };
      } catch {
        return { totalItineraries: 0 };
      }
    };
    const summary = buildSummary(searchResults);
    return NextResponse.json({ success: true, data: searchResults, debug: debug ? summary : undefined });

  } catch (error) {
    console.error('API Search Error:', error);
    // Return a 200 with structured error to avoid breaking client UI
    return NextResponse.json(
      { 
        success: false, 
        error: (typeof error === 'string' ? error : (error?.message || 'Search failed')),
        details: error
      }, 
      { status: 200 }
    );
  }
}
