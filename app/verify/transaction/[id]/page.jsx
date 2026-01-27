import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import Link from 'next/link';

export const metadata = {
  title: 'Verify Transaction | Bin Rashid ERP',
  description: 'Verify transaction details securely.',
};

export default async function VerifyTransactionPage({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">অবৈধ অনুরোধ</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">ট্রানজেকশন আইডি পাওয়া যায়নি।</p>
          <Link href="/" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded transition duration-200">
            হোম পেজ
          </Link>
        </div>
      </div>
    );
  }

  try {
    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    // Try to find by transactionId first (most common for public links)
    let transaction = await transactionsCollection.findOne({ transactionId: id, isActive: { $ne: false } });

    // Fallback to _id if not found
    if (!transaction && ObjectId.isValid(id)) {
      transaction = await transactionsCollection.findOne({ _id: new ObjectId(id), isActive: { $ne: false } });
    }

    if (!transaction) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full">
            <div className="text-red-500 text-5xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">লেনদেন পাওয়া যায়নি</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              আইডি <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{id}</span> এর সাথে কোনো লেনদেন পাওয়া যায়নি।
            </p>
          </div>
        </div>
      );
    }

    // Format data for display
    const {
      transactionId,
      date,
      amount,
      customerName,
      customerPhone,
      transactionType,
      paymentMethod,
      category,
      serviceCategory,
      notes,
      createdAt
    } = transaction;

    const formattedDate = date ? new Date(date).toLocaleDateString('en-GB') : new Date(createdAt).toLocaleDateString('en-GB');
    const formattedAmount = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount || 0);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden md:max-w-2xl">
          <div className="bg-emerald-600 p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">লেনদেন যাচাইকৃত</h2>
            <p className="text-emerald-100 mt-1">Bin Rashid ERP - Verified Transaction</p>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">টাকার পরিমাণ</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{formattedAmount}</p>
              <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                transactionType === 'credit' ? 'bg-green-100 text-green-800' : 
                transactionType === 'debit' ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {transactionType === 'credit' ? 'জমা (Credit)' : 
                 transactionType === 'debit' ? 'খরচ (Debit)' : 
                 transactionType === 'transfer' ? 'ট্রান্সফার (Transfer)' : transactionType}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 py-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">ট্রানজেকশন আইডি</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{transactionId || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">তারিখ</span>
                <span className="font-medium text-gray-900 dark:text-white">{formattedDate}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">নাম</span>
                <span className="font-medium text-gray-900 dark:text-white">{customerName || 'N/A'}</span>
              </div>

              {customerPhone && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ফোন</span>
                  <span className="font-medium text-gray-900 dark:text-white">{customerPhone}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">পেমেন্ট মেথড</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{paymentMethod || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">ক্যাটাগরি</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {typeof category === 'string' ? category : (category?.name || 'N/A')}
                  {serviceCategory && <span className="text-gray-500 text-sm ml-1">({serviceCategory})</span>}
                </span>
              </div>

              {notes && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">নোট / মন্তব্য</p>
                  <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm">
                    {notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                এই তথ্যটি Bin Rashid ERP সিস্টেম থেকে স্বয়ংক্রিয়ভাবে যাচাইকৃত।
              </p>
              <div className="mt-6">
                <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                  লগইন করুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">সার্ভার ত্রুটি</h1>
          <p className="text-gray-600 dark:text-gray-300">লেনদেনের তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।</p>
        </div>
      </div>
    );
  }
}
