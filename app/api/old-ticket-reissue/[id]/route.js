import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single old ticket reissue
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Reissue ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid reissue ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const oldTicketReissuesCollection = db.collection('old_ticket_reissues');

    const reissue = await oldTicketReissuesCollection.findOne({ _id: new ObjectId(id) });

    if (!reissue) {
      return NextResponse.json(
        { error: 'Old ticket reissue not found' },
        { status: 404 }
      );
    }

    const formattedReissue = {
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
    };

    return NextResponse.json({
      reissue: formattedReissue,
      data: formattedReissue,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching old ticket reissue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch old ticket reissue', message: error.message },
      { status: 500 }
    );
  }
}

// PUT/PATCH update old ticket reissue
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Reissue ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid reissue ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const oldTicketReissuesCollection = db.collection('old_ticket_reissues');

    // Check if reissue exists
    const existingReissue = await oldTicketReissuesCollection.findOne({ _id: new ObjectId(id) });

    if (!existingReissue) {
      return NextResponse.json(
        { error: 'Old ticket reissue not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData = {
      updatedAt: new Date(),
    };

    if (body.firstName !== undefined) updateData.firstName = body.firstName.trim();
    if (body.lastName !== undefined) updateData.lastName = body.lastName.trim();
    if (body.travellingCountry !== undefined) updateData.travellingCountry = body.travellingCountry.trim();
    if (body.passportNo !== undefined) updateData.passportNo = body.passportNo.trim();
    if (body.contactNo !== undefined) updateData.contactNo = body.contactNo.trim();
    if (body.isWhatsAppSame !== undefined) updateData.isWhatsAppSame = body.isWhatsAppSame;
    if (body.whatsAppNo !== undefined) updateData.whatsAppNo = body.whatsAppNo.trim();
    if (body.airlineName !== undefined) updateData.airlineName = body.airlineName.trim();
    if (body.origin !== undefined) updateData.origin = body.origin.trim();
    if (body.destination !== undefined) updateData.destination = body.destination.trim();
    if (body.airlinesPnr !== undefined) updateData.airlinesPnr = body.airlinesPnr.trim();
    if (body.oldDate !== undefined) updateData.oldDate = body.oldDate.trim();
    if (body.newDate !== undefined) updateData.newDate = body.newDate.trim();
    if (body.reissueVendorId !== undefined) updateData.reissueVendorId = body.reissueVendorId.trim();
    if (body.reissueVendorName !== undefined) updateData.reissueVendorName = body.reissueVendorName.trim();
    if (body.vendorAmount !== undefined) updateData.vendorAmount = parseFloat(body.vendorAmount) || 0;
    if (body.totalContractAmount !== undefined) updateData.totalContractAmount = parseFloat(body.totalContractAmount) || 0;
    if (body.issuingAgentName !== undefined) updateData.issuingAgentName = body.issuingAgentName.trim();
    if (body.issuingAgentContact !== undefined) updateData.issuingAgentContact = body.issuingAgentContact.trim();
    if (body.agentEmail !== undefined) updateData.agentEmail = body.agentEmail ? body.agentEmail.trim() : null;
    if (body.reservationOfficerId !== undefined) updateData.reservationOfficerId = body.reservationOfficerId.trim();
    if (body.reservationOfficerName !== undefined) updateData.reservationOfficerName = body.reservationOfficerName.trim();
    if (body.notes !== undefined) updateData.notes = body.notes.trim();
    if (body.status !== undefined) updateData.status = body.status;

    // Recalculate profit if amounts changed
    if (body.vendorAmount !== undefined || body.totalContractAmount !== undefined) {
      const vendorAmount = updateData.vendorAmount !== undefined ? updateData.vendorAmount : existingReissue.vendorAmount;
      const totalContractAmount = updateData.totalContractAmount !== undefined ? updateData.totalContractAmount : existingReissue.totalContractAmount;
      updateData.profit = totalContractAmount - vendorAmount;
    }

    await oldTicketReissuesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated reissue
    const updatedReissue = await oldTicketReissuesCollection.findOne({ _id: new ObjectId(id) });

    const formattedReissue = {
      id: updatedReissue._id.toString(),
      _id: updatedReissue._id.toString(),
      customerId: updatedReissue.customerId || null,
      formDate: updatedReissue.formDate || '',
      firstName: updatedReissue.firstName || '',
      lastName: updatedReissue.lastName || '',
      travellingCountry: updatedReissue.travellingCountry || '',
      passportNo: updatedReissue.passportNo || '',
      contactNo: updatedReissue.contactNo || '',
      isWhatsAppSame: updatedReissue.isWhatsAppSame !== undefined ? updatedReissue.isWhatsAppSame : true,
      whatsAppNo: updatedReissue.whatsAppNo || '',
      airlineName: updatedReissue.airlineName || '',
      origin: updatedReissue.origin || '',
      destination: updatedReissue.destination || '',
      airlinesPnr: updatedReissue.airlinesPnr || '',
      oldDate: updatedReissue.oldDate || '',
      newDate: updatedReissue.newDate || '',
      reissueVendorId: updatedReissue.reissueVendorId || '',
      reissueVendorName: updatedReissue.reissueVendorName || '',
      vendorAmount: updatedReissue.vendorAmount || 0,
      totalContractAmount: updatedReissue.totalContractAmount || 0,
      profit: updatedReissue.profit || 0,
      issuingAgentName: updatedReissue.issuingAgentName || '',
      issuingAgentContact: updatedReissue.issuingAgentContact || '',
      agentEmail: updatedReissue.agentEmail || '',
      reservationOfficerId: updatedReissue.reservationOfficerId || '',
      reservationOfficerName: updatedReissue.reservationOfficerName || '',
      notes: updatedReissue.notes || '',
      status: updatedReissue.status || 'pending',
      createdAt: updatedReissue.createdAt ? updatedReissue.createdAt.toISOString() : updatedReissue._id.getTimestamp().toISOString(),
      updatedAt: updatedReissue.updatedAt ? updatedReissue.updatedAt.toISOString() : updatedReissue._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Old ticket reissue updated successfully',
      reissue: formattedReissue,
      data: formattedReissue,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating old ticket reissue:', error);
    return NextResponse.json(
      { error: 'Failed to update old ticket reissue', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE old ticket reissue
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Reissue ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid reissue ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const oldTicketReissuesCollection = db.collection('old_ticket_reissues');

    // Check if reissue exists
    const reissue = await oldTicketReissuesCollection.findOne({ _id: new ObjectId(id) });

    if (!reissue) {
      return NextResponse.json(
        { error: 'Old ticket reissue not found' },
        { status: 404 }
      );
    }

    await oldTicketReissuesCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'Old ticket reissue deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting old ticket reissue:', error);
    return NextResponse.json(
      { error: 'Failed to delete old ticket reissue', message: error.message },
      { status: 500 }
    );
  }
}
