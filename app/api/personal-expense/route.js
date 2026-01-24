import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all personal expense profiles
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = await getDb();
    const collection = db.collection('personal_expense_profiles');

    const query = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { fatherName: { $regex: q, $options: 'i' } },
        { motherName: { $regex: q, $options: 'i' } },
        { relationship: { $regex: q, $options: 'i' } },
        { mobile: { $regex: q, $options: 'i' } }
      ];
    }

    const total = await collection.countDocuments(query);
    const skip = (page - 1) * limit;

    const items = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const formatted = items.map((item) => ({
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
    }));

    return NextResponse.json({
      success: true,
      items: formatted,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching personal expense profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal expense profiles', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new personal expense profile
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!body.relationship || !body.relationship.trim()) {
      return NextResponse.json({ error: 'Relationship is required' }, { status: 400 });
    }
    if (!body.mobile || !body.mobile.trim()) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }
    if (!body.photo || !body.photo.trim()) {
      return NextResponse.json({ error: 'Photo is required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('personal_expense_profiles');

    const newItem = {
      name: body.name.trim(),
      fatherName: body.fatherName || '',
      motherName: body.motherName || '',
      relationship: body.relationship.trim(),
      mobile: body.mobile.trim(),
      photo: body.photo.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newItem);

    return NextResponse.json({
      success: true,
      item: { ...newItem, id: result.insertedId.toString(), _id: result.insertedId.toString() }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating personal expense profile:', error);
    return NextResponse.json(
      { error: 'Failed to create personal expense profile', message: error.message },
      { status: 500 }
    );
  }
}
