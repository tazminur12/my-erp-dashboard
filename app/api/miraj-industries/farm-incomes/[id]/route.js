import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single farm income by ID
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Income ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid income ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const incomesCollection = db.collection('farm_incomes');

    const income = await incomesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!income) {
      return NextResponse.json(
        { error: 'Income not found' },
        { status: 404 }
      );
    }

    // Format income for frontend
    const formattedIncome = {
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
    };

    return NextResponse.json({
      success: true,
      income: formattedIncome,
      data: formattedIncome,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching farm income:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farm income', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update farm income
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Income ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid income ID format' },
        { status: 400 }
      );
    }

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

    // Check if income exists
    const existingIncome = await incomesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingIncome) {
      return NextResponse.json(
        { error: 'Income not found' },
        { status: 404 }
      );
    }

    // Update income
    const updateData = {
      source: body.source.trim(),
      description: body.description.trim(),
      amount: Number(body.amount) || 0,
      date: body.date || existingIncome.date,
      paymentMethod: body.paymentMethod || existingIncome.paymentMethod || 'cash',
      customer: (body.customer || '').trim(),
      notes: (body.notes || '').trim(),
      updatedAt: new Date(),
    };

    await incomesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedIncome = {
      id: id,
      _id: id,
      ...updateData,
      createdAt: existingIncome.createdAt ? existingIncome.createdAt.toISOString() : existingIncome._id.getTimestamp().toISOString(),
      updatedAt: updateData.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Farm income updated successfully',
      income: updatedIncome,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating farm income:', error);
    return NextResponse.json(
      { error: 'Failed to update farm income', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE farm income
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Income ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid income ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const incomesCollection = db.collection('farm_incomes');

    // Check if income exists
    const income = await incomesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!income) {
      return NextResponse.json(
        { error: 'Income not found' },
        { status: 404 }
      );
    }

    // Delete income
    await incomesCollection.deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({
      success: true,
      message: 'Farm income deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting farm income:', error);
    return NextResponse.json(
      { error: 'Failed to delete farm income', message: error.message },
      { status: 500 }
    );
  }
}
