import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all farm expenses
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const db = await getDb();
    const expensesCollection = db.collection('farm_expenses');

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } }
      ];
    }

    const expenses = await expensesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Format expenses for frontend
    const formattedExpenses = expenses.map((expense) => ({
      id: expense._id.toString(),
      _id: expense._id.toString(),
      category: expense.category || '',
      description: expense.description || '',
      amount: Number(expense.amount) || 0,
      vendor: expense.vendor || '',
      notes: expense.notes || '',
      createdAt: expense.createdAt ? expense.createdAt.toISOString() : expense._id.getTimestamp().toISOString(),
      updatedAt: expense.updatedAt ? expense.updatedAt.toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      expenses: formattedExpenses,
      data: formattedExpenses,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching farm expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farm expenses', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new farm expense
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.category || !body.category.trim()) {
      return NextResponse.json(
        { error: 'Category is required' },
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
    const expensesCollection = db.collection('farm_expenses');

    // Create new expense
    const newExpense = {
      category: body.category.trim(),
      description: body.description.trim(),
      amount: Number(body.amount) || 0,
      vendor: (body.vendor || '').trim(),
      notes: (body.notes || '').trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await expensesCollection.insertOne(newExpense);

    const formattedExpense = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newExpense,
      createdAt: newExpense.createdAt.toISOString(),
      updatedAt: newExpense.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Farm expense created successfully',
      expense: formattedExpense,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating farm expense:', error);
    return NextResponse.json(
      { error: 'Failed to create farm expense', message: error.message },
      { status: 500 }
    );
  }
}
