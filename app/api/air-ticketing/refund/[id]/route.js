import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBranchFilter } from '@/lib/branchHelper';
import { ObjectId } from 'mongodb';

// GET - Fetch single Refund record
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const db = await getDb();
    const collection = db.collection('air_ticket_refunds');

    const query = {
      _id: new ObjectId(id),
      ...getBranchFilter(session)
    };

    const refund = await collection.findOne(query);

    if (!refund) {
      return NextResponse.json({ error: 'Refund record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: refund });
  } catch (error) {
    console.error('Error fetching Refund record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update Refund record
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
      refundAmount,
      serviceCharge,
      customerName,
      refundMethod,
      reason,
      status 
    } = body;

    const db = await getDb();
    const collection = db.collection('air_ticket_refunds');

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
    if (customerName) updateData.customerName = customerName;
    if (refundAmount) updateData.refundAmount = parseFloat(refundAmount);
    if (serviceCharge !== undefined) updateData.serviceCharge = parseFloat(serviceCharge);
    if (refundMethod) updateData.refundMethod = refundMethod;
    if (reason) updateData.reason = reason;
    if (status) updateData.status = status;

    const result = await collection.updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Refund record not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'রিফান্ড তথ্য আপডেট করা হয়েছে'
    });
  } catch (error) {
    console.error('Error updating Refund record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete Refund record
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const db = await getDb();
    const collection = db.collection('air_ticket_refunds');

    const query = {
      _id: new ObjectId(id),
      ...getBranchFilter(session)
    };

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Refund record not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'রিফান্ড রেকর্ড মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    console.error('Error deleting Refund record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
