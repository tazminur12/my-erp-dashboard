import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all milk production records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cattleId = searchParams.get('cattleId') || '';
    const q = searchParams.get('q') || '';
    const date = searchParams.get('date') || '';

    const db = await getDb();
    const milkCollection = db.collection('milk_production_records');
    const cattleCollection = db.collection('cattle');

    // Build query
    const query = {};
    if (cattleId) {
      query.cattleId = cattleId;
    }
    if (date) {
      query.date = date;
    }

    let records = await milkCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    // Get cattle names
    const cattleIds = [...new Set(records.map(r => r.cattleId))];
    const cattleMap = {};
    if (cattleIds.length > 0) {
      const { ObjectId } = await import('mongodb');
      const cattle = await cattleCollection.find({
        _id: { $in: cattleIds.map(id => {
          try {
            return new ObjectId(id);
          } catch {
            return id;
          }
        }) }
      }).toArray();
      cattle.forEach(c => {
        cattleMap[c._id.toString()] = c;
      });
    }

    // Format and filter by search term
    const formattedRecords = records
      .map((record) => {
        const cattle = cattleMap[record.cattleId];
        const morning = Number(record.morningQuantity) || 0;
        const afternoon = Number(record.afternoonQuantity) || 0;
        const evening = Number(record.eveningQuantity) || 0;
        const total = morning + afternoon + evening;
        
        return {
          id: record._id.toString(),
          _id: record._id.toString(),
          cattleId: record.cattleId || '',
          cattleName: cattle?.name || 'Unknown',
          date: record.date || '',
          morningQuantity: morning,
          afternoonQuantity: afternoon,
          eveningQuantity: evening,
          totalQuantity: Number(record.totalQuantity) || total,
          quality: record.quality || 'good',
          notes: record.notes || '',
          createdAt: record.createdAt ? record.createdAt.toISOString() : record._id.getTimestamp().toISOString(),
        };
      })
      .filter(record => {
        if (!q) return true;
        const searchLower = q.toLowerCase();
        return (
          record.cattleName.toLowerCase().includes(searchLower) ||
          record.cattleId.toLowerCase().includes(searchLower)
        );
      });

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      data: formattedRecords,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching milk production records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milk production records', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new milk production record
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.cattleId) {
      return NextResponse.json(
        { error: 'Cattle ID is required' },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const milkCollection = db.collection('milk_production_records');
    const cattleCollection = db.collection('cattle');

    // Check if record already exists for this cattle and date
    const existingRecord = await milkCollection.findOne({
      cattleId: body.cattleId,
      date: body.date
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Milk production record already exists for this cattle on this date' },
        { status: 400 }
      );
    }

    const morning = Number(body.morningQuantity) || 0;
    const afternoon = Number(body.afternoonQuantity) || 0;
    const evening = Number(body.eveningQuantity) || 0;
    const total = morning + afternoon + evening;

    // Create new record
    const newRecord = {
      cattleId: body.cattleId,
      date: body.date,
      morningQuantity: morning,
      afternoonQuantity: afternoon,
      eveningQuantity: evening,
      totalQuantity: total,
      quality: body.quality || 'good',
      notes: body.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await milkCollection.insertOne(newRecord);

    // Get cattle name
    const { ObjectId } = await import('mongodb');
    const cattle = await cattleCollection.findOne({ _id: new ObjectId(body.cattleId) });

    // Fetch created record
    const createdRecord = await milkCollection.findOne({
      _id: result.insertedId
    });

    // Format record for frontend
    const formattedRecord = {
      id: createdRecord._id.toString(),
      _id: createdRecord._id.toString(),
      cattleId: createdRecord.cattleId,
      cattleName: cattle?.name || 'Unknown',
      ...newRecord,
      createdAt: createdRecord.createdAt.toISOString(),
      updatedAt: createdRecord.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Milk production record created successfully',
      record: formattedRecord,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating milk production record:', error);
    return NextResponse.json(
      { error: 'Failed to create milk production record', message: error.message },
      { status: 500 }
    );
  }
}
