import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all cattle
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender'); // Optional filter by gender

    const db = await getDb();
    const cattleCollection = db.collection('cattle');

    // Build query
    const query = {};
    if (gender) {
      query.gender = gender;
    }

    const cattle = await cattleCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Format cattle for frontend
    const formattedCattle = cattle.map((cow) => ({
      id: cow._id.toString(),
      _id: cow._id.toString(),
      name: cow.name || '',
      gender: cow.gender || '',
      breed: cow.breed || '',
      age: cow.age || 0,
      weight: Number(cow.weight) || 0,
      purchaseDate: cow.purchaseDate || '',
      healthStatus: cow.healthStatus || 'healthy',
      image: cow.image || '',
      imagePublicId: cow.imagePublicId || '',
      color: cow.color || '',
      tagNumber: cow.tagNumber || '',
      purchasePrice: Number(cow.purchasePrice) || 0,
      vendor: cow.vendor || '',
      notes: cow.notes || '',
      dateOfBirth: cow.dateOfBirth || '',
      status: cow.status || 'active',
      createdAt: cow.createdAt ? cow.createdAt.toISOString() : cow._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      cattle: formattedCattle,
      data: formattedCattle,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching cattle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cattle', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new cattle
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Cattle name is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const cattleCollection = db.collection('cattle');

    // Check if tag number already exists
    if (body.tagNumber) {
      const existingCattle = await cattleCollection.findOne({
        tagNumber: body.tagNumber.trim()
      });

      if (existingCattle) {
        return NextResponse.json(
          { error: 'Cattle with this tag number already exists' },
          { status: 400 }
        );
      }
    }

    // Generate tag number if not provided
    const tagNumber = body.tagNumber || `TAG${String((await cattleCollection.countDocuments({})) + 1).padStart(3, '0')}`;

    // Create new cattle
    const newCattle = {
      name: body.name.trim(),
      breed: body.breed || '',
      age: Number(body.age) || 0,
      weight: Number(body.weight) || 0,
      purchaseDate: body.purchaseDate || '',
      healthStatus: body.healthStatus || 'healthy',
      image: body.image || '',
      imagePublicId: body.imagePublicId || '',
      gender: body.gender || 'female',
      color: body.color || '',
      tagNumber: tagNumber,
      purchasePrice: Number(body.purchasePrice) || 0,
      vendor: body.vendor || '',
      notes: body.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await cattleCollection.insertOne(newCattle);

    // Fetch created cattle
    const createdCattle = await cattleCollection.findOne({
      _id: result.insertedId
    });

    // Format cattle for frontend
    const formattedCattle = {
      id: createdCattle._id.toString(),
      _id: createdCattle._id.toString(),
      ...newCattle,
      createdAt: createdCattle.createdAt.toISOString(),
      updatedAt: createdCattle.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Cattle created successfully',
      cattle: formattedCattle,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating cattle:', error);
    return NextResponse.json(
      { error: 'Failed to create cattle', message: error.message },
      { status: 500 }
    );
  }
}
