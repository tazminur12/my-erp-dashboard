import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getBranchFilter, getBranchInfo } from '../../../../lib/branchHelper';

// GET all categories
export async function GET(request) {
  try {
    // Get user session for branch filtering
    const userSession = await getServerSession(authOptions);
    const branchFilter = getBranchFilter(userSession);
    
    const db = await getDb();
    const categoriesCollection = db.collection('operating_expense_categories');

    // Categories can have branch filter or be shared
    const categories = await categoriesCollection.find({ ...branchFilter }).toArray();

    // Format categories for frontend
    const formattedCategories = categories.map((category) => ({
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
    }));

    return NextResponse.json({
      success: true,
      categories: formattedCategories,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request) {
  try {
    // Get user session for branch info
    const userSession = await getServerSession(authOptions);
    const branchInfo = getBranchInfo(userSession);
    
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const categoriesCollection = db.collection('operating_expense_categories');

    // Check if category with same name already exists
    const existingCategory = await categoriesCollection.findOne({
      name: body.name.trim()
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    // Create new category
    const newCategory = {
      name: body.name.trim(),
      banglaName: body.banglaName?.trim() || '',
      description: body.description?.trim() || '',
      iconKey: body.iconKey || 'FileText',
      color: body.color || '',
      bgColor: body.bgColor || '',
      iconColor: body.iconColor || '',
      expenseType: body.expenseType || '',
      frequency: body.frequency || '',
      monthlyAmount: Number(body.monthlyAmount) || 0,
      totalAmount: Number(body.totalAmount) || 0,
      itemCount: Number(body.itemCount) || 0,
      branchId: branchInfo.branchId,
      branchName: branchInfo.branchName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await categoriesCollection.insertOne(newCategory);

    // Fetch created category
    const createdCategory = await categoriesCollection.findOne({
      _id: result.insertedId
    });

    // Format category for frontend
    const formattedCategory = {
      id: createdCategory._id.toString(),
      _id: createdCategory._id.toString(),
      name: createdCategory.name,
      banglaName: createdCategory.banglaName || '',
      description: createdCategory.description || '',
      iconKey: createdCategory.iconKey || 'FileText',
      color: createdCategory.color || '',
      bgColor: createdCategory.bgColor || '',
      iconColor: createdCategory.iconColor || '',
      expenseType: createdCategory.expenseType || '',
      frequency: createdCategory.frequency || '',
      monthlyAmount: Number(createdCategory.monthlyAmount) || 0,
      totalAmount: createdCategory.totalAmount || 0,
      itemCount: createdCategory.itemCount || 0,
      lastUpdated: createdCategory.updatedAt ? createdCategory.updatedAt.toISOString() : createdCategory.createdAt ? createdCategory.createdAt.toISOString() : new Date().toISOString(),
      createdAt: createdCategory.createdAt.toISOString(),
      updatedAt: createdCategory.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: formattedCategory,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category', message: error.message },
      { status: 500 }
    );
  }
}
