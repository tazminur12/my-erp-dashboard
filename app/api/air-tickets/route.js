import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all air tickets
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q');
    const status = searchParams.get('status');
    const airline = searchParams.get('airline');
    const flightType = searchParams.get('flightType');
    const tripType = searchParams.get('tripType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();
    const airTicketsCollection = db.collection('air_tickets');

    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (airline && airline !== 'all') {
      query.airline = airline;
    }
    if (flightType && flightType !== 'all') {
      query.flightType = flightType;
    }
    if (tripType && tripType !== 'all') {
      query.tripType = tripType;
    }
    if (dateFrom || dateTo) {
      query.flightDate = {};
      if (dateFrom) {
        query.flightDate.$gte = dateFrom;
      }
      if (dateTo) {
        query.flightDate.$lte = dateTo;
      }
    }
    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } },
        { gdsPnr: { $regex: search, $options: 'i' } },
        { airlinePnr: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { airline: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const tickets = await airTicketsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await airTicketsCollection.countDocuments(query);

    // Format tickets for frontend
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket._id.toString(),
      _id: ticket._id.toString(),
      ticketId: ticket.ticketId || ticket._id.toString(),
      customerId: ticket.customerId || '',
      customerName: ticket.customerName || '',
      customerPhone: ticket.customerPhone || '',
      tripType: ticket.tripType || 'oneway',
      flightType: ticket.flightType || 'domestic',
      date: ticket.date || '',
      bookingId: ticket.bookingId || '',
      gdsPnr: ticket.gdsPnr || '',
      airlinePnr: ticket.airlinePnr || '',
      airline: ticket.airline || '',
      airlineId: ticket.airlineId || '',
      origin: ticket.origin || '',
      destination: ticket.destination || '',
      flightDate: ticket.flightDate || '',
      returnDate: ticket.returnDate || '',
      segments: ticket.segments || [],
      agent: ticket.agent || '',
      agentId: ticket.agentId || '',
      issuedBy: ticket.issuedBy || '',
      issuedById: ticket.issuedById || '',
      vendor: ticket.vendor || '',
      vendorId: ticket.vendorId || '',
      purposeType: ticket.purposeType || '',
      adultCount: ticket.adultCount || 0,
      childCount: ticket.childCount || 0,
      infantCount: ticket.infantCount || 0,
      customerDeal: ticket.customerDeal || 0,
      customerPaid: ticket.customerPaid || 0,
      customerDue: ticket.customerDue || 0,
      baseFare: ticket.baseFare || 0,
      taxBD: ticket.taxBD || 0,
      e5: ticket.e5 || 0,
      e7: ticket.e7 || 0,
      g8: ticket.g8 || 0,
      ow: ticket.ow || 0,
      p7: ticket.p7 || 0,
      p8: ticket.p8 || 0,
      ts: ticket.ts || 0,
      ut: ticket.ut || 0,
      yq: ticket.yq || 0,
      taxes: ticket.taxes || 0,
      totalTaxes: ticket.totalTaxes || 0,
      ait: ticket.ait || 0,
      commissionRate: ticket.commissionRate || 0,
      plb: ticket.plb || 0,
      salmaAirServiceCharge: ticket.salmaAirServiceCharge || 0,
      vendorServiceCharge: ticket.vendorServiceCharge || 0,
      vendorAmount: ticket.vendorAmount || 0,
      vendorPaidFh: ticket.vendorPaidFh || 0,
      vendorDue: ticket.vendorDue || 0,
      profit: ticket.profit || 0,
      dueDate: ticket.dueDate || '',
      status: ticket.status || 'pending',
      segmentCount: ticket.segmentCount || 1,
      flownSegment: ticket.flownSegment || false,
      createdAt: ticket.createdAt ? ticket.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: ticket.updatedAt ? ticket.updatedAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      tickets: formattedTickets,
      data: formattedTickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching air tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air tickets', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new air ticket
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.customerId || !body.customerId.trim()) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!body.date || !body.date.trim()) {
      return NextResponse.json(
        { error: 'Selling date is required' },
        { status: 400 }
      );
    }

    if (!body.airline || !body.airline.trim()) {
      return NextResponse.json(
        { error: 'Airline is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airTicketsCollection = db.collection('air_tickets');

    // Generate unique ticket ID
    const ticketsWithIds = await airTicketsCollection
      .find({ ticketId: { $regex: /^TKT\d+$/i } })
      .toArray();
    
    let maxNumber = 0;
    if (ticketsWithIds.length > 0) {
      ticketsWithIds.forEach(ticket => {
        if (ticket.ticketId) {
          const idNumber = parseInt(ticket.ticketId.toUpperCase().replace(/^TKT-?/, '')) || 0;
          if (idNumber > maxNumber) {
            maxNumber = idNumber;
          }
        }
      });
    }
    
    const ticketId = `TKT${String(maxNumber + 1).padStart(6, '0')}`;

    // Create new ticket
    const newTicket = {
      ticketId,
      customerId: body.customerId.trim(),
      customerName: body.customerName ? body.customerName.trim() : '',
      customerPhone: body.customerPhone ? body.customerPhone.trim() : '',
      tripType: body.tripType || 'oneway',
      flightType: body.flightType || 'domestic',
      date: body.date.trim(),
      bookingId: body.bookingId ? body.bookingId.trim() : '',
      gdsPnr: body.gdsPnr ? body.gdsPnr.trim() : '',
      airlinePnr: body.airlinePnr ? body.airlinePnr.trim() : '',
      airline: body.airline.trim(),
      airlineId: body.airlineId ? body.airlineId.trim() : '',
      status: body.status || 'pending',
      origin: body.origin ? body.origin.trim() : '',
      destination: body.destination ? body.destination.trim() : '',
      flightDate: body.flightDate || '',
      returnDate: body.returnDate || '',
      segments: Array.isArray(body.segments) ? body.segments.map(seg => ({
        origin: seg.origin ? seg.origin.trim() : '',
        destination: seg.destination ? seg.destination.trim() : '',
        date: seg.date ? seg.date.trim() : '',
      })) : [],
      agent: body.agent ? body.agent.trim() : '',
      agentId: body.agentId ? body.agentId.trim() : '',
      issuedBy: body.issuedBy ? body.issuedBy.trim() : '',
      issuedById: body.issuedById ? body.issuedById.trim() : '',
      vendor: body.vendor ? body.vendor.trim() : '',
      vendorId: body.vendorId ? body.vendorId.trim() : '',
      purposeType: body.purposeType ? body.purposeType.trim() : '',
      adultCount: parseInt(body.adultCount) || 0,
      childCount: parseInt(body.childCount) || 0,
      infantCount: parseInt(body.infantCount) || 0,
      customerDeal: parseFloat(body.customerDeal) || 0,
      customerPaid: parseFloat(body.customerPaid) || 0,
      customerDue: parseFloat(body.customerDue) || 0,
      dueDate: body.dueDate || '',
      baseFare: parseFloat(body.baseFare) || 0,
      taxBD: parseFloat(body.taxBD) || 0,
      e5: parseFloat(body.e5) || 0,
      e7: parseFloat(body.e7) || 0,
      g8: parseFloat(body.g8) || 0,
      ow: parseFloat(body.ow) || 0,
      p7: parseFloat(body.p7) || 0,
      p8: parseFloat(body.p8) || 0,
      ts: parseFloat(body.ts) || 0,
      ut: parseFloat(body.ut) || 0,
      yq: parseFloat(body.yq) || 0,
      taxes: parseFloat(body.taxes) || 0,
      totalTaxes: parseFloat(body.totalTaxes) || 0,
      ait: parseFloat(body.ait) || 0,
      commissionRate: parseFloat(body.commissionRate) || 0,
      plb: parseFloat(body.plb) || 0,
      salmaAirServiceCharge: parseFloat(body.salmaAirServiceCharge) || 0,
      vendorServiceCharge: parseFloat(body.vendorServiceCharge) || 0,
      vendorAmount: parseFloat(body.vendorAmount) || 0,
      vendorPaidFh: parseFloat(body.vendorPaidFh) || 0,
      vendorDue: parseFloat(body.vendorDue) || 0,
      profit: parseFloat(body.profit) || 0,
      segmentCount: parseInt(body.segmentCount) || 1,
      flownSegment: Boolean(body.flownSegment),
      createdBy: body.createdBy || session?.user?.id || session?.user?._id || session?.user?.email,
      employeeId: body.employeeId || session?.user?.employeeId,
      branchId: body.branchId || session?.user?.branchId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await airTicketsCollection.insertOne(newTicket);

    // Fetch created ticket
    const createdTicket = await airTicketsCollection.findOne({
      _id: result.insertedId
    });

    // Format ticket for frontend
    const formattedTicket = {
      id: createdTicket._id.toString(),
      _id: createdTicket._id.toString(),
      ticketId: createdTicket.ticketId,
      ...newTicket,
      createdAt: createdTicket.createdAt.toISOString(),
      updatedAt: createdTicket.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Air ticket created successfully',
      ticket: formattedTicket,
      data: formattedTicket,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating air ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create air ticket', message: error.message },
      { status: 500 }
    );
  }
}
