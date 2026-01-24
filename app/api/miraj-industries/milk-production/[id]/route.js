import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE milk production record
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const milkCollection = db.collection('milk_production_records');

    // Find and delete record
    let result;
    try {
      result = await milkCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid record ID' },
        { status: 400 }
      );
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Milk production record deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting milk production record:', error);
    return NextResponse.json(
      { error: 'Failed to delete milk production record', message: error.message },
      { status: 500 }
    );
  }
}
