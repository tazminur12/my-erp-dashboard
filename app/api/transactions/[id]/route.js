import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb, getClient } from '../../../../lib/mongodb';
import { triggerFamilyRecomputeForHaji, triggerFamilyRecomputeForUmrah } from '../../../../lib/transactionHelpers';

// ✅ GET: Get single transaction by ID
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Transaction ID is required" }, { status: 400 });
    }

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    // Try to find by _id first, then by transactionId
    let transaction = null;
    if (ObjectId.isValid(id)) {
      transaction = await transactionsCollection.findOne({ _id: new ObjectId(id), isActive: { $ne: false } });
    }
    
    if (!transaction) {
      transaction = await transactionsCollection.findOne({ transactionId: id, isActive: { $ne: false } });
    }

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error.message
    }, { status: 500 });
  }
}

// ✅ PUT: Update transaction
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "Transaction ID is required" }, { status: 400 });
    }

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    // Find the transaction
    let transaction = null;
    if (ObjectId.isValid(id)) {
      transaction = await transactionsCollection.findOne({ _id: new ObjectId(id), isActive: { $ne: false } });
    }
    
    if (!transaction) {
      transaction = await transactionsCollection.findOne({ transactionId: id, isActive: { $ne: false } });
    }

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    // Remove _id from update data if present
    delete updateData._id;

    // Update transaction
    const updateResult = await transactionsCollection.updateOne(
      { _id: transaction._id },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    // Fetch updated transaction
    const updatedTransaction = await transactionsCollection.findOne({ _id: transaction._id });

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: "Transaction updated successfully"
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update transaction',
      error: error.message
    }, { status: 500 });
  }
}

// ✅ DELETE: Delete transaction and reverse all related operations
export async function DELETE(request, { params }) {
  let session = null;

  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid transaction ID" }, { status: 400 });
    }

    const db = await getDb();
    const client = await getClient();

    // Get collections
    const transactions = db.collection('transactions');
    const bankAccounts = db.collection('bank_accounts');
    const agents = db.collection('agents');
    const vendors = db.collection('vendors');
    const airCustomers = db.collection('air_customers');
    const otherCustomers = db.collection('other_customers');
    const haji = db.collection('hajis');
    const umrah = db.collection('umrahs');
    const loans = db.collection('loans');
    const exchanges = db.collection('money_exchanges');
    const iataAirlinesCapping = db.collection('iata_airlines_capping');
    const othersInvestments = db.collection('others_investments');
    const assets = db.collection('assets');
    const farmEmployees = db.collection('farm_employees');
    const operatingExpenseCategories = db.collection('operating_expense_categories');
    const invoices = db.collection('invoices');

    // Find the transaction
    const tx = await transactions.findOne({ 
      _id: new ObjectId(id), 
      isActive: { $ne: false },
      scope: { $ne: "personal-expense" }
    });

    if (!tx) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    // Start MongoDB session for atomic operations
    session = client.startSession();
    session.startTransaction();

    try {
      const numericAmount = Number(tx.amount || 0);
      const transactionType = tx.transactionType;
      const partyType = tx.partyType;
      const serviceCategory = tx.serviceCategory || '';
      const categoryText = String(serviceCategory).toLowerCase();
      const isHajjCategory = categoryText.includes('haj');
      const isUmrahCategory = categoryText.includes('umrah');

      // 1. Reverse bank account balance changes
      if (transactionType === "credit" && tx.targetAccountId) {
        const account = await bankAccounts.findOne({ _id: new ObjectId(tx.targetAccountId) }, { session });
        if (account) {
          const newBalance = (account.currentBalance || 0) - numericAmount;
          await bankAccounts.updateOne(
            { _id: new ObjectId(tx.targetAccountId) },
            {
              $set: { currentBalance: newBalance, updatedAt: new Date() },
              $push: {
                balanceHistory: {
                  amount: -numericAmount,
                  type: 'reversal',
                  note: `Transaction deletion: ${tx.transactionId || id}`,
                  at: new Date()
                }
              }
            },
            { session }
          );
        }
      } else if (transactionType === "debit" && tx.targetAccountId) {
        const account = await bankAccounts.findOne({ _id: new ObjectId(tx.targetAccountId) }, { session });
        if (account) {
          const newBalance = (account.currentBalance || 0) + numericAmount;
          await bankAccounts.updateOne(
            { _id: new ObjectId(tx.targetAccountId) },
            {
              $set: { currentBalance: newBalance, updatedAt: new Date() },
              $push: {
                balanceHistory: {
                  amount: numericAmount,
                  type: 'reversal',
                  note: `Transaction deletion: ${tx.transactionId || id}`,
                  at: new Date()
                }
              }
            },
            { session }
          );
        }
      } else if (transactionType === "transfer" && tx.fromAccountId && tx.targetAccountId) {
        const fromAccount = await bankAccounts.findOne({ _id: new ObjectId(tx.fromAccountId) }, { session });
        const toAccount = await bankAccounts.findOne({ _id: new ObjectId(tx.targetAccountId) }, { session });
        
        if (fromAccount) {
          const fromNewBalance = (fromAccount.currentBalance || 0) + numericAmount;
          await bankAccounts.updateOne(
            { _id: new ObjectId(tx.fromAccountId) },
            {
              $set: { currentBalance: fromNewBalance, updatedAt: new Date() },
              $push: {
                balanceHistory: {
                  amount: numericAmount,
                  type: 'reversal',
                  note: `Transaction deletion: ${tx.transactionId || id}`,
                  at: new Date()
                }
              }
            },
            { session }
          );
        }
        
        if (toAccount) {
          const toNewBalance = (toAccount.currentBalance || 0) - numericAmount;
          await bankAccounts.updateOne(
            { _id: new ObjectId(tx.targetAccountId) },
            {
              $set: { currentBalance: toNewBalance, updatedAt: new Date() },
              $push: {
                balanceHistory: {
                  amount: -numericAmount,
                  type: 'reversal',
                  note: `Transaction deletion: ${tx.transactionId || id}`,
                  at: new Date()
                }
              }
            },
            { session }
          );
        }
      }

      // 2. Reverse party due/paid amount changes (simplified - implement full logic)
      if (tx.partyId && tx.partyType) {
        const partyId = tx.partyId;
        const isValidObjectId = ObjectId.isValid(partyId);
        const dueDelta = transactionType === 'debit' ? -numericAmount : (transactionType === 'credit' ? numericAmount : 0);

        // 2.1 Agent
        if (partyType === 'agent') {
          const agentCond = isValidObjectId
            ? { $or: [{ agentId: partyId }, { _id: new ObjectId(partyId) }], isActive: { $ne: false } }
            : { $or: [{ agentId: partyId }, { _id: partyId }], isActive: { $ne: false } };
          const agent = await agents.findOne(agentCond, { session });
          if (agent) {
            const agentUpdate = { $set: { updatedAt: new Date() }, $inc: { totalDue: dueDelta } };
            if (isHajjCategory) agentUpdate.$inc.hajDue = (agentUpdate.$inc.hajDue || 0) + dueDelta;
            if (isUmrahCategory) agentUpdate.$inc.umrahDue = (agentUpdate.$inc.umrahDue || 0) + dueDelta;
            if (transactionType === 'credit') agentUpdate.$inc.totalDeposit = (agentUpdate.$inc.totalDeposit || 0) - numericAmount;
            await agents.updateOne({ _id: agent._id }, agentUpdate, { session });
          }
        }

        // 2.2 Vendor (similar logic)
        if (partyType === 'vendor') {
          const vendorCond = isValidObjectId
            ? { $or: [{ vendorId: partyId }, { _id: new ObjectId(partyId) }], isActive: { $ne: false } }
            : { $or: [{ vendorId: partyId }, { _id: partyId }], isActive: { $ne: false } };
          const vendor = await vendors.findOne(vendorCond, { session });
          if (vendor) {
            const vendorDueDelta = transactionType === 'debit' ? numericAmount : (transactionType === 'credit' ? -numericAmount : 0);
            const vendorUpdate = { $set: { updatedAt: new Date() }, $inc: { totalDue: vendorDueDelta } };
            if (isHajjCategory) vendorUpdate.$inc.hajDue = (vendorUpdate.$inc.hajDue || 0) + vendorDueDelta;
            if (isUmrahCategory) vendorUpdate.$inc.umrahDue = (vendorUpdate.$inc.umrahDue || 0) + vendorDueDelta;
            if (transactionType === 'debit') vendorUpdate.$inc.totalPaid = (vendorUpdate.$inc.totalPaid || 0) - numericAmount;
            await vendors.updateOne({ _id: vendor._id }, vendorUpdate, { session });
          }
        }

        // 2.3 Customer (similar logic)
        if (partyType === 'customer') {
          const customerCond = isValidObjectId
            ? { $or: [{ customerId: partyId }, { _id: new ObjectId(partyId) }], isActive: { $ne: false } }
            : { $or: [{ customerId: partyId }, { _id: partyId }], isActive: { $ne: false } };
          
          let customer = await airCustomers.findOne(customerCond, { session });
          let customerCollection = airCustomers;
          
          if (!customer) {
            const otherCustomerCond = isValidObjectId
              ? { $or: [{ customerId: partyId }, { id: partyId }, { _id: new ObjectId(partyId) }], isActive: { $ne: false } }
              : { $or: [{ customerId: partyId }, { id: partyId }, { _id: partyId }], isActive: { $ne: false } };
            customer = await otherCustomers.findOne(otherCustomerCond, { session });
            if (customer) customerCollection = otherCustomers;
          }
          
          if (customer) {
            const customerUpdate = { $set: { updatedAt: new Date() }, $inc: { totalDue: dueDelta } };
            if (isHajjCategory) customerUpdate.$inc.hajjDue = (customerUpdate.$inc.hajjDue || 0) + dueDelta;
            if (isUmrahCategory) customerUpdate.$inc.umrahDue = (customerUpdate.$inc.umrahDue || 0) + dueDelta;
            if (transactionType === 'credit') customerUpdate.$inc.paidAmount = (customerUpdate.$inc.paidAmount || 0) - numericAmount;
            await customerCollection.updateOne({ _id: customer._id }, customerUpdate, { session });
          }
        }

        // Similar logic for haji, umrah, loan, investment, asset, employee
        // (Implement full logic from your Express.js code)

        // 2.4 Haji
        if (partyType === 'haji' && transactionType === 'credit') {
          const hajiCond = isValidObjectId
            ? { $or: [{ customerId: partyId }, { _id: new ObjectId(partyId) }], isActive: { $ne: false } }
            : { $or: [{ customerId: partyId }, { _id: partyId }], isActive: { $ne: false } };
          const hajiDoc = await haji.findOne(hajiCond, { session });
          if (hajiDoc) {
            await haji.updateOne(
              { _id: hajiDoc._id },
              { $inc: { paidAmount: -numericAmount }, $set: { updatedAt: new Date() } },
              { session }
            );
            const afterHaji = await haji.findOne({ _id: hajiDoc._id }, { session });
            await triggerFamilyRecomputeForHaji(afterHaji, { session });
          }
        }

        // 2.5 Umrah
        if (partyType === 'umrah' && transactionType === 'credit') {
          const umrahCond = isValidObjectId
            ? { $or: [{ customerId: partyId }, { _id: new ObjectId(partyId) }] }
            : { $or: [{ customerId: partyId }, { _id: partyId }] };
          const umrahDoc = await umrah.findOne(umrahCond, { session });
          if (umrahDoc) {
            await umrah.updateOne(
              { _id: umrahDoc._id },
              { $inc: { paidAmount: -numericAmount }, $set: { updatedAt: new Date() } },
              { session }
            );
            const afterUmrah = await umrah.findOne({ _id: umrahDoc._id }, { session });
            await triggerFamilyRecomputeForUmrah(afterUmrah, { session });
          }
        }

        // 2.6 Loan, Investment, Asset, Employee reversals
        // (Implement full logic from your Express.js code)
      }

      // 3. Reverse operating expense category updates
      if (tx.operatingExpenseCategoryId && ObjectId.isValid(String(tx.operatingExpenseCategoryId)) && transactionType === 'debit') {
        await operatingExpenseCategories.updateOne(
          { _id: new ObjectId(String(tx.operatingExpenseCategoryId)) },
          { 
            $inc: { totalAmount: -numericAmount, itemCount: -1 }, 
            $set: { lastUpdated: new Date().toISOString().slice(0, 10) } 
          },
          { session }
        );
      }

      // 4. Unlink money exchange records
      if ((partyType === 'money-exchange' || partyType === 'money_exchange') && tx.transactionId) {
        try {
          const exchangeId = tx.partyId && ObjectId.isValid(tx.partyId) ? new ObjectId(tx.partyId) : null;
          if (exchangeId) {
            await exchanges.updateOne(
              { _id: exchangeId },
              { 
                $set: { 
                  transactionId: null,
                  transactionLinked: false,
                  updatedAt: new Date() 
                } 
              },
              { session }
            );
          }
        } catch (exchangeErr) {
          console.warn('Failed to unlink exchange from transaction:', exchangeErr?.message);
        }
      }

      // 5. Delete the transaction
      const deleteResult = await transactions.deleteOne({ _id: new ObjectId(id) }, { session });
      if (deleteResult.deletedCount === 0) {
        throw new Error("Failed to delete transaction");
      }

      // Commit transaction
      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: "Transaction deleted successfully"
      });

    } catch (transactionError) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      throw transactionError;
    }

  } catch (err) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error('Transaction deletion error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || "Failed to delete transaction"
    }, { status: 500 });
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
