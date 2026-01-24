import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all breeding records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const cowId = searchParams.get('cowId') || '';

    const db = await getDb();
    const breedingCollection = db.collection('breeding_records');
    const cattleCollection = db.collection('cattle');

    // Build query
    const query = {};
    if (cowId) {
      query.cowId = cowId;
    }
    if (from && to) {
      query.breedingDate = {
        $gte: from,
        $lte: to
      };
    } else if (from) {
      query.breedingDate = { $gte: from };
    } else if (to) {
      query.breedingDate = { $lte: to };
    }

    let breedingRecords = await breedingCollection
      .find(query)
      .sort({ breedingDate: -1 })
      .toArray();

    // Get cattle names
    const cattleIds = [...new Set(breedingRecords.map(r => r.cowId))];
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
    const formattedRecords = breedingRecords
      .map(record => {
        const cow = cattleMap[record.cowId];
        return {
          id: record._id.toString(),
          _id: record._id.toString(),
          cowId: record.cowId,
          cowName: cow?.name || 'Unknown',
          breedingDate: record.breedingDate,
          method: record.method || 'natural',
          success: record.success || 'pending',
          notes: record.notes || '',
          expectedCalvingDate: record.expectedCalvingDate || '',
          bullName: record.bullName || '',
          bullId: record.bullId || '',
          createdAt: record.createdAt ? record.createdAt.toISOString() : record._id.getTimestamp().toISOString(),
        };
      })
      .filter(record => {
        if (!q) return true;
        const searchLower = q.toLowerCase();
        return (
          record.cowName.toLowerCase().includes(searchLower) ||
          record.bullName.toLowerCase().includes(searchLower) ||
          record.bullId.toLowerCase().includes(searchLower) ||
          record.method.toLowerCase().includes(searchLower)
        );
      });

    return NextResponse.json({
      success: true,
      records: formattedRecords,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching breeding records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breeding records', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new breeding record
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.cowId) {
      return NextResponse.json(
        { error: 'Cow ID is required' },
        { status: 400 }
      );
    }

    if (!body.breedingDate) {
      return NextResponse.json(
        { error: 'Breeding date is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const breedingCollection = db.collection('breeding_records');

    const newBreeding = {
      cowId: body.cowId,
      breedingDate: body.breedingDate,
      method: body.method || 'natural',
      success: body.success || 'pending',
      notes: body.notes || '',
      expectedCalvingDate: body.expectedCalvingDate || '',
      bullName: body.bullName || '',
      bullId: body.bullId || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await breedingCollection.insertOne(newBreeding);

    // Fetch created record with cattle name
    const cattleCollection = db.collection('cattle');
    const { ObjectId } = await import('mongodb');
    const cow = await cattleCollection.findOne({ _id: new ObjectId(body.cowId) });

    const createdRecord = await breedingCollection.findOne({
      _id: result.insertedId
    });

    const formattedRecord = {
      id: createdRecord._id.toString(),
      _id: createdRecord._id.toString(),
      cowId: createdRecord.cowId,
      cowName: cow?.name || 'Unknown',
      ...newBreeding,
      createdAt: createdRecord.createdAt.toISOString(),
      updatedAt: createdRecord.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Breeding record created successfully',
      record: formattedRecord,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating breeding record:', error);
    return NextResponse.json(
      { error: 'Failed to create breeding record', message: error.message },
      { status: 500 }
    );
  }
}
