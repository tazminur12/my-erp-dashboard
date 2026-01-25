import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { getBranchFilter, getBranchInfo } from '../../../lib/branchHelper';

// GET all bank accounts
export async function GET(request) {
  try {
    // Get user session for branch filtering
    const userSession = await getServerSession(authOptions);
    const branchFilter = getBranchFilter(userSession);
    
    const { searchParams } = new URL(request.url);
    const accountCategory = searchParams.get('accountCategory'); // Optional filter
    const status = searchParams.get('status'); // Optional filter by status

    const db = await getDb();
    const bankAccountsCollection = db.collection('bank_accounts');

    // Build query with branch filter
    const query = { ...branchFilter };
    if (accountCategory) {
      query.accountCategory = accountCategory;
    }
    if (status) {
      query.status = status;
    }

    const bankAccounts = await bankAccountsCollection
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    // Format bank accounts for frontend
    const formattedAccounts = bankAccounts.map((account) => ({
      id: account._id.toString(),
      _id: account._id.toString(),
      bankName: account.bankName || '',
      accountNumber: account.accountNumber || '',
      accountType: account.accountType || 'Current',
      accountCategory: account.accountCategory || 'bank',
      branchName: account.branchName || '',
      accountHolder: account.accountHolder || '',
      accountTitle: account.accountTitle || '',
      routingNumber: account.routingNumber || '',
      logo: account.logo || '',
      initialBalance: account.initialBalance || 0,
      currentBalance: account.currentBalance || account.initialBalance || 0,
      currency: account.currency || 'BDT',
      contactNumber: account.contactNumber || '',
      createdBy: account.createdBy || '',
      branchId: account.branchId || '',
      userBranchName: account.userBranchName || '', // System branch that created this account
      status: account.status || 'active',
      created_at: account.created_at ? account.created_at.toISOString() : new Date().toISOString(),
      updated_at: account.updated_at ? account.updated_at.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(
      { 
        bankAccounts: formattedAccounts, 
        data: formattedAccounts, 
        count: formattedAccounts.length 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank accounts', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new bank account
export async function POST(request) {
  try {
    // Get user session for branch info
    const userSession = await getServerSession(authOptions);
    const userBranchInfo = getBranchInfo(userSession);
    
    const body = await request.json();
    const {
      bankName,
      accountNumber,
      accountType,
      accountCategory,
      branchName,
      accountHolder,
      accountTitle,
      routingNumber,
      logo,
      initialBalance,
      currentBalance,
      currency,
      contactNumber,
      createdBy,
      branchId
    } = body;

    // Validation
    if (!bankName || !bankName.trim()) {
      return NextResponse.json(
        { error: 'Bank name is required' },
        { status: 400 }
      );
    }

    if (!accountNumber || !accountNumber.trim()) {
      return NextResponse.json(
        { error: 'Account number is required' },
        { status: 400 }
      );
    }

    if (!routingNumber || !routingNumber.trim()) {
      return NextResponse.json(
        { error: 'Routing number is required' },
        { status: 400 }
      );
    }

    if (!accountCategory || !accountCategory.trim()) {
      return NextResponse.json(
        { error: 'Account category is required' },
        { status: 400 }
      );
    }

    if (!branchName || !branchName.trim()) {
      return NextResponse.json(
        { error: 'Branch name is required' },
        { status: 400 }
      );
    }

    if (!accountHolder || !accountHolder.trim()) {
      return NextResponse.json(
        { error: 'Account holder is required' },
        { status: 400 }
      );
    }

    if (!accountTitle || !accountTitle.trim()) {
      return NextResponse.json(
        { error: 'Account title is required' },
        { status: 400 }
      );
    }

    if (initialBalance === undefined || initialBalance === null || parseFloat(initialBalance) < 0) {
      return NextResponse.json(
        { error: 'Valid initial balance is required' },
        { status: 400 }
      );
    }

    // Validate account category
    const validCategories = ['cash', 'bank', 'mobile_banking', 'check', 'others'];
    if (!validCategories.includes(accountCategory)) {
      return NextResponse.json(
        { error: 'Please select a valid account category' },
        { status: 400 }
      );
    }

    // Validate contact number format if provided
    if (contactNumber && contactNumber.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
      if (!phoneRegex.test(contactNumber.trim())) {
        return NextResponse.json(
          { error: 'Please enter a valid contact number' },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const bankAccountsCollection = db.collection('bank_accounts');

    // Check if account with same account number already exists
    const existingAccount = await bankAccountsCollection.findOne({
      accountNumber: accountNumber.trim()
    });
    
    if (existingAccount) {
      return NextResponse.json(
        { error: 'Bank account with this account number already exists' },
        { status: 400 }
      );
    }

    // Create new bank account
    const newBankAccount = {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountType: accountType || 'Current',
      accountCategory: accountCategory.trim(),
      branchName: branchName.trim(),
      accountHolder: accountHolder.trim(),
      accountTitle: accountTitle.trim(),
      routingNumber: routingNumber.trim(),
      logo: logo || '',
      initialBalance: parseFloat(initialBalance),
      currentBalance: currentBalance !== undefined && currentBalance !== null && currentBalance !== '' 
        ? parseFloat(currentBalance) 
        : parseFloat(initialBalance), // Use provided currentBalance or default to initialBalance
      currency: currency || 'BDT',
      contactNumber: contactNumber ? contactNumber.trim() : '',
      createdBy: createdBy || '',
      branchId: userBranchInfo.branchId || branchId || '',
      userBranchName: userBranchInfo.branchName || '',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await bankAccountsCollection.insertOne(newBankAccount);

    // Return bank account
    const createdAccount = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newBankAccount,
      created_at: newBankAccount.created_at.toISOString(),
      updated_at: newBankAccount.updated_at.toISOString(),
    };

    return NextResponse.json(
      { 
        message: 'Bank account created successfully', 
        bankAccount: createdAccount 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating bank account:', error);
    return NextResponse.json(
      { error: 'Failed to create bank account', message: error.message },
      { status: 500 }
    );
  }
}
