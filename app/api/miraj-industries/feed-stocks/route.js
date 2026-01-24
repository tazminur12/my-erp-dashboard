import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all feed stocks
export async function GET(request) {
  try {
    const db = await getDb();
    const feedStocksCollection = db.collection('feed_stocks');
    const feedTypesCollection = db.collection('feed_types');

    const stocks = await feedStocksCollection
      .find({})
      .sort({ purchaseDate: -1 })
      .toArray();

    // Get feed type names
    const feedTypeIds = [...new Set(stocks.map(s => s.feedTypeId))];
    const feedTypeMap = {};
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

    // Format stocks for frontend
    const formattedStocks = stocks.map((stock) => {
      const feedType = feedTypeMap[stock.feedTypeId];
      return {
        id: stock._id.toString(),
        _id: stock._id.toString(),
        feedTypeId: stock.feedTypeId || '',
        feedName: feedType?.name || 'Unknown',
        quantity: Number(stock.quantity) || 0,
        currentStock: Number(stock.currentStock) || Number(stock.quantity) || 0,
        minStock: Number(stock.minStock) || 0,
        purchaseDate: stock.purchaseDate || '',
        expiryDate: stock.expiryDate || '',
        supplier: stock.supplier || '',
        cost: Number(stock.cost) || 0,
        notes: stock.notes || '',
        createdAt: stock.createdAt ? stock.createdAt.toISOString() : stock._id.getTimestamp().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      stocks: formattedStocks,
      data: formattedStocks,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching feed stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed stocks', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new feed stock
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.feedTypeId) {
      return NextResponse.json(
        { error: 'Feed type ID is required' },
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
    const feedStocksCollection = db.collection('feed_stocks');
    const feedTypesCollection = db.collection('feed_types');

    // Get feed type to check min stock
    const { ObjectId } = await import('mongodb');
    const feedType = await feedTypesCollection.findOne({
      _id: new ObjectId(body.feedTypeId)
    });

    if (!feedType) {
      return NextResponse.json(
        { error: 'Feed type not found' },
        { status: 404 }
      );
    }

    // Check if stock exists for this feed type
    const existingStock = await feedStocksCollection.findOne({
      feedTypeId: body.feedTypeId
    });

    const quantity = Number(body.quantity);
    const currentStock = existingStock ? (Number(existingStock.currentStock) + quantity) : quantity;

    if (existingStock) {
      // Update existing stock
      await feedStocksCollection.updateOne(
        { feedTypeId: body.feedTypeId },
        {
          $set: {
            currentStock: currentStock,
            updatedAt: new Date(),
          },
          $push: {
            purchaseHistory: {
              quantity: quantity,
              purchaseDate: body.purchaseDate || new Date().toISOString().split('T')[0],
              cost: Number(body.cost) || 0,
              supplier: body.supplier || '',
              notes: body.notes || '',
            }
          }
        }
      );
    } else {
      // Create new stock
      const newStock = {
        feedTypeId: body.feedTypeId,
        quantity: quantity,
        currentStock: currentStock,
        minStock: Number(body.minStock) || 0,
        purchaseDate: body.purchaseDate || new Date().toISOString().split('T')[0],
        expiryDate: body.expiryDate || '',
        supplier: body.supplier || '',
        cost: Number(body.cost) || 0,
        notes: body.notes || '',
        purchaseHistory: [{
          quantity: quantity,
          purchaseDate: body.purchaseDate || new Date().toISOString().split('T')[0],
          cost: Number(body.cost) || 0,
          supplier: body.supplier || '',
          notes: body.notes || '',
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await feedStocksCollection.insertOne(newStock);
    }

    // Fetch updated stock
    const updatedStock = await feedStocksCollection.findOne({
      feedTypeId: body.feedTypeId
    });

    const formattedStock = {
      id: updatedStock._id.toString(),
      _id: updatedStock._id.toString(),
      feedTypeId: updatedStock.feedTypeId,
      feedName: feedType.name,
      quantity: quantity,
      currentStock: updatedStock.currentStock,
      minStock: updatedStock.minStock || 0,
      purchaseDate: updatedStock.purchaseDate,
      expiryDate: updatedStock.expiryDate || '',
      supplier: updatedStock.supplier || '',
      cost: Number(updatedStock.cost) || 0,
      notes: updatedStock.notes || '',
      createdAt: updatedStock.createdAt.toISOString(),
      updatedAt: updatedStock.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Feed stock created/updated successfully',
      stock: formattedStock,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating feed stock:', error);
    return NextResponse.json(
      { error: 'Failed to create feed stock', message: error.message },
      { status: 500 }
    );
  }
}
