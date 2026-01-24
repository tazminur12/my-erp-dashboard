import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE feed usage
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Usage ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const feedUsagesCollection = db.collection('feed_usages');
    const feedStocksCollection = db.collection('feed_stocks');

    // Find usage record
    let usage;
    try {
      usage = await feedUsagesCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid usage ID' },
        { status: 400 }
      );
    }

    if (!usage) {
      return NextResponse.json(
        { error: 'Usage record not found' },
        { status: 404 }
      );
    }

    // Restore stock
    await feedStocksCollection.updateOne(
      { feedTypeId: usage.feedTypeId },
      {
        $inc: { currentStock: Number(usage.quantity) },
        $set: { updatedAt: new Date() }
      }
    );

    // Delete usage record
    const result = await feedUsagesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Usage record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feed usage deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting feed usage:', error);
    return NextResponse.json(
      { error: 'Failed to delete feed usage', message: error.message },
      { status: 500 }
    );
  }
}
