import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all feed usages
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const date = searchParams.get('date') || '';

    const db = await getDb();
    const feedUsagesCollection = db.collection('feed_usages');
    const feedTypesCollection = db.collection('feed_types');
    const cattleCollection = db.collection('cattle');

    // Build query
    const query = {};
    if (date) {
      query.date = date;
    }

    let usages = await feedUsagesCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    // Get feed type names and cattle names
    const feedTypeIds = [...new Set(usages.map(u => u.feedTypeId))];
    const cattleIds = [...new Set(usages.map(u => u.cattleId).filter(id => id))];
    
    const feedTypeMap = {};
    const cattleMap = {};

    if (feedTypeIds.length > 0) {
      const { ObjectId } = await import('mongodb');
      const feedTypes = await feedTypesCollection.find({
        _id: { $in: feedTypeIds.map(id => {
          try {
            return new ObjectId(id);
          } catch {
            return id;
          }
        }) }
      }).toArray();
      feedTypes.forEach(f => {
        feedTypeMap[f._id.toString()] = f;
      });
    }

    if (cattleIds.length > 0) {
      const { ObjectId } = await import('mongodb');
      const cattle = await cattleCollection.find({
        _id: { $in: cattleIds.map(id => {
          try {
            return new ObjectId(id);
          } catch {
            return id;
          }
        }) }
      }).toArray();
      cattle.forEach(c => {
        cattleMap[c._id.toString()] = c;
      });
    }

    // Format and filter by search term
    const formattedUsages = usages
      .map((usage) => {
        const feedType = feedTypeMap[usage.feedTypeId];
        const cattle = usage.cattleId ? cattleMap[usage.cattleId] : null;
        return {
          id: usage._id.toString(),
          _id: usage._id.toString(),
          feedTypeId: usage.feedTypeId || '',
          feedName: feedType?.name || 'Unknown',
          date: usage.date || '',
          quantity: Number(usage.quantity) || 0,
          cattleId: usage.cattleId || '',
          cattleName: cattle?.name || usage.cattleId || 'All',
          purpose: usage.purpose || '',
          notes: usage.notes || '',
          createdAt: usage.createdAt ? usage.createdAt.toISOString() : usage._id.getTimestamp().toISOString(),
        };
      })
      .filter(usage => {
        if (!q) return true;
        const searchLower = q.toLowerCase();
        return (
          usage.feedName.toLowerCase().includes(searchLower) ||
          usage.cattleName.toLowerCase().includes(searchLower) ||
          usage.purpose.toLowerCase().includes(searchLower)
        );
      });

    return NextResponse.json({
      success: true,
      usages: formattedUsages,
      data: formattedUsages,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching feed usages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed usages', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new feed usage
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.feedTypeId) {
      return NextResponse.json(
        { error: 'Feed type ID is required' },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    if (!body.quantity || Number(body.quantity) <= 0) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const feedUsagesCollection = db.collection('feed_usages');
    const feedStocksCollection = db.collection('feed_stocks');

    // Check if stock is available
    const stock = await feedStocksCollection.findOne({
      feedTypeId: body.feedTypeId
    });

    if (!stock || Number(stock.currentStock) < Number(body.quantity)) {
      return NextResponse.json(
        { error: 'Insufficient stock available' },
        { status: 400 }
      );
    }

    // Create usage record
    const newUsage = {
      feedTypeId: body.feedTypeId,
      date: body.date,
      quantity: Number(body.quantity),
      cattleId: body.cattleId || '',
      purpose: body.purpose || '',
      notes: body.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await feedUsagesCollection.insertOne(newUsage);

    // Update stock
    await feedStocksCollection.updateOne(
      { feedTypeId: body.feedTypeId },
      {
        $inc: { currentStock: -Number(body.quantity) },
        $set: { updatedAt: new Date() }
      }
    );

    // Fetch created usage with feed type name
    const feedTypesCollection = db.collection('feed_types');
    const { ObjectId } = await import('mongodb');
    const feedType = await feedTypesCollection.findOne({
      _id: new ObjectId(body.feedTypeId)
    });

    const createdUsage = await feedUsagesCollection.findOne({
      _id: result.insertedId
    });

    const formattedUsage = {
      id: createdUsage._id.toString(),
      _id: createdUsage._id.toString(),
      feedTypeId: createdUsage.feedTypeId,
      feedName: feedType?.name || 'Unknown',
      ...newUsage,
      createdAt: createdUsage.createdAt.toISOString(),
      updatedAt: createdUsage.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Feed usage recorded successfully',
      usage: formattedUsage,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating feed usage:', error);
    return NextResponse.json(
      { error: 'Failed to create feed usage', message: error.message },
      { status: 500 }
    );
  }
}
