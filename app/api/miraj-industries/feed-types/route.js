import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all feed types
export async function GET(request) {
  try {
    const db = await getDb();
    const feedTypesCollection = db.collection('feed_types');

    const feedTypes = await feedTypesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Format feed types for frontend
    const formattedFeedTypes = feedTypes.map((feed) => ({
      id: feed._id.toString(),
      _id: feed._id.toString(),
      name: feed.name || '',
      type: feed.type || '',
      unit: feed.unit || 'kg',
      costPerUnit: Number(feed.costPerUnit) || 0,
      supplier: feed.supplier || '',
      description: feed.description || '',
      createdAt: feed.createdAt ? feed.createdAt.toISOString() : feed._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      feedTypes: formattedFeedTypes,
      data: formattedFeedTypes,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching feed types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed types', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new feed type
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Feed name is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const feedTypesCollection = db.collection('feed_types');

    // Check if feed type with same name already exists
    const existingFeed = await feedTypesCollection.findOne({
      name: body.name.trim()
    });

    if (existingFeed) {
      return NextResponse.json(
        { error: 'Feed type with this name already exists' },
        { status: 400 }
      );
    }

    // Create new feed type
    const newFeedType = {
      name: body.name.trim(),
      type: body.type?.trim() || '',
      unit: body.unit || 'kg',
      costPerUnit: Number(body.costPerUnit) || 0,
      supplier: body.supplier?.trim() || '',
      description: body.description?.trim() || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await feedTypesCollection.insertOne(newFeedType);

    // Fetch created feed type
    const createdFeedType = await feedTypesCollection.findOne({
      _id: result.insertedId
    });

    // Format feed type for frontend
    const formattedFeedType = {
      id: createdFeedType._id.toString(),
      _id: createdFeedType._id.toString(),
      ...newFeedType,
      createdAt: createdFeedType.createdAt.toISOString(),
      updatedAt: createdFeedType.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Feed type created successfully',
      feedType: formattedFeedType,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating feed type:', error);
    return NextResponse.json(
      { error: 'Failed to create feed type', message: error.message },
      { status: 500 }
    );
  }
}
