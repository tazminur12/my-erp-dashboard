import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all calving records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const cowId = searchParams.get('cowId') || '';

    const db = await getDb();
    const calvingCollection = db.collection('calving_records');
    const cattleCollection = db.collection('cattle');

    // Build query
    const query = {};
    if (cowId) {
      query.cowId = cowId;
    }
    if (from && to) {
      query.calvingDate = {
        $gte: from,
        $lte: to
      };
    } else if (from) {
      query.calvingDate = { $gte: from };
    } else if (to) {
      query.calvingDate = { $lte: to };
    }

    let calvingRecords = await calvingCollection
      .find(query)
      .sort({ calvingDate: -1 })
      .toArray();

    // Get cattle names
    const cattleIds = [...new Set(calvingRecords.map(r => r.cowId))];
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
    const formattedRecords = calvingRecords
      .map(record => {
        const cow = cattleMap[record.cowId];
        return {
          id: record._id.toString(),
          _id: record._id.toString(),
          cowId: record.cowId,
          cowName: cow?.name || 'Unknown',
          calvingDate: record.calvingDate,
          calfGender: record.calfGender || '',
          calfWeight: Number(record.calfWeight) || 0,
          calfHealth: record.calfHealth || 'healthy',
          calvingType: record.calvingType || 'normal',
          complications: record.complications || '',
          notes: record.notes || '',
          calfId: record.calfId || '',
          createdAt: record.createdAt ? record.createdAt.toISOString() : record._id.getTimestamp().toISOString(),
        };
      })
      .filter(record => {
        if (!q) return true;
        const searchLower = q.toLowerCase();
        return (
          record.cowName.toLowerCase().includes(searchLower) ||
          record.calfId.toLowerCase().includes(searchLower) ||
          record.calfGender.toLowerCase().includes(searchLower)
        );
      });

    return NextResponse.json({
      success: true,
      records: formattedRecords,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching calving records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calving records', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new calving record
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.cowId) {
      return NextResponse.json(
        { error: 'Cow ID is required' },
        { status: 400 }
      );
    }

    if (!body.calvingDate) {
      return NextResponse.json(
        { error: 'Calving date is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const calvingCollection = db.collection('calving_records');

    const newCalving = {
      cowId: body.cowId,
      calvingDate: body.calvingDate,
      calfGender: body.calfGender || '',
      calfWeight: Number(body.calfWeight) || 0,
      calfHealth: body.calfHealth || 'healthy',
      calvingType: body.calvingType || 'normal',
      complications: body.complications || '',
      notes: body.notes || '',
      calfId: body.calfId || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await calvingCollection.insertOne(newCalving);

    // Fetch created record with cattle name
    const cattleCollection = db.collection('cattle');
    const { ObjectId } = await import('mongodb');
    const cow = await cattleCollection.findOne({ _id: new ObjectId(body.cowId) });

    const createdRecord = await calvingCollection.findOne({
      _id: result.insertedId
    });

    const formattedRecord = {
      id: createdRecord._id.toString(),
      _id: createdRecord._id.toString(),
      cowId: createdRecord.cowId,
      cowName: cow?.name || 'Unknown',
      ...newCalving,
      createdAt: createdRecord.createdAt.toISOString(),
      updatedAt: createdRecord.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Calving record created successfully',
      record: formattedRecord,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating calving record:', error);
    return NextResponse.json(
      { error: 'Failed to create calving record', message: error.message },
      { status: 500 }
    );
  }
}
