import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET loan dashboard summary
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const loanDirection = searchParams.get('loanDirection');
    const branchId = searchParams.get('branchId');

    const db = await getDb();
    const receivingCollection = db.collection('loans_receiving');
    const givingCollection = db.collection('loans_giving');

    // Build date filter
    const dateFilter = {};
    if (fromDate) {
      dateFilter.createdAt = { ...dateFilter.createdAt, $gte: new Date(fromDate) };
    }
    if (toDate) {
      dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(toDate) };
    }

    // Build branch filter
    if (branchId) {
      dateFilter.branchId = branchId;
    }

    // Get receiving loans
    const receivingQuery = { ...dateFilter };
    if (loanDirection === 'receiving') {
      receivingQuery.loanDirection = 'receiving';
    }

    // Get giving loans
    const givingQuery = { ...dateFilter };
    if (loanDirection === 'giving') {
      // For giving loans, we don't have loanDirection field, so we'll query all
    }

    const receivingLoans = await receivingCollection.find(receivingQuery).toArray();
    const givingLoans = await givingCollection.find(givingQuery).toArray();

    // Calculate totals
    const totals = {
      totalLoans: receivingLoans.length + givingLoans.length,
      active: [...receivingLoans, ...givingLoans].filter(l => l.status === 'active').length,
      pending: [...receivingLoans, ...givingLoans].filter(l => l.status === 'pending').length,
      closed: [...receivingLoans, ...givingLoans].filter(l => l.status === 'completed' || l.status === 'closed').length,
      rejected: [...receivingLoans, ...givingLoans].filter(l => l.status === 'rejected').length,
    };

    // Calculate receiving financial data
    const receivingFinancial = {
      totalAmount: receivingLoans.reduce((sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)), 0),
      paidAmount: receivingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
      totalDue: receivingLoans.reduce((sum, loan) => {
        const total = Number(loan.totalAmount || loan.amount || 0);
        const paid = Number(loan.paidAmount || 0);
        return sum + Math.max(0, total - paid);
      }, 0),
      taken: receivingLoans.reduce((sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)), 0),
      repaid: receivingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
      netCashFlow: receivingLoans.reduce((sum, loan) => {
        const total = Number(loan.totalAmount || loan.amount || 0);
        const paid = Number(loan.paidAmount || 0);
        return sum + (paid - total);
      }, 0),
    };

    // Calculate giving financial data
    const givingFinancial = {
      totalAmount: givingLoans.reduce((sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)), 0),
      paidAmount: givingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
      totalDue: givingLoans.reduce((sum, loan) => {
        const total = Number(loan.totalAmount || loan.amount || 0);
        const paid = Number(loan.paidAmount || 0);
        return sum + Math.max(0, total - paid);
      }, 0),
      disbursed: givingLoans.reduce((sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)), 0),
      repaid: givingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
      netCashFlow: givingLoans.reduce((sum, loan) => {
        const total = Number(loan.totalAmount || loan.amount || 0);
        const paid = Number(loan.paidAmount || 0);
        return sum + (paid - total);
      }, 0),
    };

    // Calculate transactions summary
    // Note: This is a simplified version. You might want to query from a transactions collection
    const transactions = {
      totalTransactions: receivingLoans.length + givingLoans.length,
      totalDebit: givingFinancial.disbursed,
      totalCredit: receivingFinancial.taken + givingFinancial.repaid,
      netCashflow: receivingFinancial.netCashFlow + givingFinancial.netCashFlow,
      byDirection: [
        {
          loanDirection: 'receiving',
          count: receivingLoans.length,
          totalDebit: 0,
          totalCredit: receivingFinancial.taken,
          netCashflow: receivingFinancial.netCashFlow,
        },
        {
          loanDirection: 'giving',
          count: givingLoans.length,
          totalDebit: givingFinancial.disbursed,
          totalCredit: givingFinancial.repaid,
          netCashflow: givingFinancial.netCashFlow,
        },
      ],
    };

    return NextResponse.json({
      totals,
      receiving: {
        financial: receivingFinancial,
      },
      giving: {
        financial: givingFinancial,
      },
      transactions,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching loan dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan dashboard data', message: error.message },
      { status: 500 }
    );
  }
}
