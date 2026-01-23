import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single exchange
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Exchange ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const exchangesCollection = db.collection('money_exchanges');

    let exchange;
    try {
      exchange = await exchangesCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      exchange = await exchangesCollection.findOne({ id: id });
    }

    if (!exchange) {
      return NextResponse.json(
        { error: 'Exchange not found' },
        { status: 404 }
      );
    }

    const formattedExchange = {
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
      createdAt: exchange.createdAt ? exchange.createdAt.toISOString() : exchange._id.getTimestamp().toISOString(),
      updatedAt: exchange.updatedAt ? exchange.updatedAt.toISOString() : exchange.createdAt ? exchange.createdAt.toISOString() : exchange._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      exchange: formattedExchange,
      data: formattedExchange,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching exchange:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update exchange
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Exchange ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const exchangesCollection = db.collection('money_exchanges');

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Convert date if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    // Convert numbers
    if (updateData.exchangeRate !== undefined) {
      updateData.exchangeRate = Number(updateData.exchangeRate);
    }
    if (updateData.quantity !== undefined) {
      updateData.quantity = Number(updateData.quantity);
    }
    if (updateData.amount_bdt !== undefined) {
      updateData.amount_bdt = Number(updateData.amount_bdt);
    }

    let result;
    try {
      result = await exchangesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    } catch (err) {
      result = await exchangesCollection.updateOne(
        { id: id },
        { $set: updateData }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Exchange not found' },
        { status: 404 }
      );
    }

    const updatedExchange = await exchangesCollection.findOne(
      { _id: new ObjectId(id) }
    );

    return NextResponse.json({
      exchange: {
        ...updatedExchange,
        id: updatedExchange._id.toString(),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating exchange:', error);
    return NextResponse.json(
      { error: 'Failed to update exchange', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE exchange
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Exchange ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const exchangesCollection = db.collection('money_exchanges');

    let result;
    try {
      result = await exchangesCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      result = await exchangesCollection.deleteOne({ id: id });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Exchange not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Exchange deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting exchange:', error);
    return NextResponse.json(
      { error: 'Failed to delete exchange', message: error.message },
      { status: 500 }
    );
  }
}
