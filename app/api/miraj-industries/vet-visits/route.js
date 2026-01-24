import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all vet visit records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cattleId = searchParams.get('cattleId') || '';
    const q = searchParams.get('q') || '';
    const date = searchParams.get('date') || '';

    const db = await getDb();
    const vetVisitCollection = db.collection('vet_visit_records');
    const cattleCollection = db.collection('cattle');

    // Build query
    const query = {};
    if (cattleId) {
      query.cattleId = cattleId;
    }
    if (date) {
      query.date = date;
    }

    const records = await vetVisitCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    // Get cattle names for records
    const cattleIds = [...new Set(records.map(r => r.cattleId))];
    const cattleDocs = await cattleCollection.find({
      _id: { $in: cattleIds.map(id => new ObjectId(id)) }
    }).toArray();
    const cattleMap = {};
    cattleDocs.forEach(cow => {
      cattleMap[cow._id.toString()] = {
        name: cow.name || '',
        tagNumber: cow.tagNumber || ''
      };
    });

    // Format records for frontend
    let formattedRecords = records.map((record) => {
      const cattle = cattleMap[record.cattleId] || {};
      return {
        id: record._id.toString(),
        _id: record._id.toString(),
        cattleId: record.cattleId || '',
        cattleName: cattle.name || '',
        cattleDisplayId: cattle.tagNumber || record.cattleId || '',
        date: record.date || '',
        visitType: record.visitType || '',
        vetName: record.vetName || '',
        clinic: record.clinic || '',
        purpose: record.purpose || '',
        diagnosis: record.diagnosis || '',
        treatment: record.treatment || '',
        followUpDate: record.followUpDate || '',
        cost: Number(record.cost) || 0,
        notes: record.notes || '',
        createdAt: record.createdAt ? record.createdAt.toISOString() : record._id.getTimestamp().toISOString(),
      };
    });

    // Apply search filter
    if (q) {
      const searchLower = q.toLowerCase();
      formattedRecords = formattedRecords.filter(record =>
        record.cattleName.toLowerCase().includes(searchLower) ||
        record.cattleDisplayId.toLowerCase().includes(searchLower) ||
        (record.visitType && record.visitType.toLowerCase().includes(searchLower)) ||
        (record.vetName && record.vetName.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      data: formattedRecords,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching vet visit records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vet visit records', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new vet visit record
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.cattleId || !body.date || !body.vetName) {
      return NextResponse.json(
        { error: 'Cattle ID, date, and vet name are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const vetVisitCollection = db.collection('vet_visit_records');

    // Create new vet visit record
    const newRecord = {
      cattleId: body.cattleId.trim(),
      date: body.date,
      visitType: body.visitType || '',
      vetName: body.vetName.trim(),
      clinic: body.clinic || '',
      purpose: body.purpose || '',
      diagnosis: body.diagnosis || '',
      treatment: body.treatment || '',
      followUpDate: body.followUpDate || '',
      cost: Number(body.cost) || 0,
      notes: body.notes || '',
      createdAt: new Date(),
    };

    const result = await vetVisitCollection.insertOne(newRecord);

    const formattedRecord = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newRecord,
    };

    return NextResponse.json({
      success: true,
      message: 'Vet visit record created successfully',
      record: formattedRecord,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vet visit record:', error);
    return NextResponse.json(
      { error: 'Failed to create vet visit record', message: error.message },
      { status: 500 }
    );
  }
}
