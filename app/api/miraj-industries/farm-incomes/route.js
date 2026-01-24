import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all farm incomes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const date = searchParams.get('date') || '';

    const db = await getDb();
    const incomesCollection = db.collection('farm_incomes');

    // Build query
    const query = {};
    if (date) {
      query.date = date;
    }
    if (search) {
      query.$or = [
        { source: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { customer: { $regex: search, $options: 'i' } }
      ];
    }

    const incomes = await incomesCollection
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    // Format incomes for frontend
    const formattedIncomes = incomes.map((income) => ({
      id: income._id.toString(),
      _id: income._id.toString(),
      source: income.source || '',
      description: income.description || '',
      amount: Number(income.amount) || 0,
      date: income.date || '',
      paymentMethod: income.paymentMethod || 'cash',
      customer: income.customer || '',
      notes: income.notes || '',
      createdAt: income.createdAt ? income.createdAt.toISOString() : income._id.getTimestamp().toISOString(),
      updatedAt: income.updatedAt ? income.updatedAt.toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      incomes: formattedIncomes,
      data: formattedIncomes,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching farm incomes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farm incomes', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new farm income
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.source || !body.source.trim()) {
      return NextResponse.json(
        { error: 'Source is required' },
        { status: 400 }
      );
    }

    if (!body.description || !body.description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const incomesCollection = db.collection('farm_incomes');

    // Create new income
    const newIncome = {
      source: body.source.trim(),
      description: body.description.trim(),
      amount: Number(body.amount) || 0,
      date: body.date || new Date().toISOString().split('T')[0],
      paymentMethod: body.paymentMethod || 'cash',
      customer: (body.customer || '').trim(),
      notes: (body.notes || '').trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await incomesCollection.insertOne(newIncome);

    const formattedIncome = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newIncome,
      createdAt: newIncome.createdAt.toISOString(),
      updatedAt: newIncome.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Farm income created successfully',
      income: formattedIncome,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating farm income:', error);
    return NextResponse.json(
      { error: 'Failed to create farm income', message: error.message },
      { status: 500 }
    );
  }
}
