import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all categories with current month stats
export async function GET(request) {
  try {
    const db = await getDb();
    const categoriesCollection = db.collection('personal_expense_categories');
    const transactionsCollection = db.collection('transactions');

    const categories = await categoriesCollection.find({}).toArray();

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Fetch current month transactions for personal expenses
    const currentMonthTransactions = await transactionsCollection.aggregate([
      {
        $match: {
          scope: 'personal-expense',
          date: {
            $gte: startOfMonth.toISOString(), // Assuming date is stored as ISO string
            $lte: endOfMonth.toISOString()
          }
        }
      },
      {
        $group: {
          _id: '$categoryId', // Group by categoryId
          total: { $sum: '$amount' }
        }
      }
    ]).toArray();

    // Create a map for quick lookup
    const expensesMap = {};
    currentMonthTransactions.forEach(item => {
      if (item._id) {
        expensesMap[item._id.toString()] = item.total;
      }
    });

    const formattedCategories = categories.map((category) => {
      const catId = category._id.toString();
      const thisMonthExpense = expensesMap[catId] || 0;
      const monthlyBudget = Number(category.monthlyAmount) || 0;
      const remaining = Math.max(0, monthlyBudget - thisMonthExpense);

      return {
        id: catId,
        _id: catId,
        name: category.name || '',
        banglaName: category.banglaName || '',
        description: category.description || '',
        iconKey: category.iconKey || 'FileText',
        color: category.color || '',
        bgColor: category.bgColor || '',
        iconColor: category.iconColor || '',
        expenseType: category.expenseType || '',
        frequency: category.frequency || '',
        monthlyAmount: monthlyBudget, // This acts as "Monthly Average" / Budget
        thisMonthExpense: thisMonthExpense, // New Field
        estimatedRemaining: remaining, // New Field
        totalAmount: category.totalAmount || 0,
        itemCount: category.itemCount || 0,
        lastUpdated: category.updatedAt ? category.updatedAt.toISOString() : category.createdAt ? category.createdAt.toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      categories: formattedCategories,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching personal expense categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const categoriesCollection = db.collection('personal_expense_categories');

    const existingCategory = await categoriesCollection.findOne({
      name: body.name.trim()
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

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
      totalAmount: 0,
      itemCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await categoriesCollection.insertOne(newCategory);
    const createdCategory = await categoriesCollection.findOne({ _id: result.insertedId });

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
    console.error('Error creating personal expense category:', error);
    return NextResponse.json(
      { error: 'Failed to create category', message: error.message },
      { status: 500 }
    );
  }
}
