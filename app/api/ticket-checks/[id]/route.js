import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single ticket check by ID
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Ticket check ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const ticketChecksCollection = db.collection('ticket_checks');

    // Try to find by _id first
    let ticketCheck = null;
    if (ObjectId.isValid(id)) {
      ticketCheck = await ticketChecksCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!ticketCheck) {
      return NextResponse.json(
        { error: 'Ticket check not found' },
        { status: 404 }
      );
    }

    // Format ticket check for frontend
    const formattedTicketCheck = {
      id: ticketCheck._id.toString(),
      _id: ticketCheck._id.toString(),
      customerId: ticketCheck.customerId || null,
      formDate: ticketCheck.formDate || '',
      passengerName: ticketCheck.passengerName || '',
      travellingCountry: ticketCheck.travellingCountry || '',
      passportNo: ticketCheck.passportNo || '',
      contactNo: ticketCheck.contactNo || '',
      isWhatsAppSame: ticketCheck.isWhatsAppSame !== undefined ? ticketCheck.isWhatsAppSame : true,
      whatsAppNo: ticketCheck.whatsAppNo || '',
      airlineName: ticketCheck.airlineName || '',
      origin: ticketCheck.origin || '',
      destination: ticketCheck.destination || '',
      airlinesPnr: ticketCheck.airlinesPnr || '',
      issuingAgentName: ticketCheck.issuingAgentName || '',
      issuingAgentContact: ticketCheck.issuingAgentContact || '',
      agentEmail: ticketCheck.agentEmail || '',
      reservationOfficerId: ticketCheck.reservationOfficerId || '',
      reservationOfficerName: ticketCheck.reservationOfficerName || '',
      serviceCharge: ticketCheck.serviceCharge || 0,
      profit: ticketCheck.profit || 0,
      notes: ticketCheck.notes || '',
      status: ticketCheck.status || 'pending',
      createdAt: ticketCheck.createdAt ? ticketCheck.createdAt.toISOString() : ticketCheck._id.getTimestamp().toISOString(),
      updatedAt: ticketCheck.updatedAt ? ticketCheck.updatedAt.toISOString() : ticketCheck._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      ticketCheck: formattedTicketCheck,
      data: formattedTicketCheck,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching ticket check:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket check', message: error.message },
      { status: 500 }
    );
  }
}

// PUT/PATCH update ticket check
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Ticket check ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const ticketChecksCollection = db.collection('ticket_checks');

    // Find ticket check
    let ticketCheck = null;
    if (ObjectId.isValid(id)) {
      ticketCheck = await ticketChecksCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!ticketCheck) {
      return NextResponse.json(
        { error: 'Ticket check not found' },
        { status: 404 }
      );
    }

    // Validate required fields if provided
    if (body.passengerName !== undefined && !body.passengerName.trim()) {
      return NextResponse.json(
        { error: 'Passenger name is required' },
        { status: 400 }
      );
    }

    if (body.agentEmail && body.agentEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.agentEmail.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date(),
    };

    if (body.passengerName !== undefined) updateData.passengerName = body.passengerName.trim();
    if (body.travellingCountry !== undefined) updateData.travellingCountry = body.travellingCountry.trim();
    if (body.passportNo !== undefined) updateData.passportNo = body.passportNo.trim();
    if (body.contactNo !== undefined) updateData.contactNo = body.contactNo.trim();
    if (body.isWhatsAppSame !== undefined) updateData.isWhatsAppSame = body.isWhatsAppSame;
    if (body.whatsAppNo !== undefined) updateData.whatsAppNo = body.whatsAppNo.trim();
    if (body.airlineName !== undefined) updateData.airlineName = body.airlineName.trim();
    if (body.origin !== undefined) updateData.origin = body.origin.trim();
    if (body.destination !== undefined) updateData.destination = body.destination.trim();
    if (body.airlinesPnr !== undefined) updateData.airlinesPnr = body.airlinesPnr.trim();
    if (body.issuingAgentName !== undefined) updateData.issuingAgentName = body.issuingAgentName.trim();
    if (body.issuingAgentContact !== undefined) updateData.issuingAgentContact = body.issuingAgentContact.trim();
    if (body.agentEmail !== undefined) updateData.agentEmail = body.agentEmail ? body.agentEmail.trim() : null;
    if (body.reservationOfficerId !== undefined) updateData.reservationOfficerId = body.reservationOfficerId.trim();
    if (body.reservationOfficerName !== undefined) updateData.reservationOfficerName = body.reservationOfficerName.trim();
    if (body.serviceCharge !== undefined) updateData.serviceCharge = parseFloat(body.serviceCharge) || 0;
    if (body.profit !== undefined) {
      updateData.profit = parseFloat(body.profit) || 0;
    } else if (body.serviceCharge !== undefined) {
      // If serviceCharge is updated but profit is not, recalculate profit
      updateData.profit = parseFloat(body.serviceCharge) || 0;
    }
    if (body.notes !== undefined) updateData.notes = body.notes || '';
    if (body.status !== undefined) updateData.status = body.status || 'pending';

    // Update ticket check
    await ticketChecksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated ticket check
    const updatedTicketCheck = await ticketChecksCollection.findOne({
      _id: new ObjectId(id)
    });

    // Format ticket check for frontend
    const formattedTicketCheck = {
      id: updatedTicketCheck._id.toString(),
      _id: updatedTicketCheck._id.toString(),
      customerId: updatedTicketCheck.customerId || null,
      formDate: updatedTicketCheck.formDate || '',
      passengerName: updatedTicketCheck.passengerName || '',
      travellingCountry: updatedTicketCheck.travellingCountry || '',
      passportNo: updatedTicketCheck.passportNo || '',
      contactNo: updatedTicketCheck.contactNo || '',
      isWhatsAppSame: updatedTicketCheck.isWhatsAppSame !== undefined ? updatedTicketCheck.isWhatsAppSame : true,
      whatsAppNo: updatedTicketCheck.whatsAppNo || '',
      airlineName: updatedTicketCheck.airlineName || '',
      origin: updatedTicketCheck.origin || '',
      destination: updatedTicketCheck.destination || '',
      airlinesPnr: updatedTicketCheck.airlinesPnr || '',
      issuingAgentName: updatedTicketCheck.issuingAgentName || '',
      issuingAgentContact: updatedTicketCheck.issuingAgentContact || '',
      agentEmail: updatedTicketCheck.agentEmail || '',
      reservationOfficerId: updatedTicketCheck.reservationOfficerId || '',
      reservationOfficerName: updatedTicketCheck.reservationOfficerName || '',
      serviceCharge: updatedTicketCheck.serviceCharge || 0,
      profit: updatedTicketCheck.profit || 0,
      notes: updatedTicketCheck.notes || '',
      status: updatedTicketCheck.status || 'pending',
      createdAt: updatedTicketCheck.createdAt ? updatedTicketCheck.createdAt.toISOString() : updatedTicketCheck._id.getTimestamp().toISOString(),
      updatedAt: updatedTicketCheck.updatedAt ? updatedTicketCheck.updatedAt.toISOString() : updatedTicketCheck._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Ticket check updated successfully',
      ticketCheck: formattedTicketCheck,
      data: formattedTicketCheck,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating ticket check:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket check', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE ticket check
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Ticket check ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const ticketChecksCollection = db.collection('ticket_checks');

    // Find and delete ticket check
    let ticketCheck = null;
    if (ObjectId.isValid(id)) {
      ticketCheck = await ticketChecksCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!ticketCheck) {
      return NextResponse.json(
        { error: 'Ticket check not found' },
        { status: 404 }
      );
    }

    await ticketChecksCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'Ticket check deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting ticket check:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket check', message: error.message },
      { status: 500 }
    );
  }
}
