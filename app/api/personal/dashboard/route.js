import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

const buildPersonalFilter = () => ({
  $or: [
    { scope: 'personal-expense' },
    { partyType: 'personal-expense' }
  ]
});

export async function GET() {
  try {
    const db = await getDb();
    const transactionsCollection = db.collection('transactions');
    const profilesCollection = db.collection('personal_expense_profiles');
    const familyAssetsCollection = db.collection('family_assets');

    const now = new Date();
    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);

    const personalFilter = buildPersonalFilter();

    const [profilesCount, assetsSummary, monthlySummary, recentExpenses, categoryBreakdown] =
      await Promise.all([
        profilesCollection.countDocuments({}),
        familyAssetsCollection
          .aggregate([
            { $group: { _id: null, totalAssets: { $sum: { $ifNull: ['$totalPaidAmount', 0] } } } }
          ])
          .toArray(),
        transactionsCollection
          .aggregate([
            {
              $match: {
                ...personalFilter,
                date: { $gte: last30Days, $lte: now }
              }
            },
            {
              $project: {
                transactionType: 1,
                amount: {
                  $convert: {
                    input: '$amount',
                    to: 'double',
                    onError: 0,
                    onNull: 0
                  }
                }
              }
            },
            {
              $group: {
                _id: null,
                totalDebit: {
                  $sum: {
                    $cond: [{ $eq: ['$transactionType', 'debit'] }, '$amount', 0]
                  }
                },
                totalCredit: {
                  $sum: {
                    $cond: [{ $eq: ['$transactionType', 'credit'] }, '$amount', 0]
                  }
                }
              }
            }
          ])
          .toArray(),
        transactionsCollection
          .find({ ...personalFilter, transactionType: 'debit' })
          .sort({ date: -1, createdAt: -1 })
          .limit(5)
          .toArray(),
        transactionsCollection
          .aggregate([
            {
              $match: {
                ...personalFilter,
                transactionType: 'debit',
                date: { $gte: last30Days, $lte: now }
              }
            },
            {
              $project: {
                categoryName: { $ifNull: ['$categoryName', 'অন্যান্য'] },
                amount: {
                  $convert: {
                    input: '$amount',
                    to: 'double',
                    onError: 0,
                    onNull: 0
                  }
                }
              }
            },
            {
              $group: {
                _id: '$categoryName',
                total: { $sum: '$amount' }
              }
            },
            { $sort: { total: -1 } },
            { $limit: 4 }
          ])
          .toArray()
      ]);

    const totalAssets = assetsSummary[0]?.totalAssets || 0;
    const totalDebit = monthlySummary[0]?.totalDebit || 0;
    const totalCredit = monthlySummary[0]?.totalCredit || 0;
    const savings = totalCredit - totalDebit;

    const formattedRecentExpenses = recentExpenses.map((item) => ({
      id: item._id?.toString(),
      title: item.notes || item.categoryName || 'ব্যয়',
      category: item.categoryName || 'অন্যান্য',
      amount: Number(item.amount) || 0,
      date: item.date || item.createdAt || null
    }));

    const breakdownTotal = categoryBreakdown.reduce((sum, item) => sum + (item.total || 0), 0);
    const formattedBreakdown = categoryBreakdown.map((item) => ({
      label: item._id || 'অন্যান্য',
      value: breakdownTotal > 0 ? Math.round((item.total / breakdownTotal) * 100) : 0
    }));

    return NextResponse.json(
      {
        success: true,
        summary: {
          monthlyExpense: totalDebit,
          monthlyIncome: totalCredit,
          savings,
          totalAssets,
          totalProfiles: profilesCount
        },
        recentExpenses: formattedRecentExpenses,
        budgetInsights: formattedBreakdown
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching personal dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal dashboard', message: error.message },
      { status: 500 }
    );
  }
}
