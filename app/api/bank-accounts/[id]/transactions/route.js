import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid bank account ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const type = searchParams.get('type'); // credit, debit, transfer
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    // Build filter: Transaction involves this account as target or source
    // A transaction is relevant if:
    // 1. It is a credit/debit where targetAccountId is this account
    // 2. It is a transfer where either fromAccountId OR toAccountId is this account
    const filter = {
      isActive: { $ne: false },
      $or: [
        { targetAccountId: id },
        { fromAccountId: id }
      ]
    };

    if (type) {
      filter.transactionType = type;
    }

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch transactions
    const cursor = transactionsCollection
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const [transactionsRaw, total] = await Promise.all([
      cursor.toArray(),
      transactionsCollection.countDocuments(filter)
    ]);

    // Format transactions to add "isTransfer" flag and handle charge display context
    const transactions = transactionsRaw.map(tx => {
      const isTransfer = tx.transactionType === 'transfer';
      const isSender = tx.fromAccountId === id;
      
      // If it's a transfer and I am the sender, the charge was paid by me.
      // If it's a debit/credit, I am the target, so charge was paid by me (if any).
      // Note: Usually receiver doesn't pay charge in this system logic, but if they did, logic would differ.
      // Current logic: Sender pays charge in transfer. Target pays charge in debit (if applicable).
      
      return {
        ...tx,
        isTransfer,
        isSender,
        // For frontend display:
        // If transfer & sender: show full charge
        // If transfer & receiver: usually 0 charge for receiver
        charge: (isTransfer && isSender) || (!isTransfer) ? (tx.charge || 0) : 0,
        
        // Helper to format amount for display (negative for money leaving)
        displayAmount: (isTransfer && isSender) || (tx.transactionType === 'debit') 
          ? -1 * (tx.amount || 0) 
          : (tx.amount || 0)
      };
    });

    // Calculate Summary Aggregation
    const summaryAggregation = [
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          
          // Total Credit: Money IN from direct Deposit/Credit
          totalCredit: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$transactionType", "credit"] }, { $eq: ["$targetAccountId", id] }] },
                "$amount",
                0
              ]
            }
          },
          
          // Total Debit: Money OUT from direct Withdrawal/Debit
          totalDebit: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$transactionType", "debit"] }, { $eq: ["$targetAccountId", id] }] },
                "$amount",
                0
              ]
            }
          },
          
          // Total Transfer In: Money IN from Transfer (I am receiver)
          totalTransferIn: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$transactionType", "transfer"] }, { $eq: ["$targetAccountId", id] }] }, // in transfer logic, target is receiver
                "$amount",
                0
              ]
            }
          },
          
          // Total Transfer Out: Money OUT from Transfer (I am sender)
          totalTransferOut: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$transactionType", "transfer"] }, { $eq: ["$fromAccountId", id] }] },
                "$amount",
                0
              ]
            }
          },
          
          // Total Charge: Charges paid by this account
          // 1. Transfer where I am Sender
          // 2. Direct Debit/Credit where I am Target (if charge exists)
          totalCharge: {
            $sum: {
              $cond: [
                { 
                  $or: [
                    { $eq: ["$fromAccountId", id] }, // I am sender (transfer)
                    { $and: [{ $eq: ["$targetAccountId", id] }, { $ne: ["$transactionType", "transfer"] }] } // I am target of non-transfer
                  ] 
                },
                { $ifNull: ["$charge", 0] },
                0
              ]
            }
          }
        }
      }
    ];

    const summaryResult = await transactionsCollection.aggregate(summaryAggregation).toArray();
    const summary = summaryResult[0] || {
      totalTransactions: 0,
      totalCredit: 0,
      totalDebit: 0,
      totalTransferIn: 0,
      totalTransferOut: 0,
      totalCharge: 0
    };

    return NextResponse.json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      summary
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
