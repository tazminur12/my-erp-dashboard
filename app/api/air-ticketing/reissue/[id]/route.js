import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBranchFilter } from '@/lib/branchHelper';
import { ObjectId } from 'mongodb';

// GET - Fetch single Reissue record
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const db = await getDb();
    const collection = db.collection('air_ticket_reissues');

    const query = {
      _id: new ObjectId(id),
      ...getBranchFilter(session)
    };

    const reissue = await collection.findOne(query);

    if (!reissue) {
      return NextResponse.json({ error: 'Reissue record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: reissue });
  } catch (error) {
    console.error('Error fetching Reissue record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update Reissue record
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { 
      ticketNumber, 
      pnr, 
      passengerName,
      vendorId,
      vendorName,
      fareDifference,
      taxDifference,
      serviceFee,
      airlinesPenalty,
      totalCharge,
      status,
      remarks
    } = body;

    const db = await getDb();
    const collection = db.collection('air_ticket_reissues');

    const query = {
      _id: new ObjectId(id),
      ...getBranchFilter(session)
    };

    const updateData = {
      updatedAt: new Date()
    };

    if (ticketNumber) updateData.ticketNumber = ticketNumber;
    if (pnr) updateData.pnr = pnr;
    if (passengerName) updateData.passengerName = passengerName;
    if (vendorId) updateData.vendorId = vendorId;
    if (vendorName) updateData.vendorName = vendorName;
    if (fareDifference !== undefined) updateData.fareDifference = parseFloat(fareDifference);
    if (taxDifference !== undefined) updateData.taxDifference = parseFloat(taxDifference);
    if (serviceFee !== undefined) updateData.serviceFee = parseFloat(serviceFee);
    if (airlinesPenalty !== undefined) updateData.airlinesPenalty = parseFloat(airlinesPenalty);
    if (totalCharge !== undefined) updateData.totalCharge = parseFloat(totalCharge);
    if (status) updateData.status = status;
    if (remarks) updateData.remarks = remarks;

    const result = await collection.updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Reissue record not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'রিইস্যু তথ্য আপডেট করা হয়েছে'
    });
  } catch (error) {
    console.error('Error updating Reissue record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete Reissue record
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const db = await getDb();
    const collection = db.collection('air_ticket_reissues');

    const query = {
      _id: new ObjectId(id),
      ...getBranchFilter(session)
    };

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Reissue record not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'রিইস্যু রেকর্ড মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    console.error('Error deleting Reissue record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
