import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET unified dashboard summary - all data in one API call
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const db = await getDb();

    // Fetch all data in parallel
    const [
      hajis,
      umrahs,
      agents,
      packages,
      exchanges,
      receivingLoans,
      givingLoans,
      vendors,
      vendorBills,
      users,
      branches,
      bankAccounts,
    ] = await Promise.all([
      db.collection('hajis').find({}).toArray(),
      db.collection('umrahs').find({ service_type: 'umrah' }).toArray(),
      db.collection('agents').find({}).toArray(),
      db.collection('packages').find({}).toArray(),
      db
        .collection('money_exchanges')
        .find({ isActive: { $ne: false } })
        .toArray(),
      db.collection('loans_receiving').find({}).toArray(),
      db.collection('loans_giving').find({}).toArray(),
      db.collection('vendors').find({}).toArray(),
      db.collection('vendor_bills').find({}).toArray(),
      db.collection('users').find({}).toArray(),
      db.collection('branches').find({}).toArray(),
      db.collection('bank_accounts').find({}).toArray(),
    ]);

    // ========== HAJJ & UMRAH ==========
    const hajjPackages = packages.filter(
      (pkg) =>
        pkg.packageType === 'Hajj' || pkg.customPackageType?.toLowerCase().includes('hajj')
    );
    const umrahPackages = packages.filter(
      (pkg) =>
        pkg.packageType === 'Umrah' || pkg.customPackageType?.toLowerCase().includes('umrah')
    );

    const hajjTotalRevenue = hajis.reduce(
      (sum, haji) => sum + (Number(haji.total_amount) || Number(haji.totalAmount) || 0),
      0
    );
    const hajjTotalCost = hajjPackages.reduce((sum, pkg) => {
      const packageCost = Number(pkg.costingPrice) || Number(pkg.totals?.costingPrice) || 0;
      const hajisInPackage = hajis.filter(
        (h) =>
          h.packageId === pkg._id.toString() ||
          h.package_id === pkg._id.toString() ||
          h.packageInfo?.packageId === pkg._id.toString()
      ).length;
      return sum + packageCost * hajisInPackage;
    }, 0);

    const umrahTotalRevenue = umrahs.reduce(
      (sum, umrah) => sum + (Number(umrah.total_amount) || Number(umrah.totalAmount) || 0),
      0
    );
    const umrahTotalCost = umrahPackages.reduce((sum, pkg) => {
      const packageCost = Number(pkg.costingPrice) || Number(pkg.totals?.costingPrice) || 0;
      const umrahsInPackage = umrahs.filter(
        (u) =>
          u.packageId === pkg._id.toString() ||
          u.package_id === pkg._id.toString() ||
          u.packageInfo?.packageId === pkg._id.toString()
      ).length;
      return sum + packageCost * umrahsInPackage;
    }, 0);

    const huOverview = {
      totalHaji: hajis.length,
      totalUmrah: umrahs.length,
      totalAgents: agents.length,
      totalPilgrims: hajis.length + umrahs.length,
    };

    const huProfitLoss = {
      hajj: {
        totalRevenue: hajjTotalRevenue,
        totalCost: hajjTotalCost,
        profitLoss: hajjTotalRevenue - hajjTotalCost,
        isProfit: hajjTotalRevenue - hajjTotalCost >= 0,
      },
      umrah: {
        totalRevenue: umrahTotalRevenue,
        totalCost: umrahTotalCost,
        profitLoss: umrahTotalRevenue - umrahTotalCost,
        isProfit: umrahTotalRevenue - umrahTotalCost >= 0,
      },
      combined: {
        totalRevenue: hajjTotalRevenue + umrahTotalRevenue,
        totalCost: hajjTotalCost + umrahTotalCost,
        profitLoss: hajjTotalRevenue + umrahTotalRevenue - hajjTotalCost - umrahTotalCost,
        isProfit: hajjTotalRevenue + umrahTotalRevenue - hajjTotalCost - umrahTotalCost >= 0,
      },
    };

    // ========== MONEY EXCHANGE ==========
    const buyExchanges = exchanges.filter((e) => e.type === 'Buy');
    const sellExchanges = exchanges.filter((e) => e.type === 'Sell');
    const totalPurchaseCost = buyExchanges.reduce((sum, e) => sum + (Number(e.amount_bdt) || 0), 0);
    const totalSaleRevenue = sellExchanges.reduce((sum, e) => sum + (Number(e.amount_bdt) || 0), 0);

    // ========== LOANS ==========
    const receivingFinancial = {
      totalAmount: receivingLoans.reduce(
        (sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)),
        0
      ),
      paidAmount: receivingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
      totalDue: receivingLoans.reduce((sum, loan) => {
        const total = Number(loan.totalAmount || loan.amount || 0);
        const paid = Number(loan.paidAmount || 0);
        return sum + Math.max(0, total - paid);
      }, 0),
      taken: receivingLoans.reduce(
        (sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)),
        0
      ),
      repaid: receivingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
    };

    const givingFinancial = {
      totalAmount: givingLoans.reduce(
        (sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)),
        0
      ),
      paidAmount: givingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
      totalDue: givingLoans.reduce((sum, loan) => {
        const total = Number(loan.totalAmount || loan.amount || 0);
        const paid = Number(loan.paidAmount || 0);
        return sum + Math.max(0, total - paid);
      }, 0),
      disbursed: givingLoans.reduce(
        (sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)),
        0
      ),
      repaid: givingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
    };

    const loanTotals = {
      totalLoans: receivingLoans.length + givingLoans.length,
      active:
        [...receivingLoans, ...givingLoans].filter((l) => l.status === 'active').length,
      pending:
        [...receivingLoans, ...givingLoans].filter((l) => l.status === 'pending').length,
    };

    // ========== VENDORS ==========
    const vendorStats = {
      totalVendors: vendors.length,
      activeVendors: vendors.filter((v) => v.status === 'active').length,
      inactiveVendors: vendors.filter((v) => v.status === 'inactive').length,
    };

    const vendorBillsTotal = vendorBills.reduce(
      (sum, bill) => sum + (Number(bill.totalAmount) || Number(bill.amount) || 0),
      0
    );
    const vendorBillsPaid = vendorBills.reduce((sum, bill) => sum + (Number(bill.paidAmount) || 0), 0);
    const vendorBillsDue = Math.max(0, vendorBillsTotal - vendorBillsPaid);

    // ========== BANK ACCOUNTS ==========
    const totalBankBalance = bankAccounts.reduce(
      (sum, a) => sum + (Number(a.currentBalance) || Number(a.initialBalance) || 0),
      0
    );
    const cashAccount =
      bankAccounts.find(
        (a) =>
          (a.accountCategory || '').toLowerCase() === 'cash' ||
          (a.accountType || '').toLowerCase() === 'cash'
      ) || bankAccounts[0];

    // ========== CALCULATE GRAND TOTALS ==========
    const totalRevenue =
      huProfitLoss.combined.totalRevenue +
      totalSaleRevenue +
      receivingFinancial.taken +
      givingFinancial.repaid;

    const totalExpenses = totalPurchaseCost + givingFinancial.disbursed + vendorBillsPaid;

    const totalDue = receivingFinancial.totalDue + givingFinancial.totalDue + vendorBillsDue;

    const totalAssets = totalSaleRevenue - totalPurchaseCost + totalBankBalance; // Simplified

    const netProfit = totalRevenue - totalExpenses;

    // ========== OVERVIEW ==========
    const overview = {
      totalUsers: users.length,
      totalCustomers: huOverview.totalPilgrims,
      totalAgents: huOverview.totalAgents,
      totalVendors: vendorStats.totalVendors,
      totalBranches: branches.length,
    };

    // ========== RESPONSE ==========
    return NextResponse.json(
      {
        overview,
        grandTotals: {
          totalRevenue,
          totalExpenses,
          totalDue,
          totalAssets,
          netProfit,
        },
        hu: {
          overview: huOverview,
          profitLoss: huProfitLoss,
        },
        moneyExchange: {
          totalPurchaseCost,
          totalSaleRevenue,
          netAmount: totalSaleRevenue - totalPurchaseCost,
          buyCount: buyExchanges.length,
          sellCount: sellExchanges.length,
        },
        loans: {
          totals: loanTotals,
          receiving: { financial: receivingFinancial },
          giving: { financial: givingFinancial },
        },
        vendors: {
          statistics: vendorStats,
          bills: {
            totalBills: vendorBills.length,
            totalAmount: vendorBillsTotal,
            totalPaid: vendorBillsPaid,
            totalDue: vendorBillsDue,
          },
        },
        financial: {
          transactions: {
            totalCredit: receivingFinancial.taken + givingFinancial.repaid,
            totalDebit: givingFinancial.disbursed,
            netAmount: receivingFinancial.taken + givingFinancial.repaid - givingFinancial.disbursed,
            totalCount: loanTotals.totalLoans,
          },
          invoices: {
            totalInvoices: vendorBills.length,
            totalAmount: vendorBillsTotal,
            paidAmount: vendorBillsPaid,
            dueAmount: vendorBillsDue,
          },
          accounts: {
            totalAccounts: bankAccounts.length,
            totalBalance: totalBankBalance,
          },
          bankAccounts: {
            totalBankAccounts: bankAccounts.length,
            totalBalance: totalBankBalance,
          },
          loans: {
            totalLoans: loanTotals.totalLoans,
            totalAmount: receivingFinancial.totalAmount + givingFinancial.totalAmount,
            paidAmount: receivingFinancial.paidAmount + givingFinancial.paidAmount,
            dueAmount: receivingFinancial.totalDue + givingFinancial.totalDue,
          },
        },
        services: {
          exchanges: {
            buyAmount: totalPurchaseCost,
            sellAmount: totalSaleRevenue,
            netAmount: totalSaleRevenue - totalPurchaseCost,
            buyCount: buyExchanges.length,
            sellCount: sellExchanges.length,
          },
        },
        cashAccount: cashAccount
          ? {
              id: cashAccount._id?.toString(),
              currency: cashAccount.currency || 'BDT',
              currentBalance: cashAccount.currentBalance || cashAccount.initialBalance || 0,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', message: error.message },
      { status: 500 }
    );
  }
}
