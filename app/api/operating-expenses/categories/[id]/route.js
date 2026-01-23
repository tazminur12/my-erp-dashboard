import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single category
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const categoriesCollection = db.collection('operating_expense_categories');

    let category;
    try {
      category = await categoriesCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Format category for frontend
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
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const categoriesCollection = db.collection('operating_expense_categories');

    // Find category
    let category;
    try {
      category = await categoriesCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      name: body.name?.trim() || category.name || '',
      banglaName: body.banglaName?.trim() || category.banglaName || '',
      description: body.description?.trim() || category.description || '',
      iconKey: body.iconKey || category.iconKey || 'FileText',
      color: body.color || category.color || '',
      bgColor: body.bgColor || category.bgColor || '',
      iconColor: body.iconColor || category.iconColor || '',
      updatedAt: new Date(),
    };

    // Update category
    await categoriesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated category
    const updatedCategory = await categoriesCollection.findOne({
      _id: new ObjectId(id)
    });

    // Format category for frontend
    const formattedCategory = {
      id: updatedCategory._id.toString(),
      _id: updatedCategory._id.toString(),
      ...updateData,
      totalAmount: updatedCategory.totalAmount || 0,
      itemCount: updatedCategory.itemCount || 0,
      createdAt: updatedCategory.createdAt.toISOString(),
      updatedAt: updateData.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: formattedCategory,
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
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const categoriesCollection = db.collection('operating_expense_categories');

    // Find and delete category
    let result;
    try {
      result = await categoriesCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
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
