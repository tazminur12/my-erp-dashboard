import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const db = await getDb();
    const markup = await db.collection('markups').findOne({ _id: new ObjectId(id) });

    if (!markup) {
      return NextResponse.json({ success: false, error: 'Markup not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: markup });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const db = await getDb();
    
    // Remove _id from body to avoid immutable field error
    const { _id, ...updateFields } = body;

    const updateData = {
      ...updateFields,
      updatedAt: new Date()
    };

    const result = await db.collection('markups').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Markup not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Markup updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('markups').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Markup not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Markup deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
