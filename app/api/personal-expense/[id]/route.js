import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/mongodb';

// GET single personal expense profile
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('personal_expense_profiles');

    let item = null;
    if (ObjectId.isValid(id)) {
      item = await collection.findOne({ _id: new ObjectId(id) });
    }
    if (!item) {
      item = await collection.findOne({ _id: id });
    }

    if (!item) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const formatted = {
      id: item._id.toString(),
      _id: item._id.toString(),
      name: item.name || '',
      fatherName: item.fatherName || '',
      motherName: item.motherName || '',
      relationship: item.relationship || '',
      mobile: item.mobile || '',
      photo: item.photo || '',
      createdAt: item.createdAt ? item.createdAt.toISOString() : item._id.getTimestamp().toISOString(),
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null
    };

    return NextResponse.json({ success: true, item: formatted, data: formatted }, { status: 200 });
  } catch (error) {
    console.error('Error fetching personal expense profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal expense profile', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update personal expense profile
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('personal_expense_profiles');

    const update = {
      name: body.name?.trim() || '',
      fatherName: body.fatherName || '',
      motherName: body.motherName || '',
      relationship: body.relationship?.trim() || '',
      mobile: body.mobile?.trim() || '',
      photo: body.photo?.trim() || '',
      updatedAt: new Date()
    };

    if (!update.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!update.relationship) {
      return NextResponse.json({ error: 'Relationship is required' }, { status: 400 });
    }
    if (!update.mobile) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }
    if (!update.photo) {
      return NextResponse.json({ error: 'Photo is required' }, { status: 400 });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await collection.updateOne(filter, { $set: update });

    if (!result.matchedCount) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating personal expense profile:', error);
    return NextResponse.json(
      { error: 'Failed to update personal expense profile', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE personal expense profile
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    if (!id) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }
    const db = await getDb();
    const collection = db.collection('personal_expense_profiles');
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await collection.deleteOne(filter);
    if (!result.deletedCount) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting personal expense profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete personal expense profile', message: error.message },
      { status: 500 }
    );
  }
}
