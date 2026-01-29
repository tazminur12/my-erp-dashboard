import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single refund
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid refund ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const refundsCollection = db.collection('hajj_umrah_refunds');

    const refund = await refundsCollection.findOne({ _id: new ObjectId(id) });

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      refund: {
        ...refund,
        id: refund._id.toString()
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching refund:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refund', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update refund
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid refund ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const refundsCollection = db.collection('hajj_umrah_refunds');

    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    // Remove _id from update data if present
    delete updateData._id;
    delete updateData.id;
    delete updateData.refundId; // Don't allow changing ID
    delete updateData.createdAt;

    const result = await refundsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Refund updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating refund:', error);
    return NextResponse.json(
      { error: 'Failed to update refund', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE refund
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid refund ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const refundsCollection = db.collection('hajj_umrah_refunds');

    const result = await refundsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Refund deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting refund:', error);
    return NextResponse.json(
      { error: 'Failed to delete refund', message: error.message },
      { status: 500 }
    );
  }
}
