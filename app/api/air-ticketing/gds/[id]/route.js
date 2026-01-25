import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBranchFilter } from '@/lib/branchHelper';
import { ObjectId } from 'mongodb';

// GET - Fetch single GDS record
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
    const collection = db.collection('gds_systems');
    
    const branchFilter = getBranchFilter(session);
    const query = { _id: new ObjectId(id), ...branchFilter };

    const record = await collection.findOne(query);

    if (!record) {
      return NextResponse.json({ error: 'GDS খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    // Get ticket stats for this GDS
    const ticketsCollection = db.collection('tickets');
    const ticketStats = await ticketsCollection.aggregate([
      { $match: { gdsId: id, ...branchFilter } },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalCommission: { $sum: '$commission' }
        }
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      data: {
        ...record,
        stats: ticketStats[0] || { totalTickets: 0, totalRevenue: 0, totalCommission: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching GDS record:', error);
    return NextResponse.json(
      { error: 'GDS লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// PUT - Update GDS record
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
    
    const branchFilter = getBranchFilter(session);
    const query = { _id: new ObjectId(id), ...branchFilter };

    // Check if record exists
    const existingRecord = await collection.findOne(query);
    if (!existingRecord) {
      return NextResponse.json({ error: 'GDS খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    // Check for duplicate GDS code if changed
    if (gdsCode && gdsCode.toUpperCase() !== existingRecord.gdsCode) {
      const duplicate = await collection.findOne({ 
        gdsCode: gdsCode.toUpperCase(),
        _id: { $ne: new ObjectId(id) },
        ...branchFilter
      });
      if (duplicate) {
        return NextResponse.json(
          { error: 'এই GDS কোড আগে থেকেই আছে' },
          { status: 400 }
        );
      }
    }

    const updateData = {
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
      updatedBy: session.user.id || session.user.email,
      updatedByName: session.user.name || session.user.email,
      updatedAt: new Date()
    };

    await collection.updateOne(query, { $set: updateData });

    return NextResponse.json({
      success: true,
      message: 'GDS সফলভাবে আপডেট হয়েছে',
      data: { ...existingRecord, ...updateData }
    });
  } catch (error) {
    console.error('Error updating GDS record:', error);
    return NextResponse.json(
      { error: 'GDS আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// DELETE - Delete GDS record
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
    const collection = db.collection('gds_systems');
    
    const branchFilter = getBranchFilter(session);
    const query = { _id: new ObjectId(id), ...branchFilter };

    // Check if record exists
    const existingRecord = await collection.findOne(query);
    if (!existingRecord) {
      return NextResponse.json({ error: 'GDS খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    // Check if GDS is used in any tickets
    const ticketsCollection = db.collection('tickets');
    const ticketCount = await ticketsCollection.countDocuments({ gdsId: id });
    
    if (ticketCount > 0) {
      return NextResponse.json(
        { error: `এই GDS ${ticketCount}টি টিকেটে ব্যবহৃত হয়েছে। প্রথমে টিকেটগুলো সরান।` },
        { status: 400 }
      );
    }

    await collection.deleteOne(query);

    return NextResponse.json({
      success: true,
      message: 'GDS সফলভাবে মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    console.error('Error deleting GDS record:', error);
    return NextResponse.json(
      { error: 'GDS মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
