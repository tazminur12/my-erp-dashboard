import { NextResponse } from 'next/server';
import { getDb } from '../../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT update bank account
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id, accountId } = resolvedParams;
    const body = await request.json();

    if (!id || !accountId) {
      return NextResponse.json(
        { error: 'Vendor ID and Account ID are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid vendor ID format' },
        { status: 400 }
      );
    }

    const {
      bankName,
      accountNumber,
      accountType,
      branchName,
      accountHolder,
      accountTitle,
      initialBalance,
      currency,
      contactNumber,
      isPrimary,
      notes
    } = body;

    // Validation
    if (!bankName || !bankName.trim()) {
      return NextResponse.json(
        { error: 'Bank Name is required' },
        { status: 400 }
      );
    }

    if (!accountNumber || !accountNumber.trim()) {
      return NextResponse.json(
        { error: 'Account Number is required' },
        { status: 400 }
      );
    }

    if (!accountHolder || !accountHolder.trim()) {
      return NextResponse.json(
        { error: 'Account Holder is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const vendorsCollection = db.collection('vendors');

    // Check if vendor exists
    const vendor = await vendorsCollection.findOne({ _id: new ObjectId(id) });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const bankAccounts = vendor.bankAccounts || [];
    const accountIndex = bankAccounts.findIndex(
      acc => {
        const accId = acc._id?.toString() || acc.id?.toString() || '';
        const compareId = accountId.toString();
        return accId === compareId || (ObjectId.isValid(accId) && ObjectId.isValid(compareId) && accId === compareId);
      }
    );

    if (accountIndex === -1) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      );
    }

    // If setting as primary, unset other primary accounts
    if (isPrimary) {
      bankAccounts.forEach((acc, index) => {
        if (index !== accountIndex) {
          acc.isPrimary = false;
        }
      });
    }

    // Update bank account
    const updatedAccount = {
      ...bankAccounts[accountIndex],
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountType: accountType || 'Savings',
      branchName: branchName?.trim() || '',
      accountHolder: accountHolder.trim(),
      accountTitle: accountTitle?.trim() || accountHolder.trim(),
      initialBalance: parseFloat(initialBalance) || 0,
      currency: currency || 'BDT',
      contactNumber: contactNumber?.trim() || '',
      isPrimary: isPrimary || false,
      notes: notes?.trim() || '',
      updated_at: new Date(),
    };

    bankAccounts[accountIndex] = updatedAccount;

    await vendorsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          bankAccounts: bankAccounts,
          updated_at: new Date()
        }
      }
    );

    const formattedAccount = {
      id: updatedAccount._id?.toString() || accountId,
      _id: updatedAccount._id?.toString() || accountId,
      ...updatedAccount,
      created_at: updatedAccount.created_at ? updatedAccount.created_at.toISOString() : new Date().toISOString(),
      updated_at: updatedAccount.updated_at.toISOString(),
    };

    return NextResponse.json(
      { message: 'Bank account updated successfully', bankAccount: formattedAccount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating vendor bank account:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor bank account', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE bank account
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id, accountId } = resolvedParams;

    if (!id || !accountId) {
      return NextResponse.json(
        { error: 'Vendor ID and Account ID are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid vendor ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const vendorsCollection = db.collection('vendors');

    // Check if vendor exists
    const vendor = await vendorsCollection.findOne({ _id: new ObjectId(id) });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const bankAccounts = vendor.bankAccounts || [];
    const accountIndex = bankAccounts.findIndex(
      acc => {
        const accId = acc._id?.toString() || acc.id?.toString() || '';
        const compareId = accountId.toString();
        return accId === compareId || (ObjectId.isValid(accId) && ObjectId.isValid(compareId) && accId === compareId);
      }
    );

    if (accountIndex === -1) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      );
    }

    // Remove bank account
    bankAccounts.splice(accountIndex, 1);

    await vendorsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          bankAccounts: bankAccounts,
          updated_at: new Date()
        }
      }
    );

    return NextResponse.json(
      { message: 'Bank account deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting vendor bank account:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor bank account', message: error.message },
      { status: 500 }
    );
  }
}
