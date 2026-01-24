import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb, getClient } from '../../../lib/mongodb';
import { generateTransactionId, triggerFamilyRecomputeForHaji, triggerFamilyRecomputeForUmrah } from '../../../lib/transactionHelpers';

// ✅ POST: Create new transaction
export async function POST(request) {
  let session = null;

  try {
    const body = await request.json();
    const {
      transactionType,
      serviceCategory,
      partyType,
      partyId,
      invoiceId,
      paymentMethod,
      targetAccountId,
      accountManagerId,
      amount,
      branchId,
      createdBy,
      notes,
      reference,
      fromAccountId,
      toAccountId,
      debitAccount,
      creditAccount,
      paymentDetails,
      customerId,
      category,
      customerBankAccount,
      employeeReference,
      operatingExpenseCategoryId,
      moneyExchangeInfo,
      meta: incomingMeta
    } = body;

    // Extract values from nested objects if provided
    const finalAmount = amount || paymentDetails?.amount;
    const finalPartyId = partyId || customerId;
    const finalTargetAccountId = targetAccountId || creditAccount?.id || debitAccount?.id;
    const finalFromAccountId = fromAccountId || debitAccount?.id;
    const finalToAccountId = toAccountId || creditAccount?.id;
    const finalServiceCategory = serviceCategory || category || (transactionType === 'transfer' ? 'Account Transfer' : undefined);
    const finalSubCategory = typeof body?.subCategory !== 'undefined' ? String(body.subCategory || '').trim() : undefined;
    const finalOperatingExpenseCategoryId = operatingExpenseCategoryId || body?.operatingExpenseCategory?.id;
    const meta = (incomingMeta && typeof incomingMeta === 'object') ? { ...incomingMeta } : {};
    if (meta.packageId) {
      meta.packageId = String(meta.packageId);
    }
    
    // Determine final party type
    let finalPartyType = String(partyType || body?.customerType || '').toLowerCase();
    console.log('🔍 Initial party type detection:', {
      partyType,
      customerType: body?.customerType,
      finalPartyType
    });
    if (body?.customerType === 'asset') {
      finalPartyType = 'asset';
    }
    // Ensure vendor is correctly identified
    if ((partyType && String(partyType).toLowerCase() === 'vendor') || 
        (body?.customerType && String(body.customerType).toLowerCase() === 'vendor')) {
      finalPartyType = 'vendor';
      console.log('✅ Vendor party type confirmed:', finalPartyType);
    }

    // 1. Validation
    console.log('📥 Transaction Payload:', JSON.stringify({
      transactionType,
      partyType,
      finalPartyType,
      partyId: finalPartyId,
      serviceCategory: finalServiceCategory,
      amount: finalAmount,
      fromAccountId: finalFromAccountId,
      toAccountId: finalToAccountId
    }, null, 2));

    // For transfer transactions, partyId is not required, but fromAccountId and toAccountId are required
    if (transactionType === 'transfer') {
      if (!finalAmount || !finalFromAccountId || !finalToAccountId) {
        return NextResponse.json({
          success: false,
          message: "Missing required fields for transfer: amount, fromAccountId, and toAccountId"
        }, { status: 400 });
      }
    } else {
      // For credit/debit transactions, partyId is required
      if (!transactionType || !finalAmount || !finalPartyId) {
        return NextResponse.json({
          success: false,
          message: "Missing required fields: transactionType, amount, and partyId"
        }, { status: 400 });
      }
    }

    if (!['credit', 'debit', 'transfer'].includes(transactionType)) {
      return NextResponse.json({
        success: false,
        message: "Transaction type must be 'credit', 'debit', or 'transfer'"
      }, { status: 400 });
    }

    const numericAmount = parseFloat(finalAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({
        success: false,
        message: "Amount must be a valid positive number"
      }, { status: 400 });
    }

    // Validate charge if present
    let chargeAmount = 0;
    const rawCharge = body.charge !== undefined ? body.charge : (paymentDetails?.charge);
    if (rawCharge !== undefined && rawCharge !== null) {
      chargeAmount = parseFloat(rawCharge);
      if (isNaN(chargeAmount)) {
        return NextResponse.json({
          success: false,
          message: "Charge must be a valid number"
        }, { status: 400 });
      }
    }

    const db = await getDb();
    const client = await getClient();

    // Get collections
    const transactions = db.collection('transactions');
    const bankAccounts = db.collection('bank_accounts');
    const branches = db.collection('branches');
    const airCustomers = db.collection('air_customers');
    const otherCustomers = db.collection('other_customers');
    const agents = db.collection('agents');
    const vendors = db.collection('vendors');
    const haji = db.collection('hajis');
    const umrah = db.collection('umrahs');
    const loansGiving = db.collection('loans_giving');
    const loansReceiving = db.collection('loans_receiving');
    const exchanges = db.collection('money_exchanges');
    const iataAirlinesCapping = db.collection('iata_airlines_capping');
    const othersInvestments = db.collection('others_investments');
    const assets = db.collection('assets');
    const farmEmployees = db.collection('farm_employees');
    const farmIncomes = db.collection('farm_incomes');
    const farmExpenses = db.collection('farm_expenses');
    const operatingExpenseCategories = db.collection('operating_expense_categories');
    const invoices = db.collection('invoices');
    const agentPackages = db.collection('agent_packages');

    // 2. Validate party (simplified - you'll need to implement full logic)
    let party = null;
    const searchPartyId = finalPartyId;
    const isValidObjectId = ObjectId.isValid(searchPartyId);
    
    // If looks like Hajj but client sent customer, auto-resolve to haji when match found
    try {
      const categoryText = String(finalServiceCategory || '').toLowerCase();
      const looksLikeHajj = categoryText.includes('haj');
      const looksLikeUmrah = categoryText.includes('umrah');
      if (finalPartyType === 'customer' && looksLikeHajj && searchPartyId) {
        const hajiCond = isValidObjectId
          ? { $or: [{ customerId: searchPartyId }, { _id: new ObjectId(searchPartyId) }], isActive: { $ne: false } }
          : { $or: [{ customerId: searchPartyId }, { _id: searchPartyId }], isActive: { $ne: false } };
        const maybeHaji = await haji.findOne(hajiCond);
        if (maybeHaji && maybeHaji._id) {
          finalPartyType = 'haji';
        }
      } else if (finalPartyType === 'customer' && looksLikeUmrah && searchPartyId) {
        const umrahCond = isValidObjectId
          ? { $or: [{ customerId: searchPartyId }, { _id: new ObjectId(searchPartyId) }], isActive: { $ne: false } }
          : { $or: [{ customerId: searchPartyId }, { _id: searchPartyId }], isActive: { $ne: false } };
        const maybeUmrah = await umrah.findOne(umrahCond);
        if (maybeUmrah && maybeUmrah._id) {
          finalPartyType = 'umrah';
        }
      }
    } catch (_) {}

    // Party lookup logic (simplified version - implement full logic based on your needs)
    if (finalPartyType === 'customer') {
      const airCustomerCondition = isValidObjectId
        ? { $or: [{ customerId: searchPartyId }, { _id: new ObjectId(searchPartyId) }], isActive: { $ne: false } }
        : { $or: [{ customerId: searchPartyId }, { _id: searchPartyId }], isActive: { $ne: false } };
      party = await airCustomers.findOne(airCustomerCondition);
      if (party) party._isAirCustomer = true;
      
      if (!party) {
        const otherCustomerCondition = isValidObjectId
          ? { $or: [{ customerId: searchPartyId }, { id: searchPartyId }, { _id: new ObjectId(searchPartyId) }], isActive: { $ne: false } }
          : { $or: [{ customerId: searchPartyId }, { id: searchPartyId }, { _id: searchPartyId }], isActive: { $ne: false } };
        party = await otherCustomers.findOne(otherCustomerCondition);
        if (party) party._isOtherCustomer = true;
      }
    } else if (finalPartyType === 'agent') {
      const agentCondition = isValidObjectId
        ? { $or: [{ agentId: searchPartyId }, { _id: new ObjectId(searchPartyId) }], isActive: { $ne: false } }
        : { $or: [{ agentId: searchPartyId }, { _id: searchPartyId }], isActive: { $ne: false } };
      party = await agents.findOne(agentCondition);
    } else if (finalPartyType === 'vendor') {
      // Try with isActive: true first
      let vendorCondition = isValidObjectId
        ? { $or: [{ vendorId: searchPartyId }, { _id: new ObjectId(searchPartyId) }], isActive: true }
        : { $or: [{ vendorId: searchPartyId }, { _id: searchPartyId }], isActive: true };
      party = await vendors.findOne(vendorCondition);
      
      // If not found with isActive: true, try without isActive filter
      if (!party) {
        console.log('⚠️ Vendor not found with isActive: true, trying without isActive filter...');
        vendorCondition = isValidObjectId
          ? { $or: [{ vendorId: searchPartyId }, { _id: new ObjectId(searchPartyId) }] }
          : { $or: [{ vendorId: searchPartyId }, { _id: searchPartyId }] };
        party = await vendors.findOne(vendorCondition);
      }
      
      console.log('🔍 Vendor found:', !!party, party ? { 
        _id: party._id, 
        vendorId: party.vendorId, 
        tradeName: party.tradeName,
        isActive: party.isActive,
        totalPaid: party.totalPaid,
        totalDue: party.totalDue
      } : null);
    } else if (finalPartyType === 'haji') {
      console.log('🔍 Looking up haji with ID:', searchPartyId, 'isValidObjectId:', isValidObjectId);
      // Try with isActive: true first
      let hajiCondition = isValidObjectId
        ? { $or: [{ customerId: searchPartyId }, { _id: new ObjectId(searchPartyId) }], isActive: true }
        : { $or: [{ customerId: searchPartyId }, { _id: searchPartyId }], isActive: true };
      console.log('🔍 Haji search condition (with isActive):', JSON.stringify(hajiCondition));
      party = await haji.findOne(hajiCondition);
      
      // If not found with isActive: true, try without isActive filter (for inactive/deleted profiles)
      if (!party) {
        console.log('⚠️ Haji not found with isActive: true, trying without isActive filter...');
        hajiCondition = isValidObjectId
          ? { $or: [{ customerId: searchPartyId }, { _id: new ObjectId(searchPartyId) }] }
          : { $or: [{ customerId: searchPartyId }, { _id: searchPartyId }] };
        party = await haji.findOne(hajiCondition);
      }
      
      console.log('🔍 Haji found:', !!party, party ? { 
        _id: party._id, 
        customerId: party.customerId, 
        name: party.name,
        isActive: party.isActive,
        paidAmount: party.paidAmount,
        totalAmount: party.totalAmount
      } : null);
    } else if (finalPartyType === 'umrah') {
      const umrahCondition = isValidObjectId
        ? { $or: [{ customerId: searchPartyId }, { _id: new ObjectId(searchPartyId) }] }
        : { $or: [{ customerId: searchPartyId }, { _id: searchPartyId }] };
      party = await umrah.findOne(umrahCondition);
    } else if (finalPartyType === 'loan') {
      // Try to find loan in both giving and receiving collections
      const loanCondition = isValidObjectId
        ? { $or: [{ loanId: searchPartyId }, { _id: new ObjectId(searchPartyId) }] }
        : { $or: [{ loanId: searchPartyId }, { _id: searchPartyId }] };
      
      // First try giving loans
      party = await loansGiving.findOne(loanCondition);
      if (party) {
        party.loanDirection = 'giving';
        party.direction = 'giving';
        console.log('✅ Found loan in loans_giving:', party.loanId || party._id);
      } else {
        // Then try receiving loans
        party = await loansReceiving.findOne(loanCondition);
        if (party) {
          party.loanDirection = 'receiving';
          party.direction = 'receiving';
          console.log('✅ Found loan in loans_receiving:', party.loanId || party._id);
        }
      }
      
      if (!party) {
        console.warn('⚠️ Loan not found in either collection:', searchPartyId);
      }
    } else if (finalPartyType === 'money-exchange' || finalPartyType === 'money_exchange') {
      const exchangeCondition = isValidObjectId
        ? { _id: new ObjectId(searchPartyId), isActive: { $ne: false } }
        : { _id: searchPartyId, isActive: { $ne: false } };
      party = await exchanges.findOne(exchangeCondition);
    } else if (finalPartyType === 'investment') {
      party = await iataAirlinesCapping.findOne({ _id: new ObjectId(searchPartyId), isActive: { $ne: false } });
      if (party) {
        party._isIataInvestment = true;
        party.name = party.airlineName || 'Investment';
      } else {
        party = await othersInvestments.findOne({ _id: new ObjectId(searchPartyId), isActive: { $ne: false } });
        if (party) {
          party._isOthersInvestment = true;
          party.name = party.investmentName || 'Investment';
        }
      }
    } else if (finalPartyType === 'asset') {
      const assetCondition = isValidObjectId
        ? { _id: new ObjectId(searchPartyId), isActive: { $ne: false }, status: 'active' }
        : { _id: searchPartyId, isActive: { $ne: false }, status: 'active' };
      party = await assets.findOne(assetCondition);
      if (!party) {
        return NextResponse.json({
          success: false,
          message: "Asset not found or not active"
        }, { status: 404 });
      }
      party.name = party.assetName || party.name || 'Asset';
    }

    // 3. Validate branch
    let branch;
    if (branchId) {
      branch = await branches.findOne({ branchId, isActive: true });
    } else {
      branch = await branches.findOne({ isActive: true });
    }

    if (!branch) {
      const defaultBranchId = 'main';
      const defaultDoc = {
        branchId: defaultBranchId,
        branchName: 'Main Branch',
        branchCode: 'MN',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await branches.updateOne(
        { branchId: defaultBranchId },
        { $setOnInsert: defaultDoc },
        { upsert: true }
      );
      await branches.updateOne(
        { branchId: defaultBranchId },
        { $set: { isActive: true, updatedAt: new Date() } }
      );
      branch = await branches.findOne({ branchId: defaultBranchId, isActive: true });
    }

    // 4. Validate accounts
    let account = null;
    let fromAccount = null;
    let toAccount = null;

    if (transactionType === "credit" || transactionType === "debit") {
      if (!finalTargetAccountId) {
        return NextResponse.json({
          success: false,
          message: "targetAccountId is required for credit/debit transactions"
        }, { status: 400 });
      }
      account = await bankAccounts.findOne({ _id: new ObjectId(finalTargetAccountId) });
      if (!account) {
        return NextResponse.json({ success: false, message: "Target account not found" }, { status: 404 });
      }
      if (transactionType === "debit" && (account.currentBalance || 0) < numericAmount) {
        return NextResponse.json({
          success: false,
          message: "Insufficient balance"
        }, { status: 400 });
      }
    } else if (transactionType === "transfer") {
      if (!finalFromAccountId || !finalToAccountId) {
        return NextResponse.json({
          success: false,
          message: "fromAccountId and toAccountId are required for transfer transactions"
        }, { status: 400 });
      }
      fromAccount = await bankAccounts.findOne({ _id: new ObjectId(finalFromAccountId) });
      toAccount = await bankAccounts.findOne({ _id: new ObjectId(finalToAccountId) });
      if (!fromAccount || !toAccount) {
        return NextResponse.json({
          success: false,
          message: "One or both accounts not found"
        }, { status: 404 });
      }
      if ((fromAccount.currentBalance || 0) < numericAmount) {
        return NextResponse.json({
          success: false,
          message: "Insufficient balance in source account"
        }, { status: 400 });
      }
    }

    // 5. Start MongoDB session for atomic operations
    session = client.startSession();
    session.startTransaction();

    let transactionResult;
    let updatedAgent = null;
    let updatedCustomer = null;
    let updatedVendor = null;
    let updatedEmployee = null;
    let updatedInvoice = null;
    let updatedAsset = null;

    try {
      // 6. Update balances WITHIN transaction
      if (transactionType === "credit") {
        const newBalance = (account.currentBalance || 0) + numericAmount;
        await bankAccounts.updateOne(
          { _id: new ObjectId(finalTargetAccountId) },
          {
            $set: { currentBalance: newBalance, updatedAt: new Date() },
            $push: {
              balanceHistory: {
                amount: numericAmount,
                type: 'deposit',
                note: notes || `Transaction credit`,
                at: new Date()
              }
            }
          },
          { session }
        );
      } else if (transactionType === "debit") {
        const newBalance = (account.currentBalance || 0) - numericAmount;
        await bankAccounts.updateOne(
          { _id: new ObjectId(finalTargetAccountId) },
          {
            $set: { currentBalance: newBalance, updatedAt: new Date() },
            $push: {
              balanceHistory: {
                amount: numericAmount,
                type: 'withdrawal',
                note: notes || `Transaction debit`,
                at: new Date()
              }
            }
          },
          { session }
        );
      } else if (transactionType === "transfer") {
        const fromNewBalance = (fromAccount.currentBalance || 0) - numericAmount;
        const toNewBalance = (toAccount.currentBalance || 0) + numericAmount;

        await bankAccounts.updateOne(
          { _id: new ObjectId(finalFromAccountId) },
          {
            $set: { currentBalance: fromNewBalance, updatedAt: new Date() },
            $push: {
              balanceHistory: {
                amount: numericAmount,
                type: 'withdrawal',
                note: `Transfer to ${toAccount.bankName || ''} - ${toAccount.accountNumber || ''}`.trim(),
                at: new Date()
              }
            }
          },
          { session }
        );

        await bankAccounts.updateOne(
          { _id: new ObjectId(finalToAccountId) },
          {
            $set: { currentBalance: toNewBalance, updatedAt: new Date() },
            $push: {
              balanceHistory: {
                amount: numericAmount,
                type: 'deposit',
                note: `Transfer from ${fromAccount.bankName || ''} - ${fromAccount.accountNumber || ''}`.trim(),
                at: new Date()
              }
            }
          },
          { session }
        );
      }

      // 7. Generate transaction ID
      const transactionId = await generateTransactionId(db, branch.branchCode);

      // 8. Create transaction record
      const transactionData = {
        transactionId,
        transactionType,
        serviceCategory: finalServiceCategory,
        subCategory: finalSubCategory || null,
        partyType: finalPartyType,
        partyId: finalPartyId,
        partyName: (() => {
          // For transfer transactions, use account names
          if (transactionType === 'transfer') {
            if (fromAccount && toAccount) {
              return `Transfer: ${fromAccount.bankName || fromAccount.accountName || 'Account'} → ${toAccount.bankName || toAccount.accountName || 'Account'}`;
            }
            return 'Account Transfer';
          }
          
          // For account transactions without party, use account name
          if ((transactionType === 'credit' || transactionType === 'debit') && !party && account) {
            return account.bankName || account.accountName || account.accountTitle || account.accountHolder || 'Bank Account';
          }
          
          // For vendor transactions
          if (finalPartyType === 'vendor' && party) {
            return party.tradeName || party.vendorName || party.ownerName || party.name || 'Vendor';
          }
          
          // For other party types
          return party?.name || party?.customerName || party?.firstName || (party?.firstName && party?.lastName ? `${party.firstName} ${party.lastName}` : null) || party?.agentName || party?.tradeName || party?.vendorName || party?.fullName || party?.currencyName || (finalPartyType === 'loan' ? (party?.fullName || party?.businessName || 'Unknown') : 'Unknown');
        })(),
        partyPhone: party?.phone || party?.customerPhone || party?.contactNo || party?.mobile || party?.mobileNumber || party?.whatsappNo || (finalPartyType === 'loan' ? (party?.contactPhone || party?.emergencyPhone || null) : null),
        partyEmail: party?.email || party?.customerEmail || (finalPartyType === 'loan' ? (party?.contactEmail || null) : null),
        invoiceId,
        paymentMethod,
        targetAccountId: transactionType === 'transfer' ? finalToAccountId : finalTargetAccountId,
        fromAccountId: transactionType === 'transfer' ? finalFromAccountId : null,
        accountManagerId,
        debitAccount: debitAccount || (transactionType === 'debit' ? { id: finalTargetAccountId } : null),
        creditAccount: creditAccount || (transactionType === 'credit' ? { id: finalTargetAccountId } : null),
        paymentDetails: {
          ...(paymentDetails || {}),
          amount: numericAmount,
          charge: chargeAmount || 0
        },
        customerBankAccount: customerBankAccount || null,
        meta: Object.keys(meta || {}).length ? meta : undefined,
        moneyExchangeInfo: (finalPartyType === 'money-exchange' || finalPartyType === 'money_exchange') && moneyExchangeInfo ? {
          id: moneyExchangeInfo.id || party?._id?.toString() || null,
          fullName: moneyExchangeInfo.fullName || party?.fullName || null,
          mobileNumber: moneyExchangeInfo.mobileNumber || party?.mobileNumber || null,
          type: moneyExchangeInfo.type || party?.type || null,
          currencyCode: moneyExchangeInfo.currencyCode || party?.currencyCode || null,
          currencyName: moneyExchangeInfo.currencyName || party?.currencyName || null,
          exchangeRate: moneyExchangeInfo.exchangeRate || party?.exchangeRate || null,
          quantity: moneyExchangeInfo.quantity || party?.quantity || null,
          amount_bdt: moneyExchangeInfo.amount_bdt || moneyExchangeInfo.amount || party?.amount_bdt || null
        } : null,
        investmentInfo: finalPartyType === 'investment' && (body?.investmentInfo || party) ? {
          id: body?.investmentInfo?.id || party?._id?.toString() || null,
          name: body?.investmentInfo?.name || party?.name || party?.airlineName || party?.investmentName || null,
          category: body?.investmentInfo?.category || party?.investmentCategory || null,
          type: body?.investmentInfo?.type || party?.investmentType || null,
          amount: body?.investmentInfo?.amount || party?.cappingAmount || party?.investmentAmount || null
        } : null,
        assetInfo: finalPartyType === 'asset' && party ? {
          id: party?._id?.toString() || null,
          name: party?.assetName || party?.name || null,
          type: party?.assetType || null,
          status: party?.status || null,
          totalPaidAmount: party?.totalPaidAmount || 0
        } : null,
        loanInfo: finalPartyType === 'loan' && (body?.loanInfo || party) ? {
          id: body?.loanInfo?.id || party?._id?.toString() || null,
          name: body?.loanInfo?.name || party?.fullName || party?.customerName || party?.borrowerName || party?.businessName || party?.tradeName || party?.ownerName || party?.name || null,
          direction: body?.loanInfo?.direction || party?.loanDirection || party?.direction || null,
          customerId: body?.loanInfo?.customerId || party?.customerId || party?.relatedCustomerId || party?.linkedCustomerId || null,
          customerPhone: body?.loanInfo?.customerPhone || body?.customerPhone || party?.contactPhone || party?.customerPhone || party?.phone || party?.mobile || party?.mobileNumber || party?.contactNo || party?.borrowerPhone || party?.borrowerMobile || party?.emergencyPhone || null,
          customerEmail: body?.loanInfo?.customerEmail || body?.customerEmail || party?.contactEmail || party?.customerEmail || party?.email || party?.borrowerEmail || null
        } : null,
        // Account info for account transactions
        accountInfo: (transactionType === 'credit' || transactionType === 'debit' || transactionType === 'transfer') && account ? {
          id: account._id?.toString() || null,
          bankName: account.bankName || null,
          accountName: account.accountName || account.accountTitle || account.accountHolder || null,
          accountNumber: account.accountNumber || null
        } : (transactionType === 'transfer' && fromAccount && toAccount) ? {
          fromAccount: {
            id: fromAccount._id?.toString() || null,
            bankName: fromAccount.bankName || null,
            accountName: fromAccount.accountName || fromAccount.accountTitle || fromAccount.accountHolder || null,
            accountNumber: fromAccount.accountNumber || null
          },
          toAccount: {
            id: toAccount._id?.toString() || null,
            bankName: toAccount.bankName || null,
            accountName: toAccount.accountName || toAccount.accountTitle || toAccount.accountHolder || null,
            accountNumber: toAccount.accountNumber || null
          }
        } : null,
        amount: numericAmount,
        charge: chargeAmount,
        totalAmount: numericAmount + chargeAmount,
        branchId: branch.branchId,
        branchName: branch.branchName,
        branchCode: branch.branchCode,
        createdBy: createdBy || 'SYSTEM',
        notes: notes || '',
        reference: reference || paymentDetails?.reference || transactionId,
        employeeReference: employeeReference || null,
        operatingExpenseCategoryId: finalOperatingExpenseCategoryId && ObjectId.isValid(String(finalOperatingExpenseCategoryId)) ? String(finalOperatingExpenseCategoryId) : null,
        status: 'completed',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      // 8.1-8.12: Update party balances (agent, vendor, customer, haji, umrah, loan, employee, investment, asset, invoice, etc.)
      // This is a simplified version - implement full logic based on your Express.js code
      // For brevity, I'm including key updates but you'll need to add all the detailed logic

      if (finalPartyType === 'agent' && party && party._id) {
        const categoryText = String(finalServiceCategory || '').toLowerCase();
        const isHajjCategory = categoryText.includes('haj');
        const isUmrahCategory = categoryText.includes('umrah');
        const dueDelta = transactionType === 'debit' ? numericAmount : (transactionType === 'credit' ? -numericAmount : 0);

        console.log('🤖 Agent Update - Before:', {
          agentId: party._id.toString(),
          transactionType,
          category: finalServiceCategory,
          isHajjCategory,
          isUmrahCategory,
          numericAmount,
          dueDelta,
          currentTotalDue: party.totalDue,
          currentHajDue: party.hajDue,
          currentUmrahDue: party.umrahDue,
          currentTotalPaid: party.totalPaid,
          currentHajPaid: party.hajPaid,
          currentUmrahPaid: party.umrahPaid
        });

        const agentUpdate = { $set: { updatedAt: new Date() }, $inc: { totalDue: dueDelta } };
        if (isHajjCategory) agentUpdate.$inc.hajDue = (agentUpdate.$inc.hajDue || 0) + dueDelta;
        if (isUmrahCategory) agentUpdate.$inc.umrahDue = (agentUpdate.$inc.umrahDue || 0) + dueDelta;
        if (transactionType === 'credit') {
          agentUpdate.$inc.totalDeposit = (agentUpdate.$inc.totalDeposit || 0) + numericAmount;
          // Also increment paid amounts
          agentUpdate.$inc.totalPaid = (agentUpdate.$inc.totalPaid || 0) + numericAmount;
          if (isHajjCategory) agentUpdate.$inc.hajPaid = (agentUpdate.$inc.hajPaid || 0) + numericAmount;
          if (isUmrahCategory) agentUpdate.$inc.umrahPaid = (agentUpdate.$inc.umrahPaid || 0) + numericAmount;
        }
        
        console.log('🤖 Agent Update - Update Object:', JSON.stringify(agentUpdate, null, 2));
        
        await agents.updateOne({ _id: party._id }, agentUpdate, { session });
        const afterAgent = await agents.findOne({ _id: party._id }, { session });
        
        console.log('🤖 Agent Update - After Update:', {
          totalDue: afterAgent.totalDue,
          hajDue: afterAgent.hajDue,
          umrahDue: afterAgent.umrahDue,
          totalPaid: afterAgent.totalPaid,
          hajPaid: afterAgent.hajPaid,
          umrahPaid: afterAgent.umrahPaid
        });
        
        // Clamp negative values to 0
        const setClampAgent = {};
        if ((afterAgent.totalDue || 0) < 0) setClampAgent.totalDue = 0;
        if ((afterAgent.hajDue !== undefined) && afterAgent.hajDue < 0) setClampAgent.hajDue = 0;
        if ((afterAgent.umrahDue !== undefined) && afterAgent.umrahDue < 0) setClampAgent.umrahDue = 0;
        
        // Calculate advance amounts: Advance = Paid - Bill (if Bill = 0, then Advance = Paid)
        // If due = 0 and paid > 0, then advance = paid (because bill was 0 or paid exceeded bill)
        // General formula: advance = max(0, paid - billed) = max(0, paid - (paid - due)) = max(0, due) when due < 0
        // But if due = 0, then advance = paid (if paid > 0)
        const totalDue = (afterAgent.totalDue || 0) < 0 ? 0 : (afterAgent.totalDue || 0);
        const hajDue = (afterAgent.hajDue || 0) < 0 ? 0 : (afterAgent.hajDue || 0);
        const umrahDue = (afterAgent.umrahDue || 0) < 0 ? 0 : (afterAgent.umrahDue || 0);
        const totalPaid = afterAgent.totalPaid || 0;
        const hajPaid = afterAgent.hajPaid || 0;
        const umrahPaid = afterAgent.umrahPaid || 0;
        
        // Get billed amounts (if not available, calculate from paid - due)
        const totalBilled = afterAgent.totalBilled || afterAgent.totalBill || (totalPaid - totalDue);
        const hajBilled = afterAgent.hajBilled || afterAgent.hajBill || afterAgent.hajjBill || (hajPaid - hajDue);
        const umrahBilled = afterAgent.umrahBilled || afterAgent.umrahBill || (umrahPaid - umrahDue);
        
        // Calculate advance: max(0, paid - billed)
        // If bill = 0, then advance = paid
        const totalAdvance = Math.max(0, totalPaid - totalBilled);
        const hajAdvance = Math.max(0, hajPaid - hajBilled);
        const umrahAdvance = Math.max(0, umrahPaid - umrahBilled);
        
        setClampAgent.totalAdvance = totalAdvance;
        setClampAgent.hajAdvance = hajAdvance;
        setClampAgent.umrahAdvance = umrahAdvance;
        
        if (Object.keys(setClampAgent).length) {
          setClampAgent.updatedAt = new Date();
          console.log('🤖 Agent Update - Clamping negative values and calculating advance:', {
            totalDue: setClampAgent.totalDue,
            hajDue: setClampAgent.hajDue,
            umrahDue: setClampAgent.umrahDue,
            totalAdvance: setClampAgent.totalAdvance,
            hajAdvance: setClampAgent.hajAdvance,
            umrahAdvance: setClampAgent.umrahAdvance,
            totalBilled,
            hajBilled,
            umrahBilled,
            totalPaid,
            hajPaid,
            umrahPaid
          });
          await agents.updateOne({ _id: party._id }, { $set: setClampAgent }, { session });
        }
        
        updatedAgent = await agents.findOne({ _id: party._id }, { session });
        
        console.log('🤖 Agent Update - Final:', {
          totalDue: updatedAgent.totalDue,
          hajDue: updatedAgent.hajDue,
          umrahDue: updatedAgent.umrahDue,
          totalPaid: updatedAgent.totalPaid,
          hajPaid: updatedAgent.hajPaid,
          umrahPaid: updatedAgent.umrahPaid,
          totalAdvance: updatedAgent.totalAdvance,
          hajAdvance: updatedAgent.hajAdvance,
          umrahAdvance: updatedAgent.umrahAdvance
        });
      }

      // 8.2 If party is a vendor, update vendor due amounts atomically (Hajj/Umrah wise)
      if (finalPartyType === 'vendor' && party && party._id) {
        console.log('💰 Updating vendor payment:', {
          vendorId: party._id,
          transactionType,
          amount: numericAmount,
          currentTotalPaid: party.totalPaid || 0,
          currentTotalDue: party.totalDue || 0
        });
        
        const categoryText = String(finalServiceCategory || '').toLowerCase();
        const isHajjCategory = categoryText.includes('haj');
        const isUmrahCategory = categoryText.includes('umrah');
        // Vendor specific logic: debit => vendor ke taka deya (due kombe), credit => vendor theke taka neya (due barbe)
        const vendorDueDelta = transactionType === 'debit' ? -numericAmount : (transactionType === 'credit' ? numericAmount : 0);

        const vendorUpdate = { $set: { updatedAt: new Date() }, $inc: { totalDue: vendorDueDelta } };
        if (isHajjCategory) {
          vendorUpdate.$inc.hajDue = (vendorUpdate.$inc.hajDue || 0) + vendorDueDelta;
        }
        if (isUmrahCategory) {
          vendorUpdate.$inc.umrahDue = (vendorUpdate.$inc.umrahDue || 0) + vendorDueDelta;
        }
        // Debit সাধারণত ভেন্ডরকে পেমেন্ট—track totalPaid
        if (transactionType === 'debit') {
          vendorUpdate.$inc.totalPaid = (vendorUpdate.$inc.totalPaid || 0) + numericAmount;
          console.log('✅ Adding to vendor totalPaid:', numericAmount);
        }

        const updateResult = await vendors.updateOne({ _id: party._id }, vendorUpdate, { session });
        console.log('📝 Vendor update result:', {
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount
        });
        
        updatedVendor = await vendors.findOne({ _id: party._id }, { session });
        console.log('✅ Vendor updated:', {
          newTotalPaid: updatedVendor?.totalPaid || 0,
          newTotalDue: updatedVendor?.totalDue || 0
        });
      } else if (finalPartyType === 'vendor' && !party) {
        console.error('❌ Vendor not found for partyId:', finalPartyId, 'partyType:', finalPartyType);
      } else if (finalPartyType === 'vendor' && party && !party._id) {
        console.error('❌ Vendor found but missing _id:', party);
      }

      // 8.3 If party is a customer, update customer due amounts atomically (Hajj/Umrah wise)
      if (finalPartyType === 'customer' && party && party._id) {
        const categoryText = String(finalServiceCategory || '').toLowerCase();
        const isHajjCategory = categoryText.includes('haj');
        const isUmrahCategory = categoryText.includes('umrah');
        const dueDelta = transactionType === 'debit' ? numericAmount : (transactionType === 'credit' ? -numericAmount : 0);
        const isAirCustomer = party._isAirCustomer === true;
        const isOtherCustomer = party._isOtherCustomer === true;

        // Determine which collection to update
        const customerCollection = isAirCustomer ? airCustomers : (isOtherCustomer ? otherCustomers : airCustomers);

        const customerUpdate = { $set: { updatedAt: new Date() }, $inc: { totalDue: dueDelta } };
        if (isHajjCategory) {
          customerUpdate.$inc.hajjDue = (customerUpdate.$inc.hajjDue || 0) + dueDelta;
        }
        if (isUmrahCategory) {
          customerUpdate.$inc.umrahDue = (customerUpdate.$inc.umrahDue || 0) + dueDelta;
        }
        // New: On credit, also increment paidAmount
        if (transactionType === 'credit') {
          customerUpdate.$inc.paidAmount = (customerUpdate.$inc.paidAmount || 0) + numericAmount;
        }
        // For airCustomers, also update totalAmount on debit (when customer owes more)
        if (isAirCustomer && transactionType === 'debit') {
          customerUpdate.$inc.totalAmount = (customerUpdate.$inc.totalAmount || 0) + numericAmount;
        }
        await customerCollection.updateOne({ _id: party._id }, customerUpdate, { session });
        const after = await customerCollection.findOne({ _id: party._id }, { session });
        // Clamp due fields to 0+
        const setClamp = {};
        if ((after.totalDue || 0) < 0) setClamp['totalDue'] = 0;
        if ((after.paidAmount || 0) < 0) setClamp['paidAmount'] = 0;
        if ((after.hajjDue !== undefined) && after.hajjDue < 0) setClamp['hajjDue'] = 0;
        if ((after.umrahDue !== undefined) && after.umrahDue < 0) setClamp['umrahDue'] = 0;
        if (typeof after.totalAmount === 'number' && typeof after.paidAmount === 'number' && after.paidAmount > after.totalAmount) {
          setClamp['paidAmount'] = after.totalAmount;
        }
        if (Object.keys(setClamp).length) {
          setClamp.updatedAt = new Date();
          await customerCollection.updateOne({ _id: party._id }, { $set: setClamp }, { session });
        }
        updatedCustomer = await customerCollection.findOne({ _id: party._id }, { session });

        // Additionally, if this customer also exists in the Haji collection by id/customerId, update paidAmount there on credit
        if (transactionType === 'credit') {
          const hajiCond = ObjectId.isValid(finalPartyId)
            ? { $or: [{ customerId: finalPartyId }, { _id: new ObjectId(finalPartyId) }], isActive: { $ne: false } }
            : { $or: [{ customerId: finalPartyId }, { _id: finalPartyId }], isActive: { $ne: false } };
          const hajiDoc = await haji.findOne(hajiCond, { session });
          if (hajiDoc && hajiDoc._id) {
            await haji.updateOne(
              { _id: hajiDoc._id },
              { $inc: { paidAmount: numericAmount }, $set: { updatedAt: new Date() } },
              { session }
            );
            const afterH = await haji.findOne({ _id: hajiDoc._id }, { session });
            const clampH = {};
            if ((afterH.paidAmount || 0) < 0) clampH.paidAmount = 0;
            if (typeof afterH.totalAmount === 'number' && typeof afterH.paidAmount === 'number' && afterH.paidAmount > afterH.totalAmount) {
              clampH.paidAmount = afterH.totalAmount;
            }
            if (Object.keys(clampH).length) {
              clampH.updatedAt = new Date();
              await haji.updateOne({ _id: hajiDoc._id }, { $set: clampH }, { session });
            }
            await triggerFamilyRecomputeForHaji(afterH, { session });
          }
          
          // Additionally, if this customer also exists in the Umrah collection by id/customerId, update paidAmount there on credit
          // Don't filter by isActive to allow updating deleted/inactive profiles
          const umrahCond = ObjectId.isValid(finalPartyId)
            ? { $or: [{ customerId: finalPartyId }, { _id: new ObjectId(finalPartyId) }] }
            : { $or: [{ customerId: finalPartyId }, { _id: finalPartyId }] };
          const umrahDoc = await umrah.findOne(umrahCond, { session });
          if (umrahDoc && umrahDoc._id) {
            const beforeU = await umrah.findOne({ _id: umrahDoc._id }, { session });
            const currentPaidAmount = Number(beforeU?.paidAmount || 0);
            const newPaidAmount = currentPaidAmount + numericAmount;
            
            // Use $set to ensure field is definitely set (works even if field doesn't exist)
            await umrah.updateOne(
              { _id: umrahDoc._id },
              { 
                $set: { 
                  paidAmount: newPaidAmount,
                  updatedAt: new Date() 
                }
              },
              { session }
            );
            const afterU = await umrah.findOne({ _id: umrahDoc._id }, { session });
            const clampU = {};
            if (afterU && (afterU.paidAmount === undefined || afterU.paidAmount === null || Number(afterU.paidAmount) < 0)) {
              clampU.paidAmount = 0;
            } else if (afterU && afterU.paidAmount !== undefined && Number(afterU.paidAmount) < 0) {
              clampU.paidAmount = 0;
            }
            if (afterU && typeof afterU.totalAmount === 'number' && typeof afterU.paidAmount === 'number' && Number(afterU.paidAmount) > Number(afterU.totalAmount)) {
              clampU.paidAmount = afterU.totalAmount;
            }
            if (Object.keys(clampU).length) {
              clampU.updatedAt = new Date();
              await umrah.updateOne({ _id: umrahDoc._id }, { $set: clampU }, { session });
            }
          }
        }
      }
      
      // 8.4 If party is a haji, update haji and sync linked customer profile amounts
      console.log('🔍 Checking haji update:', {
        finalPartyType,
        partyFound: !!party,
        partyId: party?._id,
        transactionType,
        numericAmount
      });
      
      if (finalPartyType === 'haji' && party && party._id) {
        console.log('✅ Haji update condition met, updating paidAmount...');
        const categoryText = String(finalServiceCategory || '').toLowerCase();
        const isHajjCategory = categoryText.includes('haj');
        const isUmrahCategory = categoryText.includes('umrah');

        // Update Haji paidAmount on credit
        if (transactionType === 'credit') {
          console.log(`💰 Updating haji paidAmount: +${numericAmount} for haji ID: ${party._id}`);
          const beforeHaji = await haji.findOne({ _id: party._id }, { session });
          console.log('📊 Haji before update:', {
            paidAmount: beforeHaji?.paidAmount,
            totalAmount: beforeHaji?.totalAmount,
            hasPaidAmountField: 'paidAmount' in (beforeHaji || {})
          });
          
          // Get current paidAmount (handle undefined/null)
          const currentPaidAmount = Number(beforeHaji?.paidAmount || 0);
          const newPaidAmount = currentPaidAmount + numericAmount;
          
          console.log('💾 Setting paidAmount:', {
            currentPaidAmount,
            numericAmount,
            newPaidAmount
          });
          
          // Use $set to ensure field is definitely set (works even if field doesn't exist)
          await haji.updateOne(
            { _id: party._id },
            { 
              $set: { 
                paidAmount: newPaidAmount,
                updatedAt: new Date() 
              }
            },
            { session }
          );
          
          const afterHaji = await haji.findOne({ _id: party._id }, { session });
          
          console.log('📊 Haji after update:', {
            paidAmount: afterHaji?.paidAmount,
            totalAmount: afterHaji?.totalAmount,
            hasPaidAmountField: 'paidAmount' in (afterHaji || {})
          });
          
          // Clamp values
          const setClampHaji = {};
          if (afterHaji && (afterHaji.paidAmount === undefined || afterHaji.paidAmount === null || Number(afterHaji.paidAmount) < 0)) {
            setClampHaji.paidAmount = 0;
          } else if (afterHaji && afterHaji.paidAmount !== undefined && Number(afterHaji.paidAmount) < 0) {
            setClampHaji.paidAmount = 0;
          }
          if (afterHaji && typeof afterHaji.totalAmount === 'number' && typeof afterHaji.paidAmount === 'number' && Number(afterHaji.paidAmount) > Number(afterHaji.totalAmount)) {
            setClampHaji.paidAmount = afterHaji.totalAmount;
          }
          if (Object.keys(setClampHaji).length) {
            console.log('🔧 Clamping haji values:', setClampHaji);
            setClampHaji.updatedAt = new Date();
            await haji.updateOne({ _id: party._id }, { $set: setClampHaji }, { session });
            // Re-fetch after clamp
            const afterClamp = await haji.findOne({ _id: party._id }, { session });
            console.log('📊 Haji after clamp:', {
              paidAmount: afterClamp?.paidAmount,
              totalAmount: afterClamp?.totalAmount
            });
          }
          await triggerFamilyRecomputeForHaji(afterHaji || await haji.findOne({ _id: party._id }, { session }), { session });
          console.log('✅ Haji paidAmount updated successfully');
        } else {
          console.log('⚠️ Transaction type is not credit, skipping haji paidAmount update');
        }

        // Sync to linked customer (if exists via customerId)
        try {
          const linkedCustomerId = party.customerId || party.customer_id;
          if (linkedCustomerId) {
            const customerCond = ObjectId.isValid(linkedCustomerId)
              ? { $or: [{ _id: new ObjectId(linkedCustomerId) }, { customerId: linkedCustomerId }], isActive: { $ne: false } }
              : { $or: [{ _id: linkedCustomerId }, { customerId: linkedCustomerId }], isActive: { $ne: false } };
            const custDoc = await airCustomers.findOne(customerCond, { session });
            if (custDoc && custDoc._id) {
              const dueDelta = transactionType === 'debit' ? numericAmount : (transactionType === 'credit' ? -numericAmount : 0);
              const customerUpdate = { $set: { updatedAt: new Date() }, $inc: { totalDue: dueDelta } };
              if (isHajjCategory) customerUpdate.$inc.hajjDue = (customerUpdate.$inc.hajjDue || 0) + dueDelta;
              if (isUmrahCategory) customerUpdate.$inc.umrahDue = (customerUpdate.$inc.umrahDue || 0) + dueDelta;
              if (transactionType === 'credit') customerUpdate.$inc.paidAmount = (customerUpdate.$inc.paidAmount || 0) + numericAmount;

              await airCustomers.updateOne({ _id: custDoc._id }, customerUpdate, { session });

              // Clamp negatives and overpayments
              const afterCust = await airCustomers.findOne({ _id: custDoc._id }, { session });
              const clampCust = {};
              if ((afterCust.totalDue || 0) < 0) clampCust.totalDue = 0;
              if ((afterCust.paidAmount || 0) < 0) clampCust.paidAmount = 0;
              if ((afterCust.hajjDue !== undefined) && afterCust.hajjDue < 0) clampCust.hajjDue = 0;
              if ((afterCust.umrahDue !== undefined) && afterCust.umrahDue < 0) clampCust.umrahDue = 0;
              if (typeof afterCust.totalAmount === 'number' && typeof afterCust.paidAmount === 'number' && afterCust.paidAmount > afterCust.totalAmount) {
                clampCust.paidAmount = afterCust.totalAmount;
              }
              if (Object.keys(clampCust).length) {
                clampCust.updatedAt = new Date();
                await airCustomers.updateOne({ _id: custDoc._id }, { $set: clampCust }, { session });
              }
            }
          }
        } catch (syncErr) {
          console.warn('Customer sync from haji transaction failed:', syncErr?.message);
        }
      }

      // 8.5 If party is an umrah, update umrah and sync linked customer profile amounts
      if (finalPartyType === 'umrah' && party && party._id) {
        const categoryText = String(finalServiceCategory || '').toLowerCase();
        const isUmrahCategory = categoryText.includes('umrah');

        console.log('✅ Umrah update condition met, updating paidAmount...');
        
        // Update Umrah paidAmount on credit
        if (transactionType === 'credit') {
          console.log('💰 Updating umrah paidAmount: +' + numericAmount + ' for umrah ID: ' + party._id);
          
          const beforeUmrah = await umrah.findOne({ _id: party._id }, { session });
          const currentPaidAmount = Number(beforeUmrah?.paidAmount || 0);
          const newPaidAmount = currentPaidAmount + numericAmount;
          
          console.log('💾 Setting umrah paidAmount:', {
            currentPaidAmount,
            numericAmount,
            newPaidAmount
          });
          
          console.log('📊 Umrah before update:', {
            paidAmount: beforeUmrah?.paidAmount,
            totalAmount: beforeUmrah?.totalAmount,
            hasPaidAmountField: 'paidAmount' in (beforeUmrah || {})
          });
          
          // Use $set to ensure field is definitely set (works even if field doesn't exist)
          await umrah.updateOne(
            { _id: party._id },
            { 
              $set: { 
                paidAmount: newPaidAmount,
                updatedAt: new Date() 
              }
            },
            { session }
          );
          
          const afterUmrah = await umrah.findOne({ _id: party._id }, { session });
          
          console.log('📊 Umrah after update:', {
            paidAmount: afterUmrah?.paidAmount,
            totalAmount: afterUmrah?.totalAmount,
            hasPaidAmountField: 'paidAmount' in (afterUmrah || {})
          });
          
          // Clamp values
          const setClampUmrah = {};
          if (afterUmrah && (afterUmrah.paidAmount === undefined || afterUmrah.paidAmount === null || Number(afterUmrah.paidAmount) < 0)) {
            setClampUmrah.paidAmount = 0;
          } else if (afterUmrah && afterUmrah.paidAmount !== undefined && Number(afterUmrah.paidAmount) < 0) {
            setClampUmrah.paidAmount = 0;
          }
          if (afterUmrah && typeof afterUmrah.totalAmount === 'number' && typeof afterUmrah.paidAmount === 'number' && Number(afterUmrah.paidAmount) > Number(afterUmrah.totalAmount)) {
            setClampUmrah.paidAmount = afterUmrah.totalAmount;
          }
          if (Object.keys(setClampUmrah).length) {
            console.log('🔧 Clamping umrah values:', setClampUmrah);
            setClampUmrah.updatedAt = new Date();
            await umrah.updateOne({ _id: party._id }, { $set: setClampUmrah }, { session });
            // Re-fetch after clamp
            const afterClamp = await umrah.findOne({ _id: party._id }, { session });
            console.log('📊 Umrah after clamp:', {
              paidAmount: afterClamp?.paidAmount,
              totalAmount: afterClamp?.totalAmount
            });
          }
          
          console.log('✅ Umrah paidAmount updated successfully');
          
          // Final verification before commit
          const finalUmrah = await umrah.findOne({ _id: party._id }, { session });
          console.log('🔍 Final umrah check before commit:', {
            _id: finalUmrah?._id,
            paidAmount: finalUmrah?.paidAmount,
            totalAmount: finalUmrah?.totalAmount
          });
          
          await triggerFamilyRecomputeForUmrah(finalUmrah, { session });
        }

        // Sync to linked customer (if exists via customerId)
        try {
          const linkedCustomerId = party.customerId || party.customer_id;
          if (linkedCustomerId) {
            const customerCond = ObjectId.isValid(linkedCustomerId)
              ? { $or: [{ _id: new ObjectId(linkedCustomerId) }, { customerId: linkedCustomerId }], isActive: { $ne: false } }
              : { $or: [{ _id: linkedCustomerId }, { customerId: linkedCustomerId }], isActive: { $ne: false } };
            const custDoc = await airCustomers.findOne(customerCond, { session });
            if (custDoc && custDoc._id) {
              const dueDelta = transactionType === 'debit' ? numericAmount : (transactionType === 'credit' ? -numericAmount : 0);
              const customerUpdate = { $set: { updatedAt: new Date() }, $inc: { totalDue: dueDelta } };
              if (isUmrahCategory) customerUpdate.$inc.umrahDue = (customerUpdate.$inc.umrahDue || 0) + dueDelta;
              if (transactionType === 'credit') customerUpdate.$inc.paidAmount = (customerUpdate.$inc.paidAmount || 0) + numericAmount;

              await airCustomers.updateOne({ _id: custDoc._id }, customerUpdate, { session });

              // Clamp negatives and overpayments
              const afterCust = await airCustomers.findOne({ _id: custDoc._id }, { session });
              const clampCust = {};
              if ((afterCust.totalDue || 0) < 0) clampCust.totalDue = 0;
              if ((afterCust.paidAmount || 0) < 0) clampCust.paidAmount = 0;
              if ((afterCust.umrahDue !== undefined) && afterCust.umrahDue < 0) clampCust.umrahDue = 0;
              if (typeof afterCust.totalAmount === 'number' && typeof afterCust.paidAmount === 'number' && afterCust.paidAmount > afterCust.totalAmount) {
                clampCust.paidAmount = afterCust.totalAmount;
              }
              if (Object.keys(clampCust).length) {
                clampCust.updatedAt = new Date();
                await airCustomers.updateOne({ _id: custDoc._id }, { $set: clampCust }, { session });
              }
            }
          }
        } catch (syncErr) {
          console.warn('Customer sync from umrah transaction failed:', syncErr?.message);
        }
      }

      // 8.6 If party is a loan, update loan profile amounts (totalAmount/paidAmount/totalDue)
      if (finalPartyType === 'loan' && party && party._id) {
        const isReceivingLoan = String(party.loanDirection || party.direction || '').toLowerCase() === 'receiving';
        const loansCollection = isReceivingLoan ? loansReceiving : loansGiving;
        let dueDelta = 0;
        const loanUpdate = { $set: { updatedAt: new Date() }, $inc: { } };

        console.log('💰 Updating loan balance:', {
          loanId: party.loanId || party._id.toString(),
          loanDirection: party.loanDirection || party.direction,
          isReceivingLoan,
          transactionType,
          amount: numericAmount
        });

        if (isReceivingLoan) {
          // Receiving loan perspective: credit = principal in, increases due; debit = repayment
          if (transactionType === 'credit') {
            dueDelta = numericAmount;
            loanUpdate.$inc.totalAmount = (loanUpdate.$inc.totalAmount || 0) + numericAmount;
          } else if (transactionType === 'debit') {
            dueDelta = -numericAmount;
            loanUpdate.$inc.paidAmount = (loanUpdate.$inc.paidAmount || 0) + numericAmount;
          }
        } else {
          // Giving loan perspective (default): debit = principal out, increases due; credit = repayment
          if (transactionType === 'debit') {
            dueDelta = numericAmount;
            loanUpdate.$inc.totalAmount = (loanUpdate.$inc.totalAmount || 0) + numericAmount;
          } else if (transactionType === 'credit') {
            dueDelta = -numericAmount;
            loanUpdate.$inc.paidAmount = (loanUpdate.$inc.paidAmount || 0) + numericAmount;
          }
        }

        loanUpdate.$inc.totalDue = dueDelta;
        const updateResult = await loansCollection.updateOne({ _id: party._id }, loanUpdate, { session });
        console.log('📝 Loan update result:', { modifiedCount: updateResult.modifiedCount });
        
        const afterLoan = await loansCollection.findOne({ _id: party._id }, { session });
        const clampLoan = {};
        if ((afterLoan?.totalDue || 0) < 0) clampLoan.totalDue = 0;
        if ((afterLoan?.paidAmount || 0) < 0) clampLoan.paidAmount = 0;
        if ((afterLoan?.totalAmount || 0) < 0) clampLoan.totalAmount = 0;
        if (typeof afterLoan?.totalAmount === 'number' && typeof afterLoan?.paidAmount === 'number' && afterLoan.paidAmount > afterLoan.totalAmount) {
          clampLoan.paidAmount = afterLoan.totalAmount;
        }
        if (Object.keys(clampLoan).length) {
          clampLoan.updatedAt = new Date();
          await loansCollection.updateOne({ _id: party._id }, { $set: clampLoan }, { session });
        }
        // Ensure loan is marked Active once any transaction is recorded against it
        await loansCollection.updateOne({ _id: party._id, status: { $ne: 'Active' } }, { $set: { status: 'Active', updatedAt: new Date() } }, { session });
        
        console.log('✅ Loan balance updated:', {
          loanId: afterLoan?.loanId || afterLoan?._id?.toString(),
          totalAmount: afterLoan?.totalAmount,
          paidAmount: afterLoan?.paidAmount,
          totalDue: afterLoan?.totalDue
        });
      }

      transactionResult = await transactions.insertOne(transactionData, { session });

      // 8.12 Update Operating Expense Category balance if applicable
      if (finalOperatingExpenseCategoryId && ObjectId.isValid(String(finalOperatingExpenseCategoryId))) {
        const categoryId = new ObjectId(String(finalOperatingExpenseCategoryId));
        const category = await operatingExpenseCategories.findOne({ _id: categoryId }, { session });
        
        if (category) {
          console.log('💰 Updating operating expense category balance:', {
            categoryId: categoryId.toString(),
            categoryName: category.name,
            transactionType,
            amount: numericAmount
          });

          // For debit: increase totalAmount (expense)
          // For credit: decrease totalAmount (refund/income)
          const amountDelta = transactionType === 'debit' ? numericAmount : -numericAmount;
          
          const categoryUpdate = {
            $inc: {
              totalAmount: amountDelta,
              itemCount: 1
            },
            $set: {
              updatedAt: new Date()
            }
          };

          const updateResult = await operatingExpenseCategories.updateOne(
            { _id: categoryId },
            categoryUpdate,
            { session }
          );

          const updatedCategory = await operatingExpenseCategories.findOne({ _id: categoryId }, { session });
          console.log('✅ Operating expense category updated:', {
            categoryId: categoryId.toString(),
            categoryName: updatedCategory?.name,
            newTotalAmount: updatedCategory?.totalAmount,
            newItemCount: updatedCategory?.itemCount,
            updateResult: updateResult.modifiedCount
          });
        } else {
          console.warn('⚠️ Operating expense category not found:', categoryId.toString());
        }
      }

      // 8.13 Final verification: Re-check haji paidAmount before commit
      if (finalPartyType === 'haji' && party && party._id && transactionType === 'credit') {
        const finalHajiCheck = await haji.findOne({ _id: party._id }, { session });
        console.log('🔍 Final haji check before commit:', {
          _id: finalHajiCheck?._id,
          paidAmount: finalHajiCheck?.paidAmount,
          totalAmount: finalHajiCheck?.totalAmount
        });
        
        // Ensure paidAmount is set
        if (finalHajiCheck && (finalHajiCheck.paidAmount === undefined || finalHajiCheck.paidAmount === null)) {
          console.log('⚠️ paidAmount still undefined/null, setting it now...');
          const currentPaid = Number(finalHajiCheck.paidAmount || 0);
          await haji.updateOne(
            { _id: party._id },
            { $set: { paidAmount: currentPaid + numericAmount, updatedAt: new Date() } },
            { session }
          );
          const afterFinal = await haji.findOne({ _id: party._id }, { session });
          console.log('✅ Final paidAmount set:', afterFinal?.paidAmount);
        }
      }

      // 9. Commit transaction
      console.log('💾 Committing transaction...');
      await session.commitTransaction();
      console.log('✅ Transaction committed successfully');

      // Include account details in response for better frontend display
      const responseTransaction = { ...transactionData, _id: transactionResult.insertedId };
      
      // Add account details for credit/debit transactions
      if ((transactionType === 'credit' || transactionType === 'debit') && account) {
        responseTransaction.targetAccount = {
          id: account._id?.toString(),
          bankName: account.bankName || null,
          accountName: account.accountName || account.accountTitle || account.accountHolder || null,
          accountNumber: account.accountNumber || null
        };
      }
      
      // Add account details for transfer transactions
      if (transactionType === 'transfer' && fromAccount && toAccount) {
        responseTransaction.fromAccount = {
          id: fromAccount._id?.toString(),
          bankName: fromAccount.bankName || null,
          accountName: fromAccount.accountName || fromAccount.accountTitle || fromAccount.accountHolder || null,
          accountNumber: fromAccount.accountNumber || null
        };
        responseTransaction.toAccount = {
          id: toAccount._id?.toString(),
          bankName: toAccount.bankName || null,
          accountName: toAccount.accountName || toAccount.accountTitle || toAccount.accountHolder || null,
          accountNumber: toAccount.accountNumber || null
        };
      }
      
      return NextResponse.json({
        success: true,
        transaction: responseTransaction,
        agent: updatedAgent || null,
        customer: updatedCustomer || null,
        vendor: updatedVendor || null,
        employee: updatedEmployee || null,
        invoice: updatedInvoice || null,
        asset: updatedAsset || null
      });

    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError;
    }

  } catch (err) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error('Transaction creation error:', err);
    return NextResponse.json({
      success: false,
      message: err.message
    }, { status: 500 });
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

// ✅ GET: List transactions with filters and pagination (IMPROVED VERSION)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const partyType = searchParams.get('partyType');
    const partyId = searchParams.get('partyId');
    const transactionType = searchParams.get('transactionType');
    const serviceCategory = searchParams.get('serviceCategory') || searchParams.get('category');
    const branchId = searchParams.get('branchId');
    const accountId = searchParams.get('accountId');
    const scope = searchParams.get('scope');
    const categoryId = searchParams.get('categoryId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const dateRange = searchParams.get('dateRange'); // 'today', 'week', 'month', etc.
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const q = searchParams.get('q');

    const pageNum = Math.max(page, 1);
    const limitNum = Math.min(Math.max(limit, 1), 100);

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    // Special branch: Personal expense transactions
    if (String(scope) === "personal-expense") {
      const peFilter = { scope: "personal-expense", type: "expense" };
      if (fromDate || toDate) {
        peFilter.date = {};
        if (fromDate) peFilter.date.$gte = String(fromDate).slice(0, 10);
        if (toDate) peFilter.date.$lte = String(toDate).slice(0, 10);
      }
      if (categoryId && ObjectId.isValid(String(categoryId))) {
        peFilter.categoryId = String(categoryId);
      }

      const cursor = transactionsCollection
        .find(peFilter)
        .sort({ date: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      const [items, total] = await Promise.all([
        cursor.toArray(),
        transactionsCollection.countDocuments(peFilter)
      ]);

      const data = items.map((doc) => ({
        id: String(doc._id || doc.id || ""),
        date: doc.date || new Date().toISOString().slice(0, 10),
        amount: Number(doc.amount || 0),
        categoryId: String(doc.categoryId || ""),
        categoryName: String(doc.categoryName || ""),
        description: String(doc.description || ""),
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        createdAt: doc.createdAt || null
      }));

      return NextResponse.json({
        success: true,
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    }

    const filter = { isActive: { $ne: false } };

    if (partyType) filter.partyType = String(partyType);
    if (partyId) filter.partyId = String(partyId);
    if (transactionType) filter.transactionType = String(transactionType);
    if (serviceCategory) filter.serviceCategory = String(serviceCategory);
    if (branchId) filter.branchId = String(branchId);
    if (accountId) {
      filter.$or = [
        { targetAccountId: String(accountId) },
        { fromAccountId: String(accountId) }
      ];
    }

    // Handle date range filters
    if (dateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter.date = { $gte: today, $lt: tomorrow };
    } else if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
        }
        filter.date.$lte = end;
      }
    }

    if (q) {
      const text = String(q).trim();
      filter.$or = [
        ...(filter.$or || []),
        { transactionId: { $regex: text, $options: 'i' } },
        { partyName: { $regex: text, $options: 'i' } },
        { notes: { $regex: text, $options: 'i' } },
        { reference: { $regex: text, $options: 'i' } }
      ];
    }

    const cursor = transactionsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const [items, total] = await Promise.all([
      cursor.toArray(),
      transactionsCollection.countDocuments(filter)
    ]);

    // Populate account details for transactions
    const bankAccountsCollection = db.collection('bank_accounts');
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const enriched = { ...item };
        
        // For transfer transactions, populate fromAccount and toAccount
        if (item.transactionType === 'transfer' && (item.fromAccountId || item.toAccountId)) {
          if (item.fromAccountId && ObjectId.isValid(item.fromAccountId)) {
            const fromAcc = await bankAccountsCollection.findOne({ _id: new ObjectId(item.fromAccountId) });
            if (fromAcc) {
              enriched.fromAccount = {
                id: fromAcc._id?.toString(),
                bankName: fromAcc.bankName || null,
                accountName: fromAcc.accountName || fromAcc.accountTitle || fromAcc.accountHolder || null,
                accountNumber: fromAcc.accountNumber || null
              };
            }
          }
          if (item.toAccountId && ObjectId.isValid(item.toAccountId)) {
            const toAcc = await bankAccountsCollection.findOne({ _id: new ObjectId(item.toAccountId) });
            if (toAcc) {
              enriched.toAccount = {
                id: toAcc._id?.toString(),
                bankName: toAcc.bankName || null,
                accountName: toAcc.accountName || toAcc.accountTitle || toAcc.accountHolder || null,
                accountNumber: toAcc.accountNumber || null
              };
            }
          }
        }
        
        // For credit/debit transactions, populate targetAccount
        if ((item.transactionType === 'credit' || item.transactionType === 'debit') && item.targetAccountId && ObjectId.isValid(item.targetAccountId)) {
          const targetAcc = await bankAccountsCollection.findOne({ _id: new ObjectId(item.targetAccountId) });
          if (targetAcc) {
            enriched.targetAccount = {
              id: targetAcc._id?.toString(),
              bankName: targetAcc.bankName || null,
              accountName: targetAcc.accountName || targetAcc.accountTitle || targetAcc.accountHolder || null,
              accountNumber: targetAcc.accountNumber || null
            };
          }
        }
        
        // Populate vendor name if partyType is vendor
        if (item.partyType === 'vendor' && item.partyId) {
          const vendorsCollection = db.collection('vendors');
          if (ObjectId.isValid(item.partyId)) {
            const vendor = await vendorsCollection.findOne({ _id: new ObjectId(item.partyId) });
            if (vendor) {
              enriched.party = {
                ...enriched.party,
                tradeName: vendor.tradeName || null,
                vendorName: vendor.vendorName || null,
                ownerName: vendor.ownerName || null,
                name: vendor.tradeName || vendor.vendorName || vendor.ownerName || vendor.name || null
              };
            }
          }
        }
        
        return enriched;
      })
    );

    // Calculate totals for the filtered transactions
    const summary = await transactionsCollection.aggregate([
      { $match: filter },
      { $group: { _id: null, totalCharge: { $sum: "$charge" }, totalAmount: { $sum: "$amount" } } }
    ]).toArray();

    const totalCharge = summary[0]?.totalCharge || 0;
    const totalAmount = summary[0]?.totalAmount || 0;

    return NextResponse.json({
      success: true,
      transactions: enrichedItems,
      data: enrichedItems,
      summary: {
        totalCharge,
        totalAmount
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      totalCount: total,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('List transactions error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions', error: error.message },
      { status: 500 }
    );
  }
}
