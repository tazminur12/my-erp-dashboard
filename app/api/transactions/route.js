import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all transactions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const partyType = searchParams.get('partyType'); // 'vendor', 'agent', etc.
    const partyId = searchParams.get('partyId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    // Build query
    const query = {};
    if (partyType && partyId) {
      query.partyType = partyType;
      query.partyId = partyId;
    }

    // Get total count
    const totalCount = await transactionsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    // Fetch transactions
    const transactions = await transactionsCollection
      .find(query)
      .sort({ createdAt: -1, date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format transactions for frontend
    const formattedTransactions = transactions.map((tx) => ({
      id: tx._id?.toString() || tx.transactionId || '',
      _id: tx._id?.toString() || tx.transactionId || '',
      transactionId: tx.transactionId || tx._id?.toString() || '',
      transactionType: tx.transactionType || tx.type || 'credit',
      type: tx.transactionType || tx.type || 'credit',
      amount: tx.amount || 0,
      paymentMethod: tx.paymentMethod || tx.paymentDetails?.method || '',
      reference: tx.reference || tx.paymentDetails?.reference || '',
      description: tx.description || '',
      createdAt: tx.createdAt || tx.date || new Date().toISOString(),
      date: tx.date || tx.createdAt || new Date().toISOString(),
    }));

    return NextResponse.json(
      { 
        transactions: formattedTransactions,
        data: formattedTransactions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
        totalCount,
        totalPages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', message: error.message },
      { status: 500 }
    );
  }
}
