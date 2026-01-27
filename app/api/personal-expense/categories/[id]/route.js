import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/mongodb';

// GET single category
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const db = await getDb();
    const categoriesCollection = db.collection('personal_expense_categories');

    const category = await categoriesCollection.findOne({ _id: new ObjectId(id) });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const formattedCategory = {
      id: category._id.toString(),
      _id: category._id.toString(),
      name: category.name || '',
      banglaName: category.banglaName || '',
      description: category.description || '',
      iconKey: category.iconKey || 'FileText',
      color: category.color || '',
      bgColor: category.bgColor || '',
      iconColor: category.iconColor || '',
      expenseType: category.expenseType || '',
      frequency: category.frequency || '',
      monthlyAmount: Number(category.monthlyAmount) || 0,
      totalAmount: category.totalAmount || 0,
      itemCount: category.itemCount || 0,
      lastUpdated: category.updatedAt ? category.updatedAt.toISOString() : category.createdAt ? category.createdAt.toISOString() : new Date().toISOString(),
      createdAt: category.createdAt ? category.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: category.updatedAt ? category.updatedAt.toISOString() : category.createdAt ? category.createdAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      category: formattedCategory,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const db = await getDb();
    const categoriesCollection = db.collection('personal_expense_categories');

    const updateData = {
      name: body.name?.trim(),
      banglaName: body.banglaName?.trim(),
      description: body.description?.trim(),
      iconKey: body.iconKey,
      expenseType: body.expenseType,
      frequency: body.frequency,
      monthlyAmount: body.monthlyAmount ? Number(body.monthlyAmount) : 0,
      updatedAt: new Date(),
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const result = await categoriesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const db = await getDb();
    const categoriesCollection = db.collection('personal_expense_categories');

    const result = await categoriesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category', message: error.message },
      { status: 500 }
    );
  }
}
