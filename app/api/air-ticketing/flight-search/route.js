
import { NextResponse } from 'next/server';
import { searchFlights } from '@/lib/sabre';
import { getDb } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate, returnDate, passengers, tripType, segments, travellers } = body;

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
              pricingInfo.PTC_FareBreakdowns[0].TPA_Extensions = pricingInfo.PTC_FareBreakdowns[0].TPA_Extensions || {};
              pricingInfo.PTC_FareBreakdowns[0].TPA_Extensions.SeatsRemaining = { Number: seats };
            }
          }
          const bag = normalizeBaggage(pricingInfo);
          if (bag) {
            pricingInfo.TPA_Extensions = pricingInfo.TPA_Extensions || {};
            pricingInfo.TPA_Extensions.Baggage = { Checkin: bag.text };
          }
        }
      });
    }

    return NextResponse.json({ success: true, data: searchResults });

  } catch (error) {
    console.error('API Search Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal Server Error',
        details: error // In prod, be careful not to leak sensitive info
      }, 
      { status: 500 }
    );
  }
}
