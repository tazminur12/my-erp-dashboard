import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single breeding record
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Breeding record ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const breedingCollection = db.collection('breeding_records');
    const cattleCollection = db.collection('cattle');

    let record;
    try {
      record = await breedingCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid breeding record ID' },
        { status: 400 }
      );
    }

    if (!record) {
      return NextResponse.json(
        { error: 'Breeding record not found' },
        { status: 404 }
      );
    }

    // Get cattle name
    const cow = await cattleCollection.findOne({ _id: new ObjectId(record.cowId) });

    const formattedRecord = {
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
      updatedAt: record.updatedAt ? record.updatedAt.toISOString() : record.createdAt ? record.createdAt.toISOString() : record._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      success: true,
      record: formattedRecord,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching breeding record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breeding record', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update breeding record
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Breeding record ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const breedingCollection = db.collection('breeding_records');

    // Find record
    let record;
    try {
      record = await breedingCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid breeding record ID' },
        { status: 400 }
      );
    }

    if (!record) {
      return NextResponse.json(
        { error: 'Breeding record not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      breedingDate: body.breedingDate || record.breedingDate,
      method: body.method || record.method || 'natural',
      success: body.success || record.success || 'pending',
      notes: body.notes || record.notes || '',
      expectedCalvingDate: body.expectedCalvingDate || record.expectedCalvingDate || '',
      updatedAt: new Date(),
    };

    // Update record
    await breedingCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated record with cattle name
    const cattleCollection = db.collection('cattle');
    const cow = await cattleCollection.findOne({ _id: new ObjectId(record.cowId) });

    const updatedRecord = await breedingCollection.findOne({
      _id: new ObjectId(id)
    });

    const formattedRecord = {
      id: updatedRecord._id.toString(),
      _id: updatedRecord._id.toString(),
      cowId: updatedRecord.cowId,
      cowName: cow?.name || 'Unknown',
      ...updateData,
      bullName: updatedRecord.bullName || '',
      bullId: updatedRecord.bullId || '',
      createdAt: updatedRecord.createdAt.toISOString(),
      updatedAt: updateData.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Breeding record updated successfully',
      record: formattedRecord,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating breeding record:', error);
    return NextResponse.json(
      { error: 'Failed to update breeding record', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE breeding record
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Breeding record ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const breedingCollection = db.collection('breeding_records');

    // Find and delete record
    let result;
    try {
      result = await breedingCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid breeding record ID' },
        { status: 400 }
      );
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Breeding record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Breeding record deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting breeding record:', error);
    return NextResponse.json(
      { error: 'Failed to delete breeding record', message: error.message },
      { status: 500 }
    );
  }
}
