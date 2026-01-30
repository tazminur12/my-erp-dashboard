
import { NextResponse } from 'next/server';
import { searchFlights } from '@/lib/sabre';

export async function POST(request) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate, returnDate, passengers } = body;

    // Validation
    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, departureDate' },
        { status: 400 }
      );
    }

    // Strict Date Validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(departureDate)) {
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

    // Call Sabre
    const searchResults = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: passengers || 1
    });

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
