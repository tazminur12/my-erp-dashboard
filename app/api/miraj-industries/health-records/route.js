import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all health records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cattleId = searchParams.get('cattleId') || '';
    const q = searchParams.get('q') || '';
    const date = searchParams.get('date') || '';
    const status = searchParams.get('status') || '';

    const db = await getDb();
    const healthCollection = db.collection('health_records');
    const cattleCollection = db.collection('cattle');

    // Build query
    const query = {};
    if (cattleId) {
      query.cattleId = cattleId;
    }
    if (date) {
      query.date = date;
    }
    if (status) {
      query.status = status;
    }

    const records = await healthCollection
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
        condition: record.condition || '',
        symptoms: record.symptoms || '',
        treatment: record.treatment || '',
        medication: record.medication || '',
        dosage: record.dosage || '',
        duration: record.duration || '',
        vetName: record.vetName || '',
        notes: record.notes || '',
        status: record.status || 'under_treatment',
        createdAt: record.createdAt ? record.createdAt.toISOString() : record._id.getTimestamp().toISOString(),
      };
    });

    // Apply search filter
    if (q) {
      const searchLower = q.toLowerCase();
      formattedRecords = formattedRecords.filter(record =>
        record.cattleName.toLowerCase().includes(searchLower) ||
        record.cattleDisplayId.toLowerCase().includes(searchLower) ||
        (record.condition && record.condition.toLowerCase().includes(searchLower)) ||
        (record.vetName && record.vetName.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      data: formattedRecords,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching health records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health records', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new health record
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.cattleId || !body.date || !body.condition) {
      return NextResponse.json(
        { error: 'Cattle ID, date, and condition are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const healthCollection = db.collection('health_records');

    // Create new health record
    const newRecord = {
      cattleId: body.cattleId.trim(),
      date: body.date,
      condition: body.condition.trim(),
      symptoms: body.symptoms || '',
      treatment: body.treatment || '',
      medication: body.medication || '',
      dosage: body.dosage || '',
      duration: body.duration || '',
      vetName: body.vetName || '',
      notes: body.notes || '',
      status: body.status || 'under_treatment',
      createdAt: new Date(),
    };

    const result = await healthCollection.insertOne(newRecord);

    const formattedRecord = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newRecord,
    };

    return NextResponse.json({
      success: true,
      message: 'Health record created successfully',
      record: formattedRecord,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating health record:', error);
    return NextResponse.json(
      { error: 'Failed to create health record', message: error.message },
      { status: 500 }
    );
  }
}
