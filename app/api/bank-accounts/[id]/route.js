import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single bank account by ID
export async function GET(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Bank account ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const bankAccountsCollection = db.collection('bank_accounts');

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid bank account ID format' },
        { status: 400 }
      );
    }

    const bankAccount = await bankAccountsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!bankAccount) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      );
    }

    // Format bank account for frontend
    const formattedAccount = {
      id: bankAccount._id.toString(),
      _id: bankAccount._id.toString(),
      bankName: bankAccount.bankName || '',
      accountNumber: bankAccount.accountNumber || '',
      accountType: bankAccount.accountType || 'Current',
      accountCategory: bankAccount.accountCategory || 'bank',
      branchName: bankAccount.branchName || '',
      accountHolder: bankAccount.accountHolder || '',
      accountTitle: bankAccount.accountTitle || '',
      routingNumber: bankAccount.routingNumber || '',
      logo: bankAccount.logo || '',
      initialBalance: bankAccount.initialBalance || 0,
      currentBalance: bankAccount.currentBalance || bankAccount.initialBalance || 0,
      currency: bankAccount.currency || 'BDT',
      contactNumber: bankAccount.contactNumber || '',
      createdBy: bankAccount.createdBy || '',
      branchId: bankAccount.branchId || '',
      status: bankAccount.status || 'active',
      created_at: bankAccount.created_at ? bankAccount.created_at.toISOString() : new Date().toISOString(),
      updated_at: bankAccount.updated_at ? bankAccount.updated_at.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { bankAccount: formattedAccount, data: formattedAccount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching bank account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank account', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update bank account
export async function PUT(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Bank account ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid bank account ID format' },
        { status: 400 }
      );
    }

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
      branchId,
      status
    } = body;

    const db = await getDb();
    const bankAccountsCollection = db.collection('bank_accounts');

    // Check if bank account exists
    const existingAccount = await bankAccountsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      );
    }

    // Validation
    if (bankName !== undefined && (!bankName || !bankName.trim())) {
      return NextResponse.json(
        { error: 'Bank name is required' },
        { status: 400 }
      );
    }

    if (accountNumber !== undefined && (!accountNumber || !accountNumber.trim())) {
      return NextResponse.json(
        { error: 'Account number is required' },
        { status: 400 }
      );
    }

    // Check if account number is being changed and if new one already exists
    if (accountNumber && accountNumber.trim() !== existingAccount.accountNumber) {
      const duplicateAccount = await bankAccountsCollection.findOne({
        accountNumber: accountNumber.trim(),
        _id: { $ne: new ObjectId(id) }
      });

      if (duplicateAccount) {
        return NextResponse.json(
          { error: 'Bank account with this account number already exists' },
          { status: 400 }
        );
      }
    }

    // Validate account category if provided
    if (accountCategory) {
      const validCategories = ['cash', 'bank', 'mobile_banking', 'check', 'others'];
      if (!validCategories.includes(accountCategory)) {
        return NextResponse.json(
          { error: 'Please select a valid account category' },
          { status: 400 }
        );
      }
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

    // Build update object
    const updateData = {
      updated_at: new Date(),
    };

    if (bankName !== undefined) updateData.bankName = bankName.trim();
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber.trim();
    if (accountType !== undefined) updateData.accountType = accountType;
    if (accountCategory !== undefined) updateData.accountCategory = accountCategory.trim();
    if (branchName !== undefined) updateData.branchName = branchName.trim();
    if (accountHolder !== undefined) updateData.accountHolder = accountHolder.trim();
    if (accountTitle !== undefined) updateData.accountTitle = accountTitle.trim();
    if (routingNumber !== undefined) updateData.routingNumber = routingNumber.trim();
    if (logo !== undefined) updateData.logo = logo;
    if (initialBalance !== undefined) updateData.initialBalance = parseFloat(initialBalance);
    if (currentBalance !== undefined && currentBalance !== null && currentBalance !== '') {
      updateData.currentBalance = parseFloat(currentBalance);
    }
    if (currency !== undefined) updateData.currency = currency;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber ? contactNumber.trim() : '';
    if (createdBy !== undefined) updateData.createdBy = createdBy;
    if (branchId !== undefined) updateData.branchId = branchId;
    if (status !== undefined) updateData.status = status;

    // Update bank account
    const result = await bankAccountsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      );
    }

    // Fetch updated bank account
    const updatedAccount = await bankAccountsCollection.findOne({
      _id: new ObjectId(id)
    });

    const formattedAccount = {
      id: updatedAccount._id.toString(),
      _id: updatedAccount._id.toString(),
      bankName: updatedAccount.bankName || '',
      accountNumber: updatedAccount.accountNumber || '',
      accountType: updatedAccount.accountType || 'Current',
      accountCategory: updatedAccount.accountCategory || 'bank',
      branchName: updatedAccount.branchName || '',
      accountHolder: updatedAccount.accountHolder || '',
      accountTitle: updatedAccount.accountTitle || '',
      routingNumber: updatedAccount.routingNumber || '',
      logo: updatedAccount.logo || '',
      initialBalance: updatedAccount.initialBalance || 0,
      currentBalance: updatedAccount.currentBalance || updatedAccount.initialBalance || 0,
      currency: updatedAccount.currency || 'BDT',
      contactNumber: updatedAccount.contactNumber || '',
      createdBy: updatedAccount.createdBy || '',
      branchId: updatedAccount.branchId || '',
      status: updatedAccount.status || 'active',
      created_at: updatedAccount.created_at ? updatedAccount.created_at.toISOString() : new Date().toISOString(),
      updated_at: updatedAccount.updated_at ? updatedAccount.updated_at.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { 
        message: 'Bank account updated successfully', 
        bankAccount: formattedAccount 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating bank account:', error);
    return NextResponse.json(
      { error: 'Failed to update bank account', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE bank account
export async function DELETE(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Bank account ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid bank account ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const bankAccountsCollection = db.collection('bank_accounts');

    // Check if bank account exists
    const existingAccount = await bankAccountsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      );
    }

    // Delete bank account
    const result = await bankAccountsCollection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete bank account' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Bank account deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting bank account:', error);
    return NextResponse.json(
      { error: 'Failed to delete bank account', message: error.message },
      { status: 500 }
    );
  }
}
