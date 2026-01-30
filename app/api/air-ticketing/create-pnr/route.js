
import { NextResponse } from 'next/server';
import { createPNR } from '@/lib/sabre';

export async function POST(request) {
  try {
    const body = await request.json();
    const { flight, passenger } = body;

    // Validation
    if (!flight || !passenger) {
      return NextResponse.json(
        { error: 'Missing flight or passenger data' },
        { status: 400 }
      );
    }

    // Call Sabre to create PNR
    const pnrResponse = await createPNR({ flight, passenger });

    // Extract PNR Locator
    const pnr = pnrResponse.CreatePassengerNameRecordRS?.ItineraryRef?.ID;

    if (!pnr) {
      throw new Error('PNR creation failed: No PNR returned');
    }

    return NextResponse.json({ success: true, pnr, data: pnrResponse });

  } catch (error) {
    console.error('API PNR Error:', error);
    
    // Extract readable error message from Sabre response if available
    let errorMessage = error.message || 'Internal Server Error';
    if (error.ApplicationResults?.Error?.[0]?.SystemSpecificResults?.[0]?.Message?.[0]?.content) {
      errorMessage = error.ApplicationResults.Error[0].SystemSpecificResults[0].Message[0].content;
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error 
      }, 
      { status: 500 }
    );
  }
}
