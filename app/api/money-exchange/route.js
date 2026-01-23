import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all money exchanges
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type'); // 'Buy' or 'Sell'
    const currencyCode = searchParams.get('currencyCode');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const dilarId = searchParams.get('dilarId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = await getDb();
    const exchangesCollection = db.collection('money_exchanges');

    // Build query
    const query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (currencyCode) {
      query.currencyCode = currencyCode;
    }
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.date.$lte = new Date(dateTo);
      }
    }
    
    // Handle dilarId filter
    if (dilarId) {
      query.$or = [
        { dilarId: dilarId },
        { selectedDilarId: dilarId }
      ];
    }
    
    // Handle search filter (only if dilarId is not set, otherwise search within dilar's transactions)
    if (search) {
      if (dilarId) {
        // If dilarId is set, add search conditions to the existing $or
        query.$and = [
          {
            $or: [
              { dilarId: dilarId },
              { selectedDilarId: dilarId }
            ]
          },
          {
            $or: [
              { fullName: { $regex: search, $options: 'i' } },
              { mobileNumber: { $regex: search, $options: 'i' } },
              { nid: { $regex: search, $options: 'i' } },
            ]
          }
        ];
        delete query.$or;
      } else {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } },
          { nid: { $regex: search, $options: 'i' } },
        ];
      }
    }

    // Get total count
    const total = await exchangesCollection.countDocuments(query);
    const skip = (page - 1) * limit;

    const exchanges = await exchangesCollection
      .find(query)
      .sort({ createdAt: -1, date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format exchanges for frontend
    const formattedExchanges = exchanges.map(exchange => ({
      id: exchange._id.toString(),
      _id: exchange._id.toString(),
      type: exchange.type || 'Buy',
      date: exchange.date ? exchange.date.toISOString().split('T')[0] : '',
      fullName: exchange.fullName || '',
      mobileNumber: exchange.mobileNumber || '',
      nid: exchange.nid || '',
      currencyCode: exchange.currencyCode || '',
      currencyName: exchange.currencyName || '',
      exchangeRate: exchange.exchangeRate || 0,
      quantity: exchange.quantity || 0,
      amount_bdt: exchange.amount_bdt || 0,
      customerType: exchange.customerType || 'normal',
      dilarId: exchange.dilarId || exchange.selectedDilarId || '',
      isActive: exchange.isActive !== false,
      status: exchange.isActive !== false ? 'completed' : 'cancelled',
      createdAt: exchange.createdAt ? exchange.createdAt.toISOString() : exchange._id.getTimestamp().toISOString(),
      updatedAt: exchange.updatedAt ? exchange.updatedAt.toISOString() : exchange.createdAt ? exchange.createdAt.toISOString() : exchange._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      data: formattedExchanges,
      exchanges: formattedExchanges,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchanges', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new money exchange
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    if (!body.fullName || !body.fullName.trim()) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!body.mobileNumber || !body.mobileNumber.trim()) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    if (!body.type || !['Buy', 'Sell'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be Buy or Sell' },
        { status: 400 }
      );
    }

    if (!body.currencyCode) {
      return NextResponse.json(
        { error: 'Currency code is required' },
        { status: 400 }
      );
    }

    const exchangeRate = Number(body.exchangeRate);
    const quantity = Number(body.quantity);
    const amount_bdt = Number(body.amount_bdt);

    if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
      return NextResponse.json(
        { error: 'Valid exchange rate is required' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount_bdt) || amount_bdt <= 0) {
      return NextResponse.json(
        { error: 'Valid BDT amount is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const exchangesCollection = db.collection('money_exchanges');

    const exchange = {
      type: body.type,
      date: new Date(body.date),
      fullName: body.fullName.trim(),
      mobileNumber: body.mobileNumber.trim(),
      nid: body.nid || '',
      currencyCode: body.currencyCode,
      currencyName: body.currencyName || '',
      exchangeRate: exchangeRate,
      quantity: quantity,
      amount_bdt: amount_bdt,
      customerType: body.customerType || 'normal',
      dilarId: body.dilarId || body.selectedDilarId || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await exchangesCollection.insertOne(exchange);

    return NextResponse.json({
      exchange: {
        ...exchange,
        id: result.insertedId.toString(),
        _id: result.insertedId.toString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating exchange:', error);
    return NextResponse.json(
      { error: 'Failed to create exchange', message: error.message },
      { status: 500 }
    );
  }
}
