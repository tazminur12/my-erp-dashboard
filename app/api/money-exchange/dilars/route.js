import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all dilars (dealers) for money exchange
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = await getDb();
    const dilarsCollection = db.collection('dilars');
    
    // If dilars collection doesn't exist, try vendors collection
    let collection = dilarsCollection;
    try {
      await dilarsCollection.findOne({});
    } catch {
      collection = db.collection('vendors');
    }

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { ownerName: { $regex: search, $options: 'i' } },
        { contactNo: { $regex: search, $options: 'i' } },
        { tradeLocation: { $regex: search, $options: 'i' } },
        { tradeName: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await collection.countDocuments(query);
    const skip = (page - 1) * limit;

    const dilars = await collection
      .find(query)
      .sort({ createdAt: -1, created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format dilars for frontend
    const formattedDilars = dilars.map(dilar => ({
      id: dilar._id.toString(),
      _id: dilar._id.toString(),
      contactNo: dilar.contactNo || dilar.contactNo || '',
      ownerName: dilar.ownerName || '',
      tradeName: dilar.tradeName || '',
      tradeLocation: dilar.tradeLocation || '',
      nid: dilar.nid || '',
      logo: dilar.logo || dilar.profilePicture || '',
      status: dilar.status || 'active',
      createdAt: dilar.createdAt || dilar.created_at || dilar._id.getTimestamp(),
    }));

    return NextResponse.json({
      dilars: formattedDilars,
      data: formattedDilars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dilars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dilars', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new dilar
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.ownerName || !body.ownerName.trim()) {
      return NextResponse.json(
        { error: 'Owner name is required' },
        { status: 400 }
      );
    }

    if (!body.contactNo || !body.contactNo.trim()) {
      return NextResponse.json(
        { error: 'Contact number is required' },
        { status: 400 }
      );
    }

    if (!body.tradeLocation || !body.tradeLocation.trim()) {
      return NextResponse.json(
        { error: 'Trade location is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const dilarsCollection = db.collection('dilars');

    // Check if contact number already exists
    const existingDilar = await dilarsCollection.findOne({
      contactNo: body.contactNo.trim()
    });

    if (existingDilar) {
      return NextResponse.json(
        { error: 'A dilar with this contact number already exists' },
        { status: 400 }
      );
    }

    const dilar = {
      ownerName: body.ownerName.trim(),
      contactNo: body.contactNo.trim(),
      tradeLocation: body.tradeLocation.trim(),
      logo: body.logo || '',
      nid: body.nid || '',
      tradeName: body.tradeName || '',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await dilarsCollection.insertOne(dilar);

    return NextResponse.json({
      dilar: {
        ...dilar,
        id: result.insertedId.toString(),
        _id: result.insertedId.toString(),
      },
      message: 'Dilar created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating dilar:', error);
    return NextResponse.json(
      { error: 'Failed to create dilar', message: error.message },
      { status: 500 }
    );
  }
}
