import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  Tag, 
  FileText, 
  Hash, 
  ArrowRightLeft, 
  ShieldCheck, 
  Banknote,
  Building2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const metadata = {
  title: 'Verify Transaction | Bin Rashid ERP',
  description: 'Verify transaction details securely.',
};

export default async function VerifyTransactionPage({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  // ---------------- Error UI ----------------
  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50 dark:ring-red-900/10">
              <XCircle className="w-10 h-10 text-red-500" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">অবৈধ অনুরোধ</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">ট্রানজেকশন আইডি পাওয়া যায়নি।</p>
          </div>
        </div>
      </div>
    );
  }

  let transaction = null;

  try {
    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    // Try to find by transactionId first (most common for public links)
    transaction = await transactionsCollection.findOne({ transactionId: id, isActive: { $ne: false } });

    // Fallback to _id if not found
    if (!transaction && ObjectId.isValid(id)) {
      transaction = await transactionsCollection.findOne({ _id: new ObjectId(id), isActive: { $ne: false } });
    }
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-amber-50/50 dark:ring-amber-900/10">
              <AlertTriangle className="w-10 h-10 text-amber-500" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">সার্ভার ত্রুটি</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">লেনদেনের তথ্য লোড করতে সমস্যা হয়েছে।</p>
            <div className="text-left text-xs bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg overflow-auto max-h-32 mb-6 border border-gray-200 dark:border-gray-600">
              <code className="text-red-500 font-mono">{error.message}</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Not Found UI ----------------
  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-gray-50/50 dark:ring-gray-700/30">
              <ShieldCheck className="w-10 h-10 text-gray-400 dark:text-gray-500" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">লেনদেন পাওয়া যায়নি</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              আইডি <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 mx-1">{id}</span> এর সাথে কোনো লেনদেন পাওয়া যায়নি।
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Format data for display
  const {
    transactionId,
    date,
    amount,
    transactionType,
    paymentMethod,
    category,
    serviceCategory,
    notes,
    createdAt
  } = transaction;

  const formattedDate = date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedAmount = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount || 0);

  // Helper to get customer name safely
  const getCustomerName = (t) => {
    // For transfer transactions, use account names
    if (t.transactionType === 'transfer') {
      if (t.fromAccount && t.toAccount) {
        const fromName = t.fromAccount.bankName || t.fromAccount.accountName || t.fromAccount.name || 'Account';
        const toName = t.toAccount.bankName || t.toAccount.accountName || t.toAccount.name || 'Account';
        return `${fromName} → ${toName}`;
      }
      if (t.debitAccount && t.creditAccount) {
        const fromName = t.debitAccount.bankName || t.debitAccount.accountName || t.debitAccount.name || 'Account';
        const toName = t.creditAccount.bankName || t.creditAccount.accountName || t.creditAccount.name || 'Account';
        return `${fromName} → ${toName}`;
      }
      return 'Account Transfer';
    }
    
    // For personal expense
    if (t.scope === 'personal-expense' || t.personalExpenseProfileId) {
      return t.partyName || t.customerName || 'Personal Expense';
    }

    // For money exchange
    if (t.partyType === 'money-exchange' || t.partyType === 'money_exchange') {
      const moneyExchangeInfo = t.moneyExchangeInfo || {};
      const currencyName = moneyExchangeInfo.currencyName || t.party?.currencyName;
      const type = moneyExchangeInfo.type || '';
      const currencyCode = moneyExchangeInfo.currencyCode || '';
      
      if (type && currencyName) {
        return `${type === 'Buy' ? 'ক্রয়' : type === 'Sell' ? 'বিক্রয়' : type} - ${currencyCode ? `${currencyCode} (${currencyName})` : currencyName}`;
      }
      if (currencyName) return currencyName;
      if (t.partyName) return t.partyName;
    }
    
    return t.customerName || t.partyName || t.customer?.name || t.party?.name || 'N/A';
  };

  // Helper to get category safely
  const getCategory = (t) => {
    // Account Transfer
    if (t.transactionType === 'transfer') {
      return 'Account Transfer';
    }

    if (t.category && typeof t.category === 'object') {
      return t.category.name || t.category.label || t.category.title || t.category.categoryName || 'N/A';
    }
    
    const raw = t.category || t.serviceCategory || '';
    
    // If category is an ID or empty, try to map from customerType/partyType
    if (!raw || (typeof raw === 'string' && raw.length === 24 && /^[0-9a-fA-F]{24}$/.test(raw))) {
      const type = t.customerType || t.partyType || '';
      if (type === 'haji' || type === 'hajj') return 'হাজ্জ প্যাকেজ';
      if (type === 'umrah') return 'ওমরাহ প্যাকেজ';
      if (type === 'airCustomer') return 'এয়ার টিকেট';
      if (type === 'visa') return 'ভিসা সার্ভিস';
      if (type === 'hotel') return 'হোটেল বুকিং';
      if (type === 'money-exchange' || type === 'moneyExchange') return 'মানি এক্সচেঞ্জ';
      if (type === 'office' || type === 'officeExpenses') return 'অফিস ব্যয়';
      if (type === 'vendor') return 'ভেন্ডর';
      if (type === 'agent') return 'এজেন্ট';
    }
    
    return raw || 'N/A';
  };

  const finalCustomerName = getCustomerName(transaction);
  const finalCategory = getCategory(transaction);

  // Status Colors
  const getStatusColor = (type) => {
    switch(type) {
      case 'credit': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'debit': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'transfer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (type) => {
    switch(type) {
      case 'credit': return 'জমা (Credit)';
      case 'debit': return 'খরচ (Debit)';
      case 'transfer': return 'ট্রান্সফার (Transfer)';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          
          {/* Header Section */}
          <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 pt-10 pb-20 px-6 text-center">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white/10 shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">লেনদেন যাচাইকৃত</h2>
              <p className="text-emerald-100 mt-2 font-medium">Bin Rashid ERP - Verified Transaction</p>
            </div>
          </div>

          {/* Body Content - Overlapping Header */}
          <div className="relative px-6 pb-8 -mt-12">
            {/* Amount Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center mb-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-2">টাকার পরিমাণ</p>
              <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                {formattedAmount}
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(transactionType)}`}>
                {transactionType === 'transfer' ? <ArrowRightLeft className="w-3 h-3 mr-1.5" /> : <Banknote className="w-3 h-3 mr-1.5" />}
                {getStatusLabel(transactionType)}
              </span>
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              
              {/* Transaction ID */}
              <div className="flex items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Hash className="w-4 h-4" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ট্রানজেকশন আইডি</p>
                  <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white break-all mt-0.5">
                    {transactionId || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">তারিখ</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{formattedDate}</p>
                </div>
              </div>

              {/* Name */}
              <div className="flex items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">নাম / বিবরণ</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{finalCustomerName}</p>
                </div>
              </div>

              {/* Phone */}
              {transaction.customerPhone && (
                <div className="flex items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ফোন</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 font-mono">{transaction.customerPhone}</p>
                  </div>
                </div>
              )}

              {/* Payment Method & Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase truncate">পেমেন্ট মেথড</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 capitalize truncate">{transaction.paymentMethod || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                      <Tag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase truncate">ক্যাটাগরি</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 truncate" title={finalCategory}>{finalCategory}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {notes && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">নোট / মন্তব্য</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    &quot;{notes}&quot;
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-500 mb-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-bold">Secure Verification</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                This transaction has been cryptographically verified by Bin Rashid ERP system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
