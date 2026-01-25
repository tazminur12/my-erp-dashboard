import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBranchFilter, getBranchInfo } from '@/lib/branchHelper';
import { ObjectId } from 'mongodb';

// GET - Fetch all SAR management records
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
    const year = searchParams.get('year') || '';
    const status = searchParams.get('status') || '';

    const db = await getDb();
    const collection = db.collection('sar_management');
    
    // Build query with branch filter
    const branchFilter = getBranchFilter(session);
    const query = { ...branchFilter };

    if (search) {
      query.$or = [
        { packageName: { $regex: search, $options: 'i' } },
        { transactionName: { $regex: search, $options: 'i' } }
      ];
    }

    if (year) {
      query.year = year;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await collection.countDocuments(query);
    
    const sarRecords = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: sarRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching SAR management:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SAR management records' },
      { status: 500 }
    );
  }
}

// POST - Create new SAR management record
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { packageName, transactionName, year, sarRate, description, status } = body;

    // Validation
    if (!packageName || !year || !sarRate) {
      return NextResponse.json(
        { error: 'প্যাকেজের নাম, সাল এবং সৌদি রিয়াল রেট আবশ্যক' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('sar_management');
    
    // Get branch info from session
    const branchInfo = getBranchInfo(session);

    const newRecord = {
      packageName,
      transactionName: transactionName || packageName,
      year: year.toString(),
      sarRate: parseFloat(sarRate),
      description: description || '',
      status: status || 'Active',
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
      message: 'SAR রেকর্ড সফলভাবে তৈরি হয়েছে',
      data: { ...newRecord, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating SAR management record:', error);
    return NextResponse.json(
      { error: 'SAR রেকর্ড তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
