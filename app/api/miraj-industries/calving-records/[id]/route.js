import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single calving record
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Calving record ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const calvingCollection = db.collection('calving_records');
    const cattleCollection = db.collection('cattle');

    let record;
    try {
      record = await calvingCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid calving record ID' },
        { status: 400 }
      );
    }

    if (!record) {
      return NextResponse.json(
        { error: 'Calving record not found' },
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
      calvingDate: record.calvingDate,
      calfGender: record.calfGender || '',
      calfWeight: Number(record.calfWeight) || 0,
      calfHealth: record.calfHealth || 'healthy',
      calvingType: record.calvingType || 'normal',
      complications: record.complications || '',
      notes: record.notes || '',
      calfId: record.calfId || '',
      createdAt: record.createdAt ? record.createdAt.toISOString() : record._id.getTimestamp().toISOString(),
      updatedAt: record.updatedAt ? record.updatedAt.toISOString() : record.createdAt ? record.createdAt.toISOString() : record._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      success: true,
      record: formattedRecord,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching calving record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calving record', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update calving record
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Calving record ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const calvingCollection = db.collection('calving_records');

    // Find record
    let record;
    try {
      record = await calvingCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid calving record ID' },
        { status: 400 }
      );
    }

    if (!record) {
      return NextResponse.json(
        { error: 'Calving record not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      calvingDate: body.calvingDate || record.calvingDate,
      calfGender: body.calfGender || record.calfGender || '',
      calfWeight: body.calfWeight !== undefined ? Number(body.calfWeight) : (Number(record.calfWeight) || 0),
      calfHealth: body.calfHealth || record.calfHealth || 'healthy',
      calvingType: body.calvingType || record.calvingType || 'normal',
      complications: body.complications || record.complications || '',
      notes: body.notes || record.notes || '',
      calfId: body.calfId || record.calfId || '',
      updatedAt: new Date(),
    };

    // Update record
    await calvingCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated record with cattle name
    const cattleCollection = db.collection('cattle');
    const cow = await cattleCollection.findOne({ _id: new ObjectId(record.cowId) });

    const updatedRecord = await calvingCollection.findOne({
      _id: new ObjectId(id)
    });

    const formattedRecord = {
      id: updatedRecord._id.toString(),
      _id: updatedRecord._id.toString(),
      cowId: updatedRecord.cowId,
      cowName: cow?.name || 'Unknown',
      ...updateData,
      createdAt: updatedRecord.createdAt.toISOString(),
      updatedAt: updateData.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Calving record updated successfully',
      record: formattedRecord,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating calving record:', error);
    return NextResponse.json(
      { error: 'Failed to update calving record', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE calving record
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Calving record ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const calvingCollection = db.collection('calving_records');

    // Find and delete record
    let result;
    try {
      result = await calvingCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid calving record ID' },
        { status: 400 }
      );
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Calving record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Calving record deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting calving record:', error);
    return NextResponse.json(
      { error: 'Failed to delete calving record', message: error.message },
      { status: 500 }
    );
  }
}
