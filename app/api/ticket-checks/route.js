import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all ticket checks with search and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();
    const ticketChecksCollection = db.collection('ticket_checks');

    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { passengerName: { $regex: search, $options: 'i' } },
        { passportNo: { $regex: search, $options: 'i' } },
        { contactNo: { $regex: search, $options: 'i' } },
        { airlinesPnr: { $regex: search, $options: 'i' } },
        { issuingAgentName: { $regex: search, $options: 'i' } },
        { reservationOfficerName: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count for pagination
    const total = await ticketChecksCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const ticketChecks = await ticketChecksCollection
      .find(query)
      .sort({ formDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format ticket checks for frontend
    const formattedTicketChecks = ticketChecks.map((check) => ({
      id: check._id.toString(),
      _id: check._id.toString(),
      customerId: check.customerId || null,
      formDate: check.formDate || '',
      passengerName: check.passengerName || '',
      travellingCountry: check.travellingCountry || '',
      passportNo: check.passportNo || '',
      contactNo: check.contactNo || '',
      isWhatsAppSame: check.isWhatsAppSame !== undefined ? check.isWhatsAppSame : true,
      whatsAppNo: check.whatsAppNo || '',
      airlineName: check.airlineName || '',
      origin: check.origin || '',
      destination: check.destination || '',
      airlinesPnr: check.airlinesPnr || '',
      issuingAgentName: check.issuingAgentName || '',
      issuingAgentContact: check.issuingAgentContact || '',
      agentEmail: check.agentEmail || '',
      reservationOfficerId: check.reservationOfficerId || '',
      reservationOfficerName: check.reservationOfficerName || '',
      serviceCharge: check.serviceCharge || 0,
      profit: check.profit || 0,
      notes: check.notes || '',
      status: check.status || 'pending',
      createdAt: check.createdAt ? check.createdAt.toISOString() : check._id.getTimestamp().toISOString(),
      updatedAt: check.updatedAt ? check.updatedAt.toISOString() : check._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      ticketChecks: formattedTicketChecks,
      data: formattedTicketChecks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching ticket checks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket checks', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new ticket check
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.passengerName || !body.passengerName.trim()) {
      return NextResponse.json(
        { error: 'Passenger name is required' },
        { status: 400 }
      );
    }

    if (!body.travellingCountry || !body.travellingCountry.trim()) {
      return NextResponse.json(
        { error: 'Travelling country is required' },
        { status: 400 }
      );
    }

    if (!body.passportNo || !body.passportNo.trim()) {
      return NextResponse.json(
        { error: 'Passport number is required' },
        { status: 400 }
      );
    }

    if (!body.contactNo || !body.contactNo.trim()) {
      return NextResponse.json(
        { error: 'Contact number is required' },
        { status: 400 }
      );
    }

    if (!body.airlineName || !body.airlineName.trim()) {
      return NextResponse.json(
        { error: 'Airline name is required' },
        { status: 400 }
      );
    }

    if (!body.origin || !body.origin.trim()) {
      return NextResponse.json(
        { error: 'Origin is required' },
        { status: 400 }
      );
    }

    if (!body.destination || !body.destination.trim()) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    if (!body.airlinesPnr || !body.airlinesPnr.trim()) {
      return NextResponse.json(
        { error: 'Airlines PNR is required' },
        { status: 400 }
      );
    }

    if (!body.issuingAgentName || !body.issuingAgentName.trim()) {
      return NextResponse.json(
        { error: 'Issuing agent name is required' },
        { status: 400 }
      );
    }

    if (!body.issuingAgentContact || !body.issuingAgentContact.trim()) {
      return NextResponse.json(
        { error: 'Issuing agent contact is required' },
        { status: 400 }
      );
    }

    if (!body.reservationOfficerId || !body.reservationOfficerId.trim()) {
      return NextResponse.json(
        { error: 'Reservation officer is required' },
        { status: 400 }
      );
    }

    if (!body.serviceCharge || parseFloat(body.serviceCharge) < 0) {
      return NextResponse.json(
        { error: 'Service charge is required and must be a positive number' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (body.agentEmail && body.agentEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.agentEmail.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const ticketChecksCollection = db.collection('ticket_checks');

    // Create new ticket check
    const newTicketCheck = {
      customerId: body.customerId || null,
      formDate: body.formDate || new Date().toISOString().split('T')[0],
      passengerName: body.passengerName.trim(),
      travellingCountry: body.travellingCountry.trim(),
      passportNo: body.passportNo.trim(),
      contactNo: body.contactNo.trim(),
      isWhatsAppSame: body.isWhatsAppSame !== undefined ? body.isWhatsAppSame : true,
      whatsAppNo: body.isWhatsAppSame ? body.contactNo.trim() : (body.whatsAppNo || body.contactNo.trim()),
      airlineName: body.airlineName.trim(),
      origin: body.origin.trim(),
      destination: body.destination.trim(),
      airlinesPnr: body.airlinesPnr.trim(),
      issuingAgentName: body.issuingAgentName.trim(),
      issuingAgentContact: body.issuingAgentContact.trim(),
      agentEmail: body.agentEmail ? body.agentEmail.trim() : null,
      reservationOfficerId: body.reservationOfficerId.trim(),
      reservationOfficerName: body.reservationOfficerName || '',
      serviceCharge: parseFloat(body.serviceCharge) || 0,
      profit: parseFloat(body.profit) || parseFloat(body.serviceCharge) || 0, // Service Charge is completely profit
      notes: body.notes || '',
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ticketChecksCollection.insertOne(newTicketCheck);

    // Fetch created ticket check
    const createdTicketCheck = await ticketChecksCollection.findOne({
      _id: result.insertedId
    });

    // Format ticket check for frontend
    const formattedTicketCheck = {
      id: createdTicketCheck._id.toString(),
      _id: createdTicketCheck._id.toString(),
      ...newTicketCheck,
      createdAt: createdTicketCheck.createdAt.toISOString(),
      updatedAt: createdTicketCheck.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Ticket check created successfully',
      ticketCheck: formattedTicketCheck,
      data: formattedTicketCheck,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket check:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket check', message: error.message },
      { status: 500 }
    );
  }
}
