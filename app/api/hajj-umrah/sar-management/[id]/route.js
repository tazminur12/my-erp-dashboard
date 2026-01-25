import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBranchFilter } from '@/lib/branchHelper';
import { ObjectId } from 'mongodb';

// GET - Fetch single SAR management record
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('sar_management');
    
    const branchFilter = getBranchFilter(session);
    const query = { _id: new ObjectId(id), ...branchFilter };

    const record = await collection.findOne(query);

    if (!record) {
      return NextResponse.json({ error: 'রেকর্ড খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching SAR record:', error);
    return NextResponse.json(
      { error: 'রেকর্ড লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// PUT - Update SAR management record
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
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
    
    const branchFilter = getBranchFilter(session);
    const query = { _id: new ObjectId(id), ...branchFilter };

    // Check if record exists
    const existingRecord = await collection.findOne(query);
    if (!existingRecord) {
      return NextResponse.json({ error: 'রেকর্ড খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    const updateData = {
      packageName,
      transactionName: transactionName || packageName,
      year: year.toString(),
      sarRate: parseFloat(sarRate),
      description: description || '',
      status: status || 'Active',
      updatedBy: session.user.id || session.user.email,
      updatedByName: session.user.name || session.user.email,
      updatedAt: new Date()
    };

    await collection.updateOne(query, { $set: updateData });

    return NextResponse.json({
      success: true,
      message: 'SAR রেকর্ড সফলভাবে আপডেট হয়েছে',
      data: { ...existingRecord, ...updateData }
    });
  } catch (error) {
    console.error('Error updating SAR record:', error);
    return NextResponse.json(
      { error: 'রেকর্ড আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// DELETE - Delete SAR management record
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('sar_management');
    
    const branchFilter = getBranchFilter(session);
    const query = { _id: new ObjectId(id), ...branchFilter };

    // Check if record exists
    const existingRecord = await collection.findOne(query);
    if (!existingRecord) {
      return NextResponse.json({ error: 'রেকর্ড খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    await collection.deleteOne(query);

    return NextResponse.json({
      success: true,
      message: 'SAR রেকর্ড সফলভাবে মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    console.error('Error deleting SAR record:', error);
    return NextResponse.json(
      { error: 'রেকর্ড মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
