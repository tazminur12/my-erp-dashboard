import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all bank accounts for a vendor
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
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

    // Get bank accounts from vendor document or separate collection
    // Assuming bank accounts are stored in vendor.bankAccounts array
    const bankAccounts = vendor.bankAccounts || [];

    // Format bank accounts for frontend
    const formattedAccounts = bankAccounts.map((account, index) => ({
      id: account._id?.toString() || `${id}-${index}`,
      _id: account._id?.toString() || `${id}-${index}`,
      bankName: account.bankName || '',
      accountNumber: account.accountNumber || '',
      accountType: account.accountType || 'Savings',
      branchName: account.branchName || '',
      accountHolder: account.accountHolder || '',
      accountTitle: account.accountTitle || account.accountHolder || '',
      initialBalance: account.initialBalance || 0,
      currentBalance: account.currentBalance || account.initialBalance || 0,
      currency: account.currency || 'BDT',
      contactNumber: account.contactNumber || '',
      isPrimary: account.isPrimary || false,
      notes: account.notes || '',
      created_at: account.created_at ? account.created_at.toISOString() : new Date().toISOString(),
      updated_at: account.updated_at ? account.updated_at.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(
      { bankAccounts: formattedAccounts, data: formattedAccounts },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching vendor bank accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor bank accounts', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new bank account for a vendor
export async function POST(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
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

    // Create new bank account object
    const newBankAccount = {
      _id: new ObjectId(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountType: accountType || 'Savings',
      branchName: branchName?.trim() || '',
      accountHolder: accountHolder.trim(),
      accountTitle: accountTitle?.trim() || accountHolder.trim(),
      initialBalance: parseFloat(initialBalance) || 0,
      currentBalance: parseFloat(initialBalance) || 0,
      currency: currency || 'BDT',
      contactNumber: contactNumber?.trim() || '',
      isPrimary: isPrimary || false,
      notes: notes?.trim() || '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Get existing bank accounts
    const bankAccounts = vendor.bankAccounts || [];
    
    // If setting as primary, unset other primary accounts
    if (isPrimary) {
      bankAccounts.forEach(acc => {
        acc.isPrimary = false;
      });
    }

    // Add bank account to vendor
    bankAccounts.push(newBankAccount);

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
      id: newBankAccount._id.toString(),
      _id: newBankAccount._id.toString(),
      ...newBankAccount,
      created_at: newBankAccount.created_at.toISOString(),
      updated_at: newBankAccount.updated_at.toISOString(),
    };

    return NextResponse.json(
      { message: 'Bank account created successfully', bankAccount: formattedAccount },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating vendor bank account:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor bank account', message: error.message },
      { status: 500 }
    );
  }
}
