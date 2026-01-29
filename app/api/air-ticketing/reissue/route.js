import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBranchFilter, getBranchInfo } from '@/lib/branchHelper';

// GET - Fetch all Reissue records
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const db = await getDb();
    const collection = db.collection('air_ticket_reissues');
    
    // Build query with branch filter
    const branchFilter = getBranchFilter(session);
    const query = { ...branchFilter };

    if (search) {
      query.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { pnr: { $regex: search, $options: 'i' } },
        { passengerName: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await collection.countDocuments(query);
    
    const reissues = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: reissues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching Reissue records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Reissue records' },
      { status: 500 }
    );
  }
}

// POST - Create new Reissue record
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Validation
    if (!ticketNumber) {
      return NextResponse.json(
        { error: 'টিকেট নম্বর আবশ্যক' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('air_ticket_reissues');
    
    // Get branch info from session
    const branchInfo = getBranchInfo(session);

    const newRecord = {
      ticketNumber,
      pnr: pnr || '',
      passengerName: passengerName || '',
      vendorId: vendorId || '',
      vendorName: vendorName || '',
      fareDifference: parseFloat(fareDifference) || 0,
      taxDifference: parseFloat(taxDifference) || 0,
      serviceFee: parseFloat(serviceFee) || 0,
      airlinesPenalty: parseFloat(airlinesPenalty) || 0,
      totalCharge: parseFloat(totalCharge) || 0,
      status: status || 'Pending',
      remarks: remarks || '',
      reissueDate: new Date(),
      branchId: branchInfo.branchId,
      branchName: branchInfo.branchName,
      createdBy: session.user.id || session.user.email,
      createdByName: session.user.name || session.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newRecord);

    return NextResponse.json({
      success: true,
      message: 'রিইস্যু রেকর্ড সফলভাবে তৈরি হয়েছে',
      data: { ...newRecord, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating Reissue record:', error);
    return NextResponse.json(
      { error: 'রিইস্যু তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
