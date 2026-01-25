import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBranchFilter, getBranchInfo } from '@/lib/branchHelper';
import { ObjectId } from 'mongodb';

// GET - Fetch all GDS records
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const search = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';
    const provider = searchParams.get('provider') || '';

    const db = await getDb();
    const collection = db.collection('gds_systems');
    
    // Build query with branch filter
    const branchFilter = getBranchFilter(session);
    const query = { ...branchFilter };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { gdsCode: { $regex: search, $options: 'i' } },
        { pccCode: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (provider && provider !== 'All') {
      query.provider = provider;
    }

    const skip = (page - 1) * limit;
    const total = await collection.countDocuments(query);
    
    const gdsRecords = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get unique providers for filter
    const providers = await collection.distinct('provider', branchFilter);

    return NextResponse.json({
      success: true,
      data: gdsRecords,
      providers: providers.filter(Boolean),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching GDS records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GDS records' },
      { status: 500 }
    );
  }
}

// POST - Create new GDS record
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      gdsCode, 
      provider,
      pccCode,
      queueNumber,
      commissionRate,
      contactPerson,
      contactPhone,
      contactEmail,
      accountId,
      signInId,
      remarks,
      status 
    } = body;

    // Validation
    if (!name || !provider) {
      return NextResponse.json(
        { error: 'GDS নাম এবং Provider আবশ্যক' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('gds_systems');
    
    // Get branch info from session
    const branchInfo = getBranchInfo(session);

    // Check for duplicate GDS code if provided
    if (gdsCode) {
      const existing = await collection.findOne({ 
        gdsCode: gdsCode.toUpperCase(),
        ...getBranchFilter(session)
      });
      if (existing) {
        return NextResponse.json(
          { error: 'এই GDS কোড আগে থেকেই আছে' },
          { status: 400 }
        );
      }
    }

    const newRecord = {
      name,
      gdsCode: gdsCode?.toUpperCase() || '',
      provider,
      pccCode: pccCode || '',
      queueNumber: queueNumber || '',
      commissionRate: commissionRate ? parseFloat(commissionRate) : 0,
      contactPerson: contactPerson || '',
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      accountId: accountId || '',
      signInId: signInId || '',
      remarks: remarks || '',
      status: status || 'Active',
      ticketCount: 0,
      totalRevenue: 0,
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
      message: 'GDS সফলভাবে তৈরি হয়েছে',
      data: { ...newRecord, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating GDS record:', error);
    return NextResponse.json(
      { error: 'GDS তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
