import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single air ticket by ID
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching ticket with ID:', id);

    const db = await getDb();
    const airTicketsCollection = db.collection('air_tickets');

    // Try to find by _id first, then by ticketId, then by bookingId
    let ticket = null;
    if (ObjectId.isValid(id)) {
      console.log('Trying to find by ObjectId:', id);
      ticket = await airTicketsCollection.findOne({ _id: new ObjectId(id) });
      if (ticket) console.log('Found ticket by ObjectId');
    }
    
    if (!ticket) {
      console.log('Trying to find by ticketId:', id);
      ticket = await airTicketsCollection.findOne({ ticketId: id });
      if (ticket) console.log('Found ticket by ticketId');
    }
    
    if (!ticket) {
      console.log('Trying to find by bookingId:', id);
      ticket = await airTicketsCollection.findOne({ bookingId: id });
      if (ticket) console.log('Found ticket by bookingId');
    }

    if (!ticket) {
      console.log('Ticket not found with any method for ID:', id);
      return NextResponse.json(
        { error: 'Ticket not found', message: `No ticket found with ID: ${id}` },
        { status: 404 }
      );
    }

    // Format ticket for frontend
    const formattedTicket = {
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
    };

    return NextResponse.json({
      success: true,
      ticket: formattedTicket,
      data: formattedTicket,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching air ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air ticket', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE air ticket
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airTicketsCollection = db.collection('air_tickets');

    // Try to find and delete by _id first, then by ticketId, then by bookingId
    let ticket = null;
    let deleteResult = null;
    
    if (ObjectId.isValid(id)) {
      ticket = await airTicketsCollection.findOne({ _id: new ObjectId(id) });
      if (ticket) {
        deleteResult = await airTicketsCollection.deleteOne({ _id: new ObjectId(id) });
      }
    }
    
    if (!ticket) {
      ticket = await airTicketsCollection.findOne({ ticketId: id });
      if (ticket) {
        deleteResult = await airTicketsCollection.deleteOne({ ticketId: id });
      }
    }
    
    if (!ticket) {
      ticket = await airTicketsCollection.findOne({ bookingId: id });
      if (ticket) {
        deleteResult = await airTicketsCollection.deleteOne({ bookingId: id });
      }
    }

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete ticket' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting air ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete air ticket', message: error.message },
      { status: 500 }
    );
  }
}
