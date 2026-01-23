import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all old ticket reissues with search and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();
    const oldTicketReissuesCollection = db.collection('old_ticket_reissues');

    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { passportNo: { $regex: search, $options: 'i' } },
        { contactNo: { $regex: search, $options: 'i' } },
        { airlinesPnr: { $regex: search, $options: 'i' } },
        { issuingAgentName: { $regex: search, $options: 'i' } },
        { reservationOfficerName: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count for pagination
    const total = await oldTicketReissuesCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const reissues = await oldTicketReissuesCollection
      .find(query)
      .sort({ formDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format reissues for frontend
    const formattedReissues = reissues.map((reissue) => ({
      id: reissue._id.toString(),
      _id: reissue._id.toString(),
      customerId: reissue.customerId || null,
      formDate: reissue.formDate || '',
      firstName: reissue.firstName || '',
      lastName: reissue.lastName || '',
      travellingCountry: reissue.travellingCountry || '',
      passportNo: reissue.passportNo || '',
      contactNo: reissue.contactNo || '',
      isWhatsAppSame: reissue.isWhatsAppSame !== undefined ? reissue.isWhatsAppSame : true,
      whatsAppNo: reissue.whatsAppNo || '',
      airlineName: reissue.airlineName || '',
      origin: reissue.origin || '',
      destination: reissue.destination || '',
      airlinesPnr: reissue.airlinesPnr || '',
      oldDate: reissue.oldDate || '',
      newDate: reissue.newDate || '',
      reissueVendorId: reissue.reissueVendorId || '',
      reissueVendorName: reissue.reissueVendorName || '',
      vendorAmount: reissue.vendorAmount || 0,
      totalContractAmount: reissue.totalContractAmount || 0,
      profit: reissue.profit || 0,
      issuingAgentName: reissue.issuingAgentName || '',
      issuingAgentContact: reissue.issuingAgentContact || '',
      agentEmail: reissue.agentEmail || '',
      reservationOfficerId: reissue.reservationOfficerId || '',
      reservationOfficerName: reissue.reservationOfficerName || '',
      notes: reissue.notes || '',
      status: reissue.status || 'pending',
      createdAt: reissue.createdAt ? reissue.createdAt.toISOString() : reissue._id.getTimestamp().toISOString(),
      updatedAt: reissue.updatedAt ? reissue.updatedAt.toISOString() : reissue._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      reissues: formattedReissues,
      data: formattedReissues,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching old ticket reissues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch old ticket reissues', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new old ticket reissue
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.firstName || !body.firstName.trim()) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

    if (!body.lastName || !body.lastName.trim()) {
      return NextResponse.json(
        { error: 'Last name is required' },
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

    if (!body.oldDate || !body.oldDate.trim()) {
      return NextResponse.json(
        { error: 'Old date is required' },
        { status: 400 }
      );
    }

    if (!body.newDate || !body.newDate.trim()) {
      return NextResponse.json(
        { error: 'New date is required' },
        { status: 400 }
      );
    }

    if (!body.reissueVendorId || !body.reissueVendorId.trim()) {
      return NextResponse.json(
        { error: 'Reissue vendor is required' },
        { status: 400 }
      );
    }

    if (!body.vendorAmount || parseFloat(body.vendorAmount) < 0) {
      return NextResponse.json(
        { error: 'Vendor amount is required and must be a positive number' },
        { status: 400 }
      );
    }

    if (!body.totalContractAmount || parseFloat(body.totalContractAmount) < 0) {
      return NextResponse.json(
        { error: 'Total contract amount is required and must be a positive number' },
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
    const oldTicketReissuesCollection = db.collection('old_ticket_reissues');

    // Calculate profit
    const vendorAmount = parseFloat(body.vendorAmount) || 0;
    const totalContractAmount = parseFloat(body.totalContractAmount) || 0;
    const profit = totalContractAmount - vendorAmount;

    // Create new old ticket reissue
    const newReissue = {
      customerId: body.customerId || null,
      formDate: body.formDate || new Date().toISOString().split('T')[0],
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      travellingCountry: body.travellingCountry.trim(),
      passportNo: body.passportNo.trim(),
      contactNo: body.contactNo.trim(),
      isWhatsAppSame: body.isWhatsAppSame !== undefined ? body.isWhatsAppSame : true,
      whatsAppNo: body.isWhatsAppSame ? body.contactNo.trim() : (body.whatsAppNo || body.contactNo.trim()),
      airlineName: body.airlineName.trim(),
      origin: body.origin.trim(),
      destination: body.destination.trim(),
      airlinesPnr: body.airlinesPnr.trim(),
      oldDate: body.oldDate.trim(),
      newDate: body.newDate.trim(),
      reissueVendorId: body.reissueVendorId.trim(),
      reissueVendorName: body.reissueVendorName || '',
      vendorAmount: vendorAmount,
      totalContractAmount: totalContractAmount,
      profit: profit,
      issuingAgentName: body.issuingAgentName.trim(),
      issuingAgentContact: body.issuingAgentContact.trim(),
      agentEmail: body.agentEmail ? body.agentEmail.trim() : null,
      reservationOfficerId: body.reservationOfficerId.trim(),
      reservationOfficerName: body.reservationOfficerName || '',
      notes: body.notes || '',
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await oldTicketReissuesCollection.insertOne(newReissue);

    // Fetch created reissue
    const createdReissue = await oldTicketReissuesCollection.findOne({
      _id: result.insertedId
    });

    // Format reissue for frontend
    const formattedReissue = {
      id: createdReissue._id.toString(),
      _id: createdReissue._id.toString(),
      ...newReissue,
      createdAt: createdReissue.createdAt.toISOString(),
      updatedAt: createdReissue.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Old ticket reissue created successfully',
      reissue: formattedReissue,
      data: formattedReissue,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating old ticket reissue:', error);
    return NextResponse.json(
      { error: 'Failed to create old ticket reissue', message: error.message },
      { status: 500 }
    );
  }
}
