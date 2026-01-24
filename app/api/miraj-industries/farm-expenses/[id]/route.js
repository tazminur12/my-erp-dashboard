import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single farm expense by ID
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid expense ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const expensesCollection = db.collection('farm_expenses');

    const expense = await expensesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Format expense for frontend
    const formattedExpense = {
      id: expense._id.toString(),
      _id: expense._id.toString(),
      category: expense.category || '',
      description: expense.description || '',
      amount: Number(expense.amount) || 0,
      vendor: expense.vendor || '',
      notes: expense.notes || '',
      createdAt: expense.createdAt ? expense.createdAt.toISOString() : expense._id.getTimestamp().toISOString(),
      updatedAt: expense.updatedAt ? expense.updatedAt.toISOString() : null,
    };

    return NextResponse.json({
      success: true,
      expense: formattedExpense,
      data: formattedExpense,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching farm expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farm expense', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update farm expense
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid expense ID format' },
        { status: 400 }
      );
    }

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

    // Check if expense exists
    const existingExpense = await expensesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Update expense
    const updateData = {
      category: body.category.trim(),
      description: body.description.trim(),
      amount: Number(body.amount) || 0,
      vendor: (body.vendor || '').trim(),
      notes: (body.notes || '').trim(),
      updatedAt: new Date(),
    };

    await expensesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedExpense = {
      id: id,
      _id: id,
      ...updateData,
      createdAt: existingExpense.createdAt ? existingExpense.createdAt.toISOString() : existingExpense._id.getTimestamp().toISOString(),
      updatedAt: updateData.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Farm expense updated successfully',
      expense: updatedExpense,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating farm expense:', error);
    return NextResponse.json(
      { error: 'Failed to update farm expense', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE farm expense
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid expense ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const expensesCollection = db.collection('farm_expenses');

    // Check if expense exists
    const expense = await expensesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Delete expense
    await expensesCollection.deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({
      success: true,
      message: 'Farm expense deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting farm expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete farm expense', message: error.message },
      { status: 500 }
    );
  }
}
