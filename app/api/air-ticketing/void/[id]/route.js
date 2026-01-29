import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET single Void record
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const db = await getDb();
    const collection = db.collection('air_ticket_voids');

    const voidRecord = await collection.findOne({ _id: new ObjectId(id) });

    if (!voidRecord) {
      return NextResponse.json({ error: 'Void record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: voidRecord });
  } catch (error) {
    console.error('Error fetching Void record:', error);
    return NextResponse.json({ error: 'Failed to fetch Void record' }, { status: 500 });
  }
}

// PUT - Update Void record
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
      voidCharge,
      status,
      remarks
    } = body;

    const db = await getDb();
    const collection = db.collection('air_ticket_voids');

    const updatedRecord = {
      ticketNumber,
      pnr,
      passengerName,
      vendorId,
      vendorName,
      voidCharge: parseFloat(voidCharge) || 0,
      status,
      remarks,
      updatedAt: new Date(),
      updatedBy: session.user.id || session.user.email
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedRecord }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Void record not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'ভয়েড রেকর্ড সফলভাবে আপডেট হয়েছে' 
    });
  } catch (error) {
    console.error('Error updating Void record:', error);
    return NextResponse.json({ error: 'Failed to update Void record' }, { status: 500 });
  }
}

// DELETE - Delete Void record
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const db = await getDb();
    const collection = db.collection('air_ticket_voids');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Void record not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'ভয়েড রেকর্ড সফলভাবে মুছে ফেলা হয়েছে' 
    });
  } catch (error) {
    console.error('Error deleting Void record:', error);
    return NextResponse.json({ error: 'Failed to delete Void record' }, { status: 500 });
  }
}
